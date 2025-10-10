from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from functools import wraps
import requests
import json

# Create Flask app instance - Frontend only
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here-change-in-production'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour

# API Backend URL
API_BASE_URL = 'http://localhost:5000/api'

ROLES = {
    1: 'god',       # ผู้ดูแลระบบสูงสุด - เข้าถึงได้ทุกอย่าง
    2: 'staff',     # พนักงาน - จัดการสินค้า, แพ็คของ
    3: 'customer'   # ลูกค้า - ซื้อของ, ดูออเดอร์
}

ROLE_NAMES_TH = {
    1: 'ผู้ดูแลระบบ (God)',
    2: 'พนักงาน (Staff)',
    3: 'ลูกค้า (Customer)'
}

# ===== AUTHORIZATION DECORATORS =====

def login_required(f):
    """
    Decorator: ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
    ใช้กับหน้าที่ต้องล็อกอินก่อนเข้าใช้งาน
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            flash('⚠️ กรุณาเข้าสู่ระบบก่อนเข้าใช้งาน', 'warning')
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def role_required(*allowed_roles):
    """
    Decorator: ตรวจสอบสิทธิ์การเข้าถึงตามบทบาท
    
    Usage:
        @role_required('god', 'staff')
        def manage_products():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not session.get('logged_in'):
                flash('⚠️ กรุณาเข้าสู่ระบบก่อนเข้าใช้งาน', 'warning')
                return redirect(url_for('login', next=request.url))
            
            user_role_id = session.get('role_id')
            user_role = ROLES.get(user_role_id, 'unknown')
            
            if user_role not in allowed_roles:
                allowed_names = [ROLE_NAMES_TH.get(k, v) for k, v in ROLES.items() if v in allowed_roles]
                flash(f'❌ คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (ต้องการสิทธิ์: {", ".join(allowed_names)})', 'error')
                return redirect(url_for('access_denied'))
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def god_only(f):
    """เฉพาะ God เท่านั้น"""
    return role_required('god')(f)

def staff_or_above(f):
    """พนักงานหรือ God"""
    return role_required('god', 'staff')(f)

def customer_or_above(f):
    """ลูกค้าขึ้นไป (ทุกคนที่ล็อกอินแล้ว)"""
    return role_required('god', 'staff', 'customer')(f)


# ===== HELPER FUNCTIONS =====

def get_user_role_name():
    """ดึงชื่อบทบาทผู้ใช้ปัจจุบัน (ภาษาไทย)"""
    role_id = session.get('role_id')
    return ROLE_NAMES_TH.get(role_id, 'ไม่ทราบสิทธิ์')

def check_user_permissions():
    """
    ตรวจสอบสิทธิ์ผู้ใช้สำหรับแสดง/ซ่อนเมนู
    Return dict with permission flags
    """
    if not session.get('logged_in'):
        return {
            'logged_in': False,
            'is_god': False,
            'is_staff': False,
            'is_customer': False,
            'can_manage_products': False,
            'can_manage_packing': False,
            'can_manage_users': False,
            'can_view_orders': False,
            'can_use_cart': False
        }
    
    role_id = session.get('role_id', 3)
    return {
        'logged_in': True,
        'role_id': role_id,
        'role_name': get_user_role_name(),
        'username': session.get('username', 'User'),
        'email': session.get('email', ''),
        # Permission flags
        'is_god': role_id == 1,
        'is_staff': role_id in [1, 2],
        'is_customer': role_id in [1, 2, 3],
        'can_manage_products': role_id in [1, 2],      # God + Staff
        'can_manage_packing': role_id in [1, 2],       # God + Staff
        'can_manage_users': role_id == 1,               # God only
        'can_view_orders': role_id in [1, 2, 3],       # All logged in
        'can_use_cart': role_id in [1, 2, 3]           # All logged in
    }

# Context Processor: ส่งข้อมูล permissions ไปยัง templates ทุกหน้า
@app.context_processor
def inject_user_permissions():
    """ทำให้ user_perms ใช้ได้ในทุก template"""
    return {'user_perms': check_user_permissions()}


# ===== PUBLIC ROUTES (ไม่ต้องล็อกอิน) =====

@app.route('/')
def home():
    """หน้าแรก - เข้าได้ทุกคน"""
    categories_data = []
    try:
        # Get categories with products
        response = requests.get(f'{API_BASE_URL}/categories-with-products')
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                categories_data = result.get('data', [])
    except Exception as e:
        print(f"Error fetching categories with products: {e}")
        
    return render_template('home.html', categories=categories_data)

@app.route('/gallery')
def gallery():
    """Toy page route - consumes API"""
    products_data = []
    categories_data = []
    try:
        # 1. เรียกใช้งาน API endpoint /api/gallery
        response = requests.get(f'{API_BASE_URL}/gallery')
        response.raise_for_status()  # เช็คว่า request สำเร็จหรือไม่ (status code 2xx)

        result = response.json()

        # 2. ตรวจสอบว่า API ส่งข้อมูลกลับมาสำเร็จหรือไม่
        if result.get('success'):
            products_data = result.get('data', [])
            print("--- [Frontend] Data received by gallery() route ---")
            print(json.dumps(products_data, indent=2, ensure_ascii=False))
        else:
            flash(result.get('message', 'Could not load gallery items.'), 'error')

    except requests.exceptions.RequestException as e:
        # แสดง Error กรณีเชื่อมต่อ API Server ไม่ได้
        flash('Error connecting to the API server. Please make sure it is running.', 'error')
    except Exception as e:
        flash(f'An unexpected error occurred: {e}', 'error')

    # Load categories for filtering
    try:
        categories_response = requests.get(f'{API_BASE_URL}/categories')
        categories_response.raise_for_status()
        
        categories_result = categories_response.json()
        if categories_result.get('success'):
            categories_data = categories_result.get('data', [])
            
    except Exception as e:
        print(f"Error fetching categories for gallery: {e}")

    # 3. ส่งตัวแปร products_data และ categories_data ไปให้ gallery.html
    return render_template('gallery.html', products=products_data, categories=categories_data, url_for_detail=url_for('gallery_detail', p_id=0))

@app.route('/gallery/detail/<int:p_id>')
def gallery_detail(p_id):
    """Toy detail page route - consumes API"""
    product = None
    try:
        # 1. เรียกใช้งาน API endpoint /api/gallery/detail/<p_id>
        response = requests.get(f'{API_BASE_URL}/gallery/detail/{p_id}')
        response.raise_for_status()  # เช็คว่า request สำเร็จหรือไม่ (status code 2xx)

        result = response.json()

        # 2. ตรวจสอบว่า API ส่งข้อมูลกลับมาสำเร็จหรือไม่
        if result.get('success'):
            product = result.get('data')
            print(f"--- [Frontend] Data received for product {p_id} ---\n{json.dumps(product, indent=2, ensure_ascii=False)}")
        else:
            flash(result.get('message', 'Could not load product details.'), 'error')
            # หากไม่สำเร็จ ให้ redirect กลับไปหน้า gallery หรือ 404
            return redirect(url_for('not_found_error', error='Product not found'), 404) 

    except requests.exceptions.HTTPError as e:
        # หาก status code เป็น 404
        if e.response.status_code == 404:
            flash("Product not found.", 'error')
            return redirect(url_for('not_found_error', error='Product not found'), 404)
        flash(f'API HTTP Error: {e}', 'error')
    except requests.exceptions.RequestException as e:
        # แสดง Error กรณีเชื่อมต่อล้มเหลว
        flash(f'Connection Error: Cannot connect to API backend. ({e})', 'error')

    # ส่งข้อมูล product ไปยัง template
    return render_template('gallerydetail.html', product=product)

@app.route('/about')
def about():
    """เกี่ยวกับเรา - เข้าได้ทุกคน"""
    return render_template('about.html')

@app.route('/contact')
def contact():
    """ติดต่อเรา - เข้าได้ทุกคน"""
    return render_template('contact.html')

# ===== AUTHENTICATION ROUTES =====

@app.route('/login', methods=['GET', 'POST'])
def login():
    """หน้าเข้าสู่ระบบ"""
    if session.get('logged_in'):
        flash('✅ คุณเข้าสู่ระบบอยู่แล้ว', 'info')
        return redirect(url_for('home'))
    
    if request.method == 'POST':
        email_or_username = request.form.get('email')  # รับทั้ง email หรือ username
        password = request.form.get('password')
        
        if not email_or_username or not password:
            flash('❌ กรุณากรอก Email/Username และรหัสผ่าน', 'error')
            return render_template('login.html')
        
        try:
            # ส่งทั้ง email และ username ไปให้ API เลือกใช้
            login_data = {
                'email': email_or_username,
                'username': email_or_username,  # ส่งทั้ง 2 ให้ API ตรวจสอบ
                'password': password
            }
            print(f"🔍 DEBUG - Sending to API: email={email_or_username}, username={email_or_username}")
            
            response = requests.post(f'{API_BASE_URL}/login', json=login_data, timeout=10)
            
            result = response.json()
            
            if result.get('success'):
                user_data = result.get('data', {})
                session.clear()
                session['user_id'] = user_data.get('user_id')
                session['username'] = user_data.get('username')
                session['email'] = user_data.get('email')
                session['role_id'] = user_data.get('role_id', 3)
                session['user_info'] = user_data.get('user_info', {})
                session['logged_in'] = True
                session.permanent = True
                
                role_name = get_user_role_name()
                flash(f'✅ เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ {user_data.get("username")} ({role_name})', 'success')
                
                next_page = request.args.get('next')
                if next_page:
                    return redirect(next_page)
                
                role_id = session.get('role_id')
                if role_id in [1, 2]:
                    return redirect(url_for('manage_product'))
                else:
                    return redirect(url_for('home'))
            else:
                flash(f'❌ {result.get("message", "เข้าสู่ระบบล้มเหลว")}', 'error')
        
        except requests.exceptions.Timeout:
            flash('⏱️ การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง', 'error')
        except requests.exceptions.RequestException as e:
            flash('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง', 'error')
        except Exception as e:
            print(f"🔴 Login Error: {str(e)}")  # Debug log
            flash('❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """ออกจากระบบ"""
    username = session.get('username', 'ผู้ใช้')
    session.clear()
    flash(f'ออกจากระบบแล้ว ลาก่อน {username}!', 'info')
    return redirect(url_for('home'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    """สมัครสมาชิก"""
    if request.method == 'POST':
        form_data = {
            'username': request.form.get('username'),
            'email': request.form.get('email'),
            'password': request.form.get('password'),
            'confirm_password': request.form.get('confirm_password'),
            'firstname': request.form.get('firstname'),
            'lastname': request.form.get('lastname'),
            'street_address': request.form.get('street_address', ''),
            'city': request.form.get('city'),
            'postal_code': request.form.get('postal_code', ''),
            'telephone': request.form.get('phone')
        }
        
        required_fields = ['username', 'email', 'password', 'confirm_password', 'firstname', 'lastname', 'city', 'telephone']
        if not all(form_data.get(field) for field in required_fields):
            flash('❌ กรุณากรอกข้อมูลให้ครบถ้วน', 'error')
            return render_template('register.html')
        
        if form_data['password'] != form_data['confirm_password']:
            flash('❌ รหัสผ่านไม่ตรงกัน', 'error')
            return render_template('register.html')
        
        if len(form_data['password']) < 6:
            flash('❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error')
            return render_template('register.html')
        
        api_data = {k: v for k, v in form_data.items() if k != 'confirm_password'}
        
        try:
            response = requests.post(f'{API_BASE_URL}/register', json=api_data, timeout=10)
            result = response.json()
            
            if result.get('success'):
                flash('✅ สมัครสมาชิกสำเร็จ! สามารถเข้าสู่ระบบได้แล้ว', 'success')
                return redirect(url_for('login'))
            else:
                flash(f'❌ {result.get("message", "สมัครสมาชิกล้มเหลว")}', 'error')
        
        except requests.exceptions.Timeout:
            flash('⏱️ การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง', 'error')
        except requests.exceptions.RequestException:
            flash('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง', 'error')
        except Exception as e:
            flash('❌ เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง', 'error')
    
    return render_template('register.html')

# ===== PROTECTED ROUTES - CUSTOMER AND ABOVE =====

@app.route('/cart')
@customer_or_above
def cart():
    """ตะกร้าสินค้า - โหลดจาก localStorage ผ่าน JavaScript"""
    # Cart จะถูกโหลดด้วย JavaScript จาก localStorage
    # Template จะแสดงข้อความว่างเปล่าก่อน แล้ว JavaScript จะ render รายการสินค้า
    
    return render_template('cart.html', 
                         cart=[],  # Empty cart - will be populated by JavaScript
                         cart_items=[],
                         total=0,
                         subtotal=0,
                         shipping=50.00)

@app.route('/orders')
@customer_or_above
def all_orders():
    """คำสั่งซื้อทั้งหมด"""
    try:
        user_id = session.get('user_id')
        role_id = session.get('role_id', 3)
        
        # Build API URL with parameters
        params = {'role_id': role_id}
        if role_id == 3:  # Customer - only see their own orders
            params['user_id'] = user_id
        
        response = requests.get(f'{API_BASE_URL}/orders', params=params, timeout=10)
        result = response.json()
        
        if result.get('success'):
            orders = result.get('data', [])
        else:
            flash('❌ ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้', 'error')
            orders = []
    
    except Exception as e:
        print(f"Error fetching orders: {e}")
        flash('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error')
        orders = []
    
    status_labels = {
        1: 'Pending',
        2: 'Processing',
        3: 'Packing',
        4: 'Delivery',
        5: 'Completed',
        6: 'Cancelled'
    }
    
    return render_template('allorder.html', orders=orders, status_labels=status_labels)

@app.route('/tracking', methods=['GET', 'POST'])
@customer_or_above
def tracking():
    """ติดตามคำสั่งซื้อ"""
    order = None
    message = None
    
    if request.method == 'POST':
        order_id = request.form.get('order_id', '').strip()
        if not order_id:
            message = 'กรุณาใส่หมายเลขคำสั่งซื้อ'
        else:
            try:
                # Call API to get order details
                response = requests.get(f'{API_BASE_URL}/orders/{order_id}', timeout=10)
                result = response.json()
                
                if result.get('success'):
                    order = result.get('data')
                    # Add status label
                    status_labels = {
                        1: 'Pending (รอดำเนินการ)',
                        2: 'Processing (กำลังดำเนินการ)',
                        3: 'Packing (กำลังแพ็ค)',
                        4: 'Delivery (กำลังจัดส่ง)',
                        5: 'Complete (เสร็จสิ้น)',
                        6: 'Cancelled (ยกเลิก)'
                    }
                    order['status_label'] = status_labels.get(order.get('status_id'), 'Unknown')
                else:
                    message = f'ไม่พบคำสั่งซื้อหมายเลข {order_id}'
            
            except Exception as e:
                print(f"Error fetching order: {e}")
                message = 'เกิดข้อผิดพลาดในการค้นหาคำสั่งซื้อ'
    
    return render_template('tracking.html', order=order, message=message)

@app.route('/manage-product')
def manage_product():
    """Management page route - โหลดหน้าจัดการสินค้า"""
    categories = []
    try:
        # เรียก API เพื่อดึงข้อมูล categories
        response = requests.get(f'{API_BASE_URL}/categories')
        if response.ok:
            result = response.json()
            if result.get('success'):
                categories = result.get('data', [])
    except Exception as e:
        print(f"Error fetching categories: {e}")
        
    # ส่ง categories ไปให้ template
    return render_template('manageproduct.html', categories=categories)

@app.route('/manage-products/<int:category_id>')
@staff_or_above
def manage_products_by_category(category_id):
    
    # This would filter products by category in a real implementation
    # For now, return the same data
    return manage_product()

@app.route('/add-product', methods=['POST'])
@staff_or_above
def add_product():
    """เพิ่มสินค้าใหม่"""
    # This would handle adding a new product in a real implementation
    # For demo purposes, return success
    flash('✅ เพิ่มสินค้าสำเร็จ!', 'success')
    return redirect(url_for('manage_products'))

@app.route('/update-order-status', methods=['POST'])
@staff_or_above
def update_order_status():
    """อัพเดทสถานะคำสั่งซื้อ"""
    try:
        data = request.get_json()
        order_id = data.get('order_id')
        status_id = data.get('status_id')
        
        if not order_id or not status_id:
            return jsonify({
                'success': False,
                'message': 'Missing order_id or status_id'
            }), 400
        
        # Call API to update order status
        response = requests.patch(
            f'{API_BASE_URL}/orders/{order_id}',
            json={'status_id': status_id},
            timeout=10
        )
        result = response.json()
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'อัพเดทสถานะสำเร็จ',
                'data': result.get('data')
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', 'ไม่สามารถอัพเดทสถานะได้')
            }), 400
    
    except Exception as e:
        print(f"Error updating order status: {e}")
        return jsonify({
            'success': False,
            'message': 'เกิดข้อผิดพลาดในการอัพเดทสถานะ'
        }), 500

@app.route('/packing')
@staff_or_above
def packing():
    """จัดการแพ็คสินค้า - Staff และ God เห็นทุก order"""
    try:
        # Get all orders (Staff and God can see everything)
        response = requests.get(f'{API_BASE_URL}/orders', timeout=10)
        result = response.json()
        
        if result.get('success'):
            # Staff (role_id=2) and God (role_id=1) can see all orders
            orders = result.get('data', [])
        else:
            flash('❌ ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้', 'error')
            orders = []
    
    except Exception as e:
        print(f"Error fetching orders for packing: {e}")
        flash('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error')
        orders = []
    
    return render_template('packing.html', orders=orders)

# ===== PROTECTED ROUTES - GOD ONLY =====

@app.route('/users')
@god_only
def users():
    """จัดการผู้ใช้"""
    try:
        response = requests.get(f'{API_BASE_URL}/users', timeout=10)
        result = response.json()
        
        if result.get('success'):
            users_data = result.get('data', [])
            for user in users_data:
                role_id = user.get('role_id', 3)
                user['role_name'] = ROLE_NAMES_TH.get(role_id, 'ไม่ทราบสิทธิ์')
            
            return render_template('users.html', users=users_data, count=result.get('count', 0))
        else:
            flash('❌ ไม่สามารถโหลดข้อมูลผู้ใช้ได้', 'error')
            return render_template('users.html', users=[], count=0)
    
    except Exception as e:
        flash('❌ เกิดข้อผิดพลาด', 'error')
        return render_template('users.html', users=[], count=0)

@app.route('/admin/add-user', methods=['GET', 'POST'])
def admin_add_user():
    """
    Admin Panel - เพิ่มผู้ใช้สำหรับทดสอบ
    ⚠️ ไม่มีการตรวจสอบสิทธิ์ - สำหรับทดสอบเท่านั้น
    """
    if request.method == 'POST':
        # Get form data
        form_data = {
            'username': request.form.get('username'),
            'email': request.form.get('email'),
            'password': request.form.get('password'),
            'firstname': request.form.get('firstname'),
            'lastname': request.form.get('lastname'),
            'role_id': int(request.form.get('role_id', 3)),
            'street_address': request.form.get('street_address', ''),
            'city': request.form.get('city', 'Bangkok'),
            'postal_code': request.form.get('postal_code', '10000'),
            'telephone': request.form.get('telephone')
        }
        
        # Validation
        required_fields = ['username', 'email', 'password', 'firstname', 'lastname', 'telephone']
        if not all(form_data.get(field) for field in required_fields):
            flash('❌ กรุณากรอกข้อมูลให้ครบถ้วน', 'error')
            return render_template('admin_add_user.html', roles=ROLE_NAMES_TH)
        
        try:
            # Call API to create user
            response = requests.post(f'{API_BASE_URL}/register', json=form_data, timeout=10)
            result = response.json()
            
            if result.get('success'):
                role_name = ROLE_NAMES_TH.get(form_data['role_id'], 'Customer')
                flash(f'✅ เพิ่มผู้ใช้ {form_data["username"]} ({role_name}) สำเร็จ!', 'success')
                return redirect(url_for('users'))
            else:
                flash(f'❌ {result.get("message", "เพิ่มผู้ใช้ล้มเหลว")}', 'error')
        
        except requests.exceptions.Timeout:
            flash('⏱️ การเชื่อมต่อหมดเวลา', 'error')
        except requests.exceptions.RequestException:
            flash('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error')
        except Exception as e:
            flash(f'❌ เกิดข้อผิดพลาด: {str(e)}', 'error')
    
    return render_template('admin_add_user.html', roles=ROLE_NAMES_TH)

# ===== ERROR HANDLERS =====

@app.route('/access-denied')
def access_denied():
    """หน้าไม่มีสิทธิ์"""
    return render_template('access_denied.html'), 403

@app.errorhandler(403)
def forbidden_error(error):
    return render_template('access_denied.html'), 403

@app.errorhandler(401)
def unauthorized_error(error):
    flash('⚠️ กรุณาเข้าสู่ระบบก่อนเข้าใช้งาน', 'warning')
    return redirect(url_for('login')), 401

@app.errorhandler(404)
def not_found_error(error):
    try:
        return render_template('404.html'), 404
    except:
        return '<h1>404 - ไม่พบหน้าที่ต้องการ</h1>', 404

@app.errorhandler(500)
def internal_error(error):
    try:
        return render_template('500.html'), 500
    except:
        return '<h1>500 - เกิดข้อผิดพลาด</h1>', 500

if __name__ == '__main__':
    print("="*60)
    print("🎨 EchoArty Frontend Server with Session Management")
    print("="*60)
    print("📝 Session Authentication: ENABLED")
    print("🔒 Role-based Authorization: ENABLED")
    print("👥 User Roles:")
    print("   1. God (ผู้ดูแลระบบ) - Full access")
    print("   2. Staff (พนักงาน) - Manage products & packing")
    print("   3. Customer (ลูกค้า) - Shop & orders")
    print("="*60)
    print("🔗 API Backend: http://localhost:5000")
    print("🌐 Frontend: http://localhost:8080")
    print("="*60)
    
    app.run(debug=True, host='0.0.0.0', port=8080)
