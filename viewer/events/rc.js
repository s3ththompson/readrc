const github = require('../lib/github')
const qs = require('query-string')
const idb = require('idb-keyval');

module.exports = function rc () {
  return (state, emitter) => {

    emitter.on('readrc:publish', publish)

    function publish() {
      if (!state.token) {
        emitter.emit('auth:login', (err) => {
          if (err) {
            emitter.emit('error', err);
            return
          }
          publish()
        })
        return
      }
      github.upload(state.readrc.value, state.token, (err, id) => {
        if (err) {
          emitter.emit('error', err);
          return
        }
        console.log(id)
        location.href = `https://readrc.club/read?gist=${id}`
      })
    }
  }
}
