import React, { createRef, Component } from 'react';
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

import * as turf from '@turf/turf';
import * as geojsonFile from './data.json';

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
                  geojsonFile: geojsonFile}
    
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
    this.hashSearchResults = this.hashSearchResults.bind(this);
    this.toggleRectangleVis = this.toggleRectangleVis.bind(this);
    this.rectangleStyleColor = "#8e8e8e";
    this.rectangleStyleWeight = 1;

    //everything that starts with on is an event handler
    // this.onDrag = this.onDrag.bind(this);
    // this.onDragStart = this.onDragStart.bind(this);
    // this.onDragEnd = this.onDragEnd.bind(this);
    // this.onMoveEnd = this.onMoveEnd.bind(this);
    // this.onZoomStart = this.onZoomStart.bind(this);
    // this.onZoomEnd = this.onZoomEnd.bind(this);
    

    //create object refs to access Leafler internals
    this.mapRef = createRef();
    this.rectangleRef = createRef();
    this.geojsonRef = createRef();

    this.mapboxToken = Config.mapboxToken;
    this.mapboxStyles = "https://api.mapbox.com/styles/v1";
    this.mapboxStreets = `${this.mapboxStyles}/krdyke/cjt1zbtwh1ctg1fo1l2nmkhqh/tiles/256/{z}/{x}/{y}${this.retina}?access_token=${this.mapboxToken}`;
    this.mapboxSatellite = `${this.mapboxStyles}/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}${this.retina}?access_token=${this.mapboxToken}`;
    this.mapboxOKCounties = `${this.mapboxStyles}/krdyke/cj7rus41ceagg2rny2tgglav3/tiles/256/{z}/{x}/{y}${this.retina}?access_token=${this.mapboxToken}`;

    //plss
    this.esri_plss = "https://tiles{s}.arcgis.com/tiles/jWQlP64OuwDh6GGX/arcgis/rest/services/OK_TownshipRange/MapServer/WMTS";
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
    return turf.bboxPolygon(bbox_array);
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

    this.setState({geojsonStuff: this.state.geojsonFile.default});
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

  //creates a half assed hash consisting of a concatenation of all the search results' cartodb_id
  hashSearchResults() {
    let hash = '';
    let res = this.props.search_results;
    let vals = res.values();
    for (const val of vals){
      hash = hash + val.properties.cartodb_id.toString();
    }
    return hash
  }

  onMoveEnd(rectangle_bounds, geojsonStuff) {
    let bbox_str = new L.LatLngBounds(rectangle_bounds).toBBoxString();
    let bbox_wkt = this.bboxStringToWKT(bbox_str);
    let bbox_polygon = this.bboxStringToPolygon(bbox_str);
    //console.log("bbox_polygon", bbox_polygon);
    let bbox_area = turf.area(bbox_polygon);
    let bboxes = geojsonStuff;
    let bboxes_with_ratios = [];
    let smaller_matches=[];
    let bigger_matches=[];
    let areas = [];
    turf.featureEach(bboxes, function (feat, index){
      let feat_area;
      let feat_cat;
      if (bbox_polygon && turf.booleanIntersects(bbox_polygon, feat)) {
          let intersection= turf.intersect(bbox_polygon, feat);
          let intersection_area, union_area;
          if (intersection){
            intersection_area = turf.area(intersection);
          
          }
          let union = turf.union(bbox_polygon,feat);
          if (union) {
            union_area = turf.area(union);
          }
          

        //feat_area = Math.sqrt(Math.abs(difference_area - intersection_area));
        feat_area = intersection_area/union_area;


       }
//       }

      if (feat_area) {
        bboxes_with_ratios.push(
          {
            "similarityScore":feat_area,
            "simCat": feat_cat,
            "properties": feat.properties,
            "geometry": feat.geometry,
            "isPinned": false,
            "key": nanoid(),
            "id": feat.properties.Identifier
          }
        );
        //areas.push(((feat_area/bbox_area)+(bbox_area/feat_area))/bbox_area);
        //areas.push(feat_area);
      
      } 
    });
    bboxes_with_ratios = bboxes_with_ratios.sort((a,b) => {
      return b.similarityScore - a.similarityScore;
    });
    //console.log(bboxes_with_ratios);
    //areas = areas.sort();
    //let normalized_areas = [];
    //console.log(areas);
    // let min_x = Math.sqrt(min(areas));
    // console.log("min_x: ", min_x);
    // let max_x = Math.sqrt(max(areas));
    // console.log("max_x: ", max_x);
    
    //areas.forEach(val => {
      //normalized_areas.push((Math.sqrt(val) - min_x)/(max_x - min_x));
      //normalized_areas.push()
    //})

    //normalized_areas.sort();
    //console.log(normalized_areas);

    
    //console.log("Smaller: ", smaller_matches.length);      
    //console.log("bigger: ", bigger_matches.length);    
    //let query = buildFilterRankQuery(Config.carto_table, bbox_wkt, this.PER_PAGE, this.OFFSET, Config.carto_table_fields.join(", "));
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
                              openModal("Item", e.sourceTarget.feature.properties);
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
                      <VectorTileLayer apikey={Config.arcgisAPIkey} url="https://vectortileservices1.arcgis.com/jWQlP64OuwDh6GGX/arcgis/rest/services/ok_counties_v/VectorTileServer"/>
                  </LayersControl.Overlay>
                  <LayersControl.Overlay name="PLSS">
                    <DynamicMapLayer url="https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer"/>
                  </LayersControl.Overlay>
                </LayersControl>

                {rectangle}
                {pinned_geojson}
                {geojson}

           </MapContainer>
          </div>
    
      
  
  }
}

export default MapView;
