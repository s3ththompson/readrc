var crawler = require('./crawler')
var transform = require('parallel-transform');
var debug = require('debug')('readrc:crawler')

module.exports = (emit) => {
  return transform(5, (post, cb) => {
    debug('crawling %s', post.permalink)
    crawler.get(post.permalink, (err, html) => {
      if (err) {
        emit('error', err)
        return cb()
      }
      post.html = html
      debug('got %s', post.permalink)
      cb(null, post)
    })
  })
}
