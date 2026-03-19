import { Edit, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';


const WriteArticle = () => {
    const articleLength = [
        {length: 800, text: 'Short (500-800 words)'},
        {length: 1200, text: 'Medium (800-1200 words)'},
        {length: 1600, text: 'Long (1200+ words)'},
    ]

    const [selectedLength, setSelectedLength] = useState(articleLength[0])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState('')

    const {getToken} = useAuth()

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        try {
            setLoading(true)

            // Send topic and selected length to backend
            const {data} = await axios.post('/api/ai/generate-article', {
                prompt: input,                // article topic
                length: selectedLength.length // 800, 1200, 1600
            }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setContent(data.content)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }
    
    return (
    <div className='h-full overflow-y-scroll p-6 text-slate-700 bg-slate-50/30'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full transition-all duration-500'>
            {/* Left Column: Configuration */}
            <form onSubmit={onSubmitHandler} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-8 h-fit'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-50 rounded-lg'>
                        <Sparkles className='w-6 h-6 text-[#4A7AFF]'/>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-800'>Article Architect</h1>
                        <p className='text-xs text-slate-500 font-medium'>Draft professional, long-form content</p>
                    </div>
                </div>

                <div className='space-y-3'>
                    <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Article Topic</p>
                    <input 
                        type="text"
                        placeholder='The evolution of cloud computing...'
                        className='w-full p-4 outline-none text-sm rounded-xl border border-slate-200 focus:border-[#4A7AFF] focus:ring-1 focus:ring-[#4A7AFF] transition-all bg-slate-50/50'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        required
                    />
                </div>

                <div className='space-y-4'>
                    <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Target Length</p>
                    <div className='flex gap-2.5 flex-wrap'>
                        {articleLength.map((item, index) => (
                            <span 
                                key={index}
                                onClick={() => setSelectedLength(item)}
                                className={`text-xs px-4 py-2 border rounded-full cursor-pointer transition-all font-medium ${selectedLength.text === item.text ? 'bg-[#4A7AFF] text-white border-[#4A7AFF] shadow-md shadow-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:border-[#4A7AFF] hover:bg-blue-50/30'}`}
                            >
                                {item.text}
                            </span>
                        ))}
                    </div>
                </div>

                <button 
                    type='submit'
                    disabled={loading}
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-6 py-3.5 mt-6 text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100'
                >
                    {loading ? (
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin'></span>
                            <span>Architecting Content...</span>
                        </div>
                    ) : (
                        <>
                            <Edit className='w-5 h-5'/>
                            <span>Draft Article</span>
                        </>
                    )}
                </button>
            </form>

            {/* Right Column: Result Deck */}
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col min-h-[500px] h-fit lg:max-h-[800px]'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-blue-50 rounded-lg'>
                            <Edit className='w-5 h-5 text-[#4A7AFF]'/>
                        </div>
                        <h1 className='text-lg font-bold text-slate-800'>Drafting Deck</h1>
                    </div>
                </div>

                <div className='flex-1 relative bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner flex flex-col'>
                    {!content ? (
                        <div className='absolute inset-0 flex flex-col items-center justify-center space-y-4 text-slate-300 px-8 text-center'>
                            <div className='p-6 bg-white rounded-full shadow-sm'>
                                <Edit className='w-12 h-12'/>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-sm font-bold text-slate-400'>Awaiting Blueprint</p>
                                <p className='text-xs text-slate-400'>Configure your article on the left to begin</p>
                            </div>
                        </div>
                    ) : (
                        <div className='p-6 overflow-y-auto custom-scrollbar h-full'>
                            <div className='prose prose-slate max-w-none prose-sm sm:prose-base animate-in fade-in slide-in-from-bottom-4 duration-700'>
                                <Markdown>{content}</Markdown>
                            </div>
                        </div>
                    )}
                </div>

                {content && (
                    <div className='p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3'>
                        <div className='p-1.5 bg-blue-100 rounded-lg'>
                            <Sparkles className='w-4 h-4 text-[#4A7AFF]'/>
                        </div>
                        <p className='text-xs font-medium text-blue-800 italic'>
                            "Your article is structured for maximum readability and SEO impact."
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
    )
}

export default WriteArticle;
