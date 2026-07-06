import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const MEMBERS = [
  { name: 'Abbas', status: 'paid-ahead', paidUntil: 'Dec 2026', paidMonths: ['Jul','Aug','Sep','Oct','Nov','Dec'] },
  { name: 'Adam', status: 'paid', paidUntil: 'Jul 2026', paidMonths: ['Jul'] },
  { name: 'Selana', status: 'paid', paidUntil: 'Jul 2026', paidMonths: ['Jul'] },
  { name: 'Fred', status: 'due', paidUntil: 'Jun 2026', paidMonths: [] },
  { name: 'Paul', status: 'due', paidUntil: 'Jun 2026', paidMonths: [] },
  { name: 'Morgan', status: 'paid', paidUntil: 'Jul 2026', paidMonths: ['Jul'] },
  { name: 'Dan', status: 'paid', paidUntil: 'Jul 2026', paidMonths: ['Jul'] },
  { name: 'Pietro', status: 'paid-ahead', paidUntil: 'Sep 2026', paidMonths: ['Jul','Aug','Sep'] }
];

const TRANSACTIONS = [
  { id: 'T-1001', type: 'Payment', member: 'Abbas', amount: 36, date: '2026-07-01', note: 'Paid Jul-Dec' },
  { id: 'T-1002', type: 'Payment', member: 'Adam', amount: 6, date: '2026-07-02', note: 'July payment' },
  { id: 'T-1003', type: 'Expense', member: 'Tea Club', amount: -12.5, date: '2026-07-03', note: 'Milk and sugar' },
  { id: 'T-1004', type: 'Expense', member: 'Tea Club', amount: -18.2, date: '2026-07-04', note: 'Tea, coffee, biscuits' }
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function App() {
  const [tab, setTab] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);

  const stats = useMemo(() => {
    const income = TRANSACTIONS.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expense = Math.abs(TRANSACTIONS.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const paid = MEMBERS.filter(m => m.status === 'paid' || m.status === 'paid-ahead').length;
    const due = MEMBERS.length - paid;
    return { income, expense, balance: income - expense + 66.95, paid, due };
  }, []);

  const filteredMembers = MEMBERS.filter(m => m.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brandBlock">
          <div className="brandLogo">RM</div>
          <div>
            <div className="brandTitle">Tea Club</div>
            <div className="brandSub">Manager</div>
          </div>
        </div>
        <button className={tab === 'dashboard' ? 'nav active' : 'nav'} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={tab === 'members' ? 'nav active' : 'nav'} onClick={() => setTab('members')}>Members</button>
        <button className={tab === 'transactions' ? 'nav active' : 'nav'} onClick={() => setTab('transactions')}>Transactions</button>
        <button className={tab === 'reports' ? 'nav active' : 'nav'} onClick={() => setTab('reports')}>Reports</button>
        <button className={tab === 'poster' ? 'nav active' : 'nav'} onClick={() => setTab('poster')}>Poster</button>
        <div className="versionBox">Change 01<br /><strong>Dashboard rebuild</strong><br />Spreadsheet reload OFF</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">Royal Mail • RM Engineering</div>
            <h1>RM Tea Club Manager</h1>
            <p>New dashboard test build. No spreadsheet reload. No Firestore overwrite.</p>
          </div>
          <button className="primary" onClick={() => setModal('quick')}>+ Quick action</button>
        </header>

        {tab === 'dashboard' && <Dashboard stats={stats} />}
        {tab === 'members' && <Members query={query} setQuery={setQuery} members={filteredMembers} />}
        {tab === 'transactions' && <Transactions />}
        {tab === 'reports' && <Reports stats={stats} />}
        {tab === 'poster' && <Poster />}
      </main>

      {modal && (
        <div className="modalBackdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Quick action</h2>
            <p>This is the first real modal test. Next step: Add member, Add payment and Add expense forms.</p>
            <div className="modalGrid">
              <button>Add payment</button>
              <button>Add expense</button>
              <button>Add member</button>
              <button>Generate poster</button>
            </div>
            <button className="primary full" onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ stats }) {
  return (
    <section>
      <div className="heroCard">
        <div>
          <h2>Command Centre</h2>
          <p>Visible rebuild: if you can see this card, the update is working.</p>
        </div>
        <div className="statusPill">v4 CHANGE 01 LIVE</div>
      </div>

      <div className="statGrid">
        <Stat label="Kitty balance" value={`£${stats.balance.toFixed(2)}`} />
        <Stat label="Income total" value={`£${stats.income.toFixed(2)}`} />
        <Stat label="Expenses" value={`£${stats.expense.toFixed(2)}`} />
        <Stat label="Paid members" value={stats.paid} />
        <Stat label="Outstanding" value={stats.due} warning />
      </div>

      <div className="panelGrid">
        <div className="panel">
          <h3>Today’s focus</h3>
          <p>Fix data model first, then make the interface premium.</p>
          <ul>
            <li>Spreadsheet reload button removed from dashboard.</li>
            <li>Abbas is treated as paid ahead, not owing July.</li>
            <li>Future Firestore sync will not overwrite existing records.</li>
          </ul>
        </div>
        <div className="panel">
          <h3>Payment completion</h3>
          <div className="progress"><span style={{ width: '75%' }} /></div>
          <p>6 of 8 sample members paid or paid ahead.</p>
        </div>
      </div>
    </section>
  );
}

function Members({ query, setQuery, members }) {
  return (
    <section>
      <div className="sectionHead">
        <h2>Members calendar</h2>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search member..." />
      </div>
      <div className="memberGrid">
        {members.map(member => (
          <div className="memberCard" key={member.name}>
            <div className="memberTop">
              <h3>{member.name}</h3>
              <span className={`badge ${member.status}`}>{member.status === 'paid-ahead' ? 'paid ahead' : member.status}</span>
            </div>
            <p>Paid until: <strong>{member.paidUntil}</strong></p>
            <div className="months">
              {MONTHS.map(month => <span key={month} className={member.paidMonths.includes(month) ? 'month paid' : month === 'Jul' ? 'month current' : 'month'}>{month}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Transactions() {
  return (
    <section className="panel">
      <h2>Transactions</h2>
      <table>
        <thead><tr><th>ID</th><th>Date</th><th>Type</th><th>Member</th><th>Note</th><th>Amount</th></tr></thead>
        <tbody>{TRANSACTIONS.map(t => <tr key={t.id}><td>{t.id}</td><td>{t.date}</td><td>{t.type}</td><td>{t.member}</td><td>{t.note}</td><td className={t.amount < 0 ? 'negative' : 'positive'}>{t.amount < 0 ? '-' : '+'}£{Math.abs(t.amount).toFixed(2)}</td></tr>)}</tbody>
      </table>
    </section>
  );
}

function Reports({ stats }) {
  return (
    <section className="panel">
      <h2>Reports preview</h2>
      <div className="reportRow"><span>From / To</span><strong>July 2026</strong></div>
      <div className="reportRow"><span>Total paid</span><strong>£{stats.income.toFixed(2)}</strong></div>
      <div className="reportRow"><span>Total spent</span><strong>£{stats.expense.toFixed(2)}</strong></div>
      <div className="reportRow"><span>Balance after period</span><strong>£{stats.balance.toFixed(2)}</strong></div>
    </section>
  );
}

function Poster() {
  return (
    <section className="posterCard">
      <div className="posterInner">
        <div className="posterLogo">RM</div>
        <h2>TEA CLUB</h2>
        <p>Members list • Payments • Supplies</p>
        <div className="posterMembers">Abbas • Adam • Selana • Fred • Paul • Morgan • Dan • Pietro</div>
      </div>
    </section>
  );
}

function Stat({ label, value, warning }) {
  return <div className={warning ? 'stat warning' : 'stat'}><span>{label}</span><strong>{value}</strong></div>;
}

createRoot(document.getElementById('root')).render(<App />);
