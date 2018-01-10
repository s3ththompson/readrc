const URL = require('url').URL;
const Scraper = require('../scraper')

module.exports = Aeon

function Aeon () {
  if (!(this instanceof Aeon)) return new Aeon()
  Scraper.call(this)
}

Aeon.prototype = Object.create(Scraper.prototype)
Aeon.prototype.constructor = Aeon

Aeon.recognize = function (url) {
  var u = new URL(url);
  return (u.hostname == "aeon.co");
}

Aeon.prototype.title = function($) {
  var title = $('meta[property="og:title"]').attr('content');
  var pieces = title.split(' | ');
  if (pieces.length > 1) pieces.pop();
  title = pieces.join(' | ');
  pieces = title.split(' – ');
  if (pieces.length > 1) pieces.pop();
  title = pieces.join(' – ');
  return title
}

Aeon.prototype.authors = function($) {
  return [$('.article__body__author-name a').first().text()]
}

Aeon.prototype.tags = function($) {
  return $('.follow-topics-banner__topic a').map((i, el) => {return $(el).text()}).get()
}
