import React, { Component, PureComponent } from 'react';
import CircleLoader from 'react-spinners/CircleLoader';
import Config from './Config';
import './Item.css';
import { nanoid } from 'nanoid';

export class Item extends PureComponent {
  static whyDidYouRender = true;

  constructor(props) {
    super(props);
    this.openModal = this.openModal.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onThumbnailLoad = this.onThumbnailLoad.bind(this);
    this.state = {"thumbnailLoading": true,
                  "pinning": false};
  }

  openModal() {
    console.log("openModal");
  	this.props.openModal("Item", this.props.featureProps);
  }

  onChange(e) {
    console.log("onChange", this);
    //TODO pass up to sidebar, and from sidebar send all pinned item geoms to map via App
    console.log(this.props);
    this.setState({"pinning": e.currentTarget.checked});

    this.props.handleItemPinning({
      "type": "Feature",
      "geometry": this.props.featureGeom, 
      "properties": this.props.featureProps,
      "id": this.props.featureProps.Identifier,
      "key": nanoid(),
      "isPinned": e.currentTarget.checked
    });
  }

  onMouseEnter() {
    let geom = this.props.featureGeom;
    this.props.onItemMouseOver(geom);
  }

  onMouseLeave() {
  	this.props.onItemMouseOut();
  }

  onThumbnailLoad() {
    this.setState({"thumbnailLoading": false});
  }

  render() {
    console.log("item render");
  	let ref_url = this.props.featureProps["Reference URL"];
    let contentdm_number = ref_url.slice(ref_url.lastIndexOf("/")+1);
    let re = /\/collection\/(.*)\/id/;
    let cdm_collection = ref_url.match(re)[1];
    let thumbnail_url = Config.thumbnail_url.replace("{{contentdm_number}}", contentdm_number)
                                            .replace("{{cdm_collection}}", cdm_collection);
    

    return (
         <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} className="item flexlist">
            <div className="pin-item-wrapper">
              <input name="pin-item" onChange={this.onChange} type="checkbox" checked={this.props.isPinned} />
            </div>
            <div onClick={this.openModal} className="modal-trigger-wrapper">
                <p>{this.props.featureProps.Title.length >= 75 ? this.props.featureProps.Title.slice(0,75)+ "...": this.props.featureProps.Title}</p>
                <p>{this.props.featureProps["Date Issued"] }</p>             
                <div className="thumbnail-background">
                  <CircleLoader color={'#ff6600'} loading={this.state.thumbnailLoading}/>
                  <img className="feature-thumbnail" 
                      onLoad={this.onThumbnailLoad} 
                      alt={"thumbnail image for " + this.props.featureProps.Title}
                      src={thumbnail_url}
                    />
                </div>                 
            </div>
          </div>
    );
  }
}


export class PinnedItem extends PureComponent {
  static whyDidYouRender = true;

  constructor(props) {
    super(props);
    this.openModal = this.openModal.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onThumbnailLoad = this.onThumbnailLoad.bind(this);
    this.state = {"thumbnailLoading": true}
  }

  openModal() {
    console.log("openModal");
  	this.props.openModal("Item", this.props.featureProps);
  }

  onClick(e) {
    console.log("onClick::unpin", this);
    //TODO pass up to sidebar, and from sidebar send all pinned item geoms to map via App
    this.props.handleItemPinning({
      "id": this.props.id
    });
  }

  onMouseOver() {
    //let geom = this.props.featureGeom;
    //this.props.onItemMouseOver(geom);
  }

  onMouseOut() {
  	//this.props.onItemMouseOut();
  }

  onThumbnailLoad() {
    this.setState({"thumbnailLoading": false});
  }

  render() {
    console.log("PinnedItem render");
  	let ref_url = this.props.featureProps["Reference URL"];
    let contentdm_number = ref_url.slice(ref_url.lastIndexOf("/")+1);
    let re = /\/collection\/(.*)\/id/;
    let cdm_collection = ref_url.match(re)[1];
    let thumbnail_url = Config.thumbnail_url.replace("{{contentdm_number}}", contentdm_number)
                                            .replace("{{cdm_collection}}", cdm_collection);
    
    return (
         <div onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} className="pinned-item flexlist">
            <div className="unpin-item-wrapper">
              <button name="unpin-item" onClick={this.onClick}>Unpin</button>
            </div>
            <div onClick={this.openModal} className="modal-trigger-wrapper">
                <p>{this.props.featureProps.Title.length >= 75 ? this.props.featureProps.Title.slice(0,75)+ "...": this.props.featureProps.Title}</p>
                <p>{this.props.featureProps["Date Issued"] }</p>             
                <div className="thumbnail-background">
                  <CircleLoader color={'#ff6600'} loading={this.state.thumbnailLoading}/>
                  <img className="feature-thumbnail" 
                      onLoad={this.onThumbnailLoad} 
                      alt={"thumbnail image for " + this.props.featureProps.Title}
                      src={thumbnail_url}
                    />
                </div>                
            </div>
          </div>
    );
  }
}


export default Item;
