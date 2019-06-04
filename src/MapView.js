import React, { createRef, Component } from 'react';
import Control from 'react-leaflet-control';
import Config from './Config';
import L from 'leaflet'; //
import {
  Map, 
  TileLayer, 
  WMSTileLayer, 
  LayersControl,
  GeoJSON,
  Rectangle
} from 'react-leaflet';
import WMTSTileLayer from './lib/react-leaflet-wmts/src/index';
import {FilterRankQuery as buildFilterRankQuery} from './FilterRankQuery'; //use alias just to be a little more clear I guess
import './MapView.css';

//const { Map, TileLayer, Marker, Popup } = ReactLeaflet
const templater = function(strings, ...keys) {}

class MapView extends Component {
  
  constructor(props, context) {
    super(props)
    this.OFFSET = 0;
    this.PER_PAGE = 10;

    this.state = {isRectangleShowing: false}
    
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
    this.assymmetricPad = this.assymmetricPad.bind(this);
    this.updateRectangleBounds = this.updateRectangleBounds.bind(this);
    this.hashSearchResults = this.hashSearchResults.bind(this);

    this.rectangleStyleColor = "#8e8e8e";
    this.rectangleStyleWeight = 1;

    //everything that starts with on is an event handler
    this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onMoveEnd = this.onMoveEnd.bind(this);

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

  assymmetricPad() {
    const map = this.mapRef.current;
    let bounds = map.leafletElement.getBounds();
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
  componentWillMount() {
    //console.log("MapView WillMount");
  }  

  componentWillUnmount() {
    //console.log("MapView WillUnmount");
  }

  componentWillReceiveProps(nextProps) {
  }

  
  componentWillUpdate(){
    console.log("MapView WillUpdate");
  }

  componentDidUpdate(prevProps, prevState){
    console.log("MapView DidUpdate");
    // if (this.props.base_features.length !== prevProps.base_features.length) {
    //   let geojson = this.geojsonRef.current.leafletElement;
    //   geojson.addData(this.props.base_features)
    // }

  }

  componentDidMount(prevProps, prevState){
    console.log("MapView DidMount");
    //this.assymmetricPad();
    //const map = this.refs.map.leafletElement
  }


  updateRectangleBounds(){
    let rect = this.rectangleRef;
    if (rect.current){
      rect.current.leafletElement.setBounds(this.rectangle_bounds);
    }
  }
  onDrag(){
      const map = this.mapRef.current;
      var b = this.assymmetricPad(map.leafletElement.getBounds());
      this.rectangle_bounds = b;
      this.updateRectangleBounds();
  }

  onDragStart() {
    this.setState({isRectangleShowing: true});
    //let rect = this.rectangleRef.current.leafletElement;
    //let map = this.mapRef.current.leafletElement;
    //rect.addTo(map);
  }

  onDragEnd() {
    let that = this;
    setTimeout(function(){that.setState({isRectangleShowing: false})}, 1);
    //let rect = this.rectangleRef.current.leafletElement;
    //let map = this.mapRef.current.leafletElement;
    //rect.removeFrom(map);

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

  onMoveEnd() {
    let map = this.mapRef.current.leafletElement;
    let bbox_wkt = this.bboxStringToWKT(new L.LatLngBounds(this.rectangle_bounds).toBBoxString());
    let query = buildFilterRankQuery(Config.carto_table, bbox_wkt, this.PER_PAGE, this.OFFSET, Config.carto_table_fields.join(", "));
    this.props.executeSpatialSearch(query);
    
  }

  render() {
    const labelLayerUrl = this.labelLayerUrl;
    const rectangle_bounds = this.rectangle_bounds;
    const isRectangleShowing = this.state.isRectangleShowing;
    const base_features = this.state.base_features;
    const search_results = this.props.search_results;
    const hover_feature = this.props.hover_feature;
    const { BaseLayer, Overlay } = LayersControl;
    let rectangle;
    let geojson;


    if (isRectangleShowing){
      rectangle = <Rectangle 
                     ref={this.rectangleRef}
                     renderer={L.svg({padding:100})} 
                     weight={this.rectangleStyleWeight} 
                     color={this.rectangleStyleColor} 
                     bounds={rectangle_bounds}/>
    }

    if (hover_feature) { // that is, if search_results contains geojson
      geojson = <GeoJSON ref={this.geojsonRef} key={Math.random().toString()} weight="1" fillOpacity={0.01} data={hover_feature}></GeoJSON>;
    }

    return <div className="MapView">
            <Map minZoom={4}
             maxZoom={18}
             ref={this.mapRef}
             onDrag={this.onDrag}
             onDragStart={this.onDragStart}
             onDragEnd={this.onDragEnd}
             onMoveEnd={this.onMoveEnd}
             className="map"  
             center={[36,-97.5]}
             zoom={7}
            >

                <LayersControl collapsed={false} position="topright">
                  <BaseLayer checked name="Streets">
                    <TileLayer url={this.mapboxStreets}
                       zIndex={1000} />
                  </BaseLayer>
                  <BaseLayer name="Satellite">
                    <TileLayer url={this.mapboxSatellite}
                       zIndex={1000} />
                  </BaseLayer>


                  <Overlay name="OK Counties">
                      <TileLayer url={this.mapboxOKCounties}
                       zIndex={10000} />
                  </Overlay>

                  <Overlay name="PLSS">
                      <WMTSTileLayer
                        url={this.esri_plss}
                        layer="OK_TownshipRange"
                        style="default"
                        tilematrixSet="default028mm"
                        format="image/png"
                        subdomains="1234"
  
                      />
                  </Overlay>
                </LayersControl>

                {rectangle}

                {geojson}

           </Map>
          </div>
    
      
  
  }
}

export default MapView;
