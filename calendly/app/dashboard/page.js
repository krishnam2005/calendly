"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Copy, Plus, Clock, Trash, Edit2, ChevronRight, PlayCircle, CalendarDays, Video, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [formData, setFormData] = useState({ name: "", duration: 30, slug: "", meeting_mode: "online", platform: "google_meet", location: "", custom_link: "" });
  const [submitError, setSubmitError] = useState("");
  const { addToast } = useToast();
  const formatPlatform = (p) => ({ google_meet: "Google Meet", zoom: "Zoom", teams: "Microsoft Teams", custom: "Custom Link" })[p] || "Google Meet";

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      addToast("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCopyLink = (e, slug) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    addToast("Link copied!");
  };

  const initiateDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const executeDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteId(null);
    try {
      await api.deleteEvent(id);
      addToast("Event type deleted successfully", "success");
      fetchEvents();
    } catch (err) {
      addToast(err.message || "Failed to delete event", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, formData);
        addToast("Event updated!");
      } else {
        await api.createEvent(formData);
        addToast("Event created successfully!");
      }
      setIsModalOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      setSubmitError(err.message || "Failed to save event type");
    }
  };

  const openEditModal = (e, event) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingEvent(event);
    setFormData({ 
      name: event.name, 
      duration: event.duration, 
      slug: event.slug,
      meeting_mode: event.meeting_mode || "online",
      platform: event.platform || "google_meet",
      location: event.location || "",
      custom_link: event.custom_link || ""
    });
    setSubmitError("");
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingEvent(null);
    setFormData({ name: "", duration: 30, slug: "", meeting_mode: "online", platform: "google_meet", location: "", custom_link: "" });
    setSubmitError("");
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container-compact pt-14 sm:pl-28 lg:pl-32 pb-20 flex flex-col gap-5 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-44 bg-gray-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="container-compact pt-14 sm:pl-28 lg:pl-32 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <motion.h1 
             whileHover={{ scale: 1.02, originX: 0, color: '#2563eb' }}
             transition={{ type: 'spring', stiffness: 400, damping: 10 }}
             className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 cursor-default w-fit"
          >
            Your Schedules
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2.5 bg-blue-50/80 border border-blue-100/50 px-3.5 py-1.5 rounded-xl text-sm text-blue-800 font-medium mt-3"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            You have <strong className="text-blue-600">{events.length}</strong> active meeting {events.length === 1 ? 'type' : 'types'} ready to share.
          </motion.div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openNewModal}
          className="flex items-center px-4 py-2 bg-blue-600 shadow-md shadow-blue-500/20 text-white rounded-full hover:bg-blue-700 transition-colors font-bold text-[13px]"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Create Session
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {events.map((evt) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -3 }}
              key={evt.id}
            >
              <div
                className="block bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative h-full flex flex-col"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-5 flex-1 flex flex-col relative z-20">
                  <div className="flex justify-between items-start mb-1.5">
                    <h2 className="text-[19px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors drop-shadow-sm leading-tight pr-10">{evt.name}</h2>
                    <div className="flex space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-md rounded-lg p-1 shadow-sm border border-gray-100 absolute top-4 right-4 z-30">
                      <button onClick={(e) => openEditModal(e, evt)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:text-blue-600 focus:bg-blue-50 rounded-md transition-colors outline-none cursor-pointer">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === evt.id ? (
                        <button 
                           onClick={(e) => executeDelete(e, evt.id)} 
                           onMouseLeave={() => setConfirmDeleteId(null)}
                           className="px-2.5 py-1 text-[11px] uppercase tracking-wider font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm animate-in fade-in zoom-in duration-200 cursor-pointer"
                        >
                           Confirm
                        </button>
                      ) : (
                        <button onClick={(e) => initiateDelete(e, evt.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 rounded-md transition-colors outline-none cursor-pointer">
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-500 font-medium text-[13px] mb-4">Discuss project details and alignment.</p>
                  
                  <div className="flex flex-col gap-2 mb-5">
                    <div className="text-gray-600 flex items-center gap-2 font-bold bg-blue-50/50 border border-blue-100/50 w-fit px-2.5 py-1 rounded-lg text-[13px] drop-shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {evt.duration} mins
                    </div>
                    
                    <div className="text-gray-500 flex items-center gap-2 font-medium px-0.5 text-[13px]">
                      {evt.meeting_mode === 'offline' ? (
                        <><MapPin className="w-3.5 h-3.5 text-gray-400" />{evt.location || 'In-person'}</>
                      ) : (
                        <><Video className="w-3.5 h-3.5 text-gray-400" />{formatPlatform(evt.platform)}</>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3.5 border-t border-gray-100 flex justify-between items-center text-[13px] font-semibold">
                    <Link 
                      href={`/book/${evt.slug}`} 
                      target="_blank"
                      className="text-blue-600 hover:text-blue-700 flex items-center transition-colors group/cta cursor-pointer"
                    >
                       Open booking page <ChevronRight className="w-3.5 h-3.5 ml-0.5 translate-x-0 group-hover/cta:translate-x-1 transition-transform duration-300" />
                    </Link>
                    <button 
                      onClick={(e) => handleCopyLink(e, evt.slug)}
                      className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy link
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {events.length === 0 && (
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} 
           animate={{ opacity: 1, scale: 1 }} 
           transition={{ type: "spring", stiffness: 300, damping: 25 }}
           className="text-center py-14 px-6 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto mt-6"
        >
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-5 shadow-inner border border-blue-100">
             <PlayCircle className="w-7 h-7" />
          </div>
          <h2 className="text-gray-900 font-extrabold text-xl mb-2 tracking-tight">No event types yet</h2>
          <p className="text-gray-500 font-medium mb-6 max-w-sm text-sm">Create your first event type to start allowing people to book time with you.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openNewModal} 
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition text-[13px]"
          >
            Create your first session
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
               onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="bg-white rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden relative z-10"
            >
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900">{editingEvent ? "Edit Event Type" : "New Event Type"}</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData(prev => ({ 
                          ...prev, 
                          name, 
                          slug: !editingEvent ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : prev.slug 
                        }));
                      }}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-gray-50/30 text-[13px] font-medium"
                      placeholder="e.g. 15 Min Discovery Call"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL Slug</label>
                    <div className="flex shadow-sm rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500">
                      <span className="inline-flex items-center px-3 bg-gray-100 text-gray-500 text-[12px] font-bold border-r border-gray-300">
                        /book/
                      </span>
                      <input
                        required
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        className="flex-1 block w-full px-3.5 py-2 focus:outline-none bg-gray-50/30 text-[13px] font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration (minutes)</label>
                    <select 
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
                    >
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={45}>45 mins</option>
                      <option value={60}>60 mins</option>
                    </select>
                  </div>
                  {/* Meeting Type Toggle */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meeting Type</label>
                    <div className="flex gap-2">
                      {['online', 'offline'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setFormData({...formData, meeting_mode: mode})}
                          className={`flex-1 py-2.5 rounded-xl border font-semibold text-sm capitalize transition-all ${
                            formData.meeting_mode === mode
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                              : 'bg-gray-50 text-gray-600 border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          {mode === 'online' ? '🎥 Online' : '📍 In-person'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.meeting_mode === 'online' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meeting Platform</label>
                      <select
                        value={formData.platform}
                        onChange={(e) => setFormData({...formData, platform: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
                      >
                        <option value="google_meet">Google Meet</option>
                        <option value="zoom">Zoom</option>
                        <option value="teams">Microsoft Teams</option>
                        <option value="custom">Custom Link</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meeting Location</label>
                      <input
                        required
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-gray-50/30 text-[13px] font-medium"
                        placeholder="e.g. Room 301, Block A"
                      />
                    </div>
                  )}
                  {formData.meeting_mode === 'online' && formData.platform === 'custom' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Custom URL</label>
                      <input
                        required
                        type="url"
                        value={formData.custom_link}
                        onChange={(e) => setFormData({...formData, custom_link: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
                        placeholder="https://example.com/meeting"
                      />
                    </motion.div>
                  )}
                </div>

                {submitError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    {submitError}
                  </motion.div>
                )}

                <div className="mt-6 flex justify-end gap-2.5 pt-5 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition text-[13px]">
                    Cancel
                  </button>
                  <motion.button whileTap={{ scale: 0.95 }} type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition text-[13px]">
                    Save Event
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
