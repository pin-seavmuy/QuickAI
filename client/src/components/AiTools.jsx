import React from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const AiTools = () => {
    const navigate = useNavigate()
    const {user} = useUser()
  return (
    <div className='px-4 sm:px-20 xl:px-32 my-24'>
        <div className='text-center'>
            <h2 className='text-slate-700 text-[42px] font-semibold'>Powerful AI Tools</h2>
            <p className='text-gray-500 max-w-lg mx-auto'>Everything you need to create, enhance, and optimize your content with cutting-edge AI technology.</p>
        </div>

        <div className='flex flex-wrap met-10 justify-center'>
            {AiToolsData.map((tool, index)=>(
                <div onClick={()=> user && navigate(tool.path)} key={index} className='p-6 m-4 w-full sm:w-[320px] rounded-2xl bg-white shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group'>
                    <div className='flex items-center gap-4 mb-4'>
                        <tool.Icon className='w-12 h-12 p-3 text-white rounded-xl shadow-sm transform group-hover:rotate-6 transition-transform duration-300' style={{background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`}}/>
                        <h3 className='text-lg font-bold text-slate-800 leading-tight'>{tool.title}</h3>
                    </div>
                    <p className='text-slate-500 text-sm leading-relaxed'>{tool.description}</p>
                </div>
            ))}
        </div>
    </div>
  )
}

export default AiTools