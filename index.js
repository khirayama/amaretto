'use strict';

const Proxy = require('./proxy');

new Proxy({
  request: (req) => {
    let ulEl = document.getElementById('request-list');
    let liEl = document.createElement('li');
    liEl.innerHTML = `${req.method} ${req.url}`;
    ulEl.appendChild(liEl);
  },
  response: (req, res) => {
    let ulEl = document.getElementById('response-list');
    let liEl = document.createElement('li');
    liEl.innerHTML = `${res.statusCode} ${req.method} ${req.url}`
    ulEl.appendChild(liEl);
  }
});
