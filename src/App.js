import React, { Component } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import URLSearchParams from '@ungap/url-search-params'; //URLSearchParams polyfill
import {css, jsx} from '@emotion/core';
import BounceLoader from 'react-spinners/BounceLoader';

import Config from './Config';
import MapView from './MapView';
import Sidebar from './Sidebar';
import './App.css';

Modal.setAppElement('#root');

class App extends Component {
  constructor(props) {
    super(props);
    //axios.defaults.headers.post['Content-Type'] = 'application/json';
    this.carto_user = Config.carto_user;
    this.carto_table = Config.carto_table;
    this.carto_table_fields = Config.carto_table_fields;
    this.carto_base_api = Config.carto_base_api;
    this.query_url = Config.carto_base_api.replace("{{username}}", Config.carto_user);
    this.manifest_url = Config.manifest_url;
    this.spinner_css = css`{
      position:absolute;
      top:50%;
      left:50%;
      z-index:1000000;
    }`;
    this.state = { "search_results": [],
                   "base_features": [], 
                   "modalIsOpen": false, 
                   "hover_feature": false,
                   "showSpinner": false
                };
    this.execute_sql = this.execute_sql.bind(this);
    this.executeSpatialSearch = this.executeSpatialSearch.bind(this);
    this.constructManifestUrl = this.constructManifestUrl.bind(this);
    this.iiifRequestManifest = this.iiifRequestManifest.bind(this);

    this.onItemMouseOver = this.onItemMouseOver.bind(this);
    this.onItemMouseOut = this.onItemMouseOut.bind(this);
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
    this.setState({showSpinner: true});
    this.execute_sql(query, function(response){
      that.setState({search_results: response.data.features});
    });
    this.setState({showSpinner: false});
  }

  iiifRequestManifest(url){
    return axios.get(url);
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

  constructManifestUrl(featureProps) {
    let cdm_num = featureProps.contentdm_number;
    let cdm_coll = featureProps.cdm_collection;
    let iiifManifestUrl = this.manifest_url
                                  .replace("{{contentdm_number}}", cdm_num)
                                  .replace("{{cdm_collection}}", cdm_coll);
    return iiifManifestUrl;
  }

  openModal(modalType, modalContent) {
    let content;
    let that = this;

    switch (modalType) {
      case "Item":
        let url = this.constructManifestUrl(modalContent);
        this.setState({showSpinner: true});
        let manifestContent = this.iiifRequestManifest(url)
          .then(function(response){
            let metadata = response.data.metadata;
            content = metadata.map(function(a){
              return  <div className="metadataKeyValuePair">
                        <h4>{a.label}</h4>
                        <p>{a.value}</p>
                      </div>
                });
            that.setState({
              modalContent: content,
              modalIsOpen: true,
              showSpinner: false
            });
          })
        break;

      default:
        console.log("I need a modalType buddy.");
    }
    
    
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.

  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  onItemMouseOver(featureGeom) {
    this.setState({hover_feature: featureGeom});
  }  

  onItemMouseOut() {
    this.setState({hover_feature: false});
  }

componentWillMount() {
    console.log("App WillMount");
  }  

  componentWillUnmount() {
    console.log("App WillUnmount");
  }

  componentWillReceiveProps(nextProps) {
  }

  
  componentWillUpdate(){
    console.log("App WillUpdate");
  }

  componentDidUpdate(prevProps, prevState){
    console.log("App DidUpdate");
    // if (this.props.base_features.length !== prevProps.base_features.length) {
    //   let geojson = this.geojsonRef.current.leafletElement;
    //   geojson.addData(this.props.base_features)
    // }

  }

  componentDidMount(prevProps, prevState){
    console.log("App DidMount");
    //this.assymmetricPad();
    //const map = this.refs.map.leafletElement
  }




  render() {
    const base_features = this.state.base_features;
    const search_results = this.state.search_results;
    const hover_feature = this.state.hover_feature;

    return (
      <div className="App">
        <header className="App-header">
         <h1>mapsOK</h1>
        </header>
        <BounceLoader 
          css={this.spinner_css} 
          loading={this.state.showSpinner} 
          color={"#ff6600"}/>
        <Modal
          className="Modal-Content"
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          contentLabel="Example Modal">
          {this.state.modalContent}
        </Modal>
         <Sidebar 
           search_results={search_results} 
           onItemMouseOver={this.onItemMouseOver} 
           onItemMouseOut={this.onItemMouseOut} 
           openModal={this.openModal} />
        <section className="App-map">
          <MapView 
            hover_feature={hover_feature} 
            base_features={base_features} 
            search_results={search_results} 
            executeSpatialSearch={this.executeSpatialSearch} />  
        </section>
      </div>
    );
  }
}

export default App;
