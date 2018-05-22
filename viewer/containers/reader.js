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
  this.post = null
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
  var click = (idx) => () => {
    this.post = idx + 1
    this.emit('render')
  }

  var back = () => {
    this.post = null
    this.emit('render')
  }

  if (!this.post) {
    var posts = readrc.posts.map((post, idx) => {
      return html`<li><h2 class="pointer" onclick=${click(idx)}>${post.title}</h2></li>`
    })
    return html`<div><ul>${posts}</ul></div>`
  }
  else {
    var post = readrc.posts[this.post - 1]
    return html`<div class="pa2">
        <span class="pointer white bg-black mv1 pa2 dim dib" onclick=${back}>Back</span>
        <h1>${post.title}</h1>
        <p class="serif lh-copy mw7">${post.content}</p>
      </div>`
  }
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

Reader.prototype.update = function (gist, token, post) {
  return !(this.identity === Reader.identity(gist) && this.post === post)
}
