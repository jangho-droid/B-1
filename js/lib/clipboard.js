// 복사 실패 시 본문을 선택해 두고 false를 돌려준다 (PRD 11절).
export async function copyText(text, selectEl) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  } catch (e) { /* 아래 대체 경로 */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (ok) return true;
  } catch (e) { /* 선택으로 대체 */ }
  if (selectEl) {
    const r = document.createRange(); r.selectNodeContents(selectEl);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  return false;
}
