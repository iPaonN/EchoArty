from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

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
    
class Product(db.Model):
    __tablename__ = 'products'
    # ... (attributes p_id, name, description, size, price, image, created_at, updated_at) ...
    p_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    size = db.Column(db.String(50), nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    image = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # เพิ่ม Relationship สำหรับ Many-to-Many
    categories = db.relationship(
        'Category',
        secondary='product_categories', # ใช้ตารางกลาง 'product_categories'
        backref=db.backref('products', lazy='dynamic')
    )

    def to_dict(self):
        """แปลงข้อมูล Product object เป็น dictionary พร้อมเพิ่ม categories"""
        return {
            'p_id': self.p_id,
            'name': self.name,
            'description': self.description,
            'size': self.size,
            'price': float(self.price),
            'image': self.image,
            # ดึงข้อมูล categories ออกมาเป็น list ของ dict
            'categories': [cat.to_dict() for cat in self.categories],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class Category(db.Model):
    __tablename__ = 'categories'
    c_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    
    def to_dict(self):
        return {
            'c_id': self.c_id,
            'name': self.name
        }

    def __repr__(self):
        return f'<Category {self.name}>'
    
class ProductCategory(db.Model):
    __tablename__ = 'product_categories'
    
    # กำหนด Primary Key Composite (p_id, c_id)
    p_id = db.Column(db.Integer, db.ForeignKey('products.p_id'), primary_key=True)
    c_id = db.Column(db.Integer, db.ForeignKey('categories.c_id'), primary_key=True)

    def __repr__(self):
        return f'<ProductCategory p_id={self.p_id}, c_id={self.c_id}>'
