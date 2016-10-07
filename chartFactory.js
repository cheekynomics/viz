//<script src="https://d3js.org/d3.v4.min.js" type="text/javascript"></script>

let lookup = {makeAxisObj : {'CATEGORICAL' : makeCategoricalAxis,
                             'CONTINUOUS' : makeContinuousAxis },
            setAxisDomain : {'CATEGORICAL' : makeCategoricalDomain,
                             'CONTINUOUS' : makeContinuousDomain},
            chartType : {'BAR' : makeBarChart},
            dataType : {'ARRAY' : '__',
                    'CSV' : d3.csv,
                    'TSV' : d3.tsv,
                    'JSON' : d3.json}};
                             
function deriveDataType(info){
    if (Object.prototype.toString.call(info) === "[object Array]") {
        return 'ARRAY';
    }
    else if (typeof info === 'string') {
        return info.substring(info.lastIndexOf('.') + 1).toUpperCase();
    }
    else{return 'NONE';}
    }




function InitialiseChart(containerID, config) {

    
    var instructions = {xaxis : {obj : lookup.makeAxisObj[config.x],domain : lookup.setAxisDomain[config.x]},
                       yaxis : {obj : lookup.makeAxisObj[config.y],  domain : lookup.setAxisDomain[config.y]},
                       data : { source : config.data,
                                type : lookup.dataType[deriveDataType(config.data)],
                                xVariable : config.xVar,
                                yVariable : config.yVar},
                        labels : config.labels,
                        chartType : lookup.chartType[config.type]};

    return function(){
        console.log(instructions)
        var chartContainer = d3.select("#" + containerID),
            
            dimensions = {margins : {b : 50, t : 20, l : 50, r : 20},
                        boxHeight : chartContainer.node().getBoundingClientRect().height,
                        boxWidth : chartContainer.node().getBoundingClientRect().width,            
                        chartHeight : function() {return this.boxHeight - this.margins.b - this.margins.t;},
                        chartWidth : function () {return this.boxWidth - this.margins.l - this.margins.r;}};
            

            
        var x = instructions.xaxis.obj(dimensions.chartWidth()),
            y = instructions.yaxis.obj(dimensions.chartHeight());
            
        var chart = chartContainer.append("svg")
            .attr("height", dimensions.boxHeight)
            .attr("width", dimensions.boxWidth);
            
        var g = chart.append("g")
            .attr("transform", "translate(" + dimensions.margins.l + "," + dimensions.margins.t + ")");
        updateChart(g, x, y, instructions, dimensions);
    };
}


function updateChart(inputChart, xAxisObject, yAxisObject, chartInstructions, chartDimensions) {

    if (chartInstructions.data.type != '__') {
        
        chartInstructions.data.type(chartInstructions.data.source, function(d){return d;},
                                        function(error, data){
                                            if (error) throw error;
                                            
                                            xAxisObject.domain(chartInstructions.xaxis.domain(data,
                                                                                              chartInstructions.data.xVariable));
                                            yAxisObject.domain(chartInstructions.yaxis.domain(data,
                                                                                              chartInstructions.data.yVariable));
                                            
                                            makeXAxis(inputChart, xAxisObject, chartDimensions, chartInstructions);
                                            makeYAxis(inputChart, yAxisObject, chartDimensions, chartInstructions);
                                                
                                            chartInstructions.chartType(inputChart,data, xAxisObject, yAxisObject, chartInstructions, chartDimensions);
                                        }
                                    );}
    else {
        xAxisObject.domain(chartInstructions.xaxis.domain(chartInstructions.data.source, chartInstructions.data.xVariable));
        yAxisObject.domain(chartInstructions.yaxis.domain(chartInstructions.data.source, chartInstructions.data.yVariable));
        makeXAxis(inputChart, xAxisObject, chartDimensions, chartInstructions);
        makeYAxis(inputChart, yAxisObject, chartDimensions, chartInstructions);
                                                
        chartInstructions.chartType(inputChart ,chartInstructions.data.source, xAxisObject, yAxisObject, chartInstructions, chartDimensions);
                
    }    
}



function makeXAxis(chartIn, xAxisObject2, chartDimensions2, chartInstructions2) {
    chartIn.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + chartDimensions2.chartHeight() + ")")
        .call(d3.axisBottom(xAxisObject2));
    
    //xaxis title
    chartIn.append("text")
        .attr("y", (chartDimensions2.chartHeight() + (chartDimensions2.margins.b - 5)))
        .attr("x", (chartDimensions2.chartWidth() / 2))
        .attr("text-anchor", "middle")
        .text(chartInstructions2.labels.xaxis);
}

function makeYAxis(chartIn, yAxisObject2, chartDimensions2, chartInstructions2) {
    chartIn.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yAxisObject2));
        
    //yaxis title
    chartIn.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -(chartDimensions2.margins.l - 15))
        .attr("x", -chartDimensions2.chartHeight()/2)
        .attr("text-anchor", "middle")
        .text(chartInstructions2.labels.yaxis);
}



function makeBarChart(chartObject, dataIn, xObject, yObject, chartInstructions2, chartDimensions2) {
    console.log(chartInstructions2.data.xVariable);
    chartObject.selectAll(".bar")
        .data(dataIn)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {return xObject(d[chartInstructions2.data.xVariable]);})
        .attr("y", function(d) {return yObject(d[chartInstructions2.data.yVariable]);})
        .attr("width", xObject.bandwidth())
        .attr("height", function(d) {return chartDimensions2.chartHeight() - yObject(d[chartInstructions2.data.yVariable]);});
        
}


function makeCategoricalAxis(space) {
    return d3.scaleBand().rangeRound([0, space]).padding(0.1);
}

function makeContinuousAxis(space) {
    return d3.scaleLinear().rangeRound([space, 0]);
}

function makeCategoricalDomain(dataIn, name) {
    console.log(dataIn);
    return dataIn.map(function(d) {return d[name];});
}

function makeContinuousDomain(dataIn, name) {
    return [0, d3.max(dataIn, function(d) {return d[name];})];
}