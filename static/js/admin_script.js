// admin_script.js

document.addEventListener('DOMContentLoaded', function () {
    loadSubjects();
    loadTopics();
    updateLastUpdated();
    setInterval(updateLastUpdated, 60000); // Update time every minute

    document.querySelectorAll('.search-input').forEach(input => {
        input.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const tableRows = this.closest('.tab-pane').querySelectorAll('tbody tr');

            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    });

    document.getElementById('addSubjectForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSubjectModal'));
        modal.hide();
        showToast('Subject added successfully!', 'success');
    });

    document.getElementById('addTopicForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTopicModal'));
        modal.hide();
        showToast('Topic added successfully!', 'success');
    });

    document.getElementById('logoutBtn')?.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '/login';
        }
    });
});

// Fetch and load subjects dynamically
function loadSubjects() {
    fetch('/api/subjects')
        .then(response => response.json())
        .then(subjects => {
            const tbody = document.getElementById('subjectsTable');
            if (!tbody) return;

            tbody.innerHTML = subjects.map(subject => {
                const sectionsCount = subject.sections.length;
                const topicsCount = subject.sections.reduce((sum, section) => sum + (section.topics?.length || 0), 0);

                return `
                    <tr>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="bg-primary bg-opacity-10 p-2 rounded-circle me-2">
                                    <i class="fas fa-book text-primary"></i>
                                </div>
                                <div>
                                    <div class="fw-medium">${subject.name}</div>
                                    <div class="text-muted small">Active</div>
                                </div>
                            </div>
                        </td>
                        <td>${sectionsCount}</td>
                        <td>${topicsCount}</td>
                        <td>
                            <div class="text-muted small">${subject.lastUpdated || 'N/A'}</div>
                        </td>
                        <td>
                            <button class="btn btn-action btn-light me-2" title="Edit">
                                <i class="fas fa-edit text-primary"></i>
                            </button>
                            <button class="btn btn-action btn-light" title="Delete">
                                <i class="fas fa-trash text-danger"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        })
        .catch(error => console.error('Error fetching subjects:', error));
}


// Fetch and load topics dynamically, categorized by subject
function loadTopics() {
    fetch('/api/subjects')
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Log the data to check the structure

            // Generate HTML for each subject
            const subjectsContainer = document.getElementById('subjectsContainer');
            if (!subjectsContainer) return;

            // Generate dynamic HTML for each subject and its sections
            subjectsContainer.innerHTML = data.subjects.map(subject => {
                return `
                    <div class="subject-category">
                        <h3 class="subject-name">${subject.name}</h3>
                        <p class="subject-description">${subject.description}</p>
                        <div class="sections">
                            ${subject.sections.map(section => {
                                return `
                                    <div class="section-category">
                                        <h4 class="section-name">${section.name}</h4>
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Topic Name</th>
                                                    <th>Last Updated</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${section.topics.map(topic => {
                                                    return `
                                                        <tr>
                                                            <td>${topic.name}</td>
                                                            <td>${topic.details.lastUpdated || 'N/A'}</td>
                                                            <td>
                                                                <button class="btn btn-action btn-light me-2" title="Edit">
                                                                    <i class="fas fa-edit text-primary"></i>
                                                                </button>
                                                                <button class="btn btn-action btn-light" title="Delete">
                                                                    <i class="fas fa-trash text-danger"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    `;
                                                }).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        })
        .catch(error => console.error('Error fetching subjects:', error));
}





function updateLastUpdated() {
    const now = new Date();
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
        lastUpdated.textContent = now.toLocaleString();
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}
