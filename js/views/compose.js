import { html, icon, field, seg, btn, cls } from '../html.js';
import { isISO } from '../lib/date.js';
import { MATERIALS, isOpen, mailRequest } from '../lib/pbc.js';

export const pendingOf = (s, m) => { const c = s.compose.client.trim(); return c ? s.items.find((i) => i.client === c && i.name === m.name && isOpen(i)) : null; };
export function composeModel(s) {
  const c = s.compose;
  const picked = MATERIALS.filter((m) => c.picked.includes(m.id) && !pendingOf(s, m));
  const missing = [!c.client.trim() && '클라이언트', !c.toName.trim() && '받는 분', !isISO(c.asOf) && '자료 기준일', !isISO(c.due) && '회신 기한'].filter(Boolean);
  const mail = picked.length && isISO(c.due) && isISO(c.asOf) ? mailRequest({ ...c, toName: c.toName || '담당자' }, picked, s.me) : null;
  return { c, picked, missing, mail };
}
export const contactsOf = (s) => Object.values(Object.fromEntries(s.items.map((i) => [i.owner + '|' + i.client, { name: i.owner, dept: i.dept, email: i.email, client: i.client }])));

export const skeleton = html`<div class="pbc-two">
  <section class="pbc-card pbc-pad">
    <div class="pbc-card-h0" data-region="c-count"></div>
    <div class="pbc-matgrid" data-region="c-mats"></div>
    <div class="pbc-form" data-region="c-form"></div>
  </section>
  <section class="pbc-card pbc-pad pbc-preview">
    <div class="pbc-card-h0"><span class="t-headline1">메일 문안</span><span class="pbc-cap">복사해서 메일 프로그램에 붙여넣어요.</span></div>
    <div class="rg" data-region="c-preview"></div>
  </section>
</div>`;

export const cCount = (s) => html`<span class="t-headline1">요청할 자료</span><span class="pbc-cap">여러 개 고를 수 있어요 · ${composeModel(s).picked.length}개 선택</span>`;

export const cMats = (s) => html`${MATERIALS.map((m) => {
  const pd = pendingOf(s, m), on = s.compose.picked.includes(m.id) && !pd;
  return html`<div role="button" tabindex="${pd ? -1 : 0}" aria-pressed="${on}" aria-disabled="${!!pd}" class="${cls('pbc-mat', on && 'on', pd && 'pend')}" data-act="${pd ? '' : 'pick'}" data-v="${m.id}">
    <span class="pbc-mat-n">${on ? icon('check') : ''}${m.name}</span>
    ${pd ? html`<span class="pbc-mat-p"><b>요청 중</b> · ${pd.status}<button type="button" class="v3-linkb" data-act="toNudge" data-v="${pd.id}">독촉 메일로</button></span>` : html`<span class="pbc-cap">${m.hint}</span>`}
  </div>`;
})}`;

export const cForm = (s) => {
  const c = s.compose, contacts = contactsOf(s);
  const names = [...new Set(contacts.filter((x) => !c.client || x.client === c.client).map((x) => x.name))];
  return html`
    ${field({ label: '클라이언트', value: c.client, key: 'c.client', placeholder: '예: 가나전자', list: 'dl-clients' })}
    <datalist id="dl-clients">${[...new Set(s.items.map((i) => i.client))].map((x) => html`<option value="${x}">`)}</datalist>
    <div class="pbc-g3">
      ${field({ label: '받는 분', value: c.toName, key: 'c.toName', placeholder: '이름', list: 'dl-names' })}
      <datalist id="dl-names">${names.map((x) => html`<option value="${x}">`)}</datalist>
      ${field({ label: '부서', value: c.toDept, key: 'c.toDept', placeholder: '예: 회계팀' })}
      ${field({ label: '이메일', value: c.toEmail, key: 'c.toEmail', type: 'email', placeholder: 'name@company.com' })}
    </div>
    <div class="pbc-g2">
      ${field({ label: '자료 기준일', type: 'date', value: c.asOf, key: 'c.asOf' })}
      ${field({ label: '회신 기한', type: 'date', value: c.due, key: 'c.due', desc: '이 자료를 쓰는 절차 시작일에 맞춰 정하세요.' })}
    </div>
    <div class="pbc-stack8"><span class="pbc-flabel">말투</span>${seg(['정중하게', '간결하게'], c.tone, 'tone', { sm: false, label: '말투' })}</div>`;
};

export const cPreview = (s) => {
  const { picked, missing, mail } = composeModel(s);
  return html`${mail ? html`<div class="pbc-mail">
      <div class="pbc-mail-r"><span>받는 사람</span><b>${mail.to}</b></div>
      <div class="pbc-mail-r"><span>제목</span><b>${mail.subject}</b></div>
      <div class="pbc-mail-body" id="reqBody">${mail.body}</div></div>`
    : html`<div class="pbc-empty tall">${icon('file', 28)}${picked.length ? '자료 기준일과 회신 기한을 넣어 주세요.' : '왼쪽에서 요청할 자료를 골라 주세요.'}</div>`}
    ${mail && missing.length ? html`<span class="pbc-need">등록하려면 ${missing.join(' · ')}을(를) 입력해 주세요.</span>` : ''}
    <div class="pbc-actions sticky">
      ${btn({ label: '복사만', act: 'copyRequest', outlined: true, disabled: !mail })}
      ${btn({ label: `복사하고 요청 현황에 등록${mail ? ` (${picked.length}건)` : ''}`, act: 'register', lead: 'copy', disabled: !mail || missing.length > 0, flex: true })}
    </div>`;
};
