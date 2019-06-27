# Analytics Platform Shiny Server

Shiny Server is a server program that makes Shiny applications available over the web.

## Features

- Host a single Shiny application
- Supports non-websocket-capable browsers, like IE9
- Free and open source
- Install via NPM (no OS specific installers required)
- JSON / structured logging to STDOUT

## Comparison with Rstudio's Shiny-Server

| **Feature**                    | AP Shiny Server        | Rstudio Shiny Server |
| ------------------------------ | ---------------------- | -------------------- |
| Multiple Tenants               | ✘                      | ✓                    |
| Multiple Shiny Apps            | ✘                      | ✓                    |
| Multiple Users                 | ✓                      | ✓                    |
| Google Analytics               | ✓                      | ✓                    |
| SockJS fallback                | ✓                      | ✓                    |
| Authentication                 | ✘                      | ✓                    |
| Forward all headers            | ✓                      | ✓\* (paid)           |
| Use non-system R               | ✓ (will use R on PATH) | ✓\* (paid)           |
| Timeouts (app and session)     | ✘                      | ✓                    |
| Restart by writing restart.txt | ✘  (TODO)              | ✓                    |

## Configuration

| Name                | Description                                                              | Default                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `SHINY_APP`         | Location of Shiny app root                                               | `./example`                                                                                                                                 |
| `SHINY_GAID`        | Google analytics tracking code (e.g. `UA-XXXXX-X`)                       | No Default                                                                                                                                  |
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

## How to release:

1. Make your changes
2. `yarn run build`
3. Commit your files included transpiled ones in ./static/
4. Push to a new branch on github and make a PR

## Licence

GNU Affero General Public License version 3. See [LICENCE](./LICENCE)

### Example App (Creative Commons)

The example app that is served when no SHINY_APP is specified has it's [own licence](./example/LICENCE)

### Sockjs (MIT)

[Sockjs](https://github.com/sockjs/sockjs-client) is bundled in this repository and is licenced under MIT.

### Why?

While this isn't a fork of the [official shiny-server](https://github.com/rstudio/shiny-server), it is heavily inspired by
it.

We've decided to effectively treat this as a fork for licencing purposes and apply
the same licence as that: AGPL-3.0.
