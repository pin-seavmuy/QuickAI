import { ArrowLeft, Scissors, Sparkles, Image as ImageIcon, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { downloadImage } from '../utils/download'
import { LayoutGrid, Search, Maximize2, X, Trash2 } from 'lucide-react';

const RemoveObject = () => {
  const [input, setInput] = useState(null)
  const [preview, setPreview] = useState(null)
  const [object, setObject] = useState('') 
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHistoryImage, setSelectedHistoryImage] = useState(null)
  
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
            setHistory(data.creations.filter(c => c.type === 'remove-object'))
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

        if(object.trim().split(' ').length > 1){
          toast.error('Please enter only one object name');
          setLoading(false);
          return;
        }

        const formData = new FormData()
        formData.append('image', input)
        formData.append('object', object)

        const {data} = await axios.post('/api/ai/remove-image-object', formData, {headers: {Authorization: `Bearer ${await getToken()}`}})

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
            <form onSubmit={onSubmitHandler} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between lg:min-h-[500px] lg:max-h-[600px] overflow-y-auto custom-scrollbar shadow-indigo-100/10'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-50 rounded-lg'>
                        <Sparkles className='w-6 h-6 text-[#4A7AFF]'/>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-800'>Object Removal</h1>
                        <p className='text-xs text-slate-500 font-medium'>Precision AI element removal</p>
                    </div>
                </div>

                <div className='space-y-6'>
                    <div className='space-y-3'>
                        <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Source Image</p>
                        <div className='relative'>
                            <input 
                                onChange={(e)=> {
                                    const file = e.target.files[0];
                                    if(file) {
                                        setInput(file);
                                        setPreview(URL.createObjectURL(file));
                                    }
                                }} 
                                type="file" 
                                accept='image/*' 
                                className='w-full p-4 outline-none text-sm rounded-xl border border-slate-200 focus:border-[#4A7AFF] focus:ring-1 focus:ring-[#4A7AFF] transition-all bg-slate-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#4A7AFF] file:text-white hover:file:opacity-90' 
                                required
                            />
                            {preview && (
                                <div className='mt-4 relative w-full aspect-video rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shadow-inner group'>
                                    <img src={preview} alt="Upload Preview" className='w-full h-full object-contain' />
                                    <button 
                                        type='button'
                                        onClick={() => { setInput(null); setPreview(null); }}
                                        className='absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-slate-500 hover:text-rose-500 transition-colors shadow-sm'
                                    >
                                        <Sparkles className='w-4 h-4 rotate-45'/>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='space-y-3'>
                        <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Target Object</p>
                        <input 
                            onChange={(e)=>setObject(e.target.value)} 
                            value={object} 
                            type="text" 
                            className='w-full p-4 outline-none text-sm rounded-xl border border-slate-200 focus:border-[#4A7AFF] focus:ring-1 focus:ring-[#4A7AFF] transition-all bg-slate-50/50' 
                            placeholder='e.g., watch, lamp, person (Single word only)' 
                            required
                        />
                        <p className='text-[10px] text-slate-400 font-medium flex items-center gap-1'>
                            <Scissors className='w-3 h-3'/>
                            Use single nouns for the best tactical precision
                        </p>
                    </div>
                </div>

                <button 
                    disabled={loading} 
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-6 py-3.5 mt-auto text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100'
                >
                    {loading ? (
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin'></span>
                            <span>Erasing Content...</span>
                        </div>
                    ) : (
                        <>
                            <Scissors className='w-5 h-5'/>
                            <span>Remove Object</span>
                        </>
                    )}
                </button>
            </form>

            {/* Right Column: Preview */}
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col lg:min-h-[500px] lg:max-h-[600px] shadow-indigo-100/20'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-blue-50 rounded-lg'>
                            <Scissors className='w-5 h-5 text-[#4A7AFF]'/>
                        </div>
                        <h1 className='text-lg font-bold text-slate-800'>Processed Image</h1>
                    </div>
                    {content && (
                        <a 
                            href={content} 
                            download="vanished-result.png"
                            className='text-xs font-bold text-[#4A7AFF] hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5'
                        >
                            <Download className='w-3.5 h-3.5'/>
                            Download PNG
                        </a>
                    )}
                </div>

                <div className='relative aspect-video bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner group'>
                    {!content ? (
                        <div className='absolute inset-0 flex flex-col items-center justify-center space-y-4 text-slate-300 px-8 text-center'>
                            <div className='p-6 bg-white rounded-full shadow-sm'>
                                <ImageIcon className='w-12 h-12'/>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-sm font-bold text-slate-400'>Awaiting Scan</p>
                                <p className='text-xs text-slate-400'>Upload and describe an object to begin removal</p>
                            </div>
                        </div>
                    ) : (
                        <div className='w-full h-full relative p-4 flex items-center justify-center'>
                            <img 
                                src={content} 
                                alt="Object Removed" 
                                className='max-w-full max-h-full object-contain relative z-10 animate-in fade-in zoom-in-95 duration-500'
                            />
                        </div>
                    )}
                </div>

                {content && (
                    <div className='p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3'>
                        <div className='p-1.5 bg-blue-100 rounded-lg'>
                            <Sparkles className='w-4 h-4 text-[#4A7AFF]'/>
                        </div>
                        <p className='text-xs font-medium text-blue-800 italic'>
                            "The object was seamlessly removed and the background inpainted for a natural look."
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
                        <h2 className='text-lg font-bold text-slate-800'>Recent Edits</h2>
                        <p className='text-xs text-slate-500 font-medium'>Manage and re-download your previous object removals</p>
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
                                className='w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400 shadow-sm'
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
                <div className='w-full p-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-5 group/empty transition-all hover:border-blue-200 hover:bg-blue-50/10'>
                    <div className='relative'>
                        <div className='absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-40 group-hover/empty:opacity-70 transition-opacity'></div>
                        <div className='relative p-6 bg-white rounded-full shadow-sm border border-slate-100 group-hover/empty:scale-110 transition-transform duration-500'>
                            <Scissors className='w-10 h-10 text-slate-300 group-hover/empty:text-blue-400 transition-colors'/>
                        </div>
                    </div>
                    <div className='space-y-1.5'>
                        <p className='text-base font-bold text-slate-400 group-hover/empty:text-slate-600 transition-colors'>No history found</p>
                        <p className='text-xs text-slate-400 max-w-[240px] font-medium'>Upload an image to start building your collection of edited assets.</p>
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
                                    className='group relative aspect-video bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-blue-100/20'
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {!isValidUrl ? (
                                        <div className='w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300 p-4 text-center space-y-2'>
                                            <ImageIcon className='w-8 h-8 opacity-20'/>
                                            <p className='text-[10px] font-medium leading-tight opacity-50'>{item.prompt}</p>
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
                                                        <p class="text-[10px] font-medium leading-tight opacity-50">${item.prompt}</p>
                                                    </div>
                                                `;
                                            }}
                                        />
                                    )}
                                    
                                    {/* Overlay Gradient */}
                                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20'>
                                        <p className='text-[10px] text-white font-medium line-clamp-2 leading-tight mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500'>
                                            {item.prompt}
                                        </p>
                                        <div className='flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500'>
                                            <button 
                                                onClick={() => setSelectedHistoryImage(item)}
                                                className='flex-1 py-1.5 bg-white text-slate-900 text-[10px] font-bold rounded-lg hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center gap-1.5'
                                            >
                                                <Maximize2 className='w-3 h-3'/>
                                                View
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
                                                downloadImage(imageUrl, `remove-obj-${item.id}.png`);
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

        {/* Lightbox Modal */}
        {selectedHistoryImage && (
            <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300'>
                {/* Backdrop */}
                <div 
                    className='absolute inset-0 bg-slate-900/90 backdrop-blur-md cursor-zoom-out' 
                    onClick={() => setSelectedHistoryImage(null)}
                ></div>
                
                {/* Modal Content */}
                <div className='relative w-fit max-w-[95vw] lg:max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row max-h-[95vh]'>
                    {/* Left: Image Display */}
                    <div className='bg-slate-50 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 p-8'>
                        <img 
                            src={selectedHistoryImage.content.includes('|') ? selectedHistoryImage.content.split('|')[1] : selectedHistoryImage.content} 
                            alt="Result" 
                            className='max-w-full max-h-[70vh] w-auto h-auto rounded-lg shadow-sm'
                        />
                    </div>

                    {/* Right: Details & Actions */}
                    <div className='w-full md:w-80 bg-white p-6 flex flex-col justify-between space-y-6'>
                        <div className='space-y-6'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <div className='p-1.5 bg-blue-50 rounded-lg'>
                                        <Sparkles className='w-4 h-4 text-[#4A7AFF]'/>
                                    </div>
                                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Object Removed</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedHistoryImage(null)}
                                    className='p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-800'
                                >
                                    <X className='w-5 h-5'/>
                                </button>
                            </div>

                            <div className='space-y-2'>
                                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>Action Taken</p>
                                <div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
                                    <p className='text-xs font-bold text-slate-800 line-clamp-2'>
                                        {selectedHistoryImage.prompt}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-3'>
                            <button 
                                onClick={() => downloadImage(selectedHistoryImage.content.includes('|') ? selectedHistoryImage.content.split('|')[1] : selectedHistoryImage.content, `remove-obj-${selectedHistoryImage.id}.png`)}
                                className='w-full flex items-center justify-center gap-2 py-3 bg-[#4A7AFF] text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-blue-100'
                            >
                                <Download className='w-4 h-4'/>
                                Download Professional Result
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default RemoveObject;