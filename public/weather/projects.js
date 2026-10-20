window.projectLocale = (() => {
  const translations = {
    'Welcome': '欢迎', 'Weather Forecast': '天气预报', 'Strom': '风暴', 'with Heavy Rain': '伴有强降雨',
    'Partly cloudy with occasional snow showers. High around 50°F.': '局部多云，偶有阵雪。最高气温约 50°F。',
    'Wind from the east 11 to 21 mph. Snow chance is 40%, with': '东风 11 至 21 英里/小时，降雪概率 40%，',
    'rainfall expected to be less than an inch.': '预计降水量不足一英寸。',
    'Projects': '项目', 'My anime show': '我的漫剧', '＋ New project': '＋ 新建项目',
    '＋ New series': '＋ 新建系列', '＋ New episode': '＋ 新建剧集',
    'New project': '新建项目', 'New series': '新建系列', 'New episode': '新建剧集',
    'Edit series': '编辑系列', 'Edit episode': '编辑剧集', 'No series yet': '暂无系列',
    'Create Episode {number}': '创作第 {number} 集', 'EP {number}': '第 {number} 集',
    'Anime series': '漫剧系列', 'Series name': '系列名称', 'Episode title': '剧集标题',
    'Synopsis (optional)': '简介（选填）', 'Project name': '项目名称',
    'Cancel': '取消', 'Save': '保存', 'Save changes': '保存修改', 'Create & open': '创建并打开',
    'Create series': '创建系列', 'Create episode': '创建剧集', 'Edit': '编辑',
    'Rename': '重命名', 'Rename project': '重命名项目', 'Delete': '删除',
    'Delete project': '删除项目', 'Delete project?': '删除项目？',
    'Delete “{name}”? This removes the saved project from this browser and cannot be undone.': '删除“{name}”？这会从当前浏览器移除此项目，且无法撤销。',
    'Edited {date}': '更新于 {date}', 'Actions for {name}': '{name}的操作', 'Edit episode {number}': '编辑第 {number} 集',
    'Enter a project name.': '请输入项目名称。', 'Enter a name.': '请输入名称。',
    'This project no longer exists. Close and refresh the list.': '此项目已不存在，请关闭并刷新列表。',
    'This series no longer exists. Close and refresh the list.': '此系列已不存在，请关闭并刷新列表。',
    'This episode no longer exists. Close and refresh the list.': '此剧集已不存在，请关闭并刷新列表。',
    'Could not save changes. Check browser storage and try again.': '无法保存修改，请检查浏览器存储后重试。',
    'Saved projects could not be read. Check browser storage before making changes.': '无法读取已保存的项目，请先检查浏览器存储。',
    'Saved series could not be read. Check browser storage before making changes.': '无法读取已保存的系列，请先检查浏览器存储。',
    'Central Jakarta': '雅加达中区', 'North Jakarta': '雅加达北区', 'South Jakarta': '雅加达南区',
    'Indonesia': '印度尼西亚', 'Bandung': '万隆', 'Mostly Sunny': '大部晴朗', 'Cloudy': '多云', 'Sunny': '晴朗',
    'Anime production': '动漫短片制作', 'Live2D assets': 'Live2D 资产总览', 'Anime websites': '动漫门户网站汇总',
    'Event calendar': '事件日历', 'Account settings': '账户设置', 'Back to home': '返回首页',
    'Your Live2D assets will appear here.': '在这里集中浏览和管理 Live2D 资产。',
    'Your anime website directory will appear here.': '在这里浏览动漫相关门户网站。',
    'Plan your events here. Custom event creation will be added next.': '在这里安排日程，后续支持自定义添加、编辑和删除事件。',
    'Manage your account profile and preferences here.': '在这里管理账户资料和偏好设置。',
    'Content is being prepared.': '页面内容待完善。',
    'Dashboard': '仪表盘', 'Reports': '报告', 'Explore regions': '探索地区', 'Calendar': '日历',
    'Settings': '设置', 'Sign out': '退出登录', 'Search': '搜索', 'Notifications': '通知',
    'Previous projects': '上一组项目', 'Next projects': '下一组项目',
    'Previous episodes': '上一组剧集', 'Next episodes': '下一组剧集',
    'Project card track': '项目卡片列表', 'Anime episode track': '漫剧剧集列表', 'Language': '语言'
  };
  let language = 'en';
  try { if (localStorage.getItem('cimora.language') === 'zh-CN') language = 'zh-CN'; } catch {}
  function t(text, values = {}) {
    const translated = language === 'zh-CN' ? translations[text] || text : text;
    return translated.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
  }
  // Capture only the original UI text, before project names and descriptions render.
  const labels = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, select')) continue;
    if (Object.hasOwn(translations, node.textContent.trim())) labels.push([node, node.textContent]);
  }
  const accessibleLabels = [...document.querySelectorAll('[aria-label]')].map(element => [element, element.getAttribute('aria-label')]);
  const select = document.getElementById('language-select');
  function apply() {
    document.documentElement.lang = language;
    select.value = language;
    document.getElementById('language-code').textContent = language === 'en' ? 'EN' : 'ZH';
    for (const [node, original] of labels) node.textContent = original.replace(original.trim(), t(original.trim()));
    for (const [element, original] of accessibleLabels) element.setAttribute('aria-label', t(original));
  }
  select.onchange = () => {
    language = select.value;
    try { localStorage.setItem('cimora.language', language); } catch {}
    apply();
    window.dispatchEvent(new Event('project-language-change'));
  };
  apply();
  return { t };
})();

(() => {
  const { t } = window.projectLocale;
  const pages = {
    production: ['Anime production', ''],
    live2d: ['Live2D assets', 'Your Live2D assets will appear here.'],
    websites: ['Anime websites', 'Your anime website directory will appear here.'],
    calendar: ['Event calendar', ''],
    settings: ['Account settings', 'Manage your account profile and preferences here.']
  };
  const links = [...document.querySelectorAll('.nav [data-view]')];
  const nav = document.querySelector('.nav');
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.append(indicator);
  let indicatorReady = false;
  function positionIndicator(animate = false) {
    const active = links.find(link => link.getAttribute('aria-current') === 'page');
    if (!active) return;
    const x = active.offsetLeft + (active.offsetWidth - indicator.offsetWidth) / 2;
    const y = active.offsetTop + (active.offsetHeight - indicator.offsetHeight) / 2;
    if (!animate || !indicatorReady) indicator.classList.remove('is-ready');
    indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (!animate || !indicatorReady) {
      void indicator.offsetWidth;
      indicator.classList.add('is-ready');
    }
    indicatorReady = true;
  }
  const workspace = document.querySelector('.workspace-content');
  const rail = document.querySelector('.rail');
  const panel = document.createElement('section');
  panel.className = 'workspace-section';
  panel.setAttribute('aria-labelledby', 'workspace-section-title');
  panel.innerHTML = '<h1 id="workspace-section-title" tabindex="-1"></h1><p class="section-description"></p><div class="section-empty"><svg class="icon" aria-hidden="true"><use/></svg><p></p></div>';
  document.querySelector('.stage').append(panel);
  const heading = panel.querySelector('h1');
  const sky = document.createElement('div');
  sky.className = 'workspace-sky';
  sky.setAttribute('aria-hidden', 'true');
  sky.innerHTML = '<div class="workspace-sky-sheet"><i></i><i></i><i></i></div>';
  document.querySelector('.stage').prepend(sky);
  const skySheet = sky.firstElementChild;
  const viewOrder = Object.keys(pages);
  const scrollPositions = new Map();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeView = null;
  let targetView = null;
  let transitionToken = 0;
  let contentAnimation = null;
  const currentSurface = () => activeView === 'production' ? workspace : panel;
  const scrollOffset = () => matchMedia('(max-width:860px)').matches ? window.scrollY : currentSurface().scrollTop;
  function updateSkyDrift() {
    sky.style.setProperty('--sky-drift', `${-Math.min(scrollOffset() * .04, 24)}px`);
  }
  workspace.addEventListener('scroll', updateSkyDrift, { passive: true });
  panel.addEventListener('scroll', updateSkyDrift, { passive: true });
  window.addEventListener('scroll', updateSkyDrift, { passive: true });
  function restoreScroll(view) {
    const top = scrollPositions.get(view) || 0;
    if (matchMedia('(max-width:860px)').matches) window.scrollTo({ top, behavior: 'instant' });
    else currentSurface().scrollTop = top;
    updateSkyDrift();
  }
  function render(focus = false) {
    const requested = new URL(window.top.location.href).searchParams.get('view') || 'production';
    const view = Object.hasOwn(pages, requested) ? requested : 'production';
    const token = ++transitionToken;
    const previous = activeView;
    targetView = view;
    if (previous) scrollPositions.set(previous, scrollOffset());
    const index = viewOrder.indexOf(view);
    skySheet.style.transform = `translateY(${-index * 20}%)`;
    for (const link of links) {
      if (link.dataset.view === view) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    positionIndicator(true);
    const incomingStyle = previous ? getComputedStyle(currentSurface()) : null;
    const incomingOffset = incomingStyle?.transform || 'none';
    const incomingOpacity = incomingStyle?.opacity || '1';
    contentAnimation?.cancel();
    const apply = () => {
      if (token !== transitionToken || targetView !== view) return;
      applyView(focus);
      activeView = view;
      restoreScroll(view);
      if (previous !== null && previous !== view && !reducedMotion.matches) {
        const direction = index > viewOrder.indexOf(previous) ? 1 : -1;
        contentAnimation = currentSurface().animate([
          { transform: `translateY(${direction * 72}px)`, opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    };
    if (previous === null || reducedMotion.matches || previous === view) {
      if (previous === null) {
        skySheet.style.transition = 'none';
        requestAnimationFrame(() => requestAnimationFrame(() => { skySheet.style.transition = ''; }));
      }
      apply();
      return;
    }
    const direction = index > viewOrder.indexOf(previous) ? 1 : -1;
    contentAnimation = currentSurface().animate([
      { transform: incomingOffset, opacity: incomingOpacity },
      { transform: `translateY(${-direction * 64}px)`, opacity: 0 }
    ], { duration: 200, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
    contentAnimation.finished.then(() => {
      if (token !== transitionToken) return;
      contentAnimation.cancel();
      apply();
    }).catch(() => {});
  }
  function applyView(focus = false) {
    const url = new URL(window.top.location.href);
    const requested = url.searchParams.get('view') || 'production';
    const view = Object.hasOwn(pages, requested) ? requested : 'production';
    for (const link of links) {
      const destination = new URL(url);
      destination.pathname = '/projects';
      destination.hash = '';
      if (link.dataset.view === 'production') destination.searchParams.delete('view');
      else destination.searchParams.set('view', link.dataset.view);
      link.href = destination.pathname + destination.search;
      if (link.dataset.view === view) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    workspace.hidden = view !== 'production';
    document.querySelector('.hello').parentElement.hidden = view !== 'production';
    rail.hidden = view !== 'production';
    panel.hidden = view === 'production';
    panel.dataset.view = view;
    panel.querySelector('.section-empty').hidden = ['calendar','websites'].includes(view);
    panel.querySelector('.section-description').hidden = ['calendar','websites'].includes(view);
    const titleLine = document.createElement('span');
    titleLine.className = 'ln';
    const titleText = document.createElement('span');
    titleText.textContent = t(pages[view][0]);
    titleLine.append(titleText);
    heading.replaceChildren(titleLine);
    panel.querySelector('.section-description').textContent = t(pages[view][1]);
    panel.querySelector('.section-empty p').textContent = t('Content is being prepared.');
    panel.querySelector('use').setAttribute('href', links.find(link => link.dataset.view === view).querySelector('use').getAttribute('href'));
    window.top.document.title = `${t(pages[view][0])} — Cimora Studio`;
    positionIndicator(true);
    if (focus && view !== 'production') heading.focus({preventScroll:true});
    window.dispatchEvent(new Event('workspace-view-change'));
  }
  for (const link of links) link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (link.getAttribute('aria-current') === 'page') return;
    window.top.history.pushState(null, '', link.href);
    render(true);
  });
  let wheelDistance = 0;
  let lastWheelTime = 0;
  let wheelLockedUntil = 0;
  document.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
        document.querySelector('dialog[open]') ||
        event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const now = performance.now();
    const elapsed = now - lastWheelTime;
    lastWheelTime = now;
    // Keep one wheel gesture on one page, including trackpad momentum.
    if (now < wheelLockedUntil || (wheelLockedUntil && elapsed < 180)) {
      event.preventDefault();
      return;
    }
    wheelLockedUntil = 0;
    if (event.defaultPrevented) { wheelDistance = 0; return; }
    const direction = Math.sign(event.deltaY);
    const canScroll = element => direction > 0
      ? element.scrollTop + element.clientHeight < element.scrollHeight - 2
      : element.scrollTop > 2;
    for (let element = event.target; element && element !== document.body; element = element.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(element).overflowY) && canScroll(element)) {
        wheelDistance = 0;
        return;
      }
    }
    const surface = matchMedia('(max-width:860px)').matches ? document.scrollingElement : currentSurface();
    if (canScroll(surface)) { wheelDistance = 0; return; }
    const nextView = viewOrder[viewOrder.indexOf(targetView) + direction];
    if (!nextView) { wheelDistance = 0; return; }
    event.preventDefault();
    if (elapsed > 180 || Math.sign(wheelDistance) !== direction) wheelDistance = 0;
    wheelDistance += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    if (Math.abs(wheelDistance) < 50) return;
    wheelDistance = 0;
    wheelLockedUntil = now + 700;
    links.find(link => link.dataset.view === nextView).click();
  }, { passive: false });
  window.top.addEventListener('popstate', () => render());
  window.addEventListener('project-language-change', () => render());
  new ResizeObserver(() => positionIndicator()).observe(nav);
  window.addEventListener('resize', () => positionIndicator());
  render();
})();

(() => {
  const { t } = window.projectLocale;
  const key = 'cimora.projects.v1';
  const grid = document.getElementById('project-grid');
  const dialog = document.getElementById('project-dialog');
  const input = document.getElementById('project-name');
  const error = document.getElementById('project-error');
  const formError = document.getElementById('project-form-error');
  const save = document.getElementById('save-project');
  let action = 'create';
  let selectedId = null;

  function read() {
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(items) || !items.every(p => p && typeof p.id === 'string' && typeof p.name === 'string' && typeof p.description === 'string' && typeof p.createdAt === 'number')) throw new Error('Invalid saved projects');
    return items;
  }
  function open(mode, project) {
    action = mode;
    selectedId = project?.id || null;
    input.value = project?.name || '';
    input.hidden = mode === 'delete';
    input.required = mode !== 'delete';
    document.getElementById('project-name-label').hidden = mode === 'delete';
    const warning = document.getElementById('delete-warning');
    warning.hidden = mode !== 'delete';
    warning.textContent = t('Delete “{name}”? This removes the saved project from this browser and cannot be undone.', {name: project?.name || ''});
    document.getElementById('project-dialog-title').textContent = mode === 'delete' ? t('Delete project?') : mode === 'rename' ? t('Rename project') : t('New project');
    save.textContent = mode === 'delete' ? t('Delete project') : mode === 'rename' ? t('Save') : t('Create & open');
    save.toggleAttribute('data-danger', mode === 'delete');
    formError.textContent = '';
    document.querySelectorAll('.project-menu[open]').forEach(menu => menu.open = false);
    dialog.showModal();
    if (mode === 'delete') document.getElementById('cancel-project').focus();
    else input.focus();
  }
  function render() {
    try {
      const items = read().sort((a,b) => a.createdAt - b.createdAt);
      grid.replaceChildren();
      error.hidden = true;
      document.getElementById('new-project').disabled = false;
      document.getElementById('project-count').textContent = items.length;
      for (const project of items) {
        const tile = document.createElement('article');
        tile.className = 'project-tile';
        const link = document.createElement('a');
        link.className = 'project-open';
        link.href = `/canvas?project=${encodeURIComponent(project.id)}`;
        link.target = '_top';
        link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 9v11"/></svg><span class="project-placeholder" aria-hidden="true">▧</span><h3></h3><time></time>';
        link.querySelector('h3').textContent = project.name;
        link.title = project.name;
        const time = link.querySelector('time');
        const date = new Date(project.updatedAt || project.createdAt);
        time.dateTime = date.toISOString();
        time.textContent = t('Edited {date}', {date: date.toLocaleDateString(document.documentElement.lang)});
        const menu = document.createElement('details');
        menu.className = 'project-menu';
        const summary = document.createElement('summary');
        summary.textContent = '⋯';
        summary.setAttribute('aria-label', t('Actions for {name}', {name: project.name}));
        const actions = document.createElement('div');
        for (const mode of ['rename','delete']) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = mode === 'rename' ? t('Rename') : t('Delete');
          button.onclick = () => open(mode, project);
          actions.append(button);
        }
        menu.append(summary, actions);
        tile.append(link, menu);
        grid.append(tile);
      }
      updateEmptySlots();
      requestAnimationFrame(updateTrack);
    } catch {
      error.textContent = t('Saved projects could not be read. Check browser storage before making changes.');
      error.hidden = false;
      document.getElementById('new-project').disabled = true;
    }
  }
  document.getElementById('new-project').onclick = () => open('create');
  document.getElementById('cancel-project').onclick = () => dialog.close();
  document.getElementById('project-form').onsubmit = event => {
    event.preventDefault();
    if (action !== 'delete' && !input.value.trim()) { formError.textContent = t('Enter a project name.'); return; }
    try {
      let items = read();
      let created;
      if (action === 'create') {
        created = { id: crypto.randomUUID(), name: input.value.trim(), description: '', createdAt: Date.now() };
        items.push(created);
      } else {
        const current = items.find(p => p.id === selectedId);
        if (!current) { formError.textContent = t('This project no longer exists. Close and refresh the list.'); return; }
        if (action === 'delete') items = items.filter(p => p.id !== selectedId);
        else { current.name = input.value.trim(); current.updatedAt = Date.now(); }
      }
      localStorage.setItem(key, JSON.stringify(items));
      dialog.close();
      render();
      if (created) window.top.location.href = `/canvas?project=${encodeURIComponent(created.id)}`;
    } catch { formError.textContent = t('Could not save changes. Check browser storage and try again.'); }
  };
  document.addEventListener('click', event => document.querySelectorAll('.project-menu[open]').forEach(menu => { if (!menu.contains(event.target)) menu.open = false; }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') document.querySelectorAll('.project-menu[open]').forEach(menu => { menu.open = false; menu.querySelector('summary').focus(); }); });
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) render(); });
  const track = document.querySelector('.project-scroll');
  const left = document.getElementById('projects-left');
  const right = document.getElementById('projects-right');
  function updateEmptySlots() {
    if (!error.hidden) return;
    const visible = Number(getComputedStyle(grid).getPropertyValue('--visible')) || 3;
    const needed = Math.max(6, visible * 2);
    const placeholders = [...grid.querySelectorAll('.project-empty')];
    placeholders.slice(needed).forEach(tile => tile.remove());
    for (let i = placeholders.length; i < needed; i++) {
      const empty = document.createElement('button');
      empty.type = 'button';
      empty.className = 'project-tile project-empty';
      empty.innerHTML = `<span aria-hidden="true">＋</span>${t('New project')}`;
      empty.onclick = () => open('create');
      grid.append(empty);
    }
  }
  function updateTrack() {
    left.disabled = track.scrollLeft <= 1;
    right.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
  }
  function slide(direction) {
    track.scrollBy({left: direction * track.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  left.onclick = () => slide(-1);
  right.onclick = () => slide(1);
  track.addEventListener('scroll', updateTrack, {passive:true});
  track.addEventListener('wheel', event => {
    if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1);
    if ((delta > 0 && track.scrollLeft < track.scrollWidth - track.clientWidth - 1) || (delta < 0 && track.scrollLeft > 0)) {
      event.preventDefault();
      track.scrollLeft += delta;
    }
  }, {passive:false});
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      slide(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  new ResizeObserver(() => { updateEmptySlots(); updateTrack(); }).observe(track);
  window.addEventListener('project-language-change', render);
  render();
})();

(() => {
  const carousel = document.querySelector('.poster-carousel');
  const slides = [...carousel.querySelectorAll('.poster-slide')];
  const dots = [...carousel.querySelectorAll('[data-slide]')];
  const pause = carousel.querySelector('[data-poster="pause"]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, paused = motion.matches, timer;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      dots[i].setAttribute('aria-pressed', String(i === current));
    });
  }
  function schedule() {
    clearInterval(timer);
    pause.textContent = paused ? '▷' : 'Ⅱ';
    pause.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    if (!paused && !document.hidden && !carousel.closest('.workspace-content').hidden && !carousel.matches(':hover, :focus-within')) {
      timer = setInterval(() => show(current + 1), 5000);
    }
  }
  carousel.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.slide !== undefined) show(Number(button.dataset.slide));
    else if (button.dataset.poster === 'pause') paused = !paused;
    else show(current + (button.dataset.poster === 'prev' ? -1 : 1));
    schedule();
  });
  carousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(current + (event.key === 'ArrowLeft' ? -1 : 1));
    schedule();
  });
  ['mouseenter', 'mouseleave', 'focusin'].forEach(name => carousel.addEventListener(name, schedule));
  carousel.addEventListener('focusout', () => setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('workspace-view-change', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; schedule(); });
  schedule();
})();
