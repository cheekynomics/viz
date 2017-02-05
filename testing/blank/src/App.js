import React, { Component } from 'react';
import GroupedBarChart from './GroupedBar'
import * as d3 from 'd3';
import logo from './logo.svg';
import './App.css';
import * as expenses from './NestedExpenses.json';

//TODO: Figure out proper loading
delete expenses.default;
let listified = [];
Object.keys(expenses).forEach((k) => listified.push(expenses[k]));

class App extends Component {
  render() {
    return (
      <div className="mapView">
        <GroupedBarChart dataToChart={listified} margin={{l : 100,
                                  t : 20,
                                  b : 70,
                                  r : 20}}/>
      </div>
    );
  }
}

export default App;
