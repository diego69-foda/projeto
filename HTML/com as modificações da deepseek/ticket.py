from flask import Blueprint, jsonify, request
from src.models.user import db, Ticket, Service, TicketComment, User, Company, Notification
from flask_login import login_required, current_user
import datetime

ticket_bp = Blueprint('ticket', __name__)

@ticket_bp.route('/tickets', methods=['GET'])
@login_required
def get_tickets():
    status = request.args.get('status')
    priority = request.args.get('priority')
    company_from = request.args.get('company_from')
    company_to = request.args.get('company_to')
    service_id = request.args.get('service_id')
    assigned_to = request.args.get('assigned_to')
    
    query = Ticket.query
    
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
    if assigned_to:
        query = query.join(Ticket.assigned_users).filter(User.id == assigned_to)
    
    if not current_user.is_admin:
        query = query.filter((Ticket.company_from_id == current_user.company_id) | 
                          (Ticket.company_to_id == current_user.company_id) |
                          (Ticket.assigned_users.any(id=current_user.id)))
    
    tickets = query.order_by(Ticket.created_at.desc()).all()
    return jsonify([ticket.to_dict() for ticket in tickets])

@ticket_bp.route('/tickets/<int:ticket_id>/assign', methods=['POST'])
@login_required
def assign_ticket_users(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    
    if not current_user.is_admin and current_user.id != ticket.creator_id:
        return jsonify({'error': 'Acesso negado'}), 403
    
    data = request.json
    user_ids = data.get('user_ids', [])
    users = User.query.filter(User.id.in_(user_ids)).all()
    
    ticket.assigned_users = users
    
    for user in users:
        notification = Notification(
            message=f"Você foi atribuído ao ticket #{ticket.id} - {ticket.title}",
            user_id=user.id,
            ticket_id=ticket.id
        )
        db.session.add(notification)
    
    db.session.commit()
    return jsonify({'success': True, 'assigned_users': [user.to_dict() for user in users]})

@ticket_bp.route('/notifications', methods=['GET'])
@login_required
def get_user_notifications():
    notifications = Notification.query.filter_by(
        user_id=current_user.id
    ).order_by(
        Notification.is_read,
        Notification.created_at.desc()
    ).all()
    
    return jsonify([{
        'id': n.id,
        'message': n.message,
        'is_read': n.is_read,
        'created_at': n.created_at.isoformat(),
        'ticket_id': n.ticket_id
    } for n in notifications])

@ticket_bp.route('/notifications/<int:notification_id>/read', methods=['PUT'])
@login_required
def mark_notification_read(notification_id):
    notification = Notification.query.get_or_404(notification_id)
    
    if notification.user_id != current_user.id:
        return jsonify({'error': 'Acesso negado'}), 403
    
    notification.is_read = True
    db.session.commit()
    return jsonify({'success': True})

@ticket_bp.route('/notifications/read_all', methods=['PUT'])
@login_required
def mark_all_notifications_read():
    Notification.query.filter_by(
        user_id=current_user.id,
        is_read=False
    ).update({'is_read': True})
    
    db.session.commit()
    return jsonify({'success': True})

# ... (mantenha todas as outras rotas existentes sem alteração) ...