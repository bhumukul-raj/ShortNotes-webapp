export const topicFormTemplate = {
    modal: () => `
        <div class="modal fade" id="addTopicModal" tabindex="-1" aria-labelledby="addTopicModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addTopicModalLabel">Add Topic and Content</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-section">
                            <form id="topicForm">
                                <div class="mb-3">
                                    <label for="topicName" class="form-label">Topic Name</label>
                                    <input type="text" class="form-control" id="topicName" placeholder="Enter topic name" required>
                                </div>

                                <button type="button" class="btn add-content-btn" id="showContentModal">
                                    <i class="fa fa-plus"></i> Add Content Block
                                </button>

                                <div id="contentBlocksContainer" class="content-blocks-container">
                                    <!-- Content blocks will be dynamically appended here -->
                                </div>

                                <button type="submit" class="btn btn-success w-100 mt-3">Save Topic</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Content Block Modal -->
        <div class="modal fade" id="addContentModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Content Block</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="contentType" class="form-label">Content Type</label>
                            <select class="form-select content-type-select" required>
                                <option value="">Select Type</option>
                                <option value="text">Text</option>
                                <option value="code">Code</option>
                                <option value="image">Image</option>
                                <option value="table">Table</option>
                            </select>
                        </div>
                        <div class="dynamic-input"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="addContentToForm">Add Content</button>
                    </div>
                </div>
            </div>
        </div>
    `
};
