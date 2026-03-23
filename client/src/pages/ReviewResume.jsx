import { ArrowLeft, FileText, Sparkles, FileSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { LayoutGrid, Search, Eye, X, Trash2, Download } from 'lucide-react';

const ReviewResume = () => {
  const [input, setInput] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null)
  
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser()

  const deleteHistoryItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this creation?")) return;
    try {
        const { data } = await axios.post('/api/user/delete-creation', { id }, {
            headers: { Authorization: `Bearer ${await getToken()}` }
        })
        if (data.success) {
            toast.success("Review deleted");
            setHistory(prev => prev.filter(item => item.id !== id));
        }
    } catch (error) {
        toast.error("Failed to delete review");
    }
  }

  const fetchHistory = async () => {
    try {
        setHistoryLoading(true)
        const { data } = await axios.get('/api/user/get-user-creations', {
            headers: { Authorization: `Bearer ${await getToken()}` }
        })
        if (data.success) {
            setHistory(data.creations.filter(c => c.type === 'resume-review'))
        }
    } catch (error) {
        console.error("History fetch error:", error)
    } finally {
        setHistoryLoading(false)
    }
  }

  React.useEffect(() => {
    if (user) {
        fetchHistory()
    }
  }, [user])
  
  const onSubmitHandler = async (e)=>{
      e.preventDefault();
      try {
        setLoading(true)
        const formData = new FormData()
        formData.append('resume', input)

        const {data} = await axios.post('/api/ai/resume-review', formData, {headers: {Authorization: `Bearer ${await getToken()}`}})

        if (data.success) {
            setContent(data.content)
            fetchHistory() // Refresh history
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
    <div className='h-full overflow-y-scroll p-6 text-slate-700 bg-slate-50/30 space-y-4'>
        {/* Navigation Bar */}
        <button 
            onClick={() => navigate('/ai')}
            className='flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest group'
        >
            <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
            Back
        </button>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full transition-all duration-500'>
            {/* Left Column: Configuration */}
            <form onSubmit={onSubmitHandler} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between lg:min-h-[600px] lg:max-h-[700px] overflow-y-auto custom-scrollbar shadow-emerald-100/10'>
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
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-6 py-3.5 mt-auto text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100'
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
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col lg:min-h-[600px] lg:max-h-[700px]'>
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
                            <div className='prose prose-slate max-w-none prose-sm sm:prose-base text-justify animate-in fade-in slide-in-from-bottom-4 duration-700'>
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

        {/* Creation History Section */}
        <div className='w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-slate-100 rounded-lg border border-slate-200'>
                        <LayoutGrid className='w-5 h-5 text-slate-600'/>
                    </div>
                    <div>
                        <h2 className='text-lg font-bold text-slate-800'>Past Reviews</h2>
                        <p className='text-xs text-slate-500 font-medium'>Track and re-examine your resume improvements</p>
                    </div>
                </div>
                
                <div className='flex items-center gap-4 w-full md:w-auto'>
                    {history.length > 0 && (
                        <div className='relative flex-1 md:w-64'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400'/>
                            <input 
                                type="text"
                                placeholder="Search history..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-9 pr-4 py-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00DA83]/20 focus:border-[#00DA83] transition-all font-medium placeholder:text-slate-400 shadow-sm'
                            />
                        </div>
                    )}
                    {history.length > 0 && (
                        <div className='hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm'>
                            {history.length} Reviews
                        </div>
                    )}
                </div>
            </div>

            {historyLoading ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className='h-32 bg-white rounded-2xl border border-slate-100 animate-pulse'></div>
                    ))}
                </div>
            ) : history.length === 0 ? (
                <div className='w-full p-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-5 group/empty transition-all hover:border-emerald-200 hover:bg-emerald-50/10'>
                    <div className='relative'>
                        <div className='absolute inset-0 bg-emerald-100 rounded-full blur-2xl opacity-40 group-hover/empty:opacity-70 transition-opacity'></div>
                        <div className='relative p-6 bg-white rounded-full shadow-sm border border-slate-100 group-hover/empty:scale-110 transition-transform duration-500'>
                            <FileSearch className='w-10 h-10 text-slate-300 group-hover/empty:text-emerald-400 transition-colors'/>
                        </div>
                    </div>
                    <div className='space-y-1.5'>
                        <p className='text-base font-bold text-slate-400 group-hover/empty:text-slate-600 transition-colors'>No history found</p>
                        <p className='text-xs text-slate-400 max-w-[240px] font-medium'>Upload your resume to start building your career optimization library.</p>
                    </div>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {history
                        .filter(item => item.prompt.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((item, index) => (
                            <div 
                                key={item.id} 
                                className='group relative bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-emerald-100/20'
                            >
                                <div className='space-y-3'>
                                    <div className='flex items-center justify-between'>
                                        <div className='p-2 bg-emerald-50 rounded-lg'>
                                            <FileText className='w-4 h-4 text-[#00DA83]'/>
                                        </div>
                                        <p className='text-[10px] font-bold text-slate-300 uppercase'>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <p className='text-xs font-bold text-slate-700 line-clamp-2 leading-relaxed'>
                                        {item.prompt}
                                    </p>
                                </div>
                                
                                <div className='flex items-center justify-between gap-3 pt-2'>
                                    <button 
                                        onClick={() => setSelectedHistoryItem(item)}
                                        className='flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold hover:bg-[#00DA83] hover:text-white transition-all group/btn'
                                    >
                                        <Eye className='w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform'/>
                                        View Analysis
                                    </button>
                                    <button 
                                        onClick={() => deleteHistoryItem(item.id)}
                                        className='p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors'
                                    >
                                        <Trash2 className='w-4 h-4'/>
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>

        {/* Markdown Review Modal */}
        {selectedHistoryItem && (
            <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300'>
                {/* Backdrop */}
                <div 
                    className='absolute inset-0 bg-slate-900/90 backdrop-blur-md cursor-zoom-out' 
                    onClick={() => setSelectedHistoryItem(null)}
                ></div>
                
                {/* Modal Content */}
                <div className='relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col'>
                    <div className='p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-emerald-50 rounded-xl'>
                                <FileText className='w-5 h-5 text-[#00DA83]'/>
                            </div>
                            <div>
                                <h3 className='text-base font-bold text-slate-800 line-clamp-1'>{selectedHistoryItem.prompt}</h3>
                                <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Review Archive • {new Date(selectedHistoryItem.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedHistoryItem(null)}
                            className='p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-800'
                        >
                            <X className='w-5 h-5'/>
                        </button>
                    </div>

                    <div className='flex-1 overflow-y-auto p-8 bg-slate-50/50 custom-scrollbar'>
                        <div className='prose prose-slate max-w-none prose-sm sm:prose-base text-justify animate-in fade-in slide-in-from-bottom-4 duration-700'>
                            <Markdown>{selectedHistoryItem.content}</Markdown>
                        </div>
                    </div>

                    <div className='p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-3'>
                        <button 
                            onClick={() => {
                                const blob = new Blob([selectedHistoryItem.content], { type: 'text/markdown' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `resume-review-${selectedHistoryItem.id}.md`;
                                a.click();
                            }}
                            className='flex items-center gap-2 px-6 py-2.5 bg-[#00DA83] text-white rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-emerald-100'
                        >
                            <Download className='w-4 h-4'/>
                            Download Markdown
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default ReviewResume;