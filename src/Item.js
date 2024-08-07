import React, { PureComponent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';

import CircleLoader from 'react-spinners/CircleLoader';
import Config from './Config';
import './Item.css';
import { nanoid } from 'nanoid';

//const element = 


export class Item extends PureComponent {
  //static whyDidYouRender = true;

  constructor(props) {
    super(props);
    this.openModal = this.openModal.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onThumbnailLoad = this.onThumbnailLoad.bind(this);
    this.onThumbnailError = this.onThumbnailError.bind(this);
    this.state = {"thumbnailLoading": true,
                  "pinning": false};
  }

  openModal() {
    console.log("openModal");
  	this.props.openModal(this.props.featureProps);
  }

  onChange(e) {
    console.log("Item::onChange::Pinning : ", this.props);
    //console.log("onChange", this);
    //console.log(this.props);
    this.setState({"pinning": e.currentTarget.checked});
    this.props.handleItemPinning({
      "type": "Feature",
      "geometry": this.props.featureGeom, 
      "properties": this.props.featureProps,
      "id": this.props.id,
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

  onThumbnailError() {
    this.setState({"thumbnailLoading": false});
  }

  render() {
    //console.log("item render");
    //console.log(this.props);
  	//let ref_url = this.props.featureProps["Reference URL"];
    let contentdm_number = this.props.featureProps["cdmn"];
    let cdm_collection = this.props.featureProps["cdmco"];
    let thumbnail_url = Config.thumbnail_url.replace("{{contentdm_number}}", contentdm_number)
                                            .replace("{{cdm_collection}}", cdm_collection);
    let pin_item_id = nanoid();
    

    return (
         <button onMouseEnter={this.onMouseEnter} 
              onMouseLeave={this.onMouseLeave} 
              className="item flexlist">
            <div className="pin-item-wrapper">
              <label htmlFor={pin_item_id}>
                <FontAwesomeIcon 
                  icon={this.props.isPinned ? faCheckSquare : faSquare} 
                  size='xl' />
              <input name="pin-item" 
                     className="pin-checkbox"
                     id={pin_item_id}
                     onChange={this.onChange} 
                     type="checkbox" 
                     checked={this.props.isPinned} />
                     </label>
            </div>
            <div onClick={this.openModal} className="modal-trigger-wrapper">
                <p className="item-title-long">{this.props.featureProps.title.length >= 75 ? this.props.featureProps.title.slice(0,75)+ "...": this.props.featureProps.title}</p>
                <p className="item-title-short">{this.props.featureProps.title.length >= 25 ? this.props.featureProps.title.slice(0,25)+ "...": this.props.featureProps.title}</p>
                <div className="thumbnail-background">
                  <CircleLoader color={'#ff6600'} loading={this.state.thumbnailLoading}/>
                  <img className="feature-thumbnail" 
                      onLoad={this.onThumbnailLoad} 
                      onError={this.onThumbnailError}
                      loading="lazy"
                      alt={"thumbnail image for " + this.props.featureProps.title}
                      src={thumbnail_url}
                    />
                </div>                 
            </div>
          </button>
    );
  }
}


export class PinnedItem extends PureComponent {
  //static whyDidYouRender = true;

  constructor(props) {
    super(props);
    this.openModal = this.openModal.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onThumbnailLoad = this.onThumbnailLoad.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.state = {"thumbnailLoading": true,
                  "is_bouncing": false}
  }

  openModal() {
    console.log("openModal");
  	this.props.openModal(this.props.featureProps);
  }

  onClick(e) {
    //console.log("onClick::unpin", this);
    //debugger;
    this.props.handleItemPinning({
      "id": this.props.id
    });
  }

  onMouseEnter() {
    //let geom = this.props.featureGeom;
    //this.props.onItemMouseOver(geom);
    this.setState({is_bouncing: true});
  }

  onMouseLeave() {
  	//this.props.onItemMouseOut();
    this.setState({is_bouncing: false});
  
  }

  onThumbnailLoad() {
    this.setState({"thumbnailLoading": false});
  }

  render() {
    //console.log("PinnedItem render");
    const contentdm_number = this.props.featureProps["cdmn"];
    const cdm_collection = this.props.featureProps["cdmco"];
    const unpin_id = nanoid();
    const is_bouncing = this.state.is_bouncing;
    let thumbnail_url = Config.thumbnail_url.replace("{{contentdm_number}}", contentdm_number)
                                            .replace("{{cdm_collection}}", cdm_collection);
    
    return (
         <button  
              
              className="pinned-item flexlist">
            <div className="unpin-item-wrapper">
              <label htmlFor={unpin_id} 
                      onMouseEnter={this.onMouseEnter} 
                      onMouseLeave={this.onMouseLeave} >

                <FontAwesomeIcon 
                  icon={faThumbtack} 
                  size='xl' 
                  bounce={is_bouncing}/>
                <input class="unpin-checkbox" 
                        type="checkbox" 
                        id={unpin_id} 
                        checked 
                        name="unpin-item" 
                        onChange={this.onClick}/>
              </label>
            </div>
            <div onClick={this.openModal} className="modal-trigger-wrapper">
                <p>{this.props.featureProps.title.length >= 75 ? 
                      this.props.featureProps.title.slice(0,75) + 
                      "...": this.props.featureProps.title}</p>         
                <div className="thumbnail-background">
                  <CircleLoader color={'#ff6600'} 
                                loading={this.state.thumbnailLoading}/>
                  <img className="feature-thumbnail" 
                      onLoad={this.onThumbnailLoad} 
                      alt={"thumbnail image for " + this.props.featureProps.title}
                      src={thumbnail_url}
                    />
                </div>                
            </div>
          </button>
    );
  }
}


export default Item;
