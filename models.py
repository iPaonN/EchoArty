from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone, timedelta

db = SQLAlchemy()

# Thai timezone (UTC+7)
THAI_TZ = timezone(timedelta(hours=7))

def get_thai_time():
    """Get current time in Thai timezone"""
    return datetime.now(THAI_TZ)

# Define your database models here
class Role(db.Model):
    __tablename__ = 'roles'
    role_id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(50), unique=True, nullable=False)
    
    def __repr__(self):
        return f'<Role {self.role_name}>'

class User(db.Model):
    __tablename__ = 'users'  # Explicitly set table name
    u_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id'), nullable=False, default=1)  # Default to regular user
    created_at = db.Column(db.DateTime, nullable=True)
    
    # Relationship to Role
    role = db.relationship('Role', backref=db.backref('users', lazy=True))

    def __repr__(self):
        return f'<User {self.username}>'

class UserInfo(db.Model):
    __tablename__ = 'user_info'  # Explicitly set table name
    u_id = db.Column(db.Integer, db.ForeignKey('users.u_id'), primary_key=True, nullable=False)
    firstname = db.Column(db.String(80), nullable=False)
    lastname = db.Column(db.String(80), nullable=False)
    street_address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    telephone = db.Column(db.String(20), nullable=False)

    user = db.relationship('User', backref=db.backref('info', uselist=False))

    def __repr__(self):
        return f'<UserInfo {self.firstname} {self.lastname}>'

class OrderStatus(db.Model):
    __tablename__ = 'order_statuses'
    s_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    
    def __repr__(self):
        return f'<OrderStatus {self.name}>'

class Category(db.Model):
    __tablename__ = 'categories'
    c_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    
    def __repr__(self):
        return f'<Category {self.name}>'

# Many-to-Many relationship table
product_categories = db.Table('product_categories',
    db.Column('p_id', db.Integer, db.ForeignKey('products.p_id'), primary_key=True),
    db.Column('c_id', db.Integer, db.ForeignKey('categories.c_id'), primary_key=True)
)

class Product(db.Model):
    __tablename__ = 'products'
    p_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    image = db.Column(db.String(255), nullable=True)
    size = db.Column(db.String(50), nullable=True, default='1:1')
    created_at = db.Column(db.DateTime, nullable=True, default=get_thai_time)
    updated_at = db.Column(db.DateTime, nullable=True, default=get_thai_time, onupdate=get_thai_time)
    
    # Many-to-Many relationship to Category
    categories = db.relationship('Category', secondary=product_categories, 
                                backref=db.backref('products', lazy='dynamic'))
    
    def to_dict(self):
        """Convert product to dictionary"""
        return {
            'p_id': self.p_id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price) if self.price else 0,
            'categories': [{'c_id': cat.c_id, 'name': cat.name} for cat in self.categories],
            'image': self.image,
            'size': self.size or '1:1',
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Product {self.name}>'

class Order(db.Model):
    __tablename__ = 'orders'
    order_id = db.Column(db.Integer, primary_key=True)
    u_id = db.Column(db.Integer, db.ForeignKey('users.u_id'), nullable=False)
    p_id = db.Column(db.Integer, db.ForeignKey('products.p_id'), nullable=False)
    order_date = db.Column(db.DateTime, nullable=False, default=get_thai_time)
    quantity = db.Column(db.Integer, nullable=False, default=1)  # จำนวนสินค้า
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)  # ราคารวม
    status_id = db.Column(db.Integer, db.ForeignKey('order_statuses.s_id'), nullable=False, default=1)
    shipping_address = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=True)
    img = db.Column(db.String(255), nullable=True)
    bill_img = db.Column(db.String(255), nullable=True)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('orders', lazy=True))
    product = db.relationship('Product', backref=db.backref('orders', lazy=True))
    status = db.relationship('OrderStatus', backref=db.backref('orders', lazy=True))
    
    def to_dict(self):
        """Convert order to dictionary"""
        return {
            'order_id': self.order_id,
            'u_id': self.u_id,
            'username': self.user.username if self.user else None,
            'customer_name': f"{self.user.info.firstname} {self.user.info.lastname}" if self.user and self.user.info else None,
            'p_id': self.p_id,
            'product_name': self.product.name if self.product else None,
            'product_image': self.product.image if self.product else None,
            'order_date': self.order_date.strftime('%Y-%m-%d %H:%M:%S') if self.order_date else None,
            'quantity': self.quantity,
            'total_amount': float(self.total_amount),
            'status_id': self.status_id,
            'status_name': self.status.name if self.status else None,
            'shipping_address': self.shipping_address,
            'description': self.description,
            'img': self.img,
            'bill_img': self.bill_img
        }
    
    def __repr__(self):
        return f'<Order {self.order_id}>'
