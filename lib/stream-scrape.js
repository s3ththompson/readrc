var transform = require('parallel-transform');
var requireDir = require('require-directory')
var Scrapers = Object.values(requireDir(module, './scrapers'))
var DefaultScraper = require('./scraper')
var debug = require('debug')('readrc:scraper')

module.exports = (emit) => {
  return transform(10, (post, cb) => {
    debug('scraping %s', post.permalink)
    post = scrape(post)
    debug('scraped %s', post.permalink)
    cb(null, post)
  })
}

function scrape (post) {
  var Match = null
  for (var Scraper of Scrapers) {
    if (Scraper.recognize(post.permalink)) Match = Scraper
  }
  if (!Match) Match = DefaultScraper
  var scraper = new Match({
    permalink: post.permalink,
    via: post.via
  })
  return scraper.scrape(post.html)
}
