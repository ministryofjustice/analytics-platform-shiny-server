"use strict";

function reconnectWithbackoff(maxAttempts, waitFor) {
  var CONNECTING = 0;
  var OPEN = 1;

  if (Shiny.shinyapp.$socket === null || ![OPEN, CONNECTING].includes(Shiny.shinyapp.$socket.readyState)) {
    Shiny.shinyapp.$scheduleReconnect(1000);
  }

  if (Shiny.shinyapp.$socket !== null && Shiny.shinyapp.$socket.readyState === OPEN) {
    Shiny.hideReconnectDialog();
  } else if (maxAttempts > 0) {
    setTimeout(function () {
      reconnectWithbackoff(--maxAttempts, waitFor * 1.125);
    }, waitFor);
  } else {
    Shiny.showReconnectDialog();
  }
} // eslint-disable-next-line no-unused-vars


function preShinyInit() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    transports: []
  };

  Shiny.createSocket = function () {
    var url = "".concat(window.location.protocol, "//").concat(window.location.host).concat(window.location.pathname.replace(/\/[^\/]*$/, ''));
    url += '/__sockjs__/';
    Shiny.shinyapp.$allowReconnect = true;
    $(document).on('shiny:disconnected', function () {
      reconnectWithbackoff(50, 1000);
    });
    return new SockJS(url, options.transports, {});
  };
}
//# sourceMappingURL=shiny-server-client.js.map