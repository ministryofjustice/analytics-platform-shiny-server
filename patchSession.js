const { Session } = require('sockjs/lib/transport');

Session.prototype.decorateConnection = function (req) {
  let address;
  let headers;
  let i;
  let key;
  let len;
  let ref;
  let remoteAddress;
  let remotePort;
  let socket;
  let x;
  if (!(socket = this.recv.connection)) {
    socket = this.recv.response.connection;
  }
  try {
    const { remotePort: remotePort1, remoteAddress: remoteAddress1, address: address1 } = socket;
    remoteAddress = remoteAddress1;
    remotePort = remotePort1;
    address = address1();
  } catch (error) {
    x = error;
  }
  if (remoteAddress) {
    this.connection.remoteAddress = remoteAddress;
    this.connection.remotePort = remotePort;
    this.connection.address = address;
  }
  this.connection.url = req.url;
  this.connection.pathname = req.pathname;
  this.connection.protocol = this.recv.protocol;
  headers = {};
  ref = [
    'referer',
    'x-client-ip',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-port',
    'x-cluster-client-ip',
    'via',
    'x-real-ip',
    'x-forwarded-proto',
    'x-ssl',
    'dnt',
    'host',
    'user-agent',
    'accept-language',
    'user_email',
    'cookie',
  ];
  for (i = 0, len = ref.length; i < len; i++) {
    key = ref[i];
    if (req.headers[key]) {
      headers[key] = req.headers[key];
    }
  }
  if (headers) {
    return (this.connection.headers = headers);
  }
};
