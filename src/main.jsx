import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Home, Users, CreditCard, ShoppingCart, BarChart3, Package, Image, Settings, Plus, Search, X, Download, Bell, Moon, Sun, ShieldCheck} from 'lucide-react';
import './style.css';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const paidAll = months.reduce((a,m,i)=>({...a,[`2026-${String(i+1).padStart(2,'0')}`]:true}),{});
const seed = {
  members:[
    {id:'m1',name:'Abbas',role:'Member',paid:paidAll,notes:'Paid until end of year',pinned:true},
    {id:'m2',name:'Adam',role:'Treasurer',paid:{'2026-07':true,'2026-08':true},notes:'Admin account',pinned:true},
    {id:'m3',name:'Fred',role:'Member',paid:{'2026-07':true},notes:'Chicken fan'},
    {id:'m4',name:'Paul',role:'Member',paid:{},notes:'Needs July payment'}
  ],
  transactions:[
    {id:'t1',type:'payment',member:'Abbas',category:'membership',amount:72,date:'2026-07-01',note:'Full year payment'},
    {id:'t2',type:'payment',member:'Adam',category:'membership',amount:12,date:'2026-07-02',note:'July + August'},
    {id:'t3',type:'expense',member:'Adam',category:'milk',amount:8.5,date:'2026-07-03',note:'Milk restock'},
    {id:'t4',type:'expense',member:'Adam',category:'tea',amount:14.25,date:'2026-07-04',note:'Tea bags'}
  ],
  stock:[
    {id:'s1',item:'Tea bags',qty:2,min:1,category:'Tea'},
    {id:'s2',item:'Coffee',qty:1,min:1,category:'Coffee'},
    {id:'s3',item:'Milk',qty:0,min:2,category:'Milk'},
    {id:'s4',item:'Sugar',qty:3,min:1,category:'Sugar'}
  ],
  audit:[
    {id:'a1',text:'v3 SAFE loaded - spreadsheet reload disabled',date:new Date().toLocaleString()},
    {id:'a2',text:'Local data only - Firestore overwrite disabled',date:new Date().toLocaleString()}
  ],
  settings:{monthlyFee:6,currency:'£',clubName:'RM Tea Club',year:2026,theme:'royal'}
};
function load(){try{return JSON.parse(localStorage.getItem('rmtea-v3'))||seed}catch{return seed}}
function save(data){localStorage.setItem('rmtea-v3',JSON.stringify(data))}
function App(){
 const [data,setData]=useState(load); const [view,setView]=useState('dashboard'); const [modal,setModal]=useState(null); const [q,setQ]=useState(''); const [dark,setDark]=useState(false);
 function update(fn){setData(d=>{const n=fn(structuredClone(d)); save(n); return n})}
 const stats=useMemo(()=>{const paid=data.transactions.filter(t=>t.type==='payment').reduce((s,t)=>s+Number(t.amount),0); const spent=data.transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0); const current='2026-07'; const ok=data.members.filter(m=>m.paid?.[current]).length; return {paid,spent,balance:paid-spent,ok,due:data.members.length-ok,low:data.stock.filter(s=>Number(s.qty)<=Number(s.min)).length}},[data]);
 const nav=[['dashboard',Home,'Dashboard'],['members',Users,'Members'],['transactions',CreditCard,'Transactions'],['expenses',ShoppingCart,'Expenses'],['reports',BarChart3,'Reports'],['stock',Package,'Stock'],['poster',Image,'Poster Studio'],['settings',Settings,'Settings']];
 const filteredMembers=data.members.filter(m=>m.name.toLowerCase().includes(q.toLowerCase()));
 return <div className={dark?'app dark':'app'}>
  <aside className="sidebar"><div className="brand"><div className="logo">RM</div><div><b>{data.settings.clubName}</b><span>Manager v3 SAFE</span></div></div>{nav.map(([id,Icon,label])=><button key={id} className={view===id?'active':''} onClick={()=>setView(id)}><Icon size={18}/>{label}</button>)}<div className="safe"><ShieldCheck size={18}/> Spreadsheet reload OFF<br/>Firestore overwrite OFF</div></aside>
  <main><header><div className="search"><Search size={18}/><input placeholder="Search members, payments, stock..." value={q} onChange={e=>setQ(e.target.value)}/></div><button className="icon" onClick={()=>setDark(!dark)}>{dark?<Sun/>:<Moon/>}</button><button className="icon"><Bell/></button><button className="primary" onClick={()=>setModal('quick')}><Plus size={18}/> Quick add</button></header>
  <section className="hero"><div><p>Enterprise dashboard</p><h1>RM Tea Club Manager</h1><span className="badge">v3 SAFE • no auto spreadsheet reload • local-only test data</span></div><div className="version">v3</div></section>
  {view==='dashboard'&&<Dashboard stats={stats} data={data} setView={setView}/>} 
  {view==='members'&&<Members members={filteredMembers} update={update} setModal={setModal}/>} 
  {view==='transactions'&&<Transactions data={data} update={update} setModal={setModal}/>} 
  {view==='expenses'&&<Expenses data={data} setModal={setModal}/>} 
  {view==='reports'&&<Reports data={data} stats={stats} setModal={setModal}/>} 
  {view==='stock'&&<Stock data={data} update={update} setModal={setModal}/>} 
  {view==='poster'&&<Poster data={data}/>} 
  {view==='settings'&&<SettingsPage data={data} update={update}/>} 
  </main>{modal&&<Modal name={modal} close={()=>setModal(null)} data={data} update={update}/>}</div>
}
function Card({title,value,sub}){return <div className="card"><p>{title}</p><h2>{value}</h2><span>{sub}</span></div>}
function Dashboard({stats,data,setView}){return <><div className="grid stats"><Card title="Balance" value={`£${stats.balance.toFixed(2)}`} sub="income minus expenses"/><Card title="Members" value={data.members.length} sub={`${stats.ok} paid this month`}/><Card title="Outstanding" value={stats.due} sub="July status"/><Card title="Low stock" value={stats.low} sub="needs attention"/></div><div className="grid two"><div className="panel"><h3>Recent activity</h3>{data.transactions.slice(-5).reverse().map(t=><div className="row" key={t.id}><span>{t.type==='payment'?'💷':'🛒'} {t.note}</span><b>{t.type==='payment'?'+':'-'}£{t.amount}</b></div>)}</div><div className="panel"><h3>Smart alerts</h3><div className="alert">⚠ {stats.due} members unpaid for July</div><div className="alert">⚠ {stats.low} stock items low</div><div className="ok">✓ Spreadsheet auto reload disabled</div><button onClick={()=>setView('reports')}>Open reports</button></div></div></>}
function Members({members,update,setModal}){return <div className="panel"><div className="panelHead"><h3>Members calendar</h3><button onClick={()=>setModal('member')}>Add member</button></div><div className="memberGrid">{members.map(m=><div className="member" key={m.id}><div className="memberTop"><b>{m.pinned?'⭐ ':''}{m.name}</b><span>{m.role}</span></div><div className="calendar">{months.map((mo,i)=>{const key=`2026-${String(i+1).padStart(2,'0')}`;return <button key={mo} className={m.paid?.[key]?'paid':i<6?'late':'future'} onClick={()=>update(d=>{const mm=d.members.find(x=>x.id===m.id); mm.paid=mm.paid||{}; mm.paid[key]=!mm.paid[key]; d.audit.unshift({id:Date.now(),text:`Toggled ${m.name} ${mo}`,date:new Date().toLocaleString()}); return d})}>{mo}</button>})}</div><small>{m.notes}</small></div>)}</div></div>}
function Transactions({data,setModal}){return <div className="panel"><div className="panelHead"><h3>Transactions</h3><button onClick={()=>setModal('transaction')}>Add transaction</button></div><table><tbody>{data.transactions.map(t=><tr key={t.id}><td>{t.date}</td><td>{t.type}</td><td>{t.member}</td><td>{t.category}</td><td><b>{t.type==='payment'?'+':'-'}£{t.amount}</b></td><td>{t.note}</td></tr>)}</tbody></table></div>}
function Expenses({data,setModal}){const expenses=data.transactions.filter(t=>t.type==='expense'); return <div className="panel"><div className="panelHead"><h3>Expenses</h3><button onClick={()=>setModal('expense')}>Add expense</button></div>{expenses.map(e=><div className="row" key={e.id}><span>{e.date} • {e.category} • {e.note}</span><b>£{e.amount}</b></div>)}</div>}
function Reports({data,stats,setModal}){return <div className="panel"><div className="panelHead"><h3>Reports PRO</h3><button onClick={()=>setModal('report')}>Preview report</button></div><div className="grid stats"><Card title="Total paid" value={`£${stats.paid.toFixed(2)}`} sub="all payments"/><Card title="Total spent" value={`£${stats.spent.toFixed(2)}`} sub="all expenses"/><Card title="Net balance" value={`£${stats.balance.toFixed(2)}`} sub="current"/><Card title="Average payment" value={`£${(stats.paid/Math.max(1,data.transactions.filter(t=>t.type==='payment').length)).toFixed(2)}`} sub="per payment"/></div><div className="bar"><span style={{width:`${Math.min(100,stats.paid)}%`}}></span></div><p>Filters planned: date from/to, member, type, category, amount, newest/oldest.</p></div>}
function Stock({data,setModal}){return <div className="panel"><div className="panelHead"><h3>Stock / Supplies</h3><button onClick={()=>setModal('stock')}>Add stock</button></div><div className="stockGrid">{data.stock.map(s=><div className={s.qty<=s.min?'stock low':'stock'} key={s.id}><b>{s.item}</b><span>{s.category}</span><h2>{s.qty}</h2><small>minimum {s.min}</small></div>)}</div></div>}
function Poster({data}){function dl(){const blob=new Blob([document.getElementById('poster').outerHTML],{type:'text/html'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='rm-tea-club-poster.html'; a.click()} return <div className="panel"><div className="panelHead"><h3>Poster Studio</h3><button onClick={dl}><Download size={16}/> Download</button></div><div id="poster" className="poster"><h1>RM Tea Club</h1><p>Members list • 2026</p><div>{data.members.map(m=><span key={m.id}>{m.name}</span>)}</div><footer>Generated by RM Tea Club Manager v3 SAFE</footer></div></div>}
function SettingsPage({data,update}){return <div className="panel"><h3>Settings</h3><label>Club name<input value={data.settings.clubName} onChange={e=>update(d=>{d.settings.clubName=e.target.value; return d})}/></label><label>Monthly fee<input type="number" value={data.settings.monthlyFee} onChange={e=>update(d=>{d.settings.monthlyFee=Number(e.target.value); return d})}/></label><h3>Audit log</h3>{data.audit.map(a=><div className="row" key={a.id}><span>{a.text}</span><small>{a.date}</small></div>)}</div>}
function Modal({name,close,data,update}){const title={quick:'Quick add',member:'Add member',transaction:'Add transaction',expense:'Add expense',stock:'Add stock',report:'Report preview'}[name]||name; function addDemo(){update(d=>{d.audit.unshift({id:Date.now(),text:`${title} modal used`,date:new Date().toLocaleString()}); return d}); close()} return <div className="overlay"><div className="modal"><button className="close" onClick={close}><X/></button><h2>{title}</h2><p>This is a SAFE modal. It writes only to local browser storage in v3.</p>{name==='quick'&&<div className="quick"><button onClick={()=>alert('Member modal ready')}>Add member</button><button onClick={()=>alert('Payment modal ready')}>Add payment</button><button onClick={()=>alert('Expense modal ready')}>Add expense</button></div>}<button className="primary" onClick={addDemo}>Save demo action</button></div></div>}
createRoot(document.getElementById('root')).render(<App/>);
