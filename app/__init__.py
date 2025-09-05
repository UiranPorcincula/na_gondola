from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import logging
from urllib.parse import quote_plus

# Initialize SQLAlchemy
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # Import configuration
    app.config.from_object('app.config.Config')
    
    # Configure logging
    logging.basicConfig(
        filename='log.log',
        level=logging.DEBUG,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Initialize extensions
    db.init_app(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)
    
    from app.routes.pdv import pdv_bp
    app.register_blueprint(pdv_bp)
    
    from app.routes.ponto import ponto_bp
    app.register_blueprint(ponto_bp)
    
    from app.routes.lojas import lojas_bp
    app.register_blueprint(lojas_bp)
    
    from app.routes.notas import notas_bp
    app.register_blueprint(notas_bp)
    
    from app.routes.sku import sku_bp
    app.register_blueprint(sku_bp)
    
    from app.routes.users import users_bp
    app.register_blueprint(users_bp)
    
    # Register custom template filters
    from app.utils.formatters import format_price, format_value
    app.jinja_env.filters['price'] = format_price
    app.jinja_env.filters['format_value'] = format_value
    
    # Register context processors
    from app.utils.context_processors import utility_processor
    app.context_processor(utility_processor)
    
    return app