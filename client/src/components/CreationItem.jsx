import React, { useState } from 'react'
import Markdown from 'react-markdown'
import toast from 'react-hot-toast'
import { Image as ImageIcon, FileText, Hash, Scissors, Eraser, SquarePen, Calendar, ArrowRight, Download, Eye, X, Copy, Check, Share2, Trash2, ChevronDown, Zap, Sparkles } from 'lucide-react'
import { downloadImage } from '../utils/download'
import { useNavigate } from 'react-router-dom'

const typeMap = {
    'image': { Icon: ImageIcon, color: 'text-green-600', bg: 'bg-green-50' },
    'upscale': { Icon: Sparkles, color: 'text-orange-600', bg: 'bg-orange-50' },
    'article': { Icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    'blog-title': { Icon: Hash, color: 'text-purple-600', bg: 'bg-purple-50' },
    'remove-background': { Icon: Eraser, color: 'text-orange-600', bg: 'bg-orange-50' },
    'remove-object': { Icon: Scissors, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    'review-resume': { Icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
}

const CreationItem = ({ item, onDelete, isSelected, onSelect }) => {
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(false)
    const [copied, setCopied] = useState(false)
    const [showLightbox, setShowLightbox] = useState(false)
    const [lightboxMode, setLightboxMode] = useState('comparison') // 'comparison', 'original', 'processed'

    // Handle Dual Images for Comparison (Upscale, BG Removal, Object Removal)
    const showComparison = ['upscale', 'remove-background', 'remove-object'].includes(item.type) || item.content.includes('|')
    const [originalUrl, processedUrl] = item.content.includes('|') ? item.content.split('|') : [null, item.content]
    const config = typeMap[item.type] || { Icon: SquarePen, color: 'text-slate-600', bg: 'bg-slate-50' }

    const handleShare = async (e) => {
        e.stopPropagation()
        const shareData = {
            title: 'QuickAI Creation',
            text: `Check out this AI creation: "${item.prompt}"`,
            url: item.content.startsWith('http') ? item.content : window.location.href
        }
        
        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(shareData.url)
                toast.success('Link copied to clipboard')
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error sharing:', err)
                toast.error('Share failed')
            }
        }
    }

    return (
        <div 
            onClick={() => setExpanded(!expanded)} 
            className={`relative p-4 w-full text-xs bg-white border rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all group animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both ${
                isSelected 
                ? 'border-blue-500 ring-2 ring-blue-500/10 bg-blue-50/10' 
                : 'border-slate-200'
            }`}
        >
            {/* Selection Checkbox */}
            <div 
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className={`absolute -top-2 -left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                    isSelected 
                    ? 'bg-blue-600 border-blue-600 scale-110 shadow-lg' 
                    : 'bg-white border-slate-200 opacity-0 group-hover:opacity-100'
                }`}
            >
                {isSelected && <Check className='w-3.5 h-3.5 text-white' />}
            </div>
            <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-3 overflow-hidden'>
                    <div className={`w-10 h-10 rounded-lg ${config.bg} ${config.color} flex items-center justify-center flex-shrink-0 shadow-inner`}>
                        <config.Icon className='w-5 h-5' />
                    </div>
                    <div className='overflow-hidden'>
                        <h2 className='font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate'>{item.prompt}</h2>
                        <div className='flex items-center gap-2 mt-0.5'>
                            <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0 rounded ${config.bg} ${config.color}`}>
                                {item.type.replace('-', ' ')}
                            </span>
                            <div className='flex items-center gap-1 text-slate-400 text-[10px]'>
                                <Calendar className='w-2.5 h-2.5' />
                                {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='text-slate-300'>
                   <ChevronDown className={`w-4 h-4 group-hover:text-blue-600 transition-all duration-300 ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {
                expanded && (
                    <div className='mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300'>
                        <div className='grid grid-cols-1 gap-6'>
                            {/* Generated Content Side */}
                            <div className='space-y-3'>
                                <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Result</h3>
                                {item.type === 'image' || showComparison ? (
                                    <div className='relative group/img w-full max-w-sm overflow-hidden rounded-xl shadow-md border border-slate-100 bg-slate-50'>
                                        {showComparison ? (
                                            <div className='grid grid-cols-2 gap-4 w-full h-full p-2'>
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); setLightboxMode('original'); setShowLightbox(true); }}
                                                    className='relative group/before overflow-hidden rounded-xl border border-slate-100 bg-slate-50 cursor-zoom-in hover:border-blue-200 transition-colors'
                                                >
                                                    <img src={originalUrl} className='w-full h-full object-contain' alt="Before" />
                                                    <span className='absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest rounded-md'>Original</span>
                                                </div>
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); setLightboxMode('processed'); setShowLightbox(true); }}
                                                    className='relative group/after overflow-hidden rounded-xl border border-orange-100 bg-orange-50/20 cursor-zoom-in hover:border-orange-200 transition-colors'
                                                >
                                                    <img src={processedUrl} className='w-full h-full object-contain' alt="After" />
                                                    <span className='absolute bottom-2 right-2 px-2 py-0.5 bg-orange-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-md animate-pulse'>Refined</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={item.content} alt='generated' className='w-full h-auto object-cover'/>
                                        )}
                                    </div>
                                ) : (
                                    <div className='p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar shadow-inner text-[11px]'>
                                        <div className='reset-tw prose prose-slate max-w-none prose-xs text-justify'>
                                            <Markdown>{item.content}</Markdown>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Details & Actions Side */}
                            <div className='flex flex-col h-full space-y-8'>
                                {/* Prompt Box */}
                                <div className='space-y-3 flex-grow'>
                                    <h3 className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Original Prompt</h3>
                                    <div className='p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-slate-700 italic text-sm leading-relaxed shadow-sm'>
                                        "{item.prompt}"
                                    </div>
                                </div>

                                {/* Actions Container */}
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between flex-wrap gap-3'>
                                        <div className='flex flex-wrap gap-3'>
                                            {item.type === 'image' || showComparison ? (
                                                <>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setLightboxMode('comparison');
                                                            setShowLightbox(true);
                                                        }}
                                                        className='flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold shadow-sm'
                                                    >
                                                        <Eye className='w-4 h-4' />
                                                        View
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/ai/upscale-image');
                                                        }}
                                                        className='flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-100 px-5 py-2.5 rounded-xl hover:bg-orange-100 transition-all text-sm font-bold shadow-sm'
                                                        title="Upscale & Restore with AI"
                                                    >
                                                        <Zap className='w-4 h-4' />
                                                        Upscale
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            downloadImage(processedUrl, `creation-${item.id}.png`);
                                                        }}
                                                        className='flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all text-sm font-bold shadow-sm'
                                                    >
                                                        <Download className='w-4 h-4' />
                                                        Download
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(item.content);
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 2000);
                                                    }}
                                                    className='flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all text-sm font-bold shadow-sm'
                                                >
                                                    {copied ? <Check className='w-4 h-4' /> : <Copy className='w-4 h-4' />}
                                                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                                                </button>
                                            )}
                                            <button 
                                                onClick={handleShare}
                                                className='flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold shadow-sm'
                                            >
                                                <Share2 className='w-4 h-4' />
                                                Share
                                            </button>
                                        </div>

                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Are you sure you want to delete this creation?')) {
                                                    onDelete(item.id);
                                                }
                                            }}
                                            className='flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-5 py-2.5 rounded-xl hover:bg-red-100 transition-all text-sm font-bold shadow-sm ml-auto'
                                        >
                                            <Trash2 className='w-4 h-4' />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Lightbox Modal */}
            {showLightbox && (
                <div 
                    className='fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300'
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowLightbox(false);
                    }}
                >
                    <button 
                        className='absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:rotate-90'
                        onClick={() => setShowLightbox(false)}
                    >
                        <X className='w-6 h-6' />
                    </button>
                    
                    <div 
                        className='relative max-w-7xl w-full h-full flex flex-col items-center justify-center p-4'
                        onClick={(e) => e.stopPropagation()}
                    >
                                {lightboxMode === 'comparison' && originalUrl && processedUrl ? (
                                    <div className='flex flex-col lg:flex-row gap-6 w-full h-full p-2 items-center justify-center'>
                                        <div className='relative group/before overflow-hidden rounded-2xl border border-white/10 bg-white/5 flex-1 max-h-full'>
                                            <img src={originalUrl} className='w-full h-full object-contain' alt="Before" />
                                            <span className='absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10'>Before Enhancement</span>
                                        </div>
                                        <div className='hidden lg:flex items-center justify-center'>
                                            <div className='w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/40'>
                                                <ArrowRight className='w-6 h-6' />
                                            </div>
                                        </div>
                                        <div className='relative group/after overflow-hidden rounded-2xl border border-orange-500/30 bg-orange-500/5 flex-1 max-h-full'>
                                            <img src={processedUrl} className='w-full h-full object-contain' alt="After" />
                                            <span className='absolute top-4 right-4 px-3 py-1 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-orange-500/20 animate-pulse'>After AI Refinement</span>
                                        </div>
                                    </div>
                                ) : (
                                    <img 
                                        src={lightboxMode === 'original' ? originalUrl : processedUrl} 
                                        className='max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-500' 
                                        alt="Full View" 
                                    />
                                )}
                    </div>
                </div>
            )}
        </div>
                )
            }
        </div>
    )
}

export default CreationItem