const { Button: CButton, TextButton: CTextButton, Chip: CChip, TextField: CTextField, TextArea: CTextArea, SegmentedControl: CSeg, Checkbox: CCheck, Icon: CIcon, ContentBadge: CBadge } = window.WantedDesignSystem_794458;

const PBC_ACTIONS = {
  addTiming(s) {
    const it = s.items.find((i) => i.id === s.panel.ids.find((id) => !s.panel.excluded.includes(id)));
    const next = pbcAdd(s.today, pbcRemain(it, s.today) <= 3 ? 1 : 2);
    const id = 'tm' + s.todos.length + s.done.length;
    const label = s.panel.type === 'bundle' ? `${it.owner}님 자료 ${s.panel.ids.length - s.panel.excluded.length}건 회신 확인` : `${it.name} 회신 확인`;
    return { todos: [...s.todos, { id, text: label, due: next, link: it.id, src: '발송 시점' }], panel: { ...s.panel, todoAdded: true }, highlight: [id], toast: `할 일에 추가했어요. ${pbcMD(next)} 오전에 확인해 주세요.` };
  },
  markSent(s) {
    const ids = s.panel.ids.filter((id) => !s.panel.excluded.includes(id));
    const first = s.items.find((i) => i.id === ids[0]);
    const fix = s.panel.type === 'single' && first.status === '보완 요청';
    const text = s.panel.type === 'bundle' ? `${first.owner}님께 독촉 메일 (${ids.length}건)` : fix ? `${first.name} 보완 요청 메일 발송` : `${first.owner}님께 독촉 메일 · ${first.name}`;
    const id = 'sd' + s.done.length;
    return {
      items: s.items.map((i) => (ids.includes(i.id) ? { ...i, nudges: i.nudges + 1, last: s.today } : i)),
      done: [{ id, text, date: s.today, src: '독촉 기록' }, ...s.done],
      panel: null, doneOpen: true, highlight: [id, first.owner], toast: `독촉 횟수를 기록했어요. 내가 한 일에 남겼어요.`,
    };
  },
  register(s) {
    const c = s.compose;
    const add = PBC_MATERIALS.filter((m) => c.picked.includes(m.id)).map((m, k) => ({ id: 'n' + m.id, isNew: true, client: c.client, name: m.name, owner: c.toName, dept: c.toDept, email: c.toEmail, asOf: c.asOf, req: s.today, due: c.due, status: '미회신', nudges: 0 }));
    return { items: [...s.items, ...add], tab: 'dash', view: 'item', kpiF: null, statusF: '전체', highlight: add.map((a) => a.id), compose: { ...c, picked: [] }, toast: `요청 현황에 ${add.length}건 등록했어요.` };
  },
  analyze(s) { return { analyze: { ...s.analyze, analyzed: true, checks: Object.fromEntries(['a1', 'a2', 'a3', 'a4'].map((k) => [k, true])), statusTo: { a4: '완료' } } }; },
  applyAnalysis(s) {
    const a = s.analyze, R = PBC_ANALYSIS;
    const todos = R.todos.filter((t) => a.checks[t.id]).map((t) => ({ id: 'm' + t.id, text: t.text, due: t.due, link: t.link, src: '메일 분석', quote: t.quote }));
    const done = R.done.filter((t) => a.checks[t.id]).map((t) => ({ id: 'm' + t.id, text: t.text, date: t.date, src: '메일 분석' }));
    const st = R.status.filter((t) => a.checks[t.id]);
    let items = s.items.map((i) => { const c = st.find((x) => x.item === i.id); return c ? { ...i, status: a.statusTo[c.id] } : i; });
    if (a.checks.a2) items = items.map((i) => (i.id === R.memo.item ? { ...i, memo: R.memo.text } : i));
    return { items, todos: [...s.todos, ...todos], done: [...done, ...s.done], tab: 'dash', view: 'item', kpiF: null, statusF: '전체', analyze: { ...a, applied: true }, highlight: [...todos.map((t) => t.id), ...st.map((x) => x.item), R.memo.item, ...done.map((d) => d.id)], doneOpen: done.length > 0, toast: `할 일 ${todos.length}건 · 상태 ${st.length}건 반영했어요.` };
  },
};

function Compose({ s, set, A }) {
  const c = s.compose;
  const setC = (o) => set({ compose: { ...c, ...o } });
  const pending = (m) => s.items.find((i) => i.client === c.client && i.name === m.name && i.status !== '완료');
  const mail = c.picked.length ? pbcMailRequest(c, s.me) : null;
  return (
    <div className="pbc-two">
      <section className="pbc-card pbc-pad">
        <div className="pbc-card-h0"><span className="t-headline1">요청할 자료</span><span className="pbc-cap">여러 개 고를 수 있어요 · {c.picked.length}개 선택</span></div>
        <div className="pbc-matgrid">
          {PBC_MATERIALS.map((m) => {
            const pd = pending(m), on = c.picked.includes(m.id);
            return (
              <div key={m.id} className={'pbc-mat' + (on ? ' on' : '') + (pd ? ' pend' : '')} onClick={() => !pd && setC({ picked: on ? c.picked.filter((x) => x !== m.id) : [...c.picked, m.id] })}>
                <span className="pbc-mat-n">{on && <CIcon name="check" size={16} />}{m.name}</span>
                {pd ? <span className="pbc-mat-p"><b>요청 중</b> · {pd.status}<a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); set({ tab: 'dash', panel: { type: 'single', ids: [pd.id], level: pbcLevelFor(pbcRemain(pd, s.today)), excluded: [] } }); }}>독촉 메일로</a></span> : <span className="pbc-cap">{m.hint}</span>}
              </div>
            );
          })}
        </div>
        <div className="pbc-form">
          <CTextField label="클라이언트" value={c.client} onChange={(e) => setC({ client: e.target.value })} clearable={false} />
          <div className="pbc-g3">
            <CTextField label="받는 분" value={c.toName} onChange={(e) => setC({ toName: e.target.value })} clearable={false} />
            <CTextField label="부서" value={c.toDept} onChange={(e) => setC({ toDept: e.target.value })} clearable={false} />
            <CTextField label="이메일" value={c.toEmail} onChange={(e) => setC({ toEmail: e.target.value })} clearable={false} />
          </div>
          <div className="pbc-g2">
            <CTextField label="자료 기준일" value={c.asOf} onChange={(e) => setC({ asOf: e.target.value })} clearable={false} />
            <CTextField label="회신 기한" value={'2026-' + c.due} onChange={(e) => setC({ due: e.target.value.slice(5) })} description="이 자료를 쓰는 절차 시작일에 맞춰 정하세요." clearable={false} />
          </div>
          <div className="pbc-stack8"><span className="pbc-flabel">말투</span><CSeg items={['정중하게', '간결하게']} value={c.tone} onChange={(i) => setC({ tone: i })} /></div>
        </div>
      </section>
      <section className="pbc-card pbc-pad pbc-preview">
        <div className="pbc-card-h0"><span className="t-headline1">메일 문안</span><span className="pbc-cap">복사해서 메일 프로그램에 붙여넣어요.</span></div>
        {mail ? (
          <div className="pbc-mail">
            <div className="pbc-mail-r"><span>받는 사람</span><b>{mail.to}</b></div>
            <div className="pbc-mail-r"><span>제목</span><b>{mail.subject}</b></div>
            <div className="pbc-mail-body">{mail.body}</div>
          </div>
        ) : <div className="pbc-empty tall"><CIcon name="documentText" size={28} />왼쪽에서 요청할 자료를 골라 주세요.</div>}
        <div className="pbc-actions">
          <CButton variant="outlined" color="assistive" label="복사만" disabled={!mail} />
          <CButton label={`복사하고 요청 현황에 등록${mail ? ` (${c.picked.length}건)` : ''}`} leadingIcon="copy" disabled={!mail} onClick={() => set(A.register)} style={{ flex: 1 }} />
        </div>
      </section>
    </div>
  );
}

function Analyze({ s, set, A }) {
  const a = s.analyze, R = PBC_ANALYSIS;
  const setA = (o) => set({ analyze: { ...a, ...o } });
  const tog = (id) => setA({ checks: { ...a.checks, [id]: !a.checks[id] } });
  const nT = R.todos.filter((t) => a.checks[t.id]).length, nS = R.status.filter((t) => a.checks[t.id]).length, nD = R.done.filter((t) => a.checks[t.id]).length;
  const nm = (id) => s.items.find((i) => i.id === id).name;
  return (
    <div className="an-grid">
      <section className="pbc-card pbc-pad an-left">
        <div className="an-h"><h2>메일 붙여넣기</h2><span className="pbc-cap">스레드 전체를 붙여넣어도 돼요.</span></div>
        <CTextArea value={a.text} onChange={(e) => setA({ text: e.target.value })} rows={18} placeholder="주고받은 메일을 그대로 붙여넣어 주세요. ‘보낸 사람:’, ‘From:’ 기준으로 나눠요." resize="none" />
        <div className="pbc-actions">
          <CButton variant="outlined" color="assistive" label="시연 스레드" onClick={() => setA({ text: PBC_THREAD })} />
          <CButton label="분석하기" leadingIcon="search" disabled={!a.text} onClick={() => set(A.analyze)} style={{ flex: 1 }} />
        </div>
        <p className="pbc-cap" style={{ margin: 0 }}>보낸 사람이 내 정보({s.me.email})와 같으면 ‘내가 한 일’로 분류해요.</p>
      </section>
      <span className="an-arrow" aria-hidden="true"></span>
      {!a.analyzed ? (
        <section className="pbc-card pbc-pad an-right"><div className="pbc-empty tall"><CIcon name="mailOpen" size={28} />메일을 붙여넣고 분석하기를 눌러 주세요.<span className="pbc-cap">한 줄 요약 · 해야 할 일 · 내가 한 일 · 상태 변경을 찾아요.</span></div></section>
      ) : (
        <div className="an-right an-stack">
          <div className="pbc-notice"><CIcon name="circleExclamation" size={16} />키워드로 찾은 후보입니다. 반영 전에 확인하세요.</div>
          <section className="pbc-card an-card">
            <div className="an-h"><h2>한 줄 요약</h2><span className="pbc-cap">{R.summary}</span></div>
            <p className="an-sum">재고자산 수불부 나머지분은 <mark className="ok">받았고</mark>, 매출채권 연령분석표는 <mark className="late">10/8 회신 예정</mark>이에요. 박지원님이 <mark className="hl">유형자산 증감내역 양식</mark>을 물어봤어요.</p>
          </section>
          <section className="pbc-card an-card">
            <div className="an-h"><h2>해야 할 일 <span className="pbc-cap">{R.todos.length}건</span></h2></div>
            {R.todos.map((t, i) => (
              <label key={t.id} className={'an-row' + (a.checks[t.id] ? '' : ' off')}>
                <CCheck size="small" checked={!!a.checks[t.id]} onChange={() => tog(t.id)} />
                <span className="an-sq">{i + 1}</span>
                <div className="pbc-stack4" style={{ flex: 1 }}><span className="pbc-name">{t.text}</span><span className="pbc-quote">근거 · “{t.quote}”</span><span className="pbc-cap">연결 자료 · {nm(t.link)}</span></div>
                <span className={'an-tag' + (t.due && pbcDiff(t.due, s.today) <= 3 ? ' late' : '')}>{t.due ? pbcMDW(t.due) : '기한 없음'}</span>
              </label>
            ))}
          </section>
          <div className="an-two">
            <section className="pbc-card an-card">
              <div className="an-h"><h2>내가 한 일</h2></div>
              {R.done.map((t) => (
                <label key={t.id} className={'an-row' + (a.checks[t.id] ? '' : ' off')}>
                  <CCheck size="small" checked={!!a.checks[t.id]} onChange={() => tog(t.id)} />
                  <span className="an-sq grey"><CIcon name="check" size={14} /></span>
                  <div className="pbc-stack4"><span className="pbc-name">{t.text}</span><span className="pbc-cap">{pbcMD(t.date)} · 내가 보낸 메일</span></div>
                </label>
              ))}
            </section>
            <section className="pbc-card an-card">
              <div className="an-h"><h2>요청 상태 변경</h2></div>
              {R.status.map((t) => (
                <label key={t.id} className={'an-row' + (a.checks[t.id] ? '' : ' off')}>
                  <CCheck size="small" checked={!!a.checks[t.id]} onChange={() => tog(t.id)} />
                  <div className="pbc-stack8" style={{ flex: 1 }}>
                    <span className="pbc-name">{nm(t.item)}</span>
                    <span className="pbc-row8"><span className="pbc-cap">{t.from} →</span><CSeg size="small" width={150} items={t.options} value={t.options.indexOf(a.statusTo[t.id])} onChange={(i) => setA({ statusTo: { ...a.statusTo, [t.id]: t.options[i] } })} /></span>
                    <span className="pbc-quote">“{t.quote}”</span>
                  </div>
                </label>
              ))}
              <div className="an-memo"><CIcon name="clock" size={14} /><span>{nm(R.memo.item)} · ‘확인 중’ 신호라 상태는 그대로, 메모 “{R.memo.text}”만 남겨요.</span></div>
            </section>
          </div>
          <div className="an-bar">
            <span className="pbc-cap">체크한 항목만 대시보드에 반영해요.</span>
            <CButton label={`선택 항목 반영 · 할 일 ${nT} · 한 일 ${nD} · 상태 ${nS}`} disabled={!(nT + nS + nD)} onClick={() => set(A.applyAnalysis)} />
          </div>
        </div>
      )}
    </div>
  );
}

function pbcInitial() {
  return {
    tab: 'dash', today: PBC_TODAY, sort: 'due', view: 'item', statusF: '전체', kpiF: null,
    items: PBC_ITEMS, todos: PBC_TODOS, done: PBC_DONE, me: PBC_ME, panel: null, toast: null, highlight: [], doneOpen: false, meOpen: false,
    compose: { picked: [], client: '가나전자', toName: '박지원', toDept: '회계팀', toEmail: 'jiwon.park@ganaelec.example', asOf: '2026-09-30', due: '10-14', tone: 0 },
    analyze: { text: '', analyzed: false, checks: {}, statusTo: {}, applied: false },
  };
}

function usePbcState(setup) {
  const [s, setS] = React.useState(() => {
    let st = pbcInitial();
    (setup || []).forEach((f) => { st = { ...st, ...(typeof f === 'function' ? f(st, PBC_ACTIONS) : f) }; });
    return st;
  });
  const set = React.useCallback((o) => setS((p) => ({ ...p, toast: typeof o === 'function' ? p.toast : null, ...(typeof o === 'function' ? o(p) : o) })), []);
  return [s, set];
}

function PbcApp({ setup }) {
  const [s, set] = usePbcState(setup);
  return (
    <Shell s={s} set={set}>
      {s.tab === 'dash' && <Dashboard s={s} set={set} A={PBC_ACTIONS} />}
      {s.tab === 'compose' && <Compose s={s} set={set} A={PBC_ACTIONS} />}
      {s.tab === 'analyze' && <Analyze s={s} set={set} A={PBC_ACTIONS} />}
    </Shell>
  );
}

Object.assign(window, { PbcApp, PBC_ACTIONS, usePbcState, Compose, Analyze, pbcInitial });
