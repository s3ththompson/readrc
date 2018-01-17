const html = require('choo/html')
const article = require('../../layout/default/article')
const qs = require('query-string')
const Reader = require('../containers/reader')

var reader = Reader()

var route = null;

module.exports = function read (state, emit) {
  var query = qs.parse(window.location.search);
  var gist = query.gist

  return html`
    <body class="sans-serif black-70">
      ${reader.render(gist, state.token)}
      ${(!gist) ? html`<div class="fixed bottom-0 right-0 pb2 pr2"><a href="#" onclick=${onclick} class="f6 link dim br2 ph2 pv1 dib white bg-light-red">⬆</a></div>` : ''}
    </body>
  `

  function onclick() {
    emit('readrc:publish')
  }
}

