import os
from urllib.parse import quote_plus

class Config:
    # Flask settings
    SECRET_KEY = 'secret_key'
    MAX_CONTENT_LENGTH = 200 * 1024 * 1024  # 200 MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    SERVER_NAME = "epdv.vps-kinghost.net"
    
    # Database settings
    USUARIO = 'suatrade'
    SENHA = 'anorMa29@'
    NOME_BANCO = 'suatrade'
    HOST = '177.153.51.186'
    PORTA = '3306'
    
    SENHA_CODIFICADA = quote_plus(SENHA)
    
    SQLALCHEMY_DATABASE_URI = f'mysql+mysqlconnector://{USUARIO}:{SENHA_CODIFICADA}@{HOST}:{PORTA}/{NOME_BANCO}'
    SQLALCHEMY_BINDS = {'suatrade': f'mysql+mysqlconnector://{USUARIO}:{SENHA_CODIFICADA}@{HOST}:{PORTA}/{NOME_BANCO}'}
    SQLALCHEMY_TRACK_MODIFICATIONS = False