import Config from "./Config";
import { GeojsonContext } from "./Contexts";
import { useState, useContext } from "react";
import * as Wkt from 'wicket';
import axios from "axios";
import { nanoid } from "nanoid";
import { findWithAttr } from "./Util";



export function TextSearch(props) {
 //contentdm api search reference
    //https://help.oclc.org/Metadata_Services/CONTENTdm/Advanced_website_customization/API_Reference/CONTENTdm_API/CONTENTdm_Server_API_Functions_-_dmwebservices

    //contentdm search string example
    //https://dc.library.okstate.edu/digital/bl/dmwebservices/index.php?q=dmQuery/OKMaps/title^State+of+Sequoyah^all^and/title/title/10/1/0/0/1/0/0/1/json
    
    //collections = !-delimited list of collection aliases, or "all" for all collections.
    
    //searchstrings = a  four-part, ^-delimited group in the order field^string^mode^operator.
    //              - Use "CISOSEARCHALL" for all fields; mode can be "all", "any", "exact", or "none"; operator can be "and" or "or".
    //              - Multiple words in string need to be separated by "+".
    //              - Up to six groups can be included, delimited by "!".
    //              - To browse a collection, specify a single alias and "0" as a searchstrings value. The operator for the last searchstring will be ignored.

    // fields = !-delimited list of field nicknames, listing the fields for which metadata should be returned. 
    //        - A maximum of five fields may be specified. A maximum of 100 bytes is returned for each field.
    
    // sortby = !-delimited list of field nicknames, detailing how the result should be sorted, in field order.
    //        - The field nicknames must appear in the field array. 
    //        - If the last element in the array is specified as "reverse". The sort will be in reverse (descending) order. 
    //        - Use "nosort" to sort the query by relevance.

    // maxrecs = the maximum number of records to return, from 1 to 1024.
    
    // start = the starting number of the first item returned in the result.

    const [searchString, setSearchString] = useState(false);
    const geojson = props.geojson;
    const search_page = props.searchPage;
    //console.log("Search page in TextSearch:",search_page);
    
    let handleClick = function(e){
      executeTextSearch(searchString);
    }
    let handleChange = function(e){
      setSearchString(e.target.value);
    };
    let handleKeyDown = function(e){
      if (e.key === 'Enter'){
        executeTextSearch(searchString);
      }
    }

    let resetTextSearch = function(e){
      updateSearchResults([]);
      setSearchString('');
      document.getElementById("textsearch").value= '';
    }

    let updateSearchResults = props.updateSearchResults;
    
    const findGeomForResult = function(record){
      let index = findWithAttr(geojson.features, "id", record.id);
      //console.log(index);
      //console.log(geojson.features[index]);
      let geom = index >= 0 ? geojson.features[index].geometry : null;
      return geom;
    }

    let executeTextSearch = function(search_text){
      let collections = Config.collections.join("!");
      search_text = search_text.replaceAll(" ","+");
      let searchstrings = `title^${search_text}^all^or`;
      //let searchstrings = `CISOSEARCHALL^${search_text}^any^or`;
      
      let fields = `title!identi`; //includes title and all possible identifer fields (which will eventually all become identi!)
      let sortby = 'nosort';
      let maxrecs = 10 * (search_page + 1) ;
      let start = 1;
      console.log("search page", search_page);
  
      let text_search_string = "https://dc.library.okstate.edu/digital/bl/dmwebservices/index.php?q=dmQuery" +
          `/${collections}/${searchstrings}/${fields}/${sortby}/${maxrecs}/${start}/0/0/1/0/0/1/json`;
      let that = this;
  
      axios.get(text_search_string, {
        transformResponse: [function (data) {
          // Do whatever you want to transform the data
          let json = JSON.parse(data);
          let wkt = new Wkt.Wkt();
          let d = json.records.map((v, i) => {
            console.log(v);
            v.id = v.identi;
            v.geometry = findGeomForResult(v);
            v.properties = {};
            v.properties.title = v.title;
            v.properties.cdmn = v.pointer;
            v.properties.cdmco = v.collection;
            v.key = nanoid();
            return v;
          });
          //console.log(d);
          return d
          }]
        })
        
        .then((data)=>{
          console.log(data);
          updateSearchResults(data)
        });
    }



      return (
        <>
          <div>
            <input type='search' 
              name="textsearch"
              id="textsearch"
              className="textinput"
              defaultValue={""}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              />
              <button onClick={handleClick}>Search text</button>
          </div>
          
          <div>
            <button onClick={resetTextSearch}>Reset search</button>
          </div>
        </>
      )
}



   


