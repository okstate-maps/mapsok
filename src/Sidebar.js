import React, { Component } from 'react';
import Config from './Config';
import Item from './Item';
import './Sidebar.css';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.loadMore = this.loadMore.bind(this);
  }

  loadMore(){
    console.log("loadMore");
  }

  render() {
    const search_results = this.props.search_results.length > 0 ? this.props.search_results : [];
    return (
        <section className="Sidebar">
          <div className="Sidebar-controls"><p>sidebar controls</p></div>
          <div className="Sidebar-wrapper">
            <div className="Sidebar-search-results flexlist">
                {search_results.map(item => 
                  <Item
                    key={item.properties.cartodb_id}
                    openModal={this.props.openModal} 
                    featureProps={item.properties}
                  />
                )}
            </div>
          </div>
        </section>

    );
  }
}

export default Sidebar;
