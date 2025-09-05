import os
from urllib.parse import quote_plus

class Config:
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'secret_key')
    MAX_CONTENT_LENGTH = 200 * 1024 * 1024  # 200 MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    # Defina SERVER_NAME conforme o ambiente
    SERVER_NAME = os.environ.get('SERVER_NAME', None)  # None significa sem restrição, bom para dev

    # Database settings
    USUARIO = os.environ.get('DB_USER', 'suatrade')
    SENHA = os.environ.get('DB_PASS', 'anorMa29@')
    NOME_BANCO = os.environ.get('DB_NAME', 'suatrade')
    HOST = os.environ.get('DB_HOST', '177.153.51.186')
    PORTA = os.environ.get('DB_PORT', '3306')

    SENHA_CODIFICADA = quote_plus(SENHA)

    SQLALCHEMY_DATABASE_URI = f'mysql+mysqlconnector://{USUARIO}:{SENHA_CODIFICADA}@{HOST}:{PORTA}/{NOME_BANCO}'
    SQLALCHEMY_BINDS = {
        'suatrade': f'mysql+mysqlconnector://{USUARIO}:{SENHA_CODIFICADA}@{HOST}:{PORTA}/{NOME_BANCO}'
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False