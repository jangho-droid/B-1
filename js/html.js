// 작은 템플릿 도우미. html`` 안의 값은 모두 이스케이프된다 (붙여넣은 메일 등 사용자 입력 보호).
class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Raw(s);
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);
const val = (v) => (v == null || v === false ? '' : v instanceof Raw ? v.s : Array.isArray(v) ? v.map(val).join('') : esc(v));
export const html = (str, ...vals) => raw(str.reduce((a, s, i) => a + s + (i < vals.length ? val(vals[i]) : ''), ''));
export const cls = (...a) => a.filter(Boolean).join(' ');

const P = {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  setting: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronUp: '<path d="m18 15-6-6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  ok: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
};
export const icon = (n, size = 16) => raw(`<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`);

// ── DS 대체 컴포넌트 (마크업만) ──
// 버튼: data-act로 동작을 연결한다.
export const btn = ({ label, act, v, primary, outlined, sm, disabled, lead, cls: c, flex, aria }) => html`<button type="button" class="${cls('b', primary !== false && !outlined && 'b-pri', outlined && 'b-out', sm && 'b-sm', flex && 'b-flex', c)}" data-act="${act}" ${v != null ? raw(`data-v="${esc(v)}"`) : ''} ${disabled ? raw('disabled') : ''} ${aria ? raw(`aria-label="${esc(aria)}"`) : ''}>${lead ? icon(lead, 18) : ''}${label}</button>`;
export const iconBtn = (name, act, label, sm) => html`<button type="button" class="${cls('ib', sm && 'ib-sm')}" data-act="${act}" aria-label="${label}" title="${label}">${icon(name, sm ? 18 : 22)}</button>`;
export const textBtn = (label, act, v, assist) => html`<button type="button" class="${cls('tb', assist && 'tb-assist')}" data-act="${act}" ${v != null ? raw(`data-v="${esc(v)}"`) : ''}>${label}</button>`;
export const check = (checked, act, v, label) => html`<input type="checkbox" class="ck" data-act="${act}" ${v != null ? raw(`data-v="${esc(v)}"`) : ''} ${checked ? raw('checked') : ''} aria-label="${label || '선택'}">`;
// 세그먼트: items 중 value 인덱스가 선택. 누르면 data-act에 인덱스 전달.
export const seg = (items, value, act, { sm = true, width, label } = {}) => html`<div class="${cls('seg', sm && 'seg-sm')}" role="group" ${label ? raw(`aria-label="${esc(label)}"`) : ''} ${width ? raw(`style="width:${width}px"`) : ''}>${items.map((t, i) => html`<button type="button" class="${i === value ? 'on' : ''}" aria-pressed="${i === value}" data-act="${act}" data-v="${i}">${t}</button>`)}</div>`;
// 입력란: data-in으로 입력 핸들러를 연결한다.
export const field = ({ label, value, key, type = 'text', placeholder = '', desc, list }) => html`<label class="fld"><span class="fld-l">${label}</span><input class="fld-i" type="${type}" data-in="${key}" value="${value ?? ''}" placeholder="${placeholder}" ${list ? raw(`list="${esc(list)}"`) : ''} autocomplete="off">${desc ? html`<span class="fld-d">${desc}</span>` : ''}</label>`;
export const chip = (label, active, act, v) => html`<button type="button" class="${cls('v3-chip', active && 'on')}" aria-pressed="${!!active}" data-act="${act}" data-v="${v}">${label}</button>`;
