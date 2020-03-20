import axios from 'axios';
import Config from './Config';

export function iiifConstructManifestUrl (featureProps) {
  let cdm_num = featureProps.contentdm_number;
  let cdm_coll = featureProps.cdm_collection;
  let iiifManifestUrl = Config.manifest_url
         .replace("{{contentdm_number}}", cdm_num)
         .replace("{{cdm_collection}}", cdm_coll);
  return iiifManifestUrl;
}

export function iiifRequestManifest (url){
    return axios.get(url);
}


export default iiifConstructManifestUrl;