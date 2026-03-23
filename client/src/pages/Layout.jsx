import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { LogOut } from 'lucide-react'
import { Protect, SignIn, useClerk, useUser } from '@clerk/clerk-react'

const Layout = () => {
    const navigate = useNavigate()
    const {user} = useUser()
    const {signOut, openUserProfile} = useClerk()

  return user ? (
    <div className='flex flex-col items-start justify-start h-screen overflow-hidden'>
        <nav className='sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 py-1.5 w-full shadow-sm'>
            <img className='cursor-pointer w-24 sm:w-28 transition-all hover:opacity-80' onClick={()=>navigate('/')} src={assets.logo} alt="logo" />
            
            <div className='flex items-center gap-6'>
                {/* User Profile Summary */}
                <div onClick={openUserProfile} className='flex gap-3 items-center cursor-pointer hover:bg-slate-50 p-1.5 px-3 rounded-xl transition-all border border-transparent hover:border-slate-100 group'>
                    <img src={user.imageUrl} className='w-9 rounded-full border-2 border-white shadow-sm group-hover:scale-105 transition-transform' alt=''/>
                    <div className='hidden sm:block'>
                        <h1 className='text-xs font-bold text-slate-800 leading-tight'>{user.fullName}</h1>
                        <p className='text-[10px] font-medium text-slate-500'>
                            <Protect plan='premium' fallback="Free Tier">Premium Elite</Protect>
                        </p>
                    </div>
                </div>

                <div className='h-8 w-[1px] bg-slate-200 hidden sm:block'></div>

                <div className='flex items-center gap-4'>
                    <LogOut onClick={signOut} className='w-5 h-5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer'/>
                </div>
            </div>
        </nav>

        <div className='flex-1 w-full bg-[#F4F7FB] overflow-y-auto'>
            <Outlet />
        </div>
    </div>
  ) : (
    <div className='flex items-center justify-center h-screen'>
        <SignIn />
    </div>
  )
}

export default Layout;