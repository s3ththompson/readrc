var bel = require('bel')
var distanceInWordsToNow = require('date-fns/distance_in_words_to_now')

module.exports = function(post) {
  return bel`<article class="pa3 pa5-ns">
    <h2 class="f4 bb bw1 pb2 mb4 light-red b--light-red">${post.title}</h2>

    <img src="${post.images[0]}" class="w-100 f5 pb3 measure">
    ${post.content.split("\n\n").map((paragraph) => {
      return bel`<p class="measure lh-copy">${paragraph}</p>`
    })}
  </article>`
}
