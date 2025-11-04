'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface CampaignData {
  id: number;
  title: string;
  goal: number;
  raised: number;
  raised_percentage: number;
  supporter_count: number;
  cover_image: string | null;
  theme_color: string;
  url: string;
  timestamp: string;
}

interface Donation {
  amount: number;
  time: string;
  isNew?: boolean;
}

export default function Dashboard() {
  const [data, setData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [displayRaised, setDisplayRaised] = useState(0);
  const previousRaisedRef = useRef(0);
  const celebratedMilestonesRef = useRef<Set<number>>(new Set());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationAmount, setNotificationAmount] = useState(0);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await fetch('/api/campaign');
      if (!response.ok) throw new Error('Failed to fetch');
      const campaignData = await response.json();
      
      if (data && campaignData.raised > data.raised) {
        const donationAmount = campaignData.raised - data.raised;
        triggerConfetti();
        showDonationNotification(donationAmount);
        addRecentDonation(donationAmount);
      }

      checkMilestones(campaignData.raised_percentage);
      
      setData(campaignData);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const checkMilestones = (percentage: number) => {
    const milestones = [25, 50, 75, 100];
    milestones.forEach((milestone) => {
      if (
        percentage >= milestone &&
        !celebratedMilestonesRef.current.has(milestone)
      ) {
        celebratedMilestonesRef.current.add(milestone);
        triggerMilestoneConfetti();
      }
    });
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F67B16', '#1e3a5f', '#ffd700'],
    });
  };

  const triggerMilestoneConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F67B16', '#ffd700'],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#1e3a5f', '#ffd700'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const showDonationNotification = (amount: number) => {
    setNotificationAmount(amount);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const addRecentDonation = (amount: number) => {
    const newDonation: Donation = {
      amount,
      time: new Date().toLocaleTimeString(),
      isNew: true,
    };
    setRecentDonations((prev) => {
      const updated = [newDonation, ...prev].slice(0, 5);
      setTimeout(() => {
        setRecentDonations((current) =>
          current.map((d) => ({ ...d, isNew: false }))
        );
      }, 3000);
      return updated;
    });
  };

  useEffect(() => {
    if (!data) return;

    const targetRaised = data.raised;
    const startRaised = previousRaisedRef.current;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startRaised + (targetRaised - startRaised) * easeOutQuart;

      setDisplayRaised(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousRaisedRef.current = targetRaised;
      }
    };

    animate();
  }, [data?.raised]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 45000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-4"></div>
          <p className="text-white text-xl animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-red-200">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const percentage = (data.raised / data.goal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4 md:p-8">
      {/* Donation Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-green-300 flex items-center gap-3">
            <div className="text-3xl">🎉</div>
            <div>
              <p className="font-bold text-lg">New Donation!</p>
              <p className="text-green-100">${notificationAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* HTI Branding Header */}
        <header className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-16 w-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full animate-pulse-slow flex items-center justify-center text-white text-2xl font-bold">
              HTI
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                HTI Giving Season
              </h1>
              <p className="text-orange-400 text-lg md:text-xl font-semibold">
                Gift of Access Campaign
              </p>
            </div>
          </div>
          <div className="max-w-3xl mx-auto">
            <p className="text-blue-200 text-base md:text-lg mb-3">
              Help us bridge the digital divide. Every contribution provides laptops and technology access to those who need it most in our communities.
            </p>
            <a
              href="https://hubzonetech.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors inline-flex items-center gap-1"
            >
              Learn more at hubzonetech.org →
            </a>
          </div>
          {lastUpdated && (
            <p className="text-blue-300 text-sm mt-2 flex items-center justify-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  refreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                }`}
              ></span>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-[1.02] transition-all duration-300 animate-slide-up">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-orange-100 text-xl md:text-2xl font-semibold mb-2">
                  Total Raised
                </p>
                <h2 className="text-6xl md:text-8xl font-black text-white mb-4 animate-pulse-slow">
                  ${displayRaised.toFixed(2)}
                </h2>
                <p className="text-orange-100 text-lg md:text-xl">
                  of ${data.goal.toLocaleString()} goal
                </p>
              </div>
              <div className="relative">
                <svg className="w-32 h-32 md:w-40 md:h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 70 * (1 - percentage / 100)
                    }`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-black text-white">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 shadow-2xl transform hover:scale-[1.02] transition-all duration-300 animate-slide-up animation-delay-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-7xl font-black text-white mb-2">
                {data.supporter_count}
              </h3>
              <p className="text-blue-100 text-xl font-semibold">
                {data.supporter_count === 1 ? 'Supporter' : 'Supporters'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 mb-8 shadow-2xl animate-slide-up animation-delay-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-2xl font-bold">Campaign Progress</h3>
            <span className="text-blue-200 text-lg font-semibold">
              ${(data.goal - data.raised).toFixed(2)} to go
            </span>
          </div>
          <div className="relative h-8 bg-white/20 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000 ease-out rounded-full flex items-center justify-end pr-4"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            >
              {percentage > 10 && (
                <span className="text-white font-bold text-sm">
                  {percentage.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up animation-delay-300">
          {/* Campaign Image */}
          {data.cover_image && (
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
              <img
                src={data.cover_image}
                alt="Campaign"
                className="w-full h-full min-h-[300px] object-cover"
              />
            </div>
          )}

          {/* Recent Donations Feed */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-6 h-6 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="text-xl font-bold text-white">Recent Support</h3>
            </div>
            
            {recentDonations.length > 0 ? (
              <div className="space-y-3">
                {recentDonations.map((donation, index) => (
                  <div
                    key={`${donation.time}-${index}`}
                    className={`p-4 rounded-xl transition-all duration-500 ${
                      donation.isNew
                        ? 'bg-green-500/30 border-2 border-green-400 scale-105'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {donation.isNew ? '✨' : '💛'}
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">
                            ${donation.amount.toFixed(2)}
                          </p>
                          <p className="text-blue-200 text-xs">
                            {donation.time}
                          </p>
                        </div>
                      </div>
                      {donation.isNew && (
                        <span className="text-green-300 text-xs font-semibold animate-pulse">
                          NEW!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-blue-300 text-sm">
                  Tracking donations in real-time...
                </p>
                <p className="text-blue-400 text-xs mt-2">
                  New donations will appear here!
                </p>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-center rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                Donate Now →
              </a>
            </div>
          </div>
        </div>

        {/* Impact Statement */}
        <div className="mt-8 bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl animate-slide-up animation-delay-400 border border-blue-400/20">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Your Impact Matters 💡
            </h3>
            <p className="text-blue-200 text-base md:text-lg max-w-3xl mx-auto">
              HTI converts donated laptops into Chromebooks and provides them to families in underserved communities.
              Every dollar helps bridge the digital divide and opens doors to education and employment opportunities.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-blue-200">
                <span className="text-2xl">💻</span>
                <span>Free Chromebooks</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <span className="text-2xl">📚</span>
                <span>Educational Access</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <span className="text-2xl">💼</span>
                <span>Job Opportunities</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-blue-300 text-sm animate-fade-in animation-delay-500">
          <div className="flex flex-col items-center gap-2">
            <p className="text-base">
              Built with 💛 for <a href="https://hubzonetech.org" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">HUBZone Technology Initiative</a>
            </p>
            <p className="text-xs">Live tracking • Updates every 45 seconds • Campaign ID: {data.id}</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
