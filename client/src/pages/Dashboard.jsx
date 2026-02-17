import React from 'react'
import HomeContent from '../components/HomeContent'
import ResourceSection from '../components/ResourceSection'

function Dashboard() {
  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0f] min-h-0">
      <HomeContent />
      <ResourceSection />
    </div>
  )
}

export default Dashboard
