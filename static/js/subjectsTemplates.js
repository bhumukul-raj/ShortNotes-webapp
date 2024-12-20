// HTML template generation service
export const templates = {
    subjectCard: (subject) => `
        <div class="card mb-4 subject-card fade-in">
            <div class="card-header bg-primary bg-opacity-10">
                <h3 class="card-title mb-0">
                    <i class="fas fa-book me-2"></i>${subject.name}
                </h3>
            </div>
            <div class="card-body">
                <p class="text-muted">${subject.description}</p>
                <div class="sections-container">
                    ${subject.sections.map(section => templates.sectionContent(section)).join('')}
                </div>
            </div>
        </div>
    `,

    sectionContent: (section) => `
        <div class="section-content mb-4">
            <h4 class="section-title mb-3">
                <i class="fas fa-layer-group me-2"></i>${section.name}
            </h4>
            <div class="table-responsive">
                ${templates.table({
                    headers: ['Topic', 'Content', 'Actions'],
                    columnWidths: ['20%', '60%', '20%'], // Set column widths here
                    rows: section.topics.map(topic => [
                        topic.name,
                        templates.topicContent(topic.details),
                        `<button class="btn btn-action btn-light me-2" onclick="editTopic(${topic.id})" title="Edit"><i class="fas fa-edit text-primary"></i></button>
                         <button class="btn btn-action btn-light" onclick="deleteTopic(${topic.id})" title="Delete"><i class="fas fa-trash text-danger"></i></button>`
                    ])
                })}
            </div>
        </div>
    `,

    topicRow: (topic) => `
        <tr>
            <td>
                <div class="fw-medium">${topic.name}</div>
            </td>
            <td>
                <div class="topic-content">
                    ${templates.topicContent(topic.details)}
                </div>
            </td>
            <td>
                <button class="btn btn-action btn-light me-2" onclick="editTopic(${topic.id})" title="Edit">
                    <i class="fas fa-edit text-primary"></i>
                </button>
                <button class="btn btn-action btn-light" onclick="deleteTopic(${topic.id})" title="Delete">
                    <i class="fas fa-trash text-danger"></i>
                </button>
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