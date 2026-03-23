import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { ArrowLeft, Download, Upload, Sparkles, ArrowRight, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { downloadImage } from '../utils/download'

const UpscaleImage = () => {
  const [image, setImage] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { getToken } = useAuth()

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
            Back to Dashboard
        </button>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full transition-all duration-500'>
            {/* Left Column: Configuration */}
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-8 flex flex-col justify-between'>
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
            </div>

            {/* Right Column: Result Deck */}
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col min-h-[450px] lg:max-h-[650px]'>
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

                <div className='flex-1 relative aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner group'>
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
    </div>
  )
}

export default UpscaleImage
