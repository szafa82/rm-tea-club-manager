import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STORAGE_KEY = 'rm-tea-club-v2-data';

const starter = {
  monthlyFee: 6,
  year: 2026,
  members: [
    { id: 'abbas', name: 'Abbas', paid: [0,1,2,3,4,5,6,7,8,9,10,11], pinned: true, notes: 'Paid until end of year' },
    { id: 'adam', name: 'Adam', paid: [0,1,2,3,4,5,6], pinned: true, notes: 'Admin' },
    { id: 'fred', name: 'Fred', paid: [0,1,2,3,4,5], pinned: false, notes: '' }
  ],
  transactions: [
    { id: 't1', date: '2026-07-01', type: 'payment', member: 'Abbas', category: 'Membership', amount: 72, note: 'Paid full year' },
    { id: 't2', date: '2026-07-02', type: 'expense', member: '', category: 'Milk', amount: 8.5, note: 'Milk top up' },
    { id: 't3', date: '2026-07-03', type: 'payment', member: 'Adam', category: 'Membership', amount: 6, note: 'July' }
  ],
  stock: [
    { id: 's1', item: 'Tea bags', qty: 2, level: 'ok' },
    { id: 's2', item: 'Milk', qty: 1, level: 'low' },
    { id: 's3', item: 'Sugar', qty: 3, level: 'ok' }
  ],
  audit: ['v2 created', 'Abbas marked paid until December']
};

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || starter; } catch { return starter; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function Modal({ title, children, onClose }) {
  return <div className="modalShade" onMouseDown={onClose}>
    <div className="modal" onMouseDown={e => e.stopPropagation()}>
      <div className="modalHead"><h2>{title}</h2><button onClick={onClose}>×</button></div>
      {children}
    </div>
  </div>;
}

function App() {
  const [data, setData] = useState(loadData);
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');

  const update = (next, audit) => {
    const value = { ...next, audit: [audit, ...(next.audit || [])].slice(0, 30) };
    setData(value); saveData(value);
  };

  const totals = useMemo(() => {
    const paid = data.transactions.filter(t => t.type === 'payment').reduce((s,t) => s + Number(t.amount || 0), 0);
    const spent = data.transactions.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount || 0), 0);
    const currentMonth = new Date().getMonth();
    const outstanding = data.members.filter(m => !m.paid.includes(currentMonth)).length;
    return { paid, spent, balance: paid - spent, outstanding, members: data.members.length };
  }, [data]);

  const filteredMembers = data.members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const filteredTransactions = data.transactions.filter(t => JSON.stringify(t).toLowerCase().includes(search.toLowerCase()));

  const addMember = (name) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    update({ ...data, members: [...data.members, { id, name, paid: [], pinned: false, notes: '' }] }, `Added member ${name}`);
    setModal(null);
  };

  const addTransaction = (form) => {
    const amount = Number(form.amount || 0);
    const tx = { id: 'tx-' + Date.now(), ...form, amount };
    update({ ...data, transactions: [tx, ...data.transactions] }, `Added ${form.type} £${amount}`);
    setModal(null);
  };

  const toggleMonth = (memberId, month) => {
    const members = data.members.map(m => {
      if (m.id !== memberId) return m;
      const paid = m.paid.includes(month) ? m.paid.filter(x => x !== month) : [...m.paid, month].sort((a,b)=>a-b);
      return { ...m, paid };
    });
    update({ ...data, members }, 'Updated month status');
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'rm-tea-club-backup.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return <>
    <aside className="sidebar">
      <div className="brand"><span>RM</span><strong>Tea Club</strong><small>Manager v2</small></div>
      {['dashboard','members','transactions','reports','stock','poster','settings'].map(x => <button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}</button>)}
    </aside>
    <main>
      <header>
        <input placeholder="Search members, payments, milk..." value={search} onChange={e=>setSearch(e.target.value)} />
        <button className="primary" onClick={()=>setModal('quick')}>+ Quick Add</button>
      </header>

      {tab === 'dashboard' && <section>
        <h1>Dashboard</h1>
        <div className="cards">
          <div className="card"><small>Balance</small><b>£{totals.balance.toFixed(2)}</b></div>
          <div className="card"><small>Total paid</small><b>£{totals.paid.toFixed(2)}</b></div>
          <div className="card"><small>Total spent</small><b>£{totals.spent.toFixed(2)}</b></div>
          <div className="card"><small>Members</small><b>{totals.members}</b></div>
          <div className="card warn"><small>Outstanding this month</small><b>{totals.outstanding}</b></div>
        </div>
        <div className="grid2">
          <div className="panel"><h2>Recent activity</h2>{data.audit.map((a,i)=><p key={i}>• {a}</p>)}</div>
          <div className="panel"><h2>Alerts</h2><p>Milk stock low</p><p>{totals.outstanding} member(s) unpaid this month</p></div>
        </div>
      </section>}

      {tab === 'members' && <section>
        <div className="titleRow"><h1>Members</h1><button className="primary" onClick={()=>setModal('member')}>Add member</button></div>
        <div className="memberGrid">{filteredMembers.map(m => <div className="member" key={m.id}>
          <div className="memberTop"><h2>{m.name}</h2><span>{m.pinned ? '★ pinned' : 'member'}</span></div>
          <small>{m.notes || 'No notes'}</small>
          <div className="months">{MONTHS.map((month,i)=><button key={month} onClick={()=>toggleMonth(m.id,i)} className={m.paid.includes(i)?'paid':'due'}>{month}</button>)}</div>
        </div>)}</div>
      </section>}

      {tab === 'transactions' && <section>
        <div className="titleRow"><h1>Transactions</h1><button className="primary" onClick={()=>setModal('transaction')}>Add transaction</button></div>
        <table><thead><tr><th>Date</th><th>Type</th><th>Member</th><th>Category</th><th>Amount</th><th>Note</th></tr></thead><tbody>{filteredTransactions.map(t=><tr key={t.id}><td>{t.date}</td><td>{t.type}</td><td>{t.member}</td><td>{t.category}</td><td>£{Number(t.amount).toFixed(2)}</td><td>{t.note}</td></tr>)}</tbody></table>
      </section>}

      {tab === 'reports' && <section><h1>Reports PRO</h1><div className="cards"><div className="card"><small>Income</small><b>£{totals.paid.toFixed(2)}</b></div><div className="card"><small>Expenses</small><b>£{totals.spent.toFixed(2)}</b></div><div className="card"><small>Balance</small><b>£{totals.balance.toFixed(2)}</b></div></div><div className="panel"><h2>Mini report</h2><p>Members paid ahead: {data.members.filter(m=>m.paid.length > new Date().getMonth()+1).length}</p><p>Average transaction: £{(data.transactions.reduce((s,t)=>s+Number(t.amount||0),0)/Math.max(data.transactions.length,1)).toFixed(2)}</p></div></section>}

      {tab === 'stock' && <section><h1>Stock</h1><div className="stockGrid">{data.stock.map(s=><div className={'stock '+s.level} key={s.id}><b>{s.item}</b><span>Qty: {s.qty}</span><small>{s.level}</small></div>)}</div></section>}

      {tab === 'poster' && <section><h1>Poster Studio</h1><div className="poster"><h2>RM Tea Club</h2><p>Members list</p>{data.members.map(m=><span key={m.id}>{m.name}</span>)}</div><button onClick={()=>window.print()} className="primary">Print / Save as PDF</button></section>}

      {tab === 'settings' && <section><h1>Settings</h1><div className="panel"><p>Monthly fee: £{data.monthlyFee}</p><p>Year: {data.year}</p><button onClick={exportJson}>Download backup JSON</button><button className="danger" onClick={()=>{localStorage.removeItem(STORAGE_KEY); location.reload();}}>Reset local demo data</button></div></section>}
    </main>

    {modal === 'quick' && <Modal title="Quick Add" onClose={()=>setModal(null)}><div className="quick"><button onClick={()=>setModal('member')}>Add member</button><button onClick={()=>setModal('transaction')}>Add payment / expense</button><button onClick={()=>setTab('poster') || setModal(null)}>Open poster</button></div></Modal>}
    {modal === 'member' && <Modal title="Add member" onClose={()=>setModal(null)}><SimpleMember onSave={addMember} /></Modal>}
    {modal === 'transaction' && <Modal title="Add transaction" onClose={()=>setModal(null)}><SimpleTransaction members={data.members} onSave={addTransaction} /></Modal>}
  </>;
}

function SimpleMember({ onSave }) {
  const [name, setName] = useState('');
  return <div className="form"><input autoFocus placeholder="Member name" value={name} onChange={e=>setName(e.target.value)} /><button className="primary" disabled={!name.trim()} onClick={()=>onSave(name.trim())}>Save</button></div>;
}

function SimpleTransaction({ members, onSave }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), type: 'payment', member: '', category: 'Membership', amount: 6, note: '' });
  const set = (k,v) => setForm({ ...form, [k]: v });
  return <div className="form">
    <input type="date" value={form.date} onChange={e=>set('date', e.target.value)} />
    <select value={form.type} onChange={e=>set('type', e.target.value)}><option>payment</option><option>expense</option><option>correction</option></select>
    <select value={form.member} onChange={e=>set('member', e.target.value)}><option value="">No member</option>{members.map(m=><option key={m.id}>{m.name}</option>)}</select>
    <input placeholder="Category" value={form.category} onChange={e=>set('category', e.target.value)} />
    <input type="number" step="0.01" value={form.amount} onChange={e=>set('amount', e.target.value)} />
    <input placeholder="Note" value={form.note} onChange={e=>set('note', e.target.value)} />
    <button className="primary" onClick={()=>onSave(form)}>Save transaction</button>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
