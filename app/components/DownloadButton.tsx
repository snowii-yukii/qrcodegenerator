import { LucideIcon } from "lucide-react"

interface props{
    title: string,
    icon: LucideIcon,
    handleclick: () => void,
}

export default function DownloadButton({title, icon, handleclick}: props) {
    const Icon = icon

    return(
        <div className='w-20 h-20 border rounded border-black/20 active:scale-95 transition-all duration-150'>
            <button className='w-full h-full flex flex-col gap-2 justify-center items-center text-sm cursor-pointer'
            onClick={handleclick}>  
                <Icon size={18}/>
                {title}
            </button>
        </div>
    )

}