const W = window.WantedDesignSystem_794458;
const { Button, TextButton, IconButton, Chip, ContentBadge, TextField, TextArea, SegmentedControl, Checkbox, Tab, Toast, Icon } = W;

const URG = {
  over: { t: (r) => `기한 ${-r}일 지남`, c: '#B42318' },
  today: { t: () => '오늘 기한', c: '#D64000' },
  soon: { t: (r) => `D-${r} 임박`, c: 'var(--pwc-brown)' },
  ok: { t: (r) => `D-${r} 여유`, c: 'var(--color-label-alternative)' },
};
function UrgBadge({ r }) {
  const u = URG[pbcUrg(r)];
  if (pbcUrg(r) === 'ok') return <ContentBadge size="small" variant="outlined" label={u.t(r)} />;
  return <ContentBadge size="small" color="accent" accentColor={u.c} label={u.t(r)} />;
}
function StatusCell({ it }) {
  return (
    <div className="pbc-stack4">
      <span className={'pbc-status pbc-st-' + PBC_STATUSES.indexOf(it.status)}>{it.status}</span>
      {it.status === '보완 요청' && <span className="pbc-reason">{it.reason}</span>}
    </div>
  );
}

function Shell({ s, set, children }) {
  return (
    <div className="pbc-app">
      <header className="pbc-top">
        <div className="pbc-brand">
          <img src={(window.__resources && window.__resources.logo) || 'assets/samil-logo.png'} alt="PwC 삼일회계법인" />
          <span className="pbc-vr"></span>
          <div><div className="pbc-appname">살살재촉</div><div className="pbc-appsub">PBC 자료요청 도우미</div></div>
        </div>
        <Tab items={['대시보드', '요청 작성', '메일 분석']} value={['dash', 'compose', 'analyze'].indexOf(s.tab)} onChange={(i) => set({ tab: ['dash', 'compose', 'analyze'][i], panel: null })} divider={false} />
        <div className="pbc-topr">
          <span className="pbc-today"><Icon name="calendar" size={16} />오늘 날짜 {pbcMDW(s.today)}</span>
          <IconButton icon="setting" label="내 정보" onClick={() => set({ meOpen: !s.meOpen })} />
        </div>
        {s.meOpen && <MePopover s={s} set={set} />}
      </header>
      <main className="pbc-main">{children}</main>
      <footer className="pbc-foot">
        <span>{s.me.name} · {s.me.firm} · {s.me.team}</span>
        <span className="pbc-foot-r">데이터는 이 브라우저에만 저장됩니다<TextButton size="small" variant="assistive" label="초기화" /></span>
      </footer>
      {s.toast && <div className="pbc-toast"><Toast message={s.toast} variant="positive" width="auto" /></div>}
    </div>
  );
}

function MePopover({ s, set }) {
  const f = (k) => (e) => set({ me: { ...s.me, [k]: e.target.value } });
  return (
    <div className="pbc-pop">
      <div className="pbc-pop-h"><span className="t-headline2">내 정보</span><IconButton icon="close" size="small" onClick={() => set({ meOpen: false })} /></div>
      <div className="pbc-banner"><Icon name="circleInfo" size={16} />내 정보를 바꾸면 메일 서명에 반영됩니다.</div>
      <TextField label="이름" value={s.me.name} onChange={f('name')} clearable={false} />
      <TextField label="이메일" value={s.me.email} onChange={f('email')} clearable={false} />
      <div className="pbc-g2"><TextField label="법인명" value={s.me.firm} onChange={f('firm')} clearable={false} /><TextField label="조/팀" value={s.me.team} onChange={f('team')} clearable={false} /></div>
    </div>
  );
}

function Kpis({ s, set }) {
  const open = s.items.filter((i) => i.status !== '완료');
  const n = (k) => open.filter((i) => pbcUrg(pbcRemain(i, s.today)) === k).length;
  const cells = [['today', '오늘 기한', n('today')], ['over', '기한 지남', n('over')], ['soon', '3일 이내', n('soon')], ['todo', '남은 할 일', s.todos.length]];
  return (
    <div className="pbc-kpis">
      {cells.map(([k, l, v]) => (
        <button key={k} className={'pbc-kpi wds-state' + (s.kpiF === k ? ' on' : '') + (k === 'todo' ? ' static' : '')} onClick={() => k !== 'todo' && set({ kpiF: s.kpiF === k ? null : k, statusF: '전체', view: 'item' })}>
          <span className="pbc-kpi-l">{l}{k !== 'todo' && <Icon name="chevronRightSmall" size={16} />}</span>
          <span className={'pbc-kpi-v k-' + k}>{v}<small>{k === 'todo' ? '건' : '건'}</small></span>
        </button>
      ))}
    </div>
  );
}

function Toolbar({ s, set, rows }) {
  const counts = { 전체: s.items.length };
  PBC_STATUSES.forEach((st) => (counts[st] = s.items.filter((i) => i.status === st).length));
  return (
    <div className="pbc-tool">
      <div className="pbc-chips">
        {['전체', ...PBC_STATUSES].map((st) => (
          <Chip key={st} size="small" variant="outlined" active={s.statusF === st && !s.kpiF} label={`${st} ${counts[st]}`} onClick={() => set({ statusF: st, kpiF: null })} />
        ))}
        {s.kpiF && <Chip size="small" active label={`${{ today: '오늘 기한', over: '기한 지남', soon: '3일 이내' }[s.kpiF]} ${rows.length}`} trailingIcon="close" onClick={() => set({ kpiF: null })} />}
      </div>
      <div className="pbc-tool-r">
        <SegmentedControl size="small" width={196} items={['회신 기한순', '경과일순']} value={s.sort === 'due' ? 0 : 1} onChange={(i) => set({ sort: i ? 'elapsed' : 'due' })} />
        <SegmentedControl size="small" width={164} items={['자료별', '담당자별']} value={s.view === 'item' ? 0 : 1} onChange={(i) => set({ view: i ? 'owner' : 'item', kpiF: null })} />
      </div>
    </div>
  );
}

function visibleRows(s) {
  let rows = pbcSort(s.items, s.sort, s.today);
  if (s.kpiF) rows = rows.filter((i) => i.status !== '완료' && pbcUrg(pbcRemain(i, s.today)) === s.kpiF);
  else if (s.statusF !== '전체') rows = rows.filter((i) => i.status === s.statusF);
  return rows;
}

function ItemTable({ s, set, rows, openSingle }) {
  const ranks = pbcRanks(s.items, s.today);
  return (
    <div className="pbc-table">
      <div className="pbc-tr pbc-th"><span>#</span><span>클라이언트</span><span>자료</span><span>담당자</span><span>{s.sort === 'elapsed' ? '요청일 (경과일)' : '요청일'}</span><span>회신 기한</span><span>상태</span><span></span></div>
      {rows.map((it, idx) => {
        const r = pbcRemain(it, s.today), done = it.status === '완료', rk = ranks[it.id];
        const jump = s.sort === 'due' && rk && rk.e - rk.d >= 2;
        return (
          <div key={it.id} className={'pbc-tr' + (s.highlight.includes(it.id) ? ' hl' : '') + (done ? ' done' : '')}>
            <span className="pbc-rank">{done ? '–' : idx + 1}</span>
            <span className="pbc-muted">{it.client}</span>
            <span className="pbc-stack4">
              <span className="pbc-name">{it.name}{s.highlight.includes(it.id) && it.isNew && <span className="pbc-new">새로 등록</span>}</span>
              {jump && <span className="pbc-jump"><Icon name="arrowUp" size={12} />경과일순 {rk.e}위 → {rk.d}위</span>}
              {it.memo && <span className="pbc-memo">{it.memo}</span>}
            </span>
            <span className="pbc-stack0"><span>{it.owner}</span><span className="pbc-cap">{it.dept}</span></span>
            <span className="pbc-stack0"><span>{pbcMD(it.req)}</span>{s.sort === 'elapsed' && <span className="pbc-cap pbc-strong">{pbcElapsed(it, s.today)}일 경과</span>}</span>
            <span className="pbc-stack4"><span>{pbcMDW(it.due)}</span>{!done && <UrgBadge r={r} />}</span>
            <StatusCell it={it} />
            <span className="pbc-act">{!done && <Button size="small" variant="outlined" color={pbcUrg(r) === 'over' || pbcUrg(r) === 'today' ? 'primary' : 'assistive'} label={it.status === '보완 요청' ? '보완 요청' : '독촉 메일'} onClick={() => openSingle(it)} />}</span>
          </div>
        );
      })}
      {rows.length === 0 && <div className="pbc-empty">해당하는 자료가 없어요.</div>}
    </div>
  );
}

function OwnerView({ s, set, openSingle, openBundle }) {
  const open = pbcSort(s.items, 'due', s.today).filter((i) => i.status !== '완료');
  const owners = [...new Set(open.map((i) => i.owner))];
  owners.sort((a, b) => open.filter((i) => i.owner === b).length - open.filter((i) => i.owner === a).length);
  return (
    <div className="pbc-owners">
      {owners.map((o) => {
        const list = open.filter((i) => i.owner === o);
        const sentToday = list.some((i) => i.last === s.today);
        return (
          <div key={o} className={'pbc-owner' + (s.highlight.includes(o) ? ' hl' : '')}>
            <div className="pbc-owner-h">
              <span className="pbc-av">{o[0]}</span>
              <div className="pbc-stack0"><span className="t-headline2">{o} <span className="pbc-cap">{list[0].dept} · {list[0].client}</span></span><span className="pbc-cap">미완료 {list.length}건{sentToday ? ` · 오늘 독촉함` : ''}</span></div>
              <span className="pbc-sp"></span>
              {list.length >= 2
                ? <Button size="small" label="묶어서 독촉" leadingIcon="mail" onClick={() => openBundle(o)} />
                : <Button size="small" variant="outlined" color="assistive" label="독촉 메일" onClick={() => openSingle(list[0])} />}
            </div>
            {list.map((it) => (
              <div key={it.id} className="pbc-orow">
                <span className="pbc-name">{it.name}</span>
                <span className="pbc-muted">{pbcMDW(it.due)}</span>
                <UrgBadge r={pbcRemain(it, s.today)} />
                <StatusCell it={it} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function TodoPanel({ s, set }) {
  const [txt, setTxt] = React.useState('');
  const sorted = [...s.todos].sort((a, b) => (a.due || '99') .localeCompare(b.due || '99'));
  const name = (id) => (s.items.find((i) => i.id === id) || {}).name;
  return (
    <aside className="pbc-card pbc-todo">
      <div className="pbc-card-h"><span className="t-headline2">해야 할 일 <b className="pbc-or">{s.todos.length}</b></span></div>
      <div className="pbc-todo-list">
        {sorted.map((t) => (
          <div key={t.id} className={'pbc-todo-i' + (s.highlight.includes(t.id) ? ' hl' : '')}>
            <Checkbox size="small" checked={false} onChange={() => set({ todos: s.todos.filter((x) => x.id !== t.id), done: [{ ...t, date: s.today }, ...s.done] })} />
            <div className="pbc-stack4">
              <span className="pbc-todo-t">{t.text}</span>
              <span className="pbc-cap">
                {t.due ? <b className={pbcDiff(t.due, s.today) <= 0 ? 'pbc-red' : ''}>{pbcMD(t.due)}</b> : '기한 없음'} · {t.src}
                {t.link && <> · <a href="#" onClick={(e) => { e.preventDefault(); set({ highlight: [t.link], view: 'item', kpiF: null, statusF: '전체' }); }}>{name(t.link)}</a></>}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="pbc-addrow">
        <input placeholder="할 일을 입력해 주세요." value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && txt.trim()) { set({ todos: [...s.todos, { id: 'u' + Date.now(), text: txt.trim(), src: '직접' }] }); setTxt(''); } }} />
        <Icon name="plus" size={18} />
      </div>
      <button className="pbc-done-h" onClick={() => set({ doneOpen: !s.doneOpen })}>
        <span>내가 한 일 <b>{s.done.length}</b> <span className="pbc-cap">최근 7일</span></span>
        <Icon name={s.doneOpen ? 'chevronUpSmall' : 'chevronDownSmall'} size={18} />
      </button>
      {s.doneOpen && (
        <div className="pbc-todo-list">
          {s.done.map((t) => (
            <div key={t.id} className={'pbc-todo-i done' + (s.highlight.includes(t.id) ? ' hl' : '')}>
              <Checkbox size="small" checked onChange={() => set({ done: s.done.filter((x) => x.id !== t.id), todos: [...s.todos, t] })} />
              <div className="pbc-stack4"><span className="pbc-todo-t">{t.text}</span><span className="pbc-cap">{pbcMD(t.date)} · {t.src}</span></div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

function Dashboard({ s, set, A }) {
  const rows = visibleRows(s);
  const openSingle = (it) => set({ panel: { type: 'single', ids: [it.id], level: pbcLevelFor(pbcRemain(it, s.today)), excluded: [] } });
  const openBundle = (o) => {
    const list = pbcSort(s.items, 'due', s.today).filter((i) => i.owner === o && i.status !== '완료');
    set({ panel: { type: 'bundle', owner: o, ids: list.map((i) => i.id), level: pbcLevelFor(pbcRemain(list[0], s.today)), excluded: [] } });
  };
  return (
    <>
      <Kpis s={s} set={set} />
      <div className="pbc-grid">
        <section className="pbc-card">
          <div className="pbc-card-h"><span className="t-headline2">요청 현황</span><span className="pbc-cap">{s.sort === 'due' ? '회신 기한까지 남은 일수가 적은 순' : '요청일이 오래된 순'} · 완료는 맨 아래</span></div>
          <Toolbar s={s} set={set} rows={rows} />
          {s.view === 'item' ? <ItemTable s={s} set={set} rows={rows} openSingle={openSingle} /> : <OwnerView s={s} set={set} openSingle={openSingle} openBundle={openBundle} />}
        </section>
        <TodoPanel s={s} set={set} />
      </div>
      {s.panel && <MailPanel s={s} set={set} A={A} />}
    </>
  );
}

function MailPanel({ s, set, A }) {
  const p = s.panel;
  const all = p.ids.map((id) => s.items.find((i) => i.id === id));
  const list = all.filter((i) => !p.excluded.includes(i.id));
  const first = all[0];
  const fix = p.type === 'single' && first.status === '보완 요청';
  const rec = pbcLevelFor(pbcRemain(list[0] || first, s.today));
  const mail = list.length === 0 ? null : p.type === 'bundle' ? pbcMailBundle(list, p.level, s.me, s.today) : pbcMailSingle(first, p.level, s.me, s.today);
  const r0 = pbcRemain(list[0] || first, s.today);
  const next = pbcAdd(s.today, r0 <= 3 ? 1 : 2);
  const setP = (o) => set({ panel: { ...p, ...o } });
  const setItem = (o) => set({ items: s.items.map((i) => (i.id === first.id ? { ...i, ...o } : i)), panel: { ...p, copied: false } });
  const copy = () => { try { navigator.clipboard.writeText(`${mail.subject}\n\n${mail.body}`); } catch (e) {} setP({ copied: true }); setTimeout(() => set((st) => (st.panel ? { panel: { ...st.panel, copied: false } } : {})), 2000); };
  return (
    <>
      <div className="pbc-dim" onClick={() => set({ panel: null })}></div>
      <div className="pbc-drawer">
        <div className="pbc-drawer-h">
          <div className="pbc-stack0">
            <span className="pbc-cap">{p.type === 'bundle' ? `${first.owner} · ${first.dept}` : `${first.client} · ${first.owner}`}</span>
            <span className="t-heading2">{p.type === 'bundle' ? `묶어서 독촉 · ${list.length}건` : fix ? '보완 요청 메일' : '독촉 메일'}</span>
          </div>
          <IconButton icon="close" onClick={() => set({ panel: null })} />
        </div>
        <div className="pbc-drawer-b">
          {p.type === 'bundle' && (
            <div className="pbc-sec">
              <div className="pbc-sec-t">묶을 자료 <span className="pbc-cap">체크를 풀면 본문에서 빠져요.</span></div>
              {all.map((it) => (
                <label key={it.id} className={'pbc-bitem' + (p.excluded.includes(it.id) ? ' off' : '')}>
                  <Checkbox size="small" checked={!p.excluded.includes(it.id)} onChange={() => setP({ excluded: p.excluded.includes(it.id) ? p.excluded.filter((x) => x !== it.id) : [...p.excluded, it.id], copied: false })} />
                  <span className="pbc-name">{it.name}</span><span className="pbc-sp"></span>
                  <span className="pbc-cap">{it.status}</span>
                  <UrgBadge r={pbcRemain(it, s.today)} />
                </label>
              ))}
            </div>
          )}
          {fix && (
            <div className="pbc-sec">
              <div className="pbc-sec-t">보완 사유</div>
              <div className="pbc-chips">{PBC_REASONS.map((rz) => <Chip key={rz} size="small" variant="outlined" active={first.reason === rz} label={rz} onClick={() => setItem({ reason: rz, detail: rz === '기준일 상이' ? first.asOf : rz === '서명 누락' ? '' : rz === first.reason ? first.detail : '' })} />)}</div>
              {PBC_REASON_FIELD[first.reason] && <TextField label={PBC_REASON_FIELD[first.reason]} value={first.detail || ''} onChange={(e) => setItem({ detail: e.target.value })} clearable={false} />}
            </div>
          )}
          <div className="pbc-sec">
            <div className="pbc-sec-t">공손함 단계 <span className="pbc-cap">{r0 < 0 ? `기한 ${-r0}일 지남` : r0 === 0 ? '오늘 기한' : `남은 일수 ${r0}일`} 기준 추천 {rec}단계{p.type === 'bundle' ? ' · 가장 급한 자료 기준' : ''}</span></div>
            <SegmentedControl size="small" items={['1', '2', '3', '4']} value={p.level - 1} onChange={(i) => setP({ level: i + 1, copied: false })} />
            <div className="pbc-lvl"><b>{p.level}단계 · {PBC_LEVELS[p.level - 1]}</b>{p.level === rec ? <span className="pbc-rec">추천</span> : <span className="pbc-cap">추천에서 {p.level < rec ? '낮춤' : '높임'}</span>}</div>
          </div>
          {mail ? (
            <div className="pbc-mail">
              <div className="pbc-mail-r"><span>받는 사람</span><b>{mail.to}</b></div>
              <div className="pbc-mail-r"><span>제목</span><b>{mail.subject}</b></div>
              <div className="pbc-mail-body">{mail.body}</div>
            </div>
          ) : <div className="pbc-empty">묶을 자료를 1건 이상 골라 주세요.</div>}
          <div className="pbc-timing">
            <Icon name="clock" size={18} />
            <span>오늘 오전 발송 권장 · 회신이 없으면 {pbcMD(next)} 오전에 다시 확인</span>
            {p.todoAdded ? <span className="pbc-ok"><Icon name="check" size={14} />할 일에 추가됨</span> : <TextButton size="small" label="할 일에 추가" onClick={() => set(A.addTiming)} />}
          </div>
        </div>
        <div className="pbc-drawer-f">
          <Button variant="outlined" color="assistive" label="발송함으로 표시" disabled={!mail} onClick={() => set(A.markSent)} />
          <Button label={p.copied ? '복사됨' : '복사'} leadingIcon={p.copied ? 'check' : 'copy'} disabled={!mail} onClick={copy} style={{ flex: 1 }} />
        </div>
      </div>
    </>
  );
}

Object.assign(window, { Shell, Dashboard, UrgBadge, StatusCell, MailPanel, MePopover });
