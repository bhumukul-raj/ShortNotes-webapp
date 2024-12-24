// admin_script.js
import { templates } from './subjectsTemplates.js';
import { topicFormTemplate } from './formTemplate.js';

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
    setActiveNavLink();
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

                await refreshSubjectsList();
            } catch (error) {
                console.error('Error deleting subject:', error);
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
            await refreshSubjectsList();
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
    const modalHtml = `
        <div class="modal fade" id="addSubjectModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-plus-circle me-2"></i>
                            Add New Subject
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addSubjectForm">
                            <div class="mb-3">
                                <label class="form-label">Subject Name</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="newSubjectName"
                                       placeholder="Enter subject name"
                                       required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" 
                                          id="newSubjectDescription" 
                                          rows="3"
                                          placeholder="Enter subject description"></textarea>
                            </div>
                            <div class="error-message text-danger"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitNewSubject()">
                            <i class="fas fa-plus me-2"></i>Add Subject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('addSubjectModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to document and show it
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('addSubjectModal'));
    modal.show();
};

window.submitNewSubject = async () => {
    const nameInput = document.getElementById('newSubjectName');
    const descriptionInput = document.getElementById('newSubjectDescription');
    const errorDiv = document.querySelector('#addSubjectModal .error-message');

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!name) {
        errorDiv.textContent = 'Subject name is required';
        return;
    }

    try {
        const response = await fetch('/api/subjects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to create subject');
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSubjectModal'));
        modal.hide();

        // Refresh the subjects list
        await refreshSubjectsList();

        // Clear the form
        nameInput.value = '';
        descriptionInput.value = '';
        errorDiv.textContent = '';

    } catch (error) {
        console.error('Failed to create subject:', error);
        errorDiv.textContent = error.message;
    }
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

window.addTopicAndContent = (sectionId) => {
    // Remove existing modal if any
    const existingModal = document.getElementById('addTopicModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add the modal to the document
    document.body.insertAdjacentHTML('beforeend', topicFormTemplate.modal());
    
    // Initialize the modal
    const modal = new bootstrap.Modal(document.getElementById('addTopicModal'));
    modal.show();

    // Initialize form handlers
    let codeMirrorInstance = null;

    // Handle content type selection
    document.querySelector('#addContentModal .content-type-select').addEventListener('change', function(e) {
        const inputContainer = document.querySelector('#addContentModal .dynamic-input');
        inputContainer.innerHTML = '';

        switch (e.target.value) {
            case 'text':
                inputContainer.innerHTML = `<textarea class="form-control" placeholder="Enter text"></textarea>`;
                break;
            case 'code':
                // Create container for Ace Editor
                inputContainer.innerHTML = `
                    <div id="aceEditorContainer" style="height: 300px; width: 100%; border-radius: 4px; border: 1px solid #ced4da;"></div>
                `;
                // Initialize Ace Editor
                aceEditor = ace.edit("aceEditorContainer");
                aceEditor.setTheme("ace/theme/monokai");
                aceEditor.session.setMode("ace/mode/javascript");
                aceEditor.setFontSize(14);
                aceEditor.setShowPrintMargin(false);
                aceEditor.session.setTabSize(4);
                break;
            case 'image':
                inputContainer.innerHTML = `
                    <div class="image-input-container">
                        <input type="file" class="form-control mb-2" id="imageFileInput" accept="image/*">
                        <input type="text" class="form-control mb-2" id="imageUrlInput" placeholder="Enter image URL">
                        <div class="image-preview-container" style="display: none;">
                            <img id="imagePreview" src="" alt="Preview" style="max-width: 100%; max-height: 300px;">
                            <div class="cropper-controls mt-2">
                                <button type="button" class="btn btn-sm btn-primary" id="cropBtn">Crop</button>
                                <button type="button" class="btn btn-sm btn-secondary" id="resetBtn">Reset</button>
                                <button type="button" class="btn btn-sm btn-success" id="saveBtn" style="display: none;">Save Crop</button>
                                <button type="button" class="btn btn-sm btn-danger" id="cancelBtn" style="display: none;">Cancel</button>
                            </div>
                        </div>
                    </div>
                `;
                setupImageHandlers();
                break;
            case 'table':
                inputContainer.innerHTML = `
                    <div class="table-responsive">
                        <table class="table" id="dynamicTable">
                            <thead>
                                <tr>
                                    <th><input type="text" class="form-control" placeholder="Column 1"></th>
                                    <th><input type="text" class="form-control" placeholder="Column 2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><input type="text" class="form-control" placeholder="Column 1"></td>
                                    <td><input type="text" class="form-control" placeholder="Column 2"></td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="table-controls mt-2">
                            <button type="button" class="btn btn-sm btn-primary me-2" id="addTableRow">
                                <i class="fas fa-plus"></i> Add Row
                            </button>
                            <button type="button" class="btn btn-sm btn-primary" id="addTableCol">
                                <i class="fas fa-plus"></i> Add Column
                            </button>
                        </div>
                    </div>
                `;
                setupTableHandlers();
                break;
        }
    });

    // Handle showing content modal
    document.getElementById('showContentModal').addEventListener('click', () => {
        const contentModal = new bootstrap.Modal(document.getElementById('addContentModal'));
        contentModal.show();
    });

    // Handle form submission
    document.getElementById('topicForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = collectFormData(sectionId);
        try {
            const response = await fetch(`/api/sections/${sectionId}/topics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create topic');
            }

            modal.hide();
            await refreshSubjectsList();
        } catch (error) {
            console.error('Error creating topic:', error);
        }
    });
};

// Add this helper function
function resetContentModal() {
    const select = document.querySelector('#addContentModal .content-type-select');
    const dynamicInput = document.querySelector('#addContentModal .dynamic-input');
    select.value = '';
    dynamicInput.innerHTML = '';
    if (aceEditor) {
        aceEditor.destroy();
        aceEditor = null;
    }
}

// Add these helper functions for creating content blocks
function createTextBlock() {
    const text = document.querySelector('#addContentModal textarea').value;
    return `
        <button class="remove-block"><i class="fa fa-times"></i></button>
        <div class="mb-3">
            <label class="form-label">Text Content</label>
            <textarea class="form-control" readonly>${text}</textarea>
        </div>
    `;
}

function createCodeBlock() {
    const code = aceEditor ? aceEditor.getValue() : '';
    return `
        <button class="remove-block"><i class="fa fa-times"></i></button>
        <div class="mb-3">
            <label class="form-label">Code</label>
            <pre class="form-control" style="font-family: monospace; white-space: pre-wrap;">${code}</pre>
        </div>
    `;
}

function createImageBlock() {
    const preview = document.getElementById('imagePreview');
    return `
        <button class="remove-block"><i class="fa fa-times"></i></button>
        <div class="mb-3">
            <label class="form-label">Image</label>
            <img src="${preview.src}" alt="Content image" class="img-fluid">
        </div>
    `;
}

function createTableBlock() {
    const table = document.getElementById('dynamicTable').cloneNode(true);
    return `
        <button class="remove-block"><i class="fa fa-times"></i></button>
        <div class="mb-3">
            <label class="form-label">Table</label>
            ${table.outerHTML}
        </div>
    `;
}

// Add cleanup for Ace Editor when modal is closed
document.getElementById('addContentModal').addEventListener('hidden.bs.modal', function () {
    if (aceEditor) {
        aceEditor.destroy();
        aceEditor = null;
    }
});

let cropper = null;

function validateURL(url) {
    // Basic URL validation
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(url);
}

function setupImageHandlers() {
    const fileInput = document.getElementById('imageFileInput');
    const urlInput = document.getElementById('imageUrlInput');
    const previewContainer = document.querySelector('.image-preview-container');
    const preview = document.getElementById('imagePreview');
    const cropBtn = document.getElementById('cropBtn');
    const resetBtn = document.getElementById('resetBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    let originalImageUrl = '';
    let cropper = null;

    function initializeCropper() {
        if (cropper) {
            cropper.destroy();
        }
        cropper = new Cropper(preview, {
            aspectRatio: 16 / 9,
            viewMode: 2,
            autoCropArea: 1,
            ready() {
                cropBtn.style.display = 'none';
                resetBtn.style.display = 'none';
                saveBtn.style.display = 'inline-block';
                cancelBtn.style.display = 'inline-block';
            }
        });
    }

    function destroyCropper() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    }

    // File input handler
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                originalImageUrl = e.target.result;
                preview.src = e.target.result;
                previewContainer.style.display = 'block';
                urlInput.value = '';
                destroyCropper();
                cropBtn.style.display = 'inline-block';
                resetBtn.style.display = 'inline-block';
                saveBtn.style.display = 'none';
                cancelBtn.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // URL input handler
    urlInput.addEventListener('input', debounce(function(event) {
        const url = event.target.value.trim();
        if (url && validateURL(url)) {
            originalImageUrl = url;
            preview.src = url;
            preview.onload = function() {
                previewContainer.style.display = 'block';
                fileInput.value = '';
                destroyCropper();
                cropBtn.style.display = 'inline-block';
                resetBtn.style.display = 'inline-block';
                saveBtn.style.display = 'none';
                cancelBtn.style.display = 'none';
            };
            preview.onerror = function() {
                previewContainer.style.display = 'none';
                alert('Failed to load image from URL');
            };
        } else {
            previewContainer.style.display = 'none';
        }
    }, 500));

    // Crop button handler
    cropBtn.addEventListener('click', function() {
        initializeCropper();
    });

    // Reset button handler
    resetBtn.addEventListener('click', function() {
        destroyCropper();
        preview.src = originalImageUrl;
        cropBtn.style.display = 'inline-block';
        resetBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    });

    // Save crop button handler
    saveBtn.addEventListener('click', function() {
        if (cropper) {
            const croppedCanvas = cropper.getCroppedCanvas();
            preview.src = croppedCanvas.toDataURL();
            destroyCropper();
            cropBtn.style.display = 'inline-block';
            resetBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
        }
    });

    // Cancel crop button handler
    cancelBtn.addEventListener('click', function() {
        destroyCropper();
        preview.src = originalImageUrl;
        cropBtn.style.display = 'inline-block';
        resetBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    });

    // Cleanup on modal close
    document.getElementById('addContentModal').addEventListener('hidden.bs.modal', function() {
        destroyCropper();
        previewContainer.style.display = 'none';
        preview.src = '';
        fileInput.value = '';
        urlInput.value = '';
    });
}

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Table handling functions
function setupTableHandlers() {
    const table = document.getElementById('dynamicTable');
    const headerInputs = table.querySelectorAll('thead input');
    const addRowBtn = document.getElementById('addTableRow');
    const addColBtn = document.getElementById('addTableCol');

    // Sync header changes
    headerInputs.forEach(input => {
        input.addEventListener('input', function() {
            const columnIndex = Array.from(headerInputs).indexOf(this);
            const cells = table.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`);
            cells.forEach(cell => {
                const cellInput = cell.querySelector('input');
                if (cellInput) {
                    cellInput.placeholder = this.value;
                }
            });
        });
    });

    // Add row button handler
    if (addRowBtn) {
        addRowBtn.addEventListener('click', () => {
            const tbody = table.querySelector('tbody');
            const columnCount = table.querySelectorAll('thead th').length;
            const newRow = document.createElement('tr');
            
            for (let i = 0; i < columnCount; i++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control';
                input.placeholder = headerInputs[i].value || `Column ${i + 1}`;
                td.appendChild(input);
                newRow.appendChild(td);
            }
            
            tbody.appendChild(newRow);
        });
    }

    // Add column button handler
    if (addColBtn) {
        addColBtn.addEventListener('click', () => {
            const columnIndex = table.querySelectorAll('thead th').length + 1;
            
            // Add header
            const headerRow = table.querySelector('thead tr');
            const th = document.createElement('th');
            const headerInput = document.createElement('input');
            headerInput.type = 'text';
            headerInput.className = 'form-control';
            headerInput.placeholder = `Column ${columnIndex}`;
            
            // Add header input event listener
            headerInput.addEventListener('input', function() {
                const cells = table.querySelectorAll(`tbody tr td:nth-child(${columnIndex})`);
                cells.forEach(cell => {
                    const cellInput = cell.querySelector('input');
                    if (cellInput) {
                        cellInput.placeholder = this.value;
                    }
                });
            });
            
            th.appendChild(headerInput);
            headerRow.appendChild(th);
            
            // Add cells to each row
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control';
                input.placeholder = `Column ${columnIndex}`;
                td.appendChild(input);
                row.appendChild(td);
            });
        });
    }
}
