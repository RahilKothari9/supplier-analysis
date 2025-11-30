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
      // Assuming backend is on port 8000
      const response = await axios.get(`http://127.0.0.1:8000/api/analyze/${ticker}`);
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch data. Ensure Backend is running and Ticker is valid.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-ledger-bg text-ledger-ink">
      <main className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-12 space-y-10">
        {/* HERO */}
        <section className="border-3 border-ledger-ink bg-ledger-paper shadow-hard p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-ledger-red">
                Indian Market Intelligence Unit
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tight">
                Supplier Stability
              </h1>
              <p className="font-mono text-sm text-ledger-ink/80 mt-2">
                Real-time solvency, liquidity, and operational truth for Indian suppliers.
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase bg-ledger-ink text-ledger-bg px-3 py-1 border-3 border-ledger-ink shadow-hard">
                <span className="w-2 h-2 bg-ledger-red inline-block" />
                Bombay Ledger v1.0.0
              </span>
            </div>
          </div>

          {/* SEARCH */}
          <SearchBar onSelect={fetchAnalysis} />
        </section>

        {/* STATES */}
        {loading && (
          <div className="font-mono text-lg animate-pulse text-center">
            Retrieving ledger entries...
          </div>
        )}

        {error && (
          <div className="p-4 border-3 border-ledger-red bg-red-100 text-ledger-red font-bold font-mono">
            {error}
          </div>
        )}

        {/* DASHBOARD */}
        <Dashboard data={data} />
      </main>

      {/* FOOTER */}
      <footer className="w-full py-6 text-center text-xs font-mono text-ledger-ink/60">
        Bombay Ledger Theme — Built for procurement teams
      </footer>
    </div>
  );
}

export default App;
