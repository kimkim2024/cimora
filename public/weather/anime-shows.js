(() => {
  const { t } = window.projectLocale;
  const key = 'cimora.anime-shows.v1';
  const grid = document.getElementById('episode-grid');
  const track = document.querySelector('.episode-scroll');
  const select = document.getElementById('show-select');
  const dialog = document.getElementById('show-dialog');
  const name = document.getElementById('show-name');
  const description = document.getElementById('show-description');
  const error = document.getElementById('show-error');
  const formError = document.getElementById('show-form-error');
  const left = document.getElementById('episodes-left');
  const right = document.getElementById('episodes-right');
  let selectedId = new URLSearchParams(window.top.location.search).get('show');
  let action = 'create-series';
  let editingId = null;
  let nextEpisodeNumber = 1;

  function read() {
    const shows = JSON.parse(localStorage.getItem(key) || '[]');
    const valid = item => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.description === 'string' && Number.isFinite(item.createdAt);
    if (!Array.isArray(shows) || !shows.every(show => valid(show) && Array.isArray(show.episodes) && show.episodes.every(episode => valid(episode) && Number.isInteger(episode.number) && episode.number > 0))) throw new Error('Invalid saved series');
    return shows;
  }
  function rememberSelection() {
    const url = new URL(window.top.location.href);
    if (selectedId) url.searchParams.set('show', selectedId);
    else url.searchParams.delete('show');
    window.top.history.replaceState(null, '', url);
  }
  function open(mode, item) {
    action = mode;
    editingId = item?.id || null;
    const isSeries = mode.endsWith('series');
    document.getElementById('show-dialog-title').textContent = t(`${mode.startsWith('edit') ? 'Edit' : 'New'} ${isSeries ? 'series' : 'episode'}`);
    document.getElementById('show-name-label').textContent = isSeries ? t('Series name') : t('Episode title');
    document.getElementById('save-show').textContent = mode.startsWith('edit') ? t('Save changes') : isSeries ? t('Create series') : t('Create episode');
    name.value = item?.name || '';
    description.value = item?.description || '';
    formError.textContent = '';
    dialog.showModal();
    name.focus();
  }
  function updateSlots() {
    if (!error.hidden) return;
    const visible = Number(getComputedStyle(grid).getPropertyValue('--visible')) || 3;
    const needed = Math.max(6, visible * 2);
    const slots = [...grid.querySelectorAll('.project-empty')];
    slots.slice(needed).forEach(slot => slot.remove());
    for (let i = slots.length; i < needed; i++) {
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'project-tile project-empty';
      slot.innerHTML = `<span aria-hidden="true">＋</span>${t('Create Episode {number}', {number: nextEpisodeNumber + i})}`;
      slot.onclick = () => open(selectedId ? 'create-episode' : 'create-series');
      grid.append(slot);
    }
  }
  function updateTrack() {
    left.disabled = track.scrollLeft <= 1;
    right.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
  }
  function render() {
    try {
      const shows = read();
      if (!shows.some(show => show.id === selectedId)) selectedId = shows[0]?.id || null;
      const current = shows.find(show => show.id === selectedId);
      nextEpisodeNumber = Math.max(0, ...(current?.episodes || []).map(episode => episode.number)) + 1;
      select.replaceChildren();
      if (!shows.length) select.add(new Option(t('No series yet'), ''));
      for (const show of shows) select.add(new Option(show.name, show.id, false, show.id === selectedId));
      select.disabled = !shows.length;
      document.getElementById('edit-show').disabled = !current;
      document.getElementById('new-episode').disabled = !current;
      document.getElementById('new-show').disabled = false;
      document.getElementById('series-description').textContent = current?.description || '';
      document.getElementById('episode-count').textContent = current?.episodes.length || 0;
      grid.replaceChildren();
      for (const episode of current?.episodes || []) {
        const tile = document.createElement('article');
        tile.className = 'project-tile';
        const link = document.createElement('a');
        link.className = 'project-open';
        link.href = `/canvas?show=${encodeURIComponent(current.id)}&episode=${encodeURIComponent(episode.id)}`;
        link.target = '_top';
        link.innerHTML = '<span class="episode-number"></span><span class="project-placeholder" aria-hidden="true">▷</span><h3></h3><time></time>';
        link.querySelector('.episode-number').textContent = t('EP {number}', {number: String(episode.number).padStart(2, '0')});
        link.querySelector('h3').textContent = episode.name;
        link.title = episode.name;
        const date = new Date(episode.updatedAt || episode.createdAt);
        link.querySelector('time').dateTime = date.toISOString();
        link.querySelector('time').textContent = t('Edited {date}', {date: date.toLocaleDateString(document.documentElement.lang)});
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'episode-edit';
        edit.textContent = t('Edit');
        edit.setAttribute('aria-label', t('Edit episode {number}', {number: episode.number}));
        edit.onclick = () => open('edit-episode', episode);
        tile.append(link, edit);
        grid.append(tile);
      }
      error.hidden = true;
      updateSlots();
      requestAnimationFrame(updateTrack);
    } catch {
      error.textContent = t('Saved series could not be read. Check browser storage before making changes.');
      error.hidden = false;
      grid.replaceChildren();
      select.disabled = true;
      for (const id of ['new-show', 'edit-show', 'new-episode']) document.getElementById(id).disabled = true;
    }
  }
  select.onchange = () => { selectedId = select.value; rememberSelection(); render(); track.scrollLeft = 0; };
  document.getElementById('new-show').onclick = () => open('create-series');
  document.getElementById('new-episode').onclick = () => open('create-episode');
  document.getElementById('edit-show').onclick = () => {
    try {
      const current = read().find(show => show.id === selectedId);
      if (!current) { render(); return; }
      open('edit-series', current);
    } catch { render(); }
  };
  document.getElementById('cancel-show').onclick = () => dialog.close();
  document.getElementById('show-form').onsubmit = event => {
    event.preventDefault();
    if (!name.value.trim()) { formError.textContent = t('Enter a name.'); return; }
    try {
      const shows = read();
      const time = Date.now();
      let nextSelection = selectedId;
      if (action === 'create-series') {
        const show = {id: crypto.randomUUID(), name: name.value.trim(), description: description.value.trim(), createdAt: time, episodes: []};
        shows.push(show);
        nextSelection = show.id;
      } else {
        const show = shows.find(item => item.id === selectedId);
        if (!show) { formError.textContent = t('This series no longer exists. Close and refresh the list.'); return; }
        if (action === 'create-episode') {
          const number = Math.max(0, ...show.episodes.map(episode => episode.number)) + 1;
          show.episodes.push({id:crypto.randomUUID(), name:name.value.trim(), description:description.value.trim(), createdAt:time, number});
        } else {
          const item = action === 'edit-series' ? show : show.episodes.find(episode => episode.id === editingId);
          if (!item) { formError.textContent = t('This episode no longer exists. Close and refresh the list.'); return; }
          item.name = name.value.trim();
          item.description = description.value.trim();
          item.updatedAt = time;
        }
      }
      localStorage.setItem(key, JSON.stringify(shows));
      selectedId = nextSelection;
      rememberSelection();
      dialog.close();
      render();
      if (action === 'create-series') track.scrollLeft = 0;
      if (action === 'create-episode') requestAnimationFrame(() => {
        const newest = grid.querySelector('article:last-of-type');
        if (newest) track.scrollLeft = newest.offsetLeft;
      });
    } catch { formError.textContent = t('Could not save changes. Check browser storage and try again.'); }
  };
  function slide(direction) {
    track.scrollBy({left:direction * track.clientWidth, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  left.onclick = () => slide(-1);
  right.onclick = () => slide(1);
  track.addEventListener('scroll', updateTrack, {passive:true});
  track.addEventListener('wheel', event => {
    if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1);
    if ((delta > 0 && !right.disabled) || (delta < 0 && !left.disabled)) { event.preventDefault(); track.scrollLeft += delta; }
  }, {passive:false});
  track.addEventListener('keydown', event => {
    if (event.target === track && ['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); slide(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  new ResizeObserver(() => { updateSlots(); updateTrack(); }).observe(track);
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) render(); });
  window.addEventListener('project-language-change', render);
  render();
})();
