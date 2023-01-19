library(shiny)
PORT <- as.numeric(Sys.getenv('TARGET_PORT', 7999))
SHINY_APP <- Sys.getenv('SHINY_APP', unset = './example')
SCRIPT_DIR <- Sys.getenv('DIRNAME')

# Add an HTTP filter to inject SockJS scripts etc into the Shiny app's HTML responses
source(paste(SCRIPT_DIR, '/R/injectSockJS.R', sep=''))

# Ensure that we don't send verbose error messages back to the client
options(shiny.sanitize.errors = TRUE)

# Actually serve the app
shiny::runApp(SHINY_APP, port=PORT, launch.browser=FALSE)
