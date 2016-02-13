'use strict';

const Proxy = require('./proxy');

class App {
  constructor() {
    this.entries = [];
    this.proxy = new Proxy({
      request: this.onRequest.bind(this),
      response: this.onResponse.bind(this)
    });
    this.tbodyEl = document.getElementById('request-table-tbody');
  }

  onRequest(requestId, request) {
    let entry = {
      request: request
    };
    this.entries[requestId] = entry;

    this.appendEntry(entry, requestId);
  }

  onResponse(requestId, request, response) {
    this.entries[requestId].response = response;
    this.render();
  }

  render() {
    this.tbodyEl.innerHTML = '';
    this.entries.forEach(this.appendEntry.bind(this));
  }

  appendEntry(entry, id) {
    let row = document.createElement('tr');
    row.setAttribute('data-request-id', id);
    row.className = 'request';

    let statusCode = 'pending';
    if (entry.response) {
      statusCode = entry.response.statusCode;
    }

    row.innerHTML = `
      <td>${id}</td>
      <td>${statusCode}</td>
      <td>${entry.request.method}</td>
      <td>${entry.request.url}</td>
    `;

    this.tbodyEl.appendChild(row);
  }
}

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {
  let app = new App();
  app.render();
});
