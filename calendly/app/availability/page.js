"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Copy, Trash2, CalendarClock, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/Toast";
import clsx from "clsx";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMEZONES = ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Kolkata", "Asia/Tokyo"];

export default function Availability() {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalTimezone, setGlobalTimezone] = useState("UTC");
  const { addToast } = useToast();

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const data = await api.getAvailability();
      setAvailability(data);
      if (data.length > 0 && data[0].timezone) setGlobalTimezone(data[0].timezone);
    } catch (err) {
      addToast("Failed to fetch availability", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = async (dayIndex) => {
    const existing = availability.find((a) => a.day_of_week === dayIndex);
    if (existing) {
      await api.deleteAvailability(dayIndex);
      setAvailability(availability.filter((a) => a.day_of_week !== dayIndex));
    } else {
      const newAvail = await api.updateAvailability({
        day_of_week: dayIndex,
        start_time: "09:00:00",
        end_time: "17:00:00",
        timezone: globalTimezone,
      });
      setAvailability([...availability, newAvail].sort((a, b) => a.day_of_week - b.day_of_week));
    }
  };

  const handleTimeChange = async (dayIndex, field, value) => {
    const updated = availability.map(a => 
      a.day_of_week === dayIndex ? { ...a, [field]: value } : a
    );
    setAvailability(updated);
    
    const current = updated.find(a => a.day_of_week === dayIndex);
    try {
      await api.updateAvailability({
        day_of_week: dayIndex,
        start_time: current.start_time,
        end_time: current.end_time,
        timezone: globalTimezone,
      });
    } catch {
      addToast("Failed to save time", "error");
    }
  };

  const copyToAll = async (dayIndex) => {
    const source = availability.find((a) => a.day_of_week === dayIndex);
    if (!source) return;
    
    const promises = availability.map((a) => {
      if (a.day_of_week !== dayIndex) {
        return api.updateAvailability({
          day_of_week: a.day_of_week,
          start_time: source.start_time,
          end_time: source.end_time,
          timezone: globalTimezone
        });
      }
      return Promise.resolve();
    });
    
    try {
      await Promise.all(promises);
      fetchAvailability();
      addToast("Times copied to all active days!");
    } catch {
      addToast("Failed to copy times", "error");
    }
  };

  if (loading) {
    return (
      <div className="container-compact pt-14 sm:pl-28 lg:pl-32 pb-20 flex flex-col gap-5 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="container-compact pt-14 sm:pl-28 lg:pl-32 pb-20">
      
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col">
        <motion.h1 
           whileHover={{ scale: 1.01, originX: 0, color: '#2563eb' }}
           transition={{ type: 'spring', stiffness: 400, damping: 10 }}
           className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 cursor-default w-fit mb-1.5"
        >
          Your Availability
        </motion.h1>
        <p className="text-gray-500 font-medium text-sm mb-2.5">Set when people can book time with you</p>
        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2.5 bg-blue-50/80 border border-blue-100/50 px-3.5 py-1.5 rounded-xl text-xs text-blue-800 font-medium w-fit"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          Accepting meetings on <strong className="text-blue-600">{availability.length} out of 7</strong> days.
        </motion.div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* SETTINGS BAR */}
        <div className="border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between bg-gray-50/50 gap-4">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-white text-blue-600 rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                <CalendarClock className="w-4 h-4"/>
             </div>
             <div>
                <h2 className="text-sm font-bold text-gray-900">Default Working Hours</h2>
                <p className="text-[12px] font-medium text-gray-500">Applied automatically to new events.</p>
             </div>
          </div>
          
          <div className="flex bg-white items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:border-blue-300 transition">
            <Globe className="w-3.5 h-3.5 text-gray-400"/>
            <span className="text-[12px] font-bold text-gray-700">Timezone</span>
            <select 
              value={globalTimezone}
              onChange={(e) => {
                 setGlobalTimezone(e.target.value);
                 addToast("Timezone changed successfully");
              }}
              className="text-xs font-bold bg-transparent text-blue-700 border-none outline-none focus:ring-0 cursor-pointer"
            >
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>

        {/* AVAILABILITY ROWS */}
        <div className="px-6 py-2 divide-y divide-gray-100/80 bg-white">
          {DAYS.map((day, index) => {
            const avail = availability.find((a) => a.day_of_week === index);
            const isActive = !!avail;

            return (
              <div key={day} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group/row">
                <label className="flex items-center gap-4 cursor-pointer min-w-[140px] select-none">
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isActive}
                      onChange={() => handleDayToggle(index)}
                    />
                    <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                  <span className={`text-sm font-bold transition-colors ${isActive ? "text-gray-900" : "text-gray-400"}`}>{day}</span>
                </label>

                <div className="flex-1">
                  {isActive ? (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap items-center gap-4 md:gap-5">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={avail.start_time}
                          onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                          className="w-[100px] px-3 py-1.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg font-bold text-[13px] outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition shadow-inner"
                        />
                        <span className="text-gray-300 font-bold">-</span>
                        <input
                          type="time"
                          value={avail.end_time}
                          onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                          className="w-[100px] px-3 py-1.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg font-bold text-[13px] outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition shadow-inner"
                        />
                      </div>
                      
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => copyToAll(index)}
                          className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 text-[11px] uppercase font-extrabold px-2.5 py-1.5 rounded-lg border border-transparent transition"
                        >
                          <Copy className="w-3.5 h-3.5"/>
                          <span>Duplicate</span>
                        </button>
                        <button 
                          onClick={() => handleDayToggle(index)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-[13px] font-bold text-gray-400 italic py-1.5">Unavailable</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
