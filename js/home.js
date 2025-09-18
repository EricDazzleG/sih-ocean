// Home Page JavaScript

// Import from app.js
import { supabase } from './app.js';

// For development/demo purposes only
const useMockData = false; // Set to false when Supabase is properly configured

// DOM Elements
const feedContainer = document.getElementById('feed-container');

// Initialize Home Page
document.addEventListener('DOMContentLoaded', () => {
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

        // Static list of images placed under ./sihpics/
        // To add more, drop images into the folder and append their filenames here.
        const imageFiles = [
            'Flooding.Cuttak,Odisha.jpg',
            'Heavy winds.Balasore,Odisha.jpg',
            'Road collapsed during flood.cuttak,Odisha.jpg',
            'Tree blocking road.Puri,Odisha.jpg',
            'massive floods.Kendrapra,Odisha.jpg',
            'road closure.kendrapra,Odisha.jpg'
        ];

        // Parse filenames into cards
        const parsed = imageFiles.map((file, idx) => {
            const src = `./sihpics/${file}`;
            const withoutExt = file.replace(/\.[^.]+$/, '');
            // Split on the last dot to separate title and location (Title.Location)
            const lastDot = withoutExt.lastIndexOf('.');
            const rawTitle = lastDot > -1 ? withoutExt.slice(0, lastDot) : withoutExt;
            const rawLocation = lastDot > -1 ? withoutExt.slice(lastDot + 1) : 'Unknown';

            const title = toTitleCase(rawTitle.replace(/[_-]+/g, ' '));
            const location = rawLocation
                .split(',')
                .map(part => toTitleCase(part.trim()))
                .join(', ');

            // Basic tag inference from title keywords
            const t = rawTitle.toLowerCase();
            let tag = 'misc';
            if (t.includes('flood') || t.includes('cyclone') || t.includes('wind')) tag = 'hazard';
            else if (t.includes('road') || t.includes('bridge') || t.includes('tree')) tag = 'infrastructure';

            // Date: spread items over recent days
            const createdAt = new Date(Date.now() - idx * 24 * 60 * 60 * 1000);

            // Status: alternate to show variety
            const statuses = ['pending', 'verified', 'resolved'];
            const status = statuses[idx % statuses.length];

            return { id: idx + 1, src, title, location, tag, status, created_at: createdAt.toISOString() };
        });

        // Render cards
        let reportsHTML = '';
        parsed.forEach(report => {
            const reportDate = new Date(report.created_at);
            const formattedDate = reportDate.toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

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

            reportsHTML += `
                <div class="report-card bg-white rounded-lg shadow-md overflow-hidden">
                    <img src="${report.src}" alt="${report.title}" class="w-full h-48 object-cover" onerror="this.style.display='none'" />
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
                        <p class="text-gray-800 mb-2">${report.title}</p>
                        <div class="flex items-center text-sm text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>${report.location}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        // Update feed container
        feedContainer.innerHTML = reportsHTML;
        
    } catch (error) {
        console.error('Error loading reports feed:', error);
        feedContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-600">Error loading reports. Please try again later.</p>
            </div>
        `;
    }
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