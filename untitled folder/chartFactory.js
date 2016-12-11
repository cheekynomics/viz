//<script src="https://d3js.org/d3.v4.min.js" type="text/javascript"></script>



const makeVBarChart = (chartObject, dataIn, xObject, yObject, chartInstructions2, chartDimensions2) => {
    chartObject.selectAll(".bar")
        .data(dataIn)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xObject(d[chartInstructions2.data.xVariable]); })
        .attr("y", function(d) { return yObject(d[chartInstructions2.data.yVariable]); })
        .attr("width", xObject.bandwidth())
        .attr("height", function(d) { return chartDimensions2.chartHeight - yObject(d[chartInstructions2.data.yVariable]); });
};


const makeHBarChart = (chartObject, dataIn, xObject, yObject, chartInstructions2, chartDimensions2) => {
    chartObject.selectAll(".bar")
        .data(dataIn)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0) //function(d) { return xObject(d[chartInstructions2.data.xVariable]); })
        .attr("y", function(d) { return yObject(d[chartInstructions2.data.yVariable]); })
        .attr("height", yObject.bandwidth())
        .attr("width", function(d) { return xObject(d[chartInstructions2.data.xVariable]); });
};

const makeLineChart = (chartObject, dataIn, xObject, yObject, chartInstructions2, chartDimensions2) => {
  let xVar = chartInstructions2.data.xVariable,
      yVar = chartInstructions2.data.yVariable;
    
      
  for (let i in yVar){
    let line = d3.line()
      .x(function(d) {console.log(xObject(d[xVar])); return xObject(d[xVar]);})
      .y(function(d) {return yObject(d[yVar[i]]);});
    
    chartObject.append("path")
      .datum(dataIn)
      .attr("class", "line")
      .attr("d", line);
    
    chartObject.selectAll("dot")
    .data(dataIn)
    .enter().append("circle")
      .attr("r", 3.5)
      .attr("cx", function(d) {return xObject(d[xVar]);})
      .attr("cy", function(d) {return yObject(d[yVar[i]]);});
  }
};


const makeCategoricalAxis = (dims, dest) => {
    if (dest === "LINE"){
      return d3.scalePoint().range(dims);//.rangePoints(dims);
    }
    else{
      return d3.scaleBand().rangeRound(dims).padding(0.1);
    }
    
};


const makeContinuousAxis = (dims, dest) => {
    return d3.scaleLinear().rangeRound(dims);
};


const makeCategoricalDomain = (dataIn, name) => {
    return dataIn.map(function(d) { return d[name]; });
};

const maxOfVarsInArray = (data, vars)=>{
  let getMaxOf = [];
  for (let i = 0; i < vars.length; i++){
    getMaxOf.push(data[vars[i]]);
  }
  return d3.max(getMaxOf);
}


const makeContinuousDomain = (dataIn, vars) => {
  // Is it best to ensure that we always pass a list of objects to this function?
  //I can't think of a situation where there would be multiple y-variables; makes sense to be able to pass a single variable
  if (Array.isArray(vars)){
    return [0, d3.max(dataIn, function(d) { return maxOfVarsInArray(d, vars); })];
  }
  else{
    return [0, d3.max(dataIn, function(d) { return d[vars];})];
  }
    
};

// determines which of the above functions to call to create the chart
let lookup = {
    makeAxisObj: {
        "CATEGORICAL": makeCategoricalAxis,
        "CONTINUOUS": makeContinuousAxis
    },
    setAxisDomain: {
        "CATEGORICAL": makeCategoricalDomain,
        "CONTINUOUS": makeContinuousDomain
    },
    chartType: {
        "VBAR": makeVBarChart,
        "HBAR": makeHBarChart,
        "LINE" : makeLineChart
    },
    dataType: {
        "ARRAY": "__",
        "CSV": d3.csv,
        "TSV": d3.tsv,
        "JSON": d3.json
    }
};


const makeXAxis = (chartIn, xAxisObject2, chartDimensions2, chartInstructions2) => {
  
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
};


const makeYAxis = (chartIn, yAxisObject2, chartDimensions2, chartInstructions2) => {
    chartIn.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yAxisObject2));

    //yaxis title
    chartIn.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -(chartDimensions2.margins.l - 15))
        .attr("x", -chartDimensions2.chartHeight / 2)
        .attr("text-anchor", "middle")
        .text(chartInstructions2.labels.yaxis);
};



// This function chooses the dataType from the source.
const deriveDataType = (dataSource) => {
    if (Array.isArray(dataSource)) {
        return "ARRAY";
    } else if (typeof dataSource === "string") {
        return dataSource.substring(dataSource.lastIndexOf(".") + 1).toUpperCase();
    } else {
        return "NONE";
    }
};


//this function coerces x- and y- variables to numeric
const coerceToNumeric = (dataIn, v1, v2) => {
    if (!isNaN(dataIn[v1])) {
        dataIn[v1] = +dataIn[v1];
    }
    if (!isNaN(dataIn[v2])) {
        dataIn[v2] = +dataIn[v2];
    }
    return dataIn;
};


//selects the chart object from an id string
const fromID = (idString) => d3.select(`#${idString}`);


const InitialiseChart = (containerID, config) => {
    //takes the config file that was passed to the function and uses this to create the chart instructions

    let instructions = {
        xaxis: {
            obj: lookup.makeAxisObj[config.x],
            domain: lookup.setAxisDomain[config.x],
            type: config.x,
            chartType: config.type
        },
        yaxis: {
            obj: lookup.makeAxisObj[config.y],
            domain: lookup.setAxisDomain[config.y],
            type: config.y,
            chartType: config.type
        },
        data: {
            source: config.data,
            type: deriveDataType(config.data.src),
            xVariable: config.xVar,
            yVariable: config.yVar
        },
        labels: config.labels,
        chartType: lookup.chartType[config.type]
    };

    return prepareChartInContainer(fromID(containerID), instructions);

};


const prepareChartInContainer = (container, instructions) => {
    //Prepares the dimensions of the chart as well as the static elements such as the axis constructors

    return function() {
        //gets the size of the container
        let bounds = container.node().getBoundingClientRect();
        let { height: boxHeight, width: boxWidth } = bounds;

        let margins = {
            b: 50,
            t: 20,
            l: 50,
            r: 20
        };
        //calculates the size of the chart within the available area
        let chartHeight = boxHeight - margins.b - margins.t;
        let chartWidth = boxWidth - margins.l - margins.r;
        //creates the dimensions of the chart to pass around
        let chartContainer = container;
        let dimensions = {
            margins,
            boxHeight,
            boxWidth,
            chartHeight,
            chartWidth
        };
        //creates the x- and y-axis objects from the instructions
        let xAxisConstructor = instructions.xaxis.obj,
            yAxisConstructor = instructions.yaxis.obj;

        let x = xAxisConstructor([0, dimensions.chartWidth], instructions.xaxis.chartType),
            y = yAxisConstructor([dimensions.chartHeight, 0], instructions.yaxis.chartType);

        //adds the svg to the div, setting the height and width
        let chart = chartContainer.append("svg")
            .attr("height", dimensions.boxHeight)
            .attr("width", dimensions.boxWidth);
        // sets the plotting area within the avg
        let g = chart.append("g")
            .attr("transform", `translate(${dimensions.margins.l},${ dimensions.margins.t})`);

        //binds the data to the chart skeleton
        
        updateChart(g, x, y, instructions, dimensions);
    };
};






const updateChart = (inputChart, xAxisObject, yAxisObject, chartInstructions, chartDimensions) => {

    let xDomain = chartInstructions.xaxis.domain,
        yDomain = chartInstructions.yaxis.domain,
        xVar = chartInstructions.data.xVariable,
        yVar = chartInstructions.data.yVariable;
    let createChart = chartInstructions.chartType;

    const dataCallback = (error, data) => {

        if (error) throw error;
        //binds the data to the axes
        xAxisObject.domain(xDomain(data, xVar));
        yAxisObject.domain(yDomain(data, yVar));
        //creates the axes on the chart
        makeXAxis(inputChart, xAxisObject, chartDimensions, chartInstructions);
        makeYAxis(inputChart, yAxisObject, chartDimensions, chartInstructions);
        //displays the data on the chart

        createChart(inputChart, data, xAxisObject, yAxisObject, chartInstructions, chartDimensions);
    };

    // Option 1: Switch plus variable
    let dataProcessor = null;
    switch (chartInstructions.data.type) {
        case "TSV":
            {
                dataProcessor = d3.tsv;
                break;
            }
        case "CSV":
            {
                dataProcessor = d3.csv;
                break;
            }
        case "JSON":
            {
                dataProcessor = d3.json;
                break;
            }
        case "ARRAY":
            {
                // makes the different bits of the charts - only triggers if the data was passed as a JSON to this function,
                //otherwise the data callback does its thing
                let data = chartInstructions.data.source.src;
                let a = xDomain(data, xVar);
                console.log(a);
                xAxisObject.domain(xDomain(data, xVar));
                yAxisObject.domain(yDomain(data, yVar));

                makeXAxis(inputChart, xAxisObject, chartDimensions, chartInstructions);
                makeYAxis(inputChart, yAxisObject, chartDimensions, chartInstructions);

                createChart(inputChart, data, xAxisObject, yAxisObject, chartInstructions, chartDimensions);
                break;
            }
    }

    let data = chartInstructions.data.source.src;
    if (dataProcessor !== null) {
        dataProcessor(data, function(d) { return coerceToNumeric(d, xVar, yVar); }, dataCallback);
    }
};