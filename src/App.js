import React, { Component } from 'react';

import axios from 'axios';
import URLSearchParams from '@ungap/url-search-params'; //URLSearchParams polyfill
import {css, jsx} from '@emotion/core';
import BounceLoader from 'react-spinners/BounceLoader';

import Config from './Config';
import MapView from './MapView';
import Sidebar from './Sidebar';
import execute_sql from './Sql';


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
    this.execute_sql = execute_sql.bind(this);
    this.executeSpatialSearch = this.executeSpatialSearch.bind(this);

    this.onItemMouseOver = this.onItemMouseOver.bind(this);
    this.onItemMouseOut = this.onItemMouseOut.bind(this);

    this.openModal = this.openModal.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleSpinner = this.toggleSpinner.bind(this);

  }

  openModal(modalType, modalContent){
    
    this.setState({
      modalType: modalType,
      modalContent: modalContent
    });
    this.toggleModal(true);
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
  
  onItemMouseOver(featureGeom) {
    this.setState({hover_feature: featureGeom});
  }  

  onItemMouseOut() {
    this.setState({hover_feature: false});
  }

  componentWillMount() {
    //console.log("App WillMount");
  }  

  componentWillUnmount() {
    //console.log("App WillUnmount");
  }


  componentDidUpdate(prevProps, prevState){
    //console.log("App DidUpdate");
  }

  componentDidMount(prevProps, prevState){
    //console.log("App DidMount");
  }

  toggleSpinner(bool) {
    this.setState({"showSpinner": bool});
  }

  toggleModal(bool) {
    this.setState({"modalIsOpen": bool});
  }

  render() {
    const search_results = this.state.search_results;
    const hover_feature = this.state.hover_feature;
    const modalType = this.state.modalType;
    const modalContent = this.state.modalContent;

    return (
      <div className="App">
        <header className="App-header">
         <h1>mapsOK</h1>
        </header>
        <BounceLoader 
          css={this.spinner_css} 
          loading={this.state.showSpinner} 
          color={"#ff6600"}/>
        <Modal isOpen={this.state.modalIsOpen} 
              toggleSpinner={this.toggleSpinner} 
              openModal={this.openModal}
              modalContent={modalContent}
              modalType={modalType}
              />
         <Sidebar 
           search_results={search_results} 
           onItemMouseOver={this.onItemMouseOver} 
           onItemMouseOut={this.onItemMouseOut} 
           openModal={this.openModal} />
        <section className="App-map">
          <MapView 
            hover_feature={hover_feature} 
            search_results={search_results} 
            executeSpatialSearch={this.executeSpatialSearch} />  
        </section>
      </div>
    );
  }
}

export default App;
