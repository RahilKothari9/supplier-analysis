import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import axios from 'axios';
import { Search } from 'lucide-react';

const SearchBar = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Load the master list on mount
  useEffect(() => {
    axios.get('/companies.json')
      .then(res => setCompanies(res.data))
      .catch(err => console.error("Failed to load company list", err));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Configure Fuse.js
  const fuse = new Fuse(companies, {
    keys: ['search_key'],
    threshold: 0.3, // 0.0 is perfect match, 1.0 is match anything
    limit: 8
  });

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    if (val.length > 1) {
      setResults(fuse.search(val).map(result => result.item));
    } else {
      setResults([]);
    }
  };

  const handleSelect = (company) => {
    setQuery(`${company.name} (${company.symbol})`);
    setIsOpen(false);
    onSelect(company.ticker); // Pass the .NS ticker
  };

  return (
    <div className="relative w-full z-50" ref={wrapperRef}>
      <label className="font-mono text-xs uppercase tracking-[0.2em] text-ledger-ink/70">
        Search company ledger
      </label>
      <div className="relative mt-2 border-3 border-ledger-ink bg-ledger-bg shadow-hard focus-within:ring-2 focus-within:ring-ledger-ink">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ledger-ink" strokeWidth={3} />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Type NSE name or symbol (e.g., Tata Steel, TCS)"
          className="w-full bg-transparent pl-12 pr-4 py-3 text-lg font-bold uppercase placeholder:text-ledger-ink/40 focus:outline-none"
        />
      </div>
      <p className="mt-1 text-[11px] font-mono text-ledger-ink/60">Results limited to NSE .NS tickers</p>

      {isOpen && (
        <div className="absolute w-full mt-2 bg-ledger-bg border-3 border-ledger-ink shadow-hard max-h-80 overflow-y-auto">
          {results.length > 0 ? results.map((company) => (
            <button
              key={company.ticker}
              onClick={() => handleSelect(company)}
              className="w-full text-left p-3 hover:bg-ledger-ink hover:text-ledger-bg border-b-2 border-ledger-ink last:border-b-0 transition-colors uppercase font-medium flex justify-between"
            >
              <span>{company.name}</span>
              <span className="opacity-60">{company.symbol}</span>
            </button>
          )) : (
            <div className="p-3 font-mono text-sm text-ledger-ink/70">
              {query.length > 1 ? 'No matches found. Check spelling.' : 'Start typing to search.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
