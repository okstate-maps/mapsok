import React, { Component } from 'react';
import {Modal as ReactModal} from 'react-modal';
import CircleLoader from 'react-spinners/CircleLoader';
import Config from './Config';
import './Item.css';

class Modal extends Component {
  constructor(props) {
    super(props);
  }


openModal(modalType, modalContent) {
    let content;
    let that = this;

    switch (modalType) {
      case "Item":
        let url = this.constructManifestUrl(modalContent);
        this.setState({showSpinner: true});
        let manifestContent = this.iiifRequestManifest(url)
          .then(function(response){
            let metadata = response.data.metadata;
            content = metadata.map(function(a){
              return  <div className="metadataKeyValuePair">
                        <h4>{a.label}</h4>
                        <p>{a.value}</p>
                      </div>
                });
            that.setState({
              modalContent: content,
              modalIsOpen: true,
              showSpinner: false
            });
          })
        break;

      default:
        console.log("I need a modalType buddy.");
    }
    
    
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.

  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }


  render() {
  	const thumbnail_url = Config.thumbnail_url;
  	
    return (
        <ReactModal
          className="Modal-Content"
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          contentLabel="Example Modal">
          {this.state.modalContent}
        </ReactModal>
            

    );
  }
}

export default Modal;
