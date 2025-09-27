# EchoArty 🎨

## 🛠️ Technology Stack

- **Backend**: Python 3.12, Flask 3.1.2
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Bootstrap 5.3.0, Custom CSS
- **Icons**: Font Awesome
- **Template Engine**: Jinja2
- **Database**: MariaDB

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8 or higher** ([Download Python](https://python.org/downloads/))
- **pip** (Python package installer)
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/iPaonN/EchoArty.git
cd EchoArty
```

### 2. Create Virtual Environment

**On Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

The application will be available at: `http://localhost:5000`

## 📂 Project Structure

```
EchoArty/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── .gitignore            # Git ignore file
├── static/               # Static files (CSS, JS, images)
│   ├── css/
│   │   └── style.css     # Custom styles
│   └── js/
│       └── main.js       # JavaScript functionality
├── templates/            # HTML templates
│   ├── base.html         # Base template with navbar
│   ├── home.html         # Home page
│   ├── gallery.html      # Gallery page
│   ├── about.html        # About page
│   ├── contact.html      # Contact page
│   ├── 404.html          # 404 error page
│   └── 500.html          # 500 error page
└── venv/                 # Virtual environment (excluded from git)
```

## 🔧 Development Setup

### Environment Configuration

1. **Set Flask Environment Variables** (Optional):
```bash
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1
```

2. **Update Secret Key** (Important for production):
   - Open `app.py`
   - Change `app.config['SECRET_KEY']` to a secure random string

### Adding New Pages

1. **Create a new route** in `app.py`:
```python
@app.route('/new-page')
def new_page():
    return render_template('new_page.html')
```

2. **Create the template** in `templates/new_page.html`:
```html
{% extends "base.html" %}

{% block title %}New Page - EchoArty{% endblock %}

{% block content %}
<!-- Your content here -->
{% endblock %}
```

3. **Add navigation link** in `templates/base.html` navbar section.

## 📦 Dependencies

The project uses the following main dependencies:

```
Flask==3.1.2           # Web framework
Jinja2==3.1.6          # Template engine
Werkzeug==3.1.3        # WSGI utility
python-dotenv==1.1.1   # Environment variables
watchdog==6.0.0        # File monitoring
```

For a complete list, see `requirements.txt`.

## 🌐 Available Routes

- `/` - Home page
- `/gallery` - Art gallery
- `/about` - About page
- `/contact` - Contact form
- Custom 404/500 error pages

## 🎨 Customization

### Styling
- **Custom CSS**: Edit `static/css/style.css`
- **Bootstrap**: Modify Bootstrap classes in templates
- **Colors**: Update CSS variables in `style.css`

### Content
- **Navigation**: Edit navbar in `templates/base.html`
- **Footer**: Modify footer section in `templates/base.html`
- **Pages**: Update individual template files

### JavaScript
- **Interactive Features**: Edit `static/js/main.js`
- **Form Handling**: Customize form validation and submission

## 🚀 Deployment

### Production Considerations

1. **Security**:
   - Change the secret key to a secure random string
   - Set `debug=False` in production
   - Use environment variables for sensitive data

2. **Web Server**:
   - Use a production WSGI server like Gunicorn
   - Set up a reverse proxy with Nginx

3. **Example Gunicorn deployment**:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## 🧪 Testing

Run the application in development mode:
```bash
python app.py
```

Access the application at `http://localhost:5000` and test:
- ✅ Navigation between pages
- ✅ Responsive design on different screen sizes
- ✅ Contact form functionality
- ✅ Error pages (try accessing `/non-existent-page`)

## 🐛 Troubleshooting

### Common Issues

**Virtual Environment Issues**:
```bash
# Deactivate and recreate virtual environment
deactivate
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Port Already in Use**:
```bash
# Kill process using port 5000
sudo lsof -t -i tcp:5000 | xargs kill -9
```

**Template Not Found Errors**:
- Ensure all template files exist in the `templates/` directory
- Check file names match exactly (case-sensitive)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

---

**Happy Coding!** 🎨✨

Built with ❤️ by the EchoArty Team
