//<script src="https://d3js.org/d3.v4.min.js" type="text/javascript"></script>

<<<<<<< HEAD
let lookup = {makeAxisObj : {'CATEGORICAL' : makeCategoricalAxis,
                             'CONTINUOUS' : makeContinuousAxis },
            setAxisDomain : {'CATEGORICAL' : makeCategoricalDomain,
                             'CONTINUOUS' : makeContinuousDomain},
            chartType : {'VBAR' : makeVerticalBarChart,
                        'HBAR' : makeHorizontalBarChart},
            dataType : {'ARRAY' : '__',
                    'CSV' : d3.csv,
                    'TSV' : d3.tsv,
                    'JSON' : d3.json}};
                             
function deriveDataType(info){
    if (Object.prototype.toString.call(info) === "[object Array]") {
=======
let lookup = {
    makeAxisObj : {
        'CATEGORICAL' : makeCategoricalAxis,
        'CONTINUOUS' : makeContinuousAxis
    },
    setAxisDomain : {
        'CATEGORICAL' : makeCategoricalDomain,
        'CONTINUOUS' : makeContinuousDomain
    },
    chartType : {
        'BAR' : makeBarChart
    },
    dataType : {
        'ARRAY' : '__',
        'CSV' : d3.csv,
        'TSV' : d3.tsv,
        'JSON' : d3.json
    }};


// This function chooses the dataType from the source.
const deriveDataType = (dataSource) => {
    if (Array.isArray(dataSource)) {
>>>>>>> 4a302a5eb093b4ecd564eca889b5477b90abfaee
        return 'ARRAY';
    }
    else if (typeof dataSource === 'string') {
        return dataSource.substring(dataSource.lastIndexOf('.') + 1).toUpperCase();
    }
    else {
        return 'NONE';
    }
}

const fromID = (idString) => d3.select(`#${idString}`)

function InitialiseChart(containerID, config) {

    let instructions = {
        xaxis : {
            obj : lookup.makeAxisObj[config.x],
            domain : lookup.setAxisDomain[config.x]
        },
        yaxis : {
            obj : lookup.makeAxisObj[config.y],
            domain : lookup.setAxisDomain[config.y]
        },
        data : {
            source : config.data,
            type : deriveDataType(config.data),
            xVariable : config.xVar,
            yVariable : config.yVar
        },
        labels : config.labels,
        chartType : lookup.chartType[config.type]
    };

    return prepareChartInContainer(fromID(containerID), instructions)

}

<<<<<<< HEAD
    
    var instructions = {xaxis : {obj : lookup.makeAxisObj[config.x],domain : lookup.setAxisDomain[config.x]},
                       yaxis : {obj : lookup.makeAxisObj[config.y],  domain : lookup.setAxisDomain[config.y]},
                       data : { source : config.data.src,
                                numericColumns : config.data.numCols,
                                type : lookup.dataType[deriveDataType(config.data.src)],
                                xVariable : config.xVar,
                                yVariable : config.yVar},
                        labels : config.labels,
                        chartType : lookup.chartType[config.type]};
                                        
=======
const prepareChartInContainer = (container, instructions) => {
>>>>>>> 4a302a5eb093b4ecd564eca889b5477b90abfaee

    return function(){
        // console.log(instructions)
        let bounds = container.node().getBoundingClientRect();

        let margins = {
            b : 50,
            t : 20,
            l : 50,
            r : 20
        }

        let {height: boxHeight, width: boxWidth} = bounds

        let chartHeight = boxHeight - margins.b - margins.t
        let chartWidth = boxWidth - margins.l - margins.r

        let chartContainer = container
        let dimensions = {
                margins,
                boxHeight,
                boxWidth,
                chartHeight,
                chartWidth
            };

        let x = instructions.xaxis.obj(dimensions.chartWidth),
            y = instructions.yaxis.obj(dimensions.chartHeight);

        let chart = chartContainer.append("svg")
            .attr("height", dimensions.boxHeight)
            .attr("width", dimensions.boxWidth);

        let g = chart.append("g")
            .attr("transform", `translate(${dimensions.margins.l},${ dimensions.margins.t})`);
        updateChart(g, x, y, instructions, dimensions);
    };
};


function updateChart(inputChart, xAxisObject, yAxisObject, chartInstructions, chartDimensions) {

<<<<<<< HEAD
    if (chartInstructions.data.type != '__') {
        
        chartInstructions.data.type(chartInstructions.data.source, function(d){
                                            if (! isNaN(d[chartInstructions.data.xVariable])) {
                                                d[chartInstructions.data.xVariable] = +d[chartInstructions.data.xVariable];
                                            }
                                            if (! isNaN(d[chartInstructions.data.yVariable])) {
                                                d[chartInstructions.data.yVariable] = +d[chartInstructions.data.yVariable];
                                            }
                                            return d;
                                            },function(error, data){
                                                if (error) throw error;
                // need to coerce the numeric columns to a number
                                            chartInstructions.chartType(inputChart,data, xAxisObject, yAxisObject, chartInstructions, chartDimensions);
                                        }
                                    );}
    else {
=======

    const dataCallback = (error, data) => {
        if (error) throw error;

        xAxisObject.domain(
            chartInstructions.xaxis.domain(
                data,
                chartInstructions.data.xVariable
                )
            );
        yAxisObject.domain(
            chartInstructions.yaxis.domain(
            data,
            chartInstructions.data.yVariable
            )
        );

        makeXAxis(inputChart, xAxisObject, chartDimensions, chartInstructions);
        makeYAxis(inputChart, yAxisObject, chartDimensions, chartInstructions);

        chartInstructions.chartType(inputChart,data, xAxisObject, yAxisObject, chartInstructions, chartDimensions);
    };


    // Option 1: Switch plus variable
    let dataProcessor = null;
    switch (chartInstructions.data.type) {
    case "TSV":
        dataProcessor = d3.tsv;
        break;
    case "CSV":
        dataProcessor = d3.csv;
        break;
    case "JSON":
        dataProcessor = d3.json;
        break;
    case "ARRAY":
>>>>>>> 4a302a5eb093b4ecd564eca889b5477b90abfaee
        xAxisObject.domain(chartInstructions.xaxis.domain(chartInstructions.data.source, chartInstructions.data.xVariable));
        yAxisObject.domain(chartInstructions.yaxis.domain(chartInstructions.data.source, chartInstructions.data.yVariable));
        makeXAxis(inputChart, xAxisObject, chartDimensions, chartInstructions);
        makeYAxis(inputChart, yAxisObject, chartDimensions, chartInstructions);

        chartInstructions.chartType(inputChart ,chartInstructions.data.source, xAxisObject, yAxisObject, chartInstructions, chartDimensions);
        break;
    }

    // Option 2, local lookup.
    // let processors = {
    //     "ARRAY" : "__",
    //     "CSV" : d3.csv,
    //     "TSV" : d3.tsv,
    //     "JSON" : d3.json
    // };

    if (dataProcessor !== null) {
        dataProcessor(
            chartInstructions.data.source,
            function(d){return d;},
            dataCallback);
    }

function makeVerticalBarChart(chartObject, dataIn, xObject, yObject, chartInstructions2, chartDimensions2) {
    
        //sets the domain for the axis objects
    xObject.domain(chartInstructions2.xaxis.domain(dataIn,chartInstructions2.data.xVariable));
    yObject.domain(chartInstructions2.yaxis.domain(dataIn,chartInstructions2.data.yVariable));
    
    makeXAxis(chartObject, xObject, chartDimensions2, chartInstructions2);
    makeYAxis(chartObject, yObject, chartDimensions2, chartInstructions2);
    
    
    
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


function makeHorizontalBarChart(chartObject, dataIn, xObject, yObject, chartInstructions2, chartDimensions2) {
    console.log(chartInstructions2.data.xVariable);
    chartObject.selectAll(".bar")
        .data(dataIn)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {return xObject(d[chartInstructions2.data.xVariable]);})
        .attr("y", function(d) {return yObject(d[chartInstructions2.data.yVariable]);})
        .attr("width", yObject.bandwidth())
        .attr("height", function(d) {return chartDimensions2.chartHeight() - yObject(d[chartInstructions2.data.yVariable]);});
        
}


}

function makeXAxis(chartIn, xAxisObject2, chartDimensions2, chartInstructions2) {
    chartIn.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + chartDimensions2.chartHeight + ")")
            .call(d3.axisBottom(xAxisObject2));

    //xaxis title
    chartIn.append("text")
    .attr("y", (chartDimensions2.chartHeight + (chartDimensions2.margins.b - 5)))
    .attr("x", (chartDimensions2.chartWidth / 2))
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
    .attr("x", -chartDimensions2.chartHeight/2)
    .attr("text-anchor", "middle")
    .text(chartInstructions2.labels.yaxis);
}



<<<<<<< HEAD
=======
function makeBarChart(chartObject, dataIn, xObject, yObject, chartInstructions2, chartDimensions2) {
    // console.log(chartInstructions2.data.xVariable);
    chartObject.selectAll(".bar")
    .data(dataIn)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {return xObject(d[chartInstructions2.data.xVariable]);})
    .attr("y", function(d) {return yObject(d[chartInstructions2.data.yVariable]);})
    .attr("width", xObject.bandwidth())
    .attr("height", function(d) {return chartDimensions2.chartHeight - yObject(d[chartInstructions2.data.yVariable]);});

}

>>>>>>> 4a302a5eb093b4ecd564eca889b5477b90abfaee

function makeCategoricalAxis(space) {
    return d3.scaleBand().rangeRound([0, space]).padding(0.1);
}

function makeContinuousAxis(space) {
    return d3.scaleLinear().rangeRound([space, 0]);
}

function makeCategoricalDomain(dataIn, name) {
    // console.log(dataIn);
    return dataIn.map(function(d) {return d[name];});
}

function makeContinuousDomain(dataIn, name) {
    console.log(dataIn, name)
    console.log(d3.max(dataIn, function(d) {return d[name];}))
    return [0, d3.max(dataIn, function(d) {return d[name];})];
}