
function(input, output) {

#add reactive data information. Dataset = built in diamonds data
dataset <- reactive( {
diamonds[sample(nrow(diamonds), input$sampleSize),]
})
output$trendPlot <- renderPlotly( {

# build graph with ggplot syntax
p <- ggplot(dataset(), aes_string(x = input$x, y = input$y, color = input$color))+
geom_point()
# if at least one facet column/row is specified, add it
facets <- paste(input$facet_row, '~', input$facet_col)
if (facets != '. ~ .')p <- p + facet_grid(facets)
ggplotly(p)%>%
layout(height = input$plotHeight, autosize=TRUE)
})
}
