import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MapPin, ChevronLeft } from 'lucide-react';
import { Parish } from '../types';

interface Props {
  parish: Parish;
  manualOverride: (id: string) => void;
}

export const VelvetRopeWaitlist: React.FC<Props> = ({ parish, manualOverride }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Authentic 0 state
  const current = 0;
  const goal = 500; 

  const handleSignup = () => {
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

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
         <div className="flex items-center space-x-2">
            <div className="bg-emerald-600 rounded-lg p-1.5">
                <MapPin className="text-white" size={20} />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">Shelf Scout</span>
         </div>
         <button 
            onClick={() => manualOverride('jm-01')} // Go to Kingston (Active)
            className="text-sm font-medium text-slate-500 hover:text-emerald-600 flex items-center"
         >
            <ChevronLeft size={16} className="mr-1" /> Scout Elsewhere
         </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-lg mx-auto w-full p-6 pt-12">
        <div className="w-full text-center space-y-4 mb-10">
            <div className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                New Territory
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Be the first in<br />
                <span className="text-emerald-600">{parish.name}</span>
            </h1>
            <p className="text-lg text-slate-500">
                We are launching in your parish. Join the waiting list to help us map the best prices near you.
            </p>
        </div>

        {/* Progress Section */}
        <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 shadow-sm">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <span className="text-3xl font-bold text-slate-900">{current}</span>
                    <span className="text-slate-500 text-sm ml-2">scouts joined</span>
                </div>
                <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-full">
                    Founder Phase
                </span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[1%]"></div>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
                We need {goal} local scouts to officially launch price tracking here.
            </p>
        </div>

        {/* Signup Form */}
        {!submitted ? (
            <div className="w-full space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Brown"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                </div>
                
                {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

                <button 
                    onClick={handleSignup}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-lg mt-2"
                >
                    Become a Founding Scout <ArrowRight className="ml-2" size={20} />
                </button>
            </div>
        ) : (
            <div className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-emerald-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-emerald-900 mb-2">Welcome, {name}!</h3>
                <p className="text-emerald-700 mb-6">
                    Thanks for starting the movement in {parish.name}. We'll notify you when we launch.
                </p>
                <button 
                    onClick={() => {
                        setSubmitted(false);
                        setEmail('');
                        setName('');
                    }}
                    className="text-emerald-800 font-semibold underline"
                >
                    Add another email
                </button>
            </div>
        )}

        <div className="mt-auto py-8">
            <p className="text-center text-slate-400 text-sm">
                Already have an account? <span className="text-emerald-600 font-semibold cursor-pointer">Log In</span>
            </p>
        </div>
      </div>
    </div>
  );
};