(() => {
  const key = 'cimora.calendar.v1';
  const colors = ['#507c89', '#77679c', '#976a76', '#947443', '#4e806d'];
  const words = {
    'New event':'新建事件','Edit event':'编辑事件','Today':'今天','Choose month':'选择年月',
    'Title':'标题','Start date':'开始日期','End date':'结束日期','All day':'全天','Start time':'开始时间','End time':'结束时间',
    'Link to':'关联对象','None':'不关联','Project':'项目','Anime episode':'漫剧剧集','Series':'系列','Episode':'剧集',
    'Notes':'备注','Color':'颜色','Save':'保存','Cancel':'取消','Delete':'删除','Keep event':'保留事件','Delete event':'删除事件',
    'Event details':'事件详情','Select an event to view its details.':'选择事件查看详情。','No notes.':'暂无备注。','No linked content.':'未关联内容。','Date & time':'日期与时间',
    'Delete this event? This cannot be undone.':'删除此事件？此操作无法撤销。','Select…':'请选择…',
    'No events on this day.':'当天暂无事件。','No events in this range.':'该区间暂无事件。','Add event':'添加事件','events':'个事件','more':'更多',
    'Saved in this browser.':'保存在当前浏览器中。','Linked content deleted':'关联内容已删除',
    'Open project':'打开项目','Open episode':'打开剧集','Unable to read linked content':'无法读取关联内容',
    'Calendar data could not be read. No changes have been saved.':'无法读取日历数据，未保存任何修改。',
    'Could not save. Check browser storage and try again.':'无法保存，请检查浏览器存储后重试。',
    'Enter a title.':'请输入标题。','Choose valid dates and times.':'请选择有效的日期和时间。',
    'End must not be earlier than start.':'结束时间不能早于开始时间。','Choose a project or episode.':'请选择项目或剧集。',
    'This event no longer exists. Close and refresh.':'事件已不存在，请关闭并刷新。',
    'Blue':'蓝色','Purple':'紫色','Rose':'玫瑰色','Amber':'琥珀色','Green':'绿色'
  };
  const t = text => document.documentElement.lang === 'zh-CN' ? words[text] || text : text;
  const locale = () => document.documentElement.lang === 'zh-CN' ? 'zh-CN' : 'en-US';
  const pad = n => String(n).padStart(2, '0');
  const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  const parseDate = value => { const [y,m,d] = value.split('-').map(Number); return new Date(y,m-1,d,12); };
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && dateKey(parseDate(value)) === value;
  const validTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const addDays = (value,n) => { const date=parseDate(value); date.setDate(date.getDate()+n); return dateKey(date); };
  const validLink = link => link === null || (link && typeof link === 'object' && (
    link.type === 'project' && typeof link.projectId === 'string' ||
    link.type === 'episode' && typeof link.showId === 'string' && typeof link.episodeId === 'string'));
  function validEvent(e) {
    return e && typeof e.id === 'string' && typeof e.title === 'string' && typeof e.notes === 'string' &&
      typeof e.allDay === 'boolean' && validDate(e.startDate) && validDate(e.endDate) && e.endDate >= e.startDate &&
      validTime(e.startTime) && validTime(e.endTime) && (e.allDay || `${e.endDate}T${e.endTime}` >= `${e.startDate}T${e.startTime}`) &&
      colors.includes(e.color) && validLink(e.link);
  }
  function read() {
    const events=JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(events) || !events.every(validEvent) || new Set(events.map(e=>e.id)).size!==events.length) throw Error('Invalid calendar');
    return events;
  }
  function refs() {
    const projects=JSON.parse(localStorage.getItem('cimora.projects.v1') || '[]');
    const shows=JSON.parse(localStorage.getItem('cimora.anime-shows.v1') || '[]');
    if (!Array.isArray(projects) || !projects.every(p=>p && typeof p.id==='string' && typeof p.name==='string') ||
      !Array.isArray(shows) || !shows.every(s=>s && typeof s.id==='string' && typeof s.name==='string' && Array.isArray(s.episodes) && s.episodes.every(e=>e && typeof e.id==='string' && typeof e.name==='string'))) throw Error('Invalid linked content');
    return {projects,shows};
  }
  function resolveLink(link) {
    if (!link) return null;
    try {
      const {projects,shows}=refs();
      if (link.type==='project') {
        const p=projects.find(p=>p.id===link.projectId);
        return p ? {name:p.name,href:`/canvas?project=${encodeURIComponent(p.id)}`,label:'Open project'} : {missing:true};
      }
      const show=shows.find(s=>s.id===link.showId), episode=show?.episodes.find(e=>e.id===link.episodeId);
      return episode ? {name:`${show.name} · EP ${episode.number} · ${episode.name}`,href:`/canvas?show=${encodeURIComponent(show.id)}&episode=${encodeURIComponent(episode.id)}`,label:'Open episode'} : {missing:true};
    } catch { return {error:true}; }
  }
  function node(tag,className,text) { const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el; }
  function button(className,text,action) { const el=node('button',className,text);el.type='button';el.onclick=action;return el; }
  let selected=dateKey(new Date()), month=new Date(new Date().getFullYear(),new Date().getMonth(),1,12);
  let rangeEnd=selected;
  let events=[], editingId=null, originalLink=null, detailId=null;
  const panel=document.querySelector('.workspace-section');
  const root=node('div');root.id='event-calendar';panel.append(root);
  root.innerHTML='<div class="cal-toolbar"><div class="cal-month-controls"><h2 id="cal-month-title" aria-live="polite"></h2><button id="cal-range-trigger" type="button" popovertarget="cal-range-popover" aria-label="Choose date range" aria-haspopup="dialog"><span id="cal-range-start"></span><span class="range-arrow" aria-hidden="true">→</span><span id="cal-range-end"></span><svg class="icon" aria-hidden="true"><use href="#i-cal"/></svg></button><button id="cal-today" type="button"></button></div><button id="cal-new" class="cal-primary" type="button"></button></div><p id="cal-error" class="cal-error" role="alert"></p><div class="cal-layout"><section class="cal-month" aria-labelledby="cal-month-title"><div class="cal-weekdays"></div><div class="cal-weeks"></div></section><div class="cal-sidebar"><aside class="cal-agenda"></aside><section id="cal-details" aria-labelledby="cal-details-heading" aria-live="polite"></section></div></div><p class="cal-note"></p>';
  const dialog=node('dialog');dialog.id='event-dialog';dialog.setAttribute('aria-labelledby','event-dialog-title');document.body.append(dialog);
  dialog.innerHTML=`<form id="event-form"><h2 id="event-dialog-title"></h2>
    <label class="cal-field"><span data-text="Title"></span><input id="event-title" maxlength="120" required autocomplete="off"></label>
    <label class="cal-check"><input id="event-all-day" type="checkbox"><span data-text="All day"></span></label>
    <div class="cal-field-row"><label class="cal-field"><span data-text="Start date"></span><input id="event-start" type="date" required min="0100-01-01" max="9998-12-31"></label><label class="cal-field"><span data-text="End date"></span><input id="event-end" type="date" required min="0100-01-01" max="9998-12-31"></label></div>
    <div id="event-times" class="cal-field-row"><label class="cal-field"><span data-text="Start time"></span><input id="event-start-time" type="time" required></label><label class="cal-field"><span data-text="End time"></span><input id="event-end-time" type="time" required></label></div>
    <label class="cal-field"><span data-text="Link to"></span><select id="event-link-type"><option value="none" data-text="None"></option><option value="project" data-text="Project"></option><option value="episode" data-text="Anime episode"></option></select></label>
    <label class="cal-field" id="event-project-field"><span data-text="Project"></span><select id="event-project"></select></label>
    <div id="event-episode-fields" class="cal-field-row"><label class="cal-field"><span data-text="Series"></span><select id="event-series"></select></label><label class="cal-field"><span data-text="Episode"></span><select id="event-episode"></select></label></div>
    <p id="event-link-info" class="cal-note"></p>
    <label class="cal-field"><span data-text="Notes"></span><textarea id="event-notes" rows="3" maxlength="2000"></textarea></label>
    <label class="cal-field"><span data-text="Color"></span><select id="event-color"></select></label>
    <p id="event-error" class="cal-error" role="alert"></p>
    <div class="cal-actions"><button id="event-delete" type="button" data-text="Delete"></button><button id="event-cancel" type="button" data-text="Cancel"></button><button class="cal-primary" id="event-save" type="submit" data-text="Save"></button></div>
    <div id="event-delete-confirm" class="cal-delete-confirm" hidden><p data-text="Delete this event? This cannot be undone."></p><div class="cal-actions"><button id="event-keep" type="button" data-text="Keep event"></button><button id="event-delete-yes" type="button" data-text="Delete event"></button></div></div></form>`;
  const $=id=>document.getElementById(id);
  const picker=node('div');picker.id='cal-range-popover';picker.setAttribute('popover','auto');picker.setAttribute('role','dialog');picker.setAttribute('aria-label','Choose date range');picker.lang='en';document.body.append(picker);
  let pickerMonth=new Date(month),draftStart=selected,draftEnd=rangeEnd,choosingEnd=false;
  function positionPicker(){
    const rect=$('cal-range-trigger').getBoundingClientRect();
    const width=Math.min(720,innerWidth-32);
    picker.style.width=`${width}px`;
    picker.style.left=`${Math.max(16,Math.min(rect.left,innerWidth-width-16))}px`;
    picker.style.top=`${Math.min(rect.bottom+8,Math.max(16,innerHeight-300))}px`;
    picker.style.maxHeight=`${innerHeight-parseFloat(picker.style.top)-16}px`;
  }
  function chooseRangeDate(value){
    if(!choosingEnd){draftStart=value;draftEnd=value;choosingEnd=true;renderPicker();return;}
    draftEnd=value;
    selected=draftStart<draftEnd?draftStart:draftEnd;rangeEnd=draftStart>draftEnd?draftStart:draftEnd;
    month=new Date(parseDate(selected).getFullYear(),parseDate(selected).getMonth(),1,12);
    choosingEnd=false;picker.hidePopover();render();$('cal-range-trigger').focus();
  }
  function renderPicker(){
    picker.replaceChildren();
    const hint=node('p','range-hint',choosingEnd?'Select end date':'Select start date');hint.setAttribute('aria-live','polite');picker.append(hint);
    const months=node('div','range-months');picker.append(months);
    for(let offset=0;offset<2;offset++){
      const shown=new Date(pickerMonth.getFullYear(),pickerMonth.getMonth()+offset,1,12);
      const section=node('section','range-month'),header=node('div','range-month-header');
      const controls=node('div','range-nav');
      for(const step of (offset===0?[-12,-1]:[1,12])){
        const b=button('',Math.abs(step)===12?(step<0?'«':'»'):(step<0?'‹':'›'),()=>{
          pickerMonth=new Date(pickerMonth.getFullYear(),pickerMonth.getMonth()+step,1,12);renderPicker();
          picker.querySelector(`[data-step="${step}"]`).focus();
        });
        b.dataset.step=String(step);b.setAttribute('aria-label',`${step<0?'Previous':'Next'} ${Math.abs(step)===12?'year':'month'}`);
        const target=new Date(pickerMonth.getFullYear(),pickerMonth.getMonth()+step,1,12);b.disabled=target.getFullYear()<100||target.getFullYear()>9998;
        controls.append(b);
      }
      const heading=node('h3','',`${shown.getFullYear()} ${shown.toLocaleDateString('en-US',{month:'short'})}`);
      if(offset===0)header.append(controls,heading);else header.append(heading,controls);
      section.append(header);
      const weekdays=node('div','range-weekdays');['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d=>weekdays.append(node('span','',d)));section.append(weekdays);
      const dates=node('div','range-dates'),start=addDays(dateKey(shown),-shown.getDay());
      for(let i=0;i<42;i++){
        const value=addDays(start,i),date=parseDate(value),b=button('range-date',String(date.getDate()),()=>chooseRangeDate(value));
        b.dataset.date=value;b.classList.toggle('outside',date.getMonth()!==shown.getMonth());b.disabled=date.getFullYear()<100||date.getFullYear()>9998;
        b.classList.toggle('range-start',value===draftStart);b.classList.toggle('range-end',value===draftEnd);
        b.classList.toggle('in-range',value>=draftStart&&value<=draftEnd);
        b.setAttribute('aria-label',date.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}));
        b.setAttribute('aria-pressed',String(value>=draftStart&&value<=draftEnd));
        b.onkeydown=event=>{
          const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[event.key];if(!delta)return;
          event.preventDefault();const next=addDays(value,delta);let target=picker.querySelector(`.range-date[data-date="${next}"]:not(.outside)`);
          if(!target){const d=parseDate(next);if(d.getFullYear()<100||d.getFullYear()>9998)return;pickerMonth=new Date(d.getFullYear(),d.getMonth(),1,12);renderPicker();target=picker.querySelector(`.range-date[data-date="${next}"]:not(.outside)`);}
          target?.focus();
        };
        dates.append(b);
      }
      section.append(dates);months.append(section);
    }
    if(choosingEnd)picker.querySelector(`.range-date[data-date="${draftStart}"]:not(.outside)`)?.focus();
  }
  picker.addEventListener('beforetoggle',event=>{
    if(event.newState==='open'){pickerMonth=new Date(month);draftStart=selected;draftEnd=rangeEnd;choosingEnd=false;positionPicker();renderPicker();}
  });
  picker.addEventListener('toggle',event=>{
    $('cal-range-trigger').setAttribute('aria-expanded',String(event.newState==='open'));
    if(event.newState==='open')picker.querySelector(`.range-date[data-date="${selected}"]:not(.outside)`)?.focus();
  });
  window.addEventListener('resize',()=>{if(picker.matches(':popover-open'))positionPicker();});
  function formatDate(value) { return parseDate(value).toLocaleDateString(locale(),{month:'short',day:'numeric',year:'numeric'}); }
  function range(e) { return `${formatDate(e.startDate)}${e.allDay?'':` ${e.startTime}`} – ${formatDate(e.endDate)}${e.allDay?` · ${t('All day')}`:` ${e.endTime}`}`; }
  function selectDay(value) { selected=value;rangeEnd=value;render(); }
  function render() {
    root.hidden=panel.dataset.view!=='calendar';if(root.hidden){if(picker.matches(':popover-open'))picker.hidePopover();return;}
    $('cal-today').textContent=t('Today');$('cal-new').textContent=`＋ ${t('New event')}`;
    $('cal-range-start').textContent=selected;
    $('cal-range-end').textContent=rangeEnd;
    $('cal-month-title').textContent=month.toLocaleDateString(locale(),{month:'long',year:'numeric'});
    root.querySelector('.cal-note').textContent=t('Saved in this browser.');
    try {events=read();$('cal-error').textContent='';$('cal-new').disabled=false;}
    catch {events=[];$('cal-error').textContent=t('Calendar data could not be read. No changes have been saved.');$('cal-new').disabled=true;}
    const weekdays=root.querySelector('.cal-weekdays');weekdays.replaceChildren();
    for(let i=0;i<7;i++)weekdays.append(node('span','',new Date(2026,0,5+i).toLocaleDateString(locale(),{weekday:'short'})));
    const first=dateKey(month),start=addDays(first,-((month.getDay()+6)%7)),weeks=root.querySelector('.cal-weeks');weeks.replaceChildren();
    const sorted=[...events].sort((a,b)=>a.startDate.localeCompare(b.startDate)||b.endDate.localeCompare(a.endDate)||a.startTime.localeCompare(b.startTime)||a.id.localeCompare(b.id));
    for(let w=0;w<6;w++) {
      const weekStart=addDays(start,w*7),weekEnd=addDays(weekStart,6),week=node('div','cal-week'),days=node('div','cal-days'),bars=node('div','cal-bars'),more=node('div','cal-more-row');
      for(let d=0;d<7;d++) {
        const value=addDays(weekStart,d),day=button('cal-day','',()=>selectDay(value));
        day.classList.toggle('outside',parseDate(value).getMonth()!==month.getMonth());day.classList.toggle('today',value===dateKey(new Date()));
        day.dataset.date=value;day.setAttribute('aria-label',formatDate(value));day.setAttribute('aria-pressed',String(value>=selected&&value<=rangeEnd));if(value===dateKey(new Date()))day.setAttribute('aria-current','date');
        day.append(node('span','',String(parseDate(value).getDate())));days.append(day);
      }
      const occupied=[],hiddenCounts=Array(7).fill(0);
      for(const e of sorted.filter(e=>e.startDate<=weekEnd&&e.endDate>=weekStart)) {
        let from=0,to=6;while(addDays(weekStart,from)<e.startDate)from++;while(addDays(weekStart,to)>e.endDate)to--;
        let lane=0;while(occupied[lane]?.some((used,d)=>used&&d>=from&&d<=to))lane++;
        if(!occupied[lane])occupied[lane]=Array(7).fill(false);for(let d=from;d<=to;d++)occupied[lane][d]=true;
        if(lane>=2){for(let d=from;d<=to;d++)hiddenCounts[d]++;continue;}
        const bar=button('cal-event-bar',e.title,()=>showDetails(e));bar.title=`${e.title}\n${range(e)}`;bar.setAttribute('aria-label',`${e.title}, ${range(e)}`);
        bar.style.gridColumn=`${from+1} / ${to+2}`;bar.style.gridRow=String(lane+1);bar.style.setProperty('--event-color',e.color);
        bar.classList.toggle('continues-left',e.startDate<weekStart);bar.classList.toggle('continues-right',e.endDate>weekEnd);bars.append(bar);
      }
      hiddenCounts.forEach((count,d)=>{if(count){const b=button('cal-more',`＋${count} ${t('more')}`,()=>{selectDay(addDays(weekStart,d));root.querySelector('.cal-agenda').scrollIntoView({block:'nearest'});});b.style.gridColumn=String(d+1);more.append(b);}});
      week.append(days,bars,more);weeks.append(week);
    }
    renderAgenda();
  }
  function renderAgenda() {
    const agenda=root.querySelector('.cal-agenda');agenda.replaceChildren(node('h2','',selected===rangeEnd?formatDate(selected):`${formatDate(selected)} – ${formatDate(rangeEnd)}`));
    const list=events.filter(e=>e.startDate<=rangeEnd&&e.endDate>=selected).sort((a,b)=>Number(b.allDay)-Number(a.allDay)||a.startDate.localeCompare(b.startDate)||a.startTime.localeCompare(b.startTime)||a.title.localeCompare(b.title));
    if(!list.some(e=>e.id===detailId))detailId=list[0]?.id||null;
    agenda.append(node('p','cal-agenda-count',`${list.length} ${t('events')}`));
    if(!list.length)agenda.append(node('p','cal-agenda-empty',t(selected===rangeEnd?'No events on this day.':'No events in this range.')));
    for(const e of list){
      const item=node('article','cal-agenda-item');item.style.setProperty('--event-color',e.color);
      const edit=button('cal-event-detail','',()=>showDetails(e));edit.setAttribute('aria-pressed',String(e.id===detailId));edit.append(node('strong','',e.title),node('small','',range(e)));item.append(edit);
      const link=resolveLink(e.link);if(link){if(link.missing||link.error)item.append(node('span','cal-link-missing',t(link.error?'Unable to read linked content':'Linked content deleted')));else{const a=node('a','cal-link',`${t(link.label)} · ${link.name} ↗`);a.href=link.href;a.target='_top';item.append(a);}}
      agenda.append(item);
    }
    renderDetails();
  }
  function showDetails(event){
    detailId=event.id;
    if(event.startDate>rangeEnd||event.endDate<selected){selected=event.startDate;rangeEnd=selected;}
    render();
    $('cal-details').scrollIntoView({block:'nearest',behavior:'instant'});
  }
  function renderDetails(){
    const card=$('cal-details'),heading=node('h2','',t('Event details'));heading.id='cal-details-heading';card.replaceChildren(heading);
    const event=events.find(e=>e.id===detailId);
    if(!event){card.append(node('p','cal-details-empty',t('Select an event to view its details.')));return;}
    const title=node('h3','cal-details-title',event.title);title.style.setProperty('--event-color',event.color);card.append(title);
    for(const [label,value] of [['Date & time',range(event)],['Notes',event.notes||t('No notes.')]]){
      const section=node('div','cal-details-field');section.append(node('h4','',t(label)),node('p','',value));card.append(section);
    }
    const section=node('div','cal-details-field');section.append(node('h4','',t('Link to')));
    const link=resolveLink(event.link);
    if(!link)section.append(node('p','',t('No linked content.')));
    else if(link.missing||link.error)section.append(node('p','cal-link-missing',t(link.error?'Unable to read linked content':'Linked content deleted')));
    else{const a=node('a','cal-link',`${link.name} · ${t(link.label)} ↗`);a.href=link.href;a.target='_top';section.append(a);}
    card.append(section);
    const actions=node('div','cal-actions');
    const edit=button('cal-primary',t('Edit event'),()=>open(event));edit.id='cal-details-edit';
    const remove=button('',t('Delete'),()=>{open(event);$('event-delete').click();});remove.id='cal-details-delete';
    actions.append(edit,remove);card.append(actions);
  }
  function options(select,items,value) {
    select.replaceChildren(new Option(t('Select…'),''));for(const item of items)select.add(new Option(item.name,item.id));
    if(value&&!items.some(i=>i.id===value))select.add(new Option(t('Linked content deleted'),value));select.value=value||'';
  }
  function fillLinks(link=null) {
    $('event-project-field').hidden=$('event-link-type').value!=='project';$('event-episode-fields').hidden=$('event-link-type').value!=='episode';
    $('event-link-info').textContent='';
    try {
      const {projects,shows}=refs();options($('event-project'),projects,link?.projectId);options($('event-series'),shows,link?.showId);
      const show=shows.find(s=>s.id===$('event-series').value);options($('event-episode'),(show?.episodes||[]).map(e=>({...e,name:`EP ${e.number} · ${e.name}`})),link?.episodeId);
    }catch{$('event-link-info').textContent=t('Unable to read linked content');options($('event-project'),[],link?.projectId);options($('event-series'),[],link?.showId);options($('event-episode'),[],link?.episodeId);}
  }
  function updateTimes() {const all=$('event-all-day').checked;$('event-times').hidden=all;for(const id of ['event-start-time','event-end-time'])$(id).disabled=all;}
  function open(event) {
    editingId=event?.id||null;originalLink=event?.link||null;
    dialog.querySelectorAll('[data-text]').forEach(el=>el.textContent=t(el.dataset.text));
    $('event-dialog-title').textContent=t(event?'Edit event':'New event');$('event-title').value=event?.title||'';
    $('event-start').value=event?.startDate||selected;$('event-end').value=event?.endDate||rangeEnd;
    $('event-start-time').value=event?.startTime||'09:00';$('event-end-time').value=event?.endTime||'10:00';$('event-all-day').checked=event?.allDay??true;
    $('event-notes').value=event?.notes||'';$('event-color').replaceChildren();colors.forEach((color,i)=>$('event-color').add(new Option(t(['Blue','Purple','Rose','Amber','Green'][i]),color)));$('event-color').value=event?.color||colors[0];
    $('event-link-type').value=event?.link?.type||'none';fillLinks(originalLink);updateTimes();
    $('event-error').textContent='';$('event-delete').hidden=!event;$('event-delete-confirm').hidden=true;
    dialog.showModal();$('event-title').focus();
  }
  $('event-link-type').onchange=()=>fillLinks();
  $('event-series').onchange=()=>{try{const show=refs().shows.find(s=>s.id===$('event-series').value);options($('event-episode'),(show?.episodes||[]).map(e=>({...e,name:`EP ${e.number} · ${e.name}`})));}catch{$('event-link-info').textContent=t('Unable to read linked content');}};
  $('event-all-day').onchange=updateTimes;
  $('event-start').onchange=()=>{if($('event-end').value<$('event-start').value)$('event-end').value=$('event-start').value;};
  $('event-cancel').onclick=()=>dialog.close();
  $('event-delete').onclick=()=>{$('event-delete-confirm').hidden=false;$('event-keep').focus();};
  $('event-keep').onclick=()=>{$('event-delete-confirm').hidden=true;$('event-delete').focus();};
  $('event-delete-yes').onclick=()=>{
    try{const saved=read();if(!saved.some(e=>e.id===editingId)){$('event-error').textContent=t('This event no longer exists. Close and refresh.');return;}localStorage.setItem(key,JSON.stringify(saved.filter(e=>e.id!==editingId)));dialog.close();render();}
    catch{$('event-error').textContent=t('Could not save. Check browser storage and try again.');}
  };
  $('event-form').onsubmit=event=>{
    event.preventDefault();const fail=text=>$('event-error').textContent=t(text);
    const e={id:editingId||crypto.randomUUID(),title:$('event-title').value.trim(),startDate:$('event-start').value,endDate:$('event-end').value,allDay:$('event-all-day').checked,startTime:$('event-start-time').value||'09:00',endTime:$('event-end-time').value||'10:00',notes:$('event-notes').value.trim(),color:$('event-color').value,link:null};
    if(!e.title){fail('Enter a title.');return;}
    if(!validDate(e.startDate)||!validDate(e.endDate)||!validTime(e.startTime)||!validTime(e.endTime)){fail('Choose valid dates and times.');return;}
    if(e.endDate<e.startDate||!e.allDay&&`${e.endDate}T${e.endTime}`<`${e.startDate}T${e.startTime}`){fail('End must not be earlier than start.');return;}
    const type=$('event-link-type').value;
    if(type==='project')e.link={type,projectId:$('event-project').value};
    if(type==='episode')e.link={type,showId:$('event-series').value,episodeId:$('event-episode').value};
    if(e.link){const linked=resolveLink(e.link);if((linked.missing||linked.error)&&JSON.stringify(e.link)!==JSON.stringify(originalLink)){fail('Choose a project or episode.');return;}}
    try{
      const saved=read(),index=saved.findIndex(item=>item.id===editingId);
      if(editingId&&index<0){fail('This event no longer exists. Close and refresh.');return;}
      if(index>=0)saved[index]=e;else saved.push(e);localStorage.setItem(key,JSON.stringify(saved));
      detailId=e.id;selected=e.startDate;rangeEnd=e.endDate;month=new Date(parseDate(selected).getFullYear(),parseDate(selected).getMonth(),1,12);dialog.close();render();
    }catch{fail('Could not save. Check browser storage and try again.');}
  };
  $('cal-new').onclick=()=>open();
  $('cal-today').onclick=()=>{selected=dateKey(new Date());rangeEnd=selected;month=new Date(new Date().getFullYear(),new Date().getMonth(),1,12);render();};
  window.addEventListener('workspace-view-change',render);
  window.addEventListener('storage',e=>{if([null,key,'cimora.projects.v1','cimora.anime-shows.v1'].includes(e.key))render();});
  render();
})();
