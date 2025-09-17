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
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div class="animate-pulse bg-white rounded-lg p-4 shadow">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
        `;
        
        // Initialize reports array
        let reports = [];
        
        // Skip Supabase call if using mock data
        if (!useMockData) {
            try {
                console.log('Attempting to fetch data from Supabase...');
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10);
                    
                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }
                
                if (data && data.length > 0) {
                    console.log('Using real data from Supabase');
                    reports = data;
                } else {
                    console.log('No reports found in Supabase, using mock data');
                    // Will use mock data below
                }
            } catch (e) {
                console.error('Error fetching from Supabase:', e);
                // Will use mock data below
            }
        } else {
            console.log('Using mock data (Supabase call skipped)');
        }
        
        // For demo purposes, if Supabase is not configured, use mock data
        const mockReports = [
            {
                id: 1,
                location: 'Kerala',
                tag: 'hazard',
                message: 'Coastal flooding reported in Kochi area due to high tide.',
                created_at: '2023-09-15T08:30:00',
                user_id: 'user1',
                status: 'pending'
            },
            {
                id: 2,
                location: 'Tamil Nadu',
                tag: 'infrastructure',
                message: 'Damaged sea wall observed near Chennai harbor.',
                created_at: '2023-09-14T14:45:00',
                user_id: 'user2',
                status: 'verified'
            },
            {
                id: 3,
                location: 'Gujarat',
                tag: 'misc',
                message: 'Unusual fish migration patterns observed by local fishermen.',
                created_at: '2023-09-13T11:20:00',
                user_id: 'user3',
                status: 'resolved'
            },
            {
                id: 4,
                location: 'West Bengal',
                tag: 'hazard',
                message: 'Strong currents reported near Sundarbans delta.',
                created_at: '2023-09-12T16:10:00',
                user_id: 'user4',
                status: 'pending'
            },
            {
                id: 5,
                location: 'Maharashtra',
                tag: 'infrastructure',
                message: 'Navigation buoy missing from Mumbai harbor entrance.',
                created_at: '2023-09-11T09:55:00',
                user_id: 'user5',
                status: 'verified'
            },
            {
                id: 6,
                location: 'Andhra Pradesh',
                tag: 'hazard',
                message: 'Oil spill observed near Visakhapatnam port.',
                created_at: '2023-09-10T13:40:00',
                user_id: 'user6',
                status: 'pending'
            }
        ];
        
        // Always use mock data for now since Supabase is not configured
        const displayReports = mockReports;
        
        // Render reports
        let reportsHTML = '';
        
        displayReports.forEach(report => {
            // Format date
            const reportDate = new Date(report.created_at);
            const formattedDate = reportDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Set tag color and icon
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
                default: // misc
                    tagColor = 'bg-gray-100 text-gray-800';
                    tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>`;
            }
            
            // Set status badge
            let statusBadge = '';
            
            switch (report.status) {
                case 'verified':
                    statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Verified</span>`;
                    break;
                case 'resolved':
                    statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-accent bg-opacity-20 text-accent">Resolved</span>`;
                    break;
                default: // pending
                    statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>`;
            }
            
            // Create report card
            reportsHTML += `
                <div class="report-card bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-4">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tagColor}">
                                    ${tagIcon}
                                    ${report.tag.charAt(0).toUpperCase() + report.tag.slice(1)}
                                </span>
                                ${statusBadge}
                            </div>
                            <span class="text-xs text-gray-500">${formattedDate}</span>
                        </div>
                        
                        <p class="text-gray-800 mb-2">${report.message}</p>
                        
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