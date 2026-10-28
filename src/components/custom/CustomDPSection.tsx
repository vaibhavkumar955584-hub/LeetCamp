'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, ExternalLink, CheckSquare, Square, Trash2, Edit2, Star, Lock, LogOut, StickyNote, Filter, ArrowUpDown, Shuffle, Tag, Calendar } from 'lucide-react';

interface CustomProblem {
  id: string;
  title: string;
  url: string;
  addedAt: number;
  notes?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
  solvedOn?: string;
  revision?: boolean;
}

export function CustomDPSection() {
  const [problems, setProblems] = useState<CustomProblem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [tagsMap, setTagsMap] = useState<Record<string, string[]>>({});
  const [difficultyMap, setDifficultyMap] = useState<Record<string, 'Easy' | 'Medium' | 'Hard'>>({});
  const [solvedOnMap, setSolvedOnMap] = useState<Record<string, string>>({});
  const [revisionMap, setRevisionMap] = useState<Record<string, boolean>>({});
  const [showNoteModal, setShowNoteModal] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showTagModal, setShowTagModal] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'solved' | 'unsolved' | 'favorites' | 'notes' | 'revision' | 'withNotes'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'az' | 'za' | 'unsolvedFirst'>('recent');
  const [hideSolved, setHideSolved] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [companyData, setCompanyData] = useState<Record<string, string[]>>({});
  const [aiCompanies, setAiCompanies] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchCompanyDataForProblem = async (prob: CustomProblem): Promise<string[]> => {
    try {
      const res = await fetch(`/api/questions/search?title=${encodeURIComponent(prob.title)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        if (data.companies && Array.isArray(data.companies) && data.companies.length > 0) {
          return data.companies.slice(0, 6).map((c: any) => typeof c === 'string' ? c : c.company).filter(Boolean);
        } else if (data.results && data.results[0]) {
          const detailRes = await fetch(`/api/questions/search?slug=${data.results[0].slug}`);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData.companies && Array.isArray(detailData.companies) && detailData.companies.length > 0) {
              return detailData.companies.slice(0, 6).map((c: any) => typeof c === 'string' ? c : c.company).filter(Boolean);
            }
          }
        }
      }
    } catch (err) {}
    try {
      const aiRes = await fetch('/api/ai/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: prob.title, url: prob.url }) });
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        if (aiData.companies && Array.isArray(aiData.companies)) return aiData.companies.slice(0, 6);
      }
    } catch (err) {}
    return [];
  };

  useEffect(() => {
    try {
      const authSession = sessionStorage.getItem('leetcamp_dp_auth');
      if (authSession === 'true') setIsAuthenticated(true);
      setAuthChecked(true);
      const savedProblems = localStorage.getItem('leetcamp_custom_dp_problems');
      if (savedProblems) setProblems(JSON.parse(savedProblems));
      else {
        const defaultProblems: CustomProblem[] = [
          { id: 'dp-1', title: 'Fibonacci Number', url: 'https://leetcode.com/problems/fibonacci-number/', addedAt: Date.now() },
          { id: 'dp-2', title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/', addedAt: Date.now() + 1 },
          { id: 'dp-3', title: 'Count Ways to Reach Nth Stair Using 1, 2, 3 Steps', url: 'https://www.geeksforgeeks.org/search/?q=count%20ways%20to%20reach%20nth%20stair', addedAt: Date.now() + 2 },
          { id: 'dp-4', title: 'Frog Jump', url: 'https://www.geeksforgeeks.org/problems/geek-jump/1', addedAt: Date.now() + 3 },
          { id: 'dp-5', title: 'Min Cost Climbing Stairs', url: 'https://leetcode.com/problems/min-cost-climbing-stairs/', addedAt: Date.now() + 4 },
          { id: 'dp-6', title: 'House Robber', url: 'https://leetcode.com/problems/house-robber/', addedAt: Date.now() + 5 },
          { id: 'dp-7', title: 'House Robber II', url: 'https://leetcode.com/problems/house-robber-ii/', addedAt: Date.now() + 6 },
          { id: 'dp-8', title: 'Delete and Earn', url: 'https://leetcode.com/problems/delete-and-earn/', addedAt: Date.now() + 7 },
          { id: 'dp-9', title: 'Jump Game', url: 'https://leetcode.com/problems/jump-game/', addedAt: Date.now() + 8 },
          { id: 'dp-10', title: 'Jump Game II', url: 'https://leetcode.com/problems/jump-game-ii/', addedAt: Date.now() + 9 },
          { id: 'dp-11', title: 'Ways to Tile a Floor', url: 'https://www.geeksforgeeks.org/problems/ways-to-tile-a-floor5836/1', addedAt: Date.now() + 10 },
          { id: 'dp-12', title: 'Count Derangements', url: 'https://www.geeksforgeeks.org/problems/count-derangements-1587115620/1', addedAt: Date.now() + 11 },
          { id: 'dp-13', title: 'Maximum Subarray', url: 'https://leetcode.com/problems/maximum-subarray/', addedAt: Date.now() + 12 },
          { id: 'dp-14', title: 'Decode Ways', url: 'https://leetcode.com/problems/decode-ways/', addedAt: Date.now() + 13 },
          { id: 'dp-15', title: 'Padovan Sequence', url: 'https://www.geeksforgeeks.org/problems/padovan-sequence2855/1', addedAt: Date.now() + 14 },
          { id: 'dp-16', title: 'Lucas Number', url: 'https://www.geeksforgeeks.org/search/?q=Lucas%20Number%20GFG', addedAt: Date.now() + 15 },
          { id: 'dp-17', title: "Consecutive 1's Not Allowed", url: 'https://www.geeksforgeeks.org/problems/consecutive-1s-not-allowed1912/1', addedAt: Date.now() + 16 },
          { id: 'dp-18', title: 'Dice Combinations', url: 'https://cses.fi/problemset/task/1633', addedAt: Date.now() + 17 },
          { id: 'dp-19', title: 'Ways to Express N as Sum of 1, 3, 4', url: 'https://www.geeksforgeeks.org/search/?q=ways%20to%20express%20n%20as%20sum%20of%201%203%204', addedAt: Date.now() + 18 },
          { id: 'dp-20', title: 'Minimize Steps to Reach K from 0', url: 'https://www.geeksforgeeks.org/search/?q=minimize%20steps%20to%20reach%20K%20from%200', addedAt: Date.now() + 19 },
          { id: 'dp-21', title: 'Minimum Operations to Obtain N', url: 'https://www.geeksforgeeks.org/search/?q=minimum%20operations%20to%20obtain%20N', addedAt: Date.now() + 20 },
          { id: 'dp-22', title: 'Removing Digits', url: 'https://cses.fi/problemset/task/1637', addedAt: Date.now() + 21 },
          { id: 'dp-23', title: 'Maximize The Cut Segments', url: 'https://www.geeksforgeeks.org/problems/cutted-segments1642/1', addedAt: Date.now() + 22 },
          { id: 'dp-24', title: 'Geek and its Game of Coins', url: 'https://www.geeksforgeeks.org/search/?q=Geek%20and%20its%20Game%20of%20Coins', addedAt: Date.now() + 23 },
          { id: 'dp-25', title: 'Chicks in a Zoo', url: 'https://www.geeksforgeeks.org/search/?q=Chicks%20in%20a%20Zoo', addedAt: Date.now() + 24 },
        ];
        setProblems(defaultProblems);
        try { localStorage.setItem('leetcamp_custom_dp_problems', JSON.stringify(defaultProblems)); } catch (err) {}
      }
      const savedSolved = localStorage.getItem('leetcamp_custom_dp_solved');
      if (savedSolved) setSolvedMap(JSON.parse(savedSolved));
      const savedFavorites = localStorage.getItem('leetcamp_custom_dp_favorites');
      if (savedFavorites) setFavoriteMap(JSON.parse(savedFavorites));
      const savedNotes = localStorage.getItem('leetcamp_custom_dp_notes');
      if (savedNotes) setNotesMap(JSON.parse(savedNotes));
      const savedTags = localStorage.getItem('leetcamp_custom_dp_tags');
      if (savedTags) setTagsMap(JSON.parse(savedTags));
      const savedDiff = localStorage.getItem('leetcamp_custom_dp_diff');
      if (savedDiff) setDifficultyMap(JSON.parse(savedDiff));
      const savedSolvedOn = localStorage.getItem('leetcamp_custom_dp_solvedon');
      if (savedSolvedOn) setSolvedOnMap(JSON.parse(savedSolvedOn));
      const savedRev = localStorage.getItem('leetcamp_custom_dp_revision');
      if (savedRev) setRevisionMap(JSON.parse(savedRev));
    } catch (err) {}
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      if (!isAuthenticated || problems.length === 0) return;
      const updates: Record<string, string[]> = {};
      for (const prob of problems) {
        if (companyData[prob.id] && companyData[prob.id].length > 0) continue;
        const comps = await fetchCompanyDataForProblem(prob);
        if (comps.length > 0) updates[prob.id] = comps;
      }
      if (Object.keys(updates).length > 0) setCompanyData(prev => ({ ...prev, ...updates }));
    };
    fetchAll();
  }, [problems, isAuthenticated]);

  const saveProblems = (newProblems: CustomProblem[]) => { setProblems(newProblems); try { localStorage.setItem('leetcamp_custom_dp_problems', JSON.stringify(newProblems)); } catch (err) {} };
  const saveSolved = (newSolved: Record<string, boolean>) => { setSolvedMap(newSolved); try { localStorage.setItem('leetcamp_custom_dp_solved', JSON.stringify(newSolved)); } catch (err) {} };
  const saveFavorites = (newFavorites: Record<string, boolean>) => { setFavoriteMap(newFavorites); try { localStorage.setItem('leetcamp_custom_dp_favorites', JSON.stringify(newFavorites)); } catch (err) {} };
  const saveNotes = (newNotes: Record<string, string>) => { setNotesMap(newNotes); try { localStorage.setItem('leetcamp_custom_dp_notes', JSON.stringify(newNotes)); } catch (err) {} };
  const handleLogout = () => { setIsAuthenticated(false); sessionStorage.removeItem('leetcamp_dp_auth'); };
  const saveTags = (newTags: Record<string, string[]>) => { setTagsMap(newTags); try { localStorage.setItem('leetcamp_custom_dp_tags', JSON.stringify(newTags)); } catch (err) {} };
  const saveDifficulty = (newDiff: Record<string, 'Easy' | 'Medium' | 'Hard'>) => { setDifficultyMap(newDiff); try { localStorage.setItem('leetcamp_custom_dp_diff', JSON.stringify(newDiff)); } catch (err) {} };
  const saveSolvedOn = (newSolvedOn: Record<string, string>) => { setSolvedOnMap(newSolvedOn); try { localStorage.setItem('leetcamp_custom_dp_solvedon', JSON.stringify(newSolvedOn)); } catch (err) {} };
  const saveRevision = (newRev: Record<string, boolean>) => { setRevisionMap(newRev); try { localStorage.setItem('leetcamp_custom_dp_revision', JSON.stringify(newRev)); } catch (err) {} };

  const toggleFavorite = (id: string) => { const newFavorites = { ...favoriteMap, [id]: !favoriteMap[id] }; saveFavorites(newFavorites); };
  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (passwordInput === '1308') { setIsAuthenticated(true); sessionStorage.setItem('leetcamp_dp_auth', 'true'); setPasswordError(''); setPasswordInput(''); } else { setPasswordError('Incorrect password'); } };
  const toggleRevision = (id: string) => { const nr = { ...revisionMap, [id]: !revisionMap[id] }; saveRevision(nr); };
  const setDifficulty = (id: string, diff: 'Easy' | 'Medium' | 'Hard') => { const nd = { ...difficultyMap, [id]: diff }; saveDifficulty(nd); };
  const openTagModal = (id: string) => { setShowTagModal(id); setTagInput(''); };
  const addTag = () => {
    if (showTagModal && tagInput.trim()) {
      const current = tagsMap[showTagModal] || [];
      if (!current.includes(tagInput.trim())) {
        const nt = { ...tagsMap, [showTagModal]: [...current, tagInput.trim()] };
        saveTags(nt);
      }
      setTagInput('');
    }
  };
  const removeTag = (probId: string, tag: string) => {
    const current = tagsMap[probId] || [];
    const nt = { ...tagsMap, [probId]: current.filter(t => t !== tag) };
    saveTags(nt);
  };
  const randomUnsolved = () => {
    const unsolved = problems.filter(p => !solvedMap[p.id]);
    if (unsolved.length === 0) { alert('All solved!'); return; }
    const random = unsolved[Math.floor(Math.random() * unsolved.length)];
    window.open(random.url, '_blank');
  };
  const exportData = () => {
    const data = { problems, solvedMap, favoriteMap, notesMap, tagsMap, difficultyMap, solvedOnMap, revisionMap };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-dp-data.json';
    a.click();
  };

  const openNote = (id: string) => { setShowNoteModal(id); setNoteText(notesMap[id] || ''); };
  const saveNote = () => { if (showNoteModal) { const newNotes = { ...notesMap, [showNoteModal]: noteText }; saveNotes(newNotes); setShowNoteModal(null); setNoteText(''); } };

  const suggestCompaniesAI = async () => {
    if (!newTitle.trim()) { alert('Enter title first'); return; }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle, url: newUrl }) });
      if (res.ok) { const data = await res.json(); if (data.companies) setAiCompanies(data.companies.slice(0, 6)); }
    } catch (err) {} finally { setAiLoading(false); }
  };

  const syncCompanies = async () => {
    setSyncing(true);
    const updated = { ...companyData };
    for (const prob of problems) {
      const comps = await fetchCompanyDataForProblem(prob);
      if (comps.length > 0) updated[prob.id] = comps;
    }
    setCompanyData(updated);
    setSyncing(false);
  };

  const handleAddOrUpdate = async () => {
    if (!newTitle.trim() || !newUrl.trim()) { alert('Provide title and URL'); return; }
    const isDuplicate = problems.some(p => { if (editingId && p.id === editingId) return false; try { const pUrl = new URL(p.url); const nUrl = new URL(newUrl.trim()); if (pUrl.origin === nUrl.origin && pUrl.pathname === nUrl.pathname) return true; } catch {}; if (p.title.toLowerCase().trim() === newTitle.toLowerCase().trim()) return true; return false; });
    if (isDuplicate) { alert('This question already exists'); return; }
    if (editingId) {
      const updated = problems.map((p) => (p.id === editingId ? { ...p, title: newTitle.trim(), url: newUrl.trim() } : p));
      saveProblems(updated);
      if (aiCompanies.length > 0) setCompanyData(prev => ({ ...prev, [editingId]: aiCompanies }));
      else fetchCompanyDataForProblem({ id: editingId, title: newTitle, url: newUrl, addedAt: Date.now() }).then(comps => { if (comps.length > 0) setCompanyData(prev => ({ ...prev, [editingId]: comps })); });
      setEditingId(null);
    } else {
      const newProblem: CustomProblem = { id: Date.now().toString() + Math.random().toString(36).substr(2,9), title: newTitle.trim(), url: newUrl.trim(), addedAt: Date.now() };
      saveProblems([...problems, newProblem]);
      if (aiCompanies.length > 0) setCompanyData(prev => ({ ...prev, [newProblem.id]: aiCompanies }));
      else fetchCompanyDataForProblem(newProblem).then(comps => { if (comps.length > 0) setCompanyData(prev => ({ ...prev, [newProblem.id]: comps })); });
    }
    setNewTitle(''); setNewUrl(''); setAiCompanies([]); setShowAddForm(false);
  };

  const handleEdit = (problem: CustomProblem) => { setNewTitle(problem.title); setNewUrl(problem.url); setEditingId(problem.id); setAiCompanies(companyData[problem.id] || []); setShowAddForm(true); };
  const handleDelete = (id: string) => { if (confirm('Delete?')) { saveProblems(problems.filter((p) => p.id !== id)); const s={...solvedMap}; delete s[id]; saveSolved(s); const f={...favoriteMap}; delete f[id]; saveFavorites(f); const n={...notesMap}; delete n[id]; saveNotes(n); const t={...tagsMap}; delete t[id]; saveTags(t); const d={...difficultyMap}; delete d[id]; saveDifficulty(d); const so={...solvedOnMap}; delete so[id]; saveSolvedOn(so); const r={...revisionMap}; delete r[id]; saveRevision(r); } };
  const toggleSolved = (id: string) => { 
    const currentlySolved = !!solvedMap[id];
    const n={...solvedMap,[id]:!currentlySolved}; 
    saveSolved(n); 
    if (!currentlySolved) {
      const sOn = { ...solvedOnMap, [id]: new Date().toISOString().split('T')[0] };
      saveSolvedOn(sOn);
    } else {
      const sOn = { ...solvedOnMap }; delete sOn[id]; saveSolvedOn(sOn);
    }
  };
  const cancelForm = () => { setShowAddForm(false); setEditingId(null); setNewTitle(''); setNewUrl(''); setAiCompanies([]); };

  const solvedCount = Object.values(solvedMap).filter(Boolean).length;
  const favoriteCount = Object.values(favoriteMap).filter(Boolean).length;
  let filteredProblems = searchQuery.trim() ? problems.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.url.toLowerCase().includes(searchQuery.toLowerCase())) : problems;
  if (hideSolved) filteredProblems = filteredProblems.filter(p => !solvedMap[p.id]);
  if (companyFilter !== 'all') filteredProblems = filteredProblems.filter(p => (companyData[p.id] || []).includes(companyFilter));
  if (filterType === 'solved') filteredProblems = filteredProblems.filter(p => solvedMap[p.id]);
  else if (filterType === 'unsolved') filteredProblems = filteredProblems.filter(p => !solvedMap[p.id]);
  else if (filterType === 'favorites') filteredProblems = filteredProblems.filter(p => favoriteMap[p.id]);
  else if (filterType === 'notes' || filterType === 'withNotes') filteredProblems = filteredProblems.filter(p => notesMap[p.id]);
  else if (filterType === 'revision') filteredProblems = filteredProblems.filter(p => revisionMap[p.id]);
  filteredProblems = [...filteredProblems].sort((a,b) => {
    if (sortBy === 'oldest') return a.addedAt - b.addedAt;
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    if (sortBy === 'za') return b.title.localeCompare(a.title);
    if (sortBy === 'unsolvedFirst') { const as = solvedMap[a.id] ? 1 : 0; const bs = solvedMap[b.id] ? 1 : 0; if (as !== bs) return as - bs; return b.addedAt - a.addedAt; }
    return b.addedAt - a.addedAt;
  });
  const displayProblems = filteredProblems;

  if (!authChecked) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin w-6 h-6 border-2 border-[var(--accent-green)] border-t-transparent rounded-full" /></div>;
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="data-surface p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 mx-auto flex items-center justify-center"><Lock size={24} /></div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">My DP Section Protected</h1>
            <p className="text-sm text-[var(--text-secondary)]">Enter password</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus:border-[var(--accent-green)] text-[var(--text-primary)] px-3 py-2 rounded text-sm outline-none" autoFocus />
            {passwordError && <p className="text-xs text-[var(--diff-hard)]">{passwordError}</p>}
            <button type="submit" className="btn-primary py-2 px-4 text-sm w-full">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full mx-auto">
      <div className="data-surface p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">My Custom DP Problems</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Personalized DP list</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={randomUnsolved} className="btn-primary py-2 px-4 text-sm flex items-center gap-2"><Shuffle size={14} /><span>Random Unsolved</span></button>
            <button onClick={exportData} className="py-2 px-4 text-sm border border-[var(--border-subtle)] rounded">Export JSON</button>
            <button onClick={syncCompanies} disabled={syncing} className="btn-primary py-2 px-4 text-sm">{syncing ? 'Syncing...' : 'Sync Companies'}</button>
            <div className="flex items-center gap-2 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] px-3.5 py-2 rounded"><CheckSquare size={16} className="text-[var(--accent-green)]" /><div className="text-xs"><span className="text-[var(--text-muted)]">Progress: </span><strong className="text-[var(--text-primary)] mono font-bold">{solvedCount}</strong><span className="text-[var(--text-muted)] mono">/{problems.length}</span></div></div>
            <button onClick={handleLogout} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><LogOut size={16} /></button>
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)] flex-wrap items-center">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="px-3 py-1.5 rounded text-xs bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
            <option value="all">All</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
            <option value="favorites">Favorites</option>
            <option value="revision">Revision</option>
            <option value="withNotes">With Notes</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-1.5 rounded text-xs bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
            <option value="recent">Recently Added</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
            <option value="unsolvedFirst">Unsolved First</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" checked={hideSolved} onChange={(e) => setHideSolved(e.target.checked)} /> Hide Solved</label>
        </div>
        <div className="pt-2"><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search problems..." className="w-full max-w-md bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus:border-[var(--accent-green)] text-[var(--text-primary)] px-3 py-2 rounded text-sm outline-none" /></div>
      </div>

      {!showAddForm && <button onClick={() => { setShowAddForm(true); setAiCompanies([]); }} className="btn-primary py-2 px-4 text-sm flex items-center gap-2"><Plus size={16} /><span>Add New Problem</span></button>}

      {showAddForm && (
        <div className="data-surface p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{editingId ? 'Edit Problem' : 'Add New Problem'}</h2>
            <button onClick={cancelForm}><X size={18} /></button>
          </div>
          <div className="space-y-3">
            <div><label className="label-caps block mb-1.5">Problem Title</label><input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] px-3 py-2 rounded text-sm" /></div>
            <div><label className="label-caps block mb-1.5">Problem URL</label><input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] px-3 py-2 rounded text-sm" /></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><label className="label-caps">Companies</label><button onClick={suggestCompaniesAI} disabled={aiLoading || !newTitle.trim()} className="text-xs text-[var(--accent-green)] hover:underline disabled:opacity-50">{aiLoading ? 'Suggesting...' : 'Suggest with AI'}</button></div>
              {aiCompanies.length > 0 && <div className="flex flex-wrap gap-1 p-2 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded">{aiCompanies.map((comp, i) => (<span key={i} className="px-2 py-0.5 text-[11px] bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded flex items-center gap-1">{comp}<button onClick={() => setAiCompanies(aiCompanies.filter((_, idx) => idx !== i))}><X size={10} /></button></span>))}</div>}
            </div>
            <div className="flex gap-2 pt-2"><button onClick={handleAddOrUpdate} className="btn-primary py-2 px-4 text-sm">{editingId ? 'Update' : 'Add'}</button><button onClick={cancelForm} className="py-2 px-4 text-sm text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded">Cancel</button></div>
          </div>
        </div>
      )}

      <div className="data-surface overflow-x-auto">
        {displayProblems.length === 0 ? <div className="p-12 text-center text-xs text-[var(--text-muted)]"><p>No problems</p></div> : (
          <table className="w-full text-left border-collapse text-xs">
            <thead><tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-muted)] label-caps"><th className="py-3 px-4 w-12 text-center">Status</th><th className="py-3 px-4 w-12 text-center">Fav</th><th className="py-3 px-4 w-12 text-center">Rev</th><th className="py-3 px-4 w-12 text-center">#</th><th className="py-3 px-4">Problem</th><th className="py-3 px-4">Diff</th><th className="py-3 px-4">Tags</th><th className="py-3 px-4">Companies</th><th className="py-3 px-4">Notes</th><th className="py-3 px-4 w-32 text-center">Action</th></tr></thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {displayProblems.sort((a,b)=>a.addedAt-b.addedAt).map((prob, idx) => {
                const isSolved = !!solvedMap[prob.id];
                const isFav = !!favoriteMap[prob.id];
                const isRev = !!revisionMap[prob.id];
                const globalIdx = problems.findIndex(p=>p.id===prob.id)+1;
                const comps = companyData[prob.id] || [];
                const hasNote = !!notesMap[prob.id];
                const tags = tagsMap[prob.id] || [];
                const diff = difficultyMap[prob.id];
                return (
                  <tr key={prob.id} className={`hover:bg-[var(--bg-hover)] ${isSolved ? 'opacity-70' : ''}`}>
                    <td className="py-3.5 px-4 text-center"><button onClick={() => toggleSolved(prob.id)}>{isSolved ? <CheckSquare size={16} className="text-[var(--accent-green)]" /> : <Square size={16} className="text-[var(--text-muted)]" />}</button>{solvedOnMap[prob.id] && <p className="text-[9px] text-[var(--text-muted)] mt-0.5">{solvedOnMap[prob.id]}</p>}</td>
                    <td className="py-3.5 px-4 text-center"><button onClick={() => toggleFavorite(prob.id)}>{isFav ? <Star size={16} className="text-[var(--accent-yellow)] fill-[var(--accent-yellow)]" /> : <Star size={16} className="text-[var(--text-muted)]" />}</button></td>
                    <td className="py-3.5 px-4 text-center"><button onClick={() => toggleRevision(prob.id)} className={`text-xs ${isRev ? 'text-[var(--accent-orange)]' : 'text-[var(--text-muted)]'}`}>Rev</button></td>
                    <td className="py-3.5 px-4 text-center text-[var(--text-muted)] mono">{globalIdx}</td>
                    <td className="py-3.5 px-4"><a href={prob.url} target="_blank" rel="noopener noreferrer" className={`hover:text-[var(--accent-green)] flex items-center gap-1.5 ${isSolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}><span>{prob.title}</span><ExternalLink size={12} /></a></td>
                    <td className="py-3.5 px-4"><select value={diff || ''} onChange={(e) => e.target.value && setDifficulty(prob.id, e.target.value as any)} className="text-[10px] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded px-1 py-0.5"><option value="">-</option><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select></td>
                    <td className="py-3.5 px-4"><div className="flex flex-wrap gap-1">{tags.map((t,i)=>(<span key={i} className="px-1.5 py-0.5 text-[9px] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded flex items-center gap-1">{t}<button onClick={() => removeTag(prob.id, t)}><X size={8} /></button></span>))}<button onClick={() => openTagModal(prob.id)} className="text-[9px] text-[var(--accent-green)]">+Tag</button></div></td>
                    <td className="py-3.5 px-4"><div className="flex flex-wrap gap-1">{comps.length>0 ? comps.slice(0,3).map((c,i)=>(<span key={i} className="px-1.5 py-0.5 text-[9px] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded">{c}</span>)) : <span className="text-[10px] text-[var(--text-muted)]">-</span>}</div></td>
                    <td className="py-3.5 px-4"><button onClick={() => openNote(prob.id)} className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-green)]"><StickyNote size={14} className={hasNote ? 'text-[var(--accent-green)]' : ''} /><span>{hasNote ? 'Edit' : 'Add'}</span></button>{hasNote && <p className="text-[9px] text-[var(--text-muted)] mt-1 line-clamp-2 max-w-[120px]">{notesMap[prob.id]}</p>}</td>
                    <td className="py-3.5 px-4 text-center"><div className="flex items-center justify-center gap-1"><button onClick={() => handleEdit(prob)} className="p-1.5"><Edit2 size={14} /></button><button onClick={() => handleDelete(prob.id)} className="p-1.5"><Trash2 size={14} /></button><a href={prob.url} target="_blank" rel="noopener noreferrer" className="btn-primary py-1 px-2 text-xs">Solve</a></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showTagModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="data-surface p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[var(--text-primary)]">Add Tag</h2><button onClick={() => setShowTagModal(null)}><X size={18} /></button></div>
            <div className="flex gap-2"><input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g. recursion" className="flex-1 bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] px-2 py-1 rounded text-sm" onKeyDown={(e) => e.key === 'Enter' && addTag()} /><button onClick={addTag} className="btn-primary px-3 py-1 text-sm">Add</button></div>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="data-surface p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[var(--text-primary)]">Notes</h2><button onClick={() => { setShowNoteModal(null); setNoteText(''); }}><X size={18} /></button></div>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add notes..." className="w-full h-40 bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] px-3 py-2 rounded text-sm outline-none resize-none" />
            <div className="flex gap-2"><button onClick={saveNote} className="btn-primary py-2 px-4 text-sm">Save</button><button onClick={() => { setShowNoteModal(null); setNoteText(''); }} className="py-2 px-4 text-sm text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded">Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
