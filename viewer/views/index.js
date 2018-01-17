const html = require('choo/html')

module.exports = function index (state, emit) {

  return html`
    <body class="sans-serif black-70">
      <header class="pa3 pa5-ns">
        <h2 class="f5 normal light-red b--light-red fw-100">
          <span class="black-20">https://</span>readrc.club 🗂
        </h2>
      </header>
    </body>
  `
}