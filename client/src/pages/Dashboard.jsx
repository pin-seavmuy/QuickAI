import React, { useEffect, useState } from 'react'
import { Gem, Sparkles, Plus, ArrowRight, Search, Calendar, Heart, LayoutGrid, List, Trophy, ChevronDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Protect, useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import CreationItem from '../components/CreationItem'
import toast from 'react-hot-toast'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { driver } from "driver.js"

const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [communityCreations, setCommunityCreations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [activeMetric, setActiveMetric] = useState('memberSince')
  const [showMetricSelector, setShowMetricSelector] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedIds, setSelectedIds] = useState([])
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()

  const getTagName = (tag) => {
    switch (tag) {
        case 'resume': return 'Resume'
        case 'upscale': return 'Image Upscaler'
        case 'bg-swap': return 'Background Swap'
        case 'reverse-image': return 'Image to Prompt'
        default: return tag
    }
  }

  // Metric Definitions
  const metrics = {
    memberSince: {
        label: 'Member Since',
        icon: Calendar,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Recent'
    },
    totalLikes: {
        label: 'Total Likes',
        icon: Heart,
        color: 'text-pink-600',
        bg: 'bg-pink-50',
        value: creations.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0)
    },
    toolsUsed: {
        label: 'Tools Used',
        icon: LayoutGrid,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        value: `${new Set(creations.map(c => c.type)).size} of ${AiToolsData.length}`
    },
    globalRank: {
        label: 'Global Rank',
        icon: Trophy,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        value: creations.length > 50 ? 'Top 1%' : creations.length > 20 ? 'Top 5%' : 'Top 15%'
    }
  }

  const currentMetric = metrics[activeMetric] || metrics.memberSince

  useEffect(() => {
    let isMounted = true

    const getDashboardData = async () => {
      try {
        const [creationsRes, communityRes] = await Promise.all([
          axios.get('/api/user/get-user-creations', {
            headers: { Authorization: `Bearer ${await getToken()}` }
          }),
          axios.get('/api/user/get-published-creations', {
            headers: { Authorization: `Bearer ${await getToken()}` }
          })
        ])

        if (isMounted) {
          if (creationsRes.data.success) {
            setCreations(creationsRes.data.creations)
          }
          if (communityRes.data.success) {
            setCommunityCreations(communityRes.data.creations.slice(0, 4))
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

  const deleteCreation = async (id) => {
    try {
        const { data } = await axios.post('/api/user/delete-creation', { id }, {
            headers: { Authorization: `Bearer ${await getToken()}` }
        })

        if (data.success) {
            toast.success(data.message)
            setCreations(prev => prev.filter(c => c.id !== id))
            setSelectedIds(prev => prev.filter(sid => sid !== id))
        } else {
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return
    
    const toastId = toast.loading(`Deleting ${selectedIds.length} items...`)
    try {
        const { data } = await axios.post('/api/user/delete-multiple-creations', { ids: selectedIds }, {
            headers: { Authorization: `Bearer ${await getToken()}` }
        })

        if (data.success) {
            toast.success(data.message, { id: toastId })
            setCreations(prev => prev.filter(c => !selectedIds.includes(c.id)))
            setSelectedIds([])
        } else {
            toast.error(data.message, { id: toastId })
        }
    } catch (error) {
        toast.error(error.message, { id: toastId })
    }
  }

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        { element: '#welcome-header', popover: { title: 'Welcome to QuickAI', description: 'This is your creative hub. Let\'s show you around!', side: "bottom", align: 'start' }},
        { element: '#stats-grid', popover: { title: 'Your Activity', description: 'Track your creations, status, and personalized metrics here.', side: "bottom", align: 'start' }},
        { element: '#ai-tools-grid', popover: { title: 'Powerful AI Tools', description: 'Jump into any of our specialized AI tools to start creating magic.', side: "top", align: 'start' }},
        { element: '#recent-creations-section', popover: { title: 'Recent Creations', description: 'Manage and re-access your previous work easily.', side: "top", align: 'start' }},
        { element: '#new-creation-btn', popover: { title: 'Start Fresh', description: 'Ready to create something new? Click here to begin!', side: "left", align: 'start' }},
      ]
    });
    driverObj.drive();
  }

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    if (!hasSeenTour && !loading && creations.length >= 0) {
      setTimeout(() => {
        startTour();
        localStorage.setItem('hasSeenDashboardTour', 'true');
      }, 1000);
    }
  }, [loading]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length) {
        setSelectedIds([])
    } else {
        setSelectedIds(currentItems.map(c => c.id))
    }
  }

  const filteredCreations = creations.filter(item => {
    const matchesSearch = item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = activeFilter === 'All' || item.type === activeFilter
    return matchesSearch && matchesFilter
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredCreations.length / itemsPerPage)
  const currentItems = filteredCreations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeFilter, itemsPerPage])

  // Get unique creation types for filters
  const creationTypes = ['All', ...new Set(creations.map(c => c.type))]


  return (
    <div className='h-full overflow-y-scroll p-4 sm:px-8 py-6 bg-[#F8FAFC]'>
      <div className='w-full space-y-6'>

        {/* Welcome Header */}
        <div id="welcome-header" className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700'>
          <div>
            <h1 className='text-xl sm:text-2xl font-bold text-slate-800 tracking-tight'>
              Welcome back, {user?.firstName || 'Creator'}! 👋
            </h1>
            <p className='text-slate-500 mt-0.5 text-sm font-medium'>Here is what's happening today.</p>
          </div>
          <button
            onClick={() => navigate('/ai/generate-images')}
            id="new-creation-btn"
            className='flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-md active:scale-95'
          >
            <Plus className='w-4 h-4' />
            <span className='font-bold text-xs'>New Creation</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div id="stats-grid" className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150'>
          <div className='bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5'>
            <div className='w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center'>
              <Sparkles className='w-5 h-5' />
            </div>
            <div>
              <p className='text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1'>Creations</p>
              <h2 className='text-xl font-bold text-slate-800 leading-none'>{creations.length}</h2>
            </div>
          </div>

          <div className='bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5'>
            <div className='w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center'>
              <Gem className='w-5 h-5' />
            </div>
            <div>
              <p className='text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1'>Status</p>
              <h2 className='text-xl font-bold text-slate-800 leading-none'>
                <Protect plan='premium' fallback="Free Tier">Premium</Protect>
              </h2>
            </div>
          </div>

          <div className='relative bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-3.5'>
            <div className='flex items-center gap-3.5'>
                <div className={`w-10 h-10 rounded-lg ${currentMetric.bg} ${currentMetric.color} flex items-center justify-center transition-all duration-300`}>
                <currentMetric.icon className='w-5 h-5' />
                </div>
                <div>
                <p className='text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1'>{currentMetric.label}</p>
                <h2 className='text-xl font-bold text-slate-800 leading-none'>{currentMetric.value}</h2>
                </div>
            </div>
            
            <div className='relative'>
                <button 
                    onClick={() => setShowMetricSelector(!showMetricSelector)}
                    className='p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors'
                >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMetricSelector ? 'rotate-180' : ''}`} />
                </button>

                {showMetricSelector && (
                    <div className='absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200'>
                        {Object.entries(metrics).map(([key, m]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setActiveMetric(key)
                                    setShowMetricSelector(false)
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${activeMetric === key ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-600'}`}
                            >
                                <m.icon className={`w-4 h-4 ${activeMetric === key ? 'text-blue-600' : 'text-slate-400'}`} />
                                {m.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Quick Actions / Tools Area */}
        <div className='space-y-4'>
          
          <div id="ai-tools-grid" className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {AiToolsData.map((tool, index) => (
              <div
                key={index}
                onClick={() => navigate(tool.path)}
                className='group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 fill-mode-both'
                style={{ animationDelay: `${300 + index * 100}ms`, animationDuration: '700ms' }}
              >
                <div
                  className='absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 rounded-full scale-150 group-hover:scale-[2]'
                  style={{ backgroundColor: tool.bg.from }}
                ></div>
                <div className='flex items-center gap-3 mb-3'>
                  <div
                    className='w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md transform group-hover:rotate-6 transition-transform duration-300 flex-shrink-0'
                    style={{ background: `linear-gradient(135deg, ${tool.bg.from}, ${tool.bg.to})` }}
                  >
                    <tool.Icon className='w-4 h-4' />
                  </div>
                  <h3 className='text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors leading-tight'>{tool.title}</h3>
                </div>
                <p className='text-[11px] text-slate-500 line-clamp-2 mb-3 font-medium'>{tool.description}</p>
                <div className='flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:translate-x-1.5 transition-all duration-300'>
                  Let's create <ArrowRight className='w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors' />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Spotlight */}
        {communityCreations.length > 0 && (
            <div className='space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500 fill-mode-both'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-lg font-bold text-slate-800'>Community Spotlight</h2>
                        <p className='text-[11px] text-slate-400 font-medium'>Trending creations from the community</p>
                    </div>
                    <button 
                        onClick={() => navigate('/ai/community')}
                        className='flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-all group'
                    >
                        Explore Showroom
                        <ArrowRight className='w-3.5 h-3.5 group-hover:translate-x-1 transition-transform' />
                    </button>
                </div>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                    {communityCreations.map((item, idx) => (
                        <div 
                            key={item.id}
                            className='group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer'
                            onClick={() => navigate('/ai/community')}
                        >
                            <img 
                                src={item.content} 
                                alt={item.prompt} 
                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3'>
                                <div className='flex items-center gap-2'>
                                    <div className='flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10'>
                                        <Heart className='w-2.5 h-2.5 text-red-500 fill-red-500' />
                                        <span className='text-[10px] font-bold text-white'>{item.likes.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Recent Creations Section */}
        <div id="recent-creations-section" className='space-y-3.5 pb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <h2 className='text-lg font-bold text-slate-800 shrink-0'>Recent Creations</h2>

            <div className='flex items-center gap-3'>
                {/* View Mode Toggle */}
                <div className='flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm'>
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Grid View"
                    >
                        <LayoutGrid className='w-4 h-4' />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
                        title="List View"
                    >
                        <List className='w-4 h-4' />
                    </button>
                </div>

                <div className='flex items-center gap-2'>
                    {currentItems.length > 0 && (
                        <button 
                            onClick={toggleSelectAll}
                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                                selectedIds.length === currentItems.length && currentItems.length > 0
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 shadow-sm'
                            }`}
                        >
                            {selectedIds.length === currentItems.length && currentItems.length > 0 ? 'Deselect' : 'Select'}
                        </button>
                    )}
                    <div className='relative w-full sm:max-w-md group'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors' />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm'
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className='flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide'>
            {creationTypes.map(type => {
                const count = type === 'All' ? creations.length : creations.filter(c => c.type === type).length;
                return (
                    <button
                        key={type}
                        onClick={() => setActiveFilter(type)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-sm ${
                            activeFilter === type 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        <span className='capitalize'>{type.replace(/-/g, ' ')}</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                            activeFilter === type 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                            {count}
                        </span>
                    </button>
                )
            })}
          </div>
          {loading ? (
            <div className='flex justify-center items-center py-10'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent'></div>
            </div>
          ) : currentItems.length > 0 ? (
            <>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
                {currentItems.map((item, idx) => (
                    <div key={item.id} style={{ animationDelay: `${idx * 50}ms` }} className='animate-in fade-in slide-in-from-left-4 fill-mode-both'>
                        <CreationItem 
                            item={item} 
                            onDelete={deleteCreation} 
                            isSelected={selectedIds.includes(item.id)}
                            onSelect={() => toggleSelect(item.id)}
                        />
                    </div>
                ))}
                </div>

                {/* Pagination & Page Size Controls */}
                <div className='flex flex-wrap items-center justify-center gap-6 mt-8 animate-in fade-in duration-700'>
                    {/* Page Size Selector */}
                    <div className='flex items-center gap-2'>
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Show:</span>
                        <div className='flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm'>
                            {[6, 12, 24].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setItemsPerPage(size)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                                        itemsPerPage === size 
                                        ? 'bg-slate-900 text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Page Controls */}
                    {totalPages > 1 && (
                        <div className='flex items-center gap-2'>
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className={`p-2 rounded-lg border border-slate-200 transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 hover:border-slate-300 active:scale-95 text-slate-600'}`}
                            >
                                <ChevronLeft className='w-4 h-4' />
                            </button>

                            <div className='flex items-center gap-1.5'>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            currentPage === i + 1 
                                            ? 'bg-slate-900 text-white shadow-md scale-105' 
                                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className={`p-2 rounded-lg border border-slate-200 transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 hover:border-slate-300 active:scale-95 text-slate-600'}`}
                            >
                                <ChevronRight className='w-4 h-4' />
                            </button>
                        </div>
                    )}
                </div>
            </>
          ) : searchTerm ? (
            <div className='py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200'>
              <p className='text-slate-400 font-medium'>No creations match "{searchTerm}"</p>
              <button onClick={() => setSearchTerm('')} className='mt-2 text-sm text-blue-600 font-bold hover:underline'>Clear search</button>
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

        {/* Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
            <div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-500'>
                <div className='bg-slate-900/90 backdrop-blur-xl border border-white/10 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-6'>
                    <div className='flex flex-col'>
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1'>Selected items</span>
                        <span className='text-sm font-bold text-white leading-none'>{selectedIds.length} Creations</span>
                    </div>
                    
                    <div className='h-8 w-px bg-white/10'></div>
                    
                    <div className='flex items-center gap-3'>
                        <button 
                            onClick={() => setSelectedIds([])}
                            className='text-xs font-bold text-slate-300 hover:text-white transition-colors'
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleBulkDelete}
                            className='bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-red-500/20 transition-all flex items-center gap-2'
                        >
                            <Trash2 className='w-4 h-4' />
                            Delete Permanentely
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
