from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, UserInfo, Role, Product, Category, ProductCategory 
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app instance
app = Flask(__name__)

# File upload configuration
UPLOAD_FOLDER = 'static/images/products'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'jfif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Enable CORS for all routes (allows frontend to access API)
CORS(app)

# Database configuration
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

def init_roles():
    """Initialize default roles if they don't exist"""
    try:
        if Role.query.count() == 0:
            admin_role = Role(role_id=1, role_name='admin', description='Administrator with full access')
            moderator_role = Role(role_id=2, role_name='moderator', description='Moderator with limited admin access')
            user_role = Role(role_id=3, role_name='user', description='Regular user')
            
            db.session.add_all([admin_role, moderator_role, user_role])
            db.session.commit()
            print("Default roles created successfully!")
        else:
            print("Roles already exist, skipping initialization.")
    except Exception as e:
        print(f"Error initializing roles: {e}")
        db.session.rollback()

# ===== API ROUTES =====

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'EchoArty API is running',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/api/register', methods=['POST'])
def api_register():
    """API endpoint for user registration"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        # Validation
        required_fields = ['username', 'email', 'password', 'firstname', 'lastname', 'city', 'telephone']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'message': 'Missing required fields',
                'missing_fields': missing_fields
            }), 400
        
        # Password validation
        if len(data['password']) < 6:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 6 characters long'
            }), 400
        
        # Email format validation
        email = data['email']
        if '@' not in email or '.' not in email.split('@')[-1]:
            return jsonify({
                'success': False,
                'message': 'Invalid email format'
            }), 400
        
        # Check if username exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({
                'success': False,
                'message': 'Username already exists'
            }), 409
        
        # Check if email exists
        if User.query.filter_by(email=email).first():
            return jsonify({
                'success': False,
                'message': 'Email already exists'
            }), 409
        
        # Create user
        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            username=data['username'],
            email=email,
            password=hashed_password,
            role_id=3,  # Regular user
            created_at=datetime.utcnow()
        )
        
        db.session.add(new_user)
        db.session.flush()
        
        # Create user info
        new_user_info = UserInfo(
            u_id=new_user.u_id,
            firstname=data['firstname'],
            lastname=data['lastname'],
            street_address=data.get('street_address', ''),
            city=data['city'],
            postal_code=data.get('postal_code', ''),
            telephone=data['telephone']
        )
        
        db.session.add(new_user_info)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': {
                'user_id': new_user.u_id,
                'username': new_user.username,
                'email': new_user.email
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"API Registration error: {e}")
        return jsonify({
            'success': False,
            'message': 'Registration failed',
            'error': str(e)
        }), 500

@app.route('/api/login', methods=['POST'])
def api_login():
    """API endpoint for user login"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email and password required'
            }), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if user and check_password_hash(user.password, data['password']):
            user_info = UserInfo.query.filter_by(u_id=user.u_id).first()
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'user_id': user.u_id,
                    'username': user.username,
                    'email': user.email,
                    'role_id': user.role_id,
                    'user_info': {
                        'firstname': user_info.firstname if user_info else None,
                        'lastname': user_info.lastname if user_info else None,
                        'city': user_info.city if user_info else None,
                        'telephone': user_info.telephone if user_info else None
                    } if user_info else None
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401
            
    except Exception as e:
        app.logger.error(f"API Login error: {e}")
        return jsonify({
            'success': False,
            'message': 'Login failed',
            'error': str(e)
        }), 500

@app.route('/api/users', methods=['GET'])
def api_get_users():
    """API endpoint to get all users"""
    try:
        users = User.query.all()
        users_data = []
        
        for user in users:
            user_info = UserInfo.query.filter_by(u_id=user.u_id).first()
            users_data.append({
                'user_id': user.u_id,
                'username': user.username,
                'email': user.email,
                'role_id': user.role_id,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'user_info': {
                    'firstname': user_info.firstname if user_info else None,
                    'lastname': user_info.lastname if user_info else None,
                    'street_address': user_info.street_address if user_info else None,
                    'city': user_info.city if user_info else None,
                    'postal_code': user_info.postal_code if user_info else None,
                    'telephone': user_info.telephone if user_info else None
                } if user_info else None
            })
        
        return jsonify({
            'success': True,
            'data': users_data,
            'count': len(users_data)
        }), 200
        
    except Exception as e:
        app.logger.error(f"API Get users error: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch users',
            'error': str(e)
        }), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
def api_get_user(user_id):
    """API endpoint to get a specific user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        user_info = UserInfo.query.filter_by(u_id=user.u_id).first()
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user.u_id,
                'username': user.username,
                'email': user.email,
                'role_id': user.role_id,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'user_info': {
                    'firstname': user_info.firstname if user_info else None,
                    'lastname': user_info.lastname if user_info else None,
                    'street_address': user_info.street_address if user_info else None,
                    'city': user_info.city if user_info else None,
                    'postal_code': user_info.postal_code if user_info else None,
                    'telephone': user_info.telephone if user_info else None
                } if user_info else None
            }
        }), 200
        
    except Exception as e:
        app.logger.error(f"API Get user error: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch user',
            'error': str(e)
        }), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """API endpoint to get all categories"""
    try:
        categories = Category.query.all()
        categories_data = [{'c_id': cat.c_id, 'name': cat.name} for cat in categories]
        
        return jsonify({
            'success': True,
            'data': categories_data,
            'count': len(categories_data)
        }), 200
        
    except Exception as e:
        app.logger.error(f"API Get categories error: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch categories',
            'error': str(e)
        }), 500

@app.route('/api/roles', methods=['GET'])
def api_get_roles():
    """API endpoint to get all roles"""
    try:
        roles = Role.query.all()
        roles_data = [{
            'role_id': role.role_id,
            'role_name': role.role_name,
        } for role in roles]
        
        return jsonify({
            'success': True,
            'data': roles_data,
            'count': len(roles_data)
        }), 200
        
    except Exception as e:
        app.logger.error(f"API Get roles error: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch roles',
            'error': str(e)
        }), 500

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

@app.route('/api/gallery', methods=['GET'])
def api_get_gallery():
    """API endpoint to get all products for the gallery"""
    try:
        # ดึงข้อมูลสินค้าทั้งหมดจากตาราง products
        products = Product.query.all()
        
        # แปลงข้อมูลแต่ละ object ให้อยู่ในรูปแบบ dictionary
        products_data = [product.to_dict() for product in products]
        
        return jsonify({
            'success': True,
            'data': products_data,
            'count': len(products_data)
        }), 200
        
    except Exception as e:
        app.logger.error(f"API Get gallery error: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch gallery products',
            'error': str(e)
        }), 500

@app.route('/api/gallery/detail/<int:p_id>', methods=['GET'])
def get_gallery_detail(p_id):
    """
    API Endpoint สำหรับดึงข้อมูลสินค้าเดียวตาม p_id
    """
    try:
        # 1. ค้นหาสินค้าจากฐานข้อมูลโดยใช้ p_id
        product = Product.query.get(p_id)

        # 2. ตรวจสอบว่าพบสินค้าหรือไม่
        if product is None:
            return jsonify({
                'success': False,
                'message': f'Product with p_id {p_id} not found'
            }), 404

        # 3. แปลงข้อมูลสินค้าเป็น dictionary และส่งกลับ
        product_data = product.to_dict()
        
        # NOTE: product.to_dict() ถูกกำหนดไว้ใน models.py ซึ่งจะแปลง object เป็น dict
        
        app.logger.info(f"API Get gallery detail successful for p_id: {p_id}")
        return jsonify({
            'success': True,
            'data': product_data
        }), 200
        
    except Exception as e:
        app.logger.error(f"API Get gallery detail error for p_id {p_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to fetch product detail for p_id {p_id}',
            'error': str(e)
        }), 500

@app.route('/api/manage-product', methods=['GET'])
def get_manage_products():
    """
    API Endpoint สำหรับดึงรายการสินค้าทั้งหมดสำหรับการจัดการ
    """
    try:
        # ดึงข้อมูลสินค้าทั้งหมดจากฐานข้อมูล
        products = Product.query.all()

        # แปลงรายการสินค้าเป็น list of dictionaries โดยใช้ Product.to_dict()
        products_data = [product.to_dict() for product in products]
        
        return jsonify({
            'success': True,
            'data': products_data,
            'count': len(products_data)
        }), 200
        
    except Exception as e:
        app.logger.error(f"API Get manage products error: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch products for management',
            'error': str(e)
        }), 500

@app.route('/api/products/<int:product_id>', methods=['GET', 'PUT'])
def manage_product_api(product_id):
    """API endpoint for managing a single product"""
    product = Product.query.get_or_404(product_id)
    
    if request.method == 'GET':
        categories = [cat.c_id for cat in product.categories]
        return jsonify({
            'success': True,
            'data': {
                'name': product.name,
                'description': product.description, 
                'price': float(product.price) if product.price else 0,
                'size': product.size or "1:1",
                'amount': product.amount if hasattr(product, 'amount') else 0,
                'image': product.image,
                'categories': categories
            }
        }), 200
        
    elif request.method == 'PUT':
        try:
            # Update basic info
            product.name = request.form.get('productName', product.name)
            product.description = request.form.get('description', product.description)
            product.price = float(request.form.get('price', product.price))
            product.amount = int(request.form.get('amount', 0))
            
            # Update size ratio
            number_x = request.form.get('number_x', '1')
            number_y = request.form.get('number_y', '1')
            product.size = f"{number_x}:{number_y}"
            
            # Update categories if provided
            if 'category[]' in request.form:
                selected_categories = request.form.getlist('category[]')
                product.categories = Category.query.filter(Category.c_id.in_(selected_categories)).all()
            
            # Handle image upload if provided
            if 'image' in request.files:
                file = request.files['image']
                if file and file.filename:
                    from werkzeug.utils import secure_filename
                    filename = secure_filename(file.filename)
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    product.image = filename

            # Update timestamp with Thai time (UTC+7)
            from datetime import timedelta
            thai_time = datetime.utcnow() + timedelta(hours=7)
            product.updated_at = thai_time
            
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Product updated successfully'
            }), 200
                
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error updating product {product_id}: {e}")
            return jsonify({
                'success': False,
                'message': str(e)
            }), 400
    
    if request.method == 'POST':
        try:
            # Update basic info
            product.name = request.form.get('productName')
            product.description = request.form.get('description')
            product.price = float(request.form.get('price'))
            product.amount = int(request.form.get('amount'))
            
            # Update size ratio
            number_x = request.form.get('number_x', '1')
            number_y = request.form.get('number_y', '1')
            product.size = f"{number_x}:{number_y}"
            
            # Update categories
            selected_categories = request.form.getlist('category[]')
            product.categories = Category.query.filter(Category.c_id.in_(selected_categories)).all()
            
            # Handle image upload if provided
            if 'image' in request.files:
                file = request.files['image']
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    product.image = filename

            db.session.commit()
            return jsonify({'success': True, 'message': 'Product updated successfully'})
            
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)})
    
    return jsonify({'success': False, 'message': 'Invalid request method'})

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'message': 'Bad request'
    }), 400

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully!")
            init_roles()
        except Exception as e:
            print(f"Error creating database tables: {e}")
    
    print("🚀 Starting EchoArty API Server...")
    print("📡 This server handles database operations and API endpoints")
    print("🔗 Frontend should connect to: http://localhost:5000/api")
    print("🌐 API will be available at: http://localhost:5000")
    
    # Run the API server
    app.run(debug=True, host='0.0.0.0', port=5000)