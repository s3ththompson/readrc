var request = require('request')
var Cache = require('async-disk-cache')
var cache = new Cache('req-cache')

module.exports = {
  get: (url, cb) => {
    cache.has(url)
      .then((hit) => {
        if (hit) {
          cache.get(url)
            .then((entry) => {
              cb(null, entry.value)
            }, cb)
        } else {
          getAndTranslate(url, (err, html) => {
            if (err) return cb(err)
            cache.set(url, html)
              .then(() => {
                cb(null, html)
              }, cb)
          })
        }
      }, cb)
  }
}

function getAndTranslate(url, cb) {
  request.get({
    url: url,
    headers: {
      'user-agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36`,
      'accept': 'text/html,application/xhtml+xml'
    },
    timeout: 10000,
    pool: false
  }, (err, resp) => {
    // Some feeds do not respond without user-agent and accept headers.
    if (resp.statusCode != 200) return cb(new Error('Bad status code'));
    var encoding = resp.headers['content-encoding'] || 'identity'
    var charset = getParams(resp.headers['content-type'] || '').charset;
    resp = maybeDecompress(resp, encoding);
    resp = maybeTranslate(resp, charset);
    var html = resp.body.toString('utf8')
    cb(null, html)
  })
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
