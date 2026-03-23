import { ArrowLeft, Scissors, Sparkles, Image as ImageIcon, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const RemoveObject = () => {
  const [input, setInput] = useState(null)
  const [preview, setPreview] = useState(null)
  const [object, setObject] = useState('') 
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const navigate = useNavigate()
  const {getToken} = useAuth()
  
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
            Back to Dashboard
        </button>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full transition-all duration-500'>
            {/* Left Column: Configuration */}
            <form onSubmit={onSubmitHandler} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-8 flex flex-col justify-between'>
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
"
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

            {/* Right Column: Result Deck */}
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col min-h-[400px] lg:max-h-[600px]'>
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

                <div className='flex-1 relative aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner group'>
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
    </div>
  )
}

export default RemoveObject;