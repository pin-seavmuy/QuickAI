import { ArrowLeft, Hash, Sparkles, Trash2, Clock, FileText, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react';

const BlogTitles = () => {
    const blogCategories = ['General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food']
  
    const [selectedCategory, setSelectedCategory] = useState('General')
    const [input, setInput] = useState('')  
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState('')
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const navigate = useNavigate()
    const {getToken} = useAuth()
    const { user } = useUser()

    const deleteHistoryItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this draft?")) return;
        try {
            const { data } = await axios.post('/api/user/delete-creation', { id }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                toast.success("Draft deleted");
                setHistory(prev => prev.filter(item => item.id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete draft");
        }
    }

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true)
            const { data } = await axios.get('/api/user/get-user-creations', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                // Filter only blog-titles
                setHistory(data.creations.filter(c => c.type === 'blog-title'))
            }
        } catch (error) {
            console.error("History fetch error:", error)
        } finally {
            setHistoryLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchHistory()
        }
    }, [user])

    const onSubmitHandler = async (e)=>{
        e.preventDefault();
        try {
            setLoading(true)
            const prompt = `Generate a blog title for the keyword ${input} in the category ${selectedCategory}`

            const {data} = await axios.post('/api/ai/generate-blog-title', {prompt}, {
                headers: {Authorization: `Bearer ${await getToken()}`}
            })

            if(data.success){
                setContent(data.content)
                fetchHistory() // Refresh history
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

    return (
    <div className='h-full overflow-y-scroll p-6 text-slate-700 bg-slate-50/30 space-y-4'>
        {/* Navigation Bar */}
        <button 
            onClick={() => navigate('/ai')}
            className='flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest group'
        >
            <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
            Back to Dashboard
        </button>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full transition-all duration-500'>
            {/* Left Column: Configuration */}
            <form onSubmit={onSubmitHandler} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-8 flex flex-col justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-50 rounded-lg'>
                        <Sparkles className='w-6 h-6 text-[#8E37EB]'/>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-800'>AI Title Generator</h1>
                        <p className='text-xs text-slate-500 font-medium'>Generate high-engagement headlines</p>
                    </div>
                </div>

                <div className='space-y-3'>
                    <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Primary Keyword</p>
                    <input 
                        onChange={(e)=>setInput(e.target.value)} 
                        value={input} 
                        type="text" 
                        className='w-full p-4 outline-none text-sm rounded-xl border border-slate-200 focus:border-[#8E37EB] focus:ring-1 focus:ring-[#8E37EB] transition-all bg-slate-50/50' 
                        placeholder='The future of artificial intelligence...' 
                        required
                    />
                </div>

                <div className='space-y-4'>
                    <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Content Niche</p>
                    <div className='flex gap-2.5 flex-wrap'>
                        {blogCategories.map((item)=>(
                            <span 
                                onClick={()=>setSelectedCategory(item)} 
                                key={item}
                                className={`text-xs px-4 py-2 border rounded-full cursor-pointer transition-all font-medium ${selectedCategory === item ? 'bg-[#8E37EB] text-white border-[#8E37EB] shadow-md shadow-purple-100' : 'bg-white text-slate-600 border-slate-200 hover:border-[#8E37EB] hover:bg-purple-50/30'} `} 
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                <button 
                    disabled={loading} 
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-6 py-3.5 mt-auto text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-100'
                >
                    {loading ? (
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin'></span>
                            <span>Generating Titles...</span>
                        </div>
                    ) : (
                        <>
                            <Hash className='w-5 h-5'/>
                            <span>Generate Titles</span>
                        </>
                    )}
                </button>
            </form>

            {/* Right Column: Result Deck */}
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col min-h-[400px] lg:max-h-[600px]'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-purple-50 rounded-lg'>
                            <Hash className='w-5 h-5 text-[#8E37EB]'/>
                        </div>
                        <h1 className='text-lg font-bold text-slate-800'>Title Results</h1>
                    </div>
                </div>

                <div className='flex-1 relative bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner flex flex-col'>
                    {!content ? (
                        <div className='absolute inset-0 flex flex-col items-center justify-center space-y-4 text-slate-300 px-8 text-center'>
                            <div className='p-6 bg-white rounded-full shadow-sm'>
                                <Hash className='w-12 h-12'/>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-sm font-bold text-slate-400'>Awaiting Spark</p>
                                <p className='text-xs text-slate-400'>Configure your keyword on the left to begin</p>
                            </div>
                        </div>
                    ) : (
                        <div className='p-6 overflow-y-auto custom-scrollbar h-full'>
                            <div className='reset-tw prose prose-slate max-w-none prose-sm sm:prose-base animate-in fade-in slide-in-from-bottom-4 duration-700 font-medium text-slate-700 leading-relaxed'>
                                <Markdown>{content}</Markdown>
                            </div>
                        </div>
                    )}
                </div>

                {content && (
                    <div className='p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-3'>
                        <div className='p-1.5 bg-purple-100 rounded-lg'>
                            <Sparkles className='w-4 h-4 text-[#8E37EB]'/>
                        </div>
                        <p className='text-xs font-medium text-purple-800 italic'>
                            "These titles are optimized for click-through rate and topic relevance."
                        </p>
                    </div>
                )}
            </div>
        </div>

        {/* Blog Titles History Section */}
        <div className='w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-slate-100 rounded-lg border border-slate-200'>
                        <Hash className='w-5 h-5 text-slate-600'/>
                    </div>
                    <div>
                        <h2 className='text-lg font-bold text-slate-800'>Recent Titles</h2>
                        <p className='text-xs text-slate-500 font-medium'>Access and manage your generated titles</p>
                    </div>
                </div>
                
                <div className='flex items-center gap-4 w-full md:w-auto'>
                    {history.length > 0 && (
                        <div className='relative flex-1 md:w-64'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400'/>
                            <input 
                                type="text"
                                placeholder="Search titles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium placeholder:text-slate-400 shadow-sm'
                            />
                        </div>
                    )}
                    {history.length > 0 && (
                        <div className='hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm'>
                            {history.length} Saved
                        </div>
                    )}
                </div>
            </div>

            {historyLoading ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className='h-48 bg-white rounded-[2rem] border border-slate-100 animate-pulse'></div>
                    ))}
                </div>
            ) : history.length === 0 ? (
                <div className='w-full p-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-5 group/empty transition-all hover:border-purple-200 hover:bg-purple-50/10'>
                    <div className='relative'>
                        <div className='absolute inset-0 bg-purple-100 rounded-full blur-2xl opacity-40 group-hover/empty:opacity-70 transition-opacity'></div>
                        <div className='relative p-6 bg-white rounded-full shadow-sm border border-slate-100 group-hover/empty:scale-110 transition-transform duration-500'>
                            <Hash className='w-10 h-10 text-slate-300 group-hover/empty:text-purple-400 transition-colors'/>
                        </div>
                    </div>
                    <div className='space-y-1.5'>
                        <p className='text-base font-bold text-slate-400 group-hover/empty:text-slate-600 transition-colors'>No Titles Yet</p>
                        <p className='text-xs text-slate-400 max-w-[240px] font-medium'>Your generated blog titles will appear here for easy access.</p>
                    </div>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {history
                        .filter(item => 
                            item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.content.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((item, index) => {
                            const snippet = item.content.replace(/[#*`-]/g, '').slice(0, 100) + '...';
                            
                            return (
                                <div 
                                    key={index} 
                                    className='group relative bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4'
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Gradient Top Accent */}
                                    <div className='h-1.5 w-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                    
                                    <div className='p-6 flex-1 flex flex-col space-y-4'>
                                        <div className='flex items-start justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <div className='p-2 bg-purple-50 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300'>
                                                    <Hash className='w-4 h-4'/>
                                                </div>
                                                <div className='flex flex-col'>
                                                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>
                                                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteHistoryItem(item.id);
                                                }}
                                                className='p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 duration-300'
                                            >
                                                <Trash2 className='w-4 h-4'/>
                                            </button>
                                        </div>

                                        <div className='space-y-2'>
                                            <h3 className='text-sm font-extrabold text-slate-800 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors duration-300'>
                                                {item.prompt}
                                            </h3>
                                            <p className='text-[11px] text-slate-500 leading-relaxed line-clamp-3 font-medium opacity-80'>
                                                {snippet}
                                            </p>
                                        </div>

                                        <div className='flex items-center gap-3 pt-2'>
                                            <div className='flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100'>
                                                <Sparkles className='w-3 h-3 text-purple-400'/>
                                                Titles
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className='px-6 pb-6'>
                                        <button 
                                            onClick={() => {
                                                setContent(item.content);
                                                setInput(item.prompt);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                toast.success('Titles restored to preview');
                                            }}
                                            className='w-full py-3 text-xs font-bold text-[#8E37EB] bg-purple-50/50 border border-purple-100 rounded-xl hover:bg-[#8E37EB] hover:text-white hover:border-[#8E37EB] transition-all duration-300 shadow-sm active:scale-[0.98]'
                                        >
                                            Restore to View
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                </div>
            )}
        </div>
    </div>
    )
}

export default BlogTitles;