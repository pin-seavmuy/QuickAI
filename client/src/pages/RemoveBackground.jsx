import { Eraser, Sparkles, Image as ImageIcon, Download } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const RemoveBackground = () => {
  const [input, setInput] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input) return toast.error("Please select an image");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', input);

      const { data } = await axios.post(
        '/api/ai/remove-image-background',
        formData,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 text-slate-700 bg-slate-50/30'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full transition-all duration-500'>
            {/* Left Column: Configuration */}
            <form onSubmit={onSubmitHandler} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-8 h-fit'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-rose-50 rounded-lg'>
                        <Sparkles className='w-6 h-6 text-[#FF4938]'/>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-800'>Background Removal</h1>
                        <p className='text-xs text-slate-500 font-medium'>Instant AI background isolation</p>
                    </div>
                </div>

                <div className='space-y-3'>
                    <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Source Image</p>
                    <div className='relative group'>
                    <div className='relative'>
                        <input
                            type="file"
                            accept='image/*'
                            className='w-full p-4 outline-none text-sm rounded-xl border border-slate-200 focus:border-[#FF4938] focus:ring-1 focus:ring-[#FF4938] transition-all bg-slate-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#FF4938] file:text-white hover:file:opacity-90'
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if(file) {
                                    setInput(file);
                                    setPreview(URL.createObjectURL(file));
                                }
                            }}
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
                        <p className='text-[10px] text-slate-400 font-medium mt-2 flex items-center gap-1'>
                            <ImageIcon className='w-3 h-3'/>
                            JPG, PNG, or WebP supported (Max 5MB)
                        </p>
                    </div>
                </div>

                <button 
                    disabled={loading} 
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-6 py-3.5 mt-6 text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-100'
                >
                    {loading ? (
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin'></span>
                            <span>Isolating Subject...</span>
                        </div>
                    ) : (
                        <>
                            <Eraser className='w-5 h-5'/>
                            <span>Remove Background</span>
                        </>
                    )}
                </button>
            </form>

            {/* Right Column: Result Deck */}
            <div className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col min-h-[400px] h-fit lg:max-h-[600px]'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-rose-50 rounded-lg'>
                            <Eraser className='w-5 h-5 text-[#FF4938]'/>
                        </div>
                        <h1 className='text-lg font-bold text-slate-800'>Processed Image</h1>
                    </div>
                    {content && (
                        <a 
                            href={content} 
                            download="clearcut-result.png"
                            className='text-xs font-bold text-[#FF4938] hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5'
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
                                <p className='text-sm font-bold text-slate-400'>Awaiting Subject</p>
                                <p className='text-xs text-slate-400'>Upload an image on the left to begin isolation</p>
                            </div>
                        </div>
                    ) : (
                        <div className='w-full h-full relative p-4 flex items-center justify-center'>
                            {/* Checkerboard background for transparency preview */}
                            <div className='absolute inset-0 opacity-[0.03]' style={{ backgroundImage: 'radial-gradient(#000 10%, transparent 10%)', backgroundSize: '10px 10px' }}></div>
                            <img 
                                src={content} 
                                alt="Background Removed" 
                                className='max-w-full max-h-full object-contain relative z-10 animate-in fade-in zoom-in-95 duration-500'
                            />
                        </div>
                    )}
                </div>

                {content && (
                    <div className='p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-3'>
                        <div className='p-1.5 bg-rose-100 rounded-lg'>
                            <Sparkles className='w-4 h-4 text-[#FF4938]'/>
                        </div>
                        <p className='text-xs font-medium text-rose-800 italic'>
                            "The background was removed with high precision for your professional workflow."
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default RemoveBackground;
