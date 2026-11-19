window.__ModuleLoader__.load({
  id: 'dsh-running-sessions',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const ns = 'dsh-running-sessions';
    const dictionaries = {
      zh: {title:'运行会话', close:'关闭', running:'运行中', waiting:'等待交互', empty:'当前没有运行中的会话', loading:'正在加载会话…', hint:'实时显示运行中及等待交互的对话，点击会话即可跳转。', search:'筛选标题、目录或 ID', noMatch:'没有匹配的运行会话', cwd:'目录', updated:'更新', id:'会话 ID', child:'子会话', unknown:'未记录', error:'跳转失败', open:'打开运行会话', count:'个活动会话'},
      en: {title:'Running sessions', close:'Close', running:'Running', waiting:'Awaiting interaction', empty:'No active conversations', loading:'Loading sessions…', hint:'Running and interaction-pending conversations update live. Click a row to open it.', search:'Filter by title, directory or ID', noMatch:'No matching active sessions', cwd:'Directory', updated:'Updated', id:'Session ID', child:'Subagent', unknown:'Not recorded', error:'Navigation failed', open:'Open running sessions', count:'active sessions'},
    };
    function selectActive(list, statuses) {
      return Object.values(list.byId).filter(row => {
        const status = statuses.get(row.id);
        return (status?.running ?? row.running) || !!status?.pendingInteraction;
      }).sort((a,b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id));
    }
    const css = `
.drs-trigger{display:flex;align-items:center;justify-content:center;gap:6px;min-height:34px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:6px;font:inherit;white-space:nowrap}
.drs-trigger:hover,.drs-row:hover{background:var(--dsw-alias-bg-layer-2)}
.drs-trigger:focus-visible,.drs-close:focus-visible,.drs-row:focus-visible,.drs-search:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.drs-badge{font-size:11px;font-variant-numeric:tabular-nums;border-radius:8px;background:var(--dsw-alias-bg-layer-2);padding:1px 5px;color:var(--dsw-alias-brand-primary)}
.drs-backdrop{position:fixed;inset:0;z-index:1000;pointer-events:auto;display:flex;align-items:center;justify-content:center;padding:20px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 70%,transparent)}
.drs-panel{width:620px;max-width:100%;max-height:80vh;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-size:13px;overflow:hidden}
.drs-head{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.drs-head h2{font-size:16px;font-weight:600;margin:0;flex:1}
.drs-close{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;padding:6px 10px;border-radius:6px}
.drs-hint{margin:12px 18px;color:var(--dsw-alias-label-secondary);line-height:1.5}
.drs-search{margin:0 18px 12px;padding:9px 11px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;min-width:0}
.drs-list{overflow:auto;padding:0 10px 12px;min-height:80px}
.drs-row{display:block;width:100%;text-align:left;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:12px;margin:6px 0;background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit;cursor:pointer}
.drs-row-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px}
.drs-title{font-weight:600;overflow-wrap:anywhere;line-height:1.45}
.drs-status{white-space:nowrap;font-size:11px;color:var(--dsw-alias-state-success-primary)}
.drs-status.waiting{color:var(--dsw-alias-state-warn-primary)}
.drs-meta{display:block;font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.7;overflow-wrap:anywhere}
.drs-empty{padding:30px 14px;text-align:center;color:var(--dsw-alias-label-secondary)}
.drs-error{margin:0 18px 12px;color:var(--dsw-alias-state-error-primary)}
@media(max-width:480px){.drs-backdrop{padding:10px}.drs-panel{max-height:90vh}.drs-row-top{flex-direction:column;gap:4px}}
`;
    return {
      inject: ['slots', 'locale', 'uiWorkspace'],
      selectActive,
      apply(ctx) {
        const locale = ctx.locale;
        ctx.effect(() => locale.register(ns, dictionaries));
        const t = locale.bind(ns);
        const listeners = new Set();
        let opened = false;
        const subscribe = fn => {listeners.add(fn); return () => listeners.delete(fn);};
        const setOpen = value => {if (opened === value) return; opened=value; for(const fn of listeners) fn();};
        function useLocale() {
          React.useSyncExternalStore(fn=>locale.subscribe(fn),()=>locale.getSnapshot());
          return t;
        }
        function useActive(props) {
          const list = props.useSessions(value => value);
          const statuses = props.useSessionStatus(value => value);
          const rows = React.useMemo(()=>selectActive(list,statuses),[list,statuses]);
          return {list,statuses,rows};
        }
        function Glyph() {
          return h('svg',{'aria-hidden':true,width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M4 4h16v13H9l-5 4V4Z'}),h('path',{d:'M7 11h3l2-4 2 8 2-4h2'}));
        }
        function Trigger(props) {
          const text=useLocale();
          const {rows}=useActive(props);
          const open=React.useSyncExternalStore(subscribe,()=>opened);
          return h('button',{type:'button',className:'drs-trigger',title:`${text('open')} (${rows.length})`,'aria-label':`${text('open')} (${rows.length})`,'aria-expanded':open,'aria-haspopup':'dialog',onClick:()=>setOpen(!open)},h(Glyph),props.wide&&h('span',null,text('title')),h('span',{className:'drs-badge'},rows.length));
        }
        function DialogBody(props) {
          const text=useLocale();
          const {list,statuses,rows}=useActive(props);
          const [query,setQuery]=React.useState('');
          const [error,setError]=React.useState('');
          const panel=React.useRef(null);
          React.useEffect(()=>{
            const prior=document.activeElement;
            const root=panel.current;
            root.querySelector('input')?.focus();
            const focusables=()=>Array.from(root.querySelectorAll('button,input,[tabindex="0"]'));
            const onKey=event=>{
              if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setOpen(false);}
              if(event.key==='Tab'){
                const elements=focusables();
                const first=elements[0], last=elements[elements.length-1];
                if(event.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement))){event.preventDefault();last?.focus();}
                else if(!event.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){event.preventDefault();first?.focus();}
              }
            };
            const onFocus=event=>{if(!root.contains(event.target)) root.querySelector('input')?.focus();};
            document.addEventListener('keydown',onKey,true);
            document.addEventListener('focusin',onFocus);
            return ()=>{
              document.removeEventListener('keydown',onKey,true);
              document.removeEventListener('focusin',onFocus);
              if(prior?.isConnected) prior.focus();
            };
          },[]);
          const needle=query.trim().toLocaleLowerCase();
          const filtered=rows.filter(row=>[row.displayTitle,row.title,row.cwd,row.id].some(value=>String(value||'').toLocaleLowerCase().includes(needle)));
          const openRow=row=>{
            try {ctx.uiWorkspace.openSession(row.id);setOpen(false);}
            catch(cause){setError(`${text('error')}: ${cause instanceof Error?cause.message:String(cause)}`);}
          };
          return h('div',{className:'drs-backdrop',onMouseDown:event=>{if(event.target===event.currentTarget)setOpen(false);}},
            h('section',{ref:panel,className:'drs-panel',role:'dialog','aria-modal':true,'aria-labelledby':'drs-heading','aria-describedby':'drs-hint'},
              h('header',{className:'drs-head'},h(Glyph),h('h2',{id:'drs-heading'},text('title')),h('span',{className:'drs-badge','aria-live':'polite'},`${rows.length} ${text('count')}`),h('button',{type:'button',className:'drs-close',onClick:()=>setOpen(false)},text('close'))),
              h('p',{className:'drs-hint',id:'drs-hint'},text('hint')),
              h('input',{className:'drs-search',type:'search',value:query,placeholder:text('search'),'aria-label':text('search'),onChange:event=>setQuery(event.target.value)}),
              error&&h('p',{className:'drs-error',role:'alert'},error),
              h('div',{className:'drs-list'},filtered.length?filtered.map(row=>{
                const waiting=!!statuses.get(row.id)?.pendingInteraction;
                return h('button',{type:'button',className:'drs-row',key:row.id,onClick:()=>openRow(row)},
                  h('span',{className:'drs-row-top'},h('span',{className:'drs-title'},row.displayTitle||row.title||row.id),h('span',{className:`drs-status${waiting?' waiting':''}`},waiting?text('waiting'):text('running'))),
                  h('span',{className:'drs-meta'},`${text('cwd')}: ${row.cwd||text('unknown')}`),
                  h('span',{className:'drs-meta'},`${text('updated')}: ${row.updatedAt?new Date(row.updatedAt).toLocaleString(locale.getSnapshot().active):text('unknown')}`),
                  h('span',{className:'drs-meta'},`${text('id')}: ${row.id}`),
                  row.parentId&&h('span',{className:'drs-meta'},`${text('child')}: ${row.parentId}`));
              }):h('div',{className:'drs-empty',role:'status'},list.phase==='pending'?text('loading'):rows.length?text('noMatch'):text('empty')))));
        }
        function Overlay(props) {
          const open=React.useSyncExternalStore(subscribe,()=>opened);
          return open?h(DialogBody,props):null;
        }
        // Each declaration owns its registration; collapsing the slot unmounts its UI.
        ctx.slots.inject('sidebar.footer.action',()=>ctx.slots.register({name:'sidebar.footer.action',id:ns,order:20},Trigger));
        ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:ns,order:80},Overlay));
        ctx.effect(()=>()=>{setOpen(false);listeners.clear();});
        // Component-owned stylesheet disappears on module/slot teardown.
        function Styles(){return h('style',null,css);}
        ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:`${ns}-styles`,order:79},Styles));
      },
    };
  },
});
