/* global React, ReactDOM */
const {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} = React;
const sb = () => window.LUCA_supabase;

// ─────────────────────────────  Toasts  ─────────────────────────────
const ToastCtx = React.createContext({
  push: () => {}
});
function ToastProvider({
  children
}) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, kind = 'ok', ttl = 3500) => {
    const id = Math.random().toString(36).slice(2);
    setItems(arr => [...arr, {
      id,
      message,
      kind
    }]);
    setTimeout(() => setItems(arr => arr.filter(x => x.id !== id)), ttl);
  }, []);
  return /*#__PURE__*/React.createElement(ToastCtx.Provider, {
    value: {
      push
    }
  }, children, /*#__PURE__*/React.createElement("div", {
    className: "toast-host"
  }, items.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: `toast toast--${t.kind}`
  }, t.message))));
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
const navigate = h => {
  location.hash = h;
};

// ─────────────────────────────  Auth  ─────────────────────────────
function useAuth() {
  const [state, setState] = useState({
    loading: true,
    user: null,
    profile: null
  });
  useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: {
          session
        }
      } = await sb().auth.getSession();
      if (!session) {
        if (mounted) setState({
          loading: false,
          user: null,
          profile: null
        });
        return;
      }
      const {
        data: profile
      } = await sb().from('admin_profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (mounted) setState({
        loading: false,
        user: session.user,
        profile
      });
    })();
    const {
      data: sub
    } = sb().auth.onAuthStateChange(async (_evt, session) => {
      if (!session) {
        setState({
          loading: false,
          user: null,
          profile: null
        });
        return;
      }
      const {
        data: profile
      } = await sb().from('admin_profiles').select('*').eq('id', session.user.id).maybeSingle();
      setState({
        loading: false,
        user: session.user,
        profile
      });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return state;
}

// ─────────────────────────────  Helpers  ─────────────────────────────
const cents = c => `€${(c / 100).toFixed(c % 100 === 0 ? 0 : 2)}`;
const fmtDate = iso => new Date(iso).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});
const fmtTime = iso => new Date(iso).toLocaleTimeString('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});
const fmtDateTime = iso => `${fmtDate(iso)} · ${fmtTime(iso)}`;
const STATUSES = ['pending', 'confirmed', 'cancelled', 'no_show', 'completed'];
function classNames(...x) {
  return x.filter(Boolean).join(' ');
}
async function bearer() {
  const {
    data: {
      session
    }
  } = await sb().auth.getSession();
  return session?.access_token;
}
async function authedFetch(url, opts = {}) {
  const token = await bearer();
  return fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
      Authorization: `Bearer ${token}`
    }
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
    setBusy(true);
    setErr(null);
    const {
      error
    } = await sb().auth.signInWithPassword({
      email,
      password
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    toast.push('Signed in');
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "login"
  }, /*#__PURE__*/React.createElement("form", {
    className: "login__card",
    onSubmit: onSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "login__brand"
  }, "LUCA \xB7 ADMIN"), /*#__PURE__*/React.createElement("div", {
    className: "login__title"
  }, "Sign in"), /*#__PURE__*/React.createElement("div", {
    className: "login__sub"
  }, "Use your operator email + password."), /*#__PURE__*/React.createElement("label", {
    className: "login__field"
  }, /*#__PURE__*/React.createElement("label", null, "Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    autoFocus: true,
    required: true,
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "you@luca-amsterdam.nl"
  })), /*#__PURE__*/React.createElement("label", {
    className: "login__field"
  }, /*#__PURE__*/React.createElement("label", null, "Password"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    value: password,
    onChange: e => setPassword(e.target.value)
  })), err && /*#__PURE__*/React.createElement("p", {
    className: "login__error"
  }, err), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn--primary login__submit",
    disabled: busy
  }, busy ? 'Signing in…' : 'Sign in →')));
}

// ─────────────────────────────  Shell  ─────────────────────────────
function Shell({
  auth
}) {
  const hash = useHash();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Keyboard
  useEffect(() => {
    let lastG = 0;
    function onKey(e) {
      const t = e.target;
      const inField = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      // ⌘K / Ctrl+K — palette
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen(o => !o);
        return;
      }
      if (inField) return;
      // g <letter>
      if (e.key === 'g') {
        lastG = Date.now();
        return;
      }
      if (Date.now() - lastG < 800) {
        if (e.key === 'b') {
          navigate('#/bookings');
          lastG = 0;
          return;
        }
        if (e.key === 'c') {
          navigate('#/customers');
          lastG = 0;
          return;
        }
        if (e.key === 's') {
          navigate('#/schedule');
          lastG = 0;
          return;
        }
        if (e.key === 'i') {
          navigate('#/import');
          lastG = 0;
          return;
        }
        if (e.key === 'h') {
          navigate('#/hermes');
          lastG = 0;
          return;
        }
      }
      if (e.key === '?') {
        setPaletteOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  let page = null;
  const cleanHash = hash.split('?')[0];
  if (cleanHash.startsWith('#/bookings')) page = /*#__PURE__*/React.createElement(BookingsPage, null);else if (cleanHash.startsWith('#/schedule')) page = /*#__PURE__*/React.createElement(SchedulePage, null);else if (cleanHash.startsWith('#/customers')) page = /*#__PURE__*/React.createElement(CustomersPage, null);else if (cleanHash.startsWith('#/import')) page = /*#__PURE__*/React.createElement(ImportPage, null);else if (cleanHash.startsWith('#/hermes')) page = /*#__PURE__*/React.createElement(HermesPage, null);else page = /*#__PURE__*/React.createElement(BookingsPage, null);
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(Sidebar, {
    auth: auth,
    onPalette: () => setPaletteOpen(true),
    hash: cleanHash
  }), /*#__PURE__*/React.createElement("div", {
    className: "main"
  }, page), paletteOpen && /*#__PURE__*/React.createElement(Palette, {
    onClose: () => setPaletteOpen(false)
  }));
}
function Sidebar({
  auth,
  onPalette,
  hash
}) {
  const items = [{
    id: 'bookings',
    label: 'Bookings',
    route: '#/bookings',
    key: 'g b'
  }, {
    id: 'schedule',
    label: 'Schedule',
    route: '#/schedule',
    key: 'g s'
  }, {
    id: 'customers',
    label: 'Customers',
    route: '#/customers',
    key: 'g c'
  }, {
    id: 'import',
    label: 'Import',
    route: '#/import',
    key: 'g i'
  }, {
    id: 'hermes',
    label: 'Hermes',
    route: '#/hermes',
    key: 'g h'
  }];
  async function signOut() {
    await sb().auth.signOut();
  }
  return /*#__PURE__*/React.createElement("aside", {
    className: "side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "side__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "side__brand-dot"
  }), " LUCA \xB7 ADMIN"), /*#__PURE__*/React.createElement("div", {
    className: "side__group"
  }, "Workspace"), items.map(item => /*#__PURE__*/React.createElement("a", {
    key: item.id,
    className: classNames('side__item', hash.startsWith(item.route) && 'is-active'),
    href: item.route
  }, /*#__PURE__*/React.createElement("span", null, item.label), /*#__PURE__*/React.createElement("span", {
    className: "side__item-key"
  }, item.key))), /*#__PURE__*/React.createElement("div", {
    className: "side__spacer"
  }), /*#__PURE__*/React.createElement("div", {
    className: "side__foot"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onPalette
  }, "\u2318K \xB7 Command palette"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: 12,
      marginTop: 4
    }
  }, auth.user?.email), /*#__PURE__*/React.createElement("button", {
    onClick: signOut
  }, "Sign out")));
}
function TopBar({
  title,
  sub,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "topbar__title"
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    className: "topbar__sub"
  }, sub)), /*#__PURE__*/React.createElement("div", {
    className: "topbar__right"
  }, right));
}

// ─────────────────────────────  Palette  ─────────────────────────────
function Palette({
  onClose
}) {
  const [q, setQ] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const all = useMemo(() => [{
    id: 'go-bookings',
    label: 'Go to bookings',
    sub: 'g b',
    action: () => {
      navigate('#/bookings');
      onClose();
    }
  }, {
    id: 'go-schedule',
    label: 'Go to schedule',
    sub: 'g s',
    action: () => {
      navigate('#/schedule');
      onClose();
    }
  }, {
    id: 'go-customers',
    label: 'Go to customers',
    sub: 'g c',
    action: () => {
      navigate('#/customers');
      onClose();
    }
  }, {
    id: 'go-import',
    label: 'Go to import',
    sub: 'g i',
    action: () => {
      navigate('#/import');
      onClose();
    }
  }, {
    id: 'go-hermes',
    label: 'Go to Hermes',
    sub: 'g h',
    action: () => {
      navigate('#/hermes');
      onClose();
    }
  }, {
    id: 'today',
    label: 'Schedule — today',
    sub: '',
    action: () => {
      navigate('#/schedule');
      onClose();
    }
  }, {
    id: 'help',
    label: 'Keyboard shortcuts',
    sub: '?',
    action: () => alert('Shortcuts:\n⌘K — palette\ng b — bookings\ng s — schedule\ng c — customers\ng i — import\ng h — hermes\nj/k — move in list\ne — edit/open\nx — cancel\nesc — close drawer/palette')
  }], [onClose]);
  const filtered = q.trim() ? all.filter(i => i.label.toLowerCase().includes(q.toLowerCase())) : all;
  useEffect(() => {
    function key(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIdx(i => Math.min(filtered.length - 1, i + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIdx(i => Math.max(0, i - 1));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        filtered[focusIdx]?.action();
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [filtered, focusIdx, onClose]);
  return /*#__PURE__*/React.createElement("div", {
    className: "palette",
    onClick: e => {
      if (e.target.classList.contains('palette')) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "palette__panel"
  }, /*#__PURE__*/React.createElement("input", {
    className: "palette__input",
    autoFocus: true,
    placeholder: "Search commands\u2026",
    value: q,
    onChange: e => {
      setQ(e.target.value);
      setFocusIdx(0);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "palette__list"
  }, filtered.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: it.id,
    className: classNames('palette__item', i === focusIdx && 'is-focus'),
    onMouseEnter: () => setFocusIdx(i),
    onClick: it.action
  }, /*#__PURE__*/React.createElement("span", null, it.label), it.sub && /*#__PURE__*/React.createElement("span", {
    className: "palette__item-sub"
  }, it.sub))), !filtered.length && /*#__PURE__*/React.createElement("div", {
    className: "palette__item",
    style: {
      color: 'var(--muted)'
    }
  }, "No matches"))));
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
    let q = sb().from('booking_with_customer').select('*').order('start_at', {
      ascending: false
    }).limit(500);
    if (status !== 'all') q = q.eq('status', status);
    if (from) q = q.gte('start_at', new Date(from).toISOString());
    if (to) q = q.lte('start_at', new Date(to + 'T23:59:59').toISOString());
    const {
      data,
      error
    } = await q;
    if (error) {
      toast.push(error.message, 'err');
      setRows([]);
    } else setRows(data || []);
    setLoading(false);
  }, [status, from, to]);
  useEffect(() => {
    load();
  }, [load]);
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(r => (r.reference || '').toLowerCase().includes(q) || (r.customer_email || '').toLowerCase().includes(q) || (r.customer_name || '').toLowerCase().includes(q) || (r.service_name_en || '').toLowerCase().includes(q));
  }, [rows, search]);

  // List nav with j/k, e to open
  useEffect(() => {
    function key(e) {
      const t = e.target;
      if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA') return;
      if (e.key === 'j') {
        setFocus(i => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === 'k') {
        setFocus(i => Math.max(0, i - 1));
      } else if (e.key === 'e' || e.key === 'Enter') {
        const r = filtered[focus];
        if (r) setOpenId(r.id);
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [filtered, focus]);
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);
    const todays = rows.filter(r => new Date(r.start_at) >= today && new Date(r.start_at) < tomorrow);
    const upcoming = rows.filter(r => new Date(r.start_at) >= today && r.status !== 'cancelled');
    const revenue = rows.filter(r => r.status === 'confirmed' || r.status === 'completed').reduce((a, r) => a + (r.total_cents || 0), 0);
    return {
      today: todays.length,
      upcoming: upcoming.length,
      cancelled: rows.filter(r => r.status === 'cancelled').length,
      revenue: cents(revenue)
    };
  }, [rows]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Bookings",
    sub: loading ? 'Loading…' : `${filtered.length} of ${rows.length} bookings`,
    right: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "searchbox"
    }, /*#__PURE__*/React.createElement("svg", {
      className: "searchbox__icon",
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "7",
      cy: "7",
      r: "5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M11 11l3 3"
    })), /*#__PURE__*/React.createElement("input", {
      placeholder: "Reference, email, name\u2026",
      value: search,
      onChange: e => setSearch(e.target.value)
    })), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: load,
      title: "Refresh"
    }, "\u21BB"))
  }), /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card__label"
  }, "Today"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card__value"
  }, stats.today)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card__label"
  }, "Upcoming"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card__value"
  }, stats.upcoming)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card__label"
  }, "Cancelled"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card__value"
  }, stats.cancelled)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card__label"
  }, "Revenue (visible)"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card__value"
  }, stats.revenue))), /*#__PURE__*/React.createElement("div", {
    className: "filters"
  }, /*#__PURE__*/React.createElement("select", {
    value: status,
    onChange: e => setStatus(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All statuses"), STATUSES.map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }, s.replace('_', ' ')))), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: from,
    onChange: e => setFrom(e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: to,
    onChange: e => setTo(e.target.value)
  }), (status !== 'all' || from || to) && /*#__PURE__*/React.createElement("span", {
    className: "filters__pill"
  }, status !== 'all' && /*#__PURE__*/React.createElement("span", null, "status: ", status), from && /*#__PURE__*/React.createElement("span", null, "from: ", from), to && /*#__PURE__*/React.createElement("span", null, "to: ", to), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setStatus('all');
      setFrom('');
      setTo('');
    }
  }, "\xD7"))), loading ? null : !filtered.length ? /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty__h"
  }, "No bookings match these filters"), /*#__PURE__*/React.createElement("p", null, "Clear filters, or wait for the first one to come in.")) : /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Ref"), /*#__PURE__*/React.createElement("th", null, "Customer"), /*#__PURE__*/React.createElement("th", null, "Service"), /*#__PURE__*/React.createElement("th", null, "Start"), /*#__PURE__*/React.createElement("th", null, "Guests"), /*#__PURE__*/React.createElement("th", null, "Total"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, filtered.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id,
    className: classNames('row', i === focus && 'is-focus'),
    onClick: () => setOpenId(r.id)
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono shrink"
  }, r.reference), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 500
    }
  }, r.customer_name || '—'), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: 12
    }
  }, r.customer_email)), /*#__PURE__*/React.createElement("td", null, r.service_name_en, " \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, r.service_duration_min, "m")), /*#__PURE__*/React.createElement("td", null, fmtDateTime(r.start_at)), /*#__PURE__*/React.createElement("td", null, r.guests), /*#__PURE__*/React.createElement("td", null, cents(r.total_cents)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `chip chip--${r.status}`
  }, r.status.replace('_', ' ')))))))), openId && /*#__PURE__*/React.createElement(BookingDrawer, {
    id: openId,
    onClose: () => setOpenId(null),
    onChange: load
  }));
}
function BookingDrawer({
  id,
  onClose,
  onChange
}) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  useEffect(() => {
    (async () => {
      const {
        data: row,
        error
      } = await sb().from('booking_with_customer').select('*').eq('id', id).maybeSingle();
      if (error) {
        toast.push(error.message, 'err');
        return;
      }
      setData(row);
      setAdminNotes(row?.admin_notes || '');
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
    setData({
      ...data,
      status: next
    }); // optimistic
    setBusy(true);
    const {
      error
    } = await sb().from('bookings').update({
      status: next,
      ...(next === 'cancelled' ? {
        cancelled_at: new Date().toISOString(),
        cancelled_reason: 'admin'
      } : {})
    }).eq('id', id);
    setBusy(false);
    if (error) {
      setData({
        ...data,
        status: prev
      });
      toast.push('Could not update: ' + error.message, 'err');
    } else {
      toast.push(`Status → ${next.replace('_', ' ')}`);
      onChange && onChange();
    }
  }
  async function saveNotes() {
    setBusy(true);
    const {
      error
    } = await sb().from('bookings').update({
      admin_notes: adminNotes
    }).eq('id', id);
    setBusy(false);
    if (error) toast.push(error.message, 'err');else {
      toast.push('Notes saved');
      setEditing(false);
      onChange && onChange();
    }
  }
  if (!data) return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "drawer-backdrop",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "drawer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "drawer__body",
    style: {
      color: 'var(--muted)'
    }
  }, "Loading\u2026")));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "drawer-backdrop",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "drawer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "drawer__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, data.reference), /*#__PURE__*/React.createElement("span", {
    className: `chip chip--${data.status}`
  }, data.status.replace('_', ' ')), /*#__PURE__*/React.createElement("button", {
    className: "drawer__close",
    onClick: onClose
  }, "esc")), /*#__PURE__*/React.createElement("div", {
    className: "drawer__body"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      marginBottom: 2
    }
  }, data.customer_name || '—'), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: 13
    }
  }, data.customer_email, data.customer_phone ? ` · ${data.customer_phone}` : '')), /*#__PURE__*/React.createElement("div", {
    className: "kv"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Service"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, data.service_name_en, " \xB7 ", data.service_duration_min, "m"), /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "When"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, fmtDateTime(data.start_at)), /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Guests"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, data.guests), /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Total"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, cents(data.total_cents)), /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Source"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, data.source), /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Created"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, fmtDateTime(data.created_at)), data.notes && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Notes"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, data.notes))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      marginBottom: 6
    }
  }, "Admin notes"), editing ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("textarea", {
    rows: 4,
    value: adminNotes,
    onChange: e => setAdminNotes(e.target.value),
    style: {
      width: '100%'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn--primary",
    onClick: saveNotes,
    disabled: busy
  }, "Save"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn--ghost",
    onClick: () => {
      setAdminNotes(data.admin_notes || '');
      setEditing(false);
    }
  }, "Cancel"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 0',
      color: adminNotes ? 'var(--text)' : 'var(--muted)',
      fontSize: 13
    }
  }, adminNotes || '— none —', /*#__PURE__*/React.createElement("button", {
    className: "btn btn--ghost",
    style: {
      marginLeft: 8,
      fontSize: 11
    },
    onClick: () => setEditing(true)
  }, "edit")))), /*#__PURE__*/React.createElement("div", {
    className: "drawer__foot"
  }, data.status !== 'confirmed' && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => changeStatus('confirmed'),
    disabled: busy
  }, "Confirm"), data.status !== 'completed' && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => changeStatus('completed'),
    disabled: busy
  }, "Mark completed"), data.status !== 'no_show' && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => changeStatus('no_show'),
    disabled: busy
  }, "No-show"), data.status !== 'cancelled' && /*#__PURE__*/React.createElement("button", {
    className: "btn btn--danger",
    onClick: () => changeStatus('cancelled'),
    disabled: busy
  }, "Cancel (x)"))));
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
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    const dow = (x.getDay() + 6) % 7; // Mon=0
    x.setDate(x.getDate() - dow);
    return x;
  }
  function isoDay(d) {
    return new Date(d).toISOString().slice(0, 10);
  }
  const range = useMemo(() => {
    if (view === 'day') {
      const start = new Date(dayDate + 'T00:00:00');
      const end = new Date(start.getTime() + 86400000);
      return {
        start,
        end
      };
    }
    const start = new Date(weekStart);
    const end = new Date(start.getTime() + 7 * 86400000);
    return {
      start,
      end
    };
  }, [view, weekStart, dayDate]);
  const load = useCallback(async () => {
    setLoading(true);
    const {
      data,
      error
    } = await sb().from('booking_with_customer').select('*').gte('start_at', range.start.toISOString()).lt('start_at', range.end.toISOString()).order('start_at', {
      ascending: true
    });
    if (error) {
      toast.push(error.message, 'err');
      setRows([]);
    } else setRows(data || []);
    setLoading(false);
  }, [range.start.getTime(), range.end.getTime()]);
  useEffect(() => {
    load();
  }, [load]);
  const byDay = useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      const k = isoDay(r.start_at);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(r);
    }
    return m;
  }, [rows]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Schedule",
    sub: loading ? 'Loading…' : `${rows.length} reservations`,
    right: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "btn-row"
    }, /*#__PURE__*/React.createElement("button", {
      className: classNames('btn', view === 'week' && 'btn--primary'),
      onClick: () => setView('week')
    }, "Week"), /*#__PURE__*/React.createElement("button", {
      className: classNames('btn', view === 'day' && 'btn--primary'),
      onClick: () => setView('day')
    }, "Day")), view === 'week' ? /*#__PURE__*/React.createElement("div", {
      className: "btn-row"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setWeekStart(new Date(weekStart.getTime() - 7 * 86400000))
    }, "\u2190"), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setWeekStart(startOfWeek(new Date()))
    }, "Today"), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setWeekStart(new Date(weekStart.getTime() + 7 * 86400000))
    }, "\u2192")) : /*#__PURE__*/React.createElement("input", {
      type: "date",
      value: dayDate,
      onChange: e => setDayDate(e.target.value)
    }))
  }), /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, view === 'week' ? /*#__PURE__*/React.createElement("div", {
    className: "schedule-week"
  }, Array.from({
    length: 7
  }, (_, i) => {
    const d = new Date(weekStart.getTime() + i * 86400000);
    const key = isoDay(d);
    const today = key === isoDay(new Date());
    const events = byDay.get(key) || [];
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      className: classNames('schedule-day', today && 'is-today')
    }, /*#__PURE__*/React.createElement("div", {
      className: "schedule-day__head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "schedule-day__date"
    }, d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric'
    })), /*#__PURE__*/React.createElement("span", null, events.length)), events.map(ev => /*#__PURE__*/React.createElement("div", {
      key: ev.id,
      className: "schedule-event",
      onClick: () => setOpenId(ev.id)
    }, /*#__PURE__*/React.createElement("div", {
      className: "schedule-event__time"
    }, fmtTime(ev.start_at), " \xB7 ", ev.service_duration_min, "m"), /*#__PURE__*/React.createElement("div", {
      className: "schedule-event__name"
    }, ev.customer_name || '—'), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--muted)',
        fontSize: 11
      }
    }, ev.service_name_en))), !events.length && /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--muted)',
        fontSize: 11,
        padding: '8px 4px'
      }
    }, "No bookings"));
  })) : /*#__PURE__*/React.createElement("div", {
    className: "schedule-day-detail"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 10
    }
  }, new Date(dayDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })), (byDay.get(dayDate) || []).length ? /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Time"), /*#__PURE__*/React.createElement("th", null, "Customer"), /*#__PURE__*/React.createElement("th", null, "Service"), /*#__PURE__*/React.createElement("th", null, "Guests"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, (byDay.get(dayDate) || []).map(ev => /*#__PURE__*/React.createElement("tr", {
    key: ev.id,
    className: "row",
    onClick: () => setOpenId(ev.id)
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, fmtTime(ev.start_at)), /*#__PURE__*/React.createElement("td", null, ev.customer_name || '—', /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: 12
    }
  }, ev.customer_email)), /*#__PURE__*/React.createElement("td", null, ev.service_name_en, " \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, ev.service_duration_min, "m")), /*#__PURE__*/React.createElement("td", null, ev.guests), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `chip chip--${ev.status}`
  }, ev.status.replace('_', ' '))))))) : /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty__h"
  }, "Nothing on the schedule")))), openId && /*#__PURE__*/React.createElement(BookingDrawer, {
    id: openId,
    onClose: () => setOpenId(null),
    onChange: load
  }));
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
    const {
      data,
      error
    } = await sb().from('customers').select('*').order('last_seen_at', {
      ascending: false
    }).limit(500);
    if (error) toast.push(error.message, 'err');else setRows(data || []);
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r => (r.email || '').toLowerCase().includes(q) || (r.full_name || '').toLowerCase().includes(q) || (r.phone || '').toLowerCase().includes(q) || (r.tags || []).some(t => t.toLowerCase().includes(q)));
  }, [rows, search]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Customers",
    sub: loading ? 'Loading…' : `${filtered.length} of ${rows.length} customers`,
    right: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "searchbox"
    }, /*#__PURE__*/React.createElement("svg", {
      className: "searchbox__icon",
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "7",
      cy: "7",
      r: "5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M11 11l3 3"
    })), /*#__PURE__*/React.createElement("input", {
      placeholder: "Name, email, phone, tag\u2026",
      value: search,
      onChange: e => setSearch(e.target.value)
    })), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: load,
      title: "Refresh"
    }, "\u21BB"))
  }), /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, !filtered.length && !loading ? /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty__h"
  }, "No customers yet"), /*#__PURE__*/React.createElement("p", null, "They'll appear here as bookings come in or after a CSV import.")) : /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Email"), /*#__PURE__*/React.createElement("th", null, "Phone"), /*#__PURE__*/React.createElement("th", null, "Language"), /*#__PURE__*/React.createElement("th", null, "Source"), /*#__PURE__*/React.createElement("th", null, "Last seen"), /*#__PURE__*/React.createElement("th", null, "Tags"))), /*#__PURE__*/React.createElement("tbody", null, filtered.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.id,
    className: "row",
    onClick: () => setOpenId(r.id)
  }, /*#__PURE__*/React.createElement("td", null, r.full_name || '—'), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.email), /*#__PURE__*/React.createElement("td", null, r.phone || '—'), /*#__PURE__*/React.createElement("td", null, r.language.toUpperCase()), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, r.source)), /*#__PURE__*/React.createElement("td", null, fmtDate(r.last_seen_at)), /*#__PURE__*/React.createElement("td", null, (r.tags || []).slice(0, 3).map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    className: "tag"
  }, t)), (r.tags || []).length > 3 && /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, "+", (r.tags || []).length - 3))))))), openId && /*#__PURE__*/React.createElement(CustomerDrawer, {
    id: openId,
    onClose: () => setOpenId(null),
    onChange: load
  }));
}
function CustomerDrawer({
  id,
  onClose,
  onChange
}) {
  const toast = useToast();
  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tagInput, setTagInput] = useState('');
  useEffect(() => {
    (async () => {
      const [{
        data: c
      }, {
        data: b
      }] = await Promise.all([sb().from('customers').select('*').eq('id', id).maybeSingle(), sb().from('booking_with_customer').select('*').eq('customer_id', id).order('start_at', {
        ascending: false
      }).limit(50)]);
      setCustomer(c);
      setBookings(b || []);
    })();
  }, [id]);
  useEffect(() => {
    function k(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  async function addTag() {
    const t = tagInput.trim();
    if (!t || !customer) return;
    const next = Array.from(new Set([...(customer.tags || []), t]));
    setCustomer({
      ...customer,
      tags: next
    });
    setTagInput('');
    const {
      error
    } = await sb().from('customers').update({
      tags: next
    }).eq('id', id);
    if (error) {
      toast.push(error.message, 'err');
    } else {
      onChange && onChange();
    }
  }
  async function removeTag(t) {
    const next = (customer.tags || []).filter(x => x !== t);
    setCustomer({
      ...customer,
      tags: next
    });
    const {
      error
    } = await sb().from('customers').update({
      tags: next
    }).eq('id', id);
    if (error) toast.push(error.message, 'err');else onChange && onChange();
  }
  if (!customer) return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "drawer-backdrop",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "drawer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "drawer__body",
    style: {
      color: 'var(--muted)'
    }
  }, "Loading\u2026")));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "drawer-backdrop",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "drawer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "drawer__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "drawer__title"
  }, customer.full_name || customer.email), /*#__PURE__*/React.createElement("button", {
    className: "drawer__close",
    onClick: onClose
  }, "esc")), /*#__PURE__*/React.createElement("div", {
    className: "drawer__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kv"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Email"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v mono"
  }, customer.email), /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Phone"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, customer.phone || '—'), /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Language"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, customer.language.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Source"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, customer.source), /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "First seen"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, fmtDate(customer.first_seen_at)), /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Last seen"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, fmtDate(customer.last_seen_at)), /*#__PURE__*/React.createElement("div", {
    className: "kv__k"
  }, "Marketing"), /*#__PURE__*/React.createElement("div", {
    className: "kv__v"
  }, customer.marketing_consent ? 'opted in' : 'no')), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      marginBottom: 6
    }
  }, "Tags"), /*#__PURE__*/React.createElement("div", null, (customer.tags || []).map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    className: "tag"
  }, t, " ", /*#__PURE__*/React.createElement("button", {
    style: {
      marginLeft: 4,
      color: 'var(--muted)'
    },
    onClick: () => removeTag(t)
  }, "\xD7")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Add tag",
    value: tagInput,
    onChange: e => setTagInput(e.target.value),
    onKeyDown: e => e.key === 'Enter' && addTag()
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: addTag
  }, "Add"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      marginBottom: 6
    }
  }, "Bookings (", bookings.length, ")"), bookings.length ? bookings.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.id,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid var(--line)',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, b.service_name_en, " \xB7 ", b.service_duration_min, "m"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: 12
    }
  }, fmtDateTime(b.start_at), " \xB7 ", b.reference)), /*#__PURE__*/React.createElement("span", {
    className: `chip chip--${b.status}`
  }, b.status.replace('_', ' ')))) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: 13
    }
  }, "No bookings yet.")))));
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
    const f = files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv') && f.type !== 'text/csv') {
      toast.push('Please upload a .csv file', 'err');
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.push('File too large (8MB max)', 'err');
      return;
    }
    setFilename(f.name);
    const text = await f.text();
    setCsv(text);
    await runPreview(text, f.name);
  }
  async function runPreview(text, name) {
    setBusy(true);
    const res = await authedFetch('/.netlify/functions/import-preview', {
      method: 'POST',
      body: JSON.stringify({
        csv: text || csv,
        filename: name || filename,
        tag: tag || null
      })
    });
    setBusy(false);
    const j = await res.json();
    if (!res.ok) {
      toast.push(j.error || 'Preview failed', 'err');
      return;
    }
    setJob(j);
    setStep('preview');
  }
  async function commit() {
    setBusy(true);
    const res = await authedFetch('/.netlify/functions/import-commit', {
      method: 'POST',
      body: JSON.stringify({
        jobId: job.jobId,
        tag: tag || undefined
      })
    });
    setBusy(false);
    const j = await res.json();
    if (!res.ok) {
      toast.push(j.error || 'Commit failed', 'err');
      return;
    }
    toast.push(`Imported ${j.inserted} customers`);
    setStep('done');
  }
  function reset() {
    setStep('upload');
    setCsv('');
    setFilename('');
    setJob(null);
    setTag('');
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Past-client import",
    sub: step === 'upload' ? 'Drop a CSV to start' : step === 'preview' ? `Review ${job?.counts?.total || 0} rows` : 'Done'
  }), /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, step === 'upload' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: classNames('dropzone', dragging && 'is-drag'),
    onClick: () => inputRef.current?.click(),
    onDragOver: e => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: e => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dropzone__h"
  }, busy ? 'Parsing…' : 'Drop a CSV here'), /*#__PURE__*/React.createElement("div", {
    className: "dropzone__sub"
  }, "or click to choose \u2014 up to 5,000 rows, 8MB."), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    type: "file",
    accept: ".csv,text/csv",
    hidden: true,
    onChange: e => handleFiles(e.target.files)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      color: 'var(--muted)',
      fontSize: 12.5,
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-2)'
    }
  }, "Required columns:"), " at least one of ", /*#__PURE__*/React.createElement("code", {
    style: {
      color: 'var(--accent-2)'
    }
  }, "email"), " or ", /*#__PURE__*/React.createElement("code", {
    style: {
      color: 'var(--accent-2)'
    }
  }, "phone"), ".", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-2)'
    }
  }, "Recognized:"), " name / full name / voornaam + achternaam, phone / tel, language, tags, notes, consent.", /*#__PURE__*/React.createElement("br", null), "Dedupe runs against existing customers (by email, falling back to phone).")), step === 'preview' && job && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card__label"
  }, "Total rows"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card__value"
  }, job.counts.total)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card__label"
  }, "New"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card__value",
    style: {
      color: 'var(--ok)'
    }
  }, job.counts.new)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card__label"
  }, "Duplicates"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card__value",
    style: {
      color: 'var(--warn)'
    }
  }, job.counts.duplicate)), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card__label"
  }, "Invalid"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card__value",
    style: {
      color: 'var(--err)'
    }
  }, job.counts.invalid))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      marginBottom: 6
    }
  }, "Optional tag"), /*#__PURE__*/React.createElement("input", {
    placeholder: "e.g. reactivation-2025-q2",
    value: tag,
    onChange: e => setTag(e.target.value),
    style: {
      width: 'min(320px, 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: 12,
      marginTop: 4
    }
  }, "Added to every imported customer alongside ", /*#__PURE__*/React.createElement("code", {
    style: {
      color: 'var(--accent-2)'
    }
  }, "imported-YYYY-MM-DD"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "import-preview"
  }, /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "#"), /*#__PURE__*/React.createElement("th", null, "Email"), /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Phone"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, job.preview.map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.index
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono shrink"
  }, p.index + 1), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, p.customer.email || '—'), /*#__PURE__*/React.createElement("td", null, p.customer.full_name || '—'), /*#__PURE__*/React.createElement("td", null, p.customer.phone || '—'), /*#__PURE__*/React.createElement("td", null, p.status === 'new' && /*#__PURE__*/React.createElement("span", {
    className: "chip chip--confirmed"
  }, "new"), p.status === 'duplicate' && /*#__PURE__*/React.createElement("span", {
    className: "chip chip--pending"
  }, "duplicate"), p.status === 'invalid' && /*#__PURE__*/React.createElement("span", {
    className: "chip chip--cancelled"
  }, "invalid"), p.reason && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: 11,
      marginLeft: 6
    }
  }, p.reason)))))), job.counts.total > job.preview.length && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      color: 'var(--muted)',
      fontSize: 12,
      borderTop: '1px solid var(--line)'
    }
  }, "+ ", job.counts.total - job.preview.length, " more rows hidden from preview.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn--primary",
    onClick: commit,
    disabled: busy || !job.counts.new
  }, busy ? 'Importing…' : `Import ${job.counts.new} new customers`), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: reset,
    disabled: busy
  }, "Start over"))), step === 'done' && /*#__PURE__*/React.createElement("div", {
    className: "empty",
    style: {
      padding: '40px 30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty__h"
  }, "Import complete"), /*#__PURE__*/React.createElement("p", null, "Your past clients are now in the database with their tags. They show up in Customers and in the Hermes ", /*#__PURE__*/React.createElement("code", {
    style: {
      color: 'var(--accent-2)'
    }
  }, "/past-clients"), " endpoint."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: 'flex',
      gap: 8,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn--primary",
    href: "#/customers"
  }, "View customers \u2192"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: reset
  }, "Import another")))));
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
    const [{
      data: a
    }, {
      data: act
    }] = await Promise.all([sb().from('hermes_agents').select('*').order('created_at', {
      ascending: false
    }), sb().from('hermes_activity').select('*, customer:customers(email, full_name)').order('created_at', {
      ascending: false
    }).limit(100)]);
    setAgents(a || []);
    setActivity(act || []);
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  async function createAgent() {
    if (!newName.trim()) return;
    setBusy(true);
    const res = await authedFetch('/.netlify/functions/create-agent-key', {
      method: 'POST',
      body: JSON.stringify({
        name: newName,
        description: newDesc || undefined
      })
    });
    setBusy(false);
    const j = await res.json();
    if (!res.ok) {
      toast.push(j.error || 'Could not create', 'err');
      return;
    }
    setShowKey({
      name: j.agent.name,
      key: j.apiKey
    });
    setNewName('');
    setNewDesc('');
    setCreating(false);
    load();
  }
  async function setStatus(id, status) {
    const {
      error
    } = await sb().from('hermes_agents').update({
      status
    }).eq('id', id);
    if (error) toast.push(error.message, 'err');else {
      toast.push(`Agent ${status}`);
      load();
    }
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Hermes",
    sub: loading ? 'Loading…' : `${agents.length} agents · ${activity.length} recent events`,
    right: /*#__PURE__*/React.createElement("button", {
      className: "btn btn--primary",
      onClick: () => setCreating(true)
    }, "+ New agent")
  }), /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, showKey && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      background: 'rgba(94,106,210,0.08)',
      border: '1px solid rgba(94,106,210,0.3)',
      borderRadius: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 6
    }
  }, "API key for \u201C", showKey.name, "\u201D"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: 12,
      marginBottom: 8
    }
  }, "This is the only time you can see this key. Store it in the agent's secret store now."), /*#__PURE__*/React.createElement("div", {
    className: "key-reveal"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, showKey.key), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      navigator.clipboard.writeText(showKey.key);
      toast.push('Copied');
    }
  }, "Copy")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setShowKey(null)
  }, "Done"))), creating && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 8
    }
  }, "New agent"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Name (e.g. Reactivation Agent)",
    autoFocus: true,
    value: newName,
    onChange: e => setNewName(e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Description (optional)",
    value: newDesc,
    onChange: e => setNewDesc(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn--primary",
    onClick: createAgent,
    disabled: busy || !newName.trim()
  }, busy ? 'Creating…' : 'Create & reveal key'), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setCreating(false)
  }, "Cancel"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8,
      marginBottom: 24
    }
  }, agents.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    className: "agent-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: a.status === 'active' ? 'var(--ok)' : a.status === 'paused' ? 'var(--warn)' : 'var(--err)'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "agent-card__name"
  }, a.name), /*#__PURE__*/React.createElement("div", {
    className: "agent-card__sub"
  }, a.api_key_prefix, "\u2026 \xB7 ", a.status, " \xB7 last seen ", a.last_seen_at ? fmtDate(a.last_seen_at) : 'never'), a.description && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: 12,
      marginTop: 4
    }
  }, a.description)), /*#__PURE__*/React.createElement("div", {
    className: "agent-card__right"
  }, a.status === 'active' && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setStatus(a.id, 'paused')
  }, "Pause"), a.status === 'paused' && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setStatus(a.id, 'active')
  }, "Resume"), a.status !== 'revoked' && /*#__PURE__*/React.createElement("button", {
    className: "btn btn--danger",
    onClick: () => {
      if (confirm('Revoke this agent? Its API key will stop working.')) setStatus(a.id, 'revoked');
    }
  }, "Revoke")))), !loading && !agents.length && /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty__h"
  }, "No Hermes agents connected"), /*#__PURE__*/React.createElement("p", null, "Create a key, copy it once, and paste it into your Hermes agent's ", /*#__PURE__*/React.createElement("code", {
    style: {
      color: 'var(--accent-2)'
    }
  }, "LUCA_API_KEY"), " env var."))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      marginBottom: 8
    }
  }, "Recent activity"), /*#__PURE__*/React.createElement("div", {
    className: "activity-feed"
  }, activity.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    className: "activity-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "activity-item__kind"
  }, a.kind.replace('_', ' ')), /*#__PURE__*/React.createElement("span", null, a.customer?.full_name || a.customer?.email || a.payload?.note || '—', a.payload?.subject && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, " \xB7 ", a.payload.subject)), /*#__PURE__*/React.createElement("span", {
    className: "activity-item__time"
  }, fmtDateTime(a.created_at)))), !activity.length && /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty__h"
  }, "No activity yet"), /*#__PURE__*/React.createElement("p", null, "Hermes will post here every time it sends, gets a reply, or recovers a booking."))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      padding: '14px 16px',
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 6
    }
  }, "Integration cheat sheet"), /*#__PURE__*/React.createElement("pre", {
    style: {
      margin: 0,
      padding: '10px 12px',
      background: 'var(--bg-2)',
      borderRadius: 6,
      fontSize: 11.5,
      fontFamily: 'JetBrains Mono, monospace',
      color: 'var(--text-2)',
      whiteSpace: 'pre-wrap',
      lineHeight: 1.6
    }
  }, `# Past clients (GET)
curl -H "Authorization: Bearer $LUCA_API_KEY" \\
  "${location.origin}/api/hermes/past-clients?tag=imported-2025-05&limit=200"

# Post activity (POST)
curl -X POST -H "Authorization: Bearer $LUCA_API_KEY" -H "Content-Type: application/json" \\
  -d '{"kind":"message_sent","customer_email":"jane@example.com","payload":{"subject":"We missed you"}}' \\
  "${location.origin}/api/hermes/activity"`))));
}

// ─────────────────────────────  Root  ─────────────────────────────
function App() {
  const auth = useAuth();
  if (auth.loading) return null;
  if (!auth.user) return /*#__PURE__*/React.createElement(Login, null);
  if (!auth.profile) {
    return /*#__PURE__*/React.createElement("div", {
      className: "login"
    }, /*#__PURE__*/React.createElement("div", {
      className: "login__card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "login__brand"
    }, "LUCA \xB7 ADMIN"), /*#__PURE__*/React.createElement("div", {
      className: "login__title"
    }, "You're signed in, but not an admin."), /*#__PURE__*/React.createElement("div", {
      className: "login__sub"
    }, "An existing admin needs to add your account to ", /*#__PURE__*/React.createElement("code", {
      style: {
        color: 'var(--accent-2)'
      }
    }, "admin_profiles"), ". Once they do, refresh."), /*#__PURE__*/React.createElement("button", {
      className: "btn login__submit",
      onClick: () => sb().auth.signOut()
    }, "Sign out")));
  }
  return /*#__PURE__*/React.createElement(Shell, {
    auth: auth
  });
}
window.LUCA_mountAdmin = function () {
  const root = document.getElementById('admin-root');
  root.removeAttribute('data-loading');
  root.innerHTML = '';
  ReactDOM.createRoot(root).render(React.createElement(ToastProvider, null, React.createElement(App)));
};
