module.exports = {
  "MB_TOKEN": "pk.eyJ1Ijoia3JkeWtlIiwiYSI6Ik15RGcwZGMifQ.IR_NpAqXL1ro8mFeTIdifg",
  "CARTO_USER" = "krdyke";
  "MB_TOKEN" = "pk.eyJ1Ijoia3JkeWtlIiwiYSI6Ik15RGcwZGMifQ.IR_NpAqXL1ro8mFeTIdifg";
  "MAPZEN_KEY" = "mapzen-6dXEegt";
  "TABLE_NAME" = "okmaps2";
  "PER_PAGE" = 10;
  "PAGE_NUMBER" = 1;
  "DEFAULT_BBOX_STRING" = "-103.62304687500001,31.690781806136822,-93.40576171875001,39.57182223734374";
  "QUERY_URL" = "https://{{username}}.carto.com/api/v2/sql".replace("{{username}}", CARTO_USER);
  "BASE_URL" = "SELECT {{fields}} FROM {{table_name}}";
  "//CDM_ROOT" = "http://dc.library.okstate.edu";
  "CDM_ROOT" = "https://cdm17279.contentdm.oclc.org";
  "REF_URL" = CDM_ROOT + "/cdm/ref/collection/OKMaps/id/";
  "IMG_URL" = CDM_ROOT + "/utils/ajaxhelper/?CISOROOT=OKMaps&CISOPTR={{contentdm_number}}&action=2&DMSCALE={{scale}}&DMWIDTH={{width}}&DMHEIGHT={{height}}&DMX=0&DMY=0&DMTEXT=&DMROTATE=0";
  "IIIF_BASE_URL" = CDM_ROOT + "/digital/iiif/OKMaps/{{contentdm_number}}/";
  "IIIF_INFO_URL" = IIIF_BASE_URL + "info.json";
  "IIIF_MAX_URL" = IIIF_BASE_URL + "full/max/0/default.jpg";
  
  };