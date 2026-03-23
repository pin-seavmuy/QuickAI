import { Camera, Sparkles, Image as ImageIcon, Copy, Check, ArrowLeft, LayoutGrid, Search, Maximize2, X, Trash2, Download } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ReverseAI = () => {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHistoryImage, setSelectedHistoryImage] = useState(null)
  
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { user } = useUser()

  const deleteHistoryItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this creation?")) return;
    try {
        const { data } = await axios.post('/api/user/delete-creation', { id }, {
            headers: { Authorization: `Bearer ${await getToken()}` }
        })
        if (data.success) {
            toast.success("Creation deleted");
            setHistory(prev => prev.filter(item => item.id !== id));
        }
    } catch (error) {
        toast.error("Failed to delete creation");
    }
  }

  const fetchHistory = async () => {
    try {
        setHistoryLoading(true)
        const { data } = await axios.get('/api/user/get-user-creations', {
            headers: { Authorization: `Bearer ${await getToken()}` }
        })
        if (data.success) {
            setHistory(data.creations.filter(c => c.type === 'reverse-image'))
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
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Prompt copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmitHandler = async (e)=>{
      e.preventDefault();
      if (!image) return;

      try {
        setLoading(true)
        const formData = new FormData()
        formData.append('image', image)

        const {data} = await axios.post('/api/ai/reverse-image', formData, {
            headers: { Authorization: `Bearer ${await getToken()}` }
        })

        if(data.success){
            setResult(data.prompt)
            toast.success('Prompt extracted successfully!')
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
            <form onSubmit={onSubmitHandler} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between lg:min-h-[500px] lg:max-h-[600px] overflow-y-auto custom-scrollbar shadow-purple-100/10'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-50 rounded-lg'>
                        <Camera className='w-6 h-6 text-[#8E37EB]'/>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-800'>Image-to-Prompt</h1>
                        <p className='text-xs text-slate-500 font-medium'>Convert any image back into a descriptive prompt</p>
                    </div>
                </div>

                <div className='space-y-3'>
                    <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Source Image</p>
                    <div className='relative group border-2 border-dashed border-slate-200 rounded-2xl p-4 transition-all hover:border-[#8E37EB] bg-slate-50/50'>
                        {preview ? (
                            <div className='relative aspect-video rounded-xl overflow-hidden shadow-md'>
                                <img src={preview} alt="Preview" className='w-full h-full object-cover' />
                                <button 
                                    type='button'
                                    onClick={() => {setImage(null); setPreview(null);}}
                                    className='absolute top-2 right-2 bg-white/90 backdrop-blur p-1.5 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-all'
                                >
                                    <ImageIcon className='w-4 h-4'/>
                                </button>
                            </div>
                        ) : (
                            <label className='flex flex-col items-center justify-center space-y-3 py-12 cursor-pointer'>
                                <div className='p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300 border border-slate-100'>
                                    <ImageIcon className='w-8 h-8 text-slate-400'/>
                                </div>
                                <div className='text-center'>
                                    <p className='text-sm font-bold text-slate-600'>Click to upload</p>
                                    <p className='text-[10px] text-slate-400'>PNG, JPG or WEBP (Max 10MB)</p>
                                </div>
                                <input onChange={handleImageChange} type="file" accept='image/*' className='hidden' required />
                            </label>
                        )}
                    </div>
                </div>

                <button 
                    disabled={loading || !image} 
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#8E37EB] to-[#E549A3] text-white px-6 py-3.5 mt-6 text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-100'
                >
                    {loading ? (
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin'></span>
                            <span>Analyzing Aesthetics...</span>
                        </div>
                    ) : (
                        <>
                            <Sparkles className='w-5 h-5'/>
                            <span>Reverse AI Prompt</span>
                        </>
                    )}
                </button>
            </form>

            {/* Right Column: Result Deck */}
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between lg:min-h-[500px] lg:max-h-[600px] shadow-purple-100/10'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-purple-50 rounded-lg'>
                            <Sparkles className='w-5 h-5 text-[#8E37EB]'/>
                        </div>
                        <h1 className='text-lg font-bold text-slate-800'>AI Prompt Result</h1>
                    </div>
                    {result && (
                        <button 
                            onClick={onCopy}
                            className='p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-[#8E37EB]'
                            title='Copy Prompt'
                        >
                            {copied ? <Check className='w-5 h-5 text-green-500'/> : <Copy className='w-5 h-5'/>}
                        </button>
                    )}
                </div>

                <div className='flex-1 relative bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner flex flex-col'>
                    {!result ? (
                        <div className='absolute inset-0 flex flex-col items-center justify-center space-y-4 text-slate-300 px-8 text-center'>
                            <div className='p-6 bg-white rounded-full shadow-sm'>
                                <Camera className='w-12 h-12'/>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-sm font-bold text-slate-400'>Awaiting Vision</p>
                                <p className='text-xs text-slate-400'>Upload an image on the left to extract its AI DNA</p>
                            </div>
                        </div>
                    ) : (
                        <div className='p-6 overflow-y-auto custom-scrollbar h-full'>
                            <p className='text-sm text-slate-700 leading-relaxed text-justify font-medium bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700'>
                                {result}
                            </p>
                        </div>
                    )}
                </div>

                {result && (
                    <div className='p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-3'>
                        <div className='p-1.5 bg-purple-100 rounded-lg'>
                            <Sparkles className='w-4 h-4 text-[#8E37EB]'/>
                        </div>
                        <p className='text-xs font-medium text-purple-800 italic'>
                            "You can use this prompt with our Image Generator to create similar masterpieces."
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
                        <h2 className='text-lg font-bold text-slate-800'>Recent Extractions</h2>
                        <p className='text-xs text-slate-500 font-medium'>Manage and revisit your AI prompt DNA records</p>
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
                                className='w-full pl-9 pr-4 py-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium placeholder:text-slate-400 shadow-sm'
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
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6'>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className='aspect-video bg-white rounded-2xl border border-slate-100 animate-pulse'></div>
                    ))}
                </div>
            ) : history.length === 0 ? (
                <div className='w-full p-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-5 group/empty transition-all hover:border-purple-200 hover:bg-purple-50/10'>
                    <div className='relative'>
                        <div className='absolute inset-0 bg-purple-100 rounded-full blur-2xl opacity-40 group-hover/empty:opacity-70 transition-opacity'></div>
                        <div className='relative p-6 bg-white rounded-full shadow-sm border border-slate-100 group-hover/empty:scale-110 transition-transform duration-500'>
                            <Camera className='w-10 h-10 text-slate-300 group-hover/empty:text-purple-500 transition-colors'/>
                        </div>
                    </div>
                    <div className='space-y-1.5'>
                        <p className='text-base font-bold text-slate-400 group-hover/empty:text-slate-600 transition-colors'>No history found</p>
                        <p className='text-xs text-slate-400 max-w-[240px] font-medium'>Upload an image to start extracting prompts and building your vision archive.</p>
                    </div>
                </div>
            ) : (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6'>
                    {history
                        .filter(item => item.prompt.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((item, index) => {
                            const imageUrl = item.content;
                            const isValidUrl = imageUrl?.startsWith('http');
                            return (
                                <div 
                                    key={item.id} 
                                    className='group relative aspect-video bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-purple-100/20'
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {!isValidUrl ? (
                                        <div className='w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300 p-4 text-center'>
                                            <ImageIcon className='w-8 h-8 opacity-20 mb-2'/>
                                            <p className='text-[10px] font-medium leading-tight opacity-50'>Visual Archive</p>
                                        </div>
                                    ) : (
                                        <img 
                                            src={imageUrl} 
                                            alt={item.prompt} 
                                            onClick={() => setSelectedHistoryImage(item)}
                                            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in'
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `
                                                    <div class="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300 p-4 text-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image w-8 h-8 opacity-20 mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                                        <p class="text-[10px] font-medium leading-tight opacity-50">Vision DNA</p>
                                                    </div>
                                                `;
                                            }}
                                        />
                                    )}
                                    
                                    {/* Overlay Gradient */}
                                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20'>
                                        <p className='text-[10px] text-white font-bold tracking-widest uppercase mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 line-clamp-1'>
                                            {item.prompt}
                                        </p>
                                        <div className='flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500'>
                                            <button 
                                                onClick={() => setSelectedHistoryImage(item)}
                                                className='flex-1 py-1.5 bg-white text-slate-900 text-[10px] font-bold rounded-lg hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-1.5'
                                            >
                                                <Maximize2 className='w-3 h-3'/>
                                                View DNA
                                            </button>
                                            <button 
                                                onClick={() => deleteHistoryItem(item.id)}
                                                className='p-1.5 bg-white/20 hover:bg-rose-500 text-white rounded-lg transition-colors'
                                            >
                                                <Trash2 className='w-3.5 h-3.5'/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>

        {/* Vision DNA Lightbox Modal */}
        {selectedHistoryImage && (
            <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300'>
                {/* Backdrop */}
                <div 
                    className='absolute inset-0 bg-slate-900/90 backdrop-blur-md cursor-zoom-out' 
                    onClick={() => setSelectedHistoryImage(null)}
                ></div>
                
                {/* Modal Content */}
                <div className='relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]'>
                    {/* Header */}
                    <div className='p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-purple-50 rounded-xl'>
                                <Camera className='w-5 h-5 text-purple-600'/>
                            </div>
                            <div>
                                <h3 className='text-base font-bold text-slate-800'>Vision DNA Record</h3>
                                <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Original Image & Extracted AI Prompt</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedHistoryImage(null)}
                            className='p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-800'
                        >
                            <X className='w-5 h-5'/>
                        </button>
                    </div>

                    {/* Side-by-Side Analysis */}
                    <div className='flex-1 flex flex-col lg:flex-row bg-slate-50 overflow-hidden'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 h-full'>
                            {/* Source Image */}
                            <div className='p-8 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col items-center justify-center space-y-4 bg-white/50'>
                                <span className='px-3 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-tighter'>Source Visual</span>
                                <img 
                                    src={selectedHistoryImage.content} 
                                    alt="Source" 
                                    className='max-w-full max-h-[40vh] lg:max-h-[50vh] object-contain rounded-xl shadow-lg border border-slate-100'
                                />
                            </div>
                            {/* Extracted Prompt */}
                            <div className='p-8 flex flex-col space-y-6 bg-purple-50/10 h-full overflow-y-auto custom-scrollbar'>
                                <div className='space-y-2'>
                                    <span className='px-3 py-1 bg-purple-500 text-white text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-md'>AI DNA String</span>
                                    <div className='p-6 bg-white rounded-2xl border border-purple-100 shadow-sm relative group'>
                                        <p className='text-sm text-slate-700 leading-relaxed font-medium italic'>
                                            "{selectedHistoryImage.prompt}"
                                        </p>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedHistoryImage.prompt);
                                                toast.success("Prompt copied!");
                                            }}
                                            className='absolute top-4 right-4 p-2 bg-purple-50 text-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-100'
                                        >
                                            <Copy className='w-4 h-4'/>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className='pt-4 border-t border-purple-100 space-y-3'>
                                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Direct Actions</p>
                                    <div className='flex items-center gap-3'>
                                        <button 
                                            onClick={() => navigate('/ai/generate-images', { state: { prompt: selectedHistoryImage.prompt } })}
                                            className='flex-1 py-3 bg-[#8E37EB] text-white rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200'
                                        >
                                            <Sparkles className='w-4 h-4'/>
                                            Generate Similar
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = selectedHistoryImage.content;
                                                link.download = `vision-source-${selectedHistoryImage.id}.png`;
                                                link.click();
                                            }}
                                            className='p-3 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all'
                                        >
                                            <Download className='w-4 h-4'/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default ReverseAI;
