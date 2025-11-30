import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import Dashboard from './components/Dashboard';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalysis = async (ticker) => {
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/analyze/${ticker}`);
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch data. Ensure Backend is running and Ticker is valid.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showHero = !data && !loading && !error;

  return (
    <div className="h-100 w-full bg-ledger-bg text-ledger-ink">
      {showHero ? (
        /* ========== HERO STATE - Full Screen Landing ========== */
        <div className="h-screen flex flex-col">
          {/* Top Bar */}
          <div className="w-full px-6 md:px-12 py-6 flex items-center justify-between">
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-ledger-red font-semibold">
              Indian Market Intelligence Unit
            </span>
            
          </div>

          {/* Hero Content - Positioned slightly above center */}
          <div className="flex-1 flex items-center justify-center px-6 md:px-12 pb-16 md:pb-24">
            <div className="w-full max-w-4xl mx-auto text-center space-y-6 md:space-y-10">
              {/* Main Title */}
              <div className="space-y-2 md:space-y-6">
                <h1 className="font-serif font-bold uppercase tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.85]">
                  Supplier
                  <br />
                  <span className="text-ledger-red">Stability</span>
                </h1>
                <p className="font-mono text-base md:text-lg lg:text-xl text-ledger-ink/70 max-w-2xl mx-auto leading-relaxed">
                  Real-time solvency, liquidity, and operational truth for Indian suppliers.
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full max-w-2xl mx-auto">
                <SearchBar onSelect={fetchAnalysis} compact={false} />
              </div>

              {/* Helper Text */}
              <p className="font-mono text-xs md:text-sm text-ledger-ink/40 uppercase tracking-wider">
                Search 2000+ NSE-listed companies • Real-time financial analysis
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full px-6 md:px-12 py-6 text-center">
            <p className="font-mono text-[10px] md:text-xs text-ledger-ink/40 uppercase tracking-wider">
              Bombay Ledger Theme — Built for procurement teams
            </p>
          </div>
        </div>
      ) : (
        /* ========== RESULTS STATE - Compact Header + Content ========== */
        <div className="min-h-screen flex flex-col">
          {/* Compact Header */}
          <header className="w-full border-b-3 border-ledger-ink bg-ledger-paper">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 shrink-0">
                  <h1 className="font-serif font-bold uppercase tracking-tight text-xl md:text-2xl">
                    Supplier <span className="text-ledger-red">Stability</span>
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1.5 font-mono text-[9px] uppercase bg-ledger-ink text-ledger-bg px-2 py-1">
                    <span className="w-1.5 h-1.5 bg-ledger-red inline-block" />
                    v1.0.0
                  </span>
                </div>
                <div className="flex-1 max-w-lg">
                  <SearchBar onSelect={fetchAnalysis} compact={true} />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 py-6 md:py-10">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <div className="w-16 h-16 border-4 border-ledger-ink border-t-ledger-red rounded-full animate-spin" />
                  <p className="font-mono text-lg uppercase tracking-wider animate-pulse">
                    Retrieving ledger entries...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="max-w-xl mx-auto p-6 border-3 border-ledger-red bg-red-50 shadow-hard">
                  <p className="font-mono text-ledger-red font-bold text-center">{error}</p>
                </div>
              )}

              {/* Dashboard */}
              <Dashboard data={data} />
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full py-4 border-t border-ledger-ink/20 text-center">
            <p className="font-mono text-[10px] text-ledger-ink/40 uppercase tracking-wider">
              Bombay Ledger Theme — Built for procurement teams
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;
