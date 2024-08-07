import React, { createRef, Component, useState, 
                createContext, useContext, useRef, 
                useEffect, useCallback, memo } from 'react';
import Config from './Config';
import axios from 'axios';
import L from 'leaflet'; //
import './leaflet.css';
import './leaflet.draw.css';

import {
  MapContainer, 
  LayersControl,
  GeoJSON,
  Rectangle,
  FeatureGroup,
  Popup,
  useMap,
  useMapEvents
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import Control from './Control.tsx';
import { DynamicMapLayer } from 'react-esri-leaflet';
import VectorBasemapLayer from 'react-esri-leaflet/plugins/VectorBasemapLayer';
import VectorTileLayer from 'react-esri-leaflet/plugins/VectorTileLayer';
import './MapView.css';
import { GeojsonContext, SearchContext } from './Contexts';
import MapSearch from './MapSearch';
import { nanoid } from 'nanoid';
import _ from 'lodash';


//const { Map, TileLayer, Marker, Popup } = ReactLeaflet
const templater = function(strings, ...keys) {}

const DrawComponent = memo(function DrawComponent(props) {
  const map = useMap();

  const context = useContext(GeojsonContext);
  //console.log("DrawComponent::GeojsonContext", geojson);
  
  const [enabled, setEnabled] = useState(true);
  //const [geojson, setGeojson] = useState(props.geojsonStuff);
  //console.log(props.geojsonStuff);

  let drawOptions;
  if (enabled) {
    drawOptions = {
      polyline: false,
      circle: false,
      marker: false,
      circlemarker: false,
      polygon:false,
      rectangle: {
          shapeOptions: {
            clickable: false,
            color: '#8e8e8e'
          }
      }
    }
  }
  else {
    drawOptions = {
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false,
        polygon:false,
        rectangle: false
      }
  }

  function onCreated(rect){
    context.toggleDrawnSearch(true);
    context.onMoveEnd(rect.layer._bounds, context.geojsonState);
    setEnabled(false);
  }

  function onDeleted(rect){
    context.toggleDrawnSearch(false);
    setEnabled(true);
  }

  let feature_group =  <FeatureGroup>
      <EditControl
        position='topright'
        //onEdited={console.log("onEdited")}
        onCreated={onCreated}
        onDeleted={onDeleted}
        draw={drawOptions}
      />
    </FeatureGroup>

  return feature_group
   
});


function MapEvents(props) {
  const map = useMap();
  const context = useContext(GeojsonContext);
  const searchContext = useContext(SearchContext);
  //console.log("MapEvents::GeojsonContext", context);
  //console.log("MapEvents::SearchContext", searchContext);
  
  const mapEvents = useMapEvents({
    drag: () => {
      if (context.drawnSearchBox === true) {return} 
      let b = context.assymmetricPad(map.getBounds());
      context.useRectangleBounds(b);
    },
    dragstart: () => {
      if (context.drawnSearchBox === true) {return} 
      console.log("drag start");
      context.toggleRectangleVis(true);
    },
    dragend: () => {
      if (context.drawnSearchBox === true) {return} 
      console.log("drag end");
      context.toggleRectangleVis(false);
    },
    moveend: () => {
      if (context.drawnSearchBox === true) {return} 
      console.log("move end");
      context.onMoveEnd(context.assymmetricPad(map.getBounds()), context.geojsonState);
      //searchContext.resetSidebar();
      //console.log(searchContext);
    }
  })
  return null
}



function ToggleSearchControl({toggleRedoSearchOnMapMove}){
  //debugger;
  const onChange = (e) => {
    let bool = e.target.checked;
    toggleRedoSearchOnMapMove(bool);
  };
  
  return <label><input onChange={onChange} defaultChecked={true} type="checkbox"></input>Redo search when map moves</label>;
}
function MapView(props) {
  
    //super(props)
    //this.OFFSET = 0;
   // const OFFSET = 0;

    //this.PER_PAGE = 10;
    //const PER_PAGE = 10;

    const [redoSearchOnMapMove, setRedoSearchOnMapMove] = useState(true);
    const [isRectangleShowing, setIsRectangleShowing] = useState(false);
    const [drawnSearchBox, setDrawnSearchBox] = useState(false);
    //const [geojsonState, setGeojson] = useState({geojson});
    //const [isRectangleShowing, setIsRectangleShowing] = useState(false);
    
    // this.state = {isRectangleShowing: false,
    //               drawnSearchBox: false,
    //               geojsonStuff: false,
    //               geojsonFile: false}
    
    const DEFAULT_BOUNDS = [
        [
          "-104.15039062500001",
          "32.775093787592226"
        ],
        [
          "-93.07617187500001",
          "37.49016029761671"
        ]
      ];

    const rectangle_bounds = DEFAULT_BOUNDS;
    const DEFAULT_VIEWPORT = {
      center: [36.1156, -97.0584],
      zoom: 13
    }
    
    //const viewport = DEFAULT_VIEWPORT;
    //const retina = L.Browser.retina ? "@2x": "";
    const rectangleStyleColor = "#8e8e8e";
    const rectangleStyleWeight = 1;
    
    const ok_counties = "https://vectortileservices1.arcgis.com/jWQlP64OuwDh6GGX/arcgis/rest/services/ok_counties_v/VectorTileServer";
    const esri_plss = "https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer";
   
    //create object refs to access Leafler internals
    //const mapRef = useRef();
    const rectangleRef = useRef();
    //const geojsonRef = useRef();

    // const getData = useCallback(async () => {
    //   try {
    //     const result = await import('./data_mcc_okmaps.json');
    //     setGeojson(result);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }, []);
  
    // useEffect(() => {
    //   window.addEventListener('load', () => {
    //     getData().then(() => console.log('data loaded successfully'));
    //   });
  
    //   return () => {
    //     window.removeEventListener('load', () => {
    //       console.log('page unmounted');
    //     });
    //   };
    // }, [getData]);

  const toggleRedoSearchOnMapMove = (bool) => {
    setRedoSearchOnMapMove(bool);
  }
    
 
  const bboxStringToArray = (bbox_str) => {
    var a = bbox_str.split(",");
    return [[a[1], a[0]], [a[3], a[2]]];
  } 

  const bboxStringToWKT= (bbox_str) => {
    var bb = bbox_str.split(",");
    return "POLYGON((" + bb[0] + " " + bb[1] + "," + bb[0] + " " + bb[3]+
     "," + bb[2] + " " + bb[3]+ "," + bb[2] + " " + bb[1] +
     "," + bb[0] + " " + bb[1] + "))";
  };



  const assymmetricPad = (bounds) => {
    //let bounds = map.leafletElement.getBounds();
    let sw = bounds._southWest,
        ne = bounds._northEast,
        hbr = -0.2,
        wbr = -0.1,
        heightBuffer,
        widthBuffer;

    heightBuffer = Math.abs(sw.lat - ne.lat) * hbr;
    widthBuffer = Math.abs(sw.lng - ne.lng) * wbr;

    return new L.LatLngBounds([[sw.lat - heightBuffer, sw.lng - widthBuffer],
            [ne.lat + heightBuffer, ne.lng + widthBuffer]])
  }

  const toggleRectangleVis= (bool) => {
    console.log("MapView::toggleRectangleVis:", bool);
    setIsRectangleShowing(bool);
  }

  const toggleDrawnSearch = (bool) => {
    console.log("MapView::toggleDrawnSearch:", bool);
    setDrawnSearchBox(bool);
  }

  const useRectangleBounds = (rectangle_bounds) => {
    let rect = rectangleRef;
    if (rect.current){
     rect.current.setBounds(rectangle_bounds);
    }
  }


  const onMoveEnd = (rectangle_bounds) => {
    //console.log("bbox_polygon", bbox_polygon);
    if (!redoSearchOnMapMove){
      return
    }
    let bbox_str;
    bbox_str = rectangle_bounds.toBBoxString();
    console.log('bbox str:', bbox_str);
    console.log('onMoveEnd::geojson:', props.geojson);
    //console.log('onMoveEnd::geojsonState:', geojsonState);
    
    let bboxes_with_ratios = MapSearch(bbox_str, props.geojson);
    //console.log(props);
    props.executeSpatialSearch(bboxes_with_ratios);
    props.toggleResetSidebar(true);
        
  }



  // const labelLayerUrl = this.labelLayerUrl;
  // const rectangle_bounds = this.rectangle_bounds;
  // const isRectangleShowing = this.state.isRectangleShowing;
  // const base_features = this.state.base_features;
  
  //const search_results = props.search_results;
  const hover_feature = props.hover_feature;
  const pinned_features = props.pinned_features;
  //const { BaseLayer, Overlay } = LayersControl;
  let openModal = props.openModal;
  let hover_layer;
  let rectangle;
  let pinned_geojson;
  let debug_boxes;
  
  if (Config.debug_mode){
    debug_boxes = <GeoJSON
                          key={nanoid()}
                          style={function(f){
                              if (f.properties.sim_score <= 0.1){
                                return {color:"blue", weight: "0.25"}
                              }
                              if (f.properties.sim_score <= 0.2){
                                return {color:"#fef0d9", weight: "0.25"}
                              }
                              else if (f.properties.sim_score <= 0.4){
                                return {color:"#fdcc8a", weight: "0.5"}
                              }
                              else if (f.properties.sim_score <= 0.6){
                                return {color:"#fc8d59", weight: "0.75"}
                              }
                              else if (f.properties.sim_score <= 0.8){
                                return {color:"#e34a33", weight: "1.0"}
                              }
                              else if (f.properties.sim_score <= 1){
                                
                                return {color:"#b30000", weight: "1.5"}
                              }
                              else {
                                return {color:"pink", weight: "0.25"}
                                
                              }
                            }}
                        fillOpacity={0}
                        fillColor="red" 
                        data={window.debug_boxes}
                        eventHandlers={{
                          click: (e) => {
                            //console.log();
                            openModal(e.sourceTarget.feature.properties);
                          },
                        }}
                      ></GeoJSON>;
    }
      
    //if (isRectangleShowing){
      rectangle = <Rectangle 
                            ref={rectangleRef}
                            renderer={L.svg({padding:100})} 
                            weight={rectangleStyleWeight} 
                            color={rectangleStyleColor} 
                            bounds={rectangle_bounds}
                        />
    //}

    if (hover_feature) { // that is, if search_results contains geojson
      hover_layer = <GeoJSON
                  // ref={this.geojsonRef}
                  key={Math.random().toString()}
                  weight="1"
                  fillOpacity={0.01}
                  data={hover_feature}>
                </GeoJSON>;
    }

    if (pinned_features.length > 0) {
      pinned_geojson =  <GeoJSON
                          //ref={pinnedGeojsonRef}
                          key={nanoid()}
                          weight="1"
                          color="red"
                          fillOpacity={0.1}
                          fillColor="red" 
                          data={pinned_features}
                          eventHandlers={{
                            click: (e) => {
                              //console.log();
                              openModal(e.sourceTarget.feature.properties);
                            },
                          }}
                         >
                            
                        </GeoJSON>;
    }

    return (
     <div className="MapView">
            <GeojsonContext.Provider value={{drawnSearchBox, isRectangleShowing, 
                                            toggleRectangleVis, useRectangleBounds, 
                                            assymmetricPad, bboxStringToArray,
                                            bboxStringToWKT, toggleDrawnSearch, onMoveEnd
                                            }}>
              <MapContainer minZoom={4}
                  maxZoom={18}
                  className="map"  
                  center={[36,-97.5]}
                  zoom={7}
                  >
                <MapEvents executeSpatialSearch={props.executeSpatialSearch}/> 
                <Control className='toggle-search-control leaflet-bar' position='topleft'>
                  <ToggleSearchControl toggleRedoSearchOnMapMove={toggleRedoSearchOnMapMove} />
                </Control>
                <LayersControl collapsed={false} position="topright">
                  <LayersControl.BaseLayer checked name="Topographic">
                    <VectorBasemapLayer apiKey={Config.arcgisAPIkey} checked name="ArcGIS:Topographic" /> 
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Imagery">
                    <VectorBasemapLayer apikey={Config.arcgisAPIkey} name="ArcGIS:Imagery" />                    
                  </LayersControl.BaseLayer>
                  <LayersControl.Overlay name="OK Counties">
                      <VectorTileLayer apikey={Config.arcgisAPIkey} url={ok_counties}/>
                  </LayersControl.Overlay>
                  <LayersControl.Overlay name="Public Land Survey">
                    <DynamicMapLayer url={esri_plss}/>
                  </LayersControl.Overlay>
                </LayersControl>
                  <DrawComponent executeSpatialSearch={props.executeSpatialSearch}/>
                
                {debug_boxes}
                {rectangle}
                {pinned_geojson}
                {hover_layer}

           </MapContainer>
          </GeojsonContext.Provider>
          </div>
    
      
  
  )}


export default MapView;
