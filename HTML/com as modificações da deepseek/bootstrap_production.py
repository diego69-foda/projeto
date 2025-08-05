import os
import sys
from flask import Flask, jsonify, request
from werkzeug.security import generate_password_hash
import datetime

# Configuração do Flask
app = Flask(__name__)

# Configuração do banco de dados
from flask_sqlalchemy import SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:password@localhost:3306/mydb"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Modelos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# Criar tabelas
with app.app_context():
    db.create_all()
    
    # Verificar se já existem empresas
    empresa_a = Company.query.filter_by(name='Empresa A').first()
    if not empresa_a:
        empresa_a = Company(name='Empresa A', description='Empresa de origem padrão')
        db.session.add(empresa_a)
        print('Empresa A criada')
    else:
        print('Empresa A já existe')
        
    empresa_b = Company.query.filter_by(name='Empresa B').first()
    if not empresa_b:
        empresa_b = Company(name='Empresa B', description='Empresa de destino padrão')
        db.session.add(empresa_b)
        print('Empresa B criada')
    else:
        print('Empresa B já existe')
    
    db.session.commit()
    
    # Criar usuário administrador
    admin_email = 'admin@sistema.com'
    admin_user = User.query.filter_by(email=admin_email).first()
    
    if not admin_user:
        admin = User(
            username='administrador',
            email=admin_email,
            is_admin=True,
            company_id=empresa_a.id,
            password_hash=generate_password_hash('admin123')
        )
        db.session.add(admin)
        db.session.commit()
        print('Usuário administrador criado')
    else:
        print('Usuário administrador já existe')
        
    # Imprimir informações para verificação
    print('\nEmpresas disponíveis:')
    for company in Company.query.all():
        print(f'ID: {company.id}, Nome: {company.name}')
        
    print('\nUsuários disponíveis:')
    for user in User.query.all():
        print(f'ID: {user.id}, Nome: {user.username}, Email: {user.email}, Admin: {user.is_admin}')

print("Script de bootstrap concluído com sucesso!")
