from flask_sqlalchemy import SQLAlchemy

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
