import React, { Component } from 'react';
import Config from './Config';
import './Sidebar.css';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {items: [{"title":"foo"}, {"title":"bar"}]};
    this.loadMore = this.loadMore.bind(this);
    this.max = 5;
    this.counter = 0;
  }

loadMore(){
  console.log("loadMore");
}

  render() {
    const items = this.state.items;
    return (
       

        <section className="Sidebar">
          <h1>sidebar</h1>
          <div className="flexlist">
              {items.map(item => 
                <div className="foo"><h1>{item.title}</h1></div>
                )}
          </div>
        </section>

    );
  }
}

export default Sidebar;
