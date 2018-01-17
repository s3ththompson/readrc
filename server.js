const bankai = require('bankai/http')
const path = require('path')
const express = require('express')

module.exports = server;

function server(readrc) {
  var compiler = bankai(path.join(__dirname, './viewer/index.js'), { quiet: true })
  var app = express();

  if (readrc) {
    app.get('/_local/readrc.json', (req, res) => {
      res.json(readrc)
    })
  }

  app.get('*', (req, res, next) => {
    compiler(req, res, next)
  });

  return app
}
