import React, { Component } from 'react';
import axios from 'axios';
import L from 'leaflet';

import 'leaflet-iiif';
import { Vault } from '@iiif/helpers/vault';
import Config from './Config';


export function iiifConstructManifestUrl (contentdm_number, cdm_collection) {
  const cdm_num = contentdm_number;
  const cdm_coll = cdm_collection;
  let iiifManifestUrl = Config.manifest_url
         .replace("{{contentdm_number}}", cdm_num)
         .replace("{{cdm_collection}}", cdm_coll);
  return iiifManifestUrl;
}

export function iiifConstructImageUrl (contentdm_number, cdm_collection) {
  const cdm_num = contentdm_number;
  const cdm_coll = cdm_collection;
  console.log("IIIF IMAGE: ", cdm_num, cdm_coll);
  let iiifImageUrl = Config.image_url
         .replace("{{contentdm_number}}", cdm_num)
         .replace("{{cdm_collection}}", cdm_coll);
  return iiifImageUrl;
}

export function iiifRequestManifest (url){
  const vault = new Vault();
  console.log("Requesting IIIF Manifest: ", url);
  return vault.loadManifest(url);
}

export default iiifConstructManifestUrl;