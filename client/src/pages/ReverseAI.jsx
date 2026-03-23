import { Camera, Sparkles, Image as ImageIcon, Copy, Check } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const ReverseAI = () => {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  
  const {getToken} = useAuth()
  
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
            {/* Left Column: Upload */}
            <form onSubmit={onSubmitHandler} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-8 h-fit'>
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
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col min-h-[500px] h-fit lg:max-h-[800px]'>
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
    </div>
  )
}

export default ReverseAI;
