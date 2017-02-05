import * as d3 from 'd3';
import React, {Component} from 'react';

class GroupedBarChart extends Component{

    _wrap(text, width) {
        // used to wrap 'Yorkshire and the Humber' over two lines
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
        })
    }

    _summariseData(data){
        let store = [],
            regions = [],
            years = [],
            yearsInRegions = [];
        let max = Math.ceil(d3.max(data, (d) => d3.max(d.values, (dd) => dd.paid))/1000000) * 1000000;

        this.regions = data.map((r) => r.region)
        this.years = data[0].values.map((o) => o.year);
        this.chartData = data
        this.yMax = max;
    }

    _setSize(){
        let margin = this.props.margin;
        this.chartWidth = this._width - margin.l - margin.r;
        this.chartHeight = this._height - margin.t - margin.b;

        this._chartLayer
            .attr("width", this.chartWidth)
            .attr("height", this.chartHeight)
            .attr("transform", `translate(${margin.l}, ${margin.t})`);


        this.xScale.range([0, this.chartWidth]);
        this.xInScale.range([0, this.xScale.bandwidth()]);
        this.yScale.range([this.chartHeight, 0]);


    }

    addAxes(){
        let margin = this.props.margin;

        let yAxis = d3.axisLeft(this.yScale)
            .tickSizeInner(-this.chartWidth)
            .tickFormat(d3.formatPrefix(".0", 1e6));

        this._axisLayer.append("g")
            .attr("transform", `translate(${margin.l}, ${margin.t})`)
            .attr("class", "axis y")
            .call(yAxis);

        var yTicks = d3.selectAll(".axis.y > .tick > text");
        yTicks.nodes().forEach(function(t){
            t.innerHTML = `£${t.innerHTML}`
        });
        yTicks.style("font-family", "Oswald")
            .style("font-size","12px");

        this._axisLayer.append("text")
            .text("Total value of expense claims")
            .attr("x", 0 -(this.chartHeight / 2))
            .attr("y", margin.l /2 )
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .style("font-family", "Oswald")
            .style("font-size","20px")
            ;

        let xAxis = d3.axisBottom(this.xScale);

        this._axisLayer.append("g")
            .attr("class", "axis x")
            .attr("transform", `translate(${margin.l}, ${this.chartHeight + margin.t})`)
            .call(xAxis)
          .selectAll(".tick text")
            .call(this._wrap, this.xScale.bandwidth());

        this._axisLayer.append("text")
            .text("Region")
            .attr("transform",
                `translate(${(this._width + margin.l)/2}, ${this.chartHeight + margin.t + 50})`)
            .style("text-anchor", "middle")
            .style("font-family", "Oswald")
            .style("font-size","20px");

        d3.selectAll(".axis.x > .tick > text")
            .style("font-family", "Oswald")
            .style("font-size","12px")
            ;

    }




    setInteractions(){
        let colorScale = this.colors;
        let svg = this._svg;

        // SET OTHER BARS TO GREY WHEN MOUSEOVER
        // creates the hover interactions for the chart. Some of this might be redundant because I used it from a more complex version
        this.years.forEach(function(e, i){
            let className = `${e}`;
            svg.selectAll(`._${className}`)
                .on("mouseover", function(){
                    let innerClass = this.className.baseVal.split(" ")[1];

                    svg.selectAll(".bar")
                        .attr("fill", function(){
                            let currentClassName = this.className.baseVal.split(" ")[1];

                            if (currentClassName === innerClass){
                                return colorScale(innerClass);
                            }
                            else{
                                return "#d3d3d3";
                            }
                        });


                    svg.selectAll(`.legend-text`)
                        .style("fill", function(){
                            let currentClassName = this.className.baseVal.split(" ")[1];
                            if (currentClassName === innerClass){
                                return "black";
                            }
                            else{
                                return "#d3d3d3";
                            }
                        });
                    svg.selectAll(`.legend-box`)
                        .style("fill", function(){
                            let currentClassName = this.className.baseVal.split(" ")[1];

                            if (currentClassName === innerClass){
                                return colorScale(innerClass);
                            }
                            else{
                                return "#d3d3d3";
                            }
                        });
                })
                .on("mouseout", function(){
                    let innerClass = this.className.baseVal.split(" ")[1];
                    svg.selectAll(".bar")
                        .attr("fill", function(){
                                let currentClassName = this.className.baseVal.split(" ")[1];
                                return colorScale(currentClassName);
                            });
                    svg.selectAll(`.legend-text`)
                        .style("fill", "black");

                    svg.selectAll(".legend-box")
                        .style("fill", function(){
                                let currentClassName = this.className.baseVal.split(" ")[1];
                                return colorScale(currentClassName);
                            });
                })
            });
    }


    componentDidMount(){
        // Inital setup of graph svg here
        this._svg.style("width", "100%"); //I can reference that which was rendered using the same name
        this._svg.style("height", "100%");

        let {width, height} = this._svg._groups[0][0].getBoundingClientRect();
        this._width = width;
        this._height = height;

        this._svg.style("width", "100%"); //I can reference that which was rendered using the same name
        this._svg.style("height", "100%");

        this._axisLayer = this._svg.append("g").classed("axisLayer", true),
        this._chartLayer = this._svg.append("g").classed("chartLayer", true);

        // call setsize from within the componentDidMount
        this._summariseData(this.props.dataToChart);

        this.xScale = d3.scaleBand().domain(this.regions)
            .paddingInner(0.1)
            .paddingOuter(0.01);
        this.xInScale = d3.scaleBand().domain(this.years);
        this.yScale = d3.scaleLinear().domain([0, this.yMax]);

        this.colors = d3.scaleOrdinal()
            .range(["rgb(242,51,135)", "rgb(108,73,75)", "rgb(237,127,97)",
                    "rgb(215,5,13)", "rgb(144,45,84)", "rgb(164,62,3)"])
            .domain(this.years.map(function(y){return `_${y}`}))

        this._setSize();



        let colorScale = this.colors,
            xScale = this.xScale,
            xInScale = this.xInScale,
            yScale = this.yScale,
            chartHeight = this.chartHeight;


        let t = d3.transition()
            .duration(1000)
            .ease(d3.easeLinear);

        let outer = this._chartLayer.selectAll(".outer")
            .data(this.chartData);

        let inner = outer.enter().append("g").attr("class", 'region');

        outer.merge(inner)
            .attr("transform", function(d) { return "translate(" + [xScale(d['region']), 0] + ")"; });

        let bar = inner.selectAll(".bar")
            .data(function(d){ return d.values });

        let newBar = bar.enter().append("rect").attr("class", "bar")
        bar.merge(newBar)
            .attr("width", this.xInScale.bandwidth())
            .attr("height", 0)
            .attr("fill", function(d) {return colorScale(`_${d['year']}`); })
            .attr("opacity", 0.8)
            .attr("class", function(d) { return `bar _${d['year']}`;})
            .attr("transform", function(d) { return "translate(" + [xInScale(d['year']), chartHeight] + ")" });

        bar.merge(newBar).transition(t)
            .attr("height", function(d) {  return chartHeight - yScale(d.paid); })
            .attr("transform", function(d) { return "translate(" + [xInScale(d['year']), yScale(d.paid)] + ")" });

        // creating the legend scale
        let legendY = d3.scaleBand().domain(this.years).range([10, 130]);

        // creating the legend container
        let legend = this._chartLayer.append("g")
            .style("transform", "translate(50, 30")
            .attr("class", "legend");

        // adding the boxes to the legend, matching the classes to the bars so we can highlight both at once
        legend.selectAll(".box")
            .data(this.years)
          .enter().append("rect")
            .attr("width", 8)
            .attr("height", 8)
            .attr("class", function(d){return `legend-box _${d}`})
            .attr("fill", function(d) { return colorScale(d); })
            .attr("transform",function(d){return `translate(20,${legendY(d)})`});

        // adding the legend labels
        legend.selectAll("text")
            .data(this.years)
          .enter().append("text")
            .attr("transform", function(d){return `translate(32,${legendY(d)})`})
            .text(function(d){return d;})
            .attr("text-anchor", "left")
            .attr("dy", "0.7em")
            .attr("class", function(d){return `legend-text _${d}`})
            .style("font-family", "Oswald")
            .style("font-size","12px")
            ;

        this.setInteractions();
        this.addAxes();
    }


    render(){
        // d3 update functions go here, but don't conflict the two



        // Returns things which go into the DOM
        return (
            <div className = "yearsInRegions">
                <svg ref={ (c) => this._svg = d3.select(c) } />
            </div>
        )
    }

}










export default GroupedBarChart;


