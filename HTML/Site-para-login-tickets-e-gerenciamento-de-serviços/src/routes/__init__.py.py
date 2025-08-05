import os
from flask import Flask, send_from_directory
from flask_login import LoginManager
from .models.user import db, User
from .routes.user import user_bp
from .routes.ticket import ticket_bp
from .routes.service import service_bp
from config import config_by_name

login_manager = LoginManager()

def create_app(config_name='development'):
    """Application Factory Function"""
    app = Flask(__name__,
                static_folder='static',
                template_folder='templates') # (ALTERADO) pastas explícitas

    # Carregar configuração
    config_obj = config_by_name[config_name]
    app.config.from_object(config_obj)

    # Inicializar extensões
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'user.login' # (ALTERADO) Aponta para o endpoint correto
    login_manager.session_protection = "strong"

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    with app.app_context():
        # Registrar blueprints
        app.register_blueprint(user_bp, url_prefix='/api/auth') # (ALTERADO) Rota mais específica
        app.register_blueprint(ticket_bp, url_prefix='/api/tickets')
        app.register_blueprint(service_bp, url_prefix='/api/services')
        
        # O blueprint de bootstrap foi removido em favor do comando CLI

        # Rota para servir a aplicação de página única (SPA)
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve(path):
            if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
                return send_from_directory(app.static_folder, path)
            else:
                return send_from_directory(app.template_folder, 'index.html')

        return app