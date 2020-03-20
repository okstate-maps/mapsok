import React, { Component } from 'react';
import Config from './Config';
import axios from 'axios';

let execute_sql = function (query, callback, format){
    
    //just for testing////
    //query = "SELECT title FROM okmaps2 LIMIT 10";
    //format = "json";
    if (!callback) {
      callback = function(data){console.log(data)}
    };
    //////////////////////

    var format_str = '';
    if (format){
        format_str = format;
    }
    else {
        format_str = "geojson";
    }

    const params = new URLSearchParams();
    params.append("q", query);
    params.append("format", format_str);

    return (axios.post(this.query_url, params,
        {
          transformRequest: [function(data, headers) { 
              delete headers.common['Content-Type'];
              return data; 
          }]
        }
      )
        .then(callback)

        .catch(function (error){
          console.log(error);
      })
    )
  }




export default execute_sql;