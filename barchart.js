//<script src="https://d3js.org/d3.v4.min.js" type="text/javascript"></script>

function InitialiseChart(containerID) {
    return function(){
        var chartContainer = d3.select("#" + containerID),
            margins = {b : 50, t : 20, l : 20, r : 20},
            
            boxHeight = chartContainer.node().getBoundingClientRect().height,
            boxWidth = chartContainer.node().getBoundingClientRect().width,
            
            chartHeight = boxHeight - margins.b - margins.t,
            chartWidth = boxWidth - margins.l - margins.r;
            
        var x = d3.scaleBand().rangeRound([0, chartWidth]).padding(0.1),
            y = d3.scaleLinear().rangeRound([chartHeight, 0]);
         
        var chart = chartContainer.append("svg")
            .attr("height", boxHeight)
            .attr("width", boxWidth);
            
        var g = chart.append("g")
            .attr("transform", "translate(" + margins.l + "," + margins.t + ")");
    };
}