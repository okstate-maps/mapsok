import PropTypes from 'prop-types';
import {TileLayer} from 'react-leaflet';
import {tiledMapLayer} from 'esri-leaflet';

export default class EsriTiledMapLayer extends TileLayer {
  static propTypes = {
    url: PropTypes.string.isRequired
  };

  componentWillMount() {
    super.componentWillMount();
    const {map: _map, layerContainer: _lc, ...props, } = this.props;
    this.leafletElement = tiledMapLayer(props); 
  }
}