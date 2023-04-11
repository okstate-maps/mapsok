import React, { Component } from 'react';
import ReactModal from 'react-modal';
import CircleLoader from 'react-spinners/CircleLoader';
import Config from './Config';
import { nanoid } from 'nanoid';
import ShowMoreText from "react-show-more-text";
import axios from 'axios';
import * as L from 'leaflet';
import { MapContainer } from 'react-leaflet';
import { IIIFLayer, FullscreenControl } from './react-leaflet-iiif';
import {iiifConstructImageUrl, iiifConstructManifestUrl, 
        iiifRequestManifest} from './IIIF';


import './Item.css';
import './Modal.css';

ReactModal.setAppElement('#root');



class Modal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.formatContent = this.formatContent.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.ref = React.createRef(null);
    this.getParent = this.getParent.bind(this);
    this.state = {content: [], formattedContent: false};
    
  }

  
  
  componentDidUpdate(prevProps, prevState){
    console.log("Modal::componentDidUpdate");
    if (prevState.content !== this.state.content){
       this.setState({formattedContent: this.formatContent(this.state.content)});
       
    }
  }


 formatContent(modalType) {
  let modalInfo = this.props.modalInfo;
    let content = <div id='modalContent'>

                    <MapContainer className="modalMap" center={[0,0]} zoom='0' crs={L.CRS.Simple}>
                      <IIIFLayer url={iiifConstructImageUrl(modalInfo.modalCollectionId, 
                                              modalInfo.modalCollection)}/>
                      <FullscreenControl />
                    </MapContainer>


                    <ul className="metadataList">
                      {this.state.content.map(item => (
                        <li className="metadataPair" key={nanoid()}>
                          <span className="metadataLabel">{item.label + ": "}</span>
                          <ShowMoreText className="metadataValue">{item.value}</ShowMoreText> 
                        </li>
                      ))}
                    </ul>
                    
                  </div>;
    return content;
  }

  afterOpenModal() {
    console.log("Modal::afterOpenModal");
    let modalInfo = this.props.modalInfo;

    let that = this;
    
    let manifest_url = iiifConstructManifestUrl(modalInfo.modalCollectionId,
      modalInfo.modalCollection);
    //console.log(manifest_url);
    
    iiifRequestManifest(manifest_url).then(
        function(r) {
          that.setState({content: r.data.metadata})
      }
    );
    // references are now sync'd and can be accessed.

    //this.props.rebuildTooltip(true);
  }

  getParent() {
    return document.querySelector('#modalRoot');
  }

  handleCloseModal() {
    this.setState({content:[], formattedContent: false});
    this.props.closeModal();
  } 


  render() {
    console.log("Modal::render");
    const content = this.state.formattedContent;
  	//let options = this.props.modalOptions || {};
  	return <ReactModal
          id='modalContainer'
          ref={this.ref}
          closeTimeoutMS={500}
          className='Modal-Content'
          key={'modal'}
          isOpen={this.props.isOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.handleCloseModal}
          parentSelector={this.getParent}
          contentLabel='Modal'>
      <button className="modalCloseButton" onClick={this.handleCloseModal}>X</button>
      {content}

    </ReactModal>
  }
}

export default Modal;