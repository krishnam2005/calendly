"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Link as LinkIcon, CheckCircle2, Layout, Clock, Calendar, Check, Terminal, Mail } from "lucide-react";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScrollEvent = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScrollEvent);
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, []);
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      {/* GLOBAL BACKGROUND DEPTH */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute top-[-15%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-300 blur-[150px] opacity-20 mix-blend-multiply"></div>
         <div className="absolute top-[10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-cyan-200 blur-[160px] opacity-20 mix-blend-multiply"></div>
         <div className="absolute top-[40%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-200 blur-[150px] opacity-15 mix-blend-multiply"></div>
      </div>

      {/* NAVBAR */}
      <header 
         className={`fixed top-0 left-0 w-full px-6 lg:px-12 xl:px-16 flex items-center justify-between z-50 transition-all duration-300 ease-in-out ${
           scrolled 
             ? "bg-white/90 backdrop-blur-[10px] py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-gray-200/50" 
             : "bg-transparent py-5 border-b border-transparent shadow-none"
         }`}
      >
         <Logo className="scale-110 origin-left" />
         <nav className="flex items-center gap-10">
           <button onClick={(e) => handleScroll(e, 'how-it-works')} className="hidden md:block text-gray-500 hover:text-gray-900 font-bold text-[14px] transition-colors relative group tracking-wide focus:outline-none">
             How it works
             <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-gray-900 transition-all group-hover:w-full"></span>
           </button>
           <button onClick={(e) => handleScroll(e, 'features')} className="hidden md:block text-gray-500 hover:text-gray-900 font-bold text-[14px] transition-colors relative group tracking-wide focus:outline-none">
             Features
             <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-gray-900 transition-all group-hover:w-full"></span>
           </button>
           
           {/* Secondary Navbar CTA (Lighter Hierarchy) */}
           <Link href="/dashboard">
             <motion.button 
               whileHover={{ scale: 1.05 }} 
               whileTap={{ scale: 0.95 }}
               transition={{ duration: 0.2, ease: "easeInOut" }}
               className="group flex items-center gap-2 px-6 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 font-bold rounded-full hover:bg-gray-100 hover:border-gray-300 transition shadow-sm text-[14px]"
             >
               Start Scheduling <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
             </motion.button>
           </Link>
         </nav>
      </header>

      {/* HERO SECTION - FULL WIDTH SPAN */}
      <main className="w-full max-w-[1240px] mx-auto pt-28 pb-20 px-6 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center min-h-[80vh]">
        
        {/* HERO LEFT: COPY */}
        <motion.div 
           initial="hidden" animate="show" variants={staggerContainer}
           className="flex flex-col items-start text-left z-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
             </span>
             Schedulr is Live
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Schedule meetings without the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">back-and-forth.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg lg:text-xl text-gray-500 font-medium mb-10 max-w-xl leading-relaxed">
            Create your availability, share your link, and let people book time with you instantly.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-start gap-4 w-full sm:w-auto">
             <Link href="/dashboard" className="w-full sm:w-auto">
               <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 30px 40px -10px rgb(37 99 235 / 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="group flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-full font-extrabold text-[1.1rem] hover:bg-blue-700 transition w-full sm:w-auto shadow-2xl shadow-blue-500/30"
               >
                 <span>Start Scheduling &rarr;</span>
               </motion.button>
             </Link>
             <p className="text-sm font-semibold text-gray-400 pl-4 mt-2">
               No sign-up required &bull; Start in seconds
             </p>
          </motion.div>
        </motion.div>

        {/* HERO RIGHT: ENHANCED INTERACTIVE UI */}
        <div className="relative w-full h-[600px] hidden lg:flex items-center justify-center z-10">
           
           {/* Deep Core Radial Glow behind the mock UI */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-blue-400 blur-[120px] rounded-full opacity-30 mix-blend-multiply pointer-events-none"></div>

           {/* Abstract Base Calendar Card */}
           <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative w-[460px] h-[480px] bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex flex-col z-10"
           >
              <div className="w-full h-20 bg-gray-50/50 flex items-center px-8 border-b border-gray-100">
                 <div className="w-3.5 h-3.5 rounded-full bg-red-400 mr-2"></div>
                 <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 mr-2"></div>
                 <div className="w-3.5 h-3.5 rounded-full bg-green-400 mr-6"></div>
                 <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="p-8 grid grid-cols-4 gap-4 flex-1 bg-white">
                 {[...Array(16)].map((_, i) => (
                    <div key={i} className={`rounded-2xl border transition-colors ${i===6 || i===10 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}></div>
                 ))}
              </div>
           </motion.div>

           {/* Floating Time Slot Badge */}
           <motion.div 
              animate={{ y: [0, 25, 0] }} 
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1 }}
              className="absolute top-20 -left-16 px-6 py-4 bg-white/90 border border-gray-100 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md z-20"
           >
              <Clock className="w-6 h-6 text-blue-500" />
              <span className="font-extrabold text-gray-800 text-[1.1rem] tracking-tight">10:00 AM</span>
           </motion.div>

           {/* Floating Booking Confirmed Toast */}
           <motion.div 
              animate={{ y: [0, -25, 0] }} 
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-20 -right-12 w-72 bg-gray-900 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-6 border border-gray-800 z-20"
           >
              <div className="flex items-center gap-4 mb-5">
                 <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shadow-inner">
                    <Check className="w-6 h-6" />
                 </div>
                 <span className="text-white font-bold text-lg">New Booking</span>
              </div>
              <div className="w-full h-2.5 bg-gray-800 rounded-full mb-3"></div>
              <div className="w-2/3 h-2.5 bg-gray-800 rounded-full"></div>
           </motion.div>
        </div>
      </main>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="w-full bg-gray-50/50 pt-20 pb-16 px-6 lg:px-12 relative border-y border-gray-100">
        <div className="max-w-[1240px] mx-auto text-center mb-16">
           <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">How it works</h2>
              <p className="text-lg text-gray-500 font-medium mt-4 max-w-xl mx-auto">Three simple steps to automate your scheduling completely.</p>
           </motion.div>
        </div>
          
          <motion.div 
             initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
             className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 max-w-[1240px] mx-auto"
          >
             <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                   <CalendarDays className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">1. Set your availability</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-base">Choose when you're available for meetings. Hook into precise working hours.</p>
             </div>
             <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                   <LinkIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">2. Share your link</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-base">Send your personal booking link to anyone. It works flawlessly on desktop and mobile.</p>
             </div>
             <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                   <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">3. Get booked instantly</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-base">People pick a time and you're all set. No endless email threads necessary.</p>
             </div>
          </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="w-full bg-white pt-20 pb-16 px-6 lg:px-12 relative">
         <div className="max-w-[1240px] mx-auto flex flex-col items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16">
               <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">Why Schedulr</h2>
            </motion.div>

            <motion.div 
               initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
               className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full max-w-6xl mb-24"
            >
              <FeatureCard 
                icon={<Clock className="w-8 h-8"/>}
                title="Easy Scheduling"
                desc="Set up meetings in seconds — no emails, no confusion."
              />
              <FeatureCard 
                icon={<Calendar className="w-8 h-8"/>}
                title="No Double Booking"
                desc="Your calendar stays strictly organized with real-time conflict prevention."
              />
              <FeatureCard 
                icon={<LinkIcon className="w-8 h-8"/>}
                title="Shareable Links"
                desc="Send one link and let others book time that works for both of you."
              />
              <FeatureCard 
                icon={<Layout className="w-8 h-8"/>}
                title="Smooth Booking Flow"
                desc="A clean, step-by-step experience that feels incredibly effortless."
              />
            </motion.div>

            <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.6}} className="flex justify-center w-full">
              <div className="py-8 px-12 bg-gray-50/80 border border-gray-200/60 rounded-[2rem] text-center shadow-sm max-w-4xl w-full mx-auto">
                <p className="text-2xl font-bold text-gray-900 tracking-tight leading-snug">
                  Built for fast, frictionless scheduling — so you can focus on what matters.
                </p>
              </div>
            </motion.div>
         </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="w-full bg-gray-900 py-24 px-6 lg:px-12 text-center relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600 blur-[150px] opacity-20 pointer-events-none rounded-full"></div>
         
         <motion.div initial="hidden" whileInView="show" variants={fadeUp} viewport={{once:true}} className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">Ready to simplify your scheduling?</h2>
            <p className="text-lg lg:text-xl text-gray-400 mb-10 font-medium max-w-xl mx-auto">No sign-up. No hassle. Just smarter scheduling.</p>
            <Link href="/dashboard">
              <motion.button 
                 whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)" }}
                 whileTap={{ scale: 0.95 }}
                 className="px-10 py-4 bg-blue-600 text-white rounded-full font-extrabold text-lg lg:text-xl hover:bg-blue-500 transition shadow-2xl"
              >
                 Start Scheduling Now &rarr;
              </motion.button>
            </Link>
         </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-gray-100 py-10 px-6 lg:px-12">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex flex-col items-center md:items-start gap-1.5">
             <Logo />
             <p className="text-gray-500 font-medium text-sm">Simple scheduling made easy.</p>
           </div>
           
           <div className="flex items-center gap-10">
             <a href="#" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors text-[15px]">
                <Terminal className="w-4 h-4"/> GitHub
             </a>
             <a href="#" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors text-[15px]">
                <Mail className="w-4 h-4"/> Contact
             </a>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
      }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white border border-gray-100/80 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] cursor-default flex flex-col text-left group transition-all"
    >
      <div className="w-14 h-14 bg-blue-50/80 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100/50 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl lg:text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors tracking-tight">{title}</h3>
      <p className="text-gray-500 text-base font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
}
