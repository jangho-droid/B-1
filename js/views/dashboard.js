import { html, icon, cls, check, seg, chip } from '../html.js';
import { diff, md, mdw } from '../lib/date.js';
import { STATUSES, URG_TEXT, counts, elapsed, isOpen, ranks, remain, sortItems, urg } from '../lib/pbc.js';

const ST_CLASS = { '미회신': 'wait', '일부 수령': 'ok', '보완 요청': 'fix', '완료': 'done' };
const hl = (s, id) => s.highlight.includes(id);
const btnLabel = (it) => (it.status === '보완 요청' ? '보완 요청' : '독촉 메일');

const tag = (d, today) => {
  if (!d) return html`<span class="v3-tag">기한 없음</span>`;
  const r = diff(d, today);
  return html`<span class="${cls('v3-tag', r <= 0 && 'late')}">${r < 0 ? `${md(d)} · 지남` : r === 0 ? '오늘' : mdw(d)}</span>`;
};
export const urgPill = (r) => {
  const k = urg(r);
  return html`<span class="v3-pill u-${k}">${k === 'over' ? `${-r}일 지남` : k === 'today' ? '오늘 기한' : k === 'soon' ? `D-${r} 임박` : `D-${r} 여유`}</span>`;
};
const statusSel = (it) => html`<select class="v3-st s-${ST_CLASS[it.status]}" data-act="status" data-v="${it.id}" aria-label="${it.name} 상태">${STATUSES.map((x) => html`<option ${x === it.status ? html`selected` : ''}>${x}</option>`)}</select>`;

// 화면 뼈대: 영역(data-region)마다 따로 다시 그린다.
export const skeleton = (s) => html`<div class="v3-dash show-${s.mView}">
  <div class="v3-kpis" data-region="kpis"></div>
  <div class="v3-mswitch" data-region="mswitch"></div>
  <div class="rg" data-region="mtop"></div>
  <div class="v3-cols">
    <section class="v3-card wide">
      <div class="v3-card-h"><h2>해야 할 일</h2><span class="v3-hint">회신 기한·메일 분석·발송 시점에서 모아요 · 체크하면 완료</span></div>
      <div class="rg" data-region="todos"></div>
      <div class="v3-add"><input placeholder="할 일을 입력해 주세요." data-key="newTodo" aria-label="새 할 일"><button type="button" data-act="addTodo" aria-label="할 일 추가">${icon('plus', 18)}</button></div>
    </section>
    <section class="v3-card narrow" data-region="done"></section>
  </div>
  <section class="v3-card v3-items" data-region="items"></section>
</div>`;

export const kpis = (s) => {
  const c = counts(s.items, s.today);
  return html`${[['today', '오늘 기한', c.today], ['over', '기한 지남', c.over], ['soon', '3일 이내', c.soon]].map(([k, l, v]) => html`
    <button type="button" class="${cls('v3-kpi', s.kpiF === k && 'on')}" aria-pressed="${s.kpiF === k}" data-act="kpi" data-v="${k}"><span>${l}${icon('chevronRight', 14)}</span><b class="${k !== 'soon' && v ? 'hot' : ''}">${v}</b></button>`)}
    <div class="v3-kpi static"><span>남은 할 일</span><b>${s.todos.length}</b></div>`;
};

export const mswitch = (s) => seg([`요청 현황 ${s.items.filter(isOpen).length}`, `할 일 ${s.todos.length}`], s.mView === 'items' ? 0 : 1, 'mView');

export const mtop = (s) => {
  const t = sortItems(s.items, s.sort, s.today).find(isOpen);
  if (!t) return html``;
  return html`<div class="v3-mtop">
    <span class="v3-mtop-k">${s.sort === 'due' ? '회신 기한순' : '경과일순'} 1순위</span>
    <div class="v3-mtop-h"><b>${t.name}</b>${urgPill(remain(t, s.today))}</div>
    <span class="v3-sub">${t.owner}${t.dept ? ` · ${t.dept}` : ''} · ${t.client} · 회신 기한 ${mdw(t.due)}</span>
    <button type="button" class="v3-btn primary" data-act="openSingle" data-v="${t.id}">${btnLabel(t)}</button>
  </div>`;
};

export const todos = (s) => {
  const list = [...s.todos].sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  if (!list.length) return html`<div class="v3-empty">남은 할 일이 없어요.</div>`;
  return html`${list.map((t) => {
    const it = s.items.find((i) => i.id === t.link);
    return html`<div class="${cls('v3-row', hl(s, t.id) && 'hl')}">
      ${check(false, 'completeTodo', t.id, `${t.text} 완료`)}
      <div class="v3-row-b"><b>${t.text}</b>
        <span class="v3-meta">${tag(t.due, s.today)}${it ? html`<button type="button" class="v3-linkb" data-act="focusItem" data-v="${it.id}">${it.name}</button>` : ''}<span>출처 · ${t.src}</span>${t.quote ? html`<span>근거 · “${t.quote}”</span>` : ''}</span>
      </div>
      ${it && isOpen(it) ? html`<button type="button" class="v3-btn sm" data-act="openSingle" data-v="${it.id}">문구 작성</button>` : ''}
    </div>`;
  })}`;
};

export const done = (s) => {
  const recent = s.done.filter((t) => diff(s.today, t.date) <= 6 && diff(s.today, t.date) >= 0);
  const shown = s.doneOpen ? recent : recent.slice(0, 3);
  return html`<div class="v3-card-h"><h2>내가 한 일</h2><span class="v3-hint">최근 7일 · 체크를 풀면 되돌려요</span></div>
    ${shown.map((t) => html`<div class="${cls('v3-row done', hl(s, t.id) && 'hl')}">${check(true, 'undoDone', t.id, `${t.text} 되돌리기`)}<span class="v3-date">${md(t.date)}</span><div class="v3-row-b"><span>${t.text}</span><span class="v3-meta"><span>${t.src}</span></span></div></div>`)}
    ${recent.length ? '' : html`<div class="v3-empty">최근 7일 동안 기록이 없어요.</div>`}
    ${recent.length > 3 ? html`<button type="button" class="v3-more" data-act="toggleDone">${s.doneOpen ? '접기' : `${recent.length - 3}건 더 보기`}${icon(s.doneOpen ? 'chevronUp' : 'chevronDown')}</button>` : ''}`;
};

function visibleRows(s) {
  let rows = sortItems(s.items, s.sort, s.today);
  if (s.clientF !== '전체') rows = rows.filter((i) => i.client === s.clientF);
  if (s.kpiF) rows = rows.filter((i) => isOpen(i) && urg(remain(i, s.today)) === s.kpiF);
  else if (s.statusF !== '전체') rows = rows.filter((i) => i.status === s.statusF);
  return rows;
}

export const items = (s) => {
  const rows = visibleRows(s), rk = ranks(s.items, s.today);
  const byOwner = {};
  sortItems(s.items, 'due', s.today).filter(isOpen).forEach((i) => { (byOwner[i.owner] = byOwner[i.owner] || []).push(i); });
  const bundles = Object.entries(byOwner).filter(([, l]) => l.length >= 2);
  const clients = [...new Set(s.items.map((i) => i.client))];
  const nC = { 전체: s.items.length };
  STATUSES.forEach((st) => (nC[st] = s.items.filter((i) => i.status === st).length));
  return html`
    <div class="v3-card-h"><h2>요청 자료 현황</h2>
      <div class="v3-card-r"><span class="v3-hint">${s.sort === 'due' ? '회신 기한까지 남은 일수가 적은 순' : '요청일이 오래된 순'} · 완료는 맨 아래</span>${seg(['회신 기한순', '경과일순'], s.sort === 'due' ? 0 : 1, 'sort', { width: 196, label: '정렬' })}</div>
    </div>
    <div class="v3-filter">
      <div class="v3-chips">${['전체', ...STATUSES].map((st) => chip(`${st} ${nC[st]}`, s.statusF === st && !s.kpiF, 'statusF', st))}
        ${s.kpiF ? html`<button type="button" class="v3-chip kpi" data-act="kpi" data-v="${s.kpiF}">${URG_TEXT[s.kpiF]} ${rows.length}${icon('close', 12)}</button>` : ''}</div>
      ${clients.length > 1 ? html`<select class="v3-sel" data-act="clientF" aria-label="클라이언트"><option value="전체">클라이언트 전체</option>${clients.map((x) => html`<option ${x === s.clientF ? html`selected` : ''}>${x}</option>`)}</select>` : ''}
    </div>
    ${bundles.map(([o, l]) => html`<div class="${cls('v3-bundle', hl(s, o) && 'hl')}"><span class="v3-sq">${l.length}</span><span><b>${o}님</b>${l[0].dept ? `(${l[0].dept})` : ''}의 미완료 ${l.length}건을 메일 한 통으로 보낼 수 있어요.</span><button type="button" class="v3-btn sm primary" data-act="openBundle" data-v="${o}">묶어서 독촉</button></div>`)}
    <table class="v3-table">
      <thead><tr><th>#</th><th>클라이언트</th><th>요청 자료</th><th>담당자</th><th>요청일</th><th>회신 기한</th><th>상태</th><th></th></tr></thead>
      <tbody>${rows.map((it, i) => {
        const r = remain(it, s.today), dn = !isOpen(it), k = rk[it.id];
        const jump = s.sort === 'due' && k && k.e - k.d >= 2;
        return html`<tr class="${cls(hl(s, it.id) && 'hl', dn && 'done')}">
          <td class="v3-num">${dn ? '–' : i + 1}</td><td>${it.client}</td>
          <td><b>${it.name}</b>${it.isNew ? html`<span class="v3-new">새로 등록</span>` : ''}${jump ? html`<div class="v3-jump">경과일순 ${k.e}위 → 회신 기한순 ${k.d}위</div>` : ''}${it.memo ? html`<div class="v3-memo">${it.memo}</div>` : ''}</td>
          <td>${it.owner}<div class="v3-sub">${it.dept}</div></td>
          <td class="v3-num">${md(it.req)}<div class="v3-sub">${elapsed(it, s.today)}일 경과</div></td>
          <td class="v3-num">${mdw(it.due)}${dn ? '' : html`<div>${urgPill(r)}</div>`}</td>
          <td>${statusSel(it)}${it.reason && it.status === '보완 요청' ? html`<div class="v3-sub">${it.reason}</div>` : ''}${it.nudges > 0 ? html`<div class="v3-nudge">독촉 ${it.nudges}회${it.last ? ` · 최근 ${md(it.last)}` : ''}</div>` : ''}</td>
          <td class="v3-act">${dn ? '' : html`<button type="button" class="${cls('v3-btn sm', r <= 0 && 'primary')}" data-act="openSingle" data-v="${it.id}">${btnLabel(it)}</button>`}</td>
        </tr>`;
      })}</tbody>
    </table>
    <div class="v3-mlist">${rows.map((it) => {
      const r = remain(it, s.today), dn = !isOpen(it);
      return html`<div class="${cls('v3-mcard', hl(s, it.id) && 'hl')}">
        <div class="v3-mcard-h"><b>${it.name}</b>${dn ? '' : urgPill(r)}</div>
        <div class="v3-mcard-m"><span>${it.owner} · ${it.client}</span><span>회신 기한 ${mdw(it.due)}</span>${statusSel(it)}</div>
        ${it.memo ? html`<div class="v3-memo">${it.memo}</div>` : ''}
        ${dn ? '' : html`<button type="button" class="${cls('v3-btn sm', r <= 0 && 'primary')}" data-act="openSingle" data-v="${it.id}">${btnLabel(it)}</button>`}
      </div>`;
    })}</div>
    ${rows.length ? '' : html`<div class="v3-empty">${s.items.length ? '해당하는 자료가 없어요.' : html`아직 요청한 자료가 없어요. <button type="button" class="v3-linkb" data-act="tab" data-v="compose">자료 요청 작성</button>에서 시작해 보세요.`}</div>`}`;
};
