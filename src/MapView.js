import React, { createRef, Component } from 'react';
import Control from 'react-leaflet-control';
import Config from './Config';
import L from 'leaflet'; //
import {
  Map, 
  TileLayer, 
  WMSTileLayer, 
  LayersControl,
  Polygon,
  Rectangle
} from 'react-leaflet';
import WMTSTileLayer from './lib/react-leaflet-wmts/src/index';
import './MapView.css';

//const { Map, TileLayer, Marker, Popup } = ReactLeaflet

class MapView extends Component {
  
  constructor(props, context) {
    super(props)
    this.mapbox_token = Config.mapbox_token;
    const DEFAULT_BOUNDS = [[31.690781806136822,-103.62304687500001],[39.57182223734374,-93.40576171875001]];
    this.rectangle_bounds = DEFAULT_BOUNDS;
    const DEFAULT_VIEWPORT = {
      center: [36.1156, -97.0584],
      zoom: 13
    }
    this.viewport = DEFAULT_VIEWPORT;
    this.bboxStringToArray = this.bboxStringToArray.bind(this);
    this.assymmetric_pad = this.assymmetric_pad.bind(this);
    this.updateRectangleBounds = this.updateRectangleBounds.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.mapRef = createRef();
    this.rectangleRef = createRef();
    this.mapbox_streets = `https://api.mapbox.com/styles/v1/krdyke/cjt1zbtwh1ctg1fo1l2nmkhqh/tiles/256/{z}/{x}/{y}@2x?access_token=${this.mapbox_token}`;
    this.mapbox_satellite = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}@2x?access_token=${this.mapbox_token}`;

    this.mapbox_okcounties = `https://api.mapbox.com/styles/v1/krdyke/cj7rus41ceagg2rny2tgglav3/tiles/256/{z}/{x}/{y}@2x?access_token=${this.mapbox_token}`;
   }

  bboxStringToArray(bbox_str){
    var a = bbox_str.split(",");
    return [[a[1],a[0]], [a[3],a[2]]];
  } 

  assymmetric_pad() {
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
    //console.log("MapView WillUpdate");
  }

  componentDidUpdate(prevProps, prevState){
    //console.log("MapView DidUpdate");

  }

  componentDidMount(prevProps, prevState){
    //console.log("MapView DidMount");
    //this.assymmetric_pad();
    //debugger;
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
      var b = this.assymmetric_pad(map.leafletElement.getBounds());
      this.rectangle_bounds = b;
      this.updateRectangleBounds();
  }

  onDragStart() {
    let rect = this.rectangleRef.current.leafletElement;
    let map = this.mapRef.current.leafletElement;
    rect.addTo(map);
  }

  onDragEnd() {
    let rect = this.rectangleRef.current.leafletElement;
    let map = this.mapRef.current.leafletElement;
    rect.removeFrom(map);

  }

  render() {
    const labelLayerUrl = this.labelLayerUrl;
    const rectangle_bounds = this.rectangle_bounds;
    const { BaseLayer, Overlay } = LayersControl

          return <div className="MapView">
                  <Map minZoom={4}
                   maxZoom={18}
                   renderer={L.svg({padding:100})}
                   ref={this.mapRef}
                   onDrag={this.onDrag}
                   onDragStart={this.onDragStart}
                   onDragEnd={this.onDragEnd}
                   className="map"  
                   center={[37,-97]}
                   zoom={6}
                  >

                      <LayersControl position="topright">
                        <BaseLayer checked name="Streets">
                          <TileLayer url={this.mapbox_streets}
                             zIndex={1000} />
                        </BaseLayer>
                        <BaseLayer name="Satellite">
                          <TileLayer url={this.mapbox_satellite}
                             zIndex={1000} />
                        </BaseLayer>


                        <Overlay checked name="OK Counties">
                            <TileLayer url={this.mapbox_okcounties}
                             zIndex={10000} />
                        </Overlay>

                        <Overlay name="PLSS">
                            <WMTSTileLayer
                              url="https://tiles{s}.arcgis.com/tiles/jWQlP64OuwDh6GGX/arcgis/rest/services/OK_TownshipRange/MapServer/WMTS"
                              layer="OK_TownshipRange"
                              style="default"
                              tilematrixSet="default028mm"
                              format="image/png"
                              subdomains="1234"
        
                            />
                        </Overlay>


                      </LayersControl>
                      <Rectangle ref={this.rectangleRef} bounds={rectangle_bounds} color="black"/>

                 </Map>
                </div>
          
      
  
  }
}

export default MapView;
