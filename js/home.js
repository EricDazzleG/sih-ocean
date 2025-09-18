// Home Page JavaScript

// Use Supabase auth helpers to ensure client is ready
import { initSupabase, getSupabase } from './auth.js';

let supabaseClient;
const STORAGE_BUCKET = 'reports';

// DOM Elements
const feedContainer = document.getElementById('feed-container');

// Initialize Home Page
document.addEventListener('DOMContentLoaded', async () => {
    // Ensure Supabase client is ready
    await initSupabase();
    supabaseClient = getSupabase();
    // Load Reports Feed
    loadReportsFeed();
});

// Load Reports Feed
async function loadReportsFeed() {
    if (!feedContainer) return;
    
    try {
        // Show loading state
        feedContainer.innerHTML = `
            <div class="animate-pulse bg-white rounded-lg p-4 shadow">
                <div class="h-40 bg-gray-200 rounded w-full mb-3"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            </div>
        `;

        // Try to load real reports from Supabase
        const { data, error } = await supabaseClient
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(24);
        if (error) throw error;

        let cards = [];
        if (data && data.length) {
            // Normalize and resolve media URLs
            const normalized = await Promise.all(
                data.map(async (r, idx) => {
                    const created = r.created_at || new Date(Date.now() - idx * 86400000).toISOString();
                    const mediaUrl = await resolveMediaUrl(r.media_url || '');
                    return {
                        id: r.id,
                        title: r.message || r.title || 'Report',
                        location: r.location || 'Unknown',
                        tag: (r.tag || r.severity || 'misc').toLowerCase(),
                        status: (r.status || 'pending').toLowerCase(),
                        created_at: created,
                        src: mediaUrl
                    };
                })
            );
            cards = normalized;
        } else {
            // Fallback: local sihpics images parsed into cards
            const imageFiles = [
                'Flooding.Cuttak,Odisha.jpg',
                'Heavy winds.Balasore,Odisha.jpg',
                'Road collapsed during flood.cuttak,Odisha.jpg',
                'Tree blocking road.Puri,Odisha.jpg',
                'massive floods.Kendrapra,Odisha.jpg',
                'road closure.kendrapra,Odisha.jpg'
            ];

            cards = imageFiles.map((file, idx) => {
                const src = `./sihpics/${file}`;
                const withoutExt = file.replace(/\.[^.]+$/, '');
                const lastDot = withoutExt.lastIndexOf('.');
                const rawTitle = lastDot > -1 ? withoutExt.slice(0, lastDot) : withoutExt;
                const rawLocation = lastDot > -1 ? withoutExt.slice(lastDot + 1) : 'Unknown';
                const title = toTitleCase(rawTitle.replace(/[_-]+/g, ' '));
                const location = rawLocation.split(',').map(p => toTitleCase(p.trim())).join(', ');
                const t = rawTitle.toLowerCase();
                let tag = 'misc';
                if (t.includes('flood') || t.includes('cyclone') || t.includes('wind')) tag = 'hazard';
                else if (t.includes('road') || t.includes('bridge') || t.includes('tree')) tag = 'infrastructure';
                const statuses = ['pending', 'verified', 'resolved'];
                const status = statuses[idx % statuses.length];
                const createdAt = new Date(Date.now() - idx * 86400000).toISOString();
                return { id: idx + 1, src, title, location, tag, status, created_at: createdAt };
            });
        }

        // Render cards
        let html = '';
        for (const report of cards) {
            const formattedDate = new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

            // Tag color/icon
            let tagColor = '';
            let tagIcon = '';
            switch (report.tag) {
                case 'hazard':
                    tagColor = 'bg-red-100 text-red-800';
                    tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>`;
                    break;
                case 'infrastructure':
                    tagColor = 'bg-blue-100 text-blue-800';
                    tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>`;
                    break;
                default:
                    tagColor = 'bg-gray-100 text-gray-800';
                    tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>`;
            }

            // Status badge
            let statusBadge = '';
            switch (report.status) {
                case 'verified':
                    statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Verified</span>`;
                    break;
                case 'resolved':
                    statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-accent bg-opacity-20 text-accent">Resolved</span>`;
                    break;
                default:
                    statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>`;
            }

            html += `
                <div class="report-card bg-white rounded-lg shadow-md overflow-hidden">
                    ${report.src ? `<button type="button" class="w-full" data-preview-url="${encodeURI(report.src)}" data-preview-type="image" title="Open preview">
                        <img src="${report.src}" alt="${escapeHtml(report.title)}" class="w-full h-48 object-cover pointer-events-none" />
                    </button>` : ''}
                    <div class="p-4">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center gap-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tagColor}">
                                    ${tagIcon}
                                    ${report.tag.charAt(0).toUpperCase() + report.tag.slice(1)}
                                </span>
                                ${statusBadge}
                            </div>
                            <span class="text-xs text-gray-500">${formattedDate}</span>
                        </div>
                        <p class="text-gray-800 mb-2">${escapeHtml(report.title)}</p>
                        <div class="flex items-center text-sm text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>${escapeHtml(report.location)}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        feedContainer.innerHTML = html;

        // Bind preview modal events
        bindPreviewHandlers();
        
    } catch (error) {
        console.error('Error loading reports feed:', error);
        feedContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-600">Error loading reports. Please try again later.</p>
            </div>
        `;
    }
}

// Resolve a storage path (e.g., reports/uid/file.jpg) to a usable URL
async function resolveMediaUrl(pathOrUrl) {
    if (!pathOrUrl) return '';
    if (/^https?:\/\//i.test(pathOrUrl) || /^data:/i.test(pathOrUrl)) return pathOrUrl;
    // Prefer a signed URL (works for private buckets too)
    try {
        const { data, error } = await supabaseClient.storage.from(STORAGE_BUCKET).createSignedUrl(pathOrUrl, 60 * 60);
        if (!error && data?.signedUrl) return data.signedUrl;
    } catch (e) { console.warn('Signed URL failed', e); }
    // Fallback to public URL (if bucket is public)
    try {
        const { data } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(pathOrUrl);
        if (data?.publicUrl) return data.publicUrl;
    } catch (e) { console.warn('Public URL failed', e); }
    return '';
}

function bindPreviewHandlers() {
    const modalId = 'home-preview-modal';
    ensurePreviewModal(modalId);
    document.querySelectorAll('[data-preview-url]')?.forEach(el => {
        el.addEventListener('click', () => {
            const url = el.getAttribute('data-preview-url');
            openPreviewModal(modalId, url);
        });
    });
}

function ensurePreviewModal(id) {
    if (document.getElementById(id)) return;
    const div = document.createElement('div');
    div.id = id;
    div.className = 'fixed inset-0 z-50 hidden';
    div.innerHTML = `
        <div class="absolute inset-0 bg-black bg-opacity-60" data-close></div>
        <div class="absolute inset-0 flex items-center justify-center p-4">
          <div class="bg-white rounded-lg shadow max-w-3xl w-full overflow-hidden">
            <div class="p-2 border-b flex justify-between items-center">
              <span class="text-sm text-gray-600">Media preview</span>
              <button class="px-2 py-1 text-sm" data-close>&times;</button>
            </div>
            <div class="p-2" id="${id}-body"></div>
          </div>
        </div>`;
    document.body.appendChild(div);
    div.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) hidePreviewModal(id); });
}

function openPreviewModal(id, url) {
    const modal = document.getElementById(id);
    const body = document.getElementById(`${id}-body`);
    if (!modal || !body) return;
    body.innerHTML = url ? `<img src="${encodeURI(url)}" class="w-full h-[60vh] object-contain" alt="preview" />` : `<div class='p-6 text-sm text-gray-600'>No media to preview</div>`;
    modal.classList.remove('hidden');
}

function hidePreviewModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
}

// Helpers
function toTitleCase(str) {
    return String(str)
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
}

function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
}