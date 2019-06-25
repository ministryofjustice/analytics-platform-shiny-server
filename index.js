#!/usr/bin/env node
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */

const http = require('http');
const sockjs = require('sockjs');
const nodeStatic = require('node-static');
const httpProxy = require('http-proxy');
const WebSocket = require('ws');
const debug = require('debug')('app');
const { spawn } = require('child_process');
const path = require('path');
const { log } = require('winston');
require('./logging');

// 1. Echo sockjs server
const sockjsOpts = {
  prefix: '.*/__sockjs__(/[no]=\\w+)?',
  log: (x, ...rest) => debug(`[${x}]`, ...rest),

};

const proxy = httpProxy.createServer({
  target: `http://127.0.0.1:${process.env.TARGET_PORT || 7999}`,
  ws: true,
});

const sockjsEcho = sockjs.createServer(sockjsOpts);

const messageQueue = [];
sockjsEcho.on('connection', (conn) => {
  const ws = new WebSocket('ws://127.0.0.1:7999/websocket');
  ws.on('error', (err) => {
    log('error', err);
    conn.close();
  });
  log('debug', 'new conn');
  ws.on('open', (_wsConn, _req) => {
    log('info', 'connected to shiny', { service: 'target->proxy' });
    ws.on('close', () => conn.close());
    ws.on('message', (message) => {
      log('debug', `${message}`, { service: 'target->proxy' });
      conn.write(message);
    });
    while (messageQueue.length) {
      ws.send(messageQueue.shift());
    }
  });
  conn.on('data', (message) => {
    log('debug', `${message}`, { service: 'proxy->target' });
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      } else {
        messageQueue.push(message);
      }
    } catch (e) {
      log('debug', `bad message ${e}`);
    }
  });
});


// 2. Static files server
const staticDirectory = new nodeStatic.Server(path.join(__dirname, './static'));

const server = http.createServer();
sockjsEcho.installHandlers(server);
server.addListener('request', (req, res) => {
  if (!req.url.startsWith('/__sockjs__')) {
    staticDirectory.serve(req, res, (err, _result) => {
      if (err) {
        proxy.web(req, res);
      }
    });
  } else {
    log('error', `not handled by proxy or static: ${req.url}`);
  }
  return true;
});

server.on('upgrade', (wsreq, socket, head) => {
  socket.on('error', (err) => {
    log('error', err);
  });
  if (!wsreq.url.startsWith('/__sockjs__')) {
    proxy.ws(wsreq, socket, head, (err) => {
      log('error', `Socket disconnected: ${err}`);
      socket.destroy();
    });
  }
  return true;
});

server.on('error', (err) => {
  log('error', err);
});
proxy.on('error', (err) => {
  log('error', err);
});

log('info', '> [*] Listening on 0.0.0.0:9999');

const shiny = spawn(
  'Rscript',
  [path.join(__dirname, './R/runServer.R')],
  {
    shell: '/bin/bash',
    env: { DIRNAME: __dirname, ...process.env },
  },
);
shiny.stdout.on('data', (data) => {
  log('info', `${data}`, { service: 'shiny.stdout' });
});
shiny.stderr.on('data', (data) => {
  log('info', `${data}`, { service: 'shiny.stderr' });
});
server.listen(process.env.PORT || 9999, '0.0.0.0');

process.on('SIGINT', () => {
  log('info', 'SIGINT signal received.');
  server.close(() => log('debug', 'Stopping proxy'));
  shiny.kill('SIGINT');
});
