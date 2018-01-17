const choo = require('choo')
const css = require('sheetify')
const auth = require('./events/auth')
const rc = require('./events/rc')
const index = require('./views/index')
const read = require('./views/read')
const notfound = require('./views/404')
const html = require('choo/html')
const firebase = require('firebase/app')

css('tachyons');

firebase.initializeApp({
  apiKey: "AIzaSyCXG7iLoOys_tZqXyFu7G1U0CJfmdSU3L0",
  authDomain: "readrc-39344.firebaseapp.com",
  databaseURL: "https://readrc-39344.firebaseio.com",
});

var app = choo();
app.use(auth())
app.use(rc())
app.use((state, emitter) => {
  state.localhost = (location.hostname === "localhost" || location.hostname === "127.0.0.1");
})
app.route('/', index)
app.route('/read', read)
app.route('/404', notfound)
app.mount('body')
