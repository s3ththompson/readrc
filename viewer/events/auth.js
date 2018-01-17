var firebase = require('firebase/app');
require('firebase/auth');
const idb = require('idb-keyval');

module.exports = function auth() {
  return (state, emitter) => {
    state.user = null;
    emitter.on('auth:login', login)
    emitter.on('auth:toggle', toggle)

    firebase.auth().onAuthStateChanged((user) => {
      emitter.emit('auth:toggle', user)
    })

    function login(cb) {
      cb = cb || (() => {});
      if (state.user) {
        cb();
        return
      };
      var provider = new firebase.auth.GithubAuthProvider();
      provider.addScope('gist');
      firebase.auth().signInWithPopup(provider).then((result) => {
        var token = result.credential.accessToken;
        state.token = token;
        var user = result.user;
        state.user = {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL
        }
        idb.set('token', token).then(() => {
          cb();
        })
        .catch((err) => {
          cb(err);
        })
      })
      .catch((err) => {
        cb(err);
      });
    }

    function toggle(user) {
      idb.get('token').then(token => {
        if (user && state.user) {
          if (user.email !== state.user.email) {
            state.user = null;
          }
        } else if (user && (token || state.token)) {
          state.user = {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL
          };
          state.token = state.token || token;
        } else {
          state.user = null;
        }
        emitter.emit('render');
      });
    }
  }
}
