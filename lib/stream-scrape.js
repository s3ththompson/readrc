var through2 = require('through2')
var requireDir = require('require-directory')
var Scrapers = Object.values(requireDir(module, './scrapers'))
var DefaultScraper = require('./scraper')
var debug = require('debug')('scraper')

module.exports = () => {
  return through2.obj((post, _, cb) => {
    debug(`scraping ${post.permalink}`)
    post = scrape(post)
    debug(`scraped ${post.permalink}`)
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
