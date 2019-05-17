import React, { Component } from 'react';
import Config from './Config';
import MapView from './MapView';
import axios from 'axios';
import URLSearchParams from '@ungap/url-search-params' //URLSearchParams polyfill
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    //axios.defaults.headers.post['Content-Type'] = 'application/json';
    this.carto_user = Config.carto_user;
    this.carto_table = Config.carto_table;
    this.carto_table_fields = Config.carto_table_fields;
    this.carto_base_api = Config.carto_base_api;
    this.query_url = Config.carto_base_api.replace("{{username}}", Config.carto_user);
    this.state = { "search_results": [], "base_features": [] };
    this.execute_sql = this.execute_sql.bind(this);
    //this.execute_sql();
    this.initialize_query();
  }


  initialize_query(){
    let fields = this.carto_table_fields.join(", ");
    let query = `SELECT ${fields} from ${this.carto_table}`;
    console.log(query);
    let that = this;
    let callback = function(response) {
      
      that.setState({"base_features": response.data.features});
    }
    this.execute_sql(query, callback);
  }


  execute_sql(query, callback, format){
    
    //just for testing////
    //query = "SELECT title FROM okmaps2 LIMIT 10";
    //format = "json";
    if (!callback) {
      callback = function(data){console.log(data)}
    };
    //////////////////////

    var format_str = '';
    if (format){
        format_str = format;
    }
    else {
        format_str = "geojson";
    }

    const params = new URLSearchParams();
    params.append("q", query);
    params.append("format", format_str);

    return (axios.post(this.query_url, params,
        {
          transformRequest: [function(data, headers) { 
              delete headers.common['Content-Type'];
              return data; 
          }]
        }
      )
        .then(callback)
        //.then()
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
