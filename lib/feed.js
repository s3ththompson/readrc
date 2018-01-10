const request = require('request');
const FeedParser = require('feedparser');
const iconv = require('iconv-lite');
const zlib = require('zlib');
const Readable = require('readable-stream').Readable;
const assert = require('assert')
const debug = require('debug')('readrc:feed')

module.exports = Feed

function Feed (opts) {
  if (!(this instanceof Feed)) return new Feed()
  assert.equal(typeof opts.name, 'string', 'Feed: feed constructor must be initialized with opts.name')
  assert.equal(typeof opts.url, 'string', 'Feed: feed constructor must be initialized with opts.url')
  this.name = opts.name
  this.url = opts.url
  Readable.call(this, { objectMode: true })

  this._forwarding = false

  var req = request(this.url, {timeout: 10000, pool: false})
  req.setMaxListeners(50)
  // Some feeds do not respond without user-agent and accept headers.
  req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
  req.setHeader('accept', 'text/html,application/xhtml+xml')
  req.on('error', (err) => {
      this.emit('error', err)
    })
  debug('starting fetch')
  req.on('response', (resp) => {
    if (resp.statusCode != 200) return this.emit('error', new Error('Bad status code'));
    var encoding = resp.headers['content-encoding'] || 'identity'
    var charset = getParams(resp.headers['content-type'] || '').charset;
    resp = maybeDecompress(resp, encoding);
    resp = maybeTranslate(resp, charset);
    debug('finished fetch')
    resp.pipe(this.feedparser);
  })

  this.feedparser = new FeedParser()
  // attach error handler
  this.feedparser.on('readable', () => {
    this._forward()
  })

  this.feedparser.on('end', () => {
    this.push(null)
  })
}

Feed.prototype = Object.create(Readable.prototype)
Feed.prototype.constructor = Readable

Feed.prototype._read = function () {
  this._forward()
}

Feed.prototype._forward = function () {
  if (this._forwarding) return
  this._forwarding = true
  var entry
  while ((entry = this.feedparser.read()) !== null) {
    debug('found feed entry %s', entry.link)
    this.push({
      title: entry.title,
      permalink: encodeURI(entry.link),
      date: entry.date,
      via: this.name
    })
  }
  this._forwarding = false
}

function maybeDecompress (res, encoding) {
  var decompress;
  if (encoding.match(/\bdeflate\b/)) {
    decompress = zlib.createInflate();
  } else if (encoding.match(/\bgzip\b/)) {
    decompress = zlib.createGunzip();
  }
  return decompress ? res.pipe(decompress) : res;
}

function maybeTranslate (res, charset) {
  if (charset && !/utf-*8/i.test(charset)) {
      converterStream = iconv.decodeStream(charset);
      console.log('Converting from charset %s to utf-8', charset);
      converterStream.on('error', done);
      // If we're using iconv, stream will be the output of iconv
      // otherwise it will remain the output of request
      res = res.pipe(converterStream);
  }
  return res;
}

function getParams(str) {
  var params = str.split(';').reduce(function (params, param) {
    var parts = param.split('=').map(function (part) { return part.trim(); });
    if (parts.length === 2) {
      params[parts[0]] = parts[1];
    }
    return params;
  }, {});
  return params;
}
