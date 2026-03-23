import { ArrowLeft, Image, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';


const GenerateImages = () => {
  const imageStyle = ['Realistic', 'Ghibli style', 'Anime style', 'Cartoon style', 'Fantasy style', 'Realistic style', '3D style', 'Portrait style']
    
  const [selectedStyle, setSelectedStyle] = useState('Realistic')
  const [input, setInput] = useState('')
  const [publish, setPublish] = useState(false)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const navigate = useNavigate()
  const {getToken} = useAuth()

  const onSubmitHandler = async (e)=>{
        e.preventDefault();
        try {
            setLoading(true)

            const prompt = `Generate an image of ${input} in the style ${selectedStyle}`

            const {data} = await axios.post('/api/ai/generate-image', {prompt, publish}, {headers: {Authorization: `Bearer ${await getToken()}`}})

            if(data.success){
                setContent(data.content)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
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

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full'>
            {/* Left Column: Configuration */}
            <form onSubmit={onSubmitHandler} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-8 flex flex-col justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-green-50 rounded-lg'>
                        <Sparkles className='w-6 h-6 text-[#00AD25]'/>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-800'>AI Image Studio</h1>
                        <p className='text-xs text-slate-500 font-medium'>Craft your perfect visualization</p>
                    </div>
                </div>

                <div className='space-y-3'>
                    <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Describe Your Vision</p>
                    <textarea 
                        onChange={(e)=>setInput(e.target.value)} 
                        value={input} 
                        rows={4} 
                        className='w-full p-4 outline-none text-sm rounded-xl border border-slate-200 focus:border-[#00AD25] focus:ring-1 focus:ring-[#00AD25] transition-all bg-slate-50/50' 
                        placeholder='A futuristic cyberpunk city with neon lights and flying cars...' 
                        required
                    />
                </div>

                <div className='space-y-4'>
                    <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Select Artistic Style</p>
                    <div className='flex gap-2.5 flex-wrap'>
                        {imageStyle.map((item)=>(
                            <span 
                                onClick={()=>setSelectedStyle(item)} 
                                key={item}
                                className={`text-xs px-4 py-2 border rounded-full cursor-pointer transition-all font-medium ${selectedStyle === item ? 'bg-[#00AD25] text-white border-[#00AD25] shadow-md shadow-green-100' : 'bg-white text-slate-600 border-slate-200 hover:border-[#00AD25] hover:bg-green-50/30'} `} 
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
                  
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className='space-y-0.5'>
                        <p className="text-sm font-bold text-slate-800">Community Gallery</p>
                        <p className='text-[10px] text-slate-500 font-medium'>Share this creation with others</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={publish} onChange={(e) => setPublish(e.target.checked)}/>
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00AD25]"></div>
                    </label>
                </div>
                
                <button 
                    disabled={loading} 
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-6 py-3.5 mt-auto text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-100'
                >
                    {loading ? (
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin'></span>
                            <span>Visualizing...</span>
                        </div>
                    ) : (
                        <>
                            <Image className='w-5 h-5'/>
                            <span>Generate Dream</span>
                        </>
                    )}
                </button>
            </form>

            {/* Right Column: Preview */}
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-green-50 rounded-lg'>
                            <Image className='w-5 h-5 text-[#00AD25]'/>
                        </div>
                        <h1 className='text-lg font-bold text-slate-800'>Result Deck</h1>
                    </div>
                    {content && (
                        <a 
                            href={content} 
                            download="ai-creation.png"
                            className='text-xs font-bold text-[#00AD25] hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg transition-colors'
                        >
                            Download High-Res
                        </a>
                    )}
                </div>

                <div className='relative w-full aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner group'>
                    {!content ? (
                        <div className='absolute inset-0 flex flex-col items-center justify-center space-y-4 text-slate-300 px-8 text-center'>
                            <div className='p-6 bg-white rounded-full shadow-sm'>
                                <Image className='w-12 h-12'/>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-sm font-bold text-slate-400'>Ready to Visualize</p>
                                <p className='text-xs text-slate-400'>Enter a prompt on the left to begin</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <img 
                                src={content} 
                                alt="AI Generation" 
                                className='w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500'
                            />
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none'></div>
                        </>
                    )}
                </div>

                {content && (
                    <div className='p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3'>
                        <div className='p-1.5 bg-green-100 rounded-lg'>
                            <Sparkles className='w-4 h-4 text-[#00AD25]'/>
                        </div>
                        <p className='text-xs font-medium text-green-800 italic'>
                            "The quality of this generation was enhanced by our latest AI filters."
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

export default GenerateImages