// Alamat backend Spring Boot. Ubah jika port di application.properties bukan 8080.
const BACKEND_URL = 'http://localhost:8080';
const API_URL = BACKEND_URL + '/api/movies';

const STATUS_LABEL = { 'Plan to Watch': 'Ingin ditonton', 'Watching': 'Sedang ditonton', 'Completed': 'Selesai' };
const TABS = [['all', 'Semua'], ['Plan to Watch', 'Ingin ditonton'], ['Watching', 'Sedang ditonton'], ['Completed', 'Selesai']];

let movies = [], filter = 'all', query = '', editingId = null, deletingId = null;
const $ = id => document.getElementById(id);

async function api(path = '', options = {}) {
  const res = await fetch(API_URL + path, {
    headers: { 'Content-Type': 'application/json' }, ...options
  });
  if (!res.ok) throw new Error((await res.text()) || ('HTTP ' + res.status));
  return res.status === 204 ? null : res.json();
}

function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400);
}

async function loadMovies() {
  try {
    movies = await api();
    $('banner').hidden = true;
  } catch (e) {
    const b = $('banner'); b.hidden = false; b.textContent = '';
    b.append(`Tidak bisa terhubung ke backend di ${BACKEND_URL}. Pastikan aplikasi Spring Boot berjalan dan MySQL aktif.`);
    const retry = el('button', 'btn', 'Coba lagi'); retry.onclick = loadMovies; b.append(retry);
    console.error(e);
  }
  render();
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function render() {
  const tabs = $('tabs'); tabs.textContent = '';
  TABS.forEach(([key, label]) => {
    const count = key === 'all' ? movies.length : movies.filter(m => m.status === key).length;
    const b = el('button', 'tab', label); b.append(el('small', '', count));
    b.setAttribute('aria-pressed', filter === key);
    b.onclick = () => { filter = key; render(); };
    tabs.append(b);
  });

  const list = movies
    .filter(m => filter === 'all' || m.status === filter)
    .filter(m => (m.movieTitle || '').toLowerCase().includes(query))
    .sort((a, b) => b.id - a.id);

  const grid = $('grid'); grid.textContent = '';
  if (!list.length) {
    const e = el('div', 'empty'); e.append(el('h2', '', movies.length ? 'Tidak ada hasil' : 'Watchlist masih kosong'),
      el('p', '', movies.length ? 'Coba kata kunci atau filter lain.' : 'Klik "Tambah film" untuk mencatat tontonan pertamamu.'));
    grid.append(e); return;
  }
  list.forEach(m => grid.append(card(m)));
}

function card(m) {
  const c = el('article', 'card');
  const p = el('div', 'poster');
  const ph = () => { p.querySelector('img')?.remove(); p.prepend(el('div', 'ph', (m.movieTitle || '?')[0].toUpperCase())); };
  if (m.moviePoster) {
    const img = new Image(); img.alt = 'Poster ' + m.movieTitle; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
    img.onerror = ph; img.src = m.moviePoster; p.append(img);
  } else ph();
  p.append(el('span', 'badge ' + m.status, STATUS_LABEL[m.status] || m.status || '-'));

  const info = el('div', 'info');
  info.append(el('h3', '', m.movieTitle));
  const stars = el('div', 'stars');
  for (let i = 1; i <= 5; i++) {
    const s = el('button', 'star' + (i <= m.userRating ? ' on' : ''), '★');
    s.setAttribute('aria-label', `Beri ${i} bintang`);
    s.onclick = () => save({ ...m, userRating: m.userRating === i ? 0 : i }, m.id, 'Rating disimpan');
    stars.append(s);
  }
  const act = el('div', 'card-actions');
  const edit = el('button', 'btn', 'Ubah'); edit.onclick = () => openForm(m);
  const del = el('button', 'btn', 'Hapus'); del.onclick = () => askDelete(m);
  act.append(edit, del);
  info.append(stars, act);
  c.append(p, info);
  return c;
}

async function save(data, id, okMsg) {
  try {
    const saved = id ? await api('/' + id, { method: 'PUT', body: JSON.stringify(data) })
                     : await api('', { method: 'POST', body: JSON.stringify(data) });
    movies = id ? movies.map(m => m.id === id ? saved : m) : [...movies, saved];
    render(); toast(okMsg); return true;
  } catch (e) { toast('Gagal menyimpan: ' + e.message); return false; }
}

function openForm(m) {
  editingId = m ? m.id : null;
  $('formTitle').textContent = m ? 'Ubah film' : 'Tambah film';
  $('title').value = m ? m.movieTitle : '';
  $('poster').value = m ? (m.moviePoster || '') : '';
  $('status').value = m && STATUS_LABEL[m.status] ? m.status : 'Plan to Watch';
  $('rating').value = m ? m.userRating : 0;
  $('formDialog').showModal(); $('title').focus();
}

$('movieForm').addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    movieTitle: $('title').value.trim(), moviePoster: $('poster').value.trim(),
    status: $('status').value, userRating: parseInt($('rating').value, 10)
  };
  const ok = await save(data, editingId, editingId ? 'Film diubah' : 'Film ditambahkan');
  if (ok) $('formDialog').close();
});

function askDelete(m) {
  deletingId = m.id;
  $('confirmText').textContent = `"${m.movieTitle}" akan dihapus dari watchlist.`;
  $('confirmDialog').showModal();
}
$('confirmDialog').addEventListener('close', async () => {
  if ($('confirmDialog').returnValue !== 'ok') return;
  try {
    await api('/' + deletingId, { method: 'DELETE' });
    movies = movies.filter(m => m.id !== deletingId); render(); toast('Film dihapus');
  } catch (e) { toast('Gagal menghapus: ' + e.message); }
});

$('addBtn').onclick = () => openForm(null);
$('cancelBtn').onclick = () => $('formDialog').close();
$('search').addEventListener('input', e => { query = e.target.value.toLowerCase(); render(); });

loadMovies();