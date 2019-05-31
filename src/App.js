import React, { Component } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import URLSearchParams from '@ungap/url-search-params' //URLSearchParams polyfill
import Config from './Config';
import MapView from './MapView';
import Sidebar from './Sidebar';
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
    this.state = { "search_results": [], "base_features": [], "modalIsOpen": false };
    this.execute_sql = this.execute_sql.bind(this);
    this.executeSpatialSearch = this.executeSpatialSearch.bind(this);

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

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

  executeSpatialSearch(query){
    console.log("App.executeSpatialSearch");
    let that = this;
    this.execute_sql(query, function(response){
      that.setState({search_results: response.data.features});
    });
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

        .catch(function (error){
          console.log(error);
      })
    )
  }


  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.

  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }


  render() {
    const base_features = this.state.base_features;
    const search_results = this.state.search_results;
    const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)',
    }
    };

    return (
      <div className="App">
        <header className="App-header">
         <h1>header</h1>
        </header>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
        <h1>hi</h1>
        </Modal>
         <Sidebar search_results={search_results} openModal={this.openModal} />
        <section className="App-map">
          <MapView base_features={base_features} search_results={search_results} executeSpatialSearch={this.executeSpatialSearch} />  
        </section>
      </div>
    );
  }
}

export default App;
