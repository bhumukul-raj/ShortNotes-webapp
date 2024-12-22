// HTML template generation service
export const templates = {
    subjectCard: (subject) => `
        <div class="card mb-4 subject-card fade-in" data-subject-id="${subject.id}">
            <div class="card-header bg-primary bg-opacity-10">
                <h3 class="card-title mb-0 d-flex justify-content-between align-items-center">
                    <!-- Subject title view mode -->
                    <div class="view-mode">
                        <i class="fas fa-book me-2"></i>
                        <span class="subject-name">${subject.name || 'New Subject'}</span>
                    </div>
                    <!-- Subject title edit mode -->
                    <div class="edit-mode" style="display: none;">
                        <input type="text" 
                               class="form-control d-inline-block w-auto me-2" 
                               value="${subject.name}"
                               placeholder="Enter subject name">
                    </div>
                    <!-- Action buttons -->
                    <div class="subject-actions">
                        <div class="view-mode">
                            <button class="btn btn-action btn-light me-2" onclick="editSubject(${subject.id})" title="Edit Subject">
                                <i class="fas fa-edit text-primary"></i>
                            </button>
                            <button class="btn btn-action btn-light" onclick="deleteSubject(${subject.id})" title="Delete Subject">
                                <i class="fas fa-trash text-danger"></i>
                            </button>
                        </div>
                        <div class="edit-mode" style="display: none;">
                            <button class="btn btn-success btn-sm me-2" onclick="applySubjectEdit('${subject.id}')">
                                <i class="fas fa-check"></i> Apply
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="cancelSubjectEdit('${subject.id}')">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </div>
                </h3>
            </div>
            <div class="card-body">
                <p class="text-muted subject-description">
                    <span class="view-mode">${subject.description || 'No description'}</span>
                    <textarea class="form-control edit-mode" 
                              style="display: none;"
                              placeholder="Enter subject description">${subject.description}</textarea>
                </p>
                <div class="sections-container">
                    ${subject.sections.map(section => templates.sectionContent(section)).join('')}
                </div>
            </div>
        </div>
    `,

    sectionContent: (section) => `
        <div class="section-container" data-section-id="${section.id}">
            <h4 class="section-title mb-3 d-flex align-items-center justify-content-between">
                <!-- Section view/edit modes here -->
            </h4>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 30%">Topic</th>
                            <th style="width: 50%">Content</th>
                            <th style="width: 20%">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${section.topics.map(topic => templates.topicRow(topic)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    topicRow: (topic) => `
        <tr class="topic-row" data-topic-id="${topic.id}">
            <td>
                <!-- Topic Name -->
                <div class="view-mode">
                    <span class="topic-name">${topic.name}</span>
                </div>
                <div class="edit-mode" style="display: none;">
                    <input type="text" class="form-control" value="${topic.name}" placeholder="Topic name">
                </div>
            </td>
            <td>
                <!-- Topic Content -->
                <div class="view-mode topic-content">
                    ${topic.details.text ? `<p class="mb-2">${topic.details.text}</p>` : ''}
                    ${topic.details.code ? `<pre class="bg-light p-2 rounded"><code>${topic.details.code}</code></pre>` : ''}
                </div>
                <div class="edit-mode" style="display: none;">
                    <textarea class="form-control mb-2" placeholder="Topic content">${topic.details.text || ''}</textarea>
                    <textarea class="form-control" placeholder="Code (optional)">${topic.details.code || ''}</textarea>
                </div>
            </td>
            <td>
                <!-- Action Buttons -->
                <div class="view-mode">
                    <button class="btn btn-action btn-light me-2" onclick="editTopic(${topic.id})" title="Edit">
                        <i class="fas fa-edit text-primary"></i>
                    </button>
                    <button class="btn btn-action btn-light" onclick="deleteTopic(${topic.id})" title="Delete">
                        <i class="fas fa-trash text-danger"></i>
                    </button>
                </div>
                <div class="edit-mode" style="display: none;">
                    <button class="btn btn-success btn-sm me-2" onclick="applyTopicEdit(${topic.id})">
                        <i class="fas fa-check"></i> Apply
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="cancelTopicEdit(${topic.id})">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </td>
        </tr>
    `,

    topicContent: (details) => `
        <div class="topic-details">
            ${details.text ? `<p class="mb-2">${details.text}</p>` : ''}
            ${details.code ? `<pre class="bg-light p-2 rounded"><code>${details.code}</code></pre>` : ''}
            ${details.table ? templates.table(details.table) : ''}
            ${details.image ? `<img src="${details.image}" alt="Topic illustration" class="img-fluid mt-2">` : ''}
        </div>
    `,

    table: (table) => `
        <table class="table table-sm">
            <thead>
                <tr>
                    ${table.headers.map((header, index) => {
        const width = table.columnWidths && table.columnWidths[index] ? table.columnWidths[index] : 'auto';
        return `<th style="width: ${width};">${header}</th>`;
    }).join('')}
                </tr>
            </thead>
            <tbody>
                ${table.rows.map(row => `
                    <tr>
                        ${row.map(cell => `<td>${cell}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `
};