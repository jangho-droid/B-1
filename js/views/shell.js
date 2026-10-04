import { html, icon, iconBtn, field, cls } from '../html.js';
import { diff, isISO, localToday, mdw } from '../lib/date.js';
import { isOpen, remain } from '../lib/pbc.js';
import { DEMO_TODAY } from '../lib/seed.js';

const TABS = [['dash', '대시보드'], ['compose', '자료 요청 작성'], ['analyze', '메일 분석']];

export const top = (s) => html`
  <img src="assets/samil-logo.png" alt="PwC 삼일회계법인" class="v3-logo">
  <span class="v3-vr"></span><b class="v3-name">살살재촉</b>
  <nav class="v3-tabs" aria-label="화면">${TABS.map(([k, l]) => html`<button type="button" class="${cls('v3-tab', s.tab === k && 'on')}" ${s.tab === k ? html`aria-current="page"` : ''} data-act="tab" data-v="${k}">${l}</button>`)}</nav>
  <button type="button" class="v3-today" data-act="toggleDate" aria-expanded="${!!s.dateOpen}">${icon('calendar')}<span class="v3-today-l">오늘 날짜 </span>${mdw(s.today)}${isISO(s.todayOverride) ? html`<em>시연</em>` : ''}</button>
  ${iconBtn('setting', 'toggleMe', '내 정보')}`;

export const datepop = (s) => {
  if (!s.dateOpen) return html``;
  const real = localToday();
  return html`<div class="pbc-pop v3-datepop" role="dialog" aria-label="오늘 날짜">
    <div class="pbc-pop-h"><span class="t-headline2">오늘 날짜</span>${iconBtn('close', 'closePops', '닫기', true)}</div>
    <p>남은 일수·경과일·긴급도·공손함 추천이 모두 이 날짜로 계산돼요. 시연할 때만 바꿔 주세요.</p>
    ${field({ label: '계산에 쓰는 날짜', type: 'date', value: s.today, key: 'today' })}
    <div class="pbc-row8">
      <button type="button" class="v3-btn sm" data-act="realToday" ${isISO(s.todayOverride) ? '' : html`disabled`}>실제 오늘(${mdw(real)})로</button>
      <button type="button" class="v3-btn sm" data-act="demoToday">시연 날짜 ${mdw(DEMO_TODAY)}로</button>
    </div>
  </div>`;
};

export const mepop = (s) => {
  if (!s.meOpen) return html``;
  return html`<div class="pbc-pop" role="dialog" aria-label="내 정보">
    <div class="pbc-pop-h"><span class="t-headline2">내 정보</span>${iconBtn('close', 'closePops', '닫기', true)}</div>
    <div class="pbc-banner">${icon('info')}내 정보를 바꾸면 메일 서명에 반영됩니다.</div>
    ${field({ label: '이름', value: s.me.name, key: 'me.name' })}
    ${field({ label: '이메일', value: s.me.email, key: 'me.email', desc: '메일 분석에서 내가 보낸 메일을 찾을 때 써요.' })}
    <div class="pbc-g2">${field({ label: '법인명', value: s.me.firm, key: 'me.firm' })}${field({ label: '조/팀', value: s.me.team, key: 'me.team' })}</div>
  </div>`;
};

const HERO = { compose: ['자료 요청 작성', '요청할 자료를 고르면 메일 문구를 써 드려요.'], analyze: ['메일 분석', '주고받은 메일에서 한 일과 해야 할 일을 찾아요.'] };
export const hero = (s) => {
  if (s.tab !== 'dash') return html`<div class="v3-hero-in"><div class="pbc-stack4"><span class="v3-eye">${HERO[s.tab][0]}</span><h1>${HERO[s.tab][1]}</h1></div></div>`;
  const urgent = s.items.filter((i) => isOpen(i) && remain(i, s.today) <= 0).length + s.todos.filter((t) => t.due && diff(t.due, s.today) <= 0).length;
  return html`<div class="v3-hero-in">
    <div class="pbc-stack4"><span class="v3-eye">${mdw(s.today)} · ${s.me.team}</span><h1>${s.me.name} 님, 오늘 챙길 일이 <em>${urgent}</em>건 있어요.</h1></div>
    <div class="v3-hero-a">
      <button type="button" class="v3-btn" data-act="tab" data-v="compose">요청 문구 작성</button>
      <button type="button" class="v3-btn primary" data-act="tab" data-v="analyze">메일 붙여넣고 분석</button>
    </div>
  </div>`;
};

export const foot = (s) => html`<b>${s.me.name}</b><span>${s.me.firm} · ${s.me.team}</span>
  <span class="v3-foot-r"><span>데이터는 이 브라우저에만 저장됩니다</span>
  <button type="button" class="v3-link" data-act="reset">초기화</button>
  <button type="button" class="v3-link" data-act="clearAll">모두 비우기</button></span>`;

export const toast = (s) => (s.toast ? html`<div class="pbc-toast" role="status"><div class="tst">${icon('ok', 20)}<span>${s.toast}</span></div></div>` : html``);
