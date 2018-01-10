var multistream = require('multistream')
var through2 = require('through2')
// readrc should inherit from readable

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
    // .pipe(require('./lib/stream-crawl')(this._crawler))
    // .pipe(require('./lib/stream-scrape')())
    // .pipe(require('./lib/stream-filter')(this._filters))

  feed.on('data', (data) => {
    count++;
  })
  feed.on('end', () => {
    console.log(count)
  })
    // .pipe(crawl(crawler))
    // .pipe(scrape)
    // .pipe(filter)

}

Readrc.prototype.feeds = function () {
  return multistream.obj(this._feeds)
}

var rc = Readrc()
rc.add(require('./feeds/aeon'))
rc._read()


// fetch feeds
// crawl with crawlers
// scrape with scrapers
// filter with filters
