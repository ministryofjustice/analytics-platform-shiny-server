# Analytics Platform Shiny Server

## Comparison

| **Feature**                | AP Shiny Server        | Rstudio Shiny Server |
| -------------------------- | ---------------------- | -------------------- |
| Multiple Tenants           | ✘                      | ✓                    |
| Multiple Shiny Apps        | ✘                      | ✓                    |
| Multiple Users             | ✓                      | ✓                    |
| Google Analytics           | ✓                      | ✓                    |
| SockJS fallback            | ✓                      | ✓                    |
| Authentication             | ✘                      | ✓                    |
| Forward all headers        | ✓                      | ✓\* (paid)           |
| Use non-system R           | ✓ (will use R on PATH) | ✓\* (paid)           |
| Timeouts (app and session) | ✘                      | ✓                    |

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

## Licence

GNU Affero General Public License version 3. See [LICENCE](./LICENCE)

### Why?

While this isn't a fork of the official shiny-server, it is heavily inspired by
that, and wouldn't have been possible without a lot of inspiration taken from it.
So I've decided to effectively treat this as a fork for licencing purposes and apply
the same licence as that project instead of the default MIT licence we use for
most Ministry of Justice projects.
