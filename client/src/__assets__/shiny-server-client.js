
function reconnectWithbackoff(maxAttempts, waitFor) {
  const CONNECTING = 0;
  const OPEN = 1;

  if (
    Shiny.shinyapp.$socket === null
    || ![OPEN, CONNECTING].includes(Shiny.shinyapp.$socket.readyState)
  ) {
    Shiny.shinyapp.$scheduleReconnect(1000);
  }

  if (Shiny.shinyapp.$socket !== null && Shiny.shinyapp.$socket.readyState === OPEN) {
    Shiny.hideReconnectDialog();
  } else if (maxAttempts > 0) {
    setTimeout(() => {
      reconnectWithbackoff(--maxAttempts, waitFor * 1.125);
    }, waitFor);
  } else {
    Shiny.showReconnectDialog();
  }
}

// eslint-disable-next-line no-unused-vars
function preShinyInit(options = { transports: [] }) {
  Shiny.createSocket = () => {
    let url = `${window.location.protocol}//${
      window.location.host
    }${window.location.pathname.replace(/\/[^\/]*$/, '')}`;
    url += '/__sockjs__/';
    Shiny.shinyapp.$allowReconnect = true;
    $(document).on('shiny:disconnected', () => {
      reconnectWithbackoff(
        50,
        1000,
      );
    });
    return new SockJS(url, options.transports, {});
  };
}
