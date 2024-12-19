my_flask_project/
│
├── app.py                     # Main Flask application file
├── models.py                  # Handles data manipulation (e.g., reading/writing JSON)
├── utils.py                   # Optional: Helper functions (e.g., for validations, transformations)
│
├── static/                    # Folder for static assets (CSS, JS, images)
│   ├── css/
│   │   └── style.css          # Example CSS file
│   ├── js/
│   │   └── script.js          # Example JS file
│   └── images/                # Store image files
│       └── example.jpg
│
├── templates/                 # Folder for HTML templates
│   ├── base.html              # Base template (common layout for all pages)
│   ├── index.html             # Homepage template displaying subjects
│   ├── subject_page.html      # Template for individual subject pages
│   ├── admin.html             # Admin panel template for CRUD operations
│   └── login.html       # Login modal for admin access
│
├── data/                      # Folder for JSON data storage
│   ├── subjects.json          # JSON file storing subject information
│   └── topics.json            # JSON file storing topic data for each subject
│
├── migrations/                # Optional: Folder for database migrations (if using SQLAlchemy in the future)
│
├── .gitignore                 # Git ignore file
├── requirements.txt           # Python dependencies
└── README.md                  # Project documentation
