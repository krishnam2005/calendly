"use client";

import { useEffect, useState, use, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { format, startOfDay, addMinutes, parseISO, isBefore, isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { Clock, Video, ChevronLeft, ChevronRight, CheckCircle2, Calendar as CalIcon, Globe, Info, MoveLeft, MapPin, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function BookingPage({ params }) {
  const unwrappedParams = use(params);
  const { slug } = unwrappedParams;
  const searchParams = useSearchParams();
  const rescheduleToken = searchParams.get("reschedule_token");
  const rescheduleId = searchParams.get("rescheduleId");
  const role = searchParams.get("role") || "user";
  
  const { addToast } = useToast();
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [bookingResponseToken, setBookingResponseToken] = useState(null);

  const [event, setEvent] = useState(null);
  const [availabilityRules, setAvailabilityRules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [meetingLink, setMeetingLink] = useState(null);
  const [bookingLocation, setBookingLocation] = useState(null);
  const [bookingMode, setBookingMode] = useState('online');

  const slotsRef = useRef(null);
  const formRef = useRef(null);

  const formatPlatform = (p) => ({ google_meet: "Google Meet", zoom: "Zoom", teams: "Microsoft Teams", custom: "Custom Link" })[p] || "Meeting";

  useEffect(() => {
    async function loadData() {
      try {
        const ev = await api.getEventBySlug(slug);
        setEvent(ev);
        const rules = await api.getAvailability();
        setAvailabilityRules(rules);
        const bx = await api.getBookings();
        setBookings(bx.filter(b => b.event_type_id === ev.id));
        
        // If rescheduling, fetch booking by token or ID and pre-fill
        if (rescheduleToken || rescheduleId) {
          try {
            let target;
            if (rescheduleToken) {
              target = await api.getBookingByToken(rescheduleToken);
            } else {
              target = await api.getBookingById(rescheduleId);
            }
            setForm({ name: target.invoke_name, email: target.email });
            setRescheduleBookingId(target.id);
          } catch (e) {
            console.error("Failed to fetch rescheduling booking", e);
            addToast("Reschedule link is invalid or expired.", "error");
          }
        }
      } catch (err) {
        setError("Event not found or failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, rescheduleToken]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    if (!isBefore(prev, startOfMonth(new Date()))) {
      setCurrentMonth(prev);
    } else {
      setCurrentMonth(startOfMonth(new Date()));
    }
  };

  const daysInMonth = eachDayOfInterval({ start: currentMonth, end: endOfMonth(currentMonth) });
  const startingDayIndex = getDay(currentMonth);
  const blankDays = Array.from({ length: startingDayIndex }).map((_, i) => i);

  useEffect(() => {
    if (!selectedDate || !event) return;

    const dayOfWeek = selectedDate.getDay();
    const rule = availabilityRules.find(r => r.day_of_week === dayOfWeek);

    if (!rule) {
      setGeneratedSlots([]);
      return;
    }

    const { duration } = event;
    const slots = [];

    const [startH, startM] = rule.start_time.split(':').map(Number);
    const [endH, endM] = rule.end_time.split(':').map(Number);

    let currentSlot = new Date(selectedDate);
    currentSlot.setHours(startH, startM, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(endH, endM, 0, 0);

    const now = new Date();

    while (currentSlot < endTime) {
      const slotEnd = addMinutes(currentSlot, duration);
      if (slotEnd <= endTime && currentSlot > now) {
        const isConflict = bookings.some(b => {
          // Skip the current booking if we're rescheduling it
          if (rescheduleBookingId && b.id === rescheduleBookingId) return false;
          
          const bStart = b.start_time instanceof Date ? b.start_time : parseISO(b.start_time);
          const bEnd = b.end_time instanceof Date ? b.end_time : parseISO(b.end_time);
          return (currentSlot < bEnd && slotEnd > bStart);
        });
        slots.push({ date: new Date(currentSlot), isBooked: isConflict });
      }
      currentSlot = addMinutes(currentSlot, duration);
    }
    setGeneratedSlots(slots);

    setTimeout(() => {
      slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [selectedDate, availabilityRules, bookings, event]);

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let resp;
      resp = await api.createBooking({
        event_type_id: event.id,
        name: form.name,
        email: form.email,
        start_time: selectedSlot.toISOString(),
        end_time: addMinutes(selectedSlot, event.duration).toISOString(),
        reschedule_id: rescheduleBookingId || undefined,
        role: (rescheduleBookingId) ? role : undefined
      });
      addToast(rescheduleBookingId ? "Meeting rescheduled successfully!" : "Meeting scheduled successfully!", "success");
      
      setMeetingLink(resp.meeting_link || null);
      setBookingLocation(resp.location || null);
      setBookingMode(resp.meeting_mode || 'online');
      setBookingResponseToken(resp.reschedule_token || null);
      setBooked(true);
    } catch (err) {
      addToast(err.message || "Failed to process booking.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const proceedToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  if (loading) return (
    <div className="h-screen bg-[#f8fafc] flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl h-[600px] flex overflow-hidden animate-pulse border border-gray-100">
        <div className="w-1/3 bg-gray-50/50 border-r border-gray-100 p-10"><div className="h-10 bg-gray-200 rounded-lg w-1/2 mb-6"></div><div className="h-4 bg-gray-200 rounded my-2"></div><div className="h-4 bg-gray-200 rounded my-2 w-3/4"></div></div>
        <div className="w-2/3 p-10"><div className="h-12 bg-gray-200 rounded-2xl w-full mb-8"></div><div className="grid grid-cols-2 gap-4"><div className="h-14 bg-gray-100 rounded-xl"></div><div className="h-14 bg-gray-100 rounded-xl"></div></div></div>
      </div>
    </div>
  );

  if (error || !event) return <div className="h-screen bg-[#f8fafc] flex items-center justify-center"><div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-red-100"><h3 className="text-xl font-bold">Error</h3><p>{error}</p></div></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 md:p-8 font-sans">

      {/* Return Link Button */}
      {/* <Link href="/dashboard" className="fixed top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold bg-white px-4 py-2 border border-gray-200 rounded-xl shadow-sm z-50 transition">
        <MoveLeft className="w-5 h-5"/> Back
      </Link> */}

      {/* SUCCESS MODAL Overlay replaced by conditional rendering */}
      <AnimatePresence mode="wait">
        {booked ? (
          <motion.div
            key="success-screen"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-100 max-w-lg w-full text-center relative z-10"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
              {rescheduleToken ? "Rescheduling complete!" : "Your meeting is scheduled!"}
            </h1>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto font-medium text-[15px]">
              {rescheduleToken ? `Your appointment has been moved to the new time. Confirmation sent to ${form.email}` : `A calendar invite has been sent to ${form.email}.`}
            </p>
            <div className="bg-gray-50 rounded-xl p-5 text-left border border-gray-100 mb-8 shadow-inner">
              <h3 className="font-bold text-gray-900 text-base mb-3">{event.name}</h3>
              <div className="space-y-4 text-gray-600 font-medium text-sm">
                <div className="flex items-center gap-3"><CalIcon className="w-5 h-5 text-gray-400" /><span>{format(selectedSlot, "EEEE, MMMM do, yyyy")}</span></div>
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-gray-400" /><span>{format(selectedSlot, "h:mm a")} - {format(addMinutes(selectedSlot, event.duration), "h:mm a")}</span></div>
                
                {bookingMode === 'online' && meetingLink ? (
                   <div className="flex items-start gap-3 mt-4 pt-4 border-t border-gray-200/60">
                      <Video className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                      <div className="flex flex-col gap-2 w-full">
                        <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">{formatPlatform(event.platform || 'google_meet')}</span>
                        <a
                           href={meetingLink}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95"
                        >
                           Join meeting
                           <ExternalLink className="w-4 h-4 opacity-80" />
                        </a>
                        <div className="text-xs text-gray-400 break-all select-all font-mono bg-gray-50 border border-gray-200 p-2 rounded-lg">{meetingLink}</div>
                      </div>
                   </div>
                ) : bookingMode === 'offline' && bookingLocation ? (
                   <div className="flex items-start gap-3 mt-4 pt-4 border-t border-gray-200/60">
                      <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Meeting Location</span>
                        <span className="text-gray-900 font-bold text-sm">{bookingLocation}</span>
                      </div>
                   </div>
                ) : null}
              </div>
            </div>
            {(bookingResponseToken || rescheduleToken) && (
              <div className="mb-4 text-sm text-gray-500 font-medium bg-gray-50 border border-gray-100 rounded-xl p-3">
                Need to change the time later?{' '}
                <Link href={`/book/${slug}?reschedule_token=${bookingResponseToken || rescheduleToken}`} className="text-blue-600 font-bold hover:underline">
                  Reschedule this meeting
                </Link>
              </div>
            )}
            <button 
              onClick={() => {
                setBooked(false);
                setForm({ name: "", email: "" });
                setSelectedSlot(null);
                setShowForm(false);
              }} 
              className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition w-full shadow-md"
            >
              Book another time
            </button>
          </motion.div>
        ) : (
          <motion.div
             key="booking-ui"
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0.95, opacity: 0 }}
             transition={{ duration: 0.3, ease: "easeInOut" }}
             className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 w-full max-w-4xl flex flex-col md:flex-row overflow-hidden min-h-[500px] relative mt-10 md:mt-0"
          >

        {/* LEFT COLUMN: EVENT DETAILS */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 p-6 md:p-8 shrink-0 bg-white z-10 flex flex-col">
          <div className="mb-6 scale-75 transform origin-left">
            <Logo />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-5 tracking-tight">{event.name}</h1>
          <div className="space-y-5 text-gray-600 font-medium">
            <div className="flex items-center gap-4"><Clock className="w-5 h-5 text-gray-400 shrink-0" /><span>{event.duration} min</span></div>
            <div className="flex items-start gap-4"><Video className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" /><span className="leading-snug">{event.meeting_mode === 'offline' ? (event.location || 'In-person meeting') : 'Online meeting details provided on booking.'}</span></div>
            <AnimatePresence>
              {selectedSlot && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-4 text-blue-600 font-bold bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-4 overflow-hidden">
                  <CalIcon className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    {format(selectedSlot, "h:mm a")} - {format(addMinutes(selectedSlot, event.duration), "h:mm a")}<br />
                    <span className="text-blue-500 font-medium text-sm block mt-1">{format(selectedSlot, "EEEE, MMMM d, yyyy")}</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE UI */}
        <div className="w-full md:w-2/3 bg-white relative overflow-hidden flex flex-col pt-8 px-0">
          <div className="flex-1 w-full h-full relative px-6 md:px-8 pb-8 overflow-y-auto custom-scrollbar">
            <AnimatePresence initial={false} mode="wait">

              {/* SLIDE OUT: CALENDAR & SLOTS */}
              {!showForm ? (
                <motion.div
                  key="calendar-view"
                  exit={{ x: "-50%", opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full flex flex-col xl:flex-row gap-6 items-start justify-center"
                >
                  <div className="w-full max-w-[360px] shrink-0">
                    <h2 className="text-xl font-extrabold mb-6 text-gray-900 tracking-tight text-center md:text-left">
                      {rescheduleToken ? "Select a New Slot" : "Select a Date & Time"}
                    </h2>

                    {/* Clean Grid Calendar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-center md:justify-between mb-5">
                        <span className="font-bold text-gray-900 text-base flex-1 text-center md:text-left">{format(currentMonth, "MMMM yyyy")}</span>
                        <div className="flex gap-1.5">
                          <button onClick={prevMonth} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition text-blue-600"><ChevronLeft className="w-4 h-4" /></button>
                          <button onClick={nextMonth} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition text-blue-600"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
                          <div key={d} className="text-[10px] font-extrabold text-gray-500 tracking-wider py-1">{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 md:gap-1.5 text-center">
                        {blankDays.map(b => (
                          <div key={`blank-${b}`} className="h-9"></div>
                        ))}
                        {daysInMonth.map((day) => {
                          const isPast = isBefore(day, startOfDay(new Date()));
                          const isSelected = selectedDate && isSameDay(day, selectedDate);
                          const hasAvailability = availabilityRules.some(r => r.day_of_week === day.getDay());
                          const isAvail = !isPast && hasAvailability;

                          return (
                            <motion.button
                              key={day.toISOString()}
                              whileHover={isAvail && !isSelected ? { scale: 1.1 } : {}}
                              whileTap={isAvail ? { scale: 0.95 } : {}}
                              disabled={!isAvail}
                              onClick={() => { setSelectedDate(day); setSelectedSlot(null); }}
                              className={clsx(
                                "w-full h-10 md:h-12 flex items-center justify-center rounded-full text-[15px] font-bold transition duration-200 mx-auto",
                                !isAvail && "text-gray-300 cursor-not-allowed",
                                isAvail && !isSelected && "text-blue-600 bg-blue-50/50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300",
                                isSelected && "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                              )}
                            >
                              {format(day, "d")}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mb-8 font-medium">
                      <Globe className="w-4 h-4" /> Timezone: {availabilityRules[0]?.timezone || 'UTC'}
                    </div>
                  </div>

                  {/* Time Slots Vertical Grid */}
                  <div className="w-full flex-1">
                    <div ref={slotsRef} className="scroll-mt-10"></div>
                    <AnimatePresence mode="popLayout">
                      {selectedDate && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, scale: 0.95 }} className="w-full">
                          <div className="font-bold text-gray-900 mb-4 pb-2 text-center border-b border-gray-100">
                            {format(selectedDate, "EEEE, MMMM d")}
                          </div>

                          <div className="flex flex-col gap-3 py-2 px-1 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                            {generatedSlots.length === 0 ? (
                              <div className="text-gray-500 text-sm font-medium text-center italic py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">No time slots available.</div>
                            ) : (
                              generatedSlots.map((slotObj, idx) => {
                                const { date: slot, isBooked } = slotObj;
                                const isPicked = selectedSlot && slot.getTime() === selectedSlot.getTime();

                                return (
                                  <div key={slot.toISOString()} className="flex flex-col gap-3">
                                    <motion.div layout className="flex gap-2 relative group w-full justify-center">

                                      {/* Smart Preview Tooltip */}
                                      {!isBooked && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap shadow-lg z-20">
                                          <Info className="w-3 h-3 text-blue-300" />
                                          {event.duration} min meeting from {format(slot, "h:mm")} – {format(addMinutes(slot, event.duration), "h:mm a")}
                                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                      )}

                                      <motion.button
                                        whileHover={!isPicked && !isBooked ? { scale: 1.02, y: -1 } : {}}
                                        whileTap={!isBooked ? { scale: 0.98 } : {}}
                                        disabled={isBooked}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={clsx(
                                          "py-3.5 px-4 rounded-xl border font-bold text-[15px] transition-all flex items-center justify-center max-w-[200px] w-full",
                                          isBooked
                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through decoration-gray-300"
                                            : isPicked
                                              ? "bg-gray-800 text-white border-gray-800 shadow-md"
                                              : "bg-white text-blue-600 border-blue-200 hover:border-blue-600 hover:shadow-sm"
                                        )}
                                      >
                                        {format(slot, "h:mm a")}
                                      </motion.button>

                                      <AnimatePresence>
                                        {isPicked && !isBooked && (
                                          <motion.button
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: "auto", opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            onClick={proceedToForm}
                                            className="px-6 bg-blue-600 text-white font-bold rounded-xl whitespace-nowrap shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
                                          >
                                            Next
                                          </motion.button>
                                        )}
                                      </AnimatePresence>
                                    </motion.div>

                                    {/* Lightweight Buffer Divider */}
                                    {idx < generatedSlots.length - 1 && (
                                      <div className="flex items-center justify-center py-1 opacity-40">
                                        <div className="w-1 h-1 bg-gray-300 rounded-full mx-1"></div>
                                        <div className="w-1 h-1 bg-gray-300 rounded-full mx-1"></div>
                                        <div className="w-1 h-1 bg-gray-300 rounded-full mx-1"></div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                /* SLIDE IN: BOOKING FORM */
                <motion.div
                  key="booking-form"
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="w-full flex-col justify-center max-w-md mx-auto relative z-10 bg-white"
                >
                  <div ref={formRef} className="scroll-mt-10"></div>
                  <button onClick={() => setShowForm(false)} className="w-10 h-10 mb-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-extrabold mb-8 text-gray-900 tracking-tight">Enter Details</h2>

                  <form onSubmit={handleBook} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                      <input required type="text" disabled={submitting} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 font-medium transition shadow-sm" placeholder="e.g. Jane Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                      <input required type="email" disabled={submitting} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 font-medium transition shadow-sm" placeholder="e.g. jane@example.com" />
                    </div>
                    <div className="pt-6">
                      <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={submitting} className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition disabled:opacity-50 flex items-center justify-center gap-3 text-lg">
                        {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (rescheduleToken ? "Confirm Reschedule" : "Schedule Event")}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
