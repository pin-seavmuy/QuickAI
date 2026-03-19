import React, { useEffect, useState } from 'react'
import { Gem, Sparkles, Plus, ArrowRight } from 'lucide-react'
import { Protect, useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import CreationItem from '../components/CreationItem'
import toast from 'react-hot-toast'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const getDashboardData = async () => {
      try {
        const { data } = await axios.get('/api/user/get-user-creations', {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })

        if (isMounted) {
          if (data.success) {
            setCreations(data.creations)
          } else {
            toast.error(data.message)
          }
        }
      } catch (error) {
        if (isMounted) toast.error(error.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    getDashboardData()

    return () => {
      isMounted = false
    }
  }, [getToken])

  return (
    <div className='h-full overflow-y-scroll p-4 sm:px-10 py-8 bg-[#F8FAFC]'>
      <div className='w-full space-y-10'>
        
        {/* Welcome Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-slate-800'>
              Welcome back, {user?.firstName || 'Creator'}! 👋
            </h1>
            <p className='text-slate-500 mt-1'>Here is what's happening with your projects today.</p>
          </div>
          <button 
            onClick={() => navigate('/ai/generate-images')}
            className='flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-sm'
          >
            <Plus className='w-5 h-5' />
            <span>New Creation</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5'>
            <div className='w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center'>
              <Sparkles className='w-6 h-6' />
            </div>
            <div>
              <p className='text-sm text-slate-500 font-medium uppercase tracking-wider'>Total Creations</p>
              <h2 className='text-2xl font-bold text-slate-800'>{creations.length}</h2>
            </div>
          </div>

          <div className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5'>
            <div className='w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center'>
              <Gem className='w-6 h-6' />
            </div>
            <div>
              <p className='text-sm text-slate-500 font-medium uppercase tracking-wider'>Current Plan</p>
              <h2 className='text-2xl font-bold text-slate-800'>
                <Protect plan='premium' fallback="Free Plan">Premium Plan</Protect>
              </h2>
            </div>
          </div>
        </div>

        {/* Quick Actions / Tools Area */}
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold text-slate-800'>Quick Actions</h2>
            <p className='text-sm text-blue-600 font-medium cursor-pointer hover:underline'>View all tools</p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {AiToolsData.slice(0, 3).map((tool, index) => (
              <div 
                key={index}
                onClick={() => navigate(tool.path)}
                className='group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden'
              >
                <div 
                  className='absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 group-hover:opacity-10 transition-opacity rounded-full'
                  style={{ backgroundColor: tool.bg.from }}
                ></div>
                <div 
                  className='w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-sm'
                  style={{ background: `linear-gradient(135deg, ${tool.bg.from}, ${tool.bg.to})` }}
                >
                  <tool.Icon className='w-6 h-6' />
                </div>
                <h3 className='text-lg font-bold text-slate-800 mb-2'>{tool.title}</h3>
                <p className='text-sm text-slate-500 line-clamp-2 mb-4'>{tool.description}</p>
                <div className='flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:gap-3 transition-all'>
                  Let's create <ArrowRight className='w-4 h-4 text-slate-400 group-hover:text-slate-900' />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Creations Section */}
        <div className='space-y-6'>
          <h2 className='text-xl font-bold text-slate-800'>Recent Creations</h2>
          {loading ? (
            <div className='flex justify-center items-center py-20'>
              <div className='animate-spin rounded-full h-10 w-10 border-3 border-slate-900 border-t-transparent'></div>
            </div>
          ) : creations.length > 0 ? (
            <div className='grid grid-cols-1 gap-4'>
              {creations.map((item) => (
                <CreationItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className='bg-white border-2 border-dashed border-slate-200 rounded-3xl py-16 flex flex-col items-center justify-center text-center'>
              <div className='w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4'>
                <Plus className='w-8 h-8 text-slate-300' />
              </div>
              <h3 className='text-lg font-bold text-slate-800'>No creations yet</h3>
              <p className='text-slate-500 max-w-xs mt-1'>Start your first project to see it appear here in your dashbaord.</p>
              <button 
                onClick={() => navigate('/ai/generate-images')}
                className='mt-6 text-sm font-bold text-blue-600 hover:text-blue-700'
              >
                Go to Tools
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
