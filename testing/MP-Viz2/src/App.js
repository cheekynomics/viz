import React, { Component } from 'react';
import GroupedBarChart from './GroupedBar'
import * as d3 from 'd3';
import './App.css';
import * as expenses from './SummariesByRegionAndYear.json';   


class App extends Component {
  render() {
    return (
      <div className="mapView">
        <GroupedBarChart margin={{l : 100,
                                  t : 20,
                                  b : 70,
                                  r : 20}}
                          data = {expenses}/>
      </div>
    );
  }
}

export default App;
