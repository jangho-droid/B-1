import { html } from './html.js';
import { A, getState, set, subscribe } from './store.js';
import { isISO, localToday } from './lib/date.js';
import { analyzeThread } from './lib/analyze.js';
import { copyText } from './lib/clipboard.js';
import { DEMO_THREAD, DEMO_TODAY } from './lib/seed.js';
import * as Shell from './views/shell.js';
import * as Dash from './views/dashboard.js';
import * as Drawer from './views/drawer.js';
import * as Compose from './views/compose.js';
import * as Analyze from './views/analyze.js';

// 영역 이름 → 그리는 함수
const R = {
  top: Shell.top, datepop: Shell.datepop, mepop: Shell.mepop, hero: Shell.hero, foot: Shell.foot, toast: Shell.toast,
  kpis: Dash.kpis, mswitch: Dash.mswitch, mtop: Dash.mtop, todos: Dash.todos, done: Dash.done, items: Dash.items,
  'dr-h': Drawer.drH, 'dr-a': Drawer.drA, 'dr-lvl': Drawer.drLvl, 'dr-mail': Drawer.drMail, 'dr-time': Drawer.drTime, 'dr-info': Drawer.drInfo, 'dr-f': Drawer.drF,
  'c-count': Compose.cCount, 'c-mats': Compose.cMats, 'c-form': Compose.cForm, 'c-preview': Compose.cPreview,
  'an-btns': Analyze.anBtns, 'an-note': Analyze.anNote, 'an-right': Analyze.anRight,
};
const SCREENS = { dash: Dash.skeleton, compose: () => Compose.skeleton, analyze: Analyze.skeleton };

const root = document.getElementById('root');
root.innerHTML = html`<div class="pbc-app theme-3 v3-app">
  <header class="v3-top" data-region="top"></header>
  <div class="rg" data-region="datepop"></div><div class="rg" data-region="mepop"></div>
  <div class="v3-hero" data-region="hero"></div>
  <main class="v3-main" id="main"></main>
  <footer class="v3-foot" data-region="foot"></footer>
  <div id="drawer" hidden>${Drawer.skeleton}</div>
  <div class="rg" data-region="toast" aria-live="polite"></div>
</div>`.s;
const main = document.getElementById('main'), drawer = document.getElementById('drawer');
const cache = new WeakMap();
let curTab = null, curPanel = null;

// 다시 그려도 포커스·커서·스크롤을 지킨다
const focusKey = (el) => (el.dataset.in ? `[data-in="${el.dataset.in}"]` : el.dataset.act ? `[data-act="${el.dataset.act}"]${el.dataset.v != null ? `[data-v="${CSS.escape(el.dataset.v)}"]` : ''}` : el.dataset.key ? `[data-key="${el.dataset.key}"]` : null);
function paint(s, skip) {
  if (s.tab !== curTab) { main.innerHTML = SCREENS[s.tab](s).s; curTab = s.tab; window.scrollTo(0, 0); }
  const dash = main.querySelector('.v3-dash');
  if (dash) dash.className = 'v3-dash show-' + s.mView;
  const panelKey = s.panel ? s.panel.type + s.panel.ids.join() : null;
  drawer.hidden = !s.panel;
  if (panelKey !== curPanel) { curPanel = panelKey; const b = drawer.querySelector('.pbc-drawer-b'); if (b) b.scrollTop = 0; }
  document.body.style.overflow = s.panel ? 'hidden' : '';
  root.querySelectorAll('[data-region]').forEach((el) => {
    const name = el.dataset.region;
    if (name === skip || !R[name]) return;
    const h = R[name](s).s;
    if (cache.get(el) === h) return;
    const a = document.activeElement, keep = a && el.contains(a) ? focusKey(a) : null;
    const sel = keep && 'selectionStart' in a ? [a.selectionStart, a.selectionEnd] : null;
    el.innerHTML = h; cache.set(el, h);
    if (keep) { const n = el.querySelector(keep); if (n) { n.focus({ preventScroll: true }); if (sel) try { n.setSelectionRange(...sel); } catch (e) { /* date 입력 등 */ } } }
  });
}
subscribe((s, prev, opts) => paint(s, opts.skip));
paint(getState());

// ── 동작 ──
const item = (s, id) => s.items.find((i) => i.id === id);
const copyFlash = () => setTimeout(() => set((st) => (st.panel && st.panel.copied ? { panel: { ...st.panel, copied: false } } : null)), 2000);
const COPY_FAIL = '복사가 막혀 있어 본문을 선택해 두었어요. Ctrl+C로 복사해 주세요.';

const ACT = {
  tab: (v) => set({ tab: v, panel: null, meOpen: false, dateOpen: false }),
  toggleDate: () => set((s) => ({ dateOpen: !s.dateOpen, meOpen: false })),
  toggleMe: () => set((s) => ({ meOpen: !s.meOpen, dateOpen: false })),
  closePops: () => set({ meOpen: false, dateOpen: false }),
  realToday: () => set({ todayOverride: null }),
  demoToday: () => set({ todayOverride: DEMO_TODAY }),
  reset: () => { if (confirm('시연 데이터로 되돌릴까요? 지금까지 입력한 내용은 지워져요.')) set(A.reset); },
  clearAll: () => { if (confirm('요청 현황·할 일·한 일을 모두 비울까요? 실제 업무를 새로 시작할 때 쓰세요.')) set(A.clearAll); },
  kpi: (v) => set((s) => ({ kpiF: s.kpiF === v ? null : v, statusF: '전체', mView: 'items' })),
  mView: (v) => set({ mView: v === '1' ? 'todos' : 'items' }),
  sort: (v) => set({ sort: v === '1' ? 'elapsed' : 'due' }),
  statusF: (v) => set({ statusF: v, kpiF: null }),
  clientF: (v) => set({ clientF: v }),
  status: (id, el) => set(A.setStatus(id, el.value)),
  openSingle: (id) => set((s) => A.openSingle(item(s, id))(s)),
  openBundle: (o) => set(A.openBundle(o)),
  focusItem: (id) => set((s) => A.focusItem(item(s, id))()),
  completeTodo: (id) => set(A.completeTodo(id)),
  undoDone: (id) => set(A.undoDone(id)),
  toggleDone: () => set((s) => ({ doneOpen: !s.doneOpen })),
  addTodo: () => { const el = main.querySelector('[data-key="newTodo"]'); const t = el.value.trim(); if (t) { el.value = ''; set(A.addTodo(t)); } },
  closePanel: () => set({ panel: null }),
  toggleExclude: (id) => set((s) => ({ panel: { ...s.panel, copied: false, excluded: s.panel.excluded.includes(id) ? s.panel.excluded.filter((x) => x !== id) : [...s.panel.excluded, id] } })),
  reason: (rz) => set((s) => { const f = item(s, s.panel.ids[0]); return { ...A.updateItem(f.id, { reason: rz, detail: rz === '기준일 상이' ? f.asOf : rz === f.reason ? f.detail : '' })(s), panel: { ...s.panel, copied: false } }; }),
  level: (v) => set((s) => ({ panel: { ...s.panel, level: +v + 1, copied: false } })),
  addTiming: () => set(A.addTiming),
  markSent: () => set(A.markSent),
  deleteItem: (id) => set((s) => (confirm(`${item(s, id).name}을(를) 요청 현황에서 지울까요?`) ? A.deleteItem(id)(s) : null)),
  copyMail: async () => {
    const m = Drawer.panelModel(getState());
    if (!m || !m.mail) return;
    const ok = await copyText(`${m.mail.subject}\n\n${m.mail.body}`, document.getElementById('mailBody'));
    if (!ok) return set({ toast: COPY_FAIL });
    set((s) => ({ panel: { ...s.panel, copied: true } })); copyFlash();
  },
  pick: (id) => set((s) => { const p = s.compose.picked; return { compose: { ...s.compose, picked: p.includes(id) ? p.filter((x) => x !== id) : [...p, id] } }; }),
  toNudge: (id) => set((s) => ({ tab: 'dash', ...A.openSingle(item(s, id))(s) })),
  tone: (v) => set((s) => ({ compose: { ...s.compose, tone: +v } })),
  copyRequest: async () => {
    const { mail } = Compose.composeModel(getState());
    const ok = await copyText(`${mail.subject}\n\n${mail.body}`, document.getElementById('reqBody'));
    set({ toast: ok ? '메일 문안을 복사했어요. 요청 현황에는 등록하지 않았어요.' : COPY_FAIL });
  },
  register: async () => {
    const { mail, picked } = Compose.composeModel(getState());
    await copyText(`${mail.subject}\n\n${mail.body}`, document.getElementById('reqBody'));
    set((s) => A.register({ ...s, compose: { ...s.compose, picked: picked.map((m) => m.id) } }));
  },
  demoThread: () => { main.querySelector('[data-in="an.text"]').value = DEMO_THREAD; set((s) => ({ analyze: { ...s.analyze, text: DEMO_THREAD, result: null, applied: false } })); },
  analyze: () => set((s) => {
    const r = analyzeThread(s.analyze.text, s), checks = {};
    [...r.todos, ...r.done].forEach((x) => { checks[x.id] = !x.dup; });
    r.status.forEach((x) => { checks[x.id] = true; });
    return { analyze: { ...s.analyze, result: r, checks, statusTo: Object.fromEntries(r.status.map((x) => [x.id, x.to])), applied: false } };
  }),
  anCheck: (id) => set((s) => ({ analyze: { ...s.analyze, checks: { ...s.analyze.checks, [id]: !s.analyze.checks[id] } } })),
  applyAnalysis: () => set(A.applyAnalysis),
};

function run(el, e) {
  const [act, arg] = el.dataset.act.split(':');
  if (act === 'anStatus') { // 메일 분석 상태 선택: data-act="anStatus:<항목 id>", data-v=선택 인덱스
    const i = +el.dataset.v;
    set((s) => { const t = s.analyze.result.status.find((x) => x.id === arg); return { analyze: { ...s.analyze, statusTo: { ...s.analyze.statusTo, [arg]: t.options[i] } } }; });
    return;
  }
  if (ACT[act]) ACT[act](el.dataset.v, el, e);
}

root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || !el.dataset.act || el.disabled || el.matches('select, input')) return;
  if (el.tagName === 'A') e.preventDefault();
  e.stopPropagation();
  run(el, e);
});
root.addEventListener('change', (e) => {
  const el = e.target;
  if (el.matches('select[data-act], input[type=checkbox][data-act]')) run(el, e);
});
root.addEventListener('keydown', (e) => {
  const el = e.target;
  if (el.matches('[role=button][data-act]') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (el.dataset.act) run(el, e); }
  if (el.dataset.key === 'newTodo' && e.key === 'Enter' && !e.isComposing) ACT.addTodo();
  if (e.key === 'Escape') set({ panel: null, meOpen: false, dateOpen: false });
});

// 입력: 지금 입력 중인 영역은 다시 그리지 않는다 (한글 조합 보호)
const regionOf = (el) => el.closest('[data-region]')?.dataset.region;
const INPUT = {
  today: (v) => isISO(v) && { todayOverride: v === localToday() ? null : v },
  'me.name': (v, s) => ({ me: { ...s.me, name: v } }),
  'me.email': (v, s) => ({ me: { ...s.me, email: v } }),
  'me.firm': (v, s) => ({ me: { ...s.me, firm: v } }),
  'me.team': (v, s) => ({ me: { ...s.me, team: v } }),
  'item.detail': (v, s) => ({ ...A.updateItem(s.panel.ids[0], { detail: v })(s), panel: { ...s.panel, copied: false } }),
  'item.left': (v, s) => ({ ...A.updateItem(s.panel.ids[0], { left: v })(s), panel: { ...s.panel, copied: false } }),
  'item.due': (v, s) => isISO(v) && A.updateItem(s.panel.ids[0], { due: v })(s),
  'item.asOf': (v, s) => isISO(v) && A.updateItem(s.panel.ids[0], { asOf: v })(s),
  'c.client': (v, s) => ({ compose: { ...s.compose, client: v } }),
  'c.toName': (v, s) => {
    const c = s.compose, all = Compose.contactsOf(s);
    const k = all.find((x) => x.name === v && (!c.client || x.client === c.client)) || all.find((x) => x.name === v);
    return { compose: k ? { ...c, toName: v, toDept: k.dept || c.toDept, toEmail: k.email || c.toEmail, client: c.client || k.client } : { ...c, toName: v } };
  },
  'c.toDept': (v, s) => ({ compose: { ...s.compose, toDept: v } }),
  'c.toEmail': (v, s) => ({ compose: { ...s.compose, toEmail: v } }),
  'c.asOf': (v, s) => ({ compose: { ...s.compose, asOf: v } }),
  'c.due': (v, s) => ({ compose: { ...s.compose, due: v } }),
  'an.text': (v, s) => ({ analyze: { ...s.analyze, text: v, result: null, applied: false } }),
};
root.addEventListener('input', (e) => {
  const el = e.target, key = el.dataset.in;
  if (!key || !INPUT[key]) return;
  const before = key === 'c.toName' ? getState().compose : null;
  set((s) => INPUT[key](el.value, s) || null, { skip: regionOf(el) });
  // 담당자를 골라 부서·이메일이 자동으로 채워졌다면 그 칸에도 반영
  if (before) {
    const c = getState().compose;
    ['client', 'toDept', 'toEmail'].forEach((f) => { if (c[f] !== before[f]) { const n = root.querySelector(`[data-in="c.${f}"]`); if (n) n.value = c[f]; } });
  }
});
