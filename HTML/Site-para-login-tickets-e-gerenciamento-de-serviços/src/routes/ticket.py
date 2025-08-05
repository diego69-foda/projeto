from flask import Blueprint, jsonify, request
from src.models.user import db, Ticket, Service, TicketComment, User, Company
from flask_login import login_required, current_user
import datetime

ticket_bp = Blueprint('ticket', __name__)

# Rotas para gerenciamento de tickets
@ticket_bp.route('/tickets', methods=['GET'])
@login_required
def get_tickets():
    # Filtros opcionais
    status = request.args.get('status')
    priority = request.args.get('priority')
    company_from = request.args.get('company_from')
    company_to = request.args.get('company_to')
    service_id = request.args.get('service_id')
    
    # Construir query base
    query = Ticket.query
    
    # Aplicar filtros se fornecidos
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if company_from:
        query = query.filter(Ticket.company_from_id == company_from)
    if company_to:
        query = query.filter(Ticket.company_to_id == company_to)
    if service_id:
        query = query.filter(Ticket.service_id == service_id)
    
    # Restrição por empresa do usuário (exceto para admins)
    if not current_user.is_admin:
        # Usuários normais só veem tickets da sua empresa (como origem ou destino)
        query = query.filter((Ticket.company_from_id == current_user.company_id) | 
                            (Ticket.company_to_id == current_user.company_id))
    
    # Ordenar por data de criação (mais recentes primeiro)
    tickets = query.order_by(Ticket.created_at.desc()).all()
    
    return jsonify([ticket.to_dict() for ticket in tickets])

@ticket_bp.route('/tickets', methods=['POST'])
@login_required
def create_ticket():
    data = request.json
    
    # Verificar se o serviço existe
    service = Service.query.get(data.get('service_id'))
    if not service:
        return jsonify({'error': 'Serviço não encontrado'}), 404
    
    # Verificar se as empresas existem
    company_from = Company.query.get(data.get('company_from_id'))
    if not company_from:
        return jsonify({'error': 'Empresa de origem não encontrada'}), 404
        
    company_to = Company.query.get(data.get('company_to_id'))
    if not company_to:
        return jsonify({'error': 'Empresa de destino não encontrada'}), 404
    
    # Verificar se o usuário pertence à empresa de origem (exceto admins)
    if not current_user.is_admin and current_user.company_id != company_from.id:
        return jsonify({'error': 'Você só pode criar tickets a partir da sua empresa'}), 403
    
    # Criar o ticket
    ticket = Ticket(
        title=data['title'],
        description=data['description'],
        status='aberto',
        priority=data.get('priority', 'normal'),
        creator_id=current_user.id,
        company_from_id=company_from.id,
        company_to_id=company_to.id,
        service_id=service.id
    )
    
    # Adicionar deadline se fornecido
    if 'deadline' in data and data['deadline']:
        try:
            ticket.deadline = datetime.datetime.fromisoformat(data['deadline'])
        except ValueError:
            return jsonify({'error': 'Formato de data inválido para deadline'}), 400
    
    db.session.add(ticket)
    db.session.commit()
    
    return jsonify(ticket.to_dict()), 201

@ticket_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
@login_required
def get_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    
    # Verificar permissão (admin ou usuário da empresa origem/destino)
    if not current_user.is_admin and current_user.company_id not in [ticket.company_from_id, ticket.company_to_id]:
        return jsonify({'error': 'Acesso negado'}), 403
    
    return jsonify(ticket.to_dict())

@ticket_bp.route('/tickets/<int:ticket_id>', methods=['PUT'])
@login_required
def update_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.json
    
    # Verificar permissão (admin ou usuário da empresa origem/destino)
    if not current_user.is_admin and current_user.company_id not in [ticket.company_from_id, ticket.company_to_id]:
        return jsonify({'error': 'Acesso negado'}), 403
    
    # Atualizar campos básicos
    if 'title' in data:
        ticket.title = data['title']
    if 'description' in data:
        ticket.description = data['description']
    if 'priority' in data:
        ticket.priority = data['priority']
    if 'status' in data:
        ticket.status = data['status']
    if 'deadline' in data and data['deadline']:
        try:
            ticket.deadline = datetime.datetime.fromisoformat(data['deadline'])
        except ValueError:
            return jsonify({'error': 'Formato de data inválido para deadline'}), 400
    
    # Campos que só admin pode alterar
    if current_user.is_admin:
        if 'service_id' in data:
            service = Service.query.get(data['service_id'])
            if not service:
                return jsonify({'error': 'Serviço não encontrado'}), 404
            ticket.service_id = data['service_id']
            
        if 'company_from_id' in data:
            company = Company.query.get(data['company_from_id'])
            if not company:
                return jsonify({'error': 'Empresa de origem não encontrada'}), 404
            ticket.company_from_id = data['company_from_id']
            
        if 'company_to_id' in data:
            company = Company.query.get(data['company_to_id'])
            if not company:
                return jsonify({'error': 'Empresa de destino não encontrada'}), 404
            ticket.company_to_id = data['company_to_id']
    
    db.session.commit()
    return jsonify(ticket.to_dict())

@ticket_bp.route('/tickets/<int:ticket_id>', methods=['DELETE'])
@login_required
def delete_ticket(ticket_id):
    # Apenas admins podem excluir tickets
    if not current_user.is_admin:
        return jsonify({'error': 'Acesso negado'}), 403
        
    ticket = Ticket.query.get_or_404(ticket_id)
    db.session.delete(ticket)
    db.session.commit()
    
    return '', 204

# Rotas para comentários em tickets
@ticket_bp.route('/tickets/<int:ticket_id>/comments', methods=['GET'])
@login_required
def get_ticket_comments(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    
    # Verificar permissão (admin ou usuário da empresa origem/destino)
    if not current_user.is_admin and current_user.company_id not in [ticket.company_from_id, ticket.company_to_id]:
        return jsonify({'error': 'Acesso negado'}), 403
    
    comments = TicketComment.query.filter_by(ticket_id=ticket_id).order_by(TicketComment.created_at).all()
    return jsonify([comment.to_dict() for comment in comments])

@ticket_bp.route('/tickets/<int:ticket_id>/comments', methods=['POST'])
@login_required
def add_ticket_comment(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    
    # Verificar permissão (admin ou usuário da empresa origem/destino)
    if not current_user.is_admin and current_user.company_id not in [ticket.company_from_id, ticket.company_to_id]:
        return jsonify({'error': 'Acesso negado'}), 403
    
    data = request.json
    
    comment = TicketComment(
        content=data['content'],
        ticket_id=ticket_id,
        user_id=current_user.id
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201

# Rotas para estatísticas de tickets
@ticket_bp.route('/tickets/stats', methods=['GET'])
@login_required
def get_ticket_stats():
    # Estatísticas básicas
    total_tickets = Ticket.query.count()
    open_tickets = Ticket.query.filter_by(status='aberto').count()
    in_progress_tickets = Ticket.query.filter_by(status='em_andamento').count()
    resolved_tickets = Ticket.query.filter_by(status='resolvido').count()
    closed_tickets = Ticket.query.filter_by(status='fechado').count()
    
    # Estatísticas por prioridade
    low_priority = Ticket.query.filter_by(priority='baixa').count()
    normal_priority = Ticket.query.filter_by(priority='normal').count()
    high_priority = Ticket.query.filter_by(priority='alta').count()
    urgent_priority = Ticket.query.filter_by(priority='urgente').count()
    
    # Se não for admin, filtrar por empresa do usuário
    if not current_user.is_admin and current_user.company_id:
        company_tickets = Ticket.query.filter(
            (Ticket.company_from_id == current_user.company_id) | 
            (Ticket.company_to_id == current_user.company_id)
        ).count()
        
        company_open = Ticket.query.filter(
            ((Ticket.company_from_id == current_user.company_id) | 
            (Ticket.company_to_id == current_user.company_id)) &
            (Ticket.status == 'aberto')
        ).count()
    else:
        company_tickets = None
        company_open = None
    
    return jsonify({
        'total': total_tickets,
        'by_status': {
            'aberto': open_tickets,
            'em_andamento': in_progress_tickets,
            'resolvido': resolved_tickets,
            'fechado': closed_tickets
        },
        'by_priority': {
            'baixa': low_priority,
            'normal': normal_priority,
            'alta': high_priority,
            'urgente': urgent_priority
        },
        'company': {
            'total': company_tickets,
            'aberto': company_open
        } if company_tickets is not None else None
    })
