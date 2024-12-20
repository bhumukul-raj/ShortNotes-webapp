// admin_script.js
import { templates } from './subjectsTemplates.js';

// Main application logic
class SubjectViewer {
    constructor() {
        this.container = document.getElementById('subjectsContainer');
        this.searchInput = document.querySelector('.search-box input');
        this.subjects = [];
        console.log('SubjectViewer initialized');
    }

    async initialize() {
        try {
            console.log('Initializing SubjectViewer...');
            // Call loadSubjectsData() to fetch data from the API
            this.subjects = await loadSubjectsData();
            console.log('Subjects fetched:', this.subjects);
            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize:', error);
        }
    }

    render() {
        console.log('Rendering subjects...');
        if (!this.container) {
            console.error('Subjects container not found!');
            return;
        }

        const html = this.subjects
            .map(subject => {
                console.log('Rendering subject:', subject);
                return templates.subjectCard(subject);  // Generate HTML for each subject
            })
            .join('');

        this.container.innerHTML = html;
        console.log('Subjects rendered into container.');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));  // Handle search input
            console.log('Search input event listener attached.');
        } else {
            console.warn('Search input element not found!');
        }
    }

    handleSearch(searchTerm) {
        console.log('Handling search for term:', searchTerm);
        const term = searchTerm.toLowerCase();
        const cards = document.querySelectorAll('.subject-card');

        cards.forEach(card => {
            const content = card.textContent.toLowerCase();
            card.style.display = content.includes(term) ? '' : 'none';  // Filter subject cards based on search term
        });
        console.log(`Filtered subjects with search term: ${searchTerm}`);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. Initializing SubjectViewer...');
    const viewer = new SubjectViewer();
    viewer.initialize();  // Initialize SubjectViewer

    setupLogoutButton();  // Set up the logout button functionality
});

// Global handlers for topic actions
window.editTopic = (topicId) => {
    console.log('Editing topic:', topicId);
    // Implement edit logic
};

window.deleteTopic = (topicId) => {
    if (confirm('Are you sure you want to delete this topic?')) {
        console.log('Deleting topic:', topicId);
        // Implement delete logic
    }
};

// Fetch and load subjects dynamically from the API
async function loadSubjectsData() {
    console.log('Fetching subjects data from the API...');
    try {
        const response = await fetch('/api/subjects');  // Fetch subjects from the API
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();  // Parse the response as JSON
        console.log('Fetched data:', data);
        return data;  // Return the parsed subjects data
    } catch (error) {
        console.error('Error fetching subjects:', error);
        throw error;
    }
}

// Function to set up the logout button
function setupLogoutButton() {
    console.log('Setting up logout button...');
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function (e) {
            console.log('Logout button clicked');
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '/login';  // Redirect to login page
            }
        });
        console.log('Logout button event listener attached.');
    } else {
        console.warn('Logout button not found!');
    }
}
