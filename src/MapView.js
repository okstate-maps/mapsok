import React, { Component } from 'react';
import Control from 'react-leaflet-control';
import Config from './Config';
import {Map, TileLayer, WMSTileLayer} from 'react-leaflet';
import './MapView.css';

//const { Map, TileLayer, Marker, Popup } = ReactLeaflet

class MapView extends Component {
  
  constructor(props, context) {
    super(props)
    this.mapbox_token = Config.mapbox_token;
    const DEFAULT_VIEWPORT = {
      center: [36.1156, -97.0584],
      zoom: 13
    }
    this.viewport = DEFAULT_VIEWPORT;
    this.assymmetric_pad = this.assymmetric_pad.bind(this);

   }

  assymmetric_pad(bounds, heightBufferRatio, widthBufferRatio) {
    // var sw = bounds._southWest,
    //   ne = bounds._northEast,
    //   hbr = heightBufferRatio || -0.2,
    //   wbr = widthBufferRatio || -0.1,
    //   heightBuffer,
    //   widthBuffer;
    
    // heightBuffer = Math.abs(sw.lat - ne.lat) * hbr;
    // widthBuffer = Math.abs(sw.lng - ne.lng) * wbr;
    //debugger;
    //return new L.LatLngBounds(
    //  new L.LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
    //  new L.LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
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


  render() {
    const labelLayerUrl = this.labelLayerUrl;

          return <div className="MapView">
                  <Map minZoom={4}
                   maxZoom={18}
                   className="map"  
                   center={[37,-97]}
                   zoom={6}
                  >
                    <TileLayer url="https://api.mapbox.com/styles/v1/krdyke/cjt1zbtwh1ctg1fo1l2nmkhqh/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoia3JkeWtlIiwiYSI6Ik15RGcwZGMifQ.IR_NpAqXL1ro8mFeTIdifg"
                      zIndex={10000} />

                 </Map>
                </div>
          
      
  
  }
}

export default MapView;
