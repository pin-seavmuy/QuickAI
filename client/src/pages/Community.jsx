import { useAuth, useUser } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import { Heart, Download, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { downloadImage } from '../utils/download'


const Community = () => {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { getToken } = useAuth()

  // Fetch all published creations
  const fetchCreations = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Toggle like/unlike without refreshing the page
  const imageLikeToggle = async (id) => {
    try {
      const { data } = await axios.post('/api/user/toggle-like-creations', { id }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        toast.success(data.message)

        // Update the creation's likes locally
        setCreations(prev =>
          prev.map(creation => {
            if (creation.id === id) {
              const isLiked = creation.likes.includes(user.id)
              return {
                ...creation,
                likes: isLiked
                  ? creation.likes.filter(uid => uid !== user.id)
                  : [...creation.likes, user.id]
              }
            }
            return creation
          })
        )
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Handle image download
  const handleDownload = (content, prompt) => {
    const filename = `${prompt.slice(0, 20) || 'quickai-creation'}.png`
    downloadImage(content, filename)
  }

  useEffect(() => {
    if (user) fetchCreations()
  }, [user])

  if (loading) {
    return (
      <div className='flex justify-center items-center h-full'>
        <span className='w-8 h-8 border-4 border-t-transparent border-gray-500 rounded-full animate-spin'></span>
      </div>
    )
  }

  return (
    <div className='flex-1 h-full flex flex-col gap-6 p-4 sm:p-8 bg-[#F8FAFC]'>
      {/* Navigation Bar */}
      <button 
          onClick={() => navigate('/ai')}
          className='flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest group'
      >
          <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
          Back to Dashboard
      </button>

      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700'>
        <div>
            <h1 className='text-xl sm:text-2xl font-bold text-slate-800 tracking-tight'>Community Showcase</h1>
            <p className='text-slate-500 mt-1 text-sm font-medium'>Discover the most innovative creations from around the world.</p>
        </div>
        <div className='flex items-center gap-3'>
            <div className='hidden sm:flex text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-200'>
                {creations.length} Creations
            </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-scroll scrollbar-hide pr-2 -mr-2'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {creations.map((creation, index) => (
            <div 
              key={index} 
              className='relative group aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8'
              style={{ animationDelay: `${index * 100}ms`, animationDuration: '800ms' }}
            >
                <img
                    src={creation.content}
                    alt={creation.prompt}
                    className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                />
                {/* Always-on gradient for basic readability */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300'></div>
                
                <div className='absolute inset-0 p-4 flex flex-col justify-end text-white'>
                    <p className='text-sm font-medium line-clamp-2 drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-2'>
                        {creation.prompt}
                    </p>
                    <div className='flex items-center justify-between'>
                        <div className='flex gap-2 items-center bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hover:bg-black/40 transition-colors'>
                            <p className='text-xs font-bold'>{creation.likes.length}</p>
                            <Heart
                                onClick={(e) => {
                                    e.stopPropagation();
                                    imageLikeToggle(creation.id);
                                }}
                                className={`w-4 h-4 hover:scale-110 transition-transform cursor-pointer ${
                                    creation.likes.includes(user.id)
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-white'
                                }`}
                            />
                        </div>
                        <button 
                            onClick={() => handleDownload(creation.content, creation.prompt)}
                            className='p-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all group/dl'
                            title="Download Image"
                        >
                            <Download className='w-4 h-4 text-white group-hover/dl:scale-110 transition-transform' />
                        </button>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Community
