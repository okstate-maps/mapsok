import React, { memo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import CircleLoader from 'react-spinners/CircleLoader';
import Config from './Config';
import { nanoid } from 'nanoid';

export const Item = memo(function Item(props) {
  const [thumbnailLoading, setThumbnailLoading] = useState(true);
  const [, setPinning] = useState(false);

  function openModal() {
    console.log("openModal");
    props.openModal(props.featureProps);
  }

  function onChange(e) {
    console.log("Item::onChange::Pinning : ", props);
    setPinning(e.currentTarget.checked);
    props.handleItemPinning({
      "type": "Feature",
      "geometry": props.featureGeom,
      "properties": props.featureProps,
      "id": props.id,
      "key": nanoid(),
      "isPinned": e.currentTarget.checked
    });
  }

  function onMouseEnter() {
    props.onItemMouseOver(props.featureGeom);
  }

  function onMouseLeave() {
    props.onItemMouseOut();
  }

  function onThumbnailLoad() {
    setThumbnailLoading(false);
  }

  function onThumbnailError() {
    setThumbnailLoading(false);
  }

  const contentdm_number = props.featureProps["cdmn"];
  const cdm_collection = props.featureProps["cdmco"];
  const thumbnail_url = Config.thumbnail_url.replace("{{contentdm_number}}", contentdm_number)
                                            .replace("{{cdm_collection}}", cdm_collection);
  const pin_item_id = nanoid();

  return (
         <button onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              className="item flexlist">
            <div className="pin-item-wrapper">
              <label htmlFor={pin_item_id}>
                <FontAwesomeIcon
                  icon={props.isPinned ? faCheckSquare : faSquare}
                  size='xl' />
              <input name="pin-item"
                     className="pin-checkbox"
                     id={pin_item_id}
                     onChange={onChange}
                     type="checkbox"
                     checked={props.isPinned} />
                     </label>
            </div>
            <div onClick={openModal} className="modal-trigger-wrapper">
                <p className="item-title-long">{props.featureProps.title.length >= 75 ? props.featureProps.title.slice(0,75)+ "...": props.featureProps.title}</p>
                <p className="item-title-short">{props.featureProps.title.length >= 25 ? props.featureProps.title.slice(0,25)+ "...": props.featureProps.title}</p>
                <div className="thumbnail-background">
                  <CircleLoader color={'#ff6600'} loading={thumbnailLoading}/>
                  <img className="feature-thumbnail"
                      onLoad={onThumbnailLoad}
                      onError={onThumbnailError}
                      loading="lazy"
                      alt={"thumbnail image for " + props.featureProps.title}
                      src={thumbnail_url}
                    />
                </div>
            </div>
          </button>
  );
});


export const PinnedItem = memo(function PinnedItem(props) {
  const [thumbnailLoading, setThumbnailLoading] = useState(true);
  const [is_bouncing, setIsBouncing] = useState(false);

  function openModal() {
    console.log("openModal");
    props.openModal(props.featureProps);
  }

  function onClick() {
    props.handleItemPinning({
      "id": props.id
    });
  }

  function onMouseEnter() {
    setIsBouncing(true);
  }

  function onMouseLeave() {
    setIsBouncing(false);
  }

  function onThumbnailLoad() {
    setThumbnailLoading(false);
  }

  const contentdm_number = props.featureProps["cdmn"];
  const cdm_collection = props.featureProps["cdmco"];
  const unpin_id = nanoid();
  const thumbnail_url = Config.thumbnail_url.replace("{{contentdm_number}}", contentdm_number)
                                            .replace("{{cdm_collection}}", cdm_collection);

  return (
         <button
              className="pinned-item flexlist">
            <div className="unpin-item-wrapper">
              <label htmlFor={unpin_id}
                      onMouseEnter={onMouseEnter}
                      onMouseLeave={onMouseLeave} >

                <FontAwesomeIcon
                  icon={faThumbtack}
                  size='xl'
                  bounce={is_bouncing}/>
                <input className="unpin-checkbox"
                        type="checkbox"
                        id={unpin_id}
                        checked
                        name="unpin-item" 
                        onChange={onClick}/>
              </label>
            </div>
            <div onClick={openModal} className="modal-trigger-wrapper">
                <p>{props.featureProps.title.length >= 75 ?
                      props.featureProps.title.slice(0,75) +
                      "...": props.featureProps.title}</p>
                <div className="thumbnail-background">
                  <CircleLoader color={'#ff6600'}
                                loading={thumbnailLoading}/>
                  <img className="feature-thumbnail"
                      onLoad={onThumbnailLoad}
                      alt={"thumbnail image for " + props.featureProps.title}
                      src={thumbnail_url}
                    />
                </div>
            </div>
          </button>
  );
});


export default Item;
