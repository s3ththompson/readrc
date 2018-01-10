var multistream = require('multistream')

module.exports = Readrc

function Readrc () {
  if (!(this instanceof Readrc)) return new Readrc
  this._feeds = []
  this._filters = []
}

Readrc.prototype.add = function (feed) {
  this._feeds.push(feed)
}

Readrc.prototype.filter = function (filter) {

}

Readrc.prototype._read = function () {
  var count = 0;
  var feed = this.feeds()
    .pipe(require('./lib/stream-crawl')())
    .pipe(require('./lib/stream-scrape')())
    // .pipe(require('./lib/stream-filter')(this._filters))
    .resume()
}

Readrc.prototype.feeds = function () {
  return multistream.obj(this._feeds)
}

var rc = Readrc()
rc.add(require('./feeds/aeon'))
rc._read()
