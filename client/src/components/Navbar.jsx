import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import {useClerk, UserButton, useUser} from '@clerk/clerk-react'

const Navbar = () => {
    const navigate = useNavigate()
    const {user} = useUser()
    const {openSignIn} = useClerk()
  return (
    <div className='fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm flex justify-between items-center  px-6 lg:px-12 transition-all'>
        <img src={assets.logo} alt="logo"  className='w-28 sm:w-32 cursor-pointer transition-all hover:opacity-80' onClick={() => navigate('/')}/>
        {
            user ? <UserButton /> 
            : 
            (
                <button onClick={openSignIn} className='flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5'>Get Started <ArrowRight className='w-4 h-4'/></button>
            )
        }

        
    </div>
  )
}

export default Navbar