import { useEffect, useId, useRef, useState } from 'react';
import { FiX, FiGrid, FiSettings, FiArrowLeft, FiPlus } from './meika/CanvasIcons';
import { LuGraduationCap } from './meika/CanvasIcons';
import './CanvasToolbar.css';
import TopUpDialog from './TopUpDialog';
import { GameButton, PlayerBadge, ResourceCounter, meikaAsset } from './meika';

type Panel = 'guide' | 'language' | 'shortcuts' | 'notifications' | 'account' | 'theme' | 'credits';
const shortcuts = [
 { keys: ['Shift / Cmd', 'Click'], en: 'Add nodes to selection', zh: '添加节点到选区' },
 { keys: ['Ctrl / Cmd', 'A'], en: 'Select all nodes', zh: '选择所有节点' },
 { keys: ['Ctrl / Cmd', 'C / V'], en: 'Copy/paste nodes or paste clipboard text/images', zh: '复制/粘贴节点，或粘贴剪贴板中的文本/图片' },
 { keys: ['Ctrl / Cmd', 'G'], en: 'Group selected nodes', zh: '将选中节点分组' },
 { keys: ['Ctrl / Cmd', 'Shift', 'G'], en: 'Ungroup selected nodes', zh: '取消选中节点的分组' },
 { keys: ['Ctrl / Cmd', 'Z'], en: 'Undo', zh: '撤销' },
 { keys: ['Ctrl / Cmd', 'Shift', 'Z'], en: 'Redo', zh: '重做' },
 { keys: ['Ctrl / Cmd', 'Y'], en: 'Redo', zh: '重做' },
 { keys: ['Delete / Backspace'], en: 'Delete selection', zh: '删除选中内容' },
 { keys: ['Esc'], en: 'Clear selection and close overlays', zh: '清除选区并关闭浮层' },
 { keys: ['Drop images/videos/audio'], en: 'Upload to canvas', zh: '上传到画布' },
];
const quickShortcuts = [
 { keys: ['Space', 'Drag'], en: 'Temporarily switch Select / Move', zh: '临时切换选择 / 移动' },
 { keys: ['Mouse wheel'], en: 'Zoom canvas', zh: '缩放画布' },
 { keys: ['Shift', 'Click'], en: 'Add nodes to selection', zh: '添加节点到选区' },
 { keys: ['Esc'], en: 'Clear selection and close overlays', zh: '清除选区并关闭浮层' },
];
const guideLessons = [
 { title: 'IMAGE-TO-VIDEO TUTORIAL — PART 1', titleZh: '图生视频教程 — 第一部分', level: 'Beginner', levelZh: '入门', minutes: 5, category: true, description: 'Character + Background + Prompt → Video', descriptionZh: '角色 + 背景 + 提示词 → 视频' },
 { title: 'IMAGE-TO-VIDEO TUTORIAL — PART 2', titleZh: '图生视频教程 — 第二部分', level: 'Beginner', levelZh: '入门', minutes: 5, category: true, description: 'This time, we’re covering reference image → video', descriptionZh: '学习如何从参考图片构建视频创作流程。' },
 { title: 'TURN ANY IMAGE INTO A REUSABLE PROMPT', titleZh: '将图片转为可复用的提示词', level: 'Beginner', levelZh: '入门', minutes: 5, category: true, description: 'Want to recreate the style of an image without writing a long prompt from scratch?', descriptionZh: '无需从零编写长提示词，复用图片中的视觉风格。' },
 { title: 'Your first canvas', titleZh: '你的第一个画布', level: 'Beginner', levelZh: '入门', minutes: 3, category: false, description: 'Add nodes, connect your workflow, and save your first canvas.', descriptionZh: '添加节点、连接创作流程，并保存你的第一个画布。' },
 { title: 'Build a stronger visual prompt', titleZh: '构建更清晰的视觉提示词', level: 'Advanced', levelZh: '进阶', minutes: 4, category: false, description: 'Shape your scene with subject, composition, lighting, and style.', descriptionZh: '通过主体、构图、光线和风格描述你的场景。' },
 { title: 'From images to moving shots', titleZh: '从图片到动态镜头', level: 'Master', levelZh: '精通', minutes: 5, category: false, description: 'Plan references, camera motion, and video settings for your shot.', descriptionZh: '为镜头规划参考图片、运镜和视频参数。' },
];
const labels = { en: { guide:'Tutorials', language:'Language', shortcuts:'Keyboard shortcuts', notifications:'Notifications', account:'Account', theme:'Theme', credits:'Recharge preview' }, zh: { guide:'教程', language:'语言', shortcuts:'快捷键', notifications:'通知', account:'账户', theme:'主题', credits:'充值预览' } };
function ToolbarGlyph({ kind, language = 'EN' }: { kind: 'guide' | 'language' | 'sun' | 'moon' | 'keyboard' | 'bell'; language?: string }) {
 const maskId = useId();
 const shapes = {
  guide: <><path d="M3 5q7-2 13 2 6-4 13-2v23q-7-2-13 1-6-3-13-1Z"/><path d="M16 8v18M7 10l5 1m-5 5 5 1m-5 5 5 1" stroke="black" strokeWidth="2"/><path d="m23 10 1 4 4 1-4 1-1 4-1-4-4-1 4-1Z" fill="black"/></>,
  language: <><circle cx="14" cy="14" r="12"/><g fill="none" stroke="black" strokeWidth="1.8"><ellipse cx="14" cy="14" rx="5" ry="12"/><path d="M3 10h22M3 17h22"/></g><path d="M12 17h20v15H12Z" fill="black"/><rect x="14" y="19" width="16" height="11" rx="1"/><text x="22" y="27" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="7.5" fill="black">{language}</text></>,
  sun: <><circle cx="16" cy="16" r="8"/><path d="M16 1v4m0 22v4M1 16h4m22 0h4M5 5l3 3m16 16 3 3M5 27l3-3M24 8l3-3" stroke="white" strokeWidth="3"/></>,
  moon: <><path d="M20 3a13 13 0 1 0 10 19C17 27 10 13 20 3Z"/><path d="m25 2 1.5 5L31 9l-4.5 1.5L25 15l-1.5-4.5L19 9l4.5-2Z"/></>,
  keyboard: <><path d="M4 5h24l3 4v18H1V9Z"/><path d="M5 10h4v4H5Zm6 0h4v4h-4Zm6 0h4v4h-4Zm6 0h4v4h-4ZM5 17h4v3H5Zm6 0h4v3h-4Zm6 0h10v3H17ZM8 23h16v2H8Z" fill="black"/></>,
  bell: <><path d="M13 4a3 3 0 0 1 6 0v2c6 1 6 6 6 12l4 6H3l4-6c0-6 0-11 6-12ZM12 27h8a4 4 0 0 1-8 0Z"/></>,
 };
 return <svg className="ct-meika-icon" viewBox="0 0 32 32" aria-hidden="true"><defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32"><g fill="white" strokeLinejoin="round">{shapes[kind]}</g></mask></defs><path d="M0 0h32v32H0Z" fill="currentColor" mask={`url(#${maskId})`}/></svg>;
}

function LessonCover({ index }: { index: number }) {
 const illustrations = [
  <><path d="M74 44h94v77H74Z" fill="#f2eed9"/><path d="m80 114 29-44 21 25 16-19 16 38Z" fill="#4cc8b0"/><circle cx="147" cy="60" r="8" fill="#ffd447"/><path d="M188 76h26l-8-8m8 8-8 8" fill="none" stroke="#f2eed9" strokeWidth="4"/><path d="m228 48 59 8-6 65-60-8Z" fill="#171321"/><path d="m245 69 25 17-28 13Z" fill="#ffd447"/></>,
  <><path d="m75 52 75-13 10 76-75 12Z" fill="#f2eed9"/><path d="m86 109 22-40 19 18 13-12 11 30Z" fill="#4cc8b0"/><path d="M179 48h98v76h-98Z" fill="#171321"/><path d="m201 65 37 20-37 21Z" fill="#ffd447"/><path d="m277 66 24-13v63l-24-13Z" fill="#e99a34"/></>,
  <><path d="M76 45h83v79H76Z" fill="#f2eed9"/><path d="m83 116 24-43 21 25 19-12 5 30Z" fill="#4cc8b0"/><path d="m169 68 22 13-22 13" fill="none" stroke="#ffd447" strokeWidth="5"/><path d="M208 42h79v88h-79Z" fill="#f2eed9"/><path d="M222 60h50m-50 15h39m-39 15h50m-50 15h28" stroke="#124b57" strokeWidth="6"/></>,
  <><path d="M111 70h63m0 0 35-26m-35 26 35 43" fill="none" stroke="#4cc8b0" strokeWidth="4"/><path d="M63 45h68v49H63Zm143-24h65v48h-65Zm0 69h65v49h-65Z" fill="#f2eed9"/><path d="M78 60h37m-37 12h26" stroke="#124b57" strokeWidth="5"/><path d="m222 52 14-19 19 19Z" fill="#e99a34"/><path d="m227 101 25 12-25 13Z" fill="#28717a"/></>,
  <><path d="m88 39 176 9-5 85-176-9Z" fill="#f2eed9"/><path d="M104 60h90m-90 17h144m-144 17h111" stroke="#124b57" strokeWidth="6"/><path d="m196 119 55-62 12 11-56 62-20 8Z" fill="#ffd447"/><path d="m251 57 12 11-56 62-7-5Z" fill="#e99a34"/><path d="m187 138 7-20 13 12Z" fill="#171321"/></>,
  <><path d="m68 53 66-9 10 76-66 9Z" fill="#f2eed9"/><path d="m83 111 22-40 30 34Z" fill="#28717a"/><path d="m146 42 67 0v85h-67Z" fill="#ffd447"/><path d="m163 64 32 20-32 21Z" fill="#171321"/><path d="m226 42 65 10-10 77-65-10Z" fill="#f2eed9"/><path d="m235 98 30-33 12 44Z" fill="#4cc8b0"/></>,
 ];
 return <svg viewBox="0 0 360 160" aria-hidden="true"><path d="M0 0h360v160H0Z" fill="#124b57"/><path d="m0 0 133 0L0 131Zm360 26-130 134h130Z" fill="#28717a"/><path d="m0 131 112-37 118 66H0Z" fill="#1c5963"/><path d="m316 14 22 0-22 22ZM20 143h26l-26-26Z" fill="#4cc8b0"/>{illustrations[index]}</svg>;
}
function readPreference(key: string, fallback: string) { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } }
export default function CanvasToolbar({ canvasId, balance = null, balanceIsPreview = false }: { canvasId: string; balance?: number | null; balanceIsPreview?: boolean }) {
 // Account balance display: the caller supplies the latest server balance; null means unavailable.
 const balanceText = typeof balance === 'number' && Number.isFinite(balance) && balance >= 0
  ? balance.toLocaleString('en-US', { maximumFractionDigits: 20 }) : '—';
 const quickShortcutsKey = `cimora.canvas.quick-shortcuts:${canvasId}`;
 const [panel,setPanel]=useState<Panel|null>(null);
 const [topUpOpen,setTopUpOpen]=useState(false);
 const [creditPack,setCreditPack]=useState(1000);
 const [language,setLanguage]=useState<'en'|'zh'>(()=>readPreference('cimora.canvas.toolbar-language','en')==='zh'?'zh':'en');
 const [theme,setTheme]=useState(()=>{const saved=readPreference('cimora.canvas.theme','dark');return saved==='graphite-lime'?'sky-blue':saved==='lime-haze'?'bubblegum-remix':saved;});
 const light=theme!=='dark';
 const palette=theme==='sky-blue'?'sky':theme==='bubblegum-remix'?'bubblegum':'neutral';
 const [storageError,setStorageError]=useState(false);
 const [quickShortcutsOpen,setQuickShortcutsOpen]=useState(()=>readPreference(quickShortcutsKey,'true')==='true');
 const root=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement|null>(null);const popover=useRef<HTMLDivElement>(null);
 const t=labels[language]; const zh=language==='zh';
 function remember(key:string,value:string){try{localStorage.setItem(key,value);setStorageError(false);}catch{setStorageError(true);}}
 function showQuickShortcuts(open:boolean){setQuickShortcutsOpen(open);remember(quickShortcutsKey,String(open));}
 useEffect(()=>{const canvas=document.getElementById('cimora-canvas');canvas?.setAttribute('data-theme',light?'light':'dark');canvas?.setAttribute('data-palette',palette);},[light,palette]);
 useEffect(()=>{const update=(event:Event)=>{const value=(event as CustomEvent<string>).detail;if(!['dark','light','bubblegum-remix','sky-blue'].includes(value))return;setTheme(value);remember('cimora.canvas.theme',value);};window.addEventListener('cimora:canvas-theme',update);return()=>window.removeEventListener('cimora:canvas-theme',update);},[]);
 useEffect(()=>{
  if(!panel)return;
  popover.current?.focus();
  const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setPanel(null);};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();setPanel(null);trigger.current?.focus();}};
  const trapFocus=(e:KeyboardEvent)=>{
   if(panel!=='guide'||e.key!=='Tab')return;
   const buttons=popover.current?.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex="0"]');
   if(!buttons?.length)return;
   const first=buttons[0],last=buttons[buttons.length-1];
   if(e.shiftKey&&(document.activeElement===first||document.activeElement===popover.current)){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===popover.current)){e.preventDefault();first.focus();}
  };
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape,true);
  document.addEventListener('keydown',trapFocus);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape,true);document.removeEventListener('keydown',trapFocus);};
 },[panel]);
 function toggle(name:Panel,e:React.MouseEvent<HTMLButtonElement>){trigger.current=e.currentTarget;setPanel(panel===name?null:name);}
 const icons={credits:<FiPlus/>,guide:<ToolbarGlyph kind="guide"/>,language:<ToolbarGlyph kind="language" language={zh?'ZH':'EN'}/>,theme:<ToolbarGlyph kind={light?"moon":"sun"}/>,shortcuts:<ToolbarGlyph kind="keyboard"/>,notifications:<ToolbarGlyph kind="bell"/>,account:<><span className="ct-avatar">C</span><span>{t.account}</span></>};
 function button(name:Panel){return <GameButton key={name} size={name==='account'?'compact':'icon'} tone={name==='account'?'gold':'blue'} className={name==='account'?'ct-account':''} aria-label={t[name]} title={t[name]} aria-expanded={panel===name} aria-controls={panel===name?'canvas-tool-popover':undefined} onClick={e=>toggle(name,e)}>{icons[name]}</GameButton>;}
 return <div className="canvas-tools ct-meika-tools mk-theme" ref={root}>
  <div className="ct-topbar mk-theme">
  <div className="ct-player-account">
  <button type="button" className="ct-player-account-trigger" aria-label={t.account} aria-expanded={panel==='account'} aria-controls={panel==='account'?'canvas-tool-popover':undefined} onClick={e=>toggle('account',e)}/>
   <PlayerBadge name="Cimora Creator" avatar={meikaAsset('avatar')} subtitle={<div className="ct-account-balance" role="status" aria-live="polite" aria-atomic="true" title={balanceIsPreview ? (zh?'演示余额，未连接账户接口':'Demo balance · Account API not connected') : (zh?'账户可用余额':'Available account balance')}><ResourceCounter icon={meikaAsset('gem')} label={zh?'余额':'Balance'} value={balanceText} iconAction={{label:zh?'充值':'Top up credits',onClick:event=>{trigger.current=event.currentTarget;setPanel(null);setTopUpOpen(true);}}}/></div>}/>
  </div>
  <div className="ct-capsule" role="toolbar" aria-label="Canvas tools">
   {button('guide')}{button('language')}
   <div className="ct-theme-anchor">{button('theme')}{panel==='theme'&&<div className="ct-theme-menu" id="canvas-tool-popover" ref={popover} role="dialog" aria-label={t.theme} tabIndex={-1}>
    {[{id:'dark',name:'Black'},{id:'light',name:'White'},{id:'sky-blue',name:'Sky Blue'},{id:'bubblegum-remix',name:'Bubblegum'}].map(option=><button type="button" key={option.id} aria-label={option.name} title={option.name} aria-pressed={theme===option.id} onClick={()=>{setTheme(option.id);remember('cimora.canvas.theme',option.id);setPanel(null);trigger.current?.focus();}}><span className={`canvas-theme-dot theme-dot-${option.id}`} aria-hidden="true"/></button>)}
   </div>}</div>
   {button('shortcuts')}{button('notifications')}
  </div>

  </div>
  {panel==='guide'&&<div className="ct-guide-backdrop" onPointerDown={()=>{setPanel(null);trigger.current?.focus();}} />}
  {panel==='guide'&&<div className="ct-creator-guide" id="canvas-tool-popover" ref={popover} role="dialog" aria-modal="true" aria-labelledby="ct-guide-title" tabIndex={-1}>
   <header><div className="ct-guide-heading"><span className="ct-guide-emblem"><LuGraduationCap/></span><div><h2 id="ct-guide-title">{zh?'创作者指南':'Creator Guide'}</h2><p>{zh?'通过教程学习画布创作':'Learn the canvas with guided lessons'}</p></div></div><button type="button" aria-label="Close panel" onClick={()=>{setPanel(null);trigger.current?.focus();}}><FiX/></button></header>
   <div className="ct-guide-grid" tabIndex={0} aria-label={zh?'教程列表':'Lessons'}>{guideLessons.map((lesson,index)=><article className="ct-lesson" key={lesson.title}>
    <div className="ct-lesson-cover"><LessonCover index={index}/><span className="ct-lesson-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span></div>
    <div className="ct-lesson-copy"><div className="ct-lesson-tags"><span>{zh?lesson.levelZh:lesson.level}</span>{lesson.category&&<span>{zh?'开始使用':'Getting started'}</span>}<span>{lesson.minutes} {zh?'分钟':'min'}</span></div><h3>{zh?lesson.titleZh:lesson.title}</h3><p>{zh?lesson.descriptionZh:lesson.description}</p></div>
   </article>)}</div>
  </div>}
  {panel&&panel!=='guide'&&panel!=='theme'&&<div className={`ct-popover${panel==='account'?' ct-account-popover':''}${panel==='shortcuts'?' ct-shortcuts-panel':panel==='credits'?' ct-recharge-panel':' ct-print-panel'}`} id="canvas-tool-popover" ref={popover} role="dialog" aria-labelledby="ct-title" tabIndex={-1}>
   <header><div className="ct-title-actions"><h2 id="ct-title">{t[panel]}</h2>{panel==='shortcuts'&&<button type="button" className="ct-quick-switch" role="switch" aria-checked={quickShortcutsOpen} aria-label={zh?'显示基本操作悬浮框':'Show quick shortcut panel'} title={zh?'显示基本操作悬浮框':'Show quick shortcut panel'} aria-controls="canvas-quick-shortcuts" onClick={()=>showQuickShortcuts(!quickShortcutsOpen)}><span/></button>}</div><button type="button" aria-label="Close panel" onClick={()=>{setPanel(null);trigger.current?.focus();}}><FiX/></button></header>
   {panel==='credits'&&<div className="ct-recharge-content">
    <div className="ct-recharge-balance"><span>{zh?'当前演示余额':'DEMO BALANCE'}</span><strong>2,388 <small>{zh?'积分':'credits'}</small></strong></div>
    <p>{zh?'选择积分包，预览充值样式':'Choose a credit pack to preview'}</p>
    <div className="ct-credit-packs">{[1000,3000,10000].map(amount=><button type="button" key={amount} aria-pressed={creditPack===amount} onClick={()=>setCreditPack(amount)}><strong>{amount.toLocaleString('en-US')}</strong><span>{zh?'积分':'credits'}</span></button>)}</div>
    <p className="ct-recharge-summary" aria-live="polite">{zh?'已选择':'Selected'}: {creditPack.toLocaleString('en-US')} {zh?'积分':'credits'}</p>
    <button className="ct-payment-preview" type="button" disabled>{zh?'充值 · 仅预览':'Recharge · Preview only'}</button>
    <p className="ct-recharge-note">{zh?'此面板为界面演示，积分包为示例，未接入支付，不会扣款或改变余额。':'Demo credit packs only. Payments are not connected; no charges or balance changes.'}</p>
   </div>}
   {panel==='language'&&<><p className="ct-note">{zh?'工具栏和帮助面板语言。节点编辑器目前使用英文。':'Toolbar and help language. The node editor currently uses English.'}</p><div className="ct-options">{(['en','zh'] as const).map(code=><button type="button" key={code} aria-pressed={language===code} onClick={()=>{setLanguage(code);remember('cimora.canvas.toolbar-language',code);}}>{code==='en'?'English':'简体中文'}<span>{language===code?'✓':''}</span></button>)}</div></>}
   {panel==='shortcuts'&&<dl className="ct-shortcuts">{shortcuts.map(shortcut=><div key={shortcut.keys.join('+')}><dt>{shortcut.keys.map((key,index)=><span className="ct-shortcut-key" key={key}>{index>0&&<span className="ct-shortcut-plus">+</span>}<kbd>{key}</kbd></span>)}</dt><dd>{shortcut[language]}</dd></div>)}</dl>}
   {panel==='notifications'&&<div className="ct-empty"><span className="ct-notice-emblem"><ToolbarGlyph kind="bell"/></span><h3>{zh?'暂无通知':'No notifications'}</h3><p>{zh?'任务和账户通知将显示在这里。':'Task and account updates will appear here.'}</p></div>}
   {panel==='account'&&<><div className="ct-profile"><span className="ct-avatar">C</span><div><strong>Cimora Creator</strong><p>{zh?'本地预览账户':'Local preview account'}</p></div></div><div className="ct-links"><button type="button" onClick={()=>{setPanel(null);setTopUpOpen(true);}}><FiPlus/>Top up credits</button><a href="/projects?view=settings"><FiSettings/>{zh?'账户设置':'Account settings'}</a><a href="/projects"><FiArrowLeft/>{zh?'返回项目':'Back to projects'}</a><a href="/showcase"><FiGrid/>Showcase</a></div></>}
  </div>}
  {quickShortcutsOpen&&<aside className="ct-quick-panel ct-print-panel" id="canvas-quick-shortcuts" aria-labelledby="ct-quick-title">
   <header><h2 id="ct-quick-title">{zh?'基本操作':'Quick shortcut panel'}</h2><button type="button" aria-label={zh?'关闭基本操作':'Close quick shortcut panel'} onClick={()=>showQuickShortcuts(false)}><FiX/></button></header>
   <dl className="ct-shortcuts">{quickShortcuts.map(shortcut=><div key={shortcut.keys.join('+')}><dt>{shortcut.keys.map((key,index)=><span className="ct-shortcut-key" key={key}>{index>0&&<span className="ct-shortcut-plus">+</span>}<kbd>{key}</kbd></span>)}</dt><dd>{shortcut[language]}</dd></div>)}</dl>
  </aside>}
  {topUpOpen&&<TopUpDialog onClose={()=>{setTopUpOpen(false);trigger.current?.focus();}}/>}
  {storageError&&<p role="status" className="ct-storage">Preferences could not be saved on this device.</p>}
 </div>;
}


