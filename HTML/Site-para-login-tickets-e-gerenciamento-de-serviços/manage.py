import os
import click
from flask.cli import with_appcontext
from src import create_app
from src.models.user import db, Company, User
from werkzeug.security import generate_password_hash

# Cria a aplicação usando a factory
app = create_app(os.getenv('FLASK_ENV', 'development'))

@click.group()
def cli():
    """Comandos de gerenciamento da aplicação."""
    pass

@click.command('db_init')
@with_appcontext
def db_init_command():
    """
    Inicializa o banco de dados com dados essenciais.
    Cria a empresa principal 'T1 Telecom' e um usuário 'admin'.
    """
    click.echo("Iniciando o bootstrap do banco de dados...")
    
    try:
        # Criar todas as tabelas
        db.create_all()
        click.echo("Tabelas criadas (se não existiam).")

        # Criar empresa T1 Telecom
        company_name = 'T1 Telecom'
        if not Company.query.filter_by(name=company_name).first():
            t1_company = Company(
                name=company_name,
                description='Empresa principal do sistema de tickets'
            )
            db.session.add(t1_company)
            db.session.commit()
            click.echo(f"Empresa '{company_name}' criada com sucesso.")
        else:
            t1_company = Company.query.filter_by(name=company_name).first()
            click.echo(f"Empresa '{company_name}' já existe.")

        # Criar empresa cliente para testes
        client_company_name = 'Empresa Cliente'
        if not Company.query.filter_by(name=client_company_name).first():
            client_company = Company(
                name=client_company_name,
                description='Empresa cliente para demonstração e testes'
            )
            db.session.add(client_company)
            click.echo(f"Empresa '{client_company_name}' criada com sucesso.")
        else:
            click.echo(f"Empresa '{client_company_name}' já existe.")

        # Criar usuário administrador
        admin_email = 'admin@t1telecom.com'
        if not User.query.filter_by(email=admin_email).first():
            admin_user = User(
                username='admin',
                email=admin_email,
                is_admin=True,
                company_id=t1_company.id,
            )
            admin_user.set_password('admin123') # Lembre-se de usar uma senha forte em produção
            db.session.add(admin_user)
            click.echo(f"Usuário administrador '{admin_email}' criado com sucesso.")
        else:
            click.echo(f"Usuário administrador '{admin_email}' já existe.")
        
        db.session.commit()
        click.secho("Bootstrap concluído com sucesso!", fg='green')

    except Exception as e:
        db.session.rollback()
        click.secho(f"Erro durante o bootstrap: {e}", fg='red')

# Adiciona o comando ao grupo de CLI
cli.add_command(db_init_command)

if __name__ == '__main__':
    cli()