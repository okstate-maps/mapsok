import React, { PureComponent } from 'react';
//import {css, jsx} from '@emotion/react';
import BounceLoader from 'react-spinners/BounceLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap } from '@fortawesome/free-solid-svg-icons';
import { requestFieldInfo, 
         constructFieldInfoRequestUrl } from './FieldInfo';
import Modal from './Modal';
import Config from './Config';
import MapView from './MapView';
import Sidebar from './Sidebar';
import {findWithAttr} from './Util';
import './App.css';
import { GeojsonContext } from './Contexts';
import * as geojson from './data_mcc_okmaps.json';



class App extends PureComponent {
  //static whyDidYouRender = true;
  constructor(props) {
    super(props);
    this.spinner_css = {
      "position":"absolute",
      "top":"50%",
      "left":"50%",
      "zIndex":"1000000",
      "padding":"10px"
    };
    this.state = { "search_results": [],
                   "base_features": [],
                   "pinned_features": [],
                   "modalIsOpen": false,
                   "modalType": "Item",
                   "hover_feature": false,
                   "showSpinner": false,
                  "collection_field_info": {} 
                 };
    this.executeSpatialSearch = this.executeSpatialSearch.bind(this);
    this.updateSearchResults = this.updateSearchResults.bind(this);

    this.onItemMouseOver = this.onItemMouseOver.bind(this);
    this.onItemMouseOut = this.onItemMouseOut.bind(this);

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleResetSidebar = this.toggleResetSidebar.bind(this);
    this.toggleSpinner = this.toggleSpinner.bind(this);
    this.handleItemPinning = this.handleItemPinning.bind(this);
  }


  openModal(modalContent){
    console.log("App::openModal");
    this.setState({
      modalInfo: {
                  modalCollection: modalContent["cdmco"],
                  modalCollectionId: modalContent["cdmn"]
                }
    });
    this.toggleModal(true);
  }

  closeModal(){
    console.log("App::closeModal");
    this.setState({
      modalContent: ""
    });
    this.toggleModal(false);
  }

  updateSearchResults(results) {
    console.log("App::updateSearchResults", results);
    this.setState({search_results: results.data});
  }

  toggleResetSidebar(bool){
    console.log("toggleResetSidebar::" + bool);
    this.setState({reset_sidebar: bool});
  }
  executeSpatialSearch(results){
    console.log("App::executeSpatialSearch");
    console.log(results);

    if (results) {
      this.setState({showSpinner: true});
      this.setState({search_results: results});
      this.setState({reset_sidebar: true});
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
    //console.log("componentDidUpdate: ", prevState);
  }

  componentDidMount(prevProps, prevState){
    console.log("App::DidMount");
    let colls = Config.collections;
    let that = this;

    colls.forEach((collection, i) => {
      var url = constructFieldInfoRequestUrl(collection);
      requestFieldInfo(url).then(
        (response) => {
          let current_collection_info = that.state.collection_field_info;
          let fields = response.data;
          current_collection_info[collection] = {};
          fields.forEach((field, index) => {
              //console.log(field.name);
              current_collection_info[collection][field.name] = field;
              current_collection_info[collection][field.name]["index"] = index;  
          })
          //console.log(current_collection_info);
          that.setState({collection_field_info: current_collection_info});
        } 
      )
    });
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
    const collection_field_info = this.state.collection_field_info;

    return (
      //<GeojsonContext.Provider value={geojson}>
      <>
        <div id='modalRoot'></div>
        <div className="App">
          
        <Modal isOpen={this.state.modalIsOpen} 
              toggleSpinner={this.toggleSpinner} 
              openModal={this.openModal}
              closeModal={this.closeModal}
              modalInfo={modalInfo}
              collectionFieldInfo={collection_field_info}
              />       

          <header className="App-header">
          <h1>
              <FontAwesomeIcon icon={faMap} size="xl"/>
                &nbsp;&nbsp;&nbsp;mapsOK&nbsp;&nbsp;&nbsp;
              <FontAwesomeIcon icon={faMap} size="xl"/>
            </h1>
          </header>

          <BounceLoader 
            cssOverride={this.spinner_css}
            loading={this.state.showSpinner} 
            color={"#ff6600"}/>
            <Sidebar 
              search_results={search_results} 
              geojson={geojson}
              updateSearchResults={this.updateSearchResults}
              onItemMouseOver={this.onItemMouseOver} 
              onItemMouseOut={this.onItemMouseOut} 
              openModal={this.openModal} 
              handleItemPinning={this.handleItemPinning}
              pinned_features={this.state.pinned_features}
              reset_sidebar={this.state.reset_sidebar}
              toggleResetSidebar={this.toggleResetSidebar}
              />
          <section className="App-map">
                <MapView 
                  hover_feature={hover_feature} 
                  search_results={search_results} 
                  pinned_features={pinned_features}
                  geojson={geojson}
                  openModal={this.openModal} 
                  executeSpatialSearch={this.executeSpatialSearch}
                  toggleResetSidebar={this.toggleResetSidebar}
                  />  
          </section>
        </div>
        </>
      //</GeojsonContext.Provider>
    );
  }
}

export default App;
