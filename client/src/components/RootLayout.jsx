import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import ChatBox from './ChatBox'
import { Outlet } from 'react-router-dom'

function RootLayout() {
    return (
        <div className="bg-[#0a0a0f] min-h-screen">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
            <ChatBox />
        </div>
    )
}

export default RootLayout