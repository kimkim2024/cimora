(() => {
  // Platform-curated directory. Source URLs document the reviewed publishing/tutorial pages.
  const sites = [
    {id:'youtube',name:'YouTube',mark:'YT',category:'Publishing',url:'https://www.youtube.com/',source:'https://support.google.com/youtube/answer/57407',languages:'Multilingual',tags:['Publishing'],en:'Publish anime episodes and short films, and organize them into playlists.',zh:'发布漫剧与动漫短片，并用播放列表整理系列作品。'},
    {id:'bilibili',name:'bilibili',mark:'B',category:'Publishing',url:'https://member.bilibili.com/platform/upload/video/frame',source:'https://member.bilibili.com/platform/upload/video/frame',languages:'Chinese',tags:['Publishing','Community'],en:'Upload videos through Creator Center and share your animation with the community.',zh:'通过创作中心投稿视频，向社区分享动画作品。'},
    {id:'vimeo',name:'Vimeo',mark:'V',category:'Publishing',url:'https://vimeo.com/',source:'https://help.vimeo.com/hc/en-us/articles/18774922216721-How-to-upload-a-video-to-Vimeo',languages:'English',tags:['Publishing','Portfolio'],en:'Upload and share finished films or build a video portfolio.',zh:'上传并分享成片，整理个人视频作品集。'},
    {id:'screenwriting',name:'StudioBinder · Screenwriting',mark:'SB',category:'Tutorials',url:'https://www.studiobinder.com/tutorials/write/',languages:'English',tags:['Writing'],en:'Learn screenplay formatting and the process of turning a story into a script.',zh:'学习剧本格式，以及将故事整理成剧本的流程。'},
    {id:'storyboards',name:'StudioBinder · Storyboards',mark:'SB',category:'Tutorials',url:'https://www.studiobinder.com/guides/storyboards/',languages:'English',tags:['Storyboarding'],en:'Plan shots, visual sequences and scene details with storyboarding guides.',zh:'通过分镜指南规划镜头、画面顺序和场景细节。'},
    {id:'clipstudio',name:'CLIP STUDIO TIPS',mark:'CS',category:'Tutorials',url:'https://tips.clip-studio.com/en-us/official',languages:'Multilingual',tags:['Character design','Animation'],en:'Official lessons for illustration, comics and frame-by-frame animation.',zh:'涵盖插画、漫画和逐帧动画的官方教程。'},
    {id:'krita',name:'Krita · Animation',mark:'K',category:'Tutorials',url:'https://docs.krita.org/en/user_manual/animation.html',languages:'English',tags:['Storyboarding','Animation'],en:'Explore animation timelines, onion skins, storyboards and walk-cycle exercises.',zh:'学习动画时间轴、洋葱皮、分镜及行走循环练习。'},
    {id:'live2d',name:'Live2D Cubism',mark:'L2D',category:'Tutorials',url:'https://docs.live2d.com/en/cubism-editor-tutorials/top/',languages:'English',tags:['Rigging','Animation'],en:'Follow official Cubism tutorials for model setup, parameters and animation.',zh:'通过官方 Cubism 教程学习模型制作、参数和动画。'},
    {id:'blender',name:'Blender',mark:'B',category:'Tutorials',url:'https://www.blender.org/support/tutorials/',languages:'English',tags:['3D','Animation'],en:'Find introductory training for Blender and its animation workflow.',zh:'查找 Blender 入门及动画工作流程的学习资源。'},
    {id:'audacity',name:'Audacity · Voice recording',mark:'AU',category:'Tutorials',url:'https://support.audacityteam.org/basics/recording-your-voice-and-microphone',languages:'English',tags:['Audio'],en:'Set up a microphone and record voice tracks for your production.',zh:'设置麦克风并录制作品所需的人声轨道。'},
    {id:'resolve',name:'DaVinci Resolve',mark:'DR',category:'Tutorials',url:'https://www.blackmagicdesign.com/products/davinciresolve/training',languages:'English',tags:['Editing','Audio','Color'],en:'Official training for editing, color grading, visual effects and audio post-production.',zh:'学习剪辑、调色、视觉特效与音频后期的官方课程。'}
  ];
  const words = {'All':'全部','Publishing':'动漫网站','Tutorials':'学习教程','Favorites':'已收藏','Search websites, topics…':'搜索网站或创作环节…','Search websites':'搜索网站','All topics':'所有环节','Writing':'剧本','Storyboarding':'分镜','Character design':'角色设计','Animation':'动画','Rigging':'模型绑定','Audio':'音频','Editing':'剪辑','Color':'调色','Community':'社区','Portfolio':'作品集','English':'英语','Chinese':'中文','Multilingual':'多语言','No matching websites':'暂无匹配的网站','Try another search or reset your filters.':'尝试其他关键词，或重置筛选。','No favorites yet':'暂无收藏','Use the bookmark on a website card to save it here.':'点击网站卡片上的书签，将它加入收藏。','Reset filters':'重置筛选','Add to favorites':'加入收藏','Remove from favorites':'取消收藏','websites':'个网站','Browse publishing platforms and tutorials for every stage of anime creation.':'浏览动漫发布平台，以及覆盖各创作环节的教程资源。','Favorites could not be read. Your saved data has not been changed.':'无法读取收藏，原有数据未被修改。','Could not save favorites. Please check browser storage.':'无法保存收藏，请检查浏览器存储。','Opens in a new tab':'在新标签页打开'};
  const t = value => document.documentElement.lang==='zh-CN' ? words[value] || value : value;
  const key='cimora.website-favorites.v1';
  let category='All',topic='All topics',query='',favorites=[],storageFailed=false;
  const panel=document.querySelector('.workspace-section'),root=document.createElement('div');root.id='anime-websites';panel.append(root);
  root.innerHTML='<p class="sites-intro"></p><div class="sites-controls"><label class="sites-search"><svg class="icon" aria-hidden="true"><use href="#i-search"/></svg><input id="sites-search" type="search" autocomplete="off"></label></div><div class="sites-filters" role="group"></div><div class="sites-tags" role="group"></div><p class="sites-error" role="alert"></p><p class="sites-results" role="status"></p><div class="sites-grid"></div><div class="sites-empty" hidden></div>';
  const search=root.querySelector('input'),error=root.querySelector('.sites-error');
  function node(tag,className,text){const el=document.createElement(tag);el.className=className;if(text!==undefined)el.textContent=text;return el;}
  function readFavorites(){const data=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(data)||!data.every(id=>typeof id==='string'))throw Error('Invalid favorites');return [...new Set(data)];}
  function load(){try{favorites=readFavorites();storageFailed=false;error.textContent='';}catch{favorites=[];storageFailed=true;error.textContent=t('Favorites could not be read. Your saved data has not been changed.');}}
  function filterButton(value,current,action){const b=node('button','',t(value));b.type='button';b.setAttribute('aria-pressed',String(current===value));b.onclick=()=>{action();render();[...root.querySelectorAll('button')].find(el=>el.dataset.filter===value)?.focus();};b.dataset.filter=value;return b;}
  function toggleFavorite(site){
    try{const saved=readFavorites();favorites=saved.includes(site.id)?saved.filter(id=>id!==site.id):[...saved,site.id];localStorage.setItem(key,JSON.stringify(favorites));error.textContent='';renderCards();(root.querySelector(`[data-favorite="${site.id}"]`)||root.querySelector('[data-filter=Favorites]')).focus();}
    catch{load();error.textContent=t('Could not save favorites. Please check browser storage.');renderCards();}
  }
  function renderCards(){
    const needle=query.trim().toLocaleLowerCase();
    const visible=sites.filter(site=>(category==='All'||category==='Favorites'||site.category===category)&&(topic==='All topics'||site.tags.includes(topic))&&(category!=='Favorites'||favorites.includes(site.id))&&[site.name,site.en,site.zh,site.url,site.languages,t(site.languages),...site.tags,...site.tags.map(t)].join(' ').toLocaleLowerCase().includes(needle));
    const grid=root.querySelector('.sites-grid');grid.replaceChildren();
    root.querySelector('.sites-results').textContent=`${visible.length} ${t('websites')}`;
    for(const site of visible){
      const card=node('article','site-card'),link=node('a','site-open');link.href=site.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`${site.name} — ${t('Opens in a new tab')}`);
      const logo=node('span','site-logo',site.mark);logo.setAttribute('aria-hidden','true');const img=document.createElement('img');img.src=`${new URL(site.url).origin}/favicon.ico`;img.alt='';img.hidden=true;img.onload=()=>{img.hidden=false;};img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>img.remove();logo.append(img);
      link.append(logo,node('h2','',site.name),node('p','',document.documentElement.lang==='zh-CN'?site.zh:site.en));
      const labels=node('div','site-labels');[site.category,...site.tags.filter(tag=>tag!==site.category)].forEach(tag=>labels.append(node('span','',t(tag))));link.append(labels);
      const meta=node('div','site-meta');meta.append(node('span','',new URL(site.url).hostname.replace(/^www\./,'')),node('span','',`${t(site.languages)} ↗`));link.append(meta);
      const favorite=node('button','site-favorite');favorite.type='button';favorite.dataset.favorite=site.id;favorite.disabled=storageFailed;favorite.setAttribute('aria-pressed',String(favorites.includes(site.id)));favorite.setAttribute('aria-label',`${t(favorites.includes(site.id)?'Remove from favorites':'Add to favorites')}: ${site.name}`);favorite.title=favorite.getAttribute('aria-label');favorite.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4Z" stroke-linejoin="round"/></svg>';favorite.onclick=()=>toggleFavorite(site);
      card.append(link,favorite);grid.append(card);
    }
    const empty=root.querySelector('.sites-empty');empty.hidden=visible.length>0;
    if(!visible.length){empty.replaceChildren(node('h2','',t(category==='Favorites'&&!favorites.length?'No favorites yet':'No matching websites')),node('p','',t(category==='Favorites'&&!favorites.length?'Use the bookmark on a website card to save it here.':'Try another search or reset your filters.')));const reset=node('button','',t('Reset filters'));reset.type='button';reset.onclick=()=>{category='All';topic='All topics';query='';search.value='';render();search.focus();};empty.append(reset);}
  }
  function render(){
    root.hidden=panel.dataset.view!=='websites';if(root.hidden)return;
    root.querySelector('.sites-intro').textContent=t('Browse publishing platforms and tutorials for every stage of anime creation.');search.placeholder=t('Search websites, topics…');search.setAttribute('aria-label',t('Search websites'));

    const filters=root.querySelector('.sites-filters');filters.setAttribute('aria-label',t('All'));filters.replaceChildren();for(const value of ['All','Publishing','Tutorials','Favorites'])filters.append(filterButton(value,category,()=>{category=value;topic='All topics';}));
    const tags=root.querySelector('.sites-tags');tags.setAttribute('aria-label',t('All topics'));tags.replaceChildren();tags.hidden=category==='Publishing';for(const value of ['All topics','Writing','Storyboarding','Character design','Animation','Rigging','3D','Audio','Editing','Color'])tags.append(filterButton(value,topic,()=>{topic=value;}));
    if(storageFailed)error.textContent=t('Favorites could not be read. Your saved data has not been changed.');renderCards();
  }
  search.oninput=()=>{query=search.value;renderCards();};

  window.addEventListener('workspace-view-change',()=>{load();render();});
  window.addEventListener('storage',event=>{if(event.key===key||event.key===null){load();render();}});
  load();render();
})();
