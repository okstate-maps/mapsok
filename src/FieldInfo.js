import axios from 'axios';
import Config from './Config';

export function constructFieldInfoRequestUrl (collection){
  return Config.fieldinfo_url.replace("{{cdm_collection}}", collection); 
}

export function requestFieldInfo (url) {
    return axios.get(url);
  }

export default constructFieldInfoRequestUrl;