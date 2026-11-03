'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, ExternalLink, CheckSquare, Square, Trash2, Edit2, Star, Lock, LogOut, StickyNote, Filter, ArrowUpDown, Shuffle, Tag, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { categorizedDPProblems } from './DPProblemsData';

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
  const [isAuthed, setIsAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [companyData, setCompanyData] = useState<Record<string, string[]>>({});
  const [aiCompanies, setAiCompanies] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'DP': true,
    'Linear DP': true,
  });

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
        const defaultProblems: CustomProblem[] = categorizedDPProblems.map((p, idx) => ({
          id: p.id,
          title: p.title,
          url: p.url,
          addedAt: Date.now() + idx,
        }));
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
  const handleLogout = async () => { setIsAuthed(false); setProblems([]); try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {} };
  const saveTags = (newTags: Record<string, string[]>) => { setTagsMap(newTags); try { localStorage.setItem('leetcamp_custom_dp_tags', JSON.stringify(newTags)); } catch (err) {} };
  const saveDifficulty = (newDiff: Record<string, 'Easy' | 'Medium' | 'Hard'>) => { setDifficultyMap(newDiff); try { localStorage.setItem('leetcamp_custom_dp_diff', JSON.stringify(newDiff)); } catch (err) {} };
  const saveSolvedOn = (newSolvedOn: Record<string, string>) => { setSolvedOnMap(newSolvedOn); try { localStorage.setItem('leetcamp_custom_dp_solvedon', JSON.stringify(newSolvedOn)); } catch (err) {} };
  const saveRevision = (newRev: Record<string, boolean>) => { setRevisionMap(newRev); try { localStorage.setItem('leetcamp_custom_dp_revision', JSON.stringify(newRev)); } catch (err) {} };

  const toggleFavorite = (id: string) => { const newFavorites = { ...favoriteMap, [id]: !favoriteMap[id] }; saveFavorites(newFavorites); };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setAuthErr('');
    try {
      const r = await fetch('/api/auth/guest-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (r.ok) {
        setIsAuthed(true);
        let questions: any[] = [];
        const q = await fetch('/api/mydp/questions');
        if (q.ok) {
          const j = await q.json();
          questions = j.questions || [];
        }
        if (questions.length === 0) {
          const qShared = await fetch('/api/mydp/questions?shared=true');
          if (qShared.ok) {
            const j2 = await qShared.json();
            questions = j2.questions || [];
          }
        }
        if (questions.length === 0) {
          const defaultProblems: CustomProblem[] = categorizedDPProblems.map((p, idx) => ({
            id: p.id,
            title: p.title,
            url: p.url,
            addedAt: Date.now() + idx,
          }));
          setProblems(defaultProblems);
        } else {
          setProblems(questions);
        }
        setSolvedMap({}); setFavoriteMap({}); setNotesMap({}); setTagsMap({}); setDifficultyMap({}); setSolvedOnMap({}); setRevisionMap({});
      } else {
        const j = await r.json();
        setAuthErr(j.error || 'Failed');
      }
    } catch (err: any) {
      setAuthErr(err.message);
    } finally {
      setLoginLoading(false);
    }
  };
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
  if (!isAuthed) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="data-surface p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">My DP Access</h1>
            <p className="text-sm text-[var(--text-secondary)]">Enter email and password to access. New users are created instantly.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus:border-[var(--accent-green)] text-[var(--text-primary)] px-3 py-2 rounded text-sm outline-none" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus:border-[var(--accent-green)] text-[var(--text-primary)] px-3 py-2 rounded text-sm outline-none" />
            {authErr && <p className="text-xs text-[var(--diff-hard)]">{authErr}</p>}
            <button type="submit" disabled={loginLoading} className="btn-primary py-2 px-4 text-sm w-full">{loginLoading ? 'Signing in...' : 'Continue'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
      <div className="data-surface p-6 sm:p-8 lg:p-10 space-y-6 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">My Custom DP Problems</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Personalized DP list</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={randomUnsolved} className="btn-primary py-2 px-4 text-sm flex items-center gap-2"><Shuffle size={14} /><span>Random Unsolved</span></button>
            <button onClick={exportData} className="py-2 px-4 text-sm border border-[var(--border-subtle)] rounded">Export JSON</button>
            <button onClick={syncCompanies} disabled={syncing} className="btn-primary py-2 px-4 text-sm">{syncing ? 'Syncing...' : 'Sync Companies'}</button>
            <div className="flex items-center gap-2 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] px-3.5 py-2 rounded"><CheckSquare size={16} className="text-[var(--accent-green)]" /><div className="text-xs"><span className="text-[var(--text-muted)]">Progress: </span><strong className="text-[var(--text-primary)] mono font-bold">{solvedCount}</strong><span className="text-[var(--text-muted)] mono">/{problems.length}</span></div></div>
            <button onClick={handleLogout} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><LogOut size={16} /></button>
          </div>
        </div>
        <div className="flex gap-3 pt-3 border-t border-[var(--border-subtle)] flex-wrap items-center justify-between">
          <div className="flex gap-2 flex-wrap items-center">
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
              <option value="oldest">Oldest</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
              <option value="unsolvedFirst">Unsolved First</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" checked={hideSolved} onChange={(e) => setHideSolved(e.target.checked)} /> Hide Solved</label>
          </div>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search problems..." className="w-full sm:w-[320px] bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus:border-[var(--accent-green)] text-[var(--text-primary)] pl-3 pr-3 py-2 rounded text-sm outline-none" />
        </div>
      </div>

      {!showAddForm && <button onClick={() => { setShowAddForm(true); setAiCompanies([]); }} className="btn-primary py-2 px-4 text-sm flex items-center gap-2 mb-6"><Plus size={16} /><span>Add New Problem</span></button>}

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

      {displayProblems.length === 0 ? <div className="p-12 text-center text-xs text-[var(--text-muted)]"><p>No problems</p></div> : (
        <div className="space-y-1">
          {(() => {
            const problemsByCat = displayProblems.reduce((acc, prob) => {
              const dpInfo = categorizedDPProblems.find(p => p.id === prob.id);
              const cat = dpInfo?.category || 'Other';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(prob);
              return acc;
            }, {} as Record<string, typeof displayProblems>);

            const tree = [
              {
                id: 'DP',
                label: 'Dynamic Programming',
                children: [
                  {
                    id: 'Linear DP',
                    label: 'Linear DP',
                    children: (problemsByCat['Linear DP'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Knapsack',
                    label: 'Knapsack',
                    children: (problemsByCat['Knapsack'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Multi Dimensions DP',
                    label: 'Multi Dimensions DP',
                    children: (problemsByCat['Multi Dimensions DP'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Interval DP',
                    label: 'Interval DP',
                    children: (problemsByCat['Interval DP'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Bit DP',
                    label: 'Bitmask/Bit DP',
                    children: (problemsByCat['Bit DP'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Digit DP',
                    label: 'Digit DP',
                    children: (problemsByCat['Digit DP'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'DP on Trees',
                    label: 'DP on Trees',
                    children: (problemsByCat['DP on Trees'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'String DP',
                    label: 'String DP',
                    children: (problemsByCat['String DP'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Probability DP',
                    label: 'Probability DP',
                    children: (problemsByCat['Probability DP'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: "Kadane's Algorithm",
                    label: "Kadane's Algorithm",
                    children: (problemsByCat["Kadane's Algorithm"] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'LCS',
                    label: 'LCS / Edit Distance',
                    children: (problemsByCat['LCS'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'LIS',
                    label: 'LIS',
                    children: (problemsByCat['LIS'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: '2D Grid Traversal',
                    label: '2D Grid Traversal',
                    children: (problemsByCat['2D Grid Traversal'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Cumulative Sum',
                    label: 'Cumulative Sum',
                    children: (problemsByCat['Cumulative Sum'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Hashmap (SubArray)',
                    label: 'Hashmap (SubArray)',
                    children: (problemsByCat['Hashmap (SubArray)'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'DP + Alpha',
                    label: 'DP + Alpha',
                    children: (problemsByCat['DP + Alpha'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Insertion DP',
                    label: 'Insertion DP',
                    children: (problemsByCat['Insertion DP'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Graph DP',
                    label: 'Graph DP',
                    children: (problemsByCat['Graph DP'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Memoization',
                    label: 'Memoization',
                    children: (problemsByCat['Memoization'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Binary Lifting',
                    label: 'Binary Lifting',
                    children: (problemsByCat['Binary Lifting'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                  {
                    id: 'Math',
                    label: 'Math',
                    children: (problemsByCat['Math'] || []).map(p => ({ id: p.id, label: p.title, type: 'problem', problem: p }))
                  },
                ].filter(c => (c.children?.length || 0) > 0)
              }
            ];

            const renderNode = (node: any, depth: number = 0) => {
              const isExpanded = expandedNodes[node.id] !== false;
              const hasChildren = node.children && node.children.length > 0;
              return (
                <div key={node.id} className="select-none">
                  <div
                    className="flex items-center gap-1.5 py-1.5 hover:bg-[var(--bg-hover)] rounded cursor-pointer"
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => hasChildren && setExpandedNodes(prev => ({ ...prev, [node.id]: prev[node.id] === undefined ? false : !prev[node.id] }))}
                  >
                    {hasChildren ? (
                      isExpanded ? <ChevronDown size={12} className="text-[var(--text-muted)]" /> : <ChevronRight size={12} className="text-[var(--text-muted)]" />
                    ) : <span className="w-3" />}
                    {node.type === 'problem' ? (
                      <a href={node.problem.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-primary)] hover:text-[var(--accent-green)] flex items-center gap-1.5 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                        <span className="truncate">{node.label}</span>
                        <ExternalLink size={10} className="flex-shrink-0 opacity-60" />
                      </a>
                    ) : (
                      <span className={`text-xs ${depth === 0 ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{node.label}</span>
                    )}
                    {hasChildren && node.type !== 'problem' && (
                      <span className="text-[9px] text-[var(--text-muted)] ml-auto pr-2">({node.children.length})</span>
                    )}
                  </div>
                  {hasChildren && isExpanded && (
                    <div>
                      {node.children.map((child: any) => renderNode(child, depth + 1))}
                    </div>
                  )}
                </div>
              );
            };

            return tree.map(node => renderNode(node, 0));
          })()}
        </div>
      )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

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
