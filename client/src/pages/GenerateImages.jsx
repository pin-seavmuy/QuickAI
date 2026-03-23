import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { downloadImage } from '../utils/download'
import { driver } from "driver.js"
import { HelpCircle } from 'lucide-react'


const GenerateImages = () => {
  const imageStyle = ['Realistic', 'Ghibli style', 'Anime style', 'Cartoon style', 'Fantasy style', 'Realistic style', '3D style', 'Portrait style']
    
    const [selectedStyle, setSelectedStyle] = useState('Realistic')
    const [input, setInput] = useState('')
    const [publish, setPublish] = useState(false)
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState('')
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedHistoryImage, setSelectedHistoryImage] = useState(null)

    const navigate = useNavigate()
    const {getToken} = useAuth()
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
                // Filter only images
                setHistory(data.creations.filter(c => c.type === 'image'))
            }
        } catch (error) {
            console.error("History fetch error:", error)
        } finally {
            setHistoryLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchHistory()
        }
    }, [user])

    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            steps: [
                { element: '#generate-header', popover: { title: 'AI Image Generator', description: 'Transform your thoughts into stunning visuals. Describe anything, and watch it come to life!', side: "bottom", align: 'start' }},
                { element: '#vision-input', popover: { title: 'Your Vision', description: 'Type your prompt here. Be as descriptive as you like!', side: "right", align: 'start' }},
                { element: '#style-selector', popover: { title: 'Artistic Styles', description: 'Choose a style to give your image a unique look and feel.', side: "right", align: 'start' }},
                { element: '#community-toggle', popover: { title: 'Share with Community', description: 'Toggle this to show your creation in the public gallery.', side: "right", align: 'start' }},
                { element: '#generate-btn', popover: { title: 'Start Creation', description: 'Hit this button to start the AI generation process.', side: "top", align: 'start' }},
                { element: '#generate-results', popover: { title: 'Your Artwork', description: 'The generated masterpiece will appear here. You can download it directly!', side: "left", align: 'start' }},
                { element: '#generate-history', popover: { title: 'Visualization Gallery', description: 'All your previously generated images are stored here.', side: "top", align: 'start' }},
            ]
        });
        driverObj.drive();
    }

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenGenerateTour');
        if (!hasSeenTour && user && history.length >= 0) {
            setTimeout(() => {
                startTour();
                localStorage.setItem('hasSeenGenerateTour', 'true');
            }, 1000);
        }
    }, [user]);

  const onSubmitHandler = async (e)=>{
        e.preventDefault();
        try {
            setLoading(true)

            const prompt = `Generate an image of ${input} in the style ${selectedStyle}`

            const {data} = await axios.post('/api/ai/generate-image', {prompt, publish}, {headers: {Authorization: `Bearer ${await getToken()}`}})

            if(data.success){
                setContent(data.content)
                fetchHistory() // Refresh history
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
            Back 
        </button>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full'>
            {/* Left Column: Configuration */}
            <form onSubmit={onSubmitHandler} className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between lg:min-h-[500px] lg:max-h-[600px] overflow-y-auto custom-scrollbar shadow-green-100/10'>
                <div id="generate-header" className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-green-50 rounded-lg'>
                            <Sparkles className='w-6 h-6 text-[#00AD25]'/>
                        </div>
                        <div>
                            <h1 className='text-xl font-bold text-slate-800'>AI Image Generate</h1>
                            <p className='text-xs text-slate-500 font-medium'>Create your perfect visualization</p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={startTour}
                        className='p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-green-500 transition-colors'
                        title="Help Tour"
                    >
                        <HelpCircle className='w-5 h-5' />
                    </button>
                </div>

                <div id="vision-input" className='space-y-3'>
                    <p className='text-sm font-bold text-slate-700 uppercase tracking-tight'>Describe Your Vision</p>
                    <textarea 
                        onChange={(e)=>setInput(e.target.value)} 
                        value={input} 
                        rows={2} 
                        className='w-full p-4 outline-none text-sm rounded-xl border border-slate-200 focus:border-[#00AD25] focus:ring-1 focus:ring-[#00AD25] transition-all bg-slate-50/50 resize-none' 
                        placeholder='A futuristic cyberpunk city...' 
                        required
                    />
                </div>

                <div id="style-selector" className='space-y-4'>
                    <div className='flex gap-2 flex-wrap'>
                        {imageStyle.map((item)=>(
                            <span 
                                onClick={()=>setSelectedStyle(item)} 
                                key={item}
                                className={`text-[13px] px-4 py-2 border rounded-xl cursor-pointer transition-all font-bold ${selectedStyle === item ? 'bg-[#00AD25] text-white border-[#00AD25] shadow-md shadow-green-100' : 'bg-white text-slate-500 border-slate-200 hover:border-[#00AD25] hover:bg-green-50/50'} `} 
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
                <div id="community-toggle" className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
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
                    id="generate-btn"
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
                            <span>Generate Image</span>
                        </>
                    )}
                </button>
            </form>

            {/* Right Column: Preview */}
            <div id="generate-results" className='w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col lg:min-h-[500px] lg:max-h-[600px] shadow-green-100/20'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-green-50 rounded-lg'>
                            <Image className='w-5 h-5 text-[#00AD25]'/>
                        </div>
                        <h1 className='text-lg font-bold text-slate-800'>Results</h1>
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

                <div className='relative w-full aspect-video bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner group'>
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

        {/* Creation History Section */}
        <div id="generate-history" className='w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-slate-100 rounded-lg border border-slate-200'>
                        <LayoutGrid className='w-5 h-5 text-slate-600'/>
                    </div>
                    <div>
                        <h2 className='text-lg font-bold text-slate-800'>Recent Visualizations</h2>
                        <p className='text-xs text-slate-500 font-medium'>Manage and re-download your previous generations</p>
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
                                className='w-full pl-9 pr-4 py-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium placeholder:text-slate-400 shadow-sm'
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
                <div className='w-full p-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-5 group/empty transition-all hover:border-green-200 hover:bg-green-50/10'>
                    <div className='relative'>
                        <div className='absolute inset-0 bg-green-100 rounded-full blur-2xl opacity-40 group-hover/empty:opacity-70 transition-opacity'></div>
                        <div className='relative p-6 bg-white rounded-full shadow-sm border border-slate-100 group-hover/empty:scale-110 transition-transform duration-500'>
                            <Image className='w-10 h-10 text-slate-300 group-hover/empty:text-green-400 transition-colors'/>
                        </div>
                    </div>
                    <div className='space-y-1.5'>
                        <p className='text-base font-bold text-slate-400 group-hover/empty:text-slate-600 transition-colors'>Gallery is Empty</p>
                        <p className='text-xs text-slate-400 max-w-[240px] font-medium'>Generate your first image to start building your personal library.</p>
                    </div>
                </div>
            ) : (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6'>
                    {history
                        .filter(item => 
                            item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((item, index) => (
                            <div 
                                key={index} 
                                className='group relative aspect-square bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4'
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <img 
                                    src={item.content} 
                                    alt={item.prompt} 
                                    onClick={() => setSelectedHistoryImage(item)}
                                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in'
                                    loading="lazy"
                                />
                                
                                {/* Overlay Gradient */}
                                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4'>
                                    <p className='text-[10px] text-white font-medium line-clamp-2 leading-tight mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500'>
                                        {item.prompt}
                                    </p>
                                    
                                    <div className='flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500'>
                                        <button 
                                            onClick={() => {
                                                setSelectedHistoryImage(item);
                                            }}
                                            className='flex-1 py-1.5 bg-white text-slate-900 text-[10px] font-bold rounded-lg hover:bg-green-500 hover:text-white transition-colors flex items-center justify-center gap-1.5'
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

                                {/* Quick Download Badge (Visible only on hover) */}
                                <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100'>
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            downloadImage(item.content, `ai-gen-${item.id?.toString() || 'export'}.png`);
                                        }}
                                        className='flex items-center justify-center w-8 h-8 bg-black/40 text-white rounded-full border border-white/20 hover:bg-white hover:text-slate-900 transition-all shadow-lg'
                                    >
                                        <Download className='w-4 h-4'/>
                                    </button>
                                </div>
                            </div>
                        ))}
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
                <div className='relative w-fit max-w-[95vw] lg:max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row max-h-[95vh] min-h-[400px]'>
                    {/* Left: Image Display */}
                    <div className='bg-slate-50 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 p-6'>
                        <img 
                            src={selectedHistoryImage.content} 
                            alt={selectedHistoryImage.prompt} 
                            className='max-w-full max-h-[75vh] w-auto h-auto rounded-lg shadow-sm'
                        />
                    </div>

                    {/* Right: Details & Actions */}
                    <div className='w-full md:w-80 bg-white p-6 flex flex-col justify-between space-y-6'>
                        <div className='space-y-6'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <div className='p-1.5 bg-green-50 rounded-lg'>
                                        <Sparkles className='w-4 h-4 text-[#00AD25]'/>
                                    </div>
                                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Image Generated</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedHistoryImage(null)}
                                    className='p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-800'
                                >
                                    <X className='w-5 h-5'/>
                                </button>
                            </div>

                            <div className='space-y-2'>
                                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>Original Prompt</p>
                                <div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
                                    <p className='text-xs font-medium text-slate-700 leading-relaxed italic'>
                                        "{selectedHistoryImage.prompt}"
                                    </p>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 gap-3'>
                                <div className='p-3 bg-slate-50 rounded-xl border border-slate-100'>
                                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1'>Aspect Ratio</p>
                                    <p className='text-xs font-bold text-slate-800'>Cinematic 16:9</p>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-3'>
                            <button 
                                onClick={() => downloadImage(selectedHistoryImage.content, `ai-gen-${selectedHistoryImage.id?.toString() || 'export'}.png`)}
                                className='w-full flex items-center justify-center gap-2 py-3 bg-[#00AD25] text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-green-100'
                            >
                                <Download className='w-4 h-4'/>
                                Download Asset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default GenerateImages