var Feed = require('../lib/feed')

module.exports = () => {
  return new Feed({
    name: 'Aeon Magazine',
    url: 'https://aeon.co/feed.rss'
  })
}
