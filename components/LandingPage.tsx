import React from 'react';
import { PLANS } from '../constants';

type Props = {
  onNavigate: (view: 'PRICING' | 'AUTH_LOGIN' | 'AUTH_REGISTER') => void;
};

const LandingPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-10 w-80 h-80 bg-pakGreen-600/20 rounded-full blur-3xl" />
        <div className="absolute top-24 -right-16 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pakGreen-500 to-emerald-700 flex items-center justify-center font-bold">
              CP
            </div>
            <div className="font-bold tracking-tight text-lg">CSS Daily Prep</div>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={() => onNavigate('AUTH_LOGIN')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-semibold"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('AUTH_REGISTER')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-pakGreen-600 hover:bg-pakGreen-700 transition text-sm font-semibold"
            >
              Create account
            </button>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-serif leading-[1.05]">
              CSS prep, daily.
              <span className="block text-pakGreen-300">Smart research, notes, and practice.</span>
            </h1>
            <p className="mt-5 text-gray-300 text-base md:text-lg leading-relaxed max-w-xl">
              Daily current-affairs feed, research lab, mock exams, resources, notes, and streaks — plus AI tools in Premium.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <button
                onClick={() => onNavigate('PRICING')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-pakGreen-600 hover:bg-pakGreen-700 transition font-bold"
              >
                View pricing
              </button>
              <button
                onClick={() => onNavigate('AUTH_REGISTER')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 transition font-bold"
              >
                Start free (Basic)
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-gray-300 font-semibold">Basic</div>
                <div className="text-2xl font-extrabold mt-1">PKR {PLANS.find(p => p.id === 'basic')?.pricePkr}</div>
                <div className="text-xs text-gray-400 mt-2">No AI tools, no image search</div>
              </div>
              <div className="rounded-2xl border border-pakGreen-500/30 bg-pakGreen-500/10 p-5">
                <div className="text-sm text-pakGreen-200 font-semibold">Premium</div>
                <div className="text-2xl font-extrabold mt-1">PKR {PLANS.find(p => p.id === 'premium')?.pricePkr}</div>
                <div className="text-xs text-pakGreen-100/80 mt-2">Full access (AI tools + image research)</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-gray-300 font-semibold">What you get</div>
            <ul className="mt-4 space-y-3 text-gray-200">
              <li className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-pakGreen-400 mt-2" />
                <span>Daily feed + subject-wise content for CSS/PMS/FPSC/PPSC</span>
              </li>
              <li className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-pakGreen-400 mt-2" />
                <span>Research lab (text) + sources + mind maps</span>
              </li>
              <li className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-pakGreen-400 mt-2" />
                <span>Notes, streaks, resources, syllabus hub</span>
              </li>
              <li className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
                <span>Premium: AI summarizer, flashcards, lecture notes, mind maps</span>
              </li>
            </ul>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => onNavigate('PRICING')}
                className="flex-1 px-5 py-3 rounded-2xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition"
              >
                Upgrade with JazzCash
              </button>
            </div>
          </div>
        </div>

        <div className="mt-14 text-center text-xs text-gray-400">
          Payments are processed via JazzCash hosted checkout.
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
