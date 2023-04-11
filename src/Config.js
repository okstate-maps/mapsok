const Config = {
	"mapboxToken": "pk.eyJ1Ijoia3JkeWtlIiwiYSI6Ik15RGcwZGMifQ.IR_NpAqXL1ro8mFeTIdifg",
	"arcgisAPIkey": "AAPK7f7338ef408f47029a5a7bb1560ef7f7kBpJhlfXEbyJPtP6RI1dn4jk3p2fitP5kVOC0733r85Cbf_FNjJebmr8XvtubbfZ",
	"carto_user": "krdyke",
	"carto_table": "okmaps2",
	"carto_base_api": "https://{{username}}.carto.com/api/v2/sql",
	"collections": ["mccasland", "OKMaps"],
	"fieldinfo_url": "https://dc.library.okstate.edu/digital/bl/dmwebservices/index.php?q=dmGetCollectionFieldInfo/{{cdm_collection}}/json",
	"image_url": "https://dc.library.okstate.edu/iiif/2/{{cdm_collection}}:{{contentdm_number}}/info.json",
	"manifest_url": "https://dc.library.okstate.edu/iiif/2/{{cdm_collection}}:{{contentdm_number}}/manifest.json",
	"thumbnail_url": "https://dc.library.okstate.edu/iiif/2/{{cdm_collection}}:{{contentdm_number}}/full/!160,120/0/default.jpg",

	"carto_base_query": "SELECT {{fields}} FROM {{table_name}}",
	"carto_table_fields": [
	  "the_geom",
	  "title", 
	  "cartodb_id", 
	  "original_date",
	  "contentdm_number",
	  "collection",
	  "cdm_collection"
	]
}

export default Config;