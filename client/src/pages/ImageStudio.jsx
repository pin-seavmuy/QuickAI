import { ArrowLeft, Wand2, Sparkles, Image as ImageIcon, Download, Eraser, Trash2, ArrowRight, RotateCcw, Search, Eye, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const ImageStudio = () => {
    const [input, setInput] = useState(null)
    const [preview, setPreview] = useState(null)
    const [mode, setMode] = useState('swap') // 'swap' or 'erase'
    const [prompt, setPrompt] = useState('')
    const [targetObject, setTargetObject] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [originalUrl, setOriginalUrl] = useState(null)
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null)

    const navigate = useNavigate()
    const { getToken, isLoaded } = useAuth()

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true)
            const { data } = await axios.get('/api/user/get-user-creations', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                // Filter for both background swap and object removal
                setHistory(data.creations.filter(c => c.type === 'bg-swap' || c.type === 'remove-object'))
            }
        } catch (error) {
            console.error("History fetch error:", error)
        } finally {
            setHistoryLoading(false)
        }
    }

    const deleteHistoryItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this studio record?")) return;
        try {
            const { data } = await axios.post('/api/user/delete-creation', { id }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                toast.success("Record deleted");
                setHistory(prev => prev.filter(item => item.id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete record");
        }
    }

    React.useEffect(() => {
        if (isLoaded) {
            fetchHistory()
        }
    }, [isLoaded])

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setInput(file)
            setPreview(URL.createObjectURL(file))
            setResult(null)
        }
    }

    const onProcessHandler = async (e) => {
        e.preventDefault()
        if (!input) return toast.error("Please upload an image first.")

        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('image', input)

            let endpoint = ''
            if (mode === 'swap') {
                if (!prompt.trim()) {
                    toast.error("Please describe the new background.")
                    setLoading(false)
                    return
                }
                formData.append('prompt', prompt)
                endpoint = '/api/ai/swap-background'
            } else {
                if (!targetObject.trim()) {
                    toast.error("Please describe the object to erase.")
                    setLoading(false)
                    return
                }
                formData.append('object', targetObject)
                endpoint = '/api/ai/remove-image-object'
            }

            const { data } = await axios.post(endpoint, formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setResult(data.content)
                // If the backend returns dual content (original|processed)
                if (data.content.includes('|')) {
                    const [orig, proc] = data.content.split('|')
                    setOriginalUrl(orig)
                    setResult(proc)
                }
                fetchHistory() // Refresh history gallery
                toast.success(`${mode === 'swap' ? 'Background swapped' : 'Object removed'} successfully!`)
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
            <div className='w-full space-y-6'>
                {/* Navigation Bar */}
                <button 
                    onClick={() => navigate('/ai')}
                    className='flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest group'
                >
                    <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
                    Back
                </button>
                
                {/* Header Section */}
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700'>
                    <div className='space-y-1'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2.5 bg-gradient-to-br from-[#FF416C] to-[#FF4B2B] rounded-xl shadow-lg shadow-orange-200'>
                                <Wand2 className='w-6 h-6 text-white' />
                            </div>
                            <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight'>AI Image Studio</h1>
                        </div>
                        <p className='text-slate-500 font-medium text-sm ml-1'>Generative Magic Eraser & Background Swap</p>
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch'>
                    
                    {/* Control Panel */}
                    <div className='lg:col-span-5 flex flex-col animate-in fade-in slide-in-from-left-4 duration-700 delay-150'>
                        <div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col justify-between space-y-8 lg:min-h-[500px] lg:max-h-[600px] overflow-y-auto custom-scrollbar'>
                            
                            {/* Mode Selector */}
                            <div className='space-y-3'>
                                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Select Mode</p>
                                <div className='flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100'>
                                    <button
                                        onClick={() => setMode('swap')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === 'swap' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <ImageIcon className='w-4 h-4' />
                                        Background Swap
                                    </button>
                                    <button
                                        onClick={() => setMode('erase')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === 'erase' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Eraser className='w-4 h-4' />
                                        Magic Eraser
                                    </button>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className='space-y-3'>
                                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Source Image</p>
                                <label className='group relative block w-full aspect-video rounded-3xl border-2 border-dashed border-slate-200 hover:border-orange-400 transition-all cursor-pointer overflow-hidden bg-slate-50/50 hover:bg-orange-50/30'>
                                    {preview ? (
                                        <img src={preview} alt="Input" className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700' />
                                    ) : (
                                        <div className='absolute inset-0 flex flex-col items-center justify-center space-y-3 text-slate-400 group-hover:text-orange-500'>
                                            <div className='p-4 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all'>
                                                <ImageIcon className='w-8 h-8' />
                                            </div>
                                            <p className='text-xs font-bold uppercase tracking-wider'>Upload Photo</p>
                                        </div>
                                    )}
                                    <input type="file" accept='image/*' onChange={handleImageChange} className='hidden' />
                                </label>
                            </div>

                            {/* Dynamic Input Based on Mode */}
                            <div className='space-y-4 pt-2 border-t border-slate-100'>
                                {mode === 'swap' ? (
                                    <div className='space-y-3 animate-in fade-in zoom-in-95 duration-300'>
                                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>New Background Prompt</p>
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="Describe the new scene (e.g., 'A luxury penthouse balcony at sunset with city lights')"
                                            className='w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm min-h-[100px] resize-none'
                                        />
                                    </div>
                                ) : (
                                    <div className='space-y-3 animate-in fade-in zoom-in-95 duration-300'>
                                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Object to Erase</p>
                                        <input
                                            type="text"
                                            value={targetObject}
                                            onChange={(e) => setTargetObject(e.target.value)}
                                            placeholder="e.g., 'watch', 'person', 'power lines'"
                                            className='w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm'
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={onProcessHandler}
                                disabled={loading || !input}
                                className='w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] text-white font-bold text-sm shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto'
                            >
                                {loading ? (
                                    <>
                                        <span className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin'></span>
                                        <span>Casting Magic...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className='w-5 h-5' />
                                        <span>{mode === 'swap' ? 'Swap Background' : 'Erase Object'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Result Deck */}
                    <div className='lg:col-span-7 flex flex-col animate-in fade-in slide-in-from-right-4 duration-700 delay-300'>
                        <div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full lg:min-h-[500px] lg:max-h-[600px]'>
                            <div className='flex items-center justify-between mb-6'>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-slate-50 rounded-lg'>
                                        <ImageIcon className='w-5 h-5 text-slate-400' />
                                    </div>
                                    <h3 className='font-bold text-slate-800 uppercase tracking-widest text-[10px]'>Generation Result</h3>
                                </div>
                                {result && (
                                    <a
                                        href={result}
                                        download="studio-result.png"
                                        target='_blank'
                                        rel='noreferrer'
                                        className='flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95'
                                    >
                                        <Download className='w-3.5 h-3.5' />
                                        Download Result
                                    </a>
                                )}
                            </div>

                            <div className='flex-1 relative bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 overflow-hidden flex items-center justify-center group'>
                                {!result ? (
                                    <div className='flex flex-col items-center justify-center text-center space-y-4 px-12'>
                                        <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500'>
                                            <Wand2 className='w-10 h-10 text-slate-200' />
                                        </div>
                                        <div>
                                            <p className='text-sm font-bold text-slate-400 uppercase tracking-widest mb-1 italic'>Magic Hub</p>
                                            <p className='text-xs text-slate-400 font-medium max-w-[200px] leading-relaxed'>
                                                Configure your settings and click cast to see the AI magic.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='w-full h-full relative p-4 lg:p-8 animate-in zoom-in-95 duration-1000'>
                                        {/* Checkerboard for transparent results */}
                                        <div className='absolute inset-0 opacity-[0.03]' style={{ backgroundImage: 'radial-gradient(#000 10%, transparent 10%)', backgroundSize: '10px 10px' }}></div>
                                        
                                        <div className='relative w-full h-full rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center'>
                                            <img
                                                src={result}
                                                alt="Result"
                                                className='max-w-full max-h-full object-contain'
                                            />
                                            
                                            {/* Compare Toggle (Optional) */}
                                            {originalUrl && (
                                                <div className='absolute bottom-4 left-4 right-4 flex justify-center'>
                                                    <div className='bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-4 text-white text-[10px] font-bold'>
                                                        <span>Processed</span>
                                                        <div className='w-8 h-4 bg-white/20 rounded-full relative overflow-hidden'>
                                                            <div className='absolute inset-0 bg-white translate-x-1/2'></div>
                                                        </div>
                                                        <span className='opacity-50'>Original</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {result && (
                                <div className='mt-6 grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-500'>
                                    <button 
                                        onClick={() => {
                                            setResult(null);
                                            setPrompt('');
                                            setTargetObject('');
                                        }}
                                        className='flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 text-slate-500 text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100'
                                    >
                                        <RotateCcw className='w-3.5 h-3.5' />
                                        Reset Studio
                                    </button>
                                    <button 
                                        className='flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-100 transition-all border border-orange-100'
                                    >
                                        <Trash2 className='w-3.5 h-3.5' />
                                        Delete Creation
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* Creation History Section */}
                <div className='w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10'>
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-slate-100 rounded-lg border border-slate-200'>
                                <ImageIcon className='w-5 h-5 text-slate-600'/>
                            </div>
                            <div>
                                <h2 className='text-lg font-bold text-slate-800'>Recent Studio Creations</h2>
                                <p className='text-xs text-slate-500 font-medium'>Manage and re-access your previous edits</p>
                            </div>
                        </div>
                        
                        <div className='flex items-center gap-4 w-full md:w-auto'>
                            {history.length > 0 && (
                                <div className='relative flex-1 md:w-64'>
                                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400'/>
                                    <input 
                                        type="text"
                                        placeholder="Search by prompt..."
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
                        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className='aspect-square bg-white rounded-[2rem] border border-slate-100 animate-pulse'></div>
                            ))}
                        </div>
                    ) : history.length === 0 ? (
                        <div className='w-full p-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-5 group/empty transition-all hover:border-orange-200 hover:bg-orange-50/10'>
                            <div className='relative'>
                                <div className='absolute inset-0 bg-orange-100 rounded-full blur-2xl opacity-40 group-hover/empty:opacity-70 transition-opacity'></div>
                                <div className='relative p-6 bg-white rounded-full shadow-sm border border-slate-100 group-hover/empty:scale-110 transition-transform duration-500'>
                                    <Wand2 className='w-10 h-10 text-slate-300 group-hover/empty:text-orange-400 transition-colors'/>
                                </div>
                            </div>
                            <div className='space-y-1.5'>
                                <p className='text-base font-bold text-slate-400 group-hover/empty:text-slate-600 transition-colors'>History Empty</p>
                                <p className='text-xs text-slate-400 max-w-[240px] font-medium'>Use the studio to start building your library.</p>
                            </div>
                        </div>
                    ) : (
                        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6'>
                            {history
                                .filter(item => 
                                    item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((item, index) => {
                                    const processedUrl = item.content.includes('|') ? item.content.split('|')[1] : item.content;
                                    return (
                                        <div 
                                            key={index} 
                                            className='group relative aspect-square bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4'
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <img 
                                                src={processedUrl} 
                                                alt={item.prompt} 
                                                onClick={() => setSelectedHistoryItem(item)}
                                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in'
                                                loading="lazy"
                                            />
                                            
                                            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4'>
                                                <p className='text-[10px] text-white font-medium line-clamp-2 leading-tight mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500'>
                                                    {item.prompt}
                                                </p>
                                                
                                                <div className='flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500'>
                                                    <button 
                                                        onClick={() => setSelectedHistoryItem(item)}
                                                        className='flex-1 py-1.5 bg-white text-slate-900 text-[10px] font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center gap-1.5'
                                                    >
                                                        <Eye className='w-3 h-3'/>
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

                                            <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100'>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        downloadImage(processedUrl, `studio-${item.id}.png`);
                                                    }}
                                                    className='flex items-center justify-center w-8 h-8 bg-black/40 text-white rounded-full border border-white/20 hover:bg-white hover:text-slate-900 transition-all shadow-lg'
                                                >
                                                    <Download className='w-4 h-4'/>
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    )}
                </div>

            </div>

            {/* Lightbox Modal */}
            {selectedHistoryItem && (
                <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300'>
                    <div className='absolute inset-0 bg-slate-900/90 backdrop-blur-md cursor-zoom-out' onClick={() => setSelectedHistoryItem(null)}></div>
                    <div className='relative w-fit max-w-[95vw] lg:max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row max-h-[95vh]'>
                        <div className='bg-slate-50 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 p-6 flex-1'>
                            <div className='relative w-full h-full flex items-center justify-center'>
                                {selectedHistoryItem.content.includes('|') ? (
                                    <div className='flex flex-col lg:flex-row gap-6 items-center'>
                                        <div className='relative group overflow-hidden rounded-xl border border-slate-200 bg-white'>
                                            <img src={selectedHistoryItem.content.split('|')[0]} className='max-w-full max-h-[60vh] object-contain' alt="Original" />
                                            <span className='absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[8px] font-bold uppercase rounded'>Original</span>
                                        </div>
                                        <ArrowRight className='hidden lg:block w-6 h-6 text-slate-300' />
                                        <div className='relative group overflow-hidden rounded-xl border border-orange-200 bg-orange-50/10'>
                                            <img src={selectedHistoryItem.content.split('|')[1]} className='max-w-full max-h-[60vh] object-contain' alt="Processed" />
                                            <span className='absolute bottom-2 right-2 px-2 py-0.5 bg-orange-600 text-white text-[8px] font-bold uppercase rounded'>Result</span>
                                        </div>
                                    </div>
                                ) : (
                                    <img src={selectedHistoryItem.content} className='max-w-full max-h-[75vh] object-contain rounded-lg' alt="Result" />
                                )}
                            </div>
                        </div>
                        <div className='w-full md:w-80 bg-white p-6 flex flex-col justify-between space-y-6'>
                            <div className='space-y-6'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <div className='p-1.5 bg-orange-50 rounded-lg'>
                                            <Wand2 className='w-4 h-4 text-[#FF4B2B]'/>
                                        </div>
                                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Studio Creation</span>
                                    </div>
                                    <button onClick={() => setSelectedHistoryItem(null)} className='p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-800'><X className='w-5 h-5'/></button>
                                </div>
                                <div className='space-y-2'>
                                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>Applied Action</p>
                                    <div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
                                        <p className='text-xs font-medium text-slate-700 leading-relaxed italic'>"{selectedHistoryItem.prompt}"</p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    const url = selectedHistoryItem.content.includes('|') ? selectedHistoryItem.content.split('|')[1] : selectedHistoryItem.content;
                                    downloadImage(url, `studio-${selectedHistoryItem.id}.png`);
                                }}
                                className='w-full flex items-center justify-center gap-2 py-3 bg-[#FF4B2B] text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-orange-100'
                            >
                                <Download className='w-4 h-4'/> Download Asset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ImageStudio
