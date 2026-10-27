'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, ExternalLink, CheckSquare, Square, Trash2, Edit2, Star, Lock, LogOut } from 'lucide-react';

interface CustomProblem {
  id: string;
  title: string;
  url: string;
  addedAt: number;
}

export function CustomDPSection() {
  const [problems, setProblems] = useState<CustomProblem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
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
      const aiRes = await fetch('/api/ai/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: prob.title, url: prob.url }),
      });
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
      if (savedProblems) {
        setProblems(JSON.parse(savedProblems));
      } else {
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

  const toggleFavorite = (id: string) => { const newFavorites = { ...favoriteMap, [id]: !favoriteMap[id] }; saveFavorites(newFavorites); };
  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (passwordInput === '1308') { setIsAuthenticated(true); sessionStorage.setItem('leetcamp_dp_auth', 'true'); setPasswordError(''); setPasswordInput(''); } else { setPasswordError('Incorrect password'); } };
  const handleLogout = () => { setIsAuthenticated(false); sessionStorage.removeItem('leetcamp_dp_auth'); };

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
  const handleDelete = (id: string) => { if (confirm('Delete?')) { saveProblems(problems.filter((p) => p.id !== id)); const s={...solvedMap}; delete s[id]; saveSolved(s); const f={...favoriteMap}; delete f[id]; saveFavorites(f); } };
  const toggleSolved = (id: string) => { const n={...solvedMap,[id]:!solvedMap[id]}; saveSolved(n); };
  const cancelForm = () => { setShowAddForm(false); setEditingId(null); setNewTitle(''); setNewUrl(''); setAiCompanies([]); };

  const solvedCount = Object.values(solvedMap).filter(Boolean).length;
  const favoriteCount = Object.values(favoriteMap).filter(Boolean).length;
  const displayProblems = activeTab === 'favorites' ? problems.filter(p => favoriteMap[p.id]) : problems;

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
          <div className="flex items-center gap-2">
            <button onClick={syncCompanies} disabled={syncing} className="btn-primary py-2 px-4 text-sm">{syncing ? 'Syncing...' : 'Sync Companies'}</button>
            <div className="flex items-center gap-2 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] px-3.5 py-2 rounded"><CheckSquare size={16} className="text-[var(--accent-green)]" /><div className="text-xs"><span className="text-[var(--text-muted)]">Progress: </span><strong className="text-[var(--text-primary)] mono font-bold">{solvedCount}</strong><span className="text-[var(--text-muted)] mono">/{problems.length}</span></div></div>
            <div className="flex items-center gap-2 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] px-3.5 py-2 rounded"><Star size={16} className="text-[var(--accent-yellow)]" /><div className="text-xs"><span className="text-[var(--text-muted)]">Favorites: </span><strong className="text-[var(--text-primary)] mono font-bold">{favoriteCount}</strong></div></div>
            <button onClick={handleLogout} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><LogOut size={16} /></button>
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <button onClick={() => setActiveTab('all')} className={`px-3.5 py-1.5 rounded text-xs font-semibold border ${activeTab === 'all' ? 'bg-[var(--accent-green)] text-[#0e0f12] border-[var(--accent-green)]' : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border-[var(--border-subtle)]'}`}>All ({problems.length})</button>
          <button onClick={() => setActiveTab('favorites')} className={`px-3.5 py-1.5 rounded text-xs font-semibold border flex items-center gap-1.5 ${activeTab === 'favorites' ? 'bg-[var(--accent-green)] text-[#0e0f12] border-[var(--accent-green)]' : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border-[var(--border-subtle)]'}`}><Star size={13} />Favorites ({favoriteCount})</button>
        </div>
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
            <thead><tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-muted)] label-caps"><th className="py-3 px-4 w-12 text-center">Status</th><th className="py-3 px-4 w-12 text-center">Fav</th><th className="py-3 px-4 w-12 text-center">#</th><th className="py-3 px-4">Problem</th><th className="py-3 px-4">Companies</th><th className="py-3 px-4 w-32 text-center">Action</th></tr></thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {displayProblems.sort((a,b)=>a.addedAt-b.addedAt).map((prob, idx) => {
                const isSolved = !!solvedMap[prob.id];
                const isFav = !!favoriteMap[prob.id];
                const globalIdx = activeTab === 'all' ? problems.findIndex(p=>p.id===prob.id)+1 : idx+1;
                const comps = companyData[prob.id] || [];
                return (
                  <tr key={prob.id} className={`hover:bg-[var(--bg-hover)] ${isSolved ? 'opacity-70' : ''}`}>
                    <td className="py-3.5 px-4 text-center"><button onClick={() => toggleSolved(prob.id)}>{isSolved ? <CheckSquare size={16} className="text-[var(--accent-green)]" /> : <Square size={16} className="text-[var(--text-muted)]" />}</button></td>
                    <td className="py-3.5 px-4 text-center"><button onClick={() => toggleFavorite(prob.id)}>{isFav ? <Star size={16} className="text-[var(--accent-yellow)] fill-[var(--accent-yellow)]" /> : <Star size={16} className="text-[var(--text-muted)]" />}</button></td>
                    <td className="py-3.5 px-4 text-center text-[var(--text-muted)] mono">{globalIdx}</td>
                    <td className="py-3.5 px-4"><a href={prob.url} target="_blank" rel="noopener noreferrer" className={`hover:text-[var(--accent-green)] flex items-center gap-1.5 ${isSolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}><span>{prob.title}</span><ExternalLink size={12} /></a></td>
                    <td className="py-3.5 px-4"><div className="flex flex-wrap gap-1">{comps.length>0 ? comps.slice(0,5).map((c,i)=>(<span key={i} className="px-1.5 py-0.5 text-[10px] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded">{c}</span>)) : <span className="text-[10px] text-[var(--text-muted)]">-</span>}</div></td>
                    <td className="py-3.5 px-4 text-center"><div className="flex items-center justify-center gap-1"><button onClick={() => handleEdit(prob)} className="p-1.5"><Edit2 size={14} /></button><button onClick={() => handleDelete(prob.id)} className="p-1.5"><Trash2 size={14} /></button><a href={prob.url} target="_blank" rel="noopener noreferrer" className="btn-primary py-1 px-2 text-xs">Solve</a></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
