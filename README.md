# Analytics Platform Shiny Server

This is a 'shiny server', for serving Shiny applications over the web.

MOJ has developed this this one because the other shiny servers did not meet our needs.

## Features

* Host a single Shiny application
* Supports non-websocket-capable browsers, like IE9, by using SockJS
* Supports adding Google Analytics tracking into the app
* Free and open source
* Install via NPM (no OS specific installers required)
* JSON / structured logging to STDOUT

### SockJS

Shiny apps use websockets, which is a newish addition beyond HTTP, so it is not supported by some older browsers (e.g. IE9) and older firewalls, which many corporates still have. A Shiny app will simply appear 'greyed out' if websockets are not available.

However SockJS is a bit of javascript that redirects websocket requests via normal HTTP, so this server adds this into every page, which kicks in as a fallback option. This is achieved by adding an HTTP filter that inserts the `<script src="sock.js">` into HTTP responses from the app. You can also reduce the ALLOWED_PROTOCOLS the app will try to us, if you're still having trouble.

### Google Analytics

To collect analytics about your app's usage, you could either add the snippet of javascript into your Shiny app's code, or leave it to this server, by specifying SHINY_GAID.

## Why write another shiny server?

### Comparison with Rstudio's Shiny-Server

| **Feature**                    | AP Shiny Server        | RStudio Shiny Server |
| ------------------------------ | ---------------------- | -------------------- |
| Multiple Tenants               | ✘                      | ✓                    |
| Multiple Shiny Apps            | ✘                      | ✓                    |
| Multiple Users                 | ✓                      | ✓                    |
| Google Analytics               | ✓                      | ✓                    |
| SockJS fallback                | ✓                      | ✓                    |
| Authentication                 | ✘                      | ✓\* (paid)           |
| Forward all headers            | ✓                      | ✓\* (paid)           |
| Use non-system R               | ✓ (will use R on PATH) | ✓\* (paid)           |
| Timeouts (app and session)     | ✘                      | ✓                    |
| Restart by writing restart.txt | ✘  (TODO)              | ✓                    |

Here were the problems we had with [RStudio Shiny Server Open Source](https://rstudio.com/products/shiny/shiny-server/):

* It doesn’t pass HTTP headers through to the app - reserved for the paid Pro version
* You can't configure it to use a separate R environment, such as a Conda environment - reserved for the paid Pro version
* It logs to a file - this requires us to run a log shipper - it would be better to log to stdout for running as a container.
* It has no health-check endpoint - reserved for the paid Pro version
* No resource metrics - reserved for the paid Pro version

We don't need several of the features of RStudio Shiny Server:

* serving multiple apps and multiple threads, because we run each app in its own containers, which scale fine horizontally.
* authentication is a Pro feature, for which we achieve instead with an [auth proxy](https://github.com/ministryofjustice/analytics-platform-auth-proxy) container.

Writing a single thread shiny server is actually pretty simple, so that's what we have done. It's written in NodeJS merely because it interfaces with HTTP well.

There are some other shiny servers we also considered:

* [Shiny Server Pro](https://rstudio.com/products/shiny-server-pro/) is a closed-source paid product and "it is not being actively developed. We strongly recommend customers consider RStudio Connect instead." ([RStudio Connect](https://rstudio.com/products/connect/) is a managed hosting platform for Shiny apps etc starting at $15k at time of writing)
* [ShinyProxy](https://www.shinyproxy.io/) appears to deploys docker containers, but we prefer to keep control of deployment with helm, which installs our auth-proxy for us. Also it doesn't appear to have the SockJS fallback.

## Configuration

| Name                | Description                                                              | Default                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `SHINY_APP`         | Location of Shiny app root                                               | `./example`                                                                                                                                 |
| `SHINY_GAID`        | Google Analytics tracking code (e.g. `UA-XXXXX-X`)                       | No Default                                                                                                                                  |
| `LOG_LEVEL`         | One of `info` or `debug`                                                 | `info`                                                                                                                                      |
| `ALLOWED_PROTOCOLS` | SockJS enabled transports                                                | `websocket, xdr-streaming, xhr-streaming, iframe-eventsource, iframe-htmlfile, xdr-polling, xhr-polling, iframe-xhr-polling, jsonp-polling` |
| `PORT`              | Port to run this server on                                               | `9999`                                                                                                                                      |
| `TARGET_PORT`       | Port to run Shiny on. There probably isn't a good reason to change this. | `7999`                                                                                                                                      |

## How to Run

1. Install it:
   `$ npm i -g ministryofjustice/analytics-platform-shiny-server`
2. Run it:
   `$ SHINY_APP=/path/to/shiny-app analytics-platform-shiny-server`

Which will give you a shiny-server that spawns the R shiny app as a child process,
access it on http://localhost:9999

## How to release

1. Make your changes
2. `npm run build`
3. Commit your files included transpiled ones in ./static/
4. Push to a new branch on github and make a PR

## Design

The key line of code is to call Shiny's own server method:

```r
shiny::runApp('/myapp', port=80, launch.browser=FALSE)
```

It configures a shiny.http.response.filter to inject into the `<head>` of all sever responses the scripts for SockJS and protocol/transport options etc.

It sets up logging to stdout using logging.js.

## Licences

GNU Affero General Public License version 3. See [LICENCE](./LICENCE)

Why this licence? While this isn't a fork of the [official shiny-server](https://github.com/rstudio/shiny-server), it is heavily inspired by
it. So we've decided to effectively treat this as a fork for licensing purposes and apply the same licence as that: AGPL-3.0.

### Example App (Creative Commons)

The example app that is served when no SHINY_APP is specified has it's [own licence](./example/LICENCE).

The example app [requires a working R and Rshiny install](./example/README.md#running-the-example-app).

### Sockjs (MIT)

[Sockjs](https://github.com/sockjs/sockjs-client) is bundled in this repository and is licenced under MIT.
