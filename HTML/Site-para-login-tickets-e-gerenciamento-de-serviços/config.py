import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

class Config:
    """Configurações base da aplicação."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'uma-chave-secreta-padrao-muito-forte')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    """Configurações para ambiente de desenvolvimento."""
    DEBUG = True
    DB_USERNAME = os.environ.get('DEV_DB_USERNAME', 'root')
    DB_PASSWORD = os.environ.get('DEV_DB_PASSWORD', 'password')
    DB_HOST = os.environ.get('DEV_DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DEV_DB_PORT', '3306')
    DB_NAME = os.environ.get('DEV_DB_NAME', 'banco_T1_dev') # Banco de desenvolvimento
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

class ProductionConfig(Config):
    """Configurações para ambiente de produção."""
    DEBUG = False
    DB_USERNAME = os.environ.get('PROD_DB_USERNAME')
    DB_PASSWORD = os.environ.get('PROD_DB_PASSWORD')
    DB_HOST = os.environ.get('PROD_DB_HOST')
    DB_PORT = os.environ.get('PROD_DB_PORT')
    DB_NAME = os.environ.get('PROD_DB_NAME', 'banco_T1') # Banco de produção
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Mapeamento para facilitar a seleção da configuração
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}