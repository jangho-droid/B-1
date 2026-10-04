import { html, icon, iconBtn, textBtn, check, seg, field, btn, chip, cls } from '../html.js';
import { addDays, md } from '../lib/date.js';
import { LEVELS, REASONS, REASON_FIELD, levelFor, mailBundle, mailSingle, remain } from '../lib/pbc.js';
import { urgPill } from './dashboard.js';

// 문안 패널 계산을 한곳에서
export function panelModel(s) {
  const p = s.panel;
  if (!p) return null;
  const all = p.ids.map((id) => s.items.find((i) => i.id === id)).filter(Boolean);
  if (!all.length) return null;
  const list = all.filter((i) => !p.excluded.includes(i.id));
  const first = all[0], single = p.type === 'single';
  const r0 = remain(list[0] || first, s.today);
  const mail = !list.length ? null : single ? mailSingle(first, p.level, s.me) : mailBundle(list, p.level, s.me);
  return { p, all, list, first, single, fix: single && first.status === '보완 요청', r0, rec: levelFor(r0), mail, next: addDays(s.today, r0 <= 3 ? 1 : 2) };
}

export const skeleton = html`<div class="pbc-dim" data-act="closePanel"></div>
  <div class="pbc-drawer" role="dialog" aria-modal="true" aria-label="메일 문안">
    <div class="pbc-drawer-h" data-region="dr-h"></div>
    <div class="pbc-drawer-b">
      <div class="rg" data-region="dr-a"></div>
      <div class="rg" data-region="dr-lvl"></div>
      <div class="rg" data-region="dr-mail"></div>
      <div class="rg" data-region="dr-time"></div>
      <div class="rg" data-region="dr-info"></div>
    </div>
    <div class="pbc-drawer-f" data-region="dr-f"></div>
  </div>`;

const none = html``;
export const drH = (s) => { const m = panelModel(s); if (!m) return none; const { single, first, fix, list } = m; return html`
  <div class="pbc-stack0"><span class="pbc-cap">${single ? `${first.client} · ${first.owner}` : `${first.owner} · ${first.dept}`}</span>
  <span class="t-heading2">${single ? (fix ? '보완 요청 메일' : '독촉 메일') : `묶어서 독촉 · ${list.length}건`}</span></div>
  ${iconBtn('close', 'closePanel', '닫기')}`; };

// 묶음 목록 · 보완 사유 · 남은 항목 (입력란이 있는 영역)
export const drA = (s) => {
  const m = panelModel(s); if (!m) return none;
  const { p, all, first, single, fix } = m;
  return html`
    ${!single ? html`<div class="pbc-sec"><div class="pbc-sec-t">묶을 자료 <span class="pbc-cap">요청 ${all.length}건 → 메일 1통 · 체크를 풀면 본문에서 빠져요.</span></div>
      ${all.map((it) => html`<label class="${cls('pbc-bitem', p.excluded.includes(it.id) && 'off')}">${check(!p.excluded.includes(it.id), 'toggleExclude', it.id, it.name)}<span class="pbc-name">${it.name}</span><span class="pbc-sp"></span><span class="pbc-cap">${it.status}</span>${urgPill(remain(it, s.today))}</label>`)}</div>` : ''}
    ${fix ? html`<div class="pbc-sec"><div class="pbc-sec-t">보완 사유</div>
      <div class="pbc-chips">${REASONS.map((rz) => chip(rz, first.reason === rz, 'reason', rz))}</div>
      ${REASON_FIELD[first.reason] ? field({ label: REASON_FIELD[first.reason], value: first.detail || '', key: 'item.detail' }) : ''}</div>` : ''}
    ${single && first.status === '일부 수령' ? html`<div class="pbc-sec">${field({ label: '남은 항목', value: first.left || '', key: 'item.left', placeholder: '예: 9월분 원재료 수불' })}</div>` : ''}`;
};

export const drLvl = (s) => { const m = panelModel(s); if (!m) return none; const { p, r0, rec, single } = m; return html`<div class="pbc-sec">
  <div class="pbc-sec-t">공손함 단계 <span class="pbc-cap">${r0 < 0 ? `기한 ${-r0}일 지남` : r0 === 0 ? '오늘 기한' : `남은 일수 ${r0}일`} 기준 추천 ${rec}단계${single ? '' : ' · 가장 급한 자료 기준'}</span></div>
  ${seg(['1', '2', '3', '4'], p.level - 1, 'level', { label: '공손함 단계' })}
  <div class="pbc-lvl"><b>${p.level}단계 · ${LEVELS[p.level - 1]}</b>${p.level === rec ? html`<span class="pbc-rec">추천</span>` : html`<span class="pbc-cap">추천에서 ${p.level < rec ? '낮춤' : '높임'}</span>`}</div></div>`; };

export const drMail = (s) => { const m = panelModel(s); if (!m) return none; const { mail } = m; return mail ? html`<div class="pbc-mail">
  <div class="pbc-mail-r"><span>받는 사람</span><b>${mail.to}</b></div>
  <div class="pbc-mail-r"><span>제목</span><b>${mail.subject}</b></div>
  <div class="pbc-mail-body" id="mailBody">${mail.body}</div></div>` : html`<div class="pbc-empty">묶을 자료를 1건 이상 골라 주세요.</div>`; };

export const drTime = (s) => { const m = panelModel(s); if (!m) return none; const { p, next, mail } = m; return html`<div class="pbc-timing">${icon('clock', 18)}
  <span>오늘 오전 발송 권장 · 회신이 없으면 ${md(next)} 오전에 다시 확인</span>
  ${p.todoAdded ? html`<span class="pbc-ok">${icon('check', 14)}할 일에 추가됨</span>` : mail ? textBtn('할 일에 추가', 'addTiming') : ''}</div>`; };

export const drInfo = (s) => { const m = panelModel(s); if (!m || !m.single) return none; const { first } = m; return html`<div class="pbc-sec">
  <div class="pbc-sec-t">자료 정보 <span class="pbc-cap">독촉 ${first.nudges || 0}회${first.last ? ` · 최근 ${md(first.last)}` : ''}</span></div>
  <div class="pbc-g2">${field({ label: '회신 기한', type: 'date', value: first.due, key: 'item.due', desc: '이 자료를 쓰는 절차 시작일에 맞춰 정하세요.' })}${field({ label: '자료 기준일', type: 'date', value: first.asOf, key: 'item.asOf' })}</div>
  <div>${textBtn('요청 현황에서 지우기', 'deleteItem', first.id, true)}</div></div>`; };

export const drF = (s) => { const m = panelModel(s); if (!m) return none; const { p, mail } = m; return html`
  ${btn({ label: '발송함으로 표시', act: 'markSent', outlined: true, disabled: !mail })}
  ${btn({ label: p.copied ? '복사됨' : '복사', act: 'copyMail', lead: p.copied ? 'check' : 'copy', disabled: !mail, flex: true })}`; };
