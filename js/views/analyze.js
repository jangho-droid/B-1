import { html, icon, check, seg, btn, cls } from '../html.js';
import { diff, md, mdw } from '../lib/date.js';

export const skeleton = (s) => html`<div class="an-grid">
  <section class="pbc-card pbc-pad an-left">
    <div class="an-h"><h2>메일 붙여넣기</h2><span class="pbc-cap">스레드 전체를 붙여넣어도 돼요.</span></div>
    <textarea class="fld-ta" data-in="an.text" rows="18" placeholder="주고받은 메일을 그대로 붙여넣어 주세요. ‘보낸 사람:’, ‘From:’ 기준으로 나눠요." aria-label="메일 내용">${s.analyze.text}</textarea>
    <div class="pbc-actions" data-region="an-btns"></div>
    <p class="pbc-cap" style="margin:0" data-region="an-note"></p>
  </section>
  <span class="an-arrow" aria-hidden="true"></span>
  <div class="rg" data-region="an-right"></div>
</div>`;

export const anBtns = (s) => html`${btn({ label: '시연 스레드', act: 'demoThread', outlined: true })}${btn({ label: '분석하기', act: 'analyze', lead: 'search', disabled: !s.analyze.text.trim(), flex: true })}`;
export const anNote = (s) => html`보낸 사람이 내 정보(${s.me.email})와 같으면 ‘내가 한 일’로 분류해요. 붙여넣은 내용은 이 브라우저 밖으로 나가지 않아요.`;

const row = (a, t, inner) => html`<label class="${cls('an-row', !a.checks[t.id] && 'off')}">${check(!!a.checks[t.id], 'anCheck', t.id)}${inner}</label>`;

export const anRight = (s) => {
  const a = s.analyze, R = a.result;
  if (!R) return html`<section class="pbc-card pbc-pad an-right"><div class="pbc-empty tall">${icon('mail', 28)}메일을 붙여넣고 분석하기를 눌러 주세요.<span class="pbc-cap">한 줄 요약 · 해야 할 일 · 내가 한 일 · 상태 변경을 찾아요.</span></div></section>`;
  const nm = (id) => (s.items.find((i) => i.id === id) || {}).name;
  const n = (l) => l.filter((x) => a.checks[x.id]).length;
  const nT = n(R.todos), nD = n(R.done), nS = n(R.status);
  return html`<div class="an-right an-stack">
    <div class="pbc-notice">${icon('alert')}키워드로 찾은 후보입니다. 반영 전에 확인하세요.</div>
    ${R.warn ? html`<div class="pbc-notice">${R.warn}</div>` : ''}
    <section class="pbc-card an-card"><div class="an-h"><h2>한 줄 요약</h2><span class="pbc-cap">${R.summary}</span></div>
      <p class="an-sum">${R.parts.map(([t, k]) => (k ? html`<mark class="${k}">${t}</mark>` : html`<span>${t}</span>`))}</p></section>
    <section class="pbc-card an-card"><div class="an-h"><h2>해야 할 일 <span class="pbc-cap">${R.todos.length}건</span></h2></div>
      ${R.todos.map((t, i) => row(a, t, html`<span class="an-sq">${i + 1}</span>
        <div class="pbc-stack4" style="flex:1"><span class="pbc-name">${t.text}</span><span class="pbc-quote">근거 · “${t.quote}”</span>
        <span class="pbc-cap">${t.link ? `연결 자료 · ${nm(t.link)}` : '연결 자료 없음'}${t.memo ? ` · 메모 “${t.memo.text}”도 남겨요` : ''}${t.dup ? ' · 이미 할 일에 있어요' : ''}</span></div>
        <span class="${cls('an-tag', t.due && diff(t.due, s.today) <= 3 && 'late')}">${t.due ? mdw(t.due) : '기한 없음'}</span>`))}
      ${R.todos.length ? '' : html`<div class="v3-empty">찾은 할 일이 없어요.</div>`}</section>
    <div class="an-two">
      <section class="pbc-card an-card"><div class="an-h"><h2>내가 한 일</h2></div>
        ${R.done.map((t) => row(a, t, html`<span class="an-sq grey">${icon('check', 14)}</span><div class="pbc-stack4"><span class="pbc-name">${t.text}</span><span class="pbc-cap">${md(t.date)} · 내가 보낸 메일${t.dup ? ' · 이미 기록돼 있어요' : ''}</span></div>`))}
        ${R.done.length ? '' : html`<div class="v3-empty">내가 보낸 메일이 없어요.</div>`}</section>
      <section class="pbc-card an-card"><div class="an-h"><h2>요청 상태 변경</h2></div>
        ${R.status.map((t) => row(a, t, html`<div class="pbc-stack8" style="flex:1"><span class="pbc-name">${t.name}</span>
          <span class="pbc-row8"><span class="pbc-cap">${t.from} →</span>${seg(t.options, t.options.indexOf(a.statusTo[t.id]), 'anStatus:' + t.id, { width: 160 })}</span>
          <span class="pbc-quote">“${t.quote}”</span></div>`))}
        ${R.status.length ? '' : html`<div class="v3-empty">바꿀 상태가 없어요.</div>`}</section>
    </div>
    <div class="an-bar"><span class="pbc-cap">${a.applied ? '반영했어요. 대시보드에서 확인해 보세요.' : '체크한 항목만 대시보드에 반영해요.'}</span>
      ${btn({ label: `선택 항목 반영 · 할 일 ${nT} · 한 일 ${nD} · 상태 ${nS}`, act: 'applyAnalysis', disabled: a.applied || !(nT + nS + nD) })}</div>
  </div>`;
};
