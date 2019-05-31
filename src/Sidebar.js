import React, { Component } from 'react';
import Config from './Config';
import './Sidebar.css';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.loadMore = this.loadMore.bind(this);
    this.max = 5;
    this.counter = 0;
  }

loadMore(){
  console.log("loadMore");
}

  render() {
    const search_results = this.props.search_results.length > 0 ? this.props.search_results : [];
    const thumbnail_url = Config.thumbnail_url;
    return (
        <section className="Sidebar">
          <h1>sidebar</h1>
          <div className="flexlist">
              {search_results.map(item => 
                <div onClick={this.props.openModal} className="foo item flexlist">
                  <div className="thumbnail-background">
                    <img className="thumbnail-img" src={thumbnail_url
                                .replace("{{cdm_collection}}", item.properties.cdm_collection)
                                .replace("{{contentdm_number}}", item.properties.contentdm_number)}
                      />
                  </div>
                  <p>{item.properties.title}</p>

                  </div>
                )}
          </div>
        </section>

    );
  }
}

export default Sidebar;
