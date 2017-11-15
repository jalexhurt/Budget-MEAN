// Create data array of values to visualize
function create_graph(data, id) {
    var dataArray = data
    $("#" + id).html("");
// Create variable for the SVG
    var svg = d3.select("#" + id).append("svg")
        .attr("height", "400px")
        .attr("width", "500px");

// Select, append to SVG, and add attributes to rectangles for bar chart
    svg.selectAll("rect")
        .data(dataArray)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("height", function (d, i) {
            return (d * 10)
        })
        .attr("width", "40")
        .attr("x", function (d, i) {
            return (i * 60) + 25
        })
        .attr("y", function (d, i) {
            return 400 - (d * 10)
        });

// Select, append to SVG, and add attributes to text
    svg.selectAll("text")
        .data(dataArray)
        .enter().append("text")
        .text(function (d) {
            return d
        })
        .attr("class", "text")
        .attr("x", function (d, i) {
            return (i * 60) + 36
        })
        .attr("y", function (d, i) {
            return 415 - (d * 10)
        });
}
