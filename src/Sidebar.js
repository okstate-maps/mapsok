import React, { Component, PureComponent } from 'react';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { ResizableBox } from 'react-resizable';
import Config from './Config';

import { TextSearch } from './TextSearch';
import { Item, PinnedItem } from './Item';
import { findWithAttr } from './Util';
import './Sidebar.css';


class Sidebar extends Component {
  //static whyDidYouRender = false;

  constructor(props) {
    super(props);
    
    this.loadMore = this.loadMore.bind(this);
    this.onScroll = _.throttle(this.onScroll.bind(this), 400, {trailing:true});
    this.sidebarRef = React.createRef();
    this.resetSidebar = this.resetSidebar.bind(this);
    //this.handleChange = this.handleChange.bind(this);
    this.handleItemPinning = this.handleItemPinning.bind(this);
    //this.executeTextSearch = this.executeTextSearch.bind(this);
    //this.updateSearchResults = this.updateSearchResults.bind(this);

    this.state = {
      scrollHeight: 0,
      clientHeight: 0,
      search_page: 0,
      searchText: false,
      pinningChange: false
    }
  }

  loadMore(){
    console.log("loadMore");
  }

  resetSidebar(){
    this.setState({search_page: 0});  
    this.sidebarRef.current.scrollTop = 0;
    this.props.toggleResetSidebar(false);
  }

  handleItemPinning(item) {
    console.log("Sidebar::handlePinning: ", item);
    //console.log(this);
    this.setState({"pinningChange": true});
    this.props.handleItemPinning(item);
  }
  

  // shouldComponentUpdate(nextProps, nextState){
  //   if (this.props.pinned_features.length !== nextProps.pinned_features.length){
  //     return true;
  //   }
  //   return true;
  // }   

  componentDidUpdate(prevProps, prevState){
    if (this.props.reset_sidebar){
      this.resetSidebar();
    }
    
    // if (!_.isEqual(prevProps.search_results.slice(10), this.props.search_results.slice(10))) {
    //   console.log('search results changed');
      
    //   if (prevState.search_page !== 0){
    //     this.setState({search_page: 0});
    //   } 
      
    //   this.sidebarRef.current.scrollTop = 0;
    // }
    // if (prevProps.pinned_features.length !== this.props.pinned_features.length){
    //   //this.forceUpdate(); 
    // }
    if (this.state.pinningChange) {
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
    //console.log("search_page", search_page);
    let search_results = this.props.search_results || [];
    let pinned_features = this.props.pinned_features || [];
    let display_results = [];
    let geojson = this.props.geojson;
    //console.log("render sidebar");
    //console.log(this.props.updateSearchResults);
    
    if (search_results.length > 0){
      //console.log("search_results", search_results);
      display_results = search_results.slice(0,(search_page*10)+10);
      //console.log("display_results:", display_results);
    }

    
    return (
        <section className="Sidebar">
            <div className="Sidebar-controls">
              <TextSearch
                geojson={geojson}
                updateSearchResults={this.props.updateSearchResults}
                searchPage={search_page}/>
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
