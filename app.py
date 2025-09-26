from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify

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

@app.route('/gallery/detail')
def gallery_detail():
    """Gallery detail page route"""
    return render_template('gallerydetail.html')

@app.route('/about')
def about():
    """About page route"""
    return render_template('about.html')

@app.route('/contact')
def contact():
    """Contact page route"""
    return render_template('contact.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page route"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Basic validation
        if not email or not password:
            flash('Please fill in all fields', 'error')
            return render_template('login.html')
        
        # TODO: Add your authentication logic here
        # For now, we'll just check for a demo user
        if email == 'demo@echoarty.com' and password == 'demo123':
            session['user_email'] = email
            session['logged_in'] = True
            flash('Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid email or password', 'error')
            return render_template('login.html')
    
    # GET request - show the login form
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Logout route"""
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('home'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Register page route"""
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        phone = request.form.get('phone')
        
        # Basic validation
        if not all([username, email, password, confirm_password, phone]):
            flash('Please fill in all fields', 'error')
            return render_template('register.html')
        
        # Password confirmation check
        if password != confirm_password:
            flash('Passwords do not match', 'error')
            return render_template('register.html')
        
        # Password strength check
        if len(password) < 6:
            flash('Password must be at least 6 characters long', 'error')
            return render_template('register.html')
        
        # Email format validation (basic)
        if '@' not in email or '.' not in email.split('@')[-1]:
            flash('Please enter a valid email address', 'error')
            return render_template('register.html')
        
        # TODO: Add database logic to save user
        # For demo purposes, we'll just simulate successful registration
        # Check if email already exists (demo check)
        if email == 'demo@echoarty.com':
            flash('Email already exists. Please use a different email.', 'error')
            return render_template('register.html')
        
        # Simulate successful registration
        flash('Registration successful! You can now login.', 'success')
        return redirect(url_for('login'))
    
    # GET request - show the registration form
    return render_template('register.html')

@app.route('/tracking', methods=['GET', 'POST'])
def tracking():
    """Order tracking page route"""
    order = None
    message = None
    
    # Sample order data for demonstration
    sample_orders = {
        'ORD001': {
            'order_id': 'ORD001',
            'customer_name': 'สมชาย ใจดี',
            'email': 'somchai@example.com',
            'phone': '081-234-5678',
            'address': '123 ถนนสุขุมวิท เขตวัฒนา กรุงเทพมหานคร 10110',
            'order_date': '2025-09-10',
            'status_id': 2  # 1=pending, 2=packing wait, 3=packing, 4=completed, 5+=failed
        },
        'ORD002': {
            'order_id': 'ORD002',
            'customer_name': 'สมศรี รักงาน',
            'email': 'somsri@example.com',
            'phone': '082-345-6789',
            'address': '456 ถนนรามคำแหง เขตบางกะปิ กรุงเทพมหานคร 10240',
            'order_date': '2025-09-12',
            'status_id': 3
        },
        'ORD003': {
            'order_id': 'ORD003',
            'customer_name': 'สมหญิง มีความสุข',
            'email': 'somying@example.com',
            'phone': '083-456-7890',
            'address': '789 ถนนพระราม 4 เขตปทุมวัน กรุงเทพมหานคร 10330',
            'order_date': '2025-09-08',
            'status_id': 4
        },
        'ORD004': {
            'order_id': 'ORD004',
            'customer_name': 'สมพงษ์ เสียใจ',
            'email': 'sompong@example.com',
            'phone': '084-567-8901',
            'address': '321 ถนนลาดพร้าว เขตจตุจักร กรุงเทพมหานคร 10900',
            'order_date': '2025-09-05',
            'status_id': 5  # Failed status
        }
    }
    
    if request.method == 'POST':
        # Handle order lookup from form submission
        order_id = request.form.get('order_id', '').strip().upper()
        
        if not order_id:
            message = 'กรุณาใส่หมายเลขคำสั่งซื้อ'
        elif order_id in sample_orders:
            order = sample_orders[order_id]
        else:
            message = f'ไม่พบคำสั่งซื้อหมายเลข {order_id}'
    
    elif request.method == 'GET':
        # Handle order lookup from URL parameter
        order_id = request.args.get('order_id', '').strip().upper()
        
        if order_id:
            if order_id in sample_orders:
                order = sample_orders[order_id]
            else:
                message = f'ไม่พบคำสั่งซื้อหมายเลข {order_id}'
        else:
            # No order ID provided, show search form
            return render_template('tracking_search.html')
    
    return render_template('tracking.html', order=order, message=message)

@app.route('/orders')
def all_orders():
    """All orders page route - Demo version without authentication"""
    
    # Sample orders data for demonstration
    sample_orders = [
        {
            'order_id': 'ORD001',
            'items': [
                {'name': 'Custom Art Print', 'detail': 'A4 size, premium paper, custom design'},
                {'name': 'Digital Artwork', 'detail': 'High resolution, personal use license'}
            ],
            'order_date': '2025-09-10',
            'status_id': 2,
            'total': 1500.00,
            'bill': 'bill_001.jpg',
            'custom': 'custom_001.jpg'
        },
        {
            'order_id': 'ORD002',
            'items': [
                {'name': 'Portrait Commission', 'detail': '30x40cm canvas, oil painting style'}
            ],
            'order_date': '2025-09-12',
            'status_id': 3,
            'total': 3500.00,
            'bill': 'bill_002.jpg',
            'custom': 'custom_002.jpg'
        },
        {
            'order_id': 'ORD003',
            'items': [
                {'name': 'Logo Design', 'detail': 'Complete brand package with variations'},
                {'name': 'Business Card Design', 'detail': 'Print-ready files, 5 variations'}
            ],
            'order_date': '2025-09-08',
            'status_id': 4,
            'total': 2800.00,
            'bill': 'bill_003.jpg',
            'custom': 'custom_003.jpg'
        },
        {
            'order_id': 'ORD004',
            'items': [
                {'name': 'Website Banner', 'detail': 'Responsive design, 3 size variations'}
            ],
            'order_date': '2025-09-05',
            'status_id': 5,
            'total': 1200.00,
            'bill': 'bill_004.jpg',
            'custom': 'custom_004.jpg'
        }
    ]
    
    # Status labels mapping
    status_labels = {
        1: 'รอการยืนยัน',
        2: 'รอการแพ็คสินค้า',
        3: 'กำลังแพ็คสินค้า',
        4: 'สำเร็จ',
        5: 'ยกเลิก/ล้มเหลว'
    }
    
    # For demo/UI purposes, always show sample orders
    orders = sample_orders
    
    return render_template('allorder.html', orders=orders, status_labels=status_labels)

@app.route('/cart')
def cart():
    """Shopping cart page route"""
    
    # Sample cart items for demonstration
    sample_cart_items = [
        {
            'product_id': 'PROD001',
            'name': 'Custom Art Print - Portrait',
            'description': 'High-quality personalized portrait artwork',
            'price': 1500.00,
            'quantity': 2,
            'image': 'portrait_art.jpg',
            'category': 'Custom Artwork',
            'size': 'A4',
            'material': 'Premium Paper',
            'detail': 'Custom portrait with premium paper finish'
        },
        {
            'product_id': 'PROD002',
            'name': 'Digital Logo Design',
            'description': 'Professional logo design with multiple variations',
            'price': 2500.00,
            'quantity': 1,
            'image': 'logo_design.jpg',
            'category': 'Digital Design',
            'size': 'Various Formats',
            'material': 'Digital Files',
            'detail': 'Complete logo package with various file formats'
        },
        {
            'product_id': 'PROD003',
            'name': 'Canvas Painting - Landscape',
            'description': 'Beautiful landscape painting on canvas',
            'price': 3500.00,
            'quantity': 1,
            'image': 'canvas_art.jpg',
            'category': 'Canvas Art',
            'size': '30x40cm',
            'material': 'Canvas',
            'detail': 'Hand-painted landscape on premium canvas'
        },
        {
            'product_id': 'PROD004',
            'name': 'Business Card Design',
            'description': 'Professional business card design package',
            'price': 800.00,
            'quantity': 3,
            'image': 'business_cards.jpg',
            'category': 'Print Design',
            'size': 'Standard Size',
            'material': 'Print Ready',
            'detail': 'Professional business card design with multiple variations'
        }
    ]
    
    # Calculate totals
    subtotal = sum(item['price'] * item['quantity'] for item in sample_cart_items)
    shipping = 50.00  # Fixed shipping cost
    total = subtotal + shipping
    
    cart_summary = {
        'subtotal': subtotal,
        'shipping': shipping,
        'total': total,
        'item_count': sum(item['quantity'] for item in sample_cart_items)
    }
    
    return render_template('cart.html', 
                         cart=sample_cart_items, 
                         cart_items=sample_cart_items,
                         cart_summary=cart_summary,
                         total=total,
                         subtotal=subtotal,
                         shipping=shipping)

@app.route('/manage-products')
def manage_products():
    """Manage products page route"""
    
    # Sample products data for demonstration
    sample_products = [
        {
            'id': 1,
            'name': 'Custom Art Print - Portrait',
            'description': 'High-quality personalized portrait artwork with premium paper finish',
            'price': 1500.00,
            'amount': 25,
            'size': 'A4',
            'image': 'portrait_art.jpg',
            'categories': [
                {'id': 1, 'name': 'Custom Artwork'},
                {'id': 2, 'name': 'Portraits'}
            ]
        },
        {
            'id': 2,
            'name': 'Digital Logo Design',
            'description': 'Professional logo design with multiple variations and file formats',
            'price': 2500.00,
            'amount': 15,
            'size': 'Various',
            'image': 'logo_design.jpg',
            'categories': [
                {'id': 3, 'name': 'Digital Design'},
                {'id': 4, 'name': 'Branding'}
            ]
        },
        {
            'id': 3,
            'name': 'Canvas Painting - Landscape',
            'description': 'Beautiful hand-painted landscape on premium canvas',
            'price': 3500.00,
            'amount': 8,
            'size': '30x40cm',
            'image': 'canvas_art.jpg',
            'categories': [
                {'id': 5, 'name': 'Canvas Art'},
                {'id': 6, 'name': 'Landscapes'}
            ]
        },
        {
            'id': 4,
            'name': 'Business Card Design',
            'description': 'Professional business card design package with print-ready files',
            'price': 800.00,
            'amount': 50,
            'size': 'Standard',
            'image': 'business_cards.jpg',
            'categories': [
                {'id': 3, 'name': 'Digital Design'},
                {'id': 7, 'name': 'Print Design'}
            ]
        },
        {
            'id': 5,
            'name': 'Website Banner Set',
            'description': 'Responsive website banner designs in multiple sizes',
            'price': 1200.00,
            'amount': 30,
            'size': 'Responsive',
            'image': 'web_banners.jpg',
            'categories': [
                {'id': 3, 'name': 'Digital Design'},
                {'id': 8, 'name': 'Web Design'}
            ]
        }
    ]
    
    # Sample categories data
    sample_categories = [
        {'id': 1, 'name': 'Custom Artwork'},
        {'id': 2, 'name': 'Portraits'},
        {'id': 3, 'name': 'Digital Design'},
        {'id': 4, 'name': 'Branding'},
        {'id': 5, 'name': 'Canvas Art'},
        {'id': 6, 'name': 'Landscapes'},
        {'id': 7, 'name': 'Print Design'},
        {'id': 8, 'name': 'Web Design'}
    ]
    
    return render_template('manageproduct.html', 
                         products=sample_products, 
                         categories=sample_categories)

@app.route('/manage-products/<int:category_id>')
def manage_products_by_category(category_id):
    """Manage products filtered by category"""
    
    # This would filter products by category in a real implementation
    # For now, return the same data
    return manage_products()

@app.route('/add-product', methods=['POST'])
def add_product():
    """Add new product route"""
    
    # This would handle adding a new product in a real implementation
    # For demo purposes, return success
    return {'success': True, 'message': 'Product added successfully'}

@app.route('/packing')
def packing():
    """Packing management page route"""
    # Sample orders data - replace with actual database query
    sample_orders = [
        {
            'order_id': 1,
            'customer': 'นาย สมชาย ใจดี',
            'description': 'งานพิมพ์โปสเตอร์ A3 สี',
            'order_date': '2024-03-15',
            'bill_img': 'bill001.jpg',
            'image': 'product001.jpg',
            'status': 2  # รอการแพ็ค
        },
        {
            'order_id': 2,
            'customer': 'นางสาว สุดา สวยงาม',
            'description': 'งานพิมพ์นามบัตร 1000 ใบ',
            'order_date': '2024-03-14',
            'bill_img': 'bill002.jpg',
            'image': 'product002.jpg',
            'status': 3  # กำลังแพ็ค
        },
        {
            'order_id': 3,
            'customer': 'บริษัท ABC จำกัด',
            'description': 'งานพิมพ์แผ่นพับโฆษณา',
            'order_date': '2024-03-13',
            'bill_img': 'bill003.jpg',
            'image': 'product003.jpg',
            'status': 4  # สำเร็จ
        },
        {
            'order_id': 4,
            'customer': 'นาย วิชัย เก่งดี',
            'description': 'งานพิมพ์สติ๊กเกอร์ 500 ชิ้น',
            'order_date': '2024-03-12',
            'bill_img': 'bill004.jpg',
            'image': 'product004.jpg',
            'status': 5  # ล้มเหลว
        }
    ]
    
    return render_template('packing.html', orders=sample_orders)

@app.route('/api/update-order-status', methods=['POST'])
def update_order_status():
    """API route to update order status"""
    try:
        data = request.get_json()
        order_id = data.get('orderId')
        status = data.get('status')
        
        if not order_id or not status:
            return jsonify({
                'success': False,
                'message': 'Missing orderId or status'
            }), 400
        
        # Convert status to number
        status_map = {
            'Waiting for packing': 2,
            'Packing': 3,
            'Success': 4,
            'Failed': 5
        }
        
        status_code = status_map.get(status)
        if status_code is None:
            return jsonify({
                'success': False,
                'message': 'Invalid status'
            }), 400
        
        # TODO: Add actual database update logic here
        # For demo purposes, just return success
        print(f"Updating order {order_id} to status {status} ({status_code})")
        
        return jsonify({
            'success': True,
            'message': 'Order status updated successfully',
            'data': {
                'orderId': order_id,
                'status': status,
                'statusCode': status_code
            }
        })
        
    except Exception as e:
        print(f"Error updating order status: {e}")
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500

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
