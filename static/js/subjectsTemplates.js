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
                    <div class="edit-mode w-100" style="display: none;">
                        <div class="mb-3">
                            <input type="text" 
                                   class="form-control"
                                   value="${subject.name || ''}"
                                   placeholder="Enter subject name">
                        </div>
                        <div class="mb-3">
                            <textarea class="form-control" 
                                      placeholder="Enter subject description"
                                      rows="3">${subject.description || ''}</textarea>
                        </div>
                        <div class="error-message"></div>
                        <div class="mt-3">
                            <button class="btn btn-success btn-sm me-2" onclick="applySubjectEdit('${subject.id}')" type="button">
                                <i class="fas fa-check"></i> Apply
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="cancelSubjectEdit('${subject.id}')" type="button">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </div>
                    <!-- Action buttons -->
                    <div class="subject-actions">
                        <div class="view-mode">
                            <button class="btn btn-action btn-light me-2" onclick="addSection('${subject.id}')" title="Add Section">
                                <i class="fas fa-plus text-success"></i>
                            </button>
                            <button class="btn btn-action btn-light me-2" onclick="editSubject('${subject.id}')" title="Edit Subject">
                                <i class="fas fa-edit text-primary"></i>
                            </button>
                            <button class="btn btn-action btn-light" onclick="deleteSubject(${subject.id})" title="Delete Subject">
                                <i class="fas fa-trash text-danger"></i>
                            </button>
                        </div>
                    </div>
                </h3>
            </div>
            <div class="card-body">
                <p class="text-muted subject-description">
                    <span class="view-mode">${subject.description || 'No description'}</span>
                </p>
                ${!subject.id.toString().includes('temp_') ? `
                    <div class="sections-container">
                        ${subject.sections && subject.sections.length > 0 ? 
                            subject.sections.map(section => templates.sectionContent(section)).join('') : 
                            '<p class="text-muted">No sections available</p>'}
                    </div>
                ` : ''}
            </div>
        </div>
    `,

    sectionContent: (section) => `
        <div class="section-container mb-4" data-section-id="${section.id}">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <!-- Section title with view/edit modes -->
                <div class="d-flex align-items-center">
                    <h4 class="section-title mb-0">
                        <div class="view-mode">
                            <i class="fas fa-folder me-2"></i>
                            <span class="section-name">${section.name}</span>
                        </div>
                        <div class="edit-mode" style="display: none;">
                            <input type="text" class="form-control" value="${section.name}" placeholder="Section name">
                        </div>
                    </h4>
                </div>
                
                <!-- Section action buttons -->
                <div class="section-actions">
                    <div class="view-mode">
                        <button class="btn btn-action btn-light me-2" onclick="addTopicToSection(${section.id})" title="Add Topic">
                            <i class="fas fa-plus text-success"></i>
                        </button>
                        <button class="btn btn-action btn-light me-2" onclick="editSection(${section.id})" title="Edit Section">
                            <i class="fas fa-edit text-primary"></i>
                        </button>
                        <button class="btn btn-action btn-light" onclick="deleteSection(${section.id})" title="Delete Section">
                            <i class="fas fa-trash text-danger"></i>
                        </button>
                    </div>
                    <div class="edit-mode" style="display: none;">
                        <button class="btn btn-success btn-sm me-2" onclick="applySectionEdit(${section.id})">
                            <i class="fas fa-check"></i> Apply
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="cancelSectionEdit(${section.id})">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>

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
                        ${section.topics && section.topics.length > 0 ? 
                            section.topics.map(topic => templates.topicRow(topic)).join('') :
                            '<tr><td colspan="3" class="text-center">No topics available</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    topicRow: (topic) => `
        <tr class="topic-row" data-topic-id="${topic.id}">
            <td>
                <div class="view-mode">
                    <span class="topic-name">${topic.name}</span>
                </div>
                <div class="edit-mode" style="display: none;">
                    <input type="text" class="form-control" value="${topic.name}" placeholder="Topic name">
                </div>
            </td>
            <td>
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