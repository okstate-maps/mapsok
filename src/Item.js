import React, { Component } from 'react';
import CircleLoader from 'react-spinners/CircleLoader';
import Config from './Config';
import './Item.css';

class Item extends Component {
  constructor(props) {
    super(props);
    this.openModal = this.openModal.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onThumbnailLoad = this.onThumbnailLoad.bind(this);
    this.state = {"thumbnailLoading": true}
  }

  openModal() {
    console.log(this.props.featureProps);
  	this.props.openModal("Item", this.props.featureProps);
  }

  onMouseOver() {
  	this.props.onItemMouseOver(this.props.featureGeom);
  }

  onMouseOut() {
  	this.props.onItemMouseOut();
  }

  onThumbnailLoad() {
    this.setState({"thumbnailLoading": false});
  }

  render() {
  	const thumbnail_url = Config.thumbnail_url;
  	
    return (
         <div onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} className="item flexlist">
          <div><input name="show-footprint" type="checkbox"/></div>
              <p onClick={this.openModal}>{this.props.featureProps.title}</p>
              <p onClick={this.openModal}>{this.props.featureProps.original_date}</p>
              <div onClick={this.openModal} className="thumbnail-background">
                <CircleLoader color={'#ff6600'} loading={this.state.thumbnailLoading}/>
                <img className="feature-thumbnail" onLoad={this.onThumbnailLoad} alt={"thumbnail image for " + this.props.featureProps.title}
                	 src={thumbnail_url
                            .replace("{{cdm_collection}}", this.props.featureProps.cdm_collection)
                            .replace("{{contentdm_number}}", this.props.featureProps.contentdm_number)}
                  />
              </div>                
          </div>
            

    );
  }
}

export default Item;
