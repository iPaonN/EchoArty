from flask import Flask, render_template

# Create Flask app instance
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this in production

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
