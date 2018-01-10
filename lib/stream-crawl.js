var crawler = require('./crawler')
var transform = require('parallel-transform');
var debug = require('debug')('crawler')

module.exports = (emit) => {
  return transform(5, (post, cb) => {
    debug(`crawling ${post.permalink}`)
    crawler.get(post.permalink, (err, html) => {
      if (err) {
        emit('error', err)
        return cb()
      }
      post.html = html
      debug(`got ${post.permalink}`)
      cb(null, post)
    })
  })
}
