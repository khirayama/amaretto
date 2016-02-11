'use strict';

const http = require('http');
const net = require('net');
const url = require('url');

module.exports = class Proxy {
  constructor(callbacks, hostname, port) {
    this.callbacks = callbacks;
    this.hostname = hostname || '127.0.0.1';
    this.port = port || 8888;

    this.setupServer();
  }

  setupServer() {
    this.server = http.createServer((cReq, cRes) => {
      this.callbacks['request'](cReq);
      console.log(cReq.method, cReq.url);
      console.log('---------');

      let urlObj = url.parse(cReq.url);
      let options = {
        host: urlObj.hostname,
        port: urlObj.port || 80,
        path: urlObj.path,
        headers: cReq.headers,
        method: cReq.method
      };

      let pReq = http.request(options, (pRes) => {
        this.callbacks['response'](cReq, pRes);
        console.log(pRes.statusCode, cReq.url)
        console.log('---------');

        cRes.writeHead(pRes.statusCode, pRes.headers);
        pRes.pipe(cRes);
      });

      cReq.pipe(pReq);
    }).listen(this.port, this.hostname);

    this.server.on('connect', (req, ctlSocket, head) => {
      console.log('Connect', req.url);
      console.log('---------');
      let urlObj = url.parse(`https://${req.url}`);
      let socket = net.connect(urlObj.port, urlObj.hostname, () => {
        ctlSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        socket.write(head);
        socket.pipe(ctlSocket);
        ctlSocket.pipe(socket);
      });
    });
  }
}
