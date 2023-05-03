import React, { createRef, Component, lazy } from 'react';
import Config from './Config';
import axios from 'axios';
import L from 'leaflet'; //
import {
  MapContainer, 
  LayersControl,
  GeoJSON,
  Rectangle,
  Popup,
  useMap,
  useMapEvents
} from 'react-leaflet';
import {
  DynamicMapLayer
} from 'react-esri-leaflet';
import VectorBasemapLayer from 'react-esri-leaflet/plugins/VectorBasemapLayer';
import VectorTileLayer from 'react-esri-leaflet/plugins/VectorTileLayer';

// all turf imports (rather than importing the whole deal)
import bboxPolygon from '@turf/bbox-polygon';
import { featureEach } from '@turf/meta';
import center from '@turf/center';
import intersect from '@turf/intersect';
import booleanIntersects from '@turf/boolean-intersects';
import distance from '@turf/distance';
import area from '@turf/area';

//import * as geojsonFile from './data.json';



//import * as geojsonFile from './okmaps2_jq4.geojson';
//import * as geojsonFile from './okmaps2.geojson';

import {FilterRankQuery as buildFilterRankQuery} from './FilterRankQuery'; //use alias just to be a little more clear I guess

import './MapView.css';
import { nanoid } from 'nanoid';


//const { Map, TileLayer, Marker, Popup } = ReactLeaflet
const templater = function(strings, ...keys) {}

function MapEvents(props) {
  const map = useMap();
  

  const mapEvents = useMapEvents({
    drag: () => {
      let b = props.assymmetricPad(map.getBounds());
      props.updateRectangleBounds(b);
    },
    dragstart: () => {
      console.log("drag start");
      props.toggleRectangleVis(true);
    },
    dragend: () => {
      console.log("drag end");
      props.toggleRectangleVis(false);
    },
    moveend: () => {
      console.log("move end");
      props.onMoveEnd(props.assymmetricPad(map.getBounds()), props.geojsonStuff);
    }
  })
  return null
}

class MapView extends Component {
  
  constructor(props, context) {
    super(props)
    this.OFFSET = 0;
    this.PER_PAGE = 10;

    this.state = {isRectangleShowing: false,
                  geojsonStuff: false,
                  geojsonFile: false}
    
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
    this.rectangle_bounds = DEFAULT_BOUNDS;
    const DEFAULT_VIEWPORT = {
      center: [36.1156, -97.0584],
      zoom: 13
    }
    this.viewport = DEFAULT_VIEWPORT;
    this.retina = L.Browser.retina ? "@2x": "";
    this.bboxStringToArray = this.bboxStringToArray.bind(this);
    this.bboxStringToWKT = this.bboxStringToWKT.bind(this);
    this.bboxStringToPolygon = this.bboxStringToPolygon.bind(this);
    this.assymmetricPad = this.assymmetricPad.bind(this);
    this.updateRectangleBounds = this.updateRectangleBounds.bind(this);
    this.toggleRectangleVis = this.toggleRectangleVis.bind(this);
    this.rectangleStyleColor = "#8e8e8e";
    this.rectangleStyleWeight = 1;

    //everything that starts with on is an event handler
    // this.onDrag = this.onDrag.bind(this);
    // this.onDragStart = this.onDragStart.bind(this);
    // this.onDragEnd = this.onDragEnd.bind(this);
    //this.onMoveEnd = this.onMoveEnd.bind(this);
    // this.onZoomStart = this.onZoomStart.bind(this);
    // this.onZoomEnd = this.onZoomEnd.bind(this);
    

    //create object refs to access Leafler internals
    this.mapRef = createRef();
    this.rectangleRef = createRef();
    this.geojsonRef = createRef();

    //this.mapboxToken = Config.mapboxToken;
    //this.mapboxStyles = "https://api.mapbox.com/styles/v1";
    // this.mapboxStreets = `${this.mapboxStyles}/krdyke/cjt1zbtwh1ctg1fo1l2nmkhqh/tiles/256/{z}/{x}/{y}${this.retina}?access_token=${this.mapboxToken}`;
    // this.mapboxSatellite = `${this.mapboxStyles}/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}${this.retina}?access_token=${this.mapboxToken}`;
    // this.mapboxOKCounties = `${this.mapboxStyles}/krdyke/cj7rus41ceagg2rny2tgglav3/tiles/256/{z}/{x}/{y}${this.retina}?access_token=${this.mapboxToken}`;
    
    this.ok_counties = "https://vectortileservices1.arcgis.com/jWQlP64OuwDh6GGX/arcgis/rest/services/ok_counties_v/VectorTileServer";

    //plss
    this.esri_plss = "https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer";
   }

 
  bboxStringToArray(bbox_str){
    var a = bbox_str.split(",");
    
    return [[a[1],a[0]], [a[3],a[2]]];
  } 

  bboxStringToWKT(bbox_str){
    var bb = bbox_str.split(",");
    return "POLYGON((" + bb[0] + " " + bb[1] + "," + bb[0] + " " + bb[3]+
     "," + bb[2] + " " + bb[3]+ "," + bb[2] + " " + bb[1] +
     "," + bb[0] + " " + bb[1] + "))";
  };

  bboxStringToPolygon(bbox_str){
    let a = bbox_str.split(",");
    let bbox_array = [a[0],a[1], a[2],a[3]];
    return bboxPolygon(bbox_array);
  }


  assymmetricPad(bounds) {
    //let bounds = map.leafletElement.getBounds();
    let sw = bounds._southWest,
        ne = bounds._northEast,
        hbr = -0.2,
        wbr = -0.1,
        heightBuffer,
        widthBuffer;

    heightBuffer = Math.abs(sw.lat - ne.lat) * hbr;
    widthBuffer = Math.abs(sw.lng - ne.lng) * wbr;

    return [[sw.lat - heightBuffer, sw.lng - widthBuffer],
            [ne.lat + heightBuffer, ne.lng + widthBuffer]]
  }

  componentDidUpdate(prevProps, prevState){
    //console.log("MapView DidUpdate");
    // if (this.props.base_features.length !== prevProps.base_features.length) {
    //   let geojson = this.geojsonRef.current.leafletElement;
    //   geojson.addData(this.props.base_features)
    // }

    // if (prevState.geojsonStuff === false && this.state.geojsonStuff !== false){
    //   console.log(this.state.geojsonStuff);
    //   this.mapRef.current.f1ire('moveend');
    // }
  }

  componentDidMount(prevProps, prevState){
    //console.log("MapView DidMount");
    //this.assymmetricPad();
    //const map = this.refs.map.leafletElement
    console.log(this.state.geojsonFile);
    import("./data_mcc_okmaps.json").then((data) =>{
      this.setState({geojsonStuff: data});
    }) 

    // axios.get(this.state.geojsonFile.default)
    //   .then(resp => {
    //     console.log(resp);
    //     this.setState({geojsonStuff: resp.data});
    //   });
    
  }

  toggleRectangleVis(bool) {
    this.setState({isRectangleShowing: bool});
  }

  updateRectangleBounds(rectangle_bounds){
    let rect = this.rectangleRef;
    this.rectangle_bounds = rectangle_bounds;
    if (rect.current){
      rect.current.setBounds(rectangle_bounds);
    }
  }
  onDrag(){
    console.log("Event::drag");
      // const map = this.mapRef.current;
      // var b = this.assymmetricPad(map.leafletElement.getBounds());
      // this.rect7angle_bounds = b;
      // this.updateRectangleBounds();
  }

  onDragStart() {
    console.log("Event::dragstart")
    //let rect = this.rectangleRef.current.leafletElement;
    //let map = this.mapRef.current.leafletElement;
    //rect.addTo(map);
  }

  onDragEnd() {
    console.log("Event::dragend");
  //  let that = this;
    //setTimeout(function(){that.setState({isRectangleShowing: false})}, 1);
    //let rect = this.rectangleRef.current.leafletElement;
    //let map = this.mapRef.current.leafletElement;
    //rect.removeFrom(map);

  }

  onZoomStart() {

  }

  onZoomEnd() {

  }

  onMoveEnd(rectangle_bounds, geojsonStuff) {
    //console.log("bbox_polygon", bbox_polygon);
    let bbox_str = new L.LatLngBounds(rectangle_bounds).toBBoxString();
    let bbox_polygon = this.bboxStringToPolygon(bbox_str);
    let bboxes = geojsonStuff;
    let bboxes_with_ratios = [];
    
    
    let startTime = performance.now();
    featureEach(bboxes, function (feat, index){
      let sim_score, sim_score2;
      let intersection_area, union_area, feat_area, feat_center, bbox_area;
      let bbox_center = center(bbox_polygon);

      if (bbox_polygon && booleanIntersects(bbox_polygon, feat)) {
          let intersection= intersect(bbox_polygon, feat);
          feat_center = center(feat);
          let center_distance = distance(bbox_center, feat_center);

          if (intersection){
            intersection_area = area(intersection) - center_distance; //subtract distance between centers
            feat_area = area(feat);
            bbox_area = area(bbox_polygon);
          }
          
        sim_score = 2 * intersection_area / (feat_area + bbox_area);
        if (Config.debug_mode){
          feat.properties.sim_score = sim_score
        }
      }
      else {
        sim_score = 0;
      }

      if (Config.debug_mode){
        console.log("sim_score: ", sim_score);
      }
      //console.log(feat.properties);
      if (sim_score) {
        let id = feat.properties.Identifier ? feat.properties.Identifier : feat.properties["File Name"];
        //console.log(id);
        bboxes_with_ratios.push(
          {
            "similarityScore":sim_score,
           // "similarityScore2":sim_score2,
            "properties": feat.properties,
            "geometry": feat.geometry,
            "isPinned": false,
            "key": nanoid(),
            "id": id
          }
        );

      
      } 
    });  

    console.log("Query time:", performance.now() - startTime);
    bboxes_with_ratios = bboxes_with_ratios.sort((a,b) => {
      return b.similarityScore - a.similarityScore;
    });

    if (Config.debug_mode){
      window.debug_boxes = geojsonStuff;
    }
    this.executeSpatialSearch(false, bboxes_with_ratios);
    
  }

  render() {
    const labelLayerUrl = this.labelLayerUrl;
    const rectangle_bounds = this.rectangle_bounds;
    const isRectangleShowing = this.state.isRectangleShowing;
    const base_features = this.state.base_features;

    const search_results = this.props.search_results;
    const hover_feature = this.props.hover_feature;
    const pinned_features = this.props.pinned_features;
    const { BaseLayer, Overlay } = LayersControl;
    let openModal = this.props.openModal;
    let rectangle;
    let geojson;
    let pinned_geojson;
    let debug_boxes;

    if (Config.debug_mode){
      debug_boxes = <GeoJSON
          key={nanoid()}
          style={function(f){

            if (f.properties.sim_score == 0){
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
                return {color:"#b30000", weight: "1.5"}
                
              }
            } 
          }
          fillOpacity={0}
          fillColor="red" 
          data={window.debug_boxes}
          eventHandlers={{
        click: (e) => {
          //console.log();
          openModal(e.sourceTarget.feature.properties);
        },
      }}
     >
        
    </GeoJSON>;
    }


    if (isRectangleShowing){
      rectangle = <Rectangle 
                     ref={this.rectangleRef}
                     renderer={L.svg({padding:100})} 
                     weight={this.rectangleStyleWeight} 
                     color={this.rectangleStyleColor} 
                     bounds={rectangle_bounds}
                     />
    }

    if (hover_feature) { // that is, if search_results contains geojson
      geojson = <GeoJSON
                  ref={this.geojsonRef}
                  key={Math.random().toString()}
                  weight="1"
                  fillOpacity={0.01}
                  data={hover_feature}>
                </GeoJSON>;
    }

    if (pinned_features.length > 0) {
      pinned_geojson =  <GeoJSON
                          ref={this.pinnedGeojsonRef}
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

    return <div className="MapView">
            <MapContainer minZoom={4}
             maxZoom={18}
             ref={this.mapRef}
             onDrag={this.onDrag}
             onDragStart={this.onDragStart}
             onDragEnd={this.onDragEnd}
             onMoveEnd={this.onMoveEnd}
             onZoomStart={this.onZoomStart}
             onZoomEnd={this.onZoomEnd}
             className="map"  
             center={[36,-97.5]}
             zoom={7}
            >
                <MapEvents isRectangleShowing={this.state.isRectangleShowing}
                           toggleRectangleVis= {this.toggleRectangleVis} 
                           updateRectangleBounds={this.updateRectangleBounds}
                           assymmetricPad={this.assymmetricPad}
                           onMoveEnd={this.onMoveEnd}
                           bboxStringToArray={this.bboxStringToArray}
                           bboxStringToPolygon={this.bboxStringToPolygon}
                           bboxStringToWKT={this.bboxStringToWKT}
                           geojsonStuff={this.state.geojsonStuff}
                           executeSpatialSearch={this.props.executeSpatialSearch}
                           />
                <LayersControl collapsed={false} position="topright">
                  <LayersControl.BaseLayer checked name="Topographic">
                    <VectorBasemapLayer apiKey={Config.arcgisAPIkey} checked name="ArcGIS:Topographic" /> 
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Imagery">
                    <VectorBasemapLayer apikey={Config.arcgisAPIkey} name="ArcGIS:Imagery" />                    
                  </LayersControl.BaseLayer>
                  <LayersControl.Overlay name="OK Counties">
                      <VectorTileLayer apikey={Config.arcgisAPIkey} url={this.ok_counties}/>
                  </LayersControl.Overlay>
                  <LayersControl.Overlay name="PLSS">
                    <DynamicMapLayer url={this.esri_plss}/>
                  </LayersControl.Overlay>
                </LayersControl>

                {debug_boxes}
                {rectangle}
                {pinned_geojson}
                {geojson}

           </MapContainer>
          </div>
    
      
  
  }
}

export default MapView;
