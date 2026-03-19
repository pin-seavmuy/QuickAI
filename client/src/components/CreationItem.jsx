import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { Image as ImageIcon, FileText, Hash, Scissors, Eraser, SquarePen, Calendar, ArrowRight, Download, Copy, Check, Share2 } from 'lucide-react'

const typeMap = {
    'image': { Icon: ImageIcon, color: 'text-green-600', bg: 'bg-green-50' },
    'article': { Icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    'blog-title': { Icon: Hash, color: 'text-purple-600', bg: 'bg-purple-50' },
    'remove-background': { Icon: Eraser, color: 'text-orange-600', bg: 'bg-orange-50' },
    'remove-object': { Icon: Scissors, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    'review-resume': { Icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
}

const CreationItem = ({ item }) => {
    const [expanded, setExpanded] = useState(false)
    const [copied, setCopied] = useState(false)
    const config = typeMap[item.type] || { Icon: SquarePen, color: 'text-slate-600', bg: 'bg-slate-50' }

    return (
        <div onClick={() => setExpanded(!expanded)} className='p-6 w-full text-sm bg-white border border-slate-200 rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition-all group'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div className='flex items-center gap-4'>
                    <div className={`w-12 h-12 rounded-xl ${config.bg} ${config.color} flex items-center justify-center hidden sm:flex shadow-inner`}>
                        <config.Icon className='w-6 h-6' />
                    </div>
                    <div>
                        <h2 className='font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors'>{item.prompt}</h2>
                        <div className='flex items-center gap-3 mt-1'>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                                {item.type.replace('-', ' ')}
                            </span>
                            <div className='flex items-center gap-1 text-slate-400 text-xs'>
                                <Calendar className='w-3 h-3' />
                                {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='text-slate-400 hidden sm:block'>
                   <ArrowRight className='w-5 h-5 group-hover:text-blue-600 transition-colors' />
                </div>
            </div>
            {
                expanded && (
                    <div className='mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                            {/* Generated Content Side */}
                            <div className='space-y-4'>
                                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Generated Result</h3>
                                {item.type === 'image' ? (
                                    <div className='relative group/img w-full overflow-hidden rounded-2xl shadow-md border border-slate-100 bg-slate-50'>
                                        <img src={item.content} alt='generated' className='w-full h-auto object-cover'/>
                                        <div className='absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors pointer-events-none'></div>
                                    </div>
                                ) : (
                                    <div className='p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar shadow-inner'>
                                        <div className='reset-tw prose prose-slate max-w-none'>
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
                                    <h3 className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Quick Actions</h3>
                                    <div className='flex flex-wrap gap-3'>
                                        {item.type === 'image' ? (
                                            <a 
                                                href={item.content} 
                                                download={`creation-${item.id}.png`}
                                                onClick={(e) => e.stopPropagation()}
                                                className='flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all text-sm font-bold shadow-sm'
                                            >
                                                <Download className='w-4 h-4' />
                                                Download Image
                                            </a>
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
                                            onClick={(e) => e.stopPropagation()}
                                            className='flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold shadow-sm'
                                        >
                                            <Share2 className='w-4 h-4' />
                                            Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default CreationItem