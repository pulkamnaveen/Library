import React from 'react'
import SearchHeader from '../components/SearchHeader'
import AdvancedSearch from '../components/AdvancedSearch'

function SearchPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0f] min-h-0">
      <SearchHeader />
      <AdvancedSearch />
    </div>
  )
}

export default SearchPage
