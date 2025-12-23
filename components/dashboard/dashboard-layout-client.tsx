'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/dashboard/sidebar'
import Header from '@/components/dashboard/header'

interface DashboardLayoutClientProps {
    children: React.ReactNode
    user: any
    userRole: string
}

export default function DashboardLayoutClient({
    children,
    user,
    userRole
}: DashboardLayoutClientProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="h-screen relative flex bg-[#F5F5F7] overflow-hidden">
            {/* Sidebar */}
            <div className={`hidden md:block h-full z-[80] transition-all duration-300 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
                <Sidebar role={userRole} isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header user={user} userRole={userRole} />
                <main className="flex-1 overflow-auto bg-[#F5F5F7]">
                    <div className="p-8 w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay would go here if we implemented mobile support fully, keeping simple for now */}
        </div>
    )
}
