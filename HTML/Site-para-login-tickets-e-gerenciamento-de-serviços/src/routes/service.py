from flask import Blueprint, jsonify, request
from src.models.user import db, Service
from flask_login import login_required, current_user

service_bp = Blueprint('service', __name__)

# Rotas para gerenciamento de serviços
@service_bp.route('/services', methods=['GET'])
@login_required
def get_services():
    # Filtros opcionais
    category = request.args.get('category')
    
    # Construir query base
    query = Service.query
    
    # Aplicar filtros se fornecidos
    if category:
        query = query.filter(Service.category == category)
    
    # Ordenar por nome
    services = query.order_by(Service.name).all()
    
    return jsonify([service.to_dict() for service in services])

@service_bp.route('/services/categories', methods=['GET'])
@login_required
def get_service_categories():
    # Obter categorias únicas de serviços
    categories = db.session.query(Service.category).distinct().all()
    # Filtrar None e converter para lista
    categories = [cat[0] for cat in categories if cat[0]]
    
    return jsonify(categories)

@service_bp.route('/services', methods=['POST'])
@login_required
def create_service():
    # Apenas admins podem criar serviços
    if not current_user.is_admin:
        return jsonify({'error': 'Acesso negado'}), 403
        
    data = request.json
    
    # Verificar se já existe serviço com o mesmo nome
    if Service.query.filter_by(name=data['name']).first():
        return jsonify({'error': 'Já existe um serviço com este nome'}), 400
        
    service = Service(
        name=data['name'],
        description=data.get('description', ''),
        category=data.get('category'),
        sla_hours=data.get('sla_hours')
    )
    
    db.session.add(service)
    db.session.commit()
    
    return jsonify(service.to_dict()), 201

@service_bp.route('/services/<int:service_id>', methods=['GET'])
@login_required
def get_service(service_id):
    service = Service.query.get_or_404(service_id)
    return jsonify(service.to_dict())

@service_bp.route('/services/<int:service_id>', methods=['PUT'])
@login_required
def update_service(service_id):
    # Apenas admins podem atualizar serviços
    if not current_user.is_admin:
        return jsonify({'error': 'Acesso negado'}), 403
        
    service = Service.query.get_or_404(service_id)
    data = request.json
    
    if 'name' in data:
        # Verificar se já existe serviço com o mesmo nome
        existing_service = Service.query.filter_by(name=data['name']).first()
        if existing_service and existing_service.id != service_id:
            return jsonify({'error': 'Já existe um serviço com este nome'}), 400
        service.name = data['name']
        
    if 'description' in data:
        service.description = data['description']
        
    if 'category' in data:
        service.category = data['category']
        
    if 'sla_hours' in data:
        service.sla_hours = data['sla_hours']
        
    db.session.commit()
    return jsonify(service.to_dict())

@service_bp.route('/services/<int:service_id>', methods=['DELETE'])
@login_required
def delete_service(service_id):
    # Apenas admins podem excluir serviços
    if not current_user.is_admin:
        return jsonify({'error': 'Acesso negado'}), 403
        
    service = Service.query.get_or_404(service_id)
    
    # Verificar se há tickets vinculados ao serviço
    if service.tickets:
        return jsonify({'error': 'Não é possível excluir serviço com tickets vinculados'}), 400
        
    db.session.delete(service)
    db.session.commit()
    
    return '', 204

# Rotas para estatísticas de serviços
@service_bp.route('/services/stats', methods=['GET'])
@login_required
def get_service_stats():
    # Total de serviços
    total_services = Service.query.count()
    
    # Serviços por categoria
    categories = db.session.query(Service.category, db.func.count(Service.id)).group_by(Service.category).all()
    categories_dict = {cat[0] if cat[0] else 'Sem categoria': cat[1] for cat in categories}
    
    # Serviços mais utilizados (com mais tickets)
    top_services = db.session.query(
        Service.id, 
        Service.name, 
        db.func.count(Service.id).label('ticket_count')
    ).join(Service.tickets).group_by(Service.id).order_by(db.desc('ticket_count')).limit(5).all()
    
    top_services_list = [{'id': s[0], 'name': s[1], 'ticket_count': s[2]} for s in top_services]
    
    return jsonify({
        'total': total_services,
        'by_category': categories_dict,
        'top_services': top_services_list
    })
