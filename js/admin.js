// Admin Dashboard JavaScript

import { initSupabase, getSupabase, getUser } from './auth.js';

let supabase;
let charts = { status: null, tag: null, time: null };
const STORAGE_BUCKET = 'reports'; // adjust if your bucket name differs

// DOM
const tbody = document.getElementById('reports-tbody');
const adminPill = document.getElementById('admin-user-pill');
const statusBox = document.getElementById('admin-status');

const filterStatus = document.getElementById('filter-status');
const filterTag = document.getElementById('filter-tag');
const filterLocation = document.getElementById('filter-location');
const btnApply = document.getElementById('btn-apply-filters');
const btnClear = document.getElementById('btn-clear-filters');

// Init
document.addEventListener('DOMContentLoaded', async () => {
  await initSupabase();
  supabase = getSupabase();

  // Role gate
  const user = await getUser();
  const userType = (user?.user_metadata?.user_type || '').toLowerCase();
  if (!['admin', 'authority'].includes(userType)) {
    showStatus('Access denied. Admins only.', 'error');
    setTimeout(() => (window.location.href = 'index.html'), 1200);
    return;
  }
  if (adminPill) adminPill.classList.remove('hidden');

  // Load data
  bindFilters();
  await loadAndRender();
  ensurePreviewModal();
});

function bindFilters() {
  if (btnApply) btnApply.addEventListener('click', () => loadAndRender());
  if (btnClear) btnClear.addEventListener('click', () => {
    if (filterStatus) filterStatus.value = '';
    if (filterTag) filterTag.value = '';
    if (filterLocation) filterLocation.value = '';
    loadAndRender();
  });
}

async function loadAndRender() {
  try {
    showStatus('Loading reports...', 'loading');
    const reports = await fetchReports();
    renderTable(reports);
    renderCharts(reports);
    showStatus(`${reports.length} reports loaded`, 'success', 1500);
  } catch (e) {
    console.error(e);
    const msg = e?.message || e?.error_description || 'Failed to load reports';
    showStatus(`Failed to load reports: ${msg}`, 'error');
  }
}

async function fetchReports() {
  let query = supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(200);

  if (filterStatus?.value) query = query.eq('status', filterStatus.value);
  if (filterTag?.value) query = query.eq('tag', filterTag.value);
  if (filterLocation?.value) query = query.ilike('location', `%${filterLocation.value}%`);

  const { data, error } = await query;
  if (error) throw error;
  const normalized = (data || []).map(normalizeReport);
  // Resolve storage paths to public/signed URLs for previewing
  const withResolved = await Promise.all(normalized.map(async (r) => {
    if (!r.media_url) return { ...r, media_display_url: null };
    const resolved = await resolveMediaUrl(r.media_url);
    if (!resolved) {
      console.warn('Unable to resolve media_url for report', r.id, r.media_url);
    }
    return { ...r, media_display_url: resolved };
  }));
  return withResolved;
}

// Normalize report fields to handle schema variations
function normalizeReport(r) {
  return {
    id: r.id,
    message: r.message || r.description || '',
    location: r.location || '',
    tag: r.tag || r.severity || 'misc',
    status: r.status || 'pending',
    created_at: r.created_at || r.inserted_at || new Date().toISOString(),
    user_id: r.user_id || null,
    media_url: r.media_url || r.media || null,
  };
}

function renderTable(reports) {
  if (!tbody) return;
  if (!reports.length) {
    tbody.innerHTML = `<tr><td class="px-4 py-3 text-gray-500" colspan="8">No reports found</td></tr>`;
    return;
  }

  const rows = reports.map(r => {
    const date = new Date(r.created_at);
    const dateStr = isNaN(date.getTime()) ? '' : date.toLocaleString();
    return `
      <tr class="border-b align-top">
        <td class="px-4 py-3">
          ${renderMediaThumb(r.media_display_url || r.media_url)}
        </td>
        <td class="px-4 py-3 max-w-sm">
          <div class="text-gray-800">${escapeHtml(r.message)}</div>
        </td>
        <td class="px-4 py-3">${badgeTag(r.tag)}</td>
        <td class="px-4 py-3">${escapeHtml(r.location || '-')}</td>
        <td class="px-4 py-3 text-xs">${r.user_id || '-'}</td>
        <td class="px-4 py-3 text-xs text-gray-500">${dateStr}</td>
        <td class="px-4 py-3">${badgeStatus(r.status)}</td>
        <td class="px-4 py-3">
          <div class="flex flex-wrap gap-2">
            ${actionButtons(r)}
          </div>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = rows.join('');

  // Bind actions
  tbody.querySelectorAll('[data-action]')?.forEach(el => {
    el.addEventListener('click', async (e) => {
      const id = el.getAttribute('data-id');
      const action = el.getAttribute('data-action');
      if (!id || !action) return;
      await handleAction(action, id);
    });
  });

  // Bind media preview
  tbody.querySelectorAll('[data-preview-url]')?.forEach(el => {
    el.addEventListener('click', () => {
      const url = el.getAttribute('data-preview-url');
      const type = el.getAttribute('data-preview-type') || 'image';
      openPreview(url, type);
    });
  });
}

function renderMediaThumb(url) {
  if (!url) return '<div class="w-24 h-16 bg-gray-100 flex items-center justify-center text-xs text-gray-500">No media</div>';
  const lower = String(url).toLowerCase();
  if (lower.match(/\.(mp4|webm|ogg)$/) || lower.startsWith('data:video')) {
    return `<button type="button" class="group" data-preview-url="${encodeURI(url)}" data-preview-type="video" title="Open preview">
      <video class="w-24 h-16 object-cover rounded pointer-events-none" src="${encodeURI(url)}" muted></video>
    </button>`;
  }
  return `<button type="button" class="group" data-preview-url="${encodeURI(url)}" data-preview-type="image" title="Open preview">
    <img class="w-24 h-16 object-cover rounded pointer-events-none" src="${encodeURI(url)}" alt="media" onerror="this.src='';this.outerHTML='<div class=\'w-24 h-16 bg-gray-100 flex items-center justify-center text-xs text-gray-500\'>No media</div>'" />
  </button>`;
}

function badgeTag(tag) {
  const map = {
    hazard: 'bg-red-100 text-red-800',
    infrastructure: 'bg-blue-100 text-blue-800',
    misc: 'bg-gray-100 text-gray-800'
  };
  const cls = map[(tag || 'misc').toLowerCase()] || map.misc;
  const label = (tag || 'misc').charAt(0).toUpperCase() + (tag || 'misc').slice(1);
  return `<span class="px-2 py-1 text-xs rounded-full ${cls}">${label}</span>`;
}

function badgeStatus(status) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    resolved: 'bg-emerald-100 text-emerald-800'
  };
  const cls = map[(status || 'pending').toLowerCase()] || map.pending;
  const label = (status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1);
  return `<span class="px-2 py-1 text-xs rounded-full ${cls}">${label}</span>`;
}

function actionButtons(r) {
  return `
    <button class="px-2 py-1 text-xs rounded border" data-action="verify" data-id="${r.id}">Verify</button>
    <button class="px-2 py-1 text-xs rounded border" data-action="reject" data-id="${r.id}">Reject</button>
    <button class="px-2 py-1 text-xs rounded border" data-action="resolve" data-id="${r.id}">Resolve</button>
  `;
}

async function handleAction(action, id) {
  try {
    const status = action === 'verify' ? 'verified' : action === 'reject' ? 'rejected' : 'resolved';
    const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (error) throw error;
    showStatus(`Report ${action}d`, 'success', 1200);
    await loadAndRender();
  } catch (e) {
    console.error(e);
    showStatus('Action failed', 'error');
  }
}

function renderCharts(reports) {
  const byStatus = countBy(reports, r => (r.status || 'pending').toLowerCase());
  const byTag = countBy(reports, r => (r.tag || 'misc').toLowerCase());
  const byDay = countBy(reports, r => formatDay(r.created_at));

  const statusLabels = ['pending', 'verified', 'rejected', 'resolved'];
  const statusData = statusLabels.map(l => byStatus[l] || 0);

  const tagLabels = ['hazard', 'infrastructure', 'misc'];
  const tagData = tagLabels.map(l => byTag[l] || 0);

  const last30 = lastNDaysLabels(30);
  const timeData = last30.map(d => byDay[d] || 0);

  // Status chart
  const ctxStatus = document.getElementById('chart-status');
  if (ctxStatus) {
    if (charts.status) charts.status.destroy();
    charts.status = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: statusLabels.map(capitalize),
        datasets: [{ data: statusData, backgroundColor: ['#FDE68A','#86EFAC','#FCA5A5','#6EE7B7'] }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
  }

  // Tag chart
  const ctxTag = document.getElementById('chart-tag');
  if (ctxTag) {
    if (charts.tag) charts.tag.destroy();
    charts.tag = new Chart(ctxTag, {
      type: 'bar',
      data: {
        labels: tagLabels.map(capitalize),
        datasets: [{ label: 'Reports', data: tagData, backgroundColor: '#93C5FD' }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }

  // Time chart
  const ctxTime = document.getElementById('chart-time');
  if (ctxTime) {
    if (charts.time) charts.time.destroy();
    charts.time = new Chart(ctxTime, {
      type: 'line',
      data: { labels: last30, datasets: [{ label: 'Reports/day', data: timeData, borderColor: '#0B5677', backgroundColor: 'rgba(11,86,119,0.1)', fill: true, tension: 0.3 }] },
      options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
    });
  }
}

function countBy(arr, fn) {
  return arr.reduce((acc, item) => {
    const k = fn(item);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function lastNDaysLabels(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(formatDay(d));
  }
  return out;
}

function formatDay(d) {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showStatus(text, type = 'info', duration = 3000) {
  if (!statusBox) return;
  statusBox.textContent = text;
  statusBox.classList.remove('hidden');
  statusBox.className = 'p-4 text-sm rounded';
  const map = { success: 'bg-green-50 text-green-800', error: 'bg-red-50 text-red-800', loading: 'bg-blue-50 text-blue-800', info: 'bg-gray-50 text-gray-800' };
  const cls = (map[type] || map.info).split(' ').filter(Boolean);
  statusBox.classList.add(...cls);
  if (type !== 'loading') setTimeout(() => statusBox.classList.add('hidden'), duration);
}

// Resolve a storage path (e.g., reports/uid/file.jpg) to a usable URL
async function resolveMediaUrl(pathOrUrl) {
  // Already an absolute or data URL
  if (/^https?:\/\//i.test(pathOrUrl) || /^data:/i.test(pathOrUrl)) return pathOrUrl;
  try {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(pathOrUrl);
    if (data?.publicUrl) return data.publicUrl;
  } catch (e) {
    console.warn('Public URL resolution failed', e);
  }
  try {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(pathOrUrl, 60 * 60);
    if (!error && data?.signedUrl) return data.signedUrl;
  } catch (e) {
    console.warn('Signed URL resolution failed', e);
  }
  return null; // signal unresolved
}

// Preview modal helpers
function ensurePreviewModal() {
  if (document.getElementById('admin-preview-modal')) return;
  const div = document.createElement('div');
  div.id = 'admin-preview-modal';
  div.className = 'fixed inset-0 z-50 hidden';
  div.innerHTML = `
    <div class="absolute inset-0 bg-black bg-opacity-60" data-close></div>
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow max-w-3xl w-full overflow-hidden">
        <div class="p-2 border-b flex justify-between items-center">
          <span class="text-sm text-gray-600">Media preview</span>
          <button class="px-2 py-1 text-sm" data-close>&times;</button>
        </div>
        <div class="p-2" id="admin-preview-body"></div>
      </div>
    </div>`;
  document.body.appendChild(div);
  div.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) hidePreview(); });
}

function openPreview(url, type) {
  const modal = document.getElementById('admin-preview-modal');
  const body = document.getElementById('admin-preview-body');
  if (!modal || !body) return;
  if (!url) {
    body.innerHTML = `<div class="p-6 text-sm text-gray-600">No media available for preview.</div>`;
    modal.classList.remove('hidden');
    return;
  }
  body.innerHTML = type === 'video'
    ? `<video id="admin-preview-el" src="${encodeURI(url)}" class="w-full h-[60vh] object-contain" controls autoplay></video>`
    : `<img id="admin-preview-el" src="${encodeURI(url)}" class="w-full h-[60vh] object-contain" alt="preview" />`;
  modal.classList.remove('hidden');
  const el = document.getElementById('admin-preview-el');
  if (el) {
    el.addEventListener('error', () => {
      body.innerHTML = `<div class="p-6 text-sm text-gray-600">
        Preview unavailable. Source: <code class="break-all">${escapeHtml(url)}</code>
        <div class="mt-2">Check if the file exists in the storage bucket "${STORAGE_BUCKET}" and that the path is correct.</div>
      </div>`;
    }, { once: true });
  }
}

function hidePreview() {
  const modal = document.getElementById('admin-preview-modal');
  if (modal) modal.classList.add('hidden');
}
