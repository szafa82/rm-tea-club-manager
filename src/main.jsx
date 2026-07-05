import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const VERSION = 'v2.1 SAFE';
const STORAGE_KEY = 'rm-tea-club-v21-local-data';

const starterData = {
  members: [
    { id: 'abbas', name: 'Abbas', role: 'Member', paid: [0,1,2,3,4,5,6,7,8,9,10,11], notes: 'Paid until end of year' },
    { id: 'adam', name: 'Adam', role: 'Treasurer', paid: [0,1,2,3,4,5,6], notes: 'Admin' },
    { id: 'fred', name: 'Fred', role: 'Member', paid: [0,1,2,3,4,5], notes: '' },
    { id: 'paul', name: 'Paul', role: 'Member', paid: [0,1,2,3], notes: '' }
  ],
  transactions: [
    { id: 't1', date: '2026-07-01', type: 'payment', member: 'Abbas', category: 'membership', amount: 72, note: 'Paid Jan-Dec' },
    { id: 't2', date: '2026-07-02', type: 'payment', member: 'Adam', category: 'membership', amount: 6, note: 'July' },
    { id: 't3', date: '2026-07-03', type: 'expense', member: '', category: 'milk', amount: 8.5, note: 'Milk' },
    { id: 't4', date: '2026-07-04', type: 'expense', member: '', category: 'tea', amount: 12.2, note: 'Tea bags' }
  ],
  stock: [
    { id: 's1', item: 'Tea bags', category: 'Tea', qty: 2, low: 1 },
    { id: 's2', item: 'Milk', category: 'Milk', qty: 4, low: 3 },
    { id: 's3', item: 'Sugar', category: 'Sugar', qty: 1, low: 1 }
  ],
  settings: { monthlyFee: 6, year: 2026, clubName: 'RM Tea Club' }
};

function loadData(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || starterData; } catch { return starterData; }
}
function saveData(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function App(){
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState('');
  const [dark, setDark] = useState(false);

  const update = (next) => { setData(next); saveData(next); };
  const income = data.transactions.filter(t=>t.type==='payment').reduce((s,t)=>s+Number(t.amount),0);
  const expenses = data.transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
  const balance = income - expenses;
  const currentMonth = new Date().getMonth();
  const paidThisMonth = data.members.filter(m=>m.paid.includes(currentMonth)).length;
  const unpaid = data.members.length - paidThisMonth;

  const visibleMembers = useMemo(()=> data.members.filter(m=>m.name.toLowerCase().includes(query.toLowerCase())), [data.members, query]);

  return <div className={dark ? 'app dark' : 'app'}>
    <aside className="sidebar">
      <div className="brand"><div className="logo">RM</div><div><b>Tea Club</b><span>{VERSION}</span></div></div>
      {['dashboard','members','transactions','reports','stock','poster','settings'].map(x => <button className={page===x?'active':''} onClick={()=>setPage(x)} key={x}>{label(x)}</button>)}
      <button onClick={()=>setDark(!dark)}>{dark?'Light mode':'Dark mode'}</button>
    </aside>
    <main>
      <header>
        <div><h1>{label(page)}</h1><p>No spreadsheet auto-reload • No database overwrite • {VERSION}</p></div>
        <input placeholder="Search members, transactions..." value={query} onChange={e=>setQuery(e.target.value)} />
        <button className="primary" onClick={()=>setModal('quick')}>+ Quick add</button>
      </header>
      {page==='dashboard' && <Dashboard income={income} expenses={expenses} balance={balance} members={data.members.length} paid={paidThisMonth} unpaid={unpaid} data={data}/>} 
      {page==='members' && <Members members={visibleMembers} update={update} data={data} setModal={setModal}/>} 
      {page==='transactions' && <Transactions data={data} update={update} setModal={setModal}/>} 
      {page==='reports' && <Reports data={data} income={income} expenses={expenses} balance={balance}/>} 
      {page==='stock' && <Stock data={data} update={update}/>} 
      {page==='poster' && <Poster data={data}/>} 
      {page==='settings' && <Settings data={data} update={update}/>} 
    </main>
    {modal && <QuickModal modal={modal} setModal={setModal} data={data} update={update}/>} 
  </div>
}

function label(x){ return ({dashboard:'Dashboard',members:'Members',transactions:'Transactions',reports:'Reports',stock:'Stock',poster:'Poster Studio',settings:'Settings'})[x] || x; }
function money(n){ return '£' + Number(n).toFixed(2); }

function Dashboard({income, expenses, balance, members, paid, unpaid, data}){
  return <section>
    <div className="grid cards">
      <Card title="Balance" value={money(balance)} note="Current club money" />
      <Card title="Income" value={money(income)} note="All payments" />
      <Card title="Expenses" value={money(expenses)} note="All spending" />
      <Card title="Members" value={members} note={`${paid} paid this month, ${unpaid} unpaid`} />
    </div>
    <div className="panel"><h2>Latest activity</h2>{data.transactions.slice(-5).reverse().map(t=><div className="row" key={t.id}><span>{t.date}</span><b>{t.type}</b><span>{t.member || t.category}</span><strong>{money(t.amount)}</strong></div>)}</div>
    <div className="notice">Spreadsheet reload is disabled. This version will not restore original sheet data automatically.</div>
  </section>
}
function Card({title,value,note}){ return <div className="card"><span>{title}</span><strong>{value}</strong><small>{note}</small></div> }

function Members({members, data, update}){
  const toggle = (id, mIdx) => {
    const next = {...data, members: data.members.map(m => m.id===id ? {...m, paid: m.paid.includes(mIdx) ? m.paid.filter(x=>x!==mIdx) : [...m.paid, mIdx].sort((a,b)=>a-b)} : m)};
    update(next);
  };
  return <section className="panel"><h2>Members calendar</h2>{members.map(m=><div className="member" key={m.id}><div><b>{m.name}</b><span>{m.role} • {m.notes}</span></div><div className="months">{MONTHS.map((mo,i)=><button key={mo} className={m.paid.includes(i)?'paid':'unpaid'} onClick={()=>toggle(m.id,i)}>{mo}</button>)}</div></div>)}</section>
}
function Transactions({data, update, setModal}){
  return <section className="panel"><div className="panelHead"><h2>Transactions</h2><button className="primary" onClick={()=>setModal('transaction')}>Add transaction</button></div>{data.transactions.map(t=><div className="row" key={t.id}><span>{t.date}</span><b className={t.type}>{t.type}</b><span>{t.member || t.category}</span><span>{t.note}</span><strong>{money(t.amount)}</strong></div>)}</section>
}
function Reports({data,income,expenses,balance}){
  const payments = data.transactions.filter(t=>t.type==='payment');
  const spend = data.transactions.filter(t=>t.type==='expense');
  return <section className="grid two"><div className="panel"><h2>Mini report</h2><p>Total paid: <b>{money(income)}</b></p><p>Total spent: <b>{money(expenses)}</b></p><p>Balance: <b>{money(balance)}</b></p><p>Payments count: <b>{payments.length}</b></p><p>Expenses count: <b>{spend.length}</b></p></div><div className="panel"><h2>Sort/filter ready</h2><p>Next ZIP will connect this with advanced date filters, member filters and export.</p></div></section>
}
function Stock({data, update}){
  return <section className="panel"><h2>Supplies / Stock</h2>{data.stock.map(s=><div className="row" key={s.id}><b>{s.item}</b><span>{s.category}</span><span>Qty: {s.qty}</span><strong className={s.qty<=s.low?'danger':'ok'}>{s.qty<=s.low?'Low stock':'OK'}</strong></div>)}</section>
}
function Poster({data}){
  return <section className="posterWrap"><div className="poster"><div className="posterLogo">RM</div><h1>{data.settings.clubName}</h1><h2>Members</h2><div className="posterMembers">{data.members.map(m=><span key={m.id}>{m.name}</span>)}</div><p>Generated by RM Tea Club Manager {VERSION}</p></div><button onClick={()=>window.print()} className="primary">Download / Print poster</button></section>
}
function Settings({data, update}){
  return <section className="panel"><h2>Settings</h2><label>Monthly fee <input type="number" value={data.settings.monthlyFee} onChange={e=>update({...data, settings:{...data.settings, monthlyFee:Number(e.target.value)}})} /></label><label>Club name <input value={data.settings.clubName} onChange={e=>update({...data, settings:{...data.settings, clubName:e.target.value}})} /></label><div className="notice dangerBg">Original spreadsheet auto reload: OFF</div></section>
}
function QuickModal({modal,setModal,data,update}){
  const [form,setForm]=useState({date:new Date().toISOString().slice(0,10), type:'payment', member:'', category:'membership', amount:6, note:''});
  const add = () => { update({...data, transactions:[...data.transactions,{...form,id:'t'+Date.now(), amount:Number(form.amount)}]}); setModal(null); };
  return <div className="overlay" onClick={()=>setModal(null)}><div className="modal" onClick={e=>e.stopPropagation()}><h2>{modal==='transaction'?'Add transaction':'Quick add'}</h2><div className="form"><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>payment</option><option>expense</option></select><input placeholder="Member" value={form.member} onChange={e=>setForm({...form,member:e.target.value})}/><input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/><input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/><input placeholder="Note" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></div><div className="actions"><button onClick={()=>setModal(null)}>Cancel</button><button className="primary" onClick={add}>Save</button></div></div></div>
}

createRoot(document.getElementById('root')).render(<App />);
