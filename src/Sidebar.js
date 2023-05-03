import React, { Component, PureComponent } from 'react';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import * as Wkt from 'wicket';
import axios from 'axios';
import { ResizableBox } from 'react-resizable';

import Config from './Config';
import { Item, PinnedItem } from './Item';
import { findWithAttr } from './Util';
import './Sidebar.css';

class Sidebar extends Component {
  //static whyDidYouRender = false;

  constructor(props) {
    super(props);
    this.TEXT_SEARCH_URL_BASE = 'https://dc.library.okstate.edu/digital/bl/dmwebservices/index.php?q=dmQuery/OKMaps';
    this.wkt = new Wkt.Wkt();
    this.loadMore = this.loadMore.bind(this);
    this.onScroll = _.throttle(this.onScroll.bind(this), 400, {trailing:true});
    this.sidebarRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleItemPinning = this.handleItemPinning.bind(this);
    this.executeTextSearch = this.executeTextSearch.bind(this);
    this.updateSearchResults = this.updateSearchResults.bind(this);

    this.state = {
      scrollHeight: 0,
      clientHeight: 0,
      search_page: 0,
      searchText: false
    }
  }

  loadMore(){
    console.log("loadMore");
  }

  updateSearchResults(results) {
    this.props.updateSearchResults(results);
  }

  handleChange(e){
    //console.log(Wkt);
    if (e.target.value.length < 4){
      return;
    }
    else {
      this.executeTextSearch(e.target.value);
      console.log("trigger text search now");
    }
  }

  handleItemPinning(item) {
    console.log("Sidebar::handlePinning: ", item);
    //console.log(this);
    this.setState({"pinningChange": true});
    this.props.handleItemPinning(item);
  }
  

  executeTextSearch(search_text){
    //ceontentdm api search reference
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

    let collections = 'OKMaps';
    //let searchstrings = `title!full!source!audien^${search_text}^all^or`;
    let searchstrings = `title^${search_text}^any^or`;
    
    let fields = `title!dmrecord!coordi`;
    let sortby = 'nosort';
    let maxrecs = '10';
    let start = '1';

    let text_search_string = "https://dc.library.okstate.edu/digital/bl/dmwebservices/index.php?q=dmQuery" +
        `/${collections}/${searchstrings}/${fields}/${sortby}/${maxrecs}/${start}/0/0/1/0/0/1/json`;
    let that = this;

    axios.get(text_search_string, {
      transformResponse: [function (data) {
        // Do whatever you want to transform the data
        let json = JSON.parse(data);
        let d = json.records.map((v, i) => {
          //console.log(v);
          v.properties = v;
          v.properties.contentdm_number = v.properties.dmrecord;
          if (v.properties.coordi !== ""){
            try {
              v.geometry = that.wkt.read(v.properties.coordi).toJson();
            }
            catch (e) {
              console.log("malformed WKT", v.properties);
            }
          }
          
          v.key = nanoid();
          v.id = v.properties.collection + v.properties.contentdm_number;
          return v;
        });
        //console.log(d);
        return d
        }]
      })
      
      .then((data)=>{
        //console.log(data);
        that.updateSearchResults(data)
      });
  }

  componentDidUpdate(prevProps, prevState){
    
    if (!_.isEqual(prevProps.search_results.slice(10), this.props.search_results.slice(10))) {
      console.log('search results changed');
      
      if (prevState.search_page !== 0){
        this.setState({search_page: 0});
      } 
      
      this.sidebarRef.current.scrollTop = 0;
    }
    if (prevProps.pinned_features.length !== this.props.pinned_features.length){
      //this.forceUpdate(); 
    }
 
  }

  onScroll(){
    let elem = this.sidebarRef.current;
    if (document.body.clientWidth >= 600){
      if (Math.abs(elem.scrollHeight - elem.clientHeight - elem.scrollTop) <= 1) {
        this.setState({search_page: this.state.search_page + 1});
      }
    }  
  }

  onWheel(e){
   if (document.body.clientWidth < 600){

    
    let elem  = e.target,
        scrollUnit = 50,

        // deltaMode indicates if the deltaY value is pixels or lines (0 for pixels, 1 for lines, 2 for page)
        deltaMode = e.deltaMode,

        //if the deltamode is anything but pixels (0), use scroll unit to calculate scroll amount
        scrollSize = deltaMode === (1 || 2) ? e.deltaY * scrollUnit: e.deltaY;

    elem.scrollLeft = elem.scrollLeft + scrollSize;
   }
  }

  render() {
    let search_page = this.state.search_page;
    let search_results = this.props.search_results || [];
    let pinned_features = this.props.pinned_features || [];
    let display_results = [];
    console.log("render sidebar");
    
    if (search_results.length > 0){
      //console.log("search_results", search_results);
      display_results = search_results.slice(0,(search_page*10)+10);
      //console.log("display_results:", display_results);
    }

    
    return (
        <section className="Sidebar">
            <div className="Sidebar-controls">
              <input type='search' 
                  name="textsearch"
                  id="textsearch"
                  className="textinput"
                  defaultValue={this.state.searchText === true ? this.state.searchText : ""}
                  onChange={this.handleChange}/>
            </div>


            <div
              className="Sidebar-pinned-features flexlist">
            

                 {pinned_features.map(item =>
                     <PinnedItem
                        className="Item-pinned"
                        key={item.key}
                        id={item.id}
                        openModal={this.props.openModal}
                        featureProps={item.properties}
                        featureGeom={item.geometry}
                        handleItemPinning={this.handleItemPinning}
                      />
                    )}
            </div>
            <div onWheel={this.onWheel}
              onScroll={this.onScroll} 
                ref={this.sidebarRef} 
                className="Sidebar-search-results flexlist">
                  {display_results.length === 0 && 
                    <div className="try-searching-text-container">
                      <span className="try-searching-text">Pan or zoom the map, or use the search box above to get started.</span>
                    </div>                 
                  }
         
                {display_results.map(item => 
                  <Item
                    key={item.key}
                    id={item.id}
                    openModal={this.props.openModal}
                    onItemMouseOver={this.props.onItemMouseOver}
                    onItemMouseOut={this.props.onItemMouseOut}
                    featureProps={item.properties}
                    featureGeom={item.geometry}
                    handleItemPinning={this.handleItemPinning}
                    isPinned={findWithAttr(pinned_features, "id", item.id) !== -1}
                  />
                )}
            </div>
     
       </section>

    );
  }
}

export default Sidebar;
