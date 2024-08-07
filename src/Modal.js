import React from 'react';
import ReactModal from 'react-modal';
import ClipLoader from 'react-spinners/SyncLoader';
import ShowMoreText from "react-show-more-text";
import { nanoid } from 'nanoid';
import { OpenSeadragonViewer } from "openseadragon-react-viewer";
import {iiifConstructManifestUrl, 
        //iiifConstructImageUrl, 
        iiifRequestManifest} from './IIIF';
import './Item.css';
import './Modal.css';
//import {css, jsx} from '@emotion/react';
//import Config from './Config';
//import axios from 'axios';
//import * as L from 'leaflet';
//import { MapContainer } from 'react-leaflet';
//import { IIIFLayer, FullscreenControl } from './react-leaflet-iiif';
//import CloverIIIF from "@samvera/clover-iiif";



ReactModal.setAppElement('#root');

class Modal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.spinner_css = {
      "position":"absolute",
      "top":"50%",
      "left":"50%",
      "zIndex":"1000000",
      "padding":"10px"
    };
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
    if (prevState.manifest_id !== this.state.manifest_id && 
        this.state.manifest_id.length > 0){
          
          console.log("     ::old metadata::", prevState.manifest_id);
          console.log("     ::new metadata::", this.state.manifest_id);
          let formatted_content = this.formatContent(this.state.manifest_id, 
              this.state.manifest_metadata, this.props.modalInfo.modalCollection);
          this.setState({ formatted_content: formatted_content });
    }
  }


 formatContent(manifest_id, manifest_metadata, manifest_collection) {
  
  console.log(manifest_metadata);
  const collection_field_info = this.props.collectionFieldInfo;

  console.log("Collection name: ")
  console.log(collection_field_info);
  
  const collection = manifest_collection.replace("/","");
  manifest_metadata.sort((a,b) => {
    let a_name = a.label.none[0];
    let b_name = b.label.none[0];
    let a_index, b_index;
    if (a_name in collection_field_info[collection]){
      a_index = collection_field_info[collection][a_name]["index"];
    }
    if (b_name in collection_field_info[collection]){
      b_index = collection_field_info[collection][b_name]["index"];
    }

    if (a_index < b_index) {
      return -1;
    }
    if (a_index > b_index) {
      return 1;
    }
    // a must be equal to b
    return 0;


  })
  // manifest_metadata.forEach((v,i) => {
  //   let fieldname = v.label.none[0];
  //   let fieldval = v.value.none[0];
  //   if (fieldname in collection_field_info[collection]){
  //     let fieldindex = collection_field_info[collection][fieldname]["index"];
  //       }
  // });
  //let modalInfo = this.props.modalInfo;
    // const options = {
    //   openSeadragon: {
    //       ajaxWithCredentials:false,
    //       gestureSettingsMouse: {
    //         scrollToZoom: true
    //       },
    //       navigatorHeight: "133px",
    //       navigatorWidth: "173px"
    //   },
    //   withCredentials: false
      
    // }
    let content = <div id='modalContent'>
                    {/* <CloverIIIF id={manifest_id} options={options}/> */}
 
                    <OpenSeadragonViewer 
                        manifestUrl={manifest_id}
                        options={{
                          height:500,
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
    console.log("     ::modalInfo::", modalInfo);
    
    let that = this;
    
    let manifest_url = iiifConstructManifestUrl(modalInfo.modalCollectionId,
      modalInfo.modalCollection);

    //console.log(manifest_url);
    this.setState({'show_spinner': true});

    //TODO fix this crap
    iiifRequestManifest(manifest_url).then(
        function(r) {
          that.setState({
            manifest_id: r.id.replace("/iiif/", "/iiif/2/"),
            manifest_metadata: r.metadata,
            show_spinner: false
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

      {this.state.show_spinner &&
        <div className="modal-loader-div">
          <ClipLoader  cssOverride={this.spinner_css} 
            loading={true} 
            color={"#a5a5a5"}
            />
        </div>
      }
      {content}

    </ReactModal>
  }
}

export default Modal;