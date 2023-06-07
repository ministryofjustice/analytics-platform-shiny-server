#!/usr/bin/env node
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */


/*
 * Creates a process that is a running shiny app, and configures a
 * websocket proxy. This proxy enables client websocket connections
 * to by forwarded to the previously created shiny server.
 *
 * Once up and running, the shiny server (which is a child process)
 * provides a websocket interface, where each websocket connection
 * is considered a new session. This means that although there is
 * only a single shiny process, it is able to handle more than one
 * user.
 *
 * This server, by default listens on 0.0.0.0:9999, whilst the
 * shinyServer listens, by default, on 127.0.0.1:7999. The
 * expectation is that port 9999 is only accessible to the shiny
 * server and not to external users.
 */


// Monkeypatch sockJs to allow custom headers
// eslint-disable-next-line no-unused-vars,import/order
const { Session } = require('./patchSession');

const http = require('http');
// const sockjs = require('sockjs');
const nodeStatic = require('@brettz9/node-static');
const httpProxy = require('http-proxy');
const WebSocket = require('ws');
const debug = require('debug')('app');
const { spawn } = require('child_process');
const path = require('path');
const { log } = require('winston');
require('./logging');

/*
 * Creates a sockjs websocket proxy, telling it that we want
 * to proxy websocket requests that come in on the __sockjs__
 * path to the process running locally on 127.0.0.1:7999 -
 * which is our shiny server.
 */
// const sockjsOpts = {
//   prefix: '.*/__sockjs__(/[no]=\\w+)?',
//   log,
// };

const proxy = httpProxy.createServer({
  target: `http://127.0.0.1:${process.env.TARGET_PORT || 7999}`,
  ws: true,
});

// const sockjsEcho = sockjs.createServer(sockjsOpts);

const messageQueue = [];

/*
 * When we receive a new connection, we will create a websocket to
 * talk to Shiny. This web socket ensures that errors aside, data is
 * sent when it is possible to send it, and enqueued otherwise.
 */
// sockjsEcho.on('connection', (conn) => {
//   const ws = new WebSocket(
//     'ws://127.0.0.1:7999/websocket',
//     null,
//     { headers: conn.headers },
//   );

//   ws.on('error', (err) => {
//     log('error', err);
//     conn.close();
//   });

//   log('debug', 'new connection');
//   ws.on('open', (_wsConn, _req) => {
//     log('info', 'connected to shiny', { service: 'target->proxy' });
//     ws.on('close', () => conn.close());
//     ws.on('message', (message) => {
//       log('debug', `${message}`, { service: 'target->proxy' });
//       conn.write(message);
//     });
//     while (messageQueue.length) {
//       ws.send(messageQueue.shift());
//     }
//   });

//   conn.on('data', (message) => {
//     log('debug', `${message}`, { service: 'proxy->target' });
//     try {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(message);
//       } else {
//         messageQueue.push(message);
//       }
//     } catch (e) {
//       log('debug', `bad message ${e}`);
//     }
//   });
// });


/*
 * Requests for resources that are not websocket requests are instead
 * served from the `static` folder.
 */
const staticDirectory = new nodeStatic.Server(path.join(__dirname, './static'));

const server = http.createServer();
// sockjsEcho.installHandlers(server);
// server.addListener('request', (req, res) => {
//   if (!req.url.startsWith('/__sockjs__')) {
//     staticDirectory.serve(req, res, (err, _result) => {
//       if (err) {
//         proxy.web(req, res);
//       }
//     });
//   } else {
//     log('debug', `not handled by proxy or static: ${req.url}`);
//   }
//   return true;
// });

server.addListener('request', (req, res) => {
  staticDirectory.serve(req, res, (err, _result) => {
    if (err) {
      proxy.web(req, res);
    }
  });
  return true;
});


/*
 * Handles an incorrect URL or error when performing the HTTP upgrade
 * to a websocket.
 */
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


/*
 * Spawns a specific R process to run the shiny application.
 * Currently this process will only ever call `runServer.R`
 * in the R folder, meaning that Golem (which is launched
 * differently) cannot currently be used.
 *
 * stdout/stderr and handled to wrap any output in JSON
 * although no attention is paid as to whether the data
 * being written is already JSON or not. This pushes the
 * problem for logging further into our stack.
 *
 * TODO: If this did some level of discovery it might be
 * possible to locate the golem required files and just
 * handle them like normal shiny apps.
 */
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

/*
 * Configures the HTTP server to listen on the configured port
 * and accept connections on any interface.
 */
server.listen(process.env.PORT || 9999, '0.0.0.0');

/*
 * Handles the interupt signal to shutdown the http server and
 * KILL the shiny process.
 */
process.on('SIGINT', () => {
  log('info', 'SIGINT signal received.');
  server.close(() => log('debug', 'Stopping proxy'));
  shiny.kill('SIGINT');
});
