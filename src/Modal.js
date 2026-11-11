import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import ClipLoader from 'react-spinners/SyncLoader';
import { iiifConstructManifestUrl, iiifRequestManifest } from './IIIF';
import Viewer from "@nulib/clover";
import * as Clover from "@nulib/clover";
import "@nulib/clover/styles.css";

ReactModal.setAppElement('#root');

const spinnerCss = {
  position: "absolute",
  top: "50%",
  left: "50%",
  zIndex: "1000000",
  padding: "10px"
};
function MyLayout(props) {
  return (
    <Clover.Root {...props}>
      <Clover.Label as="h2" />
      <Clover.Body />
      <Clover.Panel>
        <Clover.Download/>
      </Clover.Panel>

    </Clover.Root>
  );
}
 
function Modal(props) {
  const modalRef = useRef(null);
  const [manifestId, setManifestId] = useState(false);
  const [manifestMetadata, setManifestMetadata] = useState(false);
  const [formattedContent, setFormattedContent] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const formatContent = useCallback((manifest_id) => {
    
    return (
      <div id='modalContent'>
        <Viewer iiifContent={manifest_id} template={MyLayout} />
      </div>
    );
  }, []);

  useEffect(() => {
    console.log("Modal::manifestEffect");
    if (typeof manifestId === "string" && manifestId.length > 0) {
      setFormattedContent(
        formatContent(
          manifestId, 
          manifestMetadata, 
          props.modalInfo?.modalCollection
        )
      );
    }
  }, [manifestId, manifestMetadata, props.modalInfo, formatContent]);

  const afterOpenModal = useCallback(() => {
    console.log("Modal::afterOpenModal");
    const modalInfo = props.modalInfo;
    console.log("     ::modalInfo::", modalInfo);
    if (!modalInfo) return;

    const manifestUrl = iiifConstructManifestUrl(
      modalInfo.modalCollectionId,
      modalInfo.modalCollection
    );

    setShowSpinner(true);
    iiifRequestManifest(manifestUrl).then((result) => {
      setManifestId(result.id.replace("/iiif/", "/iiif/2/"));
      setManifestMetadata(result.metadata);
      setShowSpinner(false);
    });
  }, [props.modalInfo]);

  const getParent = useCallback(() => (
    document.querySelector('#modalRoot')
  ), []);

  const handleCloseModal = useCallback(() => {
    setManifestId(false);
    setFormattedContent(false);
    setManifestMetadata(false);
    props.closeModal();
  }, [props.closeModal]);

  console.log("Modal::render");
  return (
    <ReactModal
      id='modalContainer'
      ref={modalRef}
      closeTimeoutMS={500}
      className='Modal-Content'
      key={'modal'}
      isOpen={props.isOpen}
      onAfterOpen={afterOpenModal}
      onRequestClose={handleCloseModal}
      parentSelector={getParent}
      contentLabel='Modal'
    >
      <button className="modalCloseButton" onClick={handleCloseModal}>X</button>

      {showSpinner &&
        <div className="modal-loader-div">
          <ClipLoader
            cssOverride={spinnerCss}
            loading={true}
            color={"#a5a5a5"}
          />
        </div>
      }
      {formattedContent}
    </ReactModal>
  );
}

export default memo(Modal);
