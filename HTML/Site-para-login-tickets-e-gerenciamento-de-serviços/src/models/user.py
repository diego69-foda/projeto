from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relacionamento com a empresa
    company = db.relationship('Company', backref=db.backref('users', lazy=True))
    
    # Tickets criados pelo usuário
    tickets_created = db.relationship('Ticket', backref='creator', lazy=True, foreign_keys='Ticket.creator_id')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'company': self.company.name if self.company else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Tickets relacionados à empresa (como origem ou destino)
    tickets_from = db.relationship('Ticket', backref='company_from', lazy=True, foreign_keys='Ticket.company_from_id')
    tickets_to = db.relationship('Ticket', backref='company_to', lazy=True, foreign_keys='Ticket.company_to_id')
    
    def __repr__(self):
        return f'<Company {self.name}>'
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='aberto')  # aberto, em_andamento, pendente, resolvido, fechado
    priority = db.Column(db.String(20), default='normal')  # baixa, normal, alta, urgente
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    deadline = db.Column(db.DateTime, nullable=True)
    
    # Relacionamentos
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    company_from_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    company_to_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    
    # Serviço relacionado
    service = db.relationship('Service', backref=db.backref('tickets', lazy=True))
    
    # Comentários no ticket
    comments = db.relationship('TicketComment', backref='ticket', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Ticket {self.id}: {self.title}>'
        
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'creator': self.creator.username,
            'company_from': self.company_from.name,
            'company_to': self.company_to.name,
            'service': self.service.name
        }
        
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=True)
    sla_hours = db.Column(db.Integer, nullable=True)  # Tempo de SLA em horas
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f'<Service {self.name}>'
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'sla_hours': self.sla_hours,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
class TicketComment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relacionamentos
    ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Usuário que fez o comentário
    user = db.relationship('User', backref=db.backref('comments', lazy=True))
    
    def __repr__(self):
        return f'<Comment {self.id} on Ticket {self.ticket_id}>'
        
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'ticket_id': self.ticket_id,
            'user': self.user.username
        }
