import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Config from './Config';
import './Sidebar.css';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.loadMore = this.loadMore.bind(this);
  }

loadMore(){
  return `<div className="foo"></div> 
        <div className="foo"></div>
        <div className="foo"></div>
        <div className="foo"></div>
        <div className="foo"></div>
        <div className="foo"></div>`

}

  render() {
    return (
        <section className="Sidebar">
          <h1>sidebar</h1>
          <div className="flexlist">
            <InfiniteScroll useWindow={false} loadMore={this.loadMore()}>
              <div className="foo"></div>
              <div className="foo"></div>
              <div className="foo"></div>
              <div className="foo"></div>
                <div className="foo"></div>
              <div className="foo"></div>
             
             
            </InfiniteScroll>
          </div>
        </section>

    );
  }
}

export default Sidebar;
