/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Compass, Star, ExternalLink, Loader2, Map as MapIcon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { searchPlaces, type MapResult } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MapResult | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Could not access your location. Results may be less relevant.");
        }
      );
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await searchPlaces(query, userLocation || undefined);
      setResult(data);
      // Scroll to results
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to fetch map data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickFilters = [
    { name: 'Restaurants', icon: <Star className="w-4 h-4" /> },
    { name: 'Hospitals', icon: <Info className="w-4 h-4" /> },
    { name: 'Hotels', icon: <MapIcon className="w-4 h-4" /> },
    { name: 'Gas Stations', icon: <Navigation className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Header / Hero */}
      <header className="relative h-[40vh] flex flex-col items-center justify-center px-6 overflow-hidden bg-[#5A5A40]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
          <div className="grid grid-cols-12 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-white/10" />
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-serif italic text-white mb-4 tracking-tight">
            Kibogora Map
          </h1>
          <p className="text-white/80 text-lg max-w-md mx-auto font-light">
            Discover places, navigate routes, and explore the world with AI-powered map intelligence.
          </p>
        </motion.div>
      </header>

      {/* Search Section */}
      <main className="max-w-4xl mx-auto -mt-12 px-6 pb-24 relative z-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] shadow-2xl shadow-black/5 p-2 md:p-4 border border-black/5"
        >
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5A40] w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for places, directions, or landmarks..."
                className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-lg placeholder:text-black/30 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#5A5A40] text-white px-8 py-4 rounded-full font-medium hover:bg-[#4A4A30] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Compass className="w-5 h-5" />}
              <span className="hidden md:inline">Explore</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mt-4 px-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.name}
                onClick={() => {
                  setQuery(filter.name);
                  handleSearch();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/5 hover:bg-black/5 transition-colors text-sm font-medium text-[#5A5A40]"
              >
                {filter.icon}
                {filter.name}
              </button>
            ))}
          </div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3"
          >
            <Info className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12 space-y-8"
              ref={scrollRef}
            >
              <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-black/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif italic">Discovery Results</h2>
                </div>

                <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:italic prose-p:leading-relaxed prose-p:text-black/70">
                  <Markdown>{result.text}</Markdown>
                </div>

                {/* Grounding Chunks (Map Links) */}
                {result.groundingChunks.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-black/5">
                    <h3 className="text-sm uppercase tracking-widest font-semibold text-black/40 mb-6">
                      Verified Map Sources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.groundingChunks.map((chunk, idx) => {
                        if (chunk.maps) {
                          return (
                            <a
                              key={idx}
                              href={chunk.maps.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between p-4 rounded-2xl border border-black/5 hover:border-[#5A5A40] hover:bg-[#5A5A40]/5 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
                                  <MapIcon className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-sm truncate max-w-[200px]">
                                  {chunk.maps.title || "View on Google Maps"}
                                </span>
                              </div>
                              <ExternalLink className="w-4 h-4 text-black/20 group-hover:text-[#5A5A40] transition-colors" />
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!result && !loading && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-24 text-center"
            >
              <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Compass className="w-10 h-10 text-black/20" />
              </div>
              <h3 className="text-xl font-serif italic text-black/40">
                Where would you like to go today?
              </h3>
              <p className="text-black/30 mt-2 max-w-xs mx-auto text-sm">
                Try searching for "Best coffee in Kibogora" or "Directions to the nearest hospital"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5A5A40] rounded-lg flex items-center justify-center text-white font-serif italic text-lg">K</div>
            <span className="font-serif italic text-xl">Kibogora Map</span>
          </div>
          <p className="text-black/40 text-sm">
            Powered by Google Maps & Gemini AI
          </p>
          <div className="flex gap-6 text-sm font-medium text-black/60">
            <span className="hover:text-[#5A5A40] cursor-pointer">Privacy</span>
            <span className="hover:text-[#5A5A40] cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

