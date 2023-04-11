import {
  useLeafletContext,
  } from '@react-leaflet/core';
import * as L from 'leaflet';
import 'leaflet-iiif';
import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
import { useEffect } from 'react';

//  export interface TileLayerProps extends TileLayerOptions, LayerProps {
//    url: string
//  }

export function IIIFLayer(props) {
  const context = useLeafletContext();
  useEffect(() => {  
    const container = context.layerContainer || context.map;
    const layer = L.tileLayer.iiif(props.url);
    container.addLayer(layer);
    return () => container.removeLayer(layer);
  });
  
}

export function FullscreenControl(props) {
  const context = useLeafletContext();
  useEffect(() => {  
    const container = context.map;
    const control = L.control.fullscreen({forceSeparateButton: true});
    control.addTo(container);
    return () => container.removeControl(control);
  });
}

export default IIIFLayer;