import React, { Component, PureComponent } from 'react';

import axios from 'axios';
import URLSearchParams from '@ungap/url-search-params'; //URLSearchParams polyfill
import {css, jsx} from '@emotion/react';
import BounceLoader from 'react-spinners/BounceLoader';
import { requestFieldInfo, constructFieldInfoRequestUrl } from './FieldInfo';
import Modal from './Modal';
import Config from './Config';
import MapView from './MapView';
import Sidebar from './Sidebar';
import execute_sql from './Sql';
import {findWithAttr} from './Util';


import './App.css';


class App extends PureComponent {
  static whyDidYouRender = true;
  constructor(props) {
    super(props);
    //DELETE//axios.defaults.headers.post['Content-Type'] = 'application/json';
    //DELETE this.carto_user = Config.carto_user;
    //DELETEthis.carto_table = Config.carto_table;
    //DELETEthis.carto_table_fields = Config.carto_table_fields;
    //DELETEthis.carto_base_api = Config.carto_base_api;
    //DELETEthis.query_url = Config.carto_base_api.replace("{{username}}", Config.carto_user);
    this.spinner_css = css`{
      position:absolute;
      top:50%;
      left:50%;
      z-index:1000000;
    }`;
    this.state = { "search_results": [],
                   "base_features": [],
                   "pinned_features": [],
                   "modalIsOpen": false,
                   "modalType": "Item",
                   "hover_feature": false,
                   "showSpinner": false,
                  "collection_field_info": {}
                
    };
    //DELETEthis.execute_sql = execute_sql.bind(this);
    this.executeSpatialSearch = this.executeSpatialSearch.bind(this);
    this.updateSearchResults = this.updateSearchResults.bind(this);

    this.onItemMouseOver = this.onItemMouseOver.bind(this);
    this.onItemMouseOut = this.onItemMouseOut.bind(this);

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleSpinner = this.toggleSpinner.bind(this);
    this.handleItemPinning = this.handleItemPinning.bind(this);

  }


  openModal(modalType, modalContent){
    console.log("App::openModal");
    this.setState({
      modalInfo: {modalType: modalType,
                  modalContent: modalContent,
                  modalId: modalContent.Identifier,
                  modalCollection: modalContent["Reference URL"].split("/")[6],
                  modalCollectionId: modalContent["Reference URL"].split("/")[8]
                }
    });
    this.toggleModal(true);
  }

  closeModal(modalType, modalContent){
    console.log("App::closeModal");
    this.setState({
      modalType: modalType,
      modalContent: ""
    });
    this.toggleModal(false);
  }

  updateSearchResults(results) {
    console.log("App::updateSearchResults", results);
    this.setState({search_results: results.data});
  }

  executeSpatialSearch(query, results){
    console.log("App::executeSpatialSearch");
    //DELETE   // if (query){
    //DELETE//   this.setState({showSpinner: true});
    
    //   let that = this;
    //   this.execute_sql(query, function(response){
    //     that.setState({search_results: response.data.features});
    //   });
    // }

    if (results) {
      this.setState({showSpinner: true});
      this.setState({search_results: results});
    }
    
    this.setState({showSpinner: false});
  }
  
  onItemMouseOver(featureGeom) {
    if (featureGeom !== this.state.hover_feature){
      this.setState({hover_feature: featureGeom});
    }
        }  

  onItemMouseOut() {
    this.setState({hover_feature: false});
  }



  componentDidUpdate(prevProps, prevState){
    //console.log("App DidUpdate");
    console.log("componentDidUpdate: ", prevState);
  }

  componentDidMount(prevProps, prevState){
    //console.log("App DidMount");
    //this.executeSpatialSearch();
    let colls = Config.collections;
    let that = this;
    colls.forEach((v, i) => {
      var u = constructFieldInfoRequestUrl(v);
      requestFieldInfo(u).then(
        (r) => {
          //console.log("requestFieldInfo:", r);
          let current_collection_info = that.state.collection_field_info;
          current_collection_info[v] = r.data
          that.setState({collection_field_info: current_collection_info});
        } 
      )
    });
    //constructFieldInfoRequestUrl
  }

  handleItemPinning(item){
      console.log("Pinned: ", item);
      let state = this.state;
      let new_state = {"search_results": this.state.search_results};
      
      //search for item within currently pinned features
      let lookForIt = findWithAttr(this.state.pinned_features, 'id', item.id);
      console.log("lookForIt:",lookForIt);

      //search for item in 
      let lookAgain = findWithAttr(state.search_results, 'id', item.id);
      console.log("lookAgain:", lookAgain);
      
      new_state.pinned_features = state.pinned_features;
        
      if (lookForIt >= 0) {
        new_state.pinned_features.splice(lookForIt, 1);  
        new_state.search_results[lookAgain].isPinned = false;
              }
      else if (lookForIt === -1 ) {
        new_state.pinned_features.push(item);
        //debugger;
        new_state.search_results[lookAgain].isPinned = true;
        
      }

      this.setState(new_state);
  }

  toggleSpinner(bool) {
    this.setState({"showSpinner": bool});
  }

  toggleModal(bool) {
    this.setState({"modalIsOpen": bool});
  }

  render() {
    const search_results = this.state.search_results;
    const pinned_features = this.state.pinned_features;
    const hover_feature = this.state.hover_feature;
    const modalInfo = this.state.modalInfo;

    return (
      <>
      <div id='modalRoot'></div>
      <div className="App">
        
      <Modal isOpen={this.state.modalIsOpen} 
            toggleSpinner={this.toggleSpinner} 
            openModal={this.openModal}
            closeModal={this.closeModal}
            modalInfo={modalInfo}
            />       

        <header className="App-header">
         <h1>mapsOK</h1>
        </header>

        <BounceLoader 
          css={this.spinner_css} 
          loading={this.state.showSpinner} 
          color={"#ff6600"}/>

         <Sidebar 
           search_results={search_results} 
           updateSearchResults={this.updateSearchResults}
           onItemMouseOver={this.onItemMouseOver} 
           onItemMouseOut={this.onItemMouseOut} 
           openModal={this.openModal} 
           handleItemPinning={this.handleItemPinning}
           pinned_features={this.state.pinned_features}
           />
        <section className="App-map">
          <MapView 
            hover_feature={hover_feature} 
            search_results={search_results} 
            pinned_features={pinned_features}
            openModal={this.openModal} 
            executeSpatialSearch={this.executeSpatialSearch} />  
        </section>
      </div>
      </>
    );
  }
}

export default App;
