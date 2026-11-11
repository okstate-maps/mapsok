'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
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
import { GeojsonContext } from './Contexts';
import * as geojson from './data_mcc_okmaps.json';



const spinnerCss = {
  position: "absolute",
  top: "50%",
  left: "50%",
  zIndex: "1000000",
  padding: "10px"
};

function App() {
  const [state, setState] = useState({
    search_results: [],
    base_features: [],
    pinned_features: [],
    modalIsOpen: false,
    modalType: "Item",
    hover_feature: false,
    showSpinner: false,
    collection_field_info: {}
  });

  const openModal = useCallback((modalContent) => {
    console.log("App::openModal");
    setState((current) => ({
      ...current,
      modalInfo: {
        modalCollection: modalContent["cdmco"],
        modalCollectionId: modalContent["cdmn"]
      },
      modalIsOpen: true
    }));
  }, []);

  const closeModal = useCallback(() => {
    console.log("App::closeModal");
    setState((current) => ({
      ...current,
      modalContent: "",
      modalIsOpen: false
    }));
  }, []);

  const updateSearchResults = useCallback((results) => {
    console.log("App::updateSearchResults", results);
    setState((current) => ({ ...current, search_results: results.data }));
  }, []);

  const toggleResetSidebar = useCallback((bool) => {
    console.log("toggleResetSidebar::" + bool);
    setState((current) => ({ ...current, reset_sidebar: bool }));
  }, []);

  const executeSpatialSearch = useCallback((results) => {
    console.log("App::executeSpatialSearch");
    console.log(results);
    if (results) {
      setState((current) => ({
        ...current,
        showSpinner: true,
        search_results: results,
        reset_sidebar: true
      }));
    }
    setState((current) => ({ ...current, showSpinner: false }));
  }, []);
  
  const onItemMouseOver = useCallback((featureGeom) => {
    setState((current) => (
      featureGeom !== current.hover_feature
        ? { ...current, hover_feature: featureGeom }
        : current
    ));
  }, []);

  const onItemMouseOut = useCallback(() => {
    setState((current) => ({ ...current, hover_feature: false }));
  }, []);

  useEffect(() => {
    console.log("App::DidMount");
    Config.collections.forEach((collection) => {
      const url = constructFieldInfoRequestUrl(collection);
      requestFieldInfo(url).then((response) => {
        setState((current) => {
          const currentCollectionInfo = { ...current.collection_field_info };
          currentCollectionInfo[collection] = {};
          response.data.forEach((field, index) => {
            currentCollectionInfo[collection][field.name] = {
              ...field,
              index
            };
          });
          return {
            ...current,
            collection_field_info: currentCollectionInfo
          };
        });
      });
    });
  }, []);

  const handleItemPinning = useCallback((item) => {
    console.log("Pinned: ", item);
    setState((current) => {
      const pinnedFeatures = [...current.pinned_features];
      const searchResults = current.search_results.map((feature) => ({ ...feature }));
      const lookForIt = findWithAttr(pinnedFeatures, 'id', item.id);
      const lookAgain = findWithAttr(searchResults, 'id', item.id);

      if (lookForIt >= 0) {
        pinnedFeatures.splice(lookForIt, 1);
        if (lookAgain >= 0) {
          searchResults[lookAgain].isPinned = false;
        }
      } else if (lookForIt === -1) {
        pinnedFeatures.push(item);
        if (lookAgain >= 0) {
          searchResults[lookAgain].isPinned = true;
        }
      }

      return {
        ...current,
        pinned_features: pinnedFeatures,
        search_results: searchResults
      };
    });
  }, []);

  const toggleSpinner = useCallback((bool) => {
    setState((current) => ({ ...current, showSpinner: bool }));
  }, []);

  const search_results = state.search_results;
  const pinned_features = state.pinned_features;
  const hover_feature = state.hover_feature;
  const modalInfo = state.modalInfo;
  const collection_field_info = state.collection_field_info;

  return (
    <>
      <div id='modalRoot'></div>
      <div className="App">
        <Modal
          isOpen={state.modalIsOpen}
          toggleSpinner={toggleSpinner}
          openModal={openModal}
          closeModal={closeModal}
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
          cssOverride={spinnerCss}
          loading={state.showSpinner}
          color={"#ff6600"}/>
        <Sidebar
          search_results={search_results}
          geojson={geojson}
          updateSearchResults={updateSearchResults}
          onItemMouseOver={onItemMouseOver}
          onItemMouseOut={onItemMouseOut}
          openModal={openModal}
          handleItemPinning={handleItemPinning}
          pinned_features={state.pinned_features}
          reset_sidebar={state.reset_sidebar}
          toggleResetSidebar={toggleResetSidebar}
        />
        <section className="App-map">
          <MapView
            hover_feature={hover_feature}
            search_results={search_results}
            pinned_features={pinned_features}
            geojson={geojson}
            openModal={openModal}
            executeSpatialSearch={executeSpatialSearch}
            toggleResetSidebar={toggleResetSidebar}
          />
        </section>
      </div>
    </>
  );
}

export default memo(App);
