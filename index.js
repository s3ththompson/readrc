var Emitter = require('events').EventEmitter
var multistream = require('multistream')
var pump = require('pump');
var concat = require('concat-stream')
var opn = require('opn')
var server = require('./server')

module.exports = Readrc

function Readrc () {
  if (!(this instanceof Readrc)) return new Readrc()
  this._feeds = []
  this._filters = []
  Emitter.call(this)
}
Readrc.prototype = Object.create(Emitter.prototype)
Readrc.prototype.constructor = Readrc

Readrc.prototype.add = function (feed) {
  this._feeds.push(feed)
}

Readrc.prototype.filter = function (filter) {

}

Readrc.prototype.read = function (cb) {
  pump([
    this.feeds(),
    require('./lib/stream-crawl')(this.emit.bind(this)),
    require('./lib/stream-scrape')(this.emit.bind(this)),
    concat((posts) => {
      var readrc = {
        date: new Date(),
        version: '0.1.0',
        posts: posts
      }
      cb(null, readrc)
    })
  ], (err) => {
    if (err) return cb(err)
  })
}
    // .pipe(require('./lib/stream-filter')(this._filters))

Readrc.prototype.feeds = function () {
  return multistream.obj(this._feeds)
}

var rc = Readrc()
rc.add(require('./feeds/aeon'))
rc.read((err, readrc) => {
  if (err) console.error(err)
  var s = server(readrc);
  s.listen(6464, function () {
    console.log('Readrc available at localhost:6464/read')
    opn('http://localhost:6464/read')
  })
  s.on('error', (err) => {
    rc.emit('error', err)
  })
})
rc.on('error', (err) => {
  console.error(err)
})
