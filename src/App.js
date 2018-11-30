import React, { Component } from 'react';
import logo from './logo.svg';
import MapView from './MapView';
import './App.css';


class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
         <h1>header</h1>
        </header>
        <section className="App-sidebar">
          <h1>sidebar</h1>
          <div className="text-search"></div>

         {/* <div className="foo"></div>
          <div className="foo"></div>
          <div className="foo"></div>
          <div className="foo"></div>
          <div className="foo"></div>
          <div className="foo"></div>
          <div className="foo"></div>
          <div className="foo"></div>
          <div className="foo"></div>
          <div className="foo"></div>
          <div className="foo"></div>*/}
        
        </section>
        <section className="App-map">
          <MapView mapCenter={this.mapCenter}/>  
        </section>
      </div>
    );
  }
}

export default App;
