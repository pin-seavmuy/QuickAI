import { Hash, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';

const BlogTitles = () => {
    const blogCategories = ['General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food']
  
    const [selectedCategory, setSelectedCategory] = useState('General')
    const [input, setInput] = useState('')  
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState('')

    const {getToken} = useAuth()

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
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

    return (
    <div className='h-full overflow-y-scroll p-6 text-slate-700 bg-slate-50/30'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full transition-all duration-500'>
            {/* Left Column: Configuration */}
            <form onSubmit={onSubmitHandler} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-8 h-fit'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-50 rounded-lg'>
                        <Sparkles className='w-6 h-6 text-[#8E37EB]'/>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-800'>AI Title Generator</h1>
                        <p className='text-xs text-slate-500 font-medium'>Forge high-engagement headlines</p>
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
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-6 py-3.5 mt-6 text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-100'
                >
                    {loading ? (
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin'></span>
                            <span>Forging Titles...</span>
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
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col min-h-[400px] h-fit lg:max-h-[600px]'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-purple-50 rounded-lg'>
                            <Hash className='w-5 h-5 text-[#8E37EB]'/>
                        </div>
                        <h1 className='text-lg font-bold text-slate-800'>Title Vault</h1>
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
    </div>
    )
}

export default BlogTitles;