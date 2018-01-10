var crawler = require('./crawler')
var through2 = require('through2')
var debug = require('debug')('crawler')

module.exports = () => {
  return through2.obj((post, _, cb) => {
    debug(`crawling ${post.permalink}`)
    crawler.get(post.permalink, (err, resp) => {
      if (err) return cb(err)
      debug(`got ${post.permalink}`)
      post.permalink = resp.request.uri.href
      post.html = resp.body.toString('utf8')
      cb(null, post)
    })
  })
}
