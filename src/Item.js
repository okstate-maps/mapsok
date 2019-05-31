import React, { Component } from 'react';
import Config from './Config';
import './Item.css';

class Item extends Component {
  constructor(props) {
    super(props);
    this.openModal = this.openModal.bind(this);
  }

  openModal() {
    console.log(this.props.featureProps);
  	this.props.openModal("Item", this.props.featureProps);
  }


  render() {
  	const thumbnail_url = Config.thumbnail_url;
    return (
         <div onClick={this.openModal} className="item flexlist">
          <div><input name="show-footprint" type="checkbox"/></div>
              <p>{this.props.featureProps.title}</p>
              <p>{this.props.featureProps.original_date}</p>
              <div className="thumbnail-background">
                <img alt={"thumbnail image for " + this.props.featureProps.title}
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
