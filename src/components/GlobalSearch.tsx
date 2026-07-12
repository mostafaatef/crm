import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: number;
  type: 'organization' | 'contact' | 'deal';
  title: string;
  subtitle: string;
}

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          setResults(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchResults, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    navigate(`/${result.type}s/${result.id}`);
  };

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', padding: '6px 12px', cursor: 'text',
          color: 'var(--color-text-muted)', fontSize: '0.9rem', minWidth: '200px'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span>Search...</span>
        <kbd style={{ marginLeft: 'auto', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>⌘K</kbd>
      </div>
    );
  }

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }} 
        onClick={() => setIsOpen(false)} 
      />
      <div style={{
        position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '600px', backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 1000,
        overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search organizations, contacts, deals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1.1rem', marginLeft: '12px', backgroundColor: 'transparent', color: 'var(--color-text)' }}
          />
        </div>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {isSearching && <div style={{ padding: '16px', color: 'var(--color-text-muted)' }}>Searching...</div>}
          {!isSearching && query.length >= 2 && results.length === 0 && (
            <div style={{ padding: '16px', color: 'var(--color-text-muted)' }}>No results found.</div>
          )}
          {!isSearching && results.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {results.map((r, i) => (
                <li key={`${r.type}-${r.id}-${i}`}>
                  <button
                    onClick={() => handleSelect(r)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px 16px', backgroundColor: 'transparent',
                      border: 'none', borderBottom: '1px solid var(--color-bg)', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', gap: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'var(--color-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                        {r.type}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{r.title}</span>
                    </div>
                    {r.subtitle && <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{r.subtitle}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.length < 2 && (
            <div style={{ padding: '16px', color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
              Type at least 2 characters to search.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GlobalSearch;
