"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, Clock, CalendarDays, Calendar, Sparkles } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const pathname = usePathname();
  
  // Hide on Landing page and Booking flows
  if (pathname === '/' || pathname.startsWith('/book')) return null;

  return (
    <div className="fixed sm:left-6 sm:top-1/2 sm:-translate-y-1/2 bottom-6 left-1/2 -translate-x-1/2 sm:-translate-x-0 z-50 h-auto">
      <motion.nav 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="backdrop-blur-2xl bg-white/70 shadow-xl shadow-gray-200/50 border border-white/60 rounded-3xl p-2 sm:p-2.5 flex flex-row sm:flex-col items-center gap-1.5 sm:gap-2"
      >
        <Link href="/" className="mb-1 mt-1 group outline-none hidden sm:flex items-center justify-center">
           <div className="relative bg-gradient-to-tr from-blue-600 to-cyan-400 text-white rounded-xl p-2 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
             <div className="absolute inset-0 rounded-xl bg-white mix-blend-overlay opacity-0 group-hover:opacity-20 transition-opacity"></div>
             <Calendar className="w-5 h-5 stroke-[2.5] relative z-10" />
             <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-cyan-200 group-hover:animate-pulse fill-cyan-100 drop-shadow-sm z-20" />
           </div>
        </Link>
        
        <div className="w-6 h-px bg-gray-200/60 mb-1 rounded-full hidden sm:block"></div>

        <NavItem href="/dashboard" tooltip="Schedules" icon={<LayoutGrid className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />} active={pathname === '/dashboard'} />
        <NavItem href="/availability" tooltip="Availability" icon={<Clock className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />} active={pathname === '/availability'} />
        <NavItem href="/meetings" tooltip="Meetings" icon={<CalendarDays className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />} active={pathname === '/meetings'} />
      </motion.nav>
    </div>
  );
}

function NavItem({ href, tooltip, icon, active }) {
  return (
    <div className="relative group flex justify-center">
      <Link href={href}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-2.5 rounded-2xl transition-all duration-300 flex items-center justify-center relative shadow-sm group-hover/btn:shadow-md ${active ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-500/30 ring-1 ring-white/20' : 'bg-transparent text-gray-400 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200 hover:shadow-gray-200/50'}`}
        >
          {active && <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none"></div>}
          {icon}
        </motion.button>
      </Link>
      
      {/* Right-sprouting Tooltip (Desktop) and Top-sprouting (Mobile) */}
      <div className="absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-[calc(100%+20px)] bottom-[calc(100%+15px)] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 sm:-translate-x-2 group-hover:translate-x-0 bg-gray-900 text-white text-[11px] uppercase tracking-widest font-extrabold px-3.5 py-2 rounded-xl whitespace-nowrap z-50 shadow-2xl">
         {tooltip}
         <div className="absolute hidden sm:block top-1/2 -translate-y-1/2 -left-1.5 border-[6px] border-transparent border-r-gray-900"></div>
         <div className="absolute block sm:hidden bottom-0 translate-y-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}
