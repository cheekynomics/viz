//<script src="https://d3js.org/d3.v4.min.js" type="text/javascript"></script>


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
        "HBAR": makeHBarChart
    },
    dataType: {
        "ARRAY": "__",
        "CSV": d3.csv,
        "TSV": d3.tsv,
        "JSON": d3.json
    }
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

const fromID = (idString) => d3.select(`#${idString}`);

function InitialiseChart(containerID, config) {
    //takes the config file that was passed to the function and uses this to create the chart instructions

    let instructions = {
        xaxis: {
            obj: lookup.makeAxisObj[config.x],
            domain: lookup.setAxisDomain[config.x]
        },
        yaxis: {
            obj: lookup.makeAxisObj[config.y],
            domain: lookup.setAxisDomain[config.y]
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

}

const coerceToNumeric = (dataIn, v1, v2) => {
    if (!isNaN(dataIn[v1])) {
        dataIn[v1] = +dataIn[v1];
    }
    if (!isNaN(dataIn[v2])) {
        dataIn[v2] = +dataIn[v2];
    }
    return dataIn;
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
        let x = instructions.xaxis.obj(dimensions.chartWidth),
            y = instructions.yaxis.obj(dimensions.chartHeight);

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
    const dataCallback = (error, data) => {

        if (error) throw error;

        let createChart = chartInstructions.chartType;

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
            dataProcessor = d3.tsv;
            break;
        case "CSV":
            dataProcessor = d3.csv;
            break;
        case "JSON":
            dataProcessor = d3.json;
            break;
        case "ARRAY":
            // makes the different bits of the charts - only triggers if the data was passed as a JSON to this function,
            //otherwise the data callback does its thing
            xAxisObject.domain(chartInstructions.xaxis.domain(chartInstructions.data.source.src, chartInstructions.data.xVariable));
            yAxisObject.domain(chartInstructions.yaxis.domain(chartInstructions.data.source.src, chartInstructions.data.yVariable));
            makeXAxis(inputChart, xAxisObject, chartDimensions, chartInstructions);
            makeYAxis(inputChart, yAxisObject, chartDimensions, chartInstructions);

            chartInstructions.chartType(inputChart, chartInstructions.data.source.src, xAxisObject, yAxisObject, chartInstructions, chartDimensions);
            break;
    }

    let data = chartInstructions.data.source.src;
    if (dataProcessor !== null) {
        dataProcessor(data, function(d) { return coerceToNumeric(d, xVar, yVar); }, dataCallback);
    }
};


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
        .attr("x", -chartDimensions2.chartHeight / 2)
        .attr("text-anchor", "middle")
        .text(chartInstructions2.labels.yaxis);
}









function makeVBarChart(chartObject, dataIn, xObject, yObject, chartInstructions2, chartDimensions2) {
    chartObject.selectAll(".bar")
        .data(dataIn)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xObject(d[chartInstructions2.data.xVariable]); })
        .attr("y", function(d) { return yObject(d[chartInstructions2.data.yVariable]); })
        .attr("width", xObject.bandwidth())
        .attr("height", function(d) { return chartDimensions2.chartHeight - yObject(d[chartInstructions2.data.yVariable]); });
}

function makeHBarChart(chartObject, dataIn, xObject, yObject, chartInstructions2, chartDimensions2) {
    chartObject.selectAll(".bar")
        .data(dataIn)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xObject(d[chartInstructions2.data.xVariable]); })
        .attr("y", function(d) { return yObject(d[chartInstructions2.data.yVariable]); })
        .attr("height", yObject.bandwidth())
        .attr("width", function(d) { return chartDimensions2.chartWidth - xObject(d[chartInstructions2.data.xVariable]); });
}

function makeCategoricalAxis(space) {
    return d3.scaleBand().rangeRound([0, space]).padding(0.1);
}

function makeContinuousAxis(space) {
    return d3.scaleLinear().rangeRound([space, 0]);
}

function makeCategoricalDomain(dataIn, name) {
    // console.log(dataIn);
    return dataIn.map(function(d) { return d[name]; });
}

function makeContinuousDomain(dataIn, name) {
    return [0, d3.max(dataIn, function(d) { return d[name]; })];
}