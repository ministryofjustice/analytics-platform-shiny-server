# Add an HTTP filter to inject SockJS scripts etc into the Shiny app's HTML responses

library(shiny)
library(htmltools)

transports_env <- Sys.getenv(x = 'ALLOWED_PROTOCOLS',
    unset = "websocket, xdr-streaming, xhr-streaming, iframe-eventsource, iframe-htmlfile, xdr-polling, xhr-polling, iframe-xhr-polling, jsonp-polling"
)
transports <- unlist(strsplit(transports_env, ","))
reconnect <- "true"
gaTrackingCode <- ''
gaScript <- ''

if (nzchar(Sys.getenv('SHINY_GAID'))) {
    gaTrackingCode <- tags$script(sprintf("
    window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
    ga('create', %s, 'auto');
    ga('send', 'pageview');", paste(shQuote(Sys.getenv('SHINY_GAID')))))
    gaScript <- tags$script(src = "https://www.google-analytics.com/analytics.js", async = 'async')
}

# Assemble the string that we're going to inject into the <head> section
inject <- paste(
    # SockJS scripts
    tags$script(src = '__assets__/sockjs.js'),
    tags$script(src = '__assets__/shiny-server-client.js'),

    # Inline JS call that sets Shiny's protocol/transport options
    tags$script(
        sprintf("preShinyInit({reconnect:%s, transports:[%s]});",
        reconnect, paste(shQuote(transports), collapse = ", ")
        )
    ),

    # Add Google Analytics tracking JS
    gaTrackingCode,
    gaScript,

    # Add CSS that makes it clearer to the user that its reconnecting?
    tags$link(rel = 'stylesheet', type = 'text/css', href = '__assets__/shiny-server.css'),
    HTML("</head>"),
    sep = "\n"
)

# Inject into <head> using an HTTP filter
filter <- function(...) {
    # The signature of filter functions changed between Shiny 0.4.0 and
    # 0.4.1; previously the parameters were (ws, headers, response) and
    # after they became (request, response). To work with both types, we
    # just grab the last argument.
    response <- list(...)[[length(list(...))]]

    if (response$status < 200 || response$status > 300) return(response)

    # Don't break responses that use httpuv's file-based bodies.
    if ('file' %in% names(response$content))
    return(response)

    if (! grepl("^text/html\\b", response$content_type, perl = T))
    return(response)

    # HTML files served from static handler are raw. Convert to char so we
    # can inject our head content.
    if (is.raw(response$content))
    response$content <- rawToChar(response$content)

    response$content <- sub("</head>", inject, response$content,
    ignore.case = T)
    return(response)
}
options(shiny.http.response.filter = filter)
options(error = traceback)
