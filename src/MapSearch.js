import { nanoid } from 'nanoid';
import Config from './Config';
import { deserialize } from 'flatgeobuf/geojson';

const EARTH_RADIUS_METERS = 6371008.8;
const DEGREES_TO_RADIANS = Math.PI / 180;

function getFeatureBounds(feature) {
  if (feature.bbox?.length === 4 && feature.bbox.every(Number.isFinite)) {
    return feature.bbox;
  }

  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  const visitCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates)) {
      return;
    }

    if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
      bounds[0] = Math.min(bounds[0], coordinates[0]);
      bounds[1] = Math.min(bounds[1], coordinates[1]);
      bounds[2] = Math.max(bounds[2], coordinates[0]);
      bounds[3] = Math.max(bounds[3], coordinates[1]);
      return;
    }

    coordinates.forEach(visitCoordinates);
  };

  const visitGeometry = (geometry) => {
    if (geometry?.type === 'GeometryCollection') {
      geometry.geometries.forEach(visitGeometry);
    } else {
      visitCoordinates(geometry?.coordinates);
    }
  };
  visitGeometry(feature.geometry);

  return bounds.every(Number.isFinite) ? bounds : null;
}

function sphericalRectangleArea([minX, minY, maxX, maxY]) {
  return EARTH_RADIUS_METERS ** 2
    * (maxX - minX) * DEGREES_TO_RADIANS
    * (Math.sin(maxY * DEGREES_TO_RADIANS) - Math.sin(minY * DEGREES_TO_RADIANS));
}

function centerDistanceMeters(firstBounds, secondBounds) {
  const firstLat = (firstBounds[1] + firstBounds[3]) / 2 * DEGREES_TO_RADIANS;
  const secondLat = (secondBounds[1] + secondBounds[3]) / 2 * DEGREES_TO_RADIANS;
  const latitudeDifference = secondLat - firstLat;
  const longitudeDifference = (
    (secondBounds[0] + secondBounds[2] - firstBounds[0] - firstBounds[2]) / 2
  ) * DEGREES_TO_RADIANS;
  const haversine = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(firstLat) * Math.cos(secondLat) * Math.sin(longitudeDifference / 2) ** 2;
  const clampedHaversine = Math.min(1, Math.max(0, haversine));

  return 2 * EARTH_RADIUS_METERS * Math.atan2(
    Math.sqrt(clampedHaversine),
    Math.sqrt(1 - clampedHaversine)
  );
}

// Rank intersecting feature envelopes by their overlap with the requested bounds.
export async function MapSearch(bbox_str, dataSource) {
  let startTime = performance.now();
  const bbox = bbox_str.split(',').map(Number);
  if (
    bbox.length !== 4
    || !bbox.every(Number.isFinite)
    || bbox[0] > bbox[2]
    || bbox[1] > bbox[3]
  ) {
    throw new Error(`Invalid map search bounding box: ${bbox_str}`);
  }

  const [minX, minY, maxX, maxY] = bbox;
  const bbox_area = sphericalRectangleArea(bbox);
  const bboxes_with_ratios = [];
  const collection = dataSource?.type === 'FeatureCollection'? dataSource: 
                        dataSource?.default?.type === 'FeatureCollection'? dataSource.default
      : null;
  const features = collection ? collection.features : deserialize(dataSource.toString(), {
      rect: { minX, minY, maxX, maxY }
    });

  for await (const feat of features) {
    const featureBounds = getFeatureBounds(feat);
    if (!featureBounds) {
      continue;
    }

    const intersectionBounds = [
      Math.max(minX, featureBounds[0]),
      Math.max(minY, featureBounds[1]),
      Math.min(maxX, featureBounds[2]),
      Math.min(maxY, featureBounds[3])
    ];
    if (
      intersectionBounds[0] > intersectionBounds[2]
      || intersectionBounds[1] > intersectionBounds[3]
    ) {
      continue;
    }

    const feature_area = sphericalRectangleArea(featureBounds);
    const intersection_area = sphericalRectangleArea(intersectionBounds);
    if (feature_area + bbox_area === 0) {
      continue;
    }

    let sim_score = (
      2 * (intersection_area - centerDistanceMeters(bbox, featureBounds))
    ) / (feature_area + bbox_area);

    // Boost boxes contained by the search box without displacing high-similarity matches.
    if (sim_score < 0.1) {
      sim_score = bbox_area > feature_area ? sim_score * 1.1 : sim_score * 0.9;
    }

    if (Config.debug_mode) {
      feat.properties.sim_score = sim_score;
      console.log("sim_score: ", sim_score);
    }

    if (sim_score) {
      bboxes_with_ratios.push({
        similarityScore: sim_score,
        properties: feat.properties,
        geometry: feat.geometry,
        isPinned: false,
        key: nanoid(),
        id: feat.properties.id ?? feat.id
      });
    }
  }

  console.log("Query time:", performance.now() - startTime);
  bboxes_with_ratios.sort((a, b) => b.similarityScore - a.similarityScore);

  if (Config.debug_mode){
    window.debug_boxes = {
      type: 'FeatureCollection',
      features: bboxes_with_ratios.map(({ id, geometry, properties }) => ({
        type: 'Feature',
        id,
        geometry,
        properties
      }))
    };
  }
  return bboxes_with_ratios;
}

export default MapSearch;