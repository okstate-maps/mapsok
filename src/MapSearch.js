import { useContext } from 'react';
// turf imports (rather than importing the whole deal)
  import bboxPolygon from '@turf/bbox-polygon';
  import { featureEach } from '@turf/meta';
  import center from '@turf/center';
  import intersect from '@turf/intersect';
  import booleanIntersects from '@turf/boolean-intersects';
  import distance from '@turf/distance';
  import area from '@turf/area';

import { nanoid } from 'nanoid';
import Config from './Config';
//import { GeojsonContext } from './Contexts';

//Calculate the Ruzicka similarity between the search box and all intersecting bboxes
//while also accounting for distance between centroids
export function MapSearch(bbox_str, geojson) {
  //const geojson = useContext(GeojsonContext);
    
  let startTime = performance.now();
  let bboxes = geojson;
  let bboxes_with_ratios = []; 

  const bboxStringToPolygon = (bbox_str) => {
    let a = bbox_str.split(",");
    let bbox_array = [a[0],a[1], a[2],a[3]];
    return bboxPolygon(bbox_array);
  }
  let bbox_polygon = bboxStringToPolygon(bbox_str);
  

  featureEach(bboxes, function (feat, index){
    let sim_score, sim_score2;
    let intersection_area, union_area, feat_area, feat_center, bbox_area;
    let bbox_center = center(bbox_polygon);

    if (bbox_polygon && booleanIntersects(bbox_polygon, feat)) {
        let intersection= intersect(bbox_polygon, feat);
        feat_center = center(feat);
        let center_distance = distance(bbox_center, feat_center);

        if (intersection){
          intersection_area = area(intersection) - center_distance; //subtract distance between centers
          feat_area = area(feat);
          bbox_area = area(bbox_polygon);
        }
        
      sim_score = (2 * intersection_area) / (feat_area + bbox_area);
      
      //I'd like to give a little boost to boxes contained within the search box,
      //as I believe users would like to see those before maps that cover
      //the entirety of the search box and then some. It needs to be weighted so 
      //as to not throw out the cases where the similarity is high enough already....

      if (sim_score <0.1){
        sim_score = (bbox_area > feat_area) ? sim_score * 1.1 : sim_score * 0.9;
      }

      if (Config.debug_mode){
        feat.properties.sim_score = sim_score
      }
    }
    else {
      sim_score = 0;
    }

    if (Config.debug_mode){
      console.log("sim_score: ", sim_score);
    }
    
    //console.log(feat.properties);
    if (sim_score) {
      let id = feat.id;
      //console.log(id);
      bboxes_with_ratios.push(
        {
          "similarityScore":sim_score,
        // "similarityScore2":sim_score2,
          "properties": feat.properties,
          "geometry": feat.geometry,
          "isPinned": false,
          "key": nanoid(),
          "id": id
        }
      );
    } 
  });  

  console.log("Query time:", performance.now() - startTime);
  bboxes_with_ratios = bboxes_with_ratios.sort((a,b) => {
    return b.similarityScore - a.similarityScore;
  });

  if (Config.debug_mode){
    window.debug_boxes = geojson;
  }
    return bboxes_with_ratios;
  }

export default MapSearch;