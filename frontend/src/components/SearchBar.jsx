import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import axios from 'axios';
import { Search } from 'lucide-react';

const SearchBar = ({ onSelect, compact = false }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    axios.get('/companies.json')
      .then(res => setCompanies(res.data))
      .catch(err => console.error("Failed to load company list", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fuse = new Fuse(companies, {
    keys: ['search_key'],
    threshold: 0.3,
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
    onSelect(company.ticker);
  };

  if (compact) {
    // Compact version for header
    return (
      <div className="relative w-full" ref={wrapperRef}>
        <div className="relative border-3 border-ledger-ink bg-ledger-bg shadow-hard">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ledger-ink" strokeWidth={3} />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            onFocus={() => { setIsFocused(true); setIsOpen(true); }}
            placeholder="Search company..."
            className="w-full bg-transparent pl-9 pr-4 py-2 text-sm font-bold uppercase placeholder:text-ledger-ink/40 focus:outline-none"
          />
        </div>
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-ledger-bg border-3 border-ledger-ink shadow-hard max-h-64 overflow-y-auto">
            {results.map((company) => (
              <button
                key={company.ticker}
                onClick={() => handleSelect(company)}
                className="w-full text-left px-4 py-2.5 hover:bg-ledger-ink hover:text-ledger-bg border-b border-ledger-ink/10 last:border-b-0 transition-colors uppercase text-xs font-semibold flex justify-between items-center gap-3"
              >
                <span className="truncate">{company.name}</span>
                <span className="opacity-40 text-[10px] shrink-0">{company.symbol}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full Hero version
  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Large Search Input */}
      <div className={`
        relative border-3 border-ledger-ink bg-ledger-bg shadow-hard
        transition-all duration-200
        ${isFocused ? 'ring-4 ring-ledger-ink/20' : ''}
      `}>
        <Search 
          className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-6 h-6 md:w-7 md:h-7 text-ledger-ink" 
          strokeWidth={2.5} 
        />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          onFocus={() => { setIsFocused(true); setIsOpen(true); }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search NSE company or symbol..."
          className="w-full bg-transparent pl-14 md:pl-16 pr-6 py-5 md:py-6 text-lg md:text-xl font-bold uppercase placeholder:text-ledger-ink/30 placeholder:font-medium focus:outline-none tracking-wide"
        />
        {/* Keyboard hint */}
        <div className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 items-center gap-1.5 text-ledger-ink/30">
          <kbd className="px-2 py-1 text-xs font-mono bg-ledger-paper border border-ledger-ink/20 rounded">↵</kbd>
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-ledger-bg border-3 border-ledger-ink shadow-hard max-h-80 overflow-y-auto">
          {results.map((company, index) => (
            <button
              key={company.ticker}
              onClick={() => handleSelect(company)}
              className="w-full text-left px-5 md:px-6 py-4 hover:bg-ledger-ink hover:text-ledger-bg border-b border-ledger-ink/10 last:border-b-0 transition-all duration-150 flex justify-between items-center gap-4 group"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center bg-ledger-paper border-2 border-ledger-ink text-xs font-mono font-bold group-hover:bg-ledger-bg group-hover:text-ledger-ink">
                  {index + 1}
                </span>
                <span className="uppercase text-sm md:text-base font-bold tracking-wide truncate">
                  {company.name}
                </span>
              </div>
              <span className="font-mono text-xs md:text-sm opacity-50 shrink-0 tracking-wider">
                {company.symbol}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length > 1 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-ledger-bg border-3 border-ledger-ink shadow-hard">
          <div className="px-6 py-5 font-mono text-sm text-ledger-ink/60 text-center">
            No companies found. Check spelling or try another search.
          </div>
        </div>
      )}

      {/* Suggestions when focused but no query */}
      {isOpen && query.length === 0 && isFocused && (
        <div className="absolute z-50 w-full mt-2 bg-ledger-bg border-3 border-ledger-ink shadow-hard">
          <div className="px-6 py-4 border-b border-ledger-ink/10">
            <p className="font-mono text-xs uppercase tracking-wider text-ledger-ink/50">Popular searches</p>
          </div>
          {['Tata Steel', 'Reliance', 'Infosys', 'HDFC Bank'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => { setQuery(suggestion); handleSearch({ target: { value: suggestion } }); }}
              className="w-full text-left px-6 py-3 hover:bg-ledger-ink hover:text-ledger-bg border-b border-ledger-ink/10 last:border-b-0 transition-colors uppercase text-sm font-medium"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
