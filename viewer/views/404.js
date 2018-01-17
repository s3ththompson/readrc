const html = require('choo/html')

module.exports = function notfound (state, emit) {
  return html`<body class="sans-serif black-70">
    <header class="pa3 pa5-ns">
      <h2 class="f5 normal light-red b--light-red fw-100">404</h2>
    </header>
  </body>`
}