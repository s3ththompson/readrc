const cheerio = require('cheerio')
const extractor = require('unfluff/lib/extractor')
const cleaner = require('unfluff/lib/cleaner')
const URL = require('url').URL
const assert = require('assert')

module.exports = Scraper

function Scraper(opts) {
  if (!(this instanceof Scraper)) return new Scraper(opts)
  // TODO: check that child classes have implemented recognize
  assert.ok(opts.permalink, 'Scraper: Scraper constructor must be passed opts.permalink')
  assert.ok(opts.via, 'Scraper: Scraper constructor must be passed opts.via')
  this._permalink = opts.permalink
  this.via = opts.via
}

Scraper.recognize = function (url) {
  return true
}

Scraper.prototype.scrape = function(html) {
  var $ = cheerio.load(html);
  return {
    title: this.title($),
    permalink: this.permalink($),
    via: this.via,
    origin: this.origin($),
    date: this.date($),
    authors: this.authors($),
    images: this.images($),
    summary: this.summary($),
    language: this.language($),
    tags: this.tags($),
    media: this.media($),
    content: this.content($)
  }
}

Scraper.prototype.title = function($) {
  return extractor.title($)
}

Scraper.prototype.permalink = function($) {
  return this._permalink
}

Scraper.prototype.origin = function($) {
  var u = new URL(this._permalink)
  return u.hostname
}

Scraper.prototype.date = function($) {
  return new Date(extractor.date($))
}

Scraper.prototype.authors = function($) {
  return extractor.author($)
}

Scraper.prototype.images = function($) {
  return [extractor.image($)]
}

Scraper.prototype.summary = function($) {
  return extractor.description($)
}

Scraper.prototype.language = function($) {
  if (this._language) return this._language
  this._language = extractor.lang($)
  return this._language
}

Scraper.prototype.tags = function($) {
  return extractor.tags($)
}

Scraper.prototype.media = function($) {
  return extractor.videos(this._clean($), this._topNode($))
}

Scraper.prototype.content = function($) {
  return extractor.text(this._clean($), this._topNode($), this.language($))
}

Scraper.prototype._topNode = function($) {
  if (this.__topNode) return this.__topNode
  $ = this._clean($)
  this.__topNode = extractor.calculateBestNode($, this.language($))
  return this.__topNode
}

Scraper.prototype._clean = function($) {
  if (this.__clean) return this.__clean
  this.__clean = cleaner($)
  return this.__clean
}
