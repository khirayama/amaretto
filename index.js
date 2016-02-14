'use strict';

const Proxy = require('./proxy');
const lodash = require('lodash');

class RequestStore {
  constructor(onRequestClbk, onResponseClbk) {
    this.entries = [];
    this.proxy = new Proxy({
      request: this.onRequest.bind(this),
      response: this.onResponse.bind(this)
    });
    this.onRequestClbk = onRequestClbk;
    this.onResponseClbk = onResponseClbk;
  }

  getRequests() {
    return this.entries;
  }

  getRequest(id) {
    return this.entries[id];
  }

  onRequest(requestId, request, requestBody) {
    let entry = {
      request: request,
      requestBody: requestBody
    };
    this.entries[requestId] = entry;
    this.onRequestClbk(requestId);
  }

  onResponse(requestId, request, response, responseBody) {
    this.entries[requestId].response = response;
    this.entries[requestId].responseBody = responseBody;
    this.onResponseClbk(requestId);
  }
}

class RequestTable {
  constructor(onRowClick) {
    this.el = document.getElementById('request-table-tbody');
    this.onRowClick = onRowClick;
  }

  render(entries) {
    this.el.innerHTML = '';
    entries.forEach(this.appendEntry.bind(this));
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

    this.el.appendChild(row);
    row.addEventListener('click', (e) => {
      let requestId = parseInt(e.currentTarget.getAttribute('data-request-id'));
      this.onRowClick(requestId);
    });
  }
}

class RequestDetailPanel {
  constructor() {
    this.el = document.getElementById('request-detail-panel');
  }

  render(entry) {
    let request = entry.request;
    let response = entry.response;
    let requestHeaders = '';
    let responseHeaders = '';

    requestHeaders = lodash.map(request.headers, (value, header) => {
      return `<tr><td>${header}</td><td>${value}</td></tr>`;
    }).join('');

    if (response) {
      responseHeaders = lodash.map(response.headers, (value, header) => {
        return `<tr><td>${header}</td><td>${value}</td></tr>`;
      }).join('');
    }

    this.el.innerHTML = `
      <div>
        <h2>General</h2>
        <table class="table">
          <tbody>
            <tr><td>Request URL</td><td>${request.url}</td></tr>
            <tr><td>Request Method</td><td>${request.method}</td></tr>
            <tr><td>Status Code</td><td>${response ? response.statusCode : 'pending'}</td></tr>
          </tbody>
        </table>
      </div>
      <hr>
      <div>
        <h2>Request Headers</h2>
        <table class="table">
          <tbody>${requestHeaders}</tbody>
        </table>
      </div>
      <hr>
      <div>
        <h2>Request Body</h2>
        <div>${entry.requestBody}</div>
      </div>
      <hr>
      <div>
        <h2>Response Headers</h2>
        <table class="table">
          <tbody>${responseHeaders}</tbody>
        </table>
      </div>
      <hr>
      <div>
        <h2>Response Body</h2>
        <div>${entry.responseBody}</div>
      </div>
    `;
  }
}

class App {
  constructor() {
    this.requestDetailPanel = new RequestDetailPanel();
    this.requestTable = new RequestTable(this.onRequestRowClick.bind(this));
    this.requestStore = new RequestStore(this.onRequest.bind(this), this.onResponse.bind(this));
  }

  onRequestRowClick(requestId) {
    let request = this.requestStore.getRequest(requestId)
    this.requestDetailPanel.render(request);
  }

  onRequest(requestId) {
    let request = this.requestStore.getRequest(requestId);
    this.requestTable.appendEntry(request, requestId);
  }

  onResponse() {
    this.requestTable.render(this.requestStore.getRequests());
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
});
