var Nanofetcher = require('nanofetcher')
var html = require('bel')
var startOfHour = require('date-fns/start_of_hour')
var github = require('../lib/github')
var req = require('request')

module.exports = Reader

function Reader () {
  if (!(this instanceof Reader)) return new Reader()
  Nanofetcher.call(this)
  this.gist = null
  this.identity = null
}
Reader.prototype = Object.create(Nanofetcher.prototype)
Reader.prototype.constructor = Reader

Reader.identity = function (gist, token) {
  return gist ? gist : String(startOfHour(new Date()))
}

Reader.prototype.init = function (gist, token) {
  this.gist = gist ? gist : null
  this.token = token
  this.identity = Reader.identity(gist)
}

Reader.prototype.placeholder = function () {
  return html`<div>Loading...</div>`
}

Reader.prototype.hydrate = function (readrc) {
  return html`<div>
    <h1>${readrc.posts[0].title}</h1>
    <div>${readrc.posts[0].content}</div>
  </div>`
}

Reader.prototype.fetch = function (cb) {
  if (this.gist) {
    github.get(this.gist, this.token, cb)
  } else {
    req('/_local/readrc.json', { json: true }, (err, resp, data) => {
      if (err) return cb(err)
      if (resp.statusCode !== 200) return cb(new Error(`${resp.statusCode}: ${body.message}`))

      cb(null, data)
    })
  }
}

Reader.prototype.update = function (gist) {
  return this.identity == Reader.identity(gist)
}
