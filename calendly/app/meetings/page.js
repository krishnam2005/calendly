"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { Calendar, Video, XCircle, Inbox, User, Loader2, CalendarClock, PlusCircle, MapPin, ExternalLink, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import clsx from "clsx";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [tab, setTab] = useState("upcoming");
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const bx = await api.getBookings();
      const ev = await api.getEvents();
      setMeetings(bx);
      setEvents(ev);
    } catch (err) {
      addToast("Failed to fetch meetings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await api.cancelBooking(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
      addToast("Booking cancelled successfully", "success");
    } catch (err) {
      addToast("Failed to cancel meeting", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const getEventDetails = (id) => events.find((e) => e.id === id) || {};
  const formatPlatform = (p) => ({ google_meet: "Google Meet", zoom: "Zoom", teams: "Microsoft Teams", custom: "Custom Link" })[p] || "Meeting";

  const now = new Date();

  const upcoming = meetings.filter((m) => isAfter(parseISO(m.start_time), now));
  const past = meetings.filter((m) => isBefore(parseISO(m.start_time), now));

  const displayList = tab === "upcoming" ? upcoming : past;

  if (loading) {
    return (
      <div className="container-compact pt-14 sm:pl-28 lg:pl-32 pb-20 flex flex-col gap-5 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="container-compact pt-14 sm:pl-28 lg:pl-32 pb-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="flex flex-col">
          <motion.h1 
             initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
             className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-2"
          >
            Meetings
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2.5 bg-blue-50/80 border border-blue-100/50 px-3.5 py-1.5 rounded-xl text-sm text-blue-800 font-medium w-fit"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            {meetings.length === 0 
               ? <span>No meetings scheduled yet</span>
               : <span>Tracking <strong className="text-blue-600">{upcoming.length} upcoming</strong> and <strong className="text-gray-700">{past.length} past</strong> bookings.</span>
            }
          </motion.div>
        </div>
        
        {/* ANIMATED TOGGLE */}
        <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/60 shadow-inner w-full md:w-[240px] shrink-0 relative overflow-hidden">
          {['upcoming', 'past'].map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  "relative px-4 py-1.5 rounded-lg text-[13px] font-bold flex-1 transition-colors z-10 capitalize",
                  isActive ? "text-blue-600 focus:outline-none" : "text-gray-500 hover:text-gray-900 focus:outline-none"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm shadow-gray-300/50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-20">{t}</span>
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
           key={tab} 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="space-y-5"
        >
          {displayList.length === 0 ? (
            
            /* PREMIUM EMPTY STATE */
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
               className="text-center py-16 px-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center max-w-2xl mx-auto mt-6"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-5 shadow-inner border border-blue-100">
                 <CalendarClock className="w-7 h-7" />
              </div>
              <h2 className="text-gray-900 font-extrabold text-xl mb-2 tracking-tight">No {tab} meetings yet</h2>
              <p className="text-gray-500 font-medium mb-8 max-w-sm text-base">
                {tab === "upcoming" 
                  ? "Once someone books time with you, it will appear here. Share your links to get started." 
                  : "You don't have any completed meetings yet."}
              </p>
              
              <Link href="/dashboard">
                <motion.button 
                   whileHover={{ scale: 1.05 }} 
                   whileTap={{ scale: 0.95 }}
                   className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
                >
                   <PlusCircle className="w-5 h-5"/>
                   Create a schedule
                </motion.button>
              </Link>
            </motion.div>

          ) : (
           <AnimatePresence>
            {displayList.map((mtg) => {
              const start = parseISO(mtg.start_time);
              const end = parseISO(mtg.end_time);
              const isCancelling = cancellingId === mtg.id;

              return (
                <motion.div
                  layout
                  key={mtg.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col md:flex-row relative"
                >
                  <div className="w-full h-1 md:w-1.5 md:h-auto bg-blue-600 shrink-0"></div>
                 
                  <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row gap-6 md:items-center">
                    <div className="flex-1 flex flex-col gap-4">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors shadow-sm shrink-0">
                             <Calendar className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                             <h3 className="font-extrabold text-gray-900 text-[17px] leading-tight group-hover:text-blue-600 transition-colors">{mtg.event_name}</h3>
                             <div className="flex items-center gap-2 text-blue-600 text-[11px] font-extrabold uppercase tracking-widest bg-blue-50/50 w-fit px-2 py-0.5 rounded-md">
                                {format(start, 'EEEE, MMMM do')}
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-1">
                          {mtg.meeting_mode === 'offline' ? (
                            <div className="flex flex-col">
                               <div className="flex items-center gap-2 text-gray-900 font-bold text-[13px]">
                                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                  <span>In-person</span>
                               </div>
                               <span className="text-gray-500 text-[12px] font-medium ml-5.5">{mtg.location || 'Pending location...'}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                               <div className="flex items-center gap-2 text-gray-900 font-bold text-[13px]">
                                  <Video className="w-3.5 h-3.5 text-blue-500" />
                                  <span className="uppercase">{formatPlatform(mtg.platform)}</span>
                               </div>
                               {tab === 'upcoming' && mtg.meeting_link && (
                                 <div className="ml-5.5 mt-2">
                                    <a
                                       href={mtg.meeting_link}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 hover:border-blue-600 px-3 py-1.5 rounded-lg transition-all shadow-sm group/btn"
                                    >
                                       Join Session <ExternalLink className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                    </a>
                                 </div>
                               )}
                            </div>
                          )}

                          <div className="flex flex-col md:border-l md:border-gray-100 md:pl-6">
                             <div className="flex items-center gap-2 text-gray-900 font-bold text-[13px]">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</span>
                             </div>
                             <span className="text-gray-400 text-[11px] uppercase tracking-wider ml-5.5">{mtg.duration} mins</span>
                          </div>

                          <div className="flex flex-col md:border-l md:border-gray-100 md:pl-6">
                             <div className="flex items-center gap-2 text-gray-900 font-bold text-[13px]">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span>{mtg.invoke_name}</span>
                             </div>
                             <span className="text-gray-400 text-[11px] ml-5.5">{mtg.email}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                  {/* ACTION COLUMN - Consistent across tabs */}
                  <div className="border-t border-gray-100 md:border-t-0 md:border-l border-gray-100 bg-gray-50/30 w-full md:w-36 flex items-center justify-center p-5 md:p-0 shrink-0">
                    {tab === "upcoming" ? (
                       <div className="flex flex-col gap-3 items-center">
                         <Link href={`/book/${mtg.slug}?rescheduleId=${mtg.id}&role=user`}>
                           <motion.button
                             whileHover={{ scale: 1.03, backgroundColor: '#f0f7ff', color: '#2563eb', borderColor: '#bfdbfe' }}
                             whileTap={{ scale: 0.97 }}
                             className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-blue-600 border border-blue-100 bg-white px-4 py-2.5 rounded-lg transition-all flex-row md:flex-col md:gap-1.5 md:w-24 group/resched shadow-sm"
                           >
                             <CalendarClock className="w-4 h-4 group-hover/resched:scale-110 transition-transform" />
                             Reschedule
                           </motion.button>
                         </Link>
                         
                         <motion.button
                           whileHover={!isCancelling ? { scale: 1.03, backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fecaca' } : {}}
                           whileTap={!isCancelling ? { scale: 0.97 } : {}}
                           onClick={() => handleCancel(mtg.id)}
                           disabled={isCancelling}
                           className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-gray-400 border border-gray-200 bg-white px-4 py-2.5 rounded-lg transition-all flex-row md:flex-col md:gap-1.5 md:w-24 group/cancel shadow-sm"
                         >
                           {isCancelling ? (
                             <Loader2 className="w-3.5 h-3.5 animate-spin" />
                           ) : (
                             <XCircle className="w-4 h-4 group-hover/cancel:rotate-90 transition-transform duration-300" />
                           )}
                           Cancel
                         </motion.button>
                       </div>
                    ) : (
                       <div className="flex flex-col items-center gap-1 opacity-60">
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                           <CheckCircle className="w-4 h-4" />
                         </div>
                         <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Completed</span>
                       </div>
                    )}
                  </div>

                </motion.div>
              );
            })}
           </AnimatePresence>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
