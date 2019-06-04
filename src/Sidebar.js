import React, { Component } from 'react';
import _ from 'lodash';
import Config from './Config';
import Item from './Item';
import './Sidebar.css';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.loadMore = this.loadMore.bind(this);
    this.onScroll = _.throttle(this.onScroll.bind(this), 400, {trailing:true});
    this.sidebarRef = React.createRef();

    this.state = {
      scrollHeight: 0,
      clientHeight: 0
    }
  }

  loadMore(){
    console.log("loadMore");
  }

  onScroll(){
    let elem = this.sidebarRef.current;
    if (elem.scrollHeight - elem.scrollTop === elem.clientHeight) {
      console.log("Load more items");     
    }  
  }

  render() {
    const search_results = this.props.search_results.length > 0 ? this.props.search_results : [];
    return (
        <section className="Sidebar">
          <div className="Sidebar-controls"><p>sidebar controls</p></div>
          <div className="Sidebar-wrapper">
            <div onScroll={this.onScroll} ref={this.sidebarRef} className="Sidebar-search-results flexlist">
                {search_results.map(item => 
                  <Item
                    key={"Item"+item.properties.cartodb_id}
                    openModal={this.props.openModal}
                    onItemMouseOver={this.props.onItemMouseOver}
                    onItemMouseOut={this.props.onItemMouseOut}
                    featureProps={item.properties}
                    featureGeom={item.geometry}
                  />
                )}
            </div>
          </div>
        </section>

    );
  }
}

export default Sidebar;
