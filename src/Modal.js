import React, { Component } from 'react';
import ReactModal from 'react-modal';
import CircleLoader from 'react-spinners/CircleLoader';
import Config from './Config';
import {iiifConstructManifestUrl, iiifRequestManifest} from './IIIF';
import './Item.css';

ReactModal.setAppElement('#root');

class Modal extends Component {
  constructor(props) {
    super(props);
    this.formatContent = this.formatContent.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.state={};
  }

formatContent(modalType, modalContent) {
    let content;
    let that = this;

    switch (modalType) {
      case "Item":
        let url = iiifConstructManifestUrl(modalContent);
        let manifestContent = iiifRequestManifest(url)
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
    this.props.toggleModal();
  }


  render() {
  	const thumbnail_url = Config.thumbnail_url;

  	let content = this.formatContent(this.props.modalType, this.props.modalContent);
  	return <ReactModal
          className="Modal-Content"
          key={this.props.modalContent.contentdm_number}
          isOpen={this.props.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.toggleModal}
          contentLabel="Example Modal">
    	{content}     
    </ReactModal>
    
  }
}

export default Modal;
