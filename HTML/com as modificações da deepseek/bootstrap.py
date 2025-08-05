from flask import Blueprint, jsonify, request
from src.models.user import db, Company, User
from werkzeug.security import generate_password_hash
import datetime
import os

bootstrap_bp = Blueprint('bootstrap', __name__)

# Chave secreta para autorizar o bootstrap (normalmente seria um valor mais seguro)
BOOTSTRAP_KEY = "t1telecom_setup_2025"

@bootstrap_bp.route('/bootstrap/setup', methods=['POST'])
def bootstrap_setup():
    # Verificar chave de autorização
    data = request.json
    if not data or data.get('key') != BOOTSTRAP_KEY:
        return jsonify({'error': 'Acesso não autorizado'}), 403
    
    try:
        # Criar empresa T1 Telecom
        company_name = data.get('company_name', 'T1 Telecom')
        company_desc = data.get('company_description', 'Empresa de telecomunicações')
        
        existing_company = Company.query.filter_by(name=company_name).first()
        if existing_company:
            return jsonify({'message': f'Empresa {company_name} já existe', 'company_id': existing_company.id}), 200
        
        new_company = Company(
            name=company_name,
            description=company_desc,
            created_at=datetime.datetime.utcnow()
        )
        db.session.add(new_company)
        db.session.commit()
        
        # Criar empresa secundária para testes
        second_company = Company.query.filter_by(name='Empresa Cliente').first()
        if not second_company:
            second_company = Company(
                name='Empresa Cliente',
                description='Empresa cliente para testes',
                created_at=datetime.datetime.utcnow()
            )
            db.session.add(second_company)
            db.session.commit()
        
        # Criar usuário administrador se solicitado
        admin_user = None
        if data.get('create_admin', True):
            admin_username = data.get('admin_username', 'admin')
            admin_email = data.get('admin_email', 'admin@t1telecom.com')
            admin_password = data.get('admin_password', 'admin123')
            
            existing_admin = User.query.filter_by(email=admin_email).first()
            if not existing_admin:
                admin_user = User(
                    username=admin_username,
                    email=admin_email,
                    is_admin=True,
                    company_id=new_company.id,
                    created_at=datetime.datetime.utcnow()
                )
                admin_user.password_hash = generate_password_hash(admin_password)
                db.session.add(admin_user)
                db.session.commit()
                
                admin_info = {
                    'id': admin_user.id,
                    'username': admin_user.username,
                    'email': admin_user.email
                }
            else:
                admin_info = {
                    'id': existing_admin.id,
                    'username': existing_admin.username,
                    'email': existing_admin.email,
                    'message': 'Usuário administrador já existe'
                }
        else:
            admin_info = None
        
        return jsonify({
            'success': True,
            'message': f'Bootstrap concluído com sucesso. Empresa {company_name} criada.',
            'company': {
                'id': new_company.id,
                'name': new_company.name
            },
            'admin_user': admin_info
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro durante o bootstrap: {str(e)}'}), 500

@bootstrap_bp.route('/bootstrap/status', methods=['GET'])
def bootstrap_status():
    companies_count = Company.query.count()
    users_count = User.query.count()
    
    companies = [{
        'id': company.id,
        'name': company.name
    } for company in Company.query.all()]
    
    return jsonify({
        'status': 'Sistema inicializado' if companies_count > 0 else 'Sistema não inicializado',
        'companies_count': companies_count,
        'users_count': users_count,
        'companies': companies
    })
