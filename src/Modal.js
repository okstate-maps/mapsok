import React from 'react';
import ReactModal from 'react-modal';
import {css, jsx} from '@emotion/react';
import SyncLoader from 'react-spinners/SyncLoader';
import Config from './Config';
import { nanoid } from 'nanoid';
import ShowMoreText from "react-show-more-text";
import axios from 'axios';
import * as L from 'leaflet';
import { MapContainer } from 'react-leaflet';
//import { IIIFLayer, FullscreenControl } from './react-leaflet-iiif';
import { OpenSeadragonViewer } from "openseadragon-react-viewer";
import CloverIIIF from "@samvera/clover-iiif";
import {iiifConstructImageUrl, iiifConstructManifestUrl, 
        iiifRequestManifest} from './IIIF';


import './Item.css';
import './Modal.css';

ReactModal.setAppElement('#root');



class Modal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.spinner_css = css`{
      position:absolute;
      top:50%;
      left:50%;
      z-index:1000000;
    }`;
    this.formatContent = this.formatContent.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.toggleSpinner = this.toggleSpinner.bind(this);
    this.ref = React.createRef(null);
    this.getParent = this.getParent.bind(this);
    this.state = {manifest: false,
      manifest_id: false,
      manifest_metadata: false,
      formatted_content: false,
      show_spinner: false};
  }

  
  
  componentDidUpdate(prevProps, prevState){
    console.log("Modal::componentDidUpdate");
    console.log("     ::old metadata::", prevState.manifest_id);
    console.log("     ::new metadata::", this.state.manifest_id);
    if (prevState.manifest_id !== this.state.manifest_id && this.state.manifest_id.length > 0){
      console.log("          ::format manifest data");
       this.setState({formatted_content: this.formatContent(this.state.manifest_id, this.state.manifest_metadata)});
       
    }
  }


 formatContent(manifest_id, manifest_metadata) {
  //let modalInfo = this.props.modalInfo;
    const options = {
         // Set canvas zooming onScoll (this defaults to false)
        openSeadragon: {
        ajaxWithCredentials:false,
        gestureSettingsMouse: {
          scrollToZoom: true
        },
        navigatorHeight: "133px",
        navigatorWidth: "173px"
      },
      withCredentials: false
      
    }
    let content = <div id='modalContent'>
                    {/* <CloverIIIF id={manifest_id} options={options}/> */}

                    <OpenSeadragonViewer 
                        manifestUrl={manifest_id}
                        options={{
                          height:600,
                          deepLinking: false
                        }} 
                        openSeadragonOptions={{
                          ajaxWithCredentials:false,
                          gestureSettingsMouse: {
                            scrollToZoom: true
                          },
                          navigatorHeight: "133px",
                          navigatorWidth: "173px"
                        }}                    
                       />

                    {/* <MapContainer className="modalMap" center={[0,0]} zoom='0' crs={L.CRS.Simple}>
                      <IIIFLayer url={iiifConstructImageUrl(modalInfo.modalCollectionId, 
                                              modalInfo.modalCollection)}/>
                      <FullscreenControl />
                    </MapContainer> */}


                    <ul className="metadataList">
                      {manifest_metadata.map(item => (
                        <li className="metadataPair" key={nanoid()}>
                          <span className="metadataLabel">{item.label.none[0] + ": "}</span>
                          <ShowMoreText className="metadataValue">{item.value.none[0]}</ShowMoreText> 
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
          that.setState({
            manifest_id: r.id.replace("/iiif/", "/iiif/2/"),
            manifest_metadata: r.metadata
          });
        }
    );
    
    //references are now sync'd and can be accessed.

    //this.props.rebuildTooltip(true);

  }

  getParent() {
    return document.querySelector('#modalRoot');
  }

  handleCloseModal() {
    //this.setState({
    //  content:[], 
    //  formatted_content: false, 
    //  manifest: false});
    this.setState({manifest_id: false,
      formatted_content: false, 
      manifest_metadata: false
    });
    this.props.closeModal();
  } 

  toggleSpinner(bool) {
    this.setState({"show_spinner": bool});
  }

  render() {
    console.log("Modal::render");
    const content = this.state.formatted_content;
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
      <SyncLoader  css={this.spinner_css} 
        loading={this.state.show_spinner} 
        color={"#ff6600"}
      />
      {content}

    </ReactModal>
  }
}

export default Modal;