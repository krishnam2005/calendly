import { Calendar, Sparkles } from "lucide-react";

export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      <div className="relative bg-gradient-to-tr from-blue-600 to-cyan-400 text-white rounded-[12px] p-2 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300 outline-none">
        <div className="absolute inset-0 rounded-[12px] bg-white mix-blend-overlay opacity-0 group-hover:opacity-20 transition-opacity"></div>
        <Calendar className="w-[18px] h-[18px] stroke-[2.5] relative z-10" />
        <Sparkles className="w-3.5 h-3.5 absolute -top-1.5 -right-1.5 text-cyan-200 group-hover:animate-pulse fill-cyan-100 drop-shadow-sm z-20" />
      </div>
      <span className="text-[22px] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 group-hover:from-blue-700 group-hover:to-cyan-600 transition-all duration-300">
        <span className="font-black tracking-wide">Sched</span>
        <span className="font-bold tracking-wide">ulr</span>
      </span>
    </div>
  );
}
