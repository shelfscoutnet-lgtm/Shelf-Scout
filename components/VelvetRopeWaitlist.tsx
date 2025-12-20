import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MapPin, ChevronLeft, Phone, Mail, User, ArrowLeft, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Parish } from '../types';
import { useSignups } from '../hooks/useSignups';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

interface Props {
  parish: Parish;
}

export const VelvetRopeWaitlist: React.FC<Props> = ({ parish }) => {
  const { submitSignup, loading, signupCount } = useSignups();
  const { resetParish } = useShop();
  const { isDarkMode } = useTheme();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [successBtn, setSuccessBtn] = useState(false);

  // Gamification Logic
  const goalTarget = 300;
  const progressPercent = Math.min((signupCount / goalTarget) * 100, 100);

  const handleSignup = async () => {
    setError('');
    
    if (!name.trim()) {
        setError('Please enter your name.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }

    const result = await submitSignup({
        name,
        email,
        phone,
        parish_id: parish.id
    });

    if (result.success) {
        setSuccessBtn(true);
        
        // Trigger Center Burst Celebration
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Delay switching to success card to show the "Welcome" button state briefly
        setTimeout(() => setSubmitted(true), 1500);
    } else {
        setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-6 min-h-[80vh] ${isDarkMode ? 'bg-teal-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Back Button */}
        <div className="w-full max-w-md mb-6">
            <button 
                onClick={resetParish}
                className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}
            >
                <ArrowLeft size={16} className="mr-1" /> Change Parish
            </button>
        </div>

        <div className="w-full max-w-md text-center space-y-4 mb-8">
            <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 ${isDarkMode ? 'bg-teal-800 text-teal-300' : 'bg-emerald-100 text-emerald-800'}`}>
                Coming Soon
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
                Shelf Scout in <br />
                <span className="text-emerald-500">{parish.name}</span>
            </h1>
            <p className={`${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>
                We haven't launched full price tracking here yet. Join the waitlist to get early access!
            </p>
        </div>

        {/* Gamification / Goal Widget */}
        <div className={`w-full max-w-md rounded-xl p-4 border relative overflow-hidden mb-6 ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-slate-900 border-slate-800'}`}>
             <div className="flex justify-between items-end mb-2 relative z-10">
                 <div>
                     <h3 className="text-white font-bold text-sm flex items-center">
                         <Zap size={14} className="text-yellow-400 mr-1" fill="currentColor" />
                         Unlock {parish.name}
                     </h3>
                     <p className="text-slate-400 text-xs mt-0.5">Help us reach {goalTarget} local scouts!</p>
                 </div>
                 <div className="text-right">
                     <div className="text-2xl font-bold text-white leading-none">{signupCount}</div>
                     <div className="text-[10px] text-slate-400 uppercase font-bold">Joined</div>
                 </div>
             </div>
             
             {/* Progress Bar */}
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative z-10">
                 <div 
                    className="bg-gradient-to-r from-emerald-500 to-yellow-400 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${progressPercent}%` }}
                 ></div>
             </div>
             
             <div className="mt-3 relative z-10">
                 <div className="flex items-center justify-between">
                     <span className="text-[10px] text-emerald-400 font-bold">
                         {progressPercent.toFixed(0)}% Complete
                     </span>
                     <span className="text-[10px] text-slate-400">Launch Pending</span>
                 </div>
             </div>

             {/* Background Decor */}
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
        </div>

        {/* Signup Form */}
        {!submitted ? (
            <div className={`w-full max-w-md p-6 rounded-2xl shadow-sm border space-y-4 ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-100'}`}>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-teal-950 border-teal-800 text-white' : 'border-slate-200'}`}
                    />
                </div>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-teal-950 border-teal-800 text-white' : 'border-slate-200'}`}
                    />
                </div>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone (Optional)"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-teal-950 border-teal-800 text-white' : 'border-slate-200'}`}
                    />
                </div>
                
                {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

                <button 
                    onClick={handleSignup}
                    disabled={loading || successBtn}
                    className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center disabled:opacity-70 ${
                        successBtn 
                        ? 'bg-emerald-500 text-white scale-105'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                >
                    {successBtn ? 'Welcome aboard! 🎉' : (loading ? 'Joining...' : 'Notify Me on Launch')}
                </button>
            </div>
        ) : (
            <div className={`w-full max-w-md border rounded-2xl p-6 text-center animate-fade-in-up ${isDarkMode ? 'bg-emerald-900/30 border-emerald-800' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-emerald-600" size={32} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>Thanks, {name}!</h3>
                <p className={`${isDarkMode ? 'text-teal-300' : 'text-emerald-700'}`}>
                    We'll email you as soon as Shelf Scout goes live in {parish.name}.
                </p>
            </div>
        )}
    </div>
  );
};