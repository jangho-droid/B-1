import { addDays, isISO, localToday, md } from './lib/date.js';
import { MATERIALS, isOpen, levelFor, remain, sortItems, uid } from './lib/pbc.js';
import { seedData } from './lib/seed.js';

const KEY = 'salsal.v1';
const KEEP = ['items', 'todos', 'done', 'me', 'todayOverride'];

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.items) && Array.isArray(d.todos) && Array.isArray(d.done) && d.me) return { ...seedData(), ...d };
  } catch (e) { /* 저장소 접근 불가 → 시연 데이터 */ }
  return seedData();
}
function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(KEEP.map((k) => [k, s[k]])))); } catch (e) { /* 시크릿 모드 등 */ }
}

export const todayOf = (s) => (isISO(s.todayOverride) ? s.todayOverride : localToday());
const lastMonthEnd = (t) => addDays(t.slice(0, 8) + '01', -1);

export const freshCompose = (today) => ({ picked: [], client: '', toName: '', toDept: '', toEmail: '', asOf: lastMonthEnd(today), due: addDays(today, 7), tone: 0 });
const freshAnalyze = () => ({ text: '', result: null, checks: {}, statusTo: {}, applied: false });

function initial() {
  const d = load();
  return {
    ...d, tab: 'dash', sort: 'due', statusF: '전체', clientF: '전체', kpiF: null, mView: 'items',
    panel: null, toast: null, highlight: [], doneOpen: false, meOpen: false, dateOpen: false,
    compose: freshCompose(todayOf(d)), analyze: freshAnalyze(),
  };
}

// 상태 하나 + 구독. set(patch | (state) => patch, { skip })에서 skip은 지금 입력 중인 영역 이름.
let state = initial();
const subs = new Set();
let toastTimer = 0;
export const getState = () => ({ ...state, today: todayOf(state) });
export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
export function set(o, opts = {}) {
  const prev = state;
  const patch = typeof o === 'function' ? o(getState()) : o;
  if (!patch) return;
  state = { ...state, ...patch };
  if (['items', 'todos', 'done', 'me', 'todayOverride'].some((k) => state[k] !== prev[k])) save(state);
  if (state.toast && state.toast !== prev.toast) {
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: null }), 2800);
  }
  subs.forEach((fn) => fn(getState(), prev, opts));
}

const focusItem = (it) => ({ panel: null, tab: 'dash', mView: 'items', statusF: '전체', clientF: '전체', kpiF: null, highlight: [it.id] });

export const A = {
  openSingle: (it) => (s) => ({ panel: { type: 'single', ids: [it.id], level: levelFor(remain(it, s.today)), excluded: [] } }),
  openBundle: (owner) => (s) => {
    const l = sortItems(s.items, 'due', s.today).filter((i) => i.owner === owner && isOpen(i));
    return { panel: { type: 'bundle', owner, ids: l.map((i) => i.id), level: levelFor(remain(l[0], s.today)), excluded: [] } };
  },
  updateItem: (id, o) => (s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...o } : i)) }),
  setStatus: (id, status) => (s) => {
    const it = s.items.find((i) => i.id === id);
    const o = { status };
    if (status === '보완 요청' && !it.reason) Object.assign(o, { reason: '기준일 상이', detail: it.asOf });
    const items = s.items.map((i) => (i.id === id ? { ...i, ...o } : i));
    const next = items.find((i) => i.id === id);
    return {
      items, highlight: [id],
      panel: status === '보완 요청' ? { type: 'single', ids: [id], level: levelFor(remain(next, s.today)), excluded: [] } : s.panel,
      toast: `${it.name} 상태를 ‘${status}’(으)로 바꿨어요.`,
    };
  },
  deleteItem: (id) => (s) => {
    const it = s.items.find((i) => i.id === id);
    return { items: s.items.filter((i) => i.id !== id), todos: s.todos.map((t) => (t.link === id ? { ...t, link: null } : t)), panel: null, toast: `${it.name}을(를) 요청 현황에서 지웠어요.` };
  },
  addTiming: (s) => {
    const p = s.panel;
    const ids = p.ids.filter((id) => !p.excluded.includes(id));
    const it = s.items.find((i) => i.id === ids[0]);
    const next = addDays(s.today, remain(it, s.today) <= 3 ? 1 : 2);
    const id = uid('tm');
    const text = p.type === 'bundle' ? `${it.owner}님 자료 ${ids.length}건 회신 확인` : `${it.name} 회신 확인`;
    return { todos: [...s.todos, { id, text, due: next, link: it.id, src: '발송 시점' }], panel: { ...p, todoAdded: true }, highlight: [id], toast: `할 일에 추가했어요. ${md(next)} 오전에 확인해 주세요.` };
  },
  markSent: (s) => {
    const p = s.panel;
    const ids = p.ids.filter((id) => !p.excluded.includes(id));
    const first = s.items.find((i) => i.id === ids[0]);
    const fix = p.type === 'single' && first.status === '보완 요청';
    const text = p.type === 'bundle' ? `${first.owner}님께 독촉 메일 (${ids.length}건)` : fix ? `${first.name} 보완 요청 메일 발송` : `${first.owner}님께 독촉 메일 · ${first.name}`;
    const id = uid('sd');
    return {
      items: s.items.map((i) => (ids.includes(i.id) ? { ...i, nudges: (i.nudges || 0) + 1, last: s.today } : i)),
      done: [{ id, text, date: s.today, src: '독촉 기록' }, ...s.done],
      panel: null, doneOpen: true, highlight: [id, first.owner, ...ids], toast: '독촉 횟수를 기록했어요. 내가 한 일에 남겼어요.',
    };
  },
  register: (s) => {
    const c = s.compose;
    const add = MATERIALS.filter((m) => c.picked.includes(m.id)).map((m) => ({
      id: uid('i'), isNew: true, client: c.client.trim(), name: m.name, owner: c.toName.trim(), dept: c.toDept.trim(), email: c.toEmail.trim(),
      asOf: c.asOf, req: s.today, due: c.due, status: '미회신', nudges: 0,
    }));
    return {
      items: [...s.items.map((i) => (i.isNew ? { ...i, isNew: false } : i)), ...add],
      tab: 'dash', mView: 'items', kpiF: null, statusF: '전체', clientF: '전체', highlight: add.map((a) => a.id),
      compose: { ...c, picked: [] }, toast: `요청 현황에 ${add.length}건 등록했어요.`,
    };
  },
  completeTodo: (id) => (s) => {
    const t = s.todos.find((x) => x.id === id);
    return { todos: s.todos.filter((x) => x.id !== id), done: [{ ...t, date: s.today, wasTodo: true }, ...s.done] };
  },
  undoDone: (id) => (s) => {
    const t = s.done.find((x) => x.id === id);
    const { date, wasTodo, ...rest } = t;
    return { done: s.done.filter((x) => x.id !== id), todos: [...s.todos, wasTodo ? rest : { id: rest.id, text: rest.text, src: rest.src || '직접' }], highlight: [id] };
  },
  addTodo: (text) => (s) => { const id = uid('u'); return { todos: [...s.todos, { id, text, due: '', src: '직접' }], highlight: [id] }; },
  focusItem: (it) => () => focusItem(it),
  applyAnalysis: (s) => {
    const a = s.analyze, R = a.result;
    const on = (x) => !!a.checks[x.id];
    const todos = R.todos.filter(on).map((t) => ({ id: uid('m'), text: t.text, due: t.due, link: t.link, src: '메일 분석', quote: t.quote }));
    const memos = R.todos.filter((t) => on(t) && t.memo).map((t) => t.memo);
    const done = R.done.filter(on).map((t) => ({ id: uid('m'), text: t.text, date: t.date, src: '메일 분석' }));
    const st = R.status.filter(on);
    const items = s.items.map((i) => {
      let n = i;
      const c = st.find((x) => x.item === i.id);
      if (c) n = { ...n, status: a.statusTo[c.id] };
      const mm = memos.find((x) => x.item === i.id);
      if (mm) n = { ...n, memo: mm.text };
      return n;
    });
    return {
      items, todos: [...s.todos, ...todos], done: [...done, ...s.done], tab: 'dash', mView: 'items', kpiF: null, statusF: '전체', clientF: '전체',
      analyze: { ...a, applied: true }, doneOpen: done.length > 0 || s.doneOpen,
      highlight: [...todos.map((t) => t.id), ...st.map((x) => x.item), ...memos.map((x) => x.item), ...done.map((d) => d.id)],
      toast: `할 일 ${todos.length}건 · 한 일 ${done.length}건 · 상태 ${st.length}건 반영했어요.`,
    };
  },
  reset: () => {
    const d = seedData();
    return { ...d, panel: null, highlight: [], tab: 'dash', kpiF: null, statusF: '전체', clientF: '전체', compose: freshCompose(todayOf(d)), analyze: freshAnalyze(), meOpen: false, dateOpen: false, toast: '시연 데이터로 되돌렸어요.' };
  },
  clearAll: () => ({ items: [], todos: [], done: [], todayOverride: null, panel: null, highlight: [], tab: 'dash', kpiF: null, statusF: '전체', clientF: '전체', meOpen: false, dateOpen: false, toast: '모든 데이터를 지웠어요.' }),
};
