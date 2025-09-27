from flask import Flask, render_template
from models import db, User
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create Flask app instance
app = Flask(__name__)

# Set up database
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')
db_name = os.getenv('DB_NAME')

primary_host = db_host.split(',')[0] if db_host else ''

database_uri = (
    f"mysql+pymysql://{db_user}:{db_password}@{primary_host}:{db_port}/{db_name}"
    "?ssl_verify_cert=true"
)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or database_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize DB
db.init_app(app)


@app.route('/')
def home():
    """Home page route"""
    return render_template('home.html')

@app.route('/gallery')
def gallery():
    """Gallery page route"""
    return render_template('gallery.html')

@app.route('/about')
def about():
    """About page route"""
    return render_template('about.html')

@app.route('/contact')
def contact():
    """Contact page route"""
    return render_template('contact.html')

# FOR TESTING PURPOSES: Display all users from the database
@app.route('/users')
def users():
    """Users data page route"""
    try:
        all_users = User.query.all()
        return render_template('users.html', users=all_users)
    except Exception as e:
        app.logger.error(f"Database error: {e}")
        return render_template('500.html'), 500

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors"""
    try:
        return render_template('404.html'), 404
    except:
        # Fallback if template is missing
        return '<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p><a href="/">Go Home</a>', 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    try:
        return render_template('500.html'), 500
    except:
        # Fallback if template is missing
        return '<h1>500 - Internal Server Error</h1><p>Something went wrong on our server.</p><a href="/">Go Home</a>', 500

if __name__ == '__main__':
    # Run the app in debug mode for development
    app.run(debug=True, host='0.0.0.0', port=5000)
