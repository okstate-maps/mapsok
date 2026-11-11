import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { TextSearch } from './TextSearch';
import { Item, PinnedItem } from './Item';
import { findWithAttr } from './Util';


function Sidebar(props) {
  const [searchPage, setSearchPage] = useState(0);
  const [, setPinningChange] = useState(false);
  const sidebarRef = useRef(null);

  const resetSidebar = useCallback(() => {
    setSearchPage(0);
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
    }
    props.toggleResetSidebar(false);
  }, [props.toggleResetSidebar]);

  const handleItemPinning = useCallback((item) => {
    console.log("Sidebar::handlePinning: ", item);
    setPinningChange(true);
    props.handleItemPinning(item);
  }, [props.handleItemPinning]);

  useEffect(() => {
    if (props.reset_sidebar) {
      resetSidebar();
    }
  }, [props.reset_sidebar, resetSidebar]);

  const onScroll = useMemo(() => _.throttle(() => {
    const elem = sidebarRef.current;
    if (!elem) return;
    if (document.body.clientWidth >= 600){
      if (Math.abs(elem.scrollHeight - elem.clientHeight - elem.scrollTop) <= 1) {
        setSearchPage((current) => current + 1);
      }
    }  
  }, 400, { trailing: true }), []);

  useEffect(() => () => onScroll.cancel(), [onScroll]);

  function onWheel(e) {
    if (document.body.clientWidth < 600) {
      const elem = e.target;
      const scrollUnit = 50;
      const deltaMode = e.deltaMode;
      const scrollSize = deltaMode === (1 || 2) ? e.deltaY * scrollUnit : e.deltaY;
      elem.scrollLeft = elem.scrollLeft + scrollSize;
    }
  }

  const searchPageValue = searchPage;
    //console.log("search_page", search_page);
    const search_results = props.search_results || [];
    const pinned_features = props.pinned_features || [];
    let display_results = [];
    const geojson = props.geojson;
    //console.log("render sidebar");
    //console.log(this.props.updateSearchResults);
    
    if (search_results.length > 0){
      //console.log("search_results", search_results);
      display_results = search_results.slice(0,(searchPageValue*10)+10);
      //console.log("display_results:", display_results);
    }

    
    return (
        <section className="Sidebar">
            <div className="Sidebar-controls">
              <TextSearch
                geojson={geojson}
                updateSearchResults={props.updateSearchResults}
                searchPage={searchPageValue}/>
            </div>


            <div
              className="Sidebar-pinned-features flexlist">
            

                 {pinned_features.map(item =>
                     <PinnedItem
                        className="Item-pinned"
                        key={item.key}
                        id={item.id}
                        openModal={props.openModal}
                        featureProps={item.properties}
                        featureGeom={item.geometry}
                        handleItemPinning={handleItemPinning}
                      />
                    )}
            </div>
            <div onWheel={onWheel}
              onScroll={onScroll}
                ref={sidebarRef}
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
                    openModal={props.openModal}
                    onItemMouseOver={props.onItemMouseOver}
                    onItemMouseOut={props.onItemMouseOut}
                    featureProps={item.properties}
                    featureGeom={item.geometry}
                    handleItemPinning={handleItemPinning}
                    isPinned={findWithAttr(pinned_features, "id", item.id) !== -1}
                  />
                )}
            </div>
       </section>
    );
}

export default memo(Sidebar);
