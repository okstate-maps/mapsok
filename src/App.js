import React, { Component } from 'react';
import Config from './Config';
import MapView from './MapView';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.carto_user = Config.carto_user;
    this.carto_table = Config.carto_table;
    this.carto_table_fields = Config.carto_table_fields;
    this.carto_base_api = Config.carto_base_api;
    this.execute_sql = this.execute_sql.bind(this);
    this.query_url = Config.carto_base_api.replace("{{username}}", Config.carto_user);
    this.state = { "search_results": [] };
  }

  execute_sql(query, callback, format){
    var format_str = '';
    if (format){
        format_str = format;
    }
    else {
        format_str = "geojson";
    }
    return (axios.post(this.carto_base_api, {
        data: {
          format: format_str,
          q: query
        },
        type: "POST",
      })
        .then(callback)
        .catch(function (error){
          console.log(error);
      })
    )
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
         <h1>header</h1>
        </header>
        <section className="App-sidebar">
          <h1>sidebar</h1>
          <div className="flexlist">
            <div className="foo"></div>
            <div className="foo"></div>
            <div className="foo"></div>
            <div className="foo"></div>
            <div className="foo"></div>
            <div className="foo"></div>
            <div className="foo"></div>
          </div>
        </section>
        <section className="App-map">
          <MapView />  
        </section>
      </div>
    );
  }
}

export default App;
