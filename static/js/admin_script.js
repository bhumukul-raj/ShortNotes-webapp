// admin_script.js
import { templates } from './subjectsTemplates.js';

// Main application logic
class SubjectViewer {
    constructor() {
        this.container = document.getElementById('subjectsContainer');
        this.searchInput = document.querySelector('.search-box input');
        this.subjects = [];
        console.log('SubjectViewer initialized');
        this.showLoading();
    }

    showLoading() {
        if (this.container) {
            this.container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        }
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
        }
    }

    async initialize() {
        try {
            this.showLoading();
            this.subjects = await loadSubjectsData();
            if (this.subjects.length === 0) {
                this.showError('No subjects found');
                return;
            }
            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showError('Failed to load subjects. Please try again later.');
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
    console.log('Edit topic clicked:', topicId);
    const topicRow = document.querySelector(`.topic-row[data-topic-id="${topicId}"]`);
    console.log('Found topic row:', topicRow);
    
    if (!topicRow) {
        console.error('Topic row not found for ID:', topicId);
        return;
    }

    // Hide view mode elements and show edit mode elements
    const viewModeElements = topicRow.querySelectorAll('.view-mode');
    const editModeElements = topicRow.querySelectorAll('.edit-mode');
    
    console.log('View mode elements:', viewModeElements.length);
    console.log('Edit mode elements:', editModeElements.length);

    viewModeElements.forEach(el => el.style.display = 'none');
    editModeElements.forEach(el => el.style.display = 'block');
    
    console.log('Edit mode activated for topic:', topicId);
};

window.applyTopicEdit = async (topicId) => {
    console.log('Applying topic edit:', topicId);
    const topicRow = document.querySelector(`.topic-row[data-topic-id="${topicId}"]`);
    if (!topicRow) {
        console.error('Topic row not found for ID:', topicId);
        return;
    }

    const newName = topicRow.querySelector('.edit-mode input').value;
    const newText = topicRow.querySelector('.edit-mode textarea:first-child').value;
    const newCode = topicRow.querySelector('.edit-mode textarea:last-child').value;

    console.log('New values:', { newName, newText, newCode });

    try {
        // Send update to server
        const response = await fetch(`/api/topics/${topicId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newName,
                details: {
                    text: newText,
                    code: newCode
                }
            })
        });

        if (!response.ok) throw new Error('Failed to update topic');

        // Update the view
        topicRow.querySelector('.topic-name').textContent = newName;
        
        // Update the content
        const contentContainer = topicRow.querySelector('.topic-content');
        contentContainer.innerHTML = `
            ${newText ? `<p class="mb-2">${newText}</p>` : ''}
            ${newCode ? `<pre class="bg-light p-2 rounded"><code>${newCode}</code></pre>` : ''}
        `;

        // Switch back to view mode
        cancelTopicEdit(topicId);
        console.log('Topic updated successfully');
    } catch (error) {
        console.error('Failed to update topic:', error);
        alert('Failed to update topic. Please try again.');
    }
};

window.cancelTopicEdit = (topicId) => {
    console.log('Canceling topic edit:', topicId);
    const topicRow = document.querySelector(`.topic-row[data-topic-id="${topicId}"]`);
    if (!topicRow) {
        console.error('Topic row not found for ID:', topicId);
        return;
    }

    // Show view mode elements and hide edit mode elements
    topicRow.querySelectorAll('.view-mode').forEach(el => el.style.display = 'block');
    topicRow.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'none');
    console.log('Edit mode canceled');
};

window.deleteTopic = (topicId) => {
    if (confirm('Are you sure you want to delete this topic?')) {
        console.log('Deleting topic:', topicId);
        // Implement delete logic here
    }
};

// Fetch and load subjects dynamically from the API
async function loadSubjectsData() {
    console.log('Fetching subjects data from the API...');
    try {
        const response = await fetch('/api/subjects');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Raw response:', text);
        
        const data = JSON.parse(text);
        console.log('Parsed data:', data);
        
        return data.subjects || [];
    } catch (error) {
        console.error('Detailed error:', error);
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

// Add these global handlers
window.editSubject = (subjectId) => {
    const subjectCard = document.querySelector(`.subject-card[data-subject-id="${subjectId}"]`);
    if (!subjectCard) return;

    // Only target the subject header elements
    const subjectHeader = subjectCard.querySelector('.card-header');
    const subjectDescription = subjectCard.querySelector('.subject-description');

    // Hide/show only subject-specific elements
    subjectHeader.querySelectorAll('.view-mode').forEach(el => el.style.display = 'none');
    subjectHeader.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'block');
    
    // Handle description separately
    subjectDescription.querySelector('.view-mode').style.display = 'none';
    subjectDescription.querySelector('.edit-mode').style.display = 'block';
};

window.applySubjectEdit = async (subjectId) => {
    const subjectCard = document.querySelector(`.subject-card[data-subject-id="${subjectId}"]`);
    if (!subjectCard) return;

    const newName = subjectCard.querySelector('.edit-mode input').value;
    const newDescription = subjectCard.querySelector('.edit-mode textarea').value;

    try {
        // Send update to server (you'll need to implement this API endpoint)
        const response = await fetch(`/api/subjects/${subjectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newName,
                description: newDescription
            })
        });

        if (!response.ok) throw new Error('Failed to update subject');

        // Update the view
        subjectCard.querySelector('.subject-name').textContent = newName;
        subjectCard.querySelector('.subject-description .view-mode').textContent = newDescription;

        // Switch back to view mode
        cancelSubjectEdit(subjectId);
    } catch (error) {
        console.error('Failed to update subject:', error);
        alert('Failed to update subject. Please try again.');
    }
};

window.cancelSubjectEdit = (subjectId) => {
    console.log('Canceling edit for subject:', subjectId);
    const subjectCard = document.querySelector(`.subject-card[data-subject-id="${subjectId}"]`);
    if (!subjectCard) {
        console.error('Subject card not found');
        return;
    }

    // Check if this is a temporary subject (new subject being added)
    if (typeof subjectId === 'string' && subjectId.includes('temp_')) {
        console.log('Removing temporary subject');
        subjectCard.remove();
        return;
    }

    // For existing subjects, just revert to view mode
    const subjectHeader = subjectCard.querySelector('.card-header');
    const subjectDescription = subjectCard.querySelector('.subject-description');

    // Show/hide only subject-specific elements
    subjectHeader.querySelectorAll('.view-mode').forEach(el => el.style.display = 'block');
    subjectHeader.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'none');
    
    // Handle description separately
    subjectDescription.querySelector('.view-mode').style.display = 'block';
    subjectDescription.querySelector('.edit-mode').style.display = 'none';
};

// Add these section handlers
window.editSection = (sectionId) => {
    const sectionContainer = document.querySelector(`.section-container[data-section-id="${sectionId}"]`);
    if (!sectionContainer) return;

    // Hide view mode elements and show edit mode elements
    sectionContainer.querySelectorAll('.view-mode').forEach(el => el.style.display = 'none');
    sectionContainer.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'block');
};

window.applySectionEdit = async (sectionId) => {
    const sectionContainer = document.querySelector(`.section-container[data-section-id="${sectionId}"]`);
    if (!sectionContainer) return;

    const newName = sectionContainer.querySelector('.edit-mode input').value;

    try {
        // Send update to server
        const response = await fetch(`/api/sections/${sectionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newName
            })
        });

        if (!response.ok) throw new Error('Failed to update section');

        // Update the view
        sectionContainer.querySelector('.section-name').textContent = newName;

        // Switch back to view mode
        cancelSectionEdit(sectionId);
    } catch (error) {
        console.error('Failed to update section:', error);
        alert('Failed to update section. Please try again.');
    }
};

window.cancelSectionEdit = (sectionId) => {
    const sectionContainer = document.querySelector(`.section-container[data-section-id="${sectionId}"]`);
    if (!sectionContainer) return;

    // Show view mode elements and hide edit mode elements
    sectionContainer.querySelectorAll('.view-mode').forEach(el => el.style.display = 'block');
    sectionContainer.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'none');
};

window.addNewSubject = () => {
    // Check if there's already a new subject being added
    const tempSubject = document.querySelector('.subject-card[data-subject-id^="temp_"]');
    if (tempSubject) {
        tempSubject.scrollIntoView({ behavior: 'smooth' });
        tempSubject.classList.add('highlight-pulse');
        setTimeout(() => {
            tempSubject.classList.remove('highlight-pulse');
        }, 1000);
        return;
    }

    // Create a new subject template
    const newSubject = {
        id: 'temp_' + Date.now(),
        name: '',  // Empty by default
        description: '', // Empty by default
        sections: []
    };

    // Add the new subject to the DOM
    const subjectsContainer = document.getElementById('subjectsContainer');
    const subjectHtml = templates.subjectCard(newSubject);
    subjectsContainer.insertAdjacentHTML('afterbegin', subjectHtml);

    // Automatically trigger edit mode and set placeholder text
    setTimeout(() => {
        const subjectCard = document.querySelector(`.subject-card[data-subject-id="${newSubject.id}"]`);
        editSubject(newSubject.id);
        
        // Set placeholders for the input fields
        const nameInput = subjectCard.querySelector('.edit-mode input');
        const descInput = subjectCard.querySelector('.edit-mode textarea');
        
        if (nameInput) {
            nameInput.placeholder = 'Enter subject name';
            nameInput.focus(); // Auto focus on the name input
        }
        
        if (descInput) {
            descInput.placeholder = 'Enter subject description';
        }
    }, 100);
};
