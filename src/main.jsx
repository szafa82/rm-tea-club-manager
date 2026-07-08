import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Users, Wallet, ReceiptText, BarChart3, Package, Image, Settings,
  Plus, Search, Bell, Download, Coffee, ShieldCheck, X, Save, Trash2
} from 'lucide-react';
import './styles.css';

const APP_VERSION = 'v4.3 ADD MEMBER REALLY WORKING';
const STORAGE_MEMBERS = 'rmTeaClubMembers_v43';
const STORAGE_TRANSACTIONS = 'rmTeaClubTransactions_v43';
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [active, setActive] = useState('Members');
  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [members, setMembers] = useState(() => loadData(STORAGE_MEMBERS, initialMembers));
  const [transactions, setTransactions] = useState(() => loadData(STORAGE_TRANSACTIONS, initialTransactions));

  useEffect(() => { localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(transactions)); }, [transactions]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const addMember = ({ name, tag, note, paid }) => {
    const cleanName = name.trim();
    if (!cleanName) {
      showToast('Member name is required');
      return false;
    }

    const exists = members.some(m => m.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      showToast(`${cleanName} already exists`);
      return false;
    }

    const newMember = {
      id: Date.now(),
      name: cleanName,
      tag: tag || 'Active',
      paid,
      note: note || 'New member'
    };

    setMembers(prev => [newMember, ...prev]);
    setActive('Members');
    setModal(null);
    showToast(`${cleanName} added and saved locally`);
    return true;
  };

  const addQuickTestMember = () => {
    const number = members.filter(m => m.name.startsWith('TEST MEMBER')).length + 1;
    addMember({
      name: `TEST MEMBER ${number}`,
      tag: 'Test',
      paid: [6],
      note: 'Added by test button'
    });
  };

  const deleteMember = (id) => {
    const member = members.find(m => m.id === id);
    setMembers(prev => prev.filter(m => m.id !== id));
    showToast(`${member?.name || 'Member'} deleted`);
  };

  const resetDemoData = () => {
    setMembers(initialMembers);
    setTransactions(initialTransactions);
    localStorage.removeItem(STORAGE_MEMBERS);
    localStorage.removeItem(STORAGE_TRANSACTIONS);
    showToast('Demo data restored');
  };

  const stats = useMemo(() => {
    const paid = transactions.filter(t => t.amount > 0).reduce((a,t) => a + Number(t.amount), 0);
    const spent = Math.abs(transactions.filter(t => t.amount < 0).reduce((a,t) => a + Number(t.amount), 0));
    return { paid, spent, balance: paid - spent, outstanding: members.filter(m => !m.paid.includes(6)).length };
  }, [members, transactions]);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.tag.toLowerCase().includes(query.toLowerCase()) ||
    m.note.toLowerCase().includes(query.toLowerCase())
  );

  const nav = [
    ['Dashboard', BarChart3], ['Members', Users], ['Transactions', ReceiptText], ['Reports', Wallet], ['Stock', Package], ['Poster Studio', Image], ['Settings', Settings]
  ];

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="logo">RM</div><div><b>Tea Club</b><span>Enterprise</span></div></div>
      <div className="buildBadge">{APP_VERSION}</div>
      {nav.map(([name, Icon]) => <button key={name} onClick={() => setActive(name)} className={active===name?'active':''}><Icon size={18}/>{name}</button>)}
      <div className="safe"><ShieldCheck size={17}/> Spreadsheet reload OFF<br/>Firestore overwrite OFF</div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div><span className="version">{APP_VERSION}</span><h1>{active}</h1></div>
        <div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search members, payments, stock..." /></div>
        <button className="icon"><Bell size={18}/><span></span></button>
        <button className="primary" onClick={()=>setModal('addMember')}><Plus size={18}/>Add member</button>
        <button className="secondary" onClick={addQuickTestMember}>+ TEST MEMBER</button>
      </header>

      {active === 'Dashboard' && <section className="grid">
        <Stat title="Balance" value={`£${stats.balance.toFixed(2)}`} tone="green" />
        <Stat title="Paid in" value={`£${stats.paid.toFixed(2)}`} />
        <Stat title="Spent" value={`£${stats.spent.toFixed(2)}`} tone="red" />
        <Stat title="Members" value={members.length} tone="orange" />
        <div className="panel wide"><h2>Cash flow</h2><div className="bars"><i style={{height:'70%'}}/><i style={{height:'45%'}}/><i style={{height:'88%'}}/><i style={{height:'52%'}}/><i style={{height:'78%'}}/><i style={{height:'35%'}}/></div></div>
        <div className="panel"><h2>Alerts</h2><p className="alert good">✓ Add member is now wired</p><p className="alert good">✓ Saved in browser after refresh</p><p className="alert">⚠ Firestore connection next step</p></div>
      </section>}

      {active === 'Members' && <section>
        <div className="panel-title topPanel">
          <div><h2>Members</h2><p>{members.length} total. Filtered: {filteredMembers.length}</p></div>
          <button className="primary big" onClick={()=>setModal('addMember')}><Plus size={18}/>ADD NEW MEMBER</button>
        </div>
        <div className="members">{filteredMembers.map(m => <div className="member" key={m.id}>
          <div className="avatar">{m.name[0]}</div>
          <div className="member-head"><h3>{m.name}</h3><span>{m.tag}</span></div>
          <p>{m.note}</p>
          <div className="months">{months.map((mo,i)=><button key={mo} className={m.paid.includes(i)?'paid':i<6?'late':'future'}>{mo}</button>)}</div>
          <div className="member-actions"><button onClick={()=>setModal({ type:'viewMember', member:m })}>Open</button><button className="danger" onClick={()=>deleteMember(m.id)}><Trash2 size={15}/>Delete</button></div>
        </div>)}</div>
      </section>}

      {active === 'Transactions' && <section className="panel"><div className="panel-title"><h2>Transactions Pro</h2><button className="primary">Add transaction</button></div><table><thead><tr><th>ID</th><th>Date</th><th>Type</th><th>Member</th><th>Category</th><th>Amount</th></tr></thead><tbody>{transactions.map(t=><tr key={t.id}><td>{t.id}</td><td>{t.date}</td><td>{t.type}</td><td>{t.member}</td><td>{t.category}</td><td className={t.amount>0?'money':'cost'}>{t.amount>0?'+':''}£{t.amount}</td></tr>)}</tbody></table></section>}

      {active === 'Reports' && <section className="grid"><div className="panel wide"><h2>Mini reports</h2><div className="filters"><input placeholder="From date"/><input placeholder="To date"/><select><option>Sort by amount</option><option>Sort by date</option><option>Sort by member</option></select><button className="primary"><Download size={16}/>Export</button></div><p>Total paid: <b>£{stats.paid.toFixed(2)}</b></p><p>Total spent: <b>£{stats.spent.toFixed(2)}</b></p><p>Balance: <b>£{stats.balance.toFixed(2)}</b></p></div></section>}

      {active === 'Stock' && <section className="stock"><StockItem name="Tea bags" qty="4 boxes" level="OK"/><StockItem name="Milk" qty="1 bottle" level="LOW"/><StockItem name="Sugar" qty="2 bags" level="OK"/><StockItem name="Biscuits" qty="0" level="LOW"/></section>}

      {active === 'Poster Studio' && <section className="poster"><div className="poster-card"><Coffee size={42}/><h1>RM Tea Club</h1><p>Premium member list</p><div>{members.map(m=><span key={m.id}>{m.name}</span>)}</div></div><button className="primary">Download poster</button></section>}

      {active === 'Settings' && <section className="panel"><h2>Settings</h2><p><b>Monthly fee:</b> £6</p><p><b>Year:</b> 2026</p><p><b>Spreadsheet reload:</b> OFF</p><p><b>Firestore overwrite:</b> OFF</p><p><b>Save mode:</b> Browser localStorage</p><button className="secondary" onClick={resetDemoData}>Reset local demo data</button></section>}
    </main>

    {modal === 'addMember' && <AddMemberModal onClose={()=>setModal(null)} onSave={addMember} />}
    {modal?.type === 'viewMember' && <InfoModal member={modal.member} onClose={()=>setModal(null)} />}
    {toast && <div className="toast">{toast}</div>}
  </div>;
}

function AddMemberModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('Active');
  const [note, setNote] = useState('');
  const [paid, setPaid] = useState([6]);

  const toggleMonth = (index) => {
    setPaid(prev => prev.includes(index) ? prev.filter(m => m !== index) : [...prev, index].sort((a,b)=>a-b));
  };

  return <div className="modal" onClick={onClose}>
    <form className="modal-card" onClick={e=>e.stopPropagation()} onSubmit={(e)=>{e.preventDefault(); onSave({ name, tag, note, paid });}}>
      <button type="button" className="close" onClick={onClose}><X size={18}/></button>
      <h2>Add new member</h2>
      <p className="muted">This one actually updates the Members list and saves after refresh.</p>
      <label>Member name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Will" /></label>
      <label>Status/tag<select value={tag} onChange={e=>setTag(e.target.value)}><option>Active</option><option>Paid ahead</option><option>Due</option><option>Admin</option><option>Test</option></select></label>
      <label>Note<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional note" /></label>
      <div className="monthPicker"><p>Paid months</p>{months.map((mo,i)=><button type="button" key={mo} onClick={()=>toggleMonth(i)} className={paid.includes(i)?'paid':'future'}>{mo}</button>)}</div>
      <div className="modal-actions"><button type="button" onClick={onClose}>Cancel</button><button type="submit" className="primary"><Save size={16}/>Save member</button></div>
    </form>
  </div>;
}

function InfoModal({ member, onClose }) {
  return <div className="modal" onClick={onClose}><div className="modal-card" onClick={e=>e.stopPropagation()}><button type="button" className="close" onClick={onClose}><X size={18}/></button><h2>{member.name}</h2><p>{member.note}</p><p><b>Status:</b> {member.tag}</p><p><b>Paid months:</b> {member.paid.map(i => months[i]).join(', ')}</p><div className="modal-actions"><button className="primary" onClick={onClose}>Close</button></div></div></div>;
}

function Stat({title, value, tone}) { return <div className={`stat ${tone||''}`}><span>{title}</span><b>{value}</b></div>; }
function StockItem({name, qty, level}) { return <div className="stock-item"><h3>{name}</h3><p>{qty}</p><span className={level==='LOW'?'low':'ok'}>{level}</span></div>; }

createRoot(document.getElementById('root')).render(<App />);
