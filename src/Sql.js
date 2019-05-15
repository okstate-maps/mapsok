import React, { Component } from 'react';
import Config from './Config';
import axios from 'axios';

class Sql extends Component {
  
  constructor(props, context) {
    super(props)
    this.carto_user = Config.carto_user;
    this.carto_table = Config.carto_table;
    this.execute_sql = this.execute_sql.bind(this);

   }

  execute_sql(query, callback, format){
    var format_str = '';
    if (format){
        format_str = format;
    }
    else {
        format_str = "geojson";
    }
    return (axios.post(okm.G.QUERY_URL, {
        data: {
          format: format_str,
          q: query
        },
        type: "POST",
      })
        .then(callback)
        .catch(function (error){
          console.log(error);
      })
    )
  }


  export default Sql;