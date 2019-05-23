const Config = {
	"mapboxToken": "pk.eyJ1Ijoia3JkeWtlIiwiYSI6Ik15RGcwZGMifQ.IR_NpAqXL1ro8mFeTIdifg",
	"carto_user": "krdyke",
	"carto_table": "okmaps2",
	"carto_base_api": "https://{{username}}.carto.com/api/v2/sql",
	"carto_base_query": "SELECT {{fields}} FROM {{table_name}}",
	"carto_table_fields": [
	  "the_geom",
	  "title", 
	  "cartodb_id", 
	  "original_date",
	  "contentdm_number",
	  "collection"
	]
}

export default Config;