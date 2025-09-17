# INCOIS Web Application

## Overview
This is a responsive web application for the Indian National Centre for Ocean Information Services (INCOIS). The application provides a platform for users to view emergency notifications, submit reports, and access location-specific information related to ocean and coastal areas.

## Features
- **Emergency Notification System**: Displays global and location-specific warnings
- **Report Submission**: Allows users to submit reports with location, tags, and media
- **User Authentication**: Simple authentication system using Supabase
- **Location-Based Alerts**: Shows alerts specific to the user's location
- **Mobile-First Design**: Fully responsive from 320px to 1024px widths

## Tech Stack
- HTML5
- Vanilla JavaScript (ES2020+ modules)
- Tailwind CSS (via CDN)
- Supabase Auth for user authentication

## Pages
1. **Home Page**: Displays emergency notifications and a feed of reports
2. **Profile Page**: Shows user information and statistics
3. **Location Page**: Displays location-specific information and alerts
4. **Report Page**: Allows users to submit reports with location, tags, and media
5. **Login Page**: Handles user authentication

## Setup Instructions

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for CDN resources

### Local Development
1. Clone the repository
2. Open the project in your preferred code editor
3. Update the Supabase configuration in `js/app.js` with your Supabase URL and anon key
4. Open `index.html` in a web browser

### Supabase Setup
To fully utilize the application's features, you need to set up the following in your Supabase project:

1. **Authentication**: Enable phone auth or email auth
2. **Database Tables**:
   - `users`: For storing user information
   - `reports`: For storing user-submitted reports

## Project Structure
```
├── index.html              # Home page
├── profile.html            # User profile page
├── location.html           # Location information page
├── report.html             # Report submission page
├── login.html              # Authentication page
├── css/
│   └── styles.css          # Custom styles
├── js/
│   ├── app.js              # Core application logic
│   ├── home.js             # Home page functionality
│   ├── profile.js          # Profile page functionality
│   ├── location.js         # Location page functionality
│   ├── report.js           # Report submission functionality
│   └── login.js            # Authentication functionality
└── assets/
    ├── incois-logo.svg     # INCOIS logo
    └── incois-logo-white.svg # INCOIS logo (white version)
```

## Color Palette
- Primary: #0B5677 (navy blue)
- Accent: #2AB7B7 (seafoam)
- Danger: #FF3B30 (SOS red)
- Warn: #FF8C00 (alert orange)
- Sand: #F5E9D6 (pastel background)
- Gold: #C49A42 (highlight button)
- Text: #0F172A (dark text)

## License
This project is created for demonstration purposes.

## Acknowledgements
- INCOIS for the logo and branding inspiration
- Tailwind CSS for the utility-first CSS framework
- Supabase for the backend services