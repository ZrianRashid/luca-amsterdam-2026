/* global React, ReactDOM */
const { useState, useEffect, useMemo, useCallback, useRef } = React;
const sb = () => window.LUCA_supabase;

// ─────────────────────────────  Toasts  ─────────────────────────────
const ToastCtx = React.createContext({ push: () => {} });
function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, kind = 'ok', ttl = 3500) => {
    const id = Math.random().toString(36).slice(2);
    setItems(arr => [...arr, { id, message, kind }]);
    setTimeout(() => setItems(arr => arr.filter(x => x.id !== id)), ttl);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toast-host">
        {items.map(t => <div key={t.id} className={`toast toast--${t.kind}`}>{t.message}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => React.useContext(ToastCtx);

// ─────────────────────────────  Router  ─────────────────────────────
function useHash() {
  const [hash, setHash] = useState(() => location.hash || '#/bookings');
  useEffect(() => {
    const h = () => setHash(location.hash || '#/bookings');
    window.addEventListener('hashchange', h);
    if (!location.hash) location.hash = '#/bookings';
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return hash;
}
const navigate = (h) => { location.hash = h; };

// ─────────────────────────────  Auth  ─────────────────────────────
function useAuth() {
  const [state, setState] = useState({ loading: true, user: null, profile: null });
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await sb().auth.getSession();
      if (!session) { if (mounted) setState({ loading: false, user: null, profile: null }); return; }
      const { data: profile } = await sb().from('admin_profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (mounted) setState({ loading: false, user: session.user, profile });
    })();
    const { data: sub } = sb().auth.onAuthStateChange(async (_evt, session) => {
      if (!session) { setState({ loading: false, user: null, profile: null }); return; }
      const { data: profile } = await sb().from('admin_profiles').select('*').eq('id', session.user.id).maybeSingle();
      setState({ loading: false, user: session.user, profile });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);
  return state;
}

// ─────────────────────────────  Helpers  ─────────────────────────────
const cents = (c) => `€${(c / 100).toFixed(c % 100 === 0 ? 0 : 2)}`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
const fmtDateTime = (iso) => `${fmtDate(iso)} · ${fmtTime(iso)}`;
const STATUSES = ['pending','confirmed','cancelled','no_show','completed'];

function classNames(...x) { return x.filter(Boolean).join(' '); }

async function bearer() {
  const { data: { session } } = await sb().auth.getSession();
  return session?.access_token;
}

async function authedFetch(url, opts = {}) {
  const token = await bearer();
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}), Authorization: `Bearer ${token}` },
  });
}

// ─────────────────────────────  Login screen  ─────────────────────────────
function Login() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await sb().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    toast.push('Signed in');
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={onSubmit}>
        <div className="login__brand">LUCA · ADMIN</div>
        <div className="login__title">Sign in</div>
        <div className="login__sub">Use your operator email + password.</div>
        <label className="login__field">
          <label>Email</label>
          <input type="email" autoFocus required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@luca-amsterdam.nl" />
        </label>
        <label className="login__field">
          <label>Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        {err && <p className="login__error">{err}</p>}
        <button type="submit" className="btn btn--primary login__submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────  Shell  ─────────────────────────────
function Shell({ auth }) {
  const hash = useHash();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Keyboard
  useEffect(() => {
    let lastG = 0;
    function onKey(e) {
      const t = e.target;
      const inField = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      // ⌘K / Ctrl+K — palette
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); setPaletteOpen(o => !o); return; }
      if (inField) return;
      // g <letter>
      if (e.key === 'g') { lastG = Date.now(); return; }
      if (Date.now() - lastG < 800) {
        if (e.key === 'b') { navigate('#/bookings'); lastG = 0; return; }
        if (e.key === 'c') { navigate('#/customers'); lastG = 0; return; }
        if (e.key === 's') { navigate('#/schedule'); lastG = 0; return; }
        if (e.key === 'i') { navigate('#/import'); lastG = 0; return; }
        if (e.key === 'h') { navigate('#/hermes'); lastG = 0; return; }
      }
      if (e.key === '?') { setPaletteOpen(true); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  let page = null;
  const cleanHash = hash.split('?')[0];
  if (cleanHash.startsWith('#/bookings')) page = <BookingsPage />;
  else if (cleanHash.startsWith('#/schedule')) page = <SchedulePage />;
  else if (cleanHash.startsWith('#/customers')) page = <CustomersPage />;
  else if (cleanHash.startsWith('#/import')) page = <ImportPage />;
  else if (cleanHash.startsWith('#/hermes')) page = <HermesPage />;
  else page = <BookingsPage />;

  return (
    <div className="app">
      <Sidebar auth={auth} onPalette={() => setPaletteOpen(true)} hash={cleanHash} />
      <div className="main">
        {page}
      </div>
      {paletteOpen && <Palette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}

function Sidebar({ auth, onPalette, hash }) {
  const items = [
    { id: 'bookings',  label: 'Bookings',   route: '#/bookings',  key: 'g b' },
    { id: 'schedule',  label: 'Schedule',   route: '#/schedule',  key: 'g s' },
    { id: 'customers', label: 'Customers',  route: '#/customers', key: 'g c' },
    { id: 'import',    label: 'Import',     route: '#/import',    key: 'g i' },
    { id: 'hermes',    label: 'Hermes',     route: '#/hermes',    key: 'g h' },
  ];
  async function signOut() {
    await sb().auth.signOut();
  }
  return (
    <aside className="side">
      <div className="side__brand"><span className="side__brand-dot"></span> LUCA · ADMIN</div>
      <div className="side__group">Workspace</div>
      {items.map(item => (
        <a
          key={item.id}
          className={classNames('side__item', hash.startsWith(item.route) && 'is-active')}
          href={item.route}
        >
          <span>{item.label}</span>
          <span className="side__item-key">{item.key}</span>
        </a>
      ))}
      <div className="side__spacer" />
      <div className="side__foot">
        <button onClick={onPalette}>⌘K · Command palette</button>
        <div style={{color:'var(--muted)',fontSize:12,marginTop:4}}>{auth.user?.email}</div>
        <button onClick={signOut}>Sign out</button>
      </div>
    </aside>
  );
}

function TopBar({ title, sub, right }) {
  return (
    <div className="topbar">
      <div>
        <div className="topbar__title">{title}</div>
        {sub && <div className="topbar__sub">{sub}</div>}
      </div>
      <div className="topbar__right">{right}</div>
    </div>
  );
}

// ─────────────────────────────  Palette  ─────────────────────────────
function Palette({ onClose }) {
  const [q, setQ] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const all = useMemo(() => ([
    { id: 'go-bookings',  label: 'Go to bookings',   sub: 'g b', action: () => { navigate('#/bookings'); onClose(); } },
    { id: 'go-schedule',  label: 'Go to schedule',   sub: 'g s', action: () => { navigate('#/schedule'); onClose(); } },
    { id: 'go-customers', label: 'Go to customers',  sub: 'g c', action: () => { navigate('#/customers'); onClose(); } },
    { id: 'go-import',    label: 'Go to import',     sub: 'g i', action: () => { navigate('#/import'); onClose(); } },
    { id: 'go-hermes',    label: 'Go to Hermes',     sub: 'g h', action: () => { navigate('#/hermes'); onClose(); } },
    { id: 'today',        label: 'Schedule — today', sub: '',    action: () => { navigate('#/schedule'); onClose(); } },
    { id: 'help',         label: 'Keyboard shortcuts', sub: '?', action: () => alert('Shortcuts:\n⌘K — palette\ng b — bookings\ng s — schedule\ng c — customers\ng i — import\ng h — hermes\nj/k — move in list\ne — edit/open\nx — cancel\nesc — close drawer/palette') },
  ]), [onClose]);
  const filtered = q.trim()
    ? all.filter(i => i.label.toLowerCase().includes(q.toLowerCase()))
    : all;
  useEffect(() => {
    function key(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(filtered.length - 1, i + 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setFocusIdx(i => Math.max(0, i - 1)); }
      if (e.key === 'Enter')     { e.preventDefault(); filtered[focusIdx]?.action(); }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [filtered, focusIdx, onClose]);
  return (
    <div className="palette" onClick={(e) => { if (e.target.classList.contains('palette')) onClose(); }}>
      <div className="palette__panel">
        <input className="palette__input" autoFocus placeholder="Search commands…" value={q} onChange={e => { setQ(e.target.value); setFocusIdx(0); }} />
        <div className="palette__list">
          {filtered.map((it, i) => (
            <div key={it.id} className={classNames('palette__item', i === focusIdx && 'is-focus')}
              onMouseEnter={() => setFocusIdx(i)}
              onClick={it.action}>
              <span>{it.label}</span>
              {it.sub && <span className="palette__item-sub">{it.sub}</span>}
            </div>
          ))}
          {!filtered.length && <div className="palette__item" style={{color:'var(--muted)'}}>No matches</div>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────  Bookings page  ─────────────────────────────
function BookingsPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [focus, setFocus] = useState(0);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    let q = sb().from('booking_with_customer')
      .select('*')
      .order('start_at', { ascending: false })
      .limit(500);
    if (status !== 'all') q = q.eq('status', status);
    if (from) q = q.gte('start_at', new Date(from).toISOString());
    if (to)   q = q.lte('start_at', new Date(to + 'T23:59:59').toISOString());
    const { data, error } = await q;
    if (error) { toast.push(error.message, 'err'); setRows([]); }
    else setRows(data || []);
    setLoading(false);
  }, [status, from, to]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(r =>
      (r.reference || '').toLowerCase().includes(q) ||
      (r.customer_email || '').toLowerCase().includes(q) ||
      (r.customer_name || '').toLowerCase().includes(q) ||
      (r.service_name_en || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  // List nav with j/k, e to open
  useEffect(() => {
    function key(e) {
      const t = e.target; if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA') return;
      if (e.key === 'j') { setFocus(i => Math.min(filtered.length - 1, i + 1)); }
      else if (e.key === 'k') { setFocus(i => Math.max(0, i - 1)); }
      else if (e.key === 'e' || e.key === 'Enter') { const r = filtered[focus]; if (r) setOpenId(r.id); }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [filtered, focus]);

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today.getTime() + 86400000);
    const todays = rows.filter(r => new Date(r.start_at) >= today && new Date(r.start_at) < tomorrow);
    const upcoming = rows.filter(r => new Date(r.start_at) >= today && r.status !== 'cancelled');
    const revenue = rows.filter(r => r.status === 'confirmed' || r.status === 'completed').reduce((a, r) => a + (r.total_cents || 0), 0);
    return {
      today: todays.length,
      upcoming: upcoming.length,
      cancelled: rows.filter(r => r.status === 'cancelled').length,
      revenue: cents(revenue),
    };
  }, [rows]);

  return (
    <>
      <TopBar
        title="Bookings"
        sub={loading ? 'Loading…' : `${filtered.length} of ${rows.length} bookings`}
        right={<>
          <div className="searchbox">
            <svg className="searchbox__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
            <input placeholder="Reference, email, name…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn" onClick={load} title="Refresh">↻</button>
        </>}
      />
      <div className="content">
        <div className="stats">
          <div className="stat-card"><div className="stat-card__label">Today</div><div className="stat-card__value">{stats.today}</div></div>
          <div className="stat-card"><div className="stat-card__label">Upcoming</div><div className="stat-card__value">{stats.upcoming}</div></div>
          <div className="stat-card"><div className="stat-card__label">Cancelled</div><div className="stat-card__value">{stats.cancelled}</div></div>
          <div className="stat-card"><div className="stat-card__label">Revenue (visible)</div><div className="stat-card__value">{stats.revenue}</div></div>
        </div>

        <div className="filters">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <input type="date" value={to}   onChange={e => setTo(e.target.value)} />
          {(status !== 'all' || from || to) && (
            <span className="filters__pill">
              {status !== 'all' && <span>status: {status}</span>}
              {from && <span>from: {from}</span>}
              {to && <span>to: {to}</span>}
              <button onClick={() => { setStatus('all'); setFrom(''); setTo(''); }}>×</button>
            </span>
          )}
        </div>

        {loading ? null : !filtered.length ? (
          <div className="empty">
            <div className="empty__h">No bookings match these filters</div>
            <p>Clear filters, or wait for the first one to come in.</p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Start</th>
                <th>Guests</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className={classNames('row', i === focus && 'is-focus')} onClick={() => setOpenId(r.id)}>
                  <td className="mono shrink">{r.reference}</td>
                  <td>
                    <div style={{fontWeight:500}}>{r.customer_name || '—'}</div>
                    <div style={{color:'var(--muted)',fontSize:12}}>{r.customer_email}</div>
                  </td>
                  <td>{r.service_name_en} · <span style={{color:'var(--muted)'}}>{r.service_duration_min}m</span></td>
                  <td>{fmtDateTime(r.start_at)}</td>
                  <td>{r.guests}</td>
                  <td>{cents(r.total_cents)}</td>
                  <td><span className={`chip chip--${r.status}`}>{r.status.replace('_',' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {openId && <BookingDrawer id={openId} onClose={() => setOpenId(null)} onChange={load} />}
    </>
  );
}

function BookingDrawer({ id, onClose, onChange }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    (async () => {
      const { data: row, error } = await sb().from('booking_with_customer').select('*').eq('id', id).maybeSingle();
      if (error) { toast.push(error.message, 'err'); return; }
      setData(row); setAdminNotes(row?.admin_notes || '');
    })();
  }, [id]);

  useEffect(() => {
    function k(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'x' && data && data.status !== 'cancelled') changeStatus('cancelled');
    }
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [data]);

  async function changeStatus(next) {
    if (!data) return;
    const prev = data.status;
    setData({ ...data, status: next }); // optimistic
    setBusy(true);
    const { error } = await sb().from('bookings').update({ status: next, ...(next === 'cancelled' ? { cancelled_at: new Date().toISOString(), cancelled_reason: 'admin' } : {}) }).eq('id', id);
    setBusy(false);
    if (error) {
      setData({ ...data, status: prev });
      toast.push('Could not update: ' + error.message, 'err');
    } else {
      toast.push(`Status → ${next.replace('_',' ')}`);
      onChange && onChange();
    }
  }

  async function saveNotes() {
    setBusy(true);
    const { error } = await sb().from('bookings').update({ admin_notes: adminNotes }).eq('id', id);
    setBusy(false);
    if (error) toast.push(error.message, 'err');
    else { toast.push('Notes saved'); setEditing(false); onChange && onChange(); }
  }

  if (!data) return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer"><div className="drawer__body" style={{color:'var(--muted)'}}>Loading…</div></aside>
    </>
  );

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer__head">
          <span className="mono" style={{fontFamily:'JetBrains Mono, monospace',fontSize:12,color:'var(--muted)'}}>{data.reference}</span>
          <span className={`chip chip--${data.status}`}>{data.status.replace('_',' ')}</span>
          <button className="drawer__close" onClick={onClose}>esc</button>
        </div>
        <div className="drawer__body">
          <div style={{marginBottom:14}}>
            <div style={{fontSize:16,fontWeight:600,marginBottom:2}}>{data.customer_name || '—'}</div>
            <div style={{color:'var(--muted)',fontSize:13}}>{data.customer_email}{data.customer_phone ? ` · ${data.customer_phone}` : ''}</div>
          </div>
          <div className="kv">
            <div className="kv__k">Service</div><div className="kv__v">{data.service_name_en} · {data.service_duration_min}m</div>
            <div className="kv__k">When</div><div className="kv__v">{fmtDateTime(data.start_at)}</div>
            <div className="kv__k">Guests</div><div className="kv__v">{data.guests}</div>
            <div className="kv__k">Total</div><div className="kv__v">{cents(data.total_cents)}</div>
            <div className="kv__k">Source</div><div className="kv__v">{data.source}</div>
            <div className="kv__k">Created</div><div className="kv__v">{fmtDateTime(data.created_at)}</div>
            {data.notes && (<><div className="kv__k">Notes</div><div className="kv__v">{data.notes}</div></>)}
          </div>

          <div style={{marginTop:18}}>
            <div style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',marginBottom:6}}>Admin notes</div>
            {editing ? (
              <>
                <textarea rows={4} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} style={{width:'100%'}} />
                <div style={{display:'flex',gap:6,marginTop:6}}>
                  <button className="btn btn--primary" onClick={saveNotes} disabled={busy}>Save</button>
                  <button className="btn btn--ghost" onClick={() => { setAdminNotes(data.admin_notes || ''); setEditing(false); }}>Cancel</button>
                </div>
              </>
            ) : (
              <div style={{padding:'8px 0',color:adminNotes?'var(--text)':'var(--muted)',fontSize:13}}>
                {adminNotes || '— none —'}
                <button className="btn btn--ghost" style={{marginLeft:8,fontSize:11}} onClick={() => setEditing(true)}>edit</button>
              </div>
            )}
          </div>
        </div>
        <div className="drawer__foot">
          {data.status !== 'confirmed' && <button className="btn" onClick={() => changeStatus('confirmed')} disabled={busy}>Confirm</button>}
          {data.status !== 'completed' && <button className="btn" onClick={() => changeStatus('completed')} disabled={busy}>Mark completed</button>}
          {data.status !== 'no_show'   && <button className="btn" onClick={() => changeStatus('no_show')}   disabled={busy}>No-show</button>}
          {data.status !== 'cancelled' && <button className="btn btn--danger" onClick={() => changeStatus('cancelled')} disabled={busy}>Cancel (x)</button>}
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────  Schedule page  ─────────────────────────────
function SchedulePage() {
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [view, setView] = useState('week'); // 'week' | 'day'
  const [dayDate, setDayDate] = useState(() => isoDay(new Date()));

  function startOfWeek(d) {
    const x = new Date(d); x.setHours(0,0,0,0);
    const dow = (x.getDay() + 6) % 7; // Mon=0
    x.setDate(x.getDate() - dow);
    return x;
  }
  function isoDay(d) { return new Date(d).toISOString().slice(0,10); }

  const range = useMemo(() => {
    if (view === 'day') {
      const start = new Date(dayDate + 'T00:00:00');
      const end   = new Date(start.getTime() + 86400000);
      return { start, end };
    }
    const start = new Date(weekStart);
    const end = new Date(start.getTime() + 7 * 86400000);
    return { start, end };
  }, [view, weekStart, dayDate]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb().from('booking_with_customer')
      .select('*')
      .gte('start_at', range.start.toISOString())
      .lt('start_at', range.end.toISOString())
      .order('start_at', { ascending: true });
    if (error) { toast.push(error.message, 'err'); setRows([]); }
    else setRows(data || []);
    setLoading(false);
  }, [range.start.getTime(), range.end.getTime()]);

  useEffect(() => { load(); }, [load]);

  const byDay = useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      const k = isoDay(r.start_at);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(r);
    }
    return m;
  }, [rows]);

  return (
    <>
      <TopBar
        title="Schedule"
        sub={loading ? 'Loading…' : `${rows.length} reservations`}
        right={<>
          <div className="btn-row">
            <button className={classNames('btn', view==='week' && 'btn--primary')} onClick={() => setView('week')}>Week</button>
            <button className={classNames('btn', view==='day' && 'btn--primary')} onClick={() => setView('day')}>Day</button>
          </div>
          {view === 'week' ? (
            <div className="btn-row">
              <button className="btn" onClick={() => setWeekStart(new Date(weekStart.getTime() - 7*86400000))}>←</button>
              <button className="btn" onClick={() => setWeekStart(startOfWeek(new Date()))}>Today</button>
              <button className="btn" onClick={() => setWeekStart(new Date(weekStart.getTime() + 7*86400000))}>→</button>
            </div>
          ) : (
            <input type="date" value={dayDate} onChange={e => setDayDate(e.target.value)} />
          )}
        </>}
      />
      <div className="content">
        {view === 'week' ? (
          <div className="schedule-week">
            {Array.from({length:7}, (_,i) => {
              const d = new Date(weekStart.getTime() + i*86400000);
              const key = isoDay(d);
              const today = key === isoDay(new Date());
              const events = byDay.get(key) || [];
              return (
                <div key={key} className={classNames('schedule-day', today && 'is-today')}>
                  <div className="schedule-day__head">
                    <span className="schedule-day__date">{d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}</span>
                    <span>{events.length}</span>
                  </div>
                  {events.map(ev => (
                    <div key={ev.id} className="schedule-event" onClick={() => setOpenId(ev.id)}>
                      <div className="schedule-event__time">{fmtTime(ev.start_at)} · {ev.service_duration_min}m</div>
                      <div className="schedule-event__name">{ev.customer_name || '—'}</div>
                      <div style={{color:'var(--muted)',fontSize:11}}>{ev.service_name_en}</div>
                    </div>
                  ))}
                  {!events.length && <div style={{color:'var(--muted)',fontSize:11,padding:'8px 4px'}}>No bookings</div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="schedule-day-detail">
            <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>{new Date(dayDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            {(byDay.get(dayDate) || []).length ? (
              <table className="tbl">
                <thead><tr><th>Time</th><th>Customer</th><th>Service</th><th>Guests</th><th>Status</th></tr></thead>
                <tbody>
                  {(byDay.get(dayDate) || []).map(ev => (
                    <tr key={ev.id} className="row" onClick={() => setOpenId(ev.id)}>
                      <td className="mono">{fmtTime(ev.start_at)}</td>
                      <td>{ev.customer_name || '—'}<div style={{color:'var(--muted)',fontSize:12}}>{ev.customer_email}</div></td>
                      <td>{ev.service_name_en} · <span style={{color:'var(--muted)'}}>{ev.service_duration_min}m</span></td>
                      <td>{ev.guests}</td>
                      <td><span className={`chip chip--${ev.status}`}>{ev.status.replace('_',' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty"><div className="empty__h">Nothing on the schedule</div></div>}
          </div>
        )}
      </div>
      {openId && <BookingDrawer id={openId} onClose={() => setOpenId(null)} onChange={load} />}
    </>
  );
}

// ─────────────────────────────  Customers page  ─────────────────────────────
function CustomersPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb().from('customers').select('*').order('last_seen_at', { ascending: false }).limit(500);
    if (error) toast.push(error.message, 'err');
    else setRows(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r => (r.email || '').toLowerCase().includes(q) || (r.full_name || '').toLowerCase().includes(q) || (r.phone || '').toLowerCase().includes(q) || (r.tags || []).some(t => t.toLowerCase().includes(q)));
  }, [rows, search]);

  return (
    <>
      <TopBar
        title="Customers"
        sub={loading ? 'Loading…' : `${filtered.length} of ${rows.length} customers`}
        right={<>
          <div className="searchbox">
            <svg className="searchbox__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
            <input placeholder="Name, email, phone, tag…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn" onClick={load} title="Refresh">↻</button>
        </>}
      />
      <div className="content">
        {!filtered.length && !loading ? (
          <div className="empty"><div className="empty__h">No customers yet</div><p>They'll appear here as bookings come in or after a CSV import.</p></div>
        ) : (
          <table className="tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Language</th><th>Source</th><th>Last seen</th><th>Tags</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="row" onClick={() => setOpenId(r.id)}>
                  <td>{r.full_name || '—'}</td>
                  <td className="mono">{r.email}</td>
                  <td>{r.phone || '—'}</td>
                  <td>{r.language.toUpperCase()}</td>
                  <td><span style={{color:'var(--muted)'}}>{r.source}</span></td>
                  <td>{fmtDate(r.last_seen_at)}</td>
                  <td>{(r.tags||[]).slice(0,3).map(t => <span key={t} className="tag">{t}</span>)}{(r.tags||[]).length>3 && <span className="tag">+{(r.tags||[]).length-3}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {openId && <CustomerDrawer id={openId} onClose={() => setOpenId(null)} onChange={load} />}
    </>
  );
}

function CustomerDrawer({ id, onClose, onChange }) {
  const toast = useToast();
  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tagInput, setTagInput] = useState('');
  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: b }] = await Promise.all([
        sb().from('customers').select('*').eq('id', id).maybeSingle(),
        sb().from('booking_with_customer').select('*').eq('customer_id', id).order('start_at', { ascending: false }).limit(50),
      ]);
      setCustomer(c); setBookings(b || []);
    })();
  }, [id]);

  useEffect(() => {
    function k(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  async function addTag() {
    const t = tagInput.trim(); if (!t || !customer) return;
    const next = Array.from(new Set([...(customer.tags || []), t]));
    setCustomer({ ...customer, tags: next });
    setTagInput('');
    const { error } = await sb().from('customers').update({ tags: next }).eq('id', id);
    if (error) { toast.push(error.message, 'err'); } else { onChange && onChange(); }
  }
  async function removeTag(t) {
    const next = (customer.tags || []).filter(x => x !== t);
    setCustomer({ ...customer, tags: next });
    const { error } = await sb().from('customers').update({ tags: next }).eq('id', id);
    if (error) toast.push(error.message, 'err'); else onChange && onChange();
  }

  if (!customer) return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer"><div className="drawer__body" style={{color:'var(--muted)'}}>Loading…</div></aside>
    </>
  );

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer__head">
          <span className="drawer__title">{customer.full_name || customer.email}</span>
          <button className="drawer__close" onClick={onClose}>esc</button>
        </div>
        <div className="drawer__body">
          <div className="kv">
            <div className="kv__k">Email</div><div className="kv__v mono">{customer.email}</div>
            <div className="kv__k">Phone</div><div className="kv__v">{customer.phone || '—'}</div>
            <div className="kv__k">Language</div><div className="kv__v">{customer.language.toUpperCase()}</div>
            <div className="kv__k">Source</div><div className="kv__v">{customer.source}</div>
            <div className="kv__k">First seen</div><div className="kv__v">{fmtDate(customer.first_seen_at)}</div>
            <div className="kv__k">Last seen</div><div className="kv__v">{fmtDate(customer.last_seen_at)}</div>
            <div className="kv__k">Marketing</div><div className="kv__v">{customer.marketing_consent ? 'opted in' : 'no'}</div>
          </div>

          <div style={{marginTop:18}}>
            <div style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',marginBottom:6}}>Tags</div>
            <div>
              {(customer.tags || []).map(t => <span key={t} className="tag">{t} <button style={{marginLeft:4,color:'var(--muted)'}} onClick={() => removeTag(t)}>×</button></span>)}
            </div>
            <div style={{display:'flex',gap:6,marginTop:8}}>
              <input placeholder="Add tag" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} />
              <button className="btn" onClick={addTag}>Add</button>
            </div>
          </div>

          <div style={{marginTop:24}}>
            <div style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',marginBottom:6}}>Bookings ({bookings.length})</div>
            {bookings.length ? bookings.map(b => (
              <div key={b.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--line)',fontSize:13}}>
                <div>
                  <div>{b.service_name_en} · {b.service_duration_min}m</div>
                  <div style={{color:'var(--muted)',fontSize:12}}>{fmtDateTime(b.start_at)} · {b.reference}</div>
                </div>
                <span className={`chip chip--${b.status}`}>{b.status.replace('_',' ')}</span>
              </div>
            )) : <div style={{color:'var(--muted)',fontSize:13}}>No bookings yet.</div>}
          </div>
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────  Import page  ─────────────────────────────
function ImportPage() {
  const toast = useToast();
  const [step, setStep] = useState('upload'); // upload | preview | done
  const [filename, setFilename] = useState('');
  const [csv, setCsv] = useState('');
  const [job, setJob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [tag, setTag] = useState('');
  const inputRef = useRef(null);

  async function handleFiles(files) {
    const f = files?.[0]; if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv') && f.type !== 'text/csv') {
      toast.push('Please upload a .csv file', 'err'); return;
    }
    if (f.size > 8 * 1024 * 1024) { toast.push('File too large (8MB max)', 'err'); return; }
    setFilename(f.name);
    const text = await f.text();
    setCsv(text);
    await runPreview(text, f.name);
  }

  async function runPreview(text, name) {
    setBusy(true);
    const res = await authedFetch('/.netlify/functions/import-preview', {
      method: 'POST',
      body: JSON.stringify({ csv: text || csv, filename: name || filename, tag: tag || null }),
    });
    setBusy(false);
    const j = await res.json();
    if (!res.ok) { toast.push(j.error || 'Preview failed', 'err'); return; }
    setJob(j);
    setStep('preview');
  }

  async function commit() {
    setBusy(true);
    const res = await authedFetch('/.netlify/functions/import-commit', {
      method: 'POST',
      body: JSON.stringify({ jobId: job.jobId, tag: tag || undefined }),
    });
    setBusy(false);
    const j = await res.json();
    if (!res.ok) { toast.push(j.error || 'Commit failed', 'err'); return; }
    toast.push(`Imported ${j.inserted} customers`);
    setStep('done');
  }

  function reset() {
    setStep('upload'); setCsv(''); setFilename(''); setJob(null); setTag('');
  }

  return (
    <>
      <TopBar title="Past-client import" sub={step === 'upload' ? 'Drop a CSV to start' : step === 'preview' ? `Review ${job?.counts?.total || 0} rows` : 'Done'} />
      <div className="content">
        {step === 'upload' && (
          <>
            <div
              className={classNames('dropzone', dragging && 'is-drag')}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
            >
              <div className="dropzone__h">{busy ? 'Parsing…' : 'Drop a CSV here'}</div>
              <div className="dropzone__sub">or click to choose — up to 5,000 rows, 8MB.</div>
              <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={e => handleFiles(e.target.files)} />
            </div>
            <div style={{marginTop:16,color:'var(--muted)',fontSize:12.5,lineHeight:1.6}}>
              <strong style={{color:'var(--text-2)'}}>Required columns:</strong> at least one of <code style={{color:'var(--accent-2)'}}>email</code> or <code style={{color:'var(--accent-2)'}}>phone</code>.<br/>
              <strong style={{color:'var(--text-2)'}}>Recognized:</strong> name / full name / voornaam + achternaam, phone / tel, language, tags, notes, consent.<br/>
              Dedupe runs against existing customers (by email, falling back to phone).
            </div>
          </>
        )}

        {step === 'preview' && job && (
          <>
            <div className="stats">
              <div className="stat-card"><div className="stat-card__label">Total rows</div><div className="stat-card__value">{job.counts.total}</div></div>
              <div className="stat-card"><div className="stat-card__label">New</div><div className="stat-card__value" style={{color:'var(--ok)'}}>{job.counts.new}</div></div>
              <div className="stat-card"><div className="stat-card__label">Duplicates</div><div className="stat-card__value" style={{color:'var(--warn)'}}>{job.counts.duplicate}</div></div>
              <div className="stat-card"><div className="stat-card__label">Invalid</div><div className="stat-card__value" style={{color:'var(--err)'}}>{job.counts.invalid}</div></div>
            </div>

            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',marginBottom:6}}>Optional tag</div>
              <input placeholder="e.g. reactivation-2025-q2" value={tag} onChange={e => setTag(e.target.value)} style={{width:'min(320px, 100%)'}} />
              <div style={{color:'var(--muted)',fontSize:12,marginTop:4}}>Added to every imported customer alongside <code style={{color:'var(--accent-2)'}}>imported-YYYY-MM-DD</code>.</div>
            </div>

            <div className="import-preview">
              <table className="tbl">
                <thead><tr><th>#</th><th>Email</th><th>Name</th><th>Phone</th><th>Status</th></tr></thead>
                <tbody>
                  {job.preview.map(p => (
                    <tr key={p.index}>
                      <td className="mono shrink">{p.index + 1}</td>
                      <td className="mono">{p.customer.email || '—'}</td>
                      <td>{p.customer.full_name || '—'}</td>
                      <td>{p.customer.phone || '—'}</td>
                      <td>
                        {p.status === 'new'       && <span className="chip chip--confirmed">new</span>}
                        {p.status === 'duplicate' && <span className="chip chip--pending">duplicate</span>}
                        {p.status === 'invalid'   && <span className="chip chip--cancelled">invalid</span>}
                        {p.reason && <span style={{color:'var(--muted)',fontSize:11,marginLeft:6}}>{p.reason}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {job.counts.total > job.preview.length && (
                <div style={{padding:'10px 12px',color:'var(--muted)',fontSize:12,borderTop:'1px solid var(--line)'}}>+ {job.counts.total - job.preview.length} more rows hidden from preview.</div>
              )}
            </div>

            <div style={{marginTop:16,display:'flex',gap:8}}>
              <button className="btn btn--primary" onClick={commit} disabled={busy || !job.counts.new}>
                {busy ? 'Importing…' : `Import ${job.counts.new} new customers`}
              </button>
              <button className="btn" onClick={reset} disabled={busy}>Start over</button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="empty" style={{padding:'40px 30px'}}>
            <div className="empty__h">Import complete</div>
            <p>Your past clients are now in the database with their tags. They show up in Customers and in the Hermes <code style={{color:'var(--accent-2)'}}>/past-clients</code> endpoint.</p>
            <div style={{marginTop:14,display:'flex',gap:8,justifyContent:'center'}}>
              <a className="btn btn--primary" href="#/customers">View customers →</a>
              <button className="btn" onClick={reset}>Import another</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────  Hermes page  ─────────────────────────────
function HermesPage() {
  const toast = useToast();
  const [agents, setAgents] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showKey, setShowKey] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: a }, { data: act }] = await Promise.all([
      sb().from('hermes_agents').select('*').order('created_at', { ascending: false }),
      sb().from('hermes_activity').select('*, customer:customers(email, full_name)').order('created_at', { ascending: false }).limit(100),
    ]);
    setAgents(a || []); setActivity(act || []); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function createAgent() {
    if (!newName.trim()) return;
    setBusy(true);
    const res = await authedFetch('/.netlify/functions/create-agent-key', {
      method: 'POST',
      body: JSON.stringify({ name: newName, description: newDesc || undefined }),
    });
    setBusy(false);
    const j = await res.json();
    if (!res.ok) { toast.push(j.error || 'Could not create', 'err'); return; }
    setShowKey({ name: j.agent.name, key: j.apiKey });
    setNewName(''); setNewDesc(''); setCreating(false);
    load();
  }

  async function setStatus(id, status) {
    const { error } = await sb().from('hermes_agents').update({ status }).eq('id', id);
    if (error) toast.push(error.message, 'err');
    else { toast.push(`Agent ${status}`); load(); }
  }

  return (
    <>
      <TopBar title="Hermes" sub={loading ? 'Loading…' : `${agents.length} agents · ${activity.length} recent events`} right={
        <button className="btn btn--primary" onClick={() => setCreating(true)}>+ New agent</button>
      } />
      <div className="content">

        {showKey && (
          <div style={{padding:'14px 16px',background:'rgba(94,106,210,0.08)',border:'1px solid rgba(94,106,210,0.3)',borderRadius:10,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:6}}>API key for “{showKey.name}”</div>
            <div style={{color:'var(--muted)',fontSize:12,marginBottom:8}}>This is the only time you can see this key. Store it in the agent's secret store now.</div>
            <div className="key-reveal">
              <span style={{flex:1}}>{showKey.key}</span>
              <button className="btn" onClick={() => { navigator.clipboard.writeText(showKey.key); toast.push('Copied'); }}>Copy</button>
            </div>
            <div style={{marginTop:10,display:'flex',gap:8}}>
              <button className="btn" onClick={() => setShowKey(null)}>Done</button>
            </div>
          </div>
        )}

        {creating && (
          <div style={{padding:'14px 16px',background:'var(--surface)',border:'1px solid var(--line)',borderRadius:10,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>New agent</div>
            <div style={{display:'grid',gap:8}}>
              <input placeholder="Name (e.g. Reactivation Agent)" autoFocus value={newName} onChange={e => setNewName(e.target.value)} />
              <input placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>
            <div style={{display:'flex',gap:8,marginTop:10}}>
              <button className="btn btn--primary" onClick={createAgent} disabled={busy || !newName.trim()}>{busy ? 'Creating…' : 'Create & reveal key'}</button>
              <button className="btn" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{display:'grid',gap:8,marginBottom:24}}>
          {agents.map(a => (
            <div key={a.id} className="agent-card">
              <div style={{width:8,height:8,borderRadius:99,background: a.status==='active' ? 'var(--ok)' : a.status==='paused' ? 'var(--warn)' : 'var(--err)'}}></div>
              <div>
                <div className="agent-card__name">{a.name}</div>
                <div className="agent-card__sub">{a.api_key_prefix}… · {a.status} · last seen {a.last_seen_at ? fmtDate(a.last_seen_at) : 'never'}</div>
                {a.description && <div style={{color:'var(--muted)',fontSize:12,marginTop:4}}>{a.description}</div>}
              </div>
              <div className="agent-card__right">
                {a.status === 'active'   && <button className="btn" onClick={() => setStatus(a.id, 'paused')}>Pause</button>}
                {a.status === 'paused'   && <button className="btn" onClick={() => setStatus(a.id, 'active')}>Resume</button>}
                {a.status !== 'revoked'  && <button className="btn btn--danger" onClick={() => { if (confirm('Revoke this agent? Its API key will stop working.')) setStatus(a.id, 'revoked'); }}>Revoke</button>}
              </div>
            </div>
          ))}
          {!loading && !agents.length && (
            <div className="empty">
              <div className="empty__h">No Hermes agents connected</div>
              <p>Create a key, copy it once, and paste it into your Hermes agent's <code style={{color:'var(--accent-2)'}}>LUCA_API_KEY</code> env var.</p>
            </div>
          )}
        </div>

        <div style={{fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',marginBottom:8}}>Recent activity</div>
        <div className="activity-feed">
          {activity.map(a => (
            <div key={a.id} className="activity-item">
              <span className="activity-item__kind">{a.kind.replace('_',' ')}</span>
              <span>
                {a.customer?.full_name || a.customer?.email || (a.payload?.note || '—')}
                {a.payload?.subject && <span style={{color:'var(--muted)'}}> · {a.payload.subject}</span>}
              </span>
              <span className="activity-item__time">{fmtDateTime(a.created_at)}</span>
            </div>
          ))}
          {!activity.length && <div className="empty"><div className="empty__h">No activity yet</div><p>Hermes will post here every time it sends, gets a reply, or recovers a booking.</p></div>}
        </div>

        <div style={{marginTop:24,padding:'14px 16px',background:'var(--surface)',border:'1px solid var(--line)',borderRadius:10}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:6}}>Integration cheat sheet</div>
          <pre style={{margin:0,padding:'10px 12px',background:'var(--bg-2)',borderRadius:6,fontSize:11.5,fontFamily:'JetBrains Mono, monospace',color:'var(--text-2)',whiteSpace:'pre-wrap',lineHeight:1.6}}>
{`# Past clients (GET)
curl -H "Authorization: Bearer $LUCA_API_KEY" \\
  "${location.origin}/api/hermes/past-clients?tag=imported-2025-05&limit=200"

# Post activity (POST)
curl -X POST -H "Authorization: Bearer $LUCA_API_KEY" -H "Content-Type: application/json" \\
  -d '{"kind":"message_sent","customer_email":"jane@example.com","payload":{"subject":"We missed you"}}' \\
  "${location.origin}/api/hermes/activity"`}
          </pre>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────  Root  ─────────────────────────────
function App() {
  const auth = useAuth();
  if (auth.loading) return null;
  if (!auth.user) return <Login />;
  if (!auth.profile) {
    return (
      <div className="login">
        <div className="login__card">
          <div className="login__brand">LUCA · ADMIN</div>
          <div className="login__title">You're signed in, but not an admin.</div>
          <div className="login__sub">An existing admin needs to add your account to <code style={{color:'var(--accent-2)'}}>admin_profiles</code>. Once they do, refresh.</div>
          <button className="btn login__submit" onClick={() => sb().auth.signOut()}>Sign out</button>
        </div>
      </div>
    );
  }
  return <Shell auth={auth} />;
}

window.LUCA_mountAdmin = function () {
  const root = document.getElementById('admin-root');
  root.removeAttribute('data-loading');
  root.innerHTML = '';
  ReactDOM.createRoot(root).render(
    React.createElement(ToastProvider, null, React.createElement(App))
  );
};
