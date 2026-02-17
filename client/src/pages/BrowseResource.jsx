import React from "react";
import BrowseHeader from "../components/BrowseHeader";
import FilteredResourceExplorer from "../components/FilteredResourceExplore";

function BrowseResource() {
  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0f] min-h-0">
      <BrowseHeader />
      <div className="flex flex-1 min-h-0">
        <FilteredResourceExplorer />
      </div>
    </div>
  );
}

export default BrowseResource;
