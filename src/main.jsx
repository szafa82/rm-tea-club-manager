import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Users, Wallet, ReceiptText, BarChart3, Package, Image, Settings, Plus, Search, Bell, Download, Coffee, ShieldCheck, X } from 'lucide-react';
import './styles.css';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STORAGE_KEY = 'rm-tea-club-members-v4';

const initialMembers = [
  { id: 1, name: 'Abbas', tag: 'Paid ahead', paid: [0,1,2,3,4,5,6,7,8,9,10,11], note: 'Paid until end of year' },
  { id: 2, name: 'Adam', tag: 'Admin', paid: [0,1,2,3,4,5,6], note: 'Treasurer' },
  { id: 3, name: 'Fred', tag: 'Active', paid: [0,1,2,3,4,5], note: 'Chicken fan' },
  { id: 4, name: 'Kehinde', tag: 'Due', paid: [0,1,2,3,4], note: 'Needs July' },
  { id: 5, name: 'Pietro', tag: 'Active', paid: [0,1,2,3,4,5,6], note: 'OK' },
  { id: 6, name: 'Spencer', tag: 'Active', paid: [0,1,2,3,4,5,6], note: 'OK' }
];

const initialTransactions = [
  { id: 'TC-0001', date: '2026-07-01', type: 'Payment', member: 'Abbas', category: 'Membership', amount: 36 },
  { id: 'TC-0002', date: '2026-07-02', type: 'Expense', member: 'Adam', category: 'Milk', amount: -9.8 },
  { id: 'TC-0003', date: '2026-07-04', type: 'Payment', member: 'Pietro', category: 'Membership', amount: 6 },
  { id: 'TC-0004', date: '2026-07-05', type: 'Expense', member: 'Adam', category: 'Tea bags', amount: -14.5 }
];

function loadMembers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialMembers;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : initialMembers;
  } catch {
    return initialMembers;
  }
}

function App() {
  const [active, setActive] = useState('Dashboard');
  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState(loadMembers);
  const [transactions] = useState(initialTransactions);
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  const stats = useMemo(() => {
    const paid = transactions.filter(t => t.amount > 0).reduce((a,t) => a + t.amount, 0);
    const spent = Math.abs(transactions.filter(t => t.amount < 0).reduce((a,t) => a + t.amount, 0));
    return { paid, spent, balance: paid - spent, outstanding: members.filter(m => !m.paid.includes(6)).length };
  }, [members, transactions]);

  const nav = [
    ['Dashboard', BarChart3], ['Members', Users], ['Transactions', ReceiptText], ['Reports', Wallet], ['Stock', Package], ['Poster Studio', Image], ['Settings', Settings]
  ];

  function addMember(member) {
    const cleanName = member.name.trim();
    if (!cleanName) return;
    const newMember = {
      id: Date.now(),
      name: cleanName,
      tag: member.tag || 'Active',
      paid: member.paid,
      note: member.note?.trim() || 'New member'
    };
    setMembers(prev => [...prev, newMember].sort((a,b) => a.name.localeCompare(b.name)));
    setModal(null);
    setToast(`${cleanName} added`);
    setTimeout(() => setToast(''), 2500);
    setActive('Members');
  }

  function deleteMember(id) {
    setMembers(prev => prev.filter(m => m.id !== id));
    setToast('Member removed');
    setTimeout(() => setToast(''), 2500);
  }

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(query.toLowerCase()));

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="logo">RM</div><div><b>Tea Club</b><span>Enterprise v4.1</span></div></div>
      {nav.map(([name, Icon]) => <button key={name} onClick={() => setActive(name)} className={active===name?'active':''}><Icon size={18}/>{name}</button>)}
      <div className="safe"><ShieldCheck size={17}/> Spreadsheet reload OFF</div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div><span className="version">v4.1 ADD MEMBERS FIX</span><h1>{active}</h1></div>
        <div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search members, payments, stock..." /></div>
        <button className="icon"><Bell size={18}/><span></span></button>
        <button className="primary" onClick={()=>setModal('addMember')}><Plus size={18}/>Add member</button>
      </header>

      {toast && <div className="toast">{toast}</div>}

      {active === 'Dashboard' && <section className="grid">
        <Stat title="Members" value={members.length} />
        <Stat title="Balance" value={`£${stats.balance.toFixed(2)}`} tone="green" />
        <Stat title="Paid in" value={`£${stats.paid.toFixed(2)}`} />
        <Stat title="Spent" value={`£${stats.spent.toFixed(2)}`} tone="red" />
        <Stat title="Outstanding" value={stats.outstanding} tone="orange" />
        <div className="panel wide"><h2>Cash flow</h2><div className="bars"><i style={{height:'70%'}}/><i style={{height:'45%'}}/><i style={{height:'88%'}}/><i style={{height:'52%'}}/><i style={{height:'78%'}}/><i style={{height:'35%'}}/></div></div>
        <div className="panel"><h2>Alerts</h2><p className="alert good">✓ Add member now works locally</p><p className="alert good">✓ New members stay after refresh</p><p className="alert">⚠ Firestore sync next step</p></div>
      </section>}

      {active === 'Members' && <section>
        <div className="panel-title member-toolbar">
          <h2>Members ({filteredMembers.length})</h2>
          <button className="primary" onClick={()=>setModal('addMember')}><Plus size={16}/>Add new member</button>
        </div>
        <div className="members">{filteredMembers.map(m => <div className="member" key={m.id}>
          <div className="member-top">
            <div className="avatar">{m.name[0]}</div>
            <button className="danger" title="Remove member" onClick={() => deleteMember(m.id)}><X size={15}/></button>
          </div>
          <div className="member-head"><h3>{m.name}</h3><span>{m.tag}</span></div>
          <p>{m.note}</p>
          <div className="months">{months.map((mo,i)=><b key={mo} className={m.paid.includes(i)?'paid':i<6?'late':'future'}>{mo}</b>)}</div>
        </div>)}</div>
      </section>}

      {active === 'Transactions' && <section className="panel"><div className="panel-title"><h2>Transactions Pro</h2><button className="primary" onClick={()=>setModal('Add transaction')}>Add transaction</button></div><table><thead><tr><th>ID</th><th>Date</th><th>Type</th><th>Member</th><th>Category</th><th>Amount</th></tr></thead><tbody>{transactions.map(t=><tr key={t.id}><td>{t.id}</td><td>{t.date}</td><td>{t.type}</td><td>{t.member}</td><td>{t.category}</td><td className={t.amount>0?'money':'cost'}>{t.amount>0?'+':''}£{t.amount}</td></tr>)}</tbody></table></section>}

      {active === 'Reports' && <section className="grid"><div className="panel wide"><h2>Mini reports</h2><div className="filters"><input placeholder="From date"/><input placeholder="To date"/><select><option>Sort by amount</option><option>Sort by date</option><option>Sort by member</option></select><button className="primary"><Download size={16}/>Export</button></div><p>Total paid: <b>£{stats.paid.toFixed(2)}</b></p><p>Total spent: <b>£{stats.spent.toFixed(2)}</b></p><p>Balance: <b>£{stats.balance.toFixed(2)}</b></p></div></section>}

      {active === 'Stock' && <section className="stock"><StockItem name="Tea bags" qty="4 boxes" level="OK"/><StockItem name="Milk" qty="1 bottle" level="LOW"/><StockItem name="Sugar" qty="2 bags" level="OK"/><StockItem name="Biscuits" qty="0" level="LOW"/></section>}

      {active === 'Poster Studio' && <section className="poster"><div className="poster-card"><Coffee size={42}/><h1>RM Tea Club</h1><p>Premium member list</p><div>{members.map(m=><span key={m.id}>{m.name}</span>)}</div></div><button className="primary">Download poster</button></section>}

      {active === 'Settings' && <section className="panel"><h2>Settings</h2><p><b>Monthly fee:</b> £6</p><p><b>Year:</b> 2026</p><p><b>Spreadsheet reload:</b> OFF</p><p><b>Firestore overwrite:</b> OFF</p><p><b>Member saving:</b> Browser localStorage ON</p></section>}
    </main>

    {modal === 'addMember' && <AddMemberModal onClose={() => setModal(null)} onSave={addMember} />}
    {modal && modal !== 'addMember' && <div className="modal" onClick={()=>setModal(null)}><div className="modal-card" onClick={e=>e.stopPropagation()}><h2>{modal}</h2><p>This modal is ready for the next feature.</p><div className="modal-actions"><button onClick={()=>setModal(null)}>Cancel</button><button className="primary" onClick={()=>setModal(null)}>Save</button></div></div></div>}
  </div>;
}

function AddMemberModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('Active');
  const [note, setNote] = useState('');
  const [paidUntil, setPaidUntil] = useState('none');

  const paid = useMemo(() => {
    if (paidUntil === 'none') return [];
    const max = Number(paidUntil);
    return months.map((_, i) => i).filter(i => i <= max);
  }, [paidUntil]);

  return <div className="modal" onClick={onClose}>
    <div className="modal-card" onClick={e=>e.stopPropagation()}>
      <h2>Add new member</h2>
      <label>Member name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. John" autoFocus /></label>
      <label>Status<select value={tag} onChange={e=>setTag(e.target.value)}><option>Active</option><option>Paid ahead</option><option>Due</option><option>Admin</option></select></label>
      <label>Paid until<select value={paidUntil} onChange={e=>setPaidUntil(e.target.value)}>
        <option value="none">Not paid yet</option>
        {months.map((m,i)=><option key={m} value={i}>{m} 2026</option>)}
      </select></label>
      <label>Note<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional note" /></label>
      <div className="preview-months">{months.map((mo,i)=><b key={mo} className={paid.includes(i)?'paid':'future'}>{mo}</b>)}</div>
      <div className="modal-actions"><button onClick={onClose}>Cancel</button><button className="primary" onClick={()=>onSave({ name, tag, note, paid })}>Save member</button></div>
    </div>
  </div>;
}

function Stat({title, value, tone}) { return <div className={`stat ${tone||''}`}><span>{title}</span><b>{value}</b></div> }
function StockItem({name, qty, level}) { return <div className="stock-item"><h3>{name}</h3><p>{qty}</p><span className={level==='LOW'?'low':'ok'}>{level}</span></div> }

createRoot(document.getElementById('root')).render(<App />);
