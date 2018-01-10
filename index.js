var Emitter = require('events').EventEmitter
var multistream = require('multistream')
var plumber = require('gulp-plumber');

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

Readrc.prototype._read = function () {
  var c = 0;
  var feed = this.feeds()
    .pipe(plumber((err) => {
      this.emit('error', err)
    }))
    .pipe(require('./lib/stream-crawl')(this.emit.bind(this)))
    .pipe(require('./lib/stream-scrape')(this.emit.bind(this)))
    // .pipe(require('./lib/stream-filter')(this._filters))
  feed.on('data', (data) => {
    c++
  })
  feed.on('end', () => {
    console.log('stream ended', c)
  })
}

Readrc.prototype.feeds = function () {
  return multistream.obj(this._feeds)
}

var rc = Readrc()
rc.add(require('./feeds/aeon'))
rc._read()
rc.on('error', (err) => {
  console.log(err)
})
