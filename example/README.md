# Example Diamonds Explorer Shiny App

Shiny app to explore diamonds dataset

Adapted from: https://github.com/plotly/documentation/blob/source-design-merge/_posts/r/shiny/shiny-gallery/2016-02-24-explore-diamonds.md

Attribution: [Chelsea Douglas](https://github.com/cldougl) at [Plotly]

Plotly: https://plot.ly/

## Running the example app

To run this rshiny app from the MoJ shiny server, you will need R installed.  You can download R from homebrew with the following command

```shell
brew install --cask r
```

To launch R, you can run

```shell
$ r
```

Once R is running, you can install the required packages with the following:

```r
> install.packages("shiny")

# You will be asked to choose a mirror, pick 75
# Ignore any errors arising from the missing X11 library

> install.packages("plotly")
> quit()

# Choose yes when prompted to save the current image
``
