import { FileText, Sparkles, FileSearch } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

const ReviewResume = () => {
  const [input, setInput] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const {getToken} = useAuth()
  
  const onSubmitHandler = async (e)=>{
      e.preventDefault();
      try {
        setLoading(true)
        const formData = new FormData()
        formData.append('resume', input)

        const {data} = await axios.post('/api/ai/resume-review', formData, {headers: {Authorization: `Bearer ${await getToken()}`}})

        if(data.success){
            setContent(data.content)
        }else{
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
                    <div className='p-2 bg-emerald-50 rounded-lg'>
                        <Sparkles className='w-6 h-6 text-[#00DA83]'/>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-800'>Resume Review</h1>
                        <p className='text-xs text-slate-500 font-medium'>AI-powered career optimization</p>
                    </div>
                </div>

                <div className='space-y-3'>
                    <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Resume Document</p>
                    <div className='relative group'>
                        <input 
                            onChange={(e)=>setInput(e.target.files[0])} 
                            type="file" 
                            accept='application/pdf' 
                            className='w-full p-4 outline-none text-sm rounded-xl border border-slate-200 focus:border-[#00DA83] focus:ring-1 focus:ring-[#00DA83] transition-all bg-slate-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#00DA83] file:text-white hover:file:opacity-90' 
                            required
                        />
                        <p className='text-[10px] text-slate-400 font-medium mt-2 flex items-center gap-1'>
                            <FileText className='w-3 h-3'/>
                            PDF files only (Max 10MB)
                        </p>
                    </div>
                </div>

                <button 
                    disabled={loading} 
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-6 py-3.5 mt-6 text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100'
                >
                    {loading ? (
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin'></span>
                            <span>Analyzing Profile...</span>
                        </div>
                    ) : (
                        <>
                            <FileSearch className='w-5 h-5'/>
                            <span>Review Resume</span>
                        </>
                    )}
                </button>
            </form>

            {/* Right Column: Result Deck */}
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col min-h-[500px] h-fit lg:max-h-[800px]'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-emerald-50 rounded-lg'>
                            <FileText className='w-5 h-5 text-[#00DA83]'/>
                        </div>
                        <h1 className='text-lg font-bold text-slate-800'>Analysis Results</h1>
                    </div>
                </div>

                <div className='flex-1 relative bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner flex flex-col'>
                    {!content ? (
                        <div className='absolute inset-0 flex flex-col items-center justify-center space-y-4 text-slate-300 px-8 text-center'>
                            <div className='p-6 bg-white rounded-full shadow-sm'>
                                <FileSearch className='w-12 h-12'/>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-sm font-bold text-slate-400'>Awaiting Insight</p>
                                <p className='text-xs text-slate-400'>Upload your resume on the left to begin analysis</p>
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
                    <div className='p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3'>
                        <div className='p-1.5 bg-emerald-100 rounded-lg'>
                            <Sparkles className='w-4 h-4 text-[#00DA83]'/>
                        </div>
                        <p className='text-xs font-medium text-emerald-800 italic'>
                            "Your resume was reviewed for ATS compliance and impact-driven phrasing."
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

export default ReviewResume;