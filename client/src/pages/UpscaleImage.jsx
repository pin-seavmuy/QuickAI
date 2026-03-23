import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { ArrowLeft, Download, Upload, Sparkles, ArrowRight, Image as ImageIcon, CheckCircle2, AlertCircle, LayoutGrid, Search, Maximize2, X, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { downloadImage } from '../utils/download'

const UpscaleImage = () => {
  const [image, setImage] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [loading, setLoading] = useState(false)
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
            setHistory(data.creations.filter(c => c.type === 'upscale'))
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
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setResultImage(null)
    }
  }

  const handleUpscale = async () => {
    if (!image) return toast.error('Please upload an image first')

    setLoading(true)
    const formData = new FormData()
    formData.append('image', image)

    try {
      const { data } = await axios.post('/api/ai/upscale-image', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${await getToken()}` 
        }
      })

      if (data.success) {
        setResultImage(data.content)
        toast.success('Image upscaled successfully!')
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
            <form onSubmit={(e) => { e.preventDefault(); handleUpscale(); }} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between lg:min-h-[500px] lg:max-h-[600px] overflow-y-auto custom-scrollbar shadow-orange-100/10'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-orange-50 rounded-lg'>
                        <Sparkles className='w-6 h-6 text-orange-600'/>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-800'>AI Image Upscaler</h1>
                        <p className='text-xs text-slate-500 font-medium'>Generative resolution enhancement</p>
                    </div>
                </div>

                <div className='space-y-3'>
                    <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Source Image</p>
                    <div className='relative group'>
                        <div className='relative'>
                            <input
                                type="file"
                                accept='image/*'
                                className='w-full p-4 outline-none text-sm rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all bg-slate-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white hover:file:opacity-90'
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if(file) {
                                        setImage(file);
                                        setResultImage(null);
                                    }
                                }}
                                required
                            />
                            {image && (
                                <div className='mt-4 relative w-full aspect-video rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shadow-inner group/preview'>
                                    <img src={URL.createObjectURL(image)} alt="Upload Preview" className='w-full h-full object-contain' />
                                    <button 
                                        type='button'
                                        onClick={() => { setImage(null); setResultImage(null); }}
                                        className='absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-slate-500 hover:text-red-500 transition-colors shadow-sm'
                                    >
                                        <CheckCircle2 className='w-4 h-4 rotate-45'/>
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className='text-[10px] text-slate-400 font-medium mt-2 flex items-center gap-1'>
                            <ImageIcon className='w-3 h-3'/>
                            JPG, PNG up to 10MB supported
                        </p>
                    </div>
                </div>

                <button 
                    onClick={handleUpscale}
                    disabled={loading || !image}
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white px-6 py-3.5 mt-auto text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-100'
                >
                    {loading ? (
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin'></span>
                            <span>Enhancing Pixels...</span>
                        </div>
                    ) : (
                        <>
                            <Sparkles className='w-5 h-5'/>
                            <span>Upscale Now</span>
                        </>
                    )}
                </button>

                {/* Pro Tip Box inside Config Column for consistency */}
                <div className='p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3'>
                    <div className='p-1.5 bg-blue-100 rounded-lg'>
                        <AlertCircle className='w-4 h-4 text-blue-600'/>
                    </div>
                    <p className='text-[11px] font-medium text-blue-800 leading-relaxed'>
                        AI restoration intelligently recreates missing textures like hair and skin for a professional finish.
                    </p>
                </div>
            </form>

            {/* Right Column: Result Deck */}
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col lg:min-h-[500px] lg:max-h-[600px] shadow-orange-100/20'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-orange-50 rounded-lg'>
                            <ImageIcon className='w-5 h-5 text-orange-600'/>
                        </div>
                        <h1 className='text-lg font-bold text-slate-800'>Refined Result</h1>
                    </div>
                    {resultImage && (
                        <button 
                            onClick={() => downloadImage(resultImage, 'upscaled-masterpiece.png')}
                            className='text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5'
                        >
                            <Download className='w-3.5 h-3.5'/>
                            Export 4K
                        </button>
                    )}
                </div>

                <div className='flex-1 relative aspect-video bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner group'>
                    {loading ? (
                        <div className='absolute inset-0 flex flex-col items-center justify-center space-y-4 text-slate-300'>
                            <div className='relative'>
                                <div className='w-16 h-16 border-4 border-slate-100 border-t-orange-600 rounded-full animate-spin'></div>
                                <Sparkles className='w-6 h-6 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse' />
                            </div>
                            <p className='text-sm font-bold text-slate-400'>Restoring Details</p>
                        </div>
                    ) : !resultImage ? (
                        <div className='absolute inset-0 flex flex-col items-center justify-center space-y-4 text-slate-300 px-8 text-center'>
                            <div className='p-6 bg-white rounded-full shadow-sm'>
                                <ImageIcon className='w-12 h-12'/>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-sm font-bold text-slate-400'>Awaiting Image</p>
                                <p className='text-xs text-slate-400'>Upload a low-res photo to see the AI magic</p>
                            </div>
                        </div>
                    ) : (
                        <div className='w-full h-full relative p-4 flex items-center justify-center'>
                            <img 
                                src={resultImage} 
                                alt="Upscaled Result" 
                                className='max-w-full max-h-full object-contain relative z-10 animate-in fade-in zoom-in-95 duration-500'
                            />
                        </div>
                    )}
                </div>

                {resultImage && (
                    <div className='p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3'>
                        <div className='p-1.5 bg-emerald-100 rounded-lg'>
                            <CheckCircle2 className='w-4 h-4 text-emerald-600'/>
                        </div>
                        <p className='text-xs font-medium text-emerald-800 italic'>
                            "The resolution has been doubled and textures restored with high fidelity."
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
                        <h2 className='text-lg font-bold text-slate-800'>Recent Enhancements</h2>
                        <p className='text-xs text-slate-500 font-medium'>Manage and re-download your high-fidelity upscales</p>
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
                                className='w-full pl-9 pr-4 py-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder:text-slate-400 shadow-sm'
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
                <div className='w-full p-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-5 group/empty transition-all hover:border-orange-200 hover:bg-orange-50/10'>
                    <div className='relative'>
                        <div className='absolute inset-0 bg-orange-100 rounded-full blur-2xl opacity-40 group-hover/empty:opacity-70 transition-opacity'></div>
                        <div className='relative p-6 bg-white rounded-full shadow-sm border border-slate-100 group-hover/empty:scale-110 transition-transform duration-500'>
                            <Sparkles className='w-10 h-10 text-slate-300 group-hover/empty:text-orange-500 transition-colors'/>
                        </div>
                    </div>
                    <div className='space-y-1.5'>
                        <p className='text-base font-bold text-slate-400 group-hover/empty:text-slate-600 transition-colors'>No history found</p>
                        <p className='text-xs text-slate-400 max-w-[240px] font-medium'>Upload an image to start building your collection of high-res masterpieces.</p>
                    </div>
                </div>
            ) : (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6'>
                    {history
                        .filter(item => item.prompt.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((item, index) => {
                            const imageUrl = item.content?.includes('|') ? item.content.split('|')[1] : item.content;
                            const isValidUrl = imageUrl?.startsWith('http');
                            return (
                                <div 
                                    key={item.id} 
                                    className='group relative aspect-video bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-orange-100/20'
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {!isValidUrl ? (
                                        <div className='w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300 p-4 text-center'>
                                            <ImageIcon className='w-8 h-8 opacity-20 mb-2'/>
                                            <p className='text-[10px] font-medium leading-tight opacity-50'>Unmatched Clarity</p>
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
                                                        <p class="text-[10px] font-medium leading-tight opacity-50">High-Res Restoration</p>
                                                    </div>
                                                `;
                                            }}
                                        />
                                    )}
                                    
                                    {/* Overlay Gradient */}
                                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20'>
                                        <p className='text-[10px] text-white font-bold tracking-widest uppercase mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500'>
                                            Upscaled Masterpiece
                                        </p>
                                        <div className='flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500'>
                                            <button 
                                                onClick={() => setSelectedHistoryImage(item)}
                                                className='flex-1 py-1.5 bg-white text-slate-900 text-[10px] font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center gap-1.5'
                                            >
                                                <Maximize2 className='w-3 h-3'/>
                                                View Comparison
                                            </button>
                                            <button 
                                                onClick={() => deleteHistoryItem(item.id)}
                                                className='p-1.5 bg-white/20 hover:bg-rose-500 text-white rounded-lg transition-colors'
                                            >
                                                <Trash2 className='w-3.5 h-3.5'/>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quick Download Badge */}
                                    <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100 z-30'>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadImage(imageUrl, `upscaled-${item.id}.png`);
                                            }}
                                            className='flex items-center justify-center w-8 h-8 bg-black/40 text-white rounded-full border border-white/20 hover:bg-white hover:text-slate-900 transition-all shadow-lg'
                                        >
                                            <Download className='w-4 h-4'/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>

        {/* Comparison Lightbox Modal */}
        {selectedHistoryImage && (
            <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300'>
                {/* Backdrop */}
                <div 
                    className='absolute inset-0 bg-slate-900/90 backdrop-blur-md cursor-zoom-out' 
                    onClick={() => setSelectedHistoryImage(null)}
                ></div>
                
                {/* Modal Content - Dual View */}
                <div className='relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[95vh]'>
                    {/* Header */}
                    <div className='p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-orange-50 rounded-xl'>
                                <Sparkles className='w-5 h-5 text-orange-600'/>
                            </div>
                            <div>
                                <h3 className='text-base font-bold text-slate-800'>Fidelity Comparison</h3>
                                <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Original vs. AI Enhanced</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedHistoryImage(null)}
                            className='p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-800'
                        >
                            <X className='w-5 h-5'/>
                        </button>
                    </div>

                    {/* Side-by-Side Comparison */}
                    <div className='flex-1 flex flex-col lg:flex-row bg-slate-50 overflow-hidden'>
                        {/* Original */}
                        <div className='flex-1 p-8 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col items-center justify-center space-y-4'>
                            <span className='px-3 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-tighter'>Original Quality</span>
                            <img 
                                src={selectedHistoryImage.content?.includes('|') ? selectedHistoryImage.content.split('|')[0] : selectedHistoryImage.content} 
                                alt="Original" 
                                className='max-w-full max-h-[50vh] lg:max-h-[60vh] object-contain rounded-lg shadow-sm border border-slate-200'
                            />
                        </div>
                        {/* Upscaled */}
                        <div className='flex-1 p-8 flex flex-col items-center justify-center space-y-4 bg-orange-50/20'>
                            <span className='px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-md'>AI 4K Masterpiece</span>
                            <img 
                                src={selectedHistoryImage.content?.includes('|') ? selectedHistoryImage.content.split('|')[1] : selectedHistoryImage.content} 
                                alt="Upscaled" 
                                className='max-w-full max-h-[50vh] lg:max-h-[60vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-700'
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className='p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-4'>
                        <p className='hidden sm:block text-[11px] font-medium text-slate-400 max-w-sm'>
                            Our generative upscaler double the resolution while preserving stylistic nuances.
                        </p>
                        <button 
                            onClick={() => downloadImage(selectedHistoryImage.content?.includes('|') ? selectedHistoryImage.content.split('|')[1] : selectedHistoryImage.content, `upscale-master-${selectedHistoryImage.id}.png`)}
                            className='flex items-center gap-2 px-8 py-3 bg-[#4A7AFF] text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-blue-100'
                        >
                            <Download className='w-4 h-4'/>
                            Download Master Record
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default UpscaleImage
