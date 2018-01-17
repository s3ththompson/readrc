const bel = require('bel');
const article = require('./article');

module.exports = function(readrc) {
  return bel`${readrc.posts.map((post) => {
        return article(post)
      })}`
}