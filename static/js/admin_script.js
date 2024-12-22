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

// Helper function to create and show confirmation modal
const showConfirmationModal = (message, onConfirm) => {
    const modalHtml = `
        <div class="modal fade" id="confirmationModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Delete</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('confirmationModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Get modal instance
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));

    // Add event listener to confirm button
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        modal.hide();
        onConfirm();
    });

    // Clean up modal after it's hidden
    document.getElementById('confirmationModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });

    // Show modal
    modal.show();
};

// Update delete functions to use the custom confirmation modal
window.deleteTopic = async (topicId) => {
    showConfirmationModal('Are you sure you want to delete this topic?', async () => {
        try {
            const response = await fetch(`/api/topics/${topicId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete topic');
            }

            location.reload();
        } catch (error) {
            console.error('Failed to delete topic:', error);
            alert(error.message);
        }
    });
};

// Helper function to show warning modal
const showWarningModal = (message) => {
    const modalHtml = `
        <div class="modal fade" id="warningModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-warning bg-opacity-10">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                            Warning
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('warningModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Get modal instance
    const modal = new bootstrap.Modal(document.getElementById('warningModal'));

    // Clean up modal after it's hidden
    document.getElementById('warningModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });

    // Show modal
    modal.show();
};

// Update delete functions to use warning modal
window.deleteSection = async (sectionId) => {
    try {
        // First, check if section is empty
        const response = await fetch(`/api/sections/${sectionId}/check`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to check section');
        }

        if (data.hasTopics) {
            showWarningModal('Cannot delete section: Please delete all topics first');
            return;
        }

        // If section is empty, show confirmation modal
        showConfirmationModal('Are you sure you want to delete this section?', async () => {
            try {
                const deleteResponse = await fetch(`/api/sections/${sectionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!deleteResponse.ok) {
                    const deleteData = await deleteResponse.json();
                    throw new Error(deleteData.error || 'Failed to delete section');
                }

                location.reload();
            } catch (error) {
                console.error('Failed to delete section:', error);
                showWarningModal(error.message);
            }
        });
    } catch (error) {
        console.error('Failed to delete section:', error);
        showWarningModal(error.message);
    }
};

window.deleteSubject = async (subjectId) => {
    try {
        // First, check if subject is empty
        const response = await fetch(`/api/subjects/${subjectId}/check`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to check subject');
        }

        if (data.hasSections) {
            showWarningModal('Cannot delete subject: Please delete all sections first');
            return;
        }

        // If subject is empty, show confirmation modal
        showConfirmationModal('Are you sure you want to delete this subject?', async () => {
            try {
                const deleteResponse = await fetch(`/api/subjects/${subjectId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!deleteResponse.ok) {
                    const deleteData = await deleteResponse.json();
                    throw new Error(deleteData.error || 'Failed to delete subject');
                }

                location.reload();
            } catch (error) {
                console.error('Failed to delete subject:', error);
                showWarningModal(error.message);
            }
        });
    } catch (error) {
        console.error('Failed to delete subject:', error);
        showWarningModal(error.message);
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
    console.log('editSubject called with ID:', subjectId);
    const subjectCard = document.querySelector(`.subject-card[data-subject-id="${subjectId}"]`);
    if (!subjectCard) return;

    // Hide view mode and show edit mode
    subjectCard.querySelectorAll('.view-mode').forEach(el => el.style.display = 'none');
    subjectCard.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'block');
};

window.applySubjectEdit = async (subjectId) => {
    console.log('applySubjectEdit called with ID:', subjectId);
    const subjectCard = document.querySelector(`.subject-card[data-subject-id="${subjectId}"]`);
    if (!subjectCard) {
        console.error('Subject card not found for ID:', subjectId);
        return;
    }

    const nameInput = subjectCard.querySelector('.edit-mode input');
    const descInput = subjectCard.querySelector('.edit-mode textarea');
    const errorDiv = subjectCard.querySelector('.error-message');
    
    console.log('Input elements:', { nameInput, descInput });

    if (!nameInput || !descInput) {
        console.error('Input elements not found');
        return;
    }

    const newName = nameInput.value.trim();
    const newDescription = descInput.value.trim();

    if (!newName) {
        errorDiv.textContent = 'Subject name is required';
        return;
    }

    try {
        // For new subjects (temporary ID)
        if (typeof subjectId === 'string' && subjectId.includes('temp_')) {
            const response = await fetch('/api/subjects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newName,
                    description: newDescription
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                errorDiv.textContent = data.error;
                return;
            }

            // Refresh the subjects list
            location.reload();
            return;
        }

        // For existing subjects
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

        if (!response.ok) {
            const data = await response.json();
            errorDiv.textContent = data.error;
            return;
        }

        // Update the view
        subjectCard.querySelector('.subject-name').textContent = newName;
        subjectCard.querySelector('.subject-description .view-mode').textContent = newDescription;

        // Switch back to view mode
        cancelSubjectEdit(subjectId);
    } catch (error) {
        console.error('Failed to update subject:', error);
        errorDiv.textContent = 'Failed to update subject. Please try again.';
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
    console.log('editSection called with ID:', sectionId);
    const sectionContainer = document.querySelector(`.section-container[data-section-id="${sectionId}"]`);
    if (!sectionContainer) {
        console.error('Section container not found');
        return;
    }

    // Only toggle the section name and buttons
    const sectionTitle = sectionContainer.querySelector('.section-title');
    sectionTitle.querySelector('.view-mode').style.display = 'none';
    sectionTitle.querySelector('.edit-mode').style.display = 'block';

    // Toggle action buttons
    const actionButtons = sectionContainer.querySelector('.section-actions');
    actionButtons.querySelector('.view-mode').style.display = 'none';
    actionButtons.querySelector('.edit-mode').style.display = 'block';
};

window.applySectionEdit = async (sectionId) => {
    console.log('applySectionEdit called with ID:', sectionId);
    const sectionContainer = document.querySelector(`.section-container[data-section-id="${sectionId}"]`);
    if (!sectionContainer) {
        console.error('Section container not found');
        return;
    }

    const nameInput = sectionContainer.querySelector('.edit-mode input');
    if (!nameInput) {
        console.error('Section name input not found');
        return;
    }

    const newName = nameInput.value.trim();
    if (!newName) {
        alert('Section name cannot be empty');
        return;
    }

    try {
        const response = await fetch(`/api/sections/${sectionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newName
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update section');
        }

        // Update the view
        sectionContainer.querySelector('.section-name').textContent = newName;
        
        // Switch back to view mode
        cancelSectionEdit(sectionId);
    } catch (error) {
        console.error('Failed to update section:', error);
        alert(error.message);
    }
};

window.cancelSectionEdit = (sectionId) => {
    console.log('cancelSectionEdit called with ID:', sectionId);
    const sectionContainer = document.querySelector(`.section-container[data-section-id="${sectionId}"]`);
    if (!sectionContainer) {
        console.error('Section container not found');
        return;
    }

    // Only toggle the section name and buttons back to view mode
    const sectionTitle = sectionContainer.querySelector('.section-title');
    sectionTitle.querySelector('.view-mode').style.display = 'block';
    sectionTitle.querySelector('.edit-mode').style.display = 'none';

    // Toggle action buttons
    const actionButtons = sectionContainer.querySelector('.section-actions');
    actionButtons.querySelector('.view-mode').style.display = 'block';
    actionButtons.querySelector('.edit-mode').style.display = 'none';
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

    // Automatically trigger edit mode
    setTimeout(() => {
        editSubject(newSubject.id);
    }, 100);
};

// Add the section handler
window.addSection = async (subjectId) => {
    console.log('Adding section to subject:', subjectId);

    // Create modal HTML
    const modalHtml = `
        <div class="modal fade" id="addSectionModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Section</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addSectionForm">
                            <div class="mb-3">
                                <label class="form-label">Section Name</label>
                                <input type="text" class="form-control" id="sectionName" required>
                            </div>
                            <div class="error-message text-danger"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitNewSection(${subjectId})">Add Section</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Initialize and show modal
    const modal = new bootstrap.Modal(document.getElementById('addSectionModal'));
    modal.show();

    // Clean up modal after it's hidden
    document.getElementById('addSectionModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
};

window.submitNewSection = async (subjectId) => {
    const sectionName = document.getElementById('sectionName').value.trim();
    const errorDiv = document.querySelector('#addSectionModal .error-message');

    if (!sectionName) {
        errorDiv.textContent = 'Section name is required';
        return;
    }

    try {
        const response = await fetch(`/api/subjects/${subjectId}/sections`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: sectionName
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.textContent = data.error || 'Failed to add section';
            return;
        }

        // Close modal and refresh page
        bootstrap.Modal.getInstance(document.getElementById('addSectionModal')).hide();
        location.reload();
    } catch (error) {
        console.error('Failed to add section:', error);
        errorDiv.textContent = 'Failed to add section. Please try again.';
    }
};

window.addTopicToSection = async (sectionId) => {
    // Create modal HTML
    const modalHtml = `
        <div class="modal fade" id="addTopicModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Topic</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addTopicForm">
                            <div class="mb-3">
                                <label class="form-label">Topic Name</label>
                                <input type="text" class="form-control" id="topicName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Content Text</label>
                                <textarea class="form-control" id="topicText" rows="3"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Code Example</label>
                                <textarea class="form-control font-monospace" id="topicCode" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitNewTopic(${sectionId})">Add Topic</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Initialize and show modal
    const modal = new bootstrap.Modal(document.getElementById('addTopicModal'));
    modal.show();

    // Clean up modal after it's hidden
    document.getElementById('addTopicModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
};

window.submitNewTopic = async (sectionId) => {
    const topicName = document.getElementById('topicName').value.trim();
    const topicText = document.getElementById('topicText').value.trim();
    const topicCode = document.getElementById('topicCode').value.trim();

    if (!topicName) {
        alert('Topic name is required');
        return;
    }

    try {
        const response = await fetch(`/api/sections/${sectionId}/topics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: topicName,
                text: topicText,
                code: topicCode
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to add topic');
        }

        // Close modal and refresh page
        bootstrap.Modal.getInstance(document.getElementById('addTopicModal')).hide();
        location.reload();
    } catch (error) {
        console.error('Failed to add topic:', error);
        alert(error.message);
    }
};

// Add these edit handlers
window.editTopic = async (topicId) => {
    const topicRow = document.querySelector(`.topic-row[data-topic-id="${topicId}"]`);
    if (!topicRow) return;

    const modalHtml = `
        <div class="modal fade" id="editTopicModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Topic</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editTopicForm">
                            <div class="mb-3">
                                <label class="form-label">Topic Name</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="editTopicName" 
                                       value="${topicRow.querySelector('.topic-name').textContent.trim()}"
                                       required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Content Text</label>
                                <textarea class="form-control" 
                                          id="editTopicText" 
                                          rows="3">${topicRow.querySelector('.topic-content p')?.textContent || ''}</textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Code Example</label>
                                <textarea class="form-control font-monospace" 
                                          id="editTopicCode" 
                                          rows="3">${topicRow.querySelector('.topic-content code')?.textContent || ''}</textarea>
                            </div>
                            <div class="error-message text-danger"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="updateTopic(${topicId})">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('editTopicModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editTopicModal'));
    modal.show();
};

window.updateTopic = async (topicId) => {
    const nameInput = document.getElementById('editTopicName');
    const textInput = document.getElementById('editTopicText');
    const codeInput = document.getElementById('editTopicCode');
    const errorDiv = document.querySelector('#editTopicModal .error-message');

    const name = nameInput.value.trim();
    const text = textInput.value.trim();
    const code = codeInput.value.trim();

    if (!name) {
        errorDiv.textContent = 'Topic name is required';
        return;
    }

    try {
        const response = await fetch(`/api/topics/${topicId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                text,
                code
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update topic');
        }

        // Close modal and refresh page
        bootstrap.Modal.getInstance(document.getElementById('editTopicModal')).hide();
        location.reload();
    } catch (error) {
        console.error('Failed to update topic:', error);
        errorDiv.textContent = error.message;
    }
};

// Add section edit handlers
window.editSection = (sectionId) => {
    const sectionContainer = document.querySelector(`.section-container[data-section-id="${sectionId}"]`);
    if (!sectionContainer) return;

    const modalHtml = `
        <div class="modal fade" id="editSectionModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Section</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editSectionForm">
                            <div class="mb-3">
                                <label class="form-label">Section Name</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="editSectionName" 
                                       value="${sectionContainer.querySelector('.section-name').textContent.trim()}"
                                       required>
                            </div>
                            <div class="error-message text-danger"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="updateSection(${sectionId})">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('editSectionModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to document and show it
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('editSectionModal'));
    modal.show();
};

window.updateSection = async (sectionId) => {
    const nameInput = document.getElementById('editSectionName');
    const errorDiv = document.querySelector('#editSectionModal .error-message');

    const name = nameInput.value.trim();
    if (!name) {
        errorDiv.textContent = 'Section name is required';
        return;
    }

    try {
        const response = await fetch(`/api/sections/${sectionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update section');
        }

        bootstrap.Modal.getInstance(document.getElementById('editSectionModal')).hide();
        location.reload();
    } catch (error) {
        console.error('Failed to update section:', error);
        errorDiv.textContent = error.message;
    }
};

// Add subject edit handlers
window.editSubject = (subjectId) => {
    const subjectCard = document.querySelector(`.subject-card[data-subject-id="${subjectId}"]`);
    if (!subjectCard) return;

    const modalHtml = `
        <div class="modal fade" id="editSubjectModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Subject</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editSubjectForm">
                            <div class="mb-3">
                                <label class="form-label">Subject Name</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="editSubjectName" 
                                       value="${subjectCard.querySelector('.subject-name').textContent.trim()}"
                                       required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" 
                                          id="editSubjectDescription" 
                                          rows="3">${subjectCard.querySelector('.subject-description').textContent.trim()}</textarea>
                            </div>
                            <div class="error-message text-danger"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="updateSubject(${subjectId})">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('editSubjectModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to document and show it
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('editSubjectModal'));
    modal.show();
};

window.updateSubject = async (subjectId) => {
    const nameInput = document.getElementById('editSubjectName');
    const descriptionInput = document.getElementById('editSubjectDescription');
    const errorDiv = document.querySelector('#editSubjectModal .error-message');

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!name) {
        errorDiv.textContent = 'Subject name is required';
        return;
    }

    try {
        const response = await fetch(`/api/subjects/${subjectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name,
                description 
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update subject');
        }

        bootstrap.Modal.getInstance(document.getElementById('editSubjectModal')).hide();
        location.reload();
    } catch (error) {
        console.error('Failed to update subject:', error);
        errorDiv.textContent = error.message;
    }
};
