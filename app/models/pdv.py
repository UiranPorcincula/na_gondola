from app import db
from datetime import datetime

class PDV(db.Model):
    __tablename__ = 'PDV'
    id = db.Column(db.Integer, primary_key=True)
    promotor = db.Column(db.String(50), nullable=False)
    loja = db.Column(db.String(50), nullable=False)
    local = db.Column(db.String(255))
    quantidade_pdv = db.Column(db.Integer, nullable=False)
    quantidade_estoque = db.Column(db.Integer, nullable=False)
    vencimento1 = db.Column(db.Date)
    vencimento2 = db.Column(db.Date)
    vencimento3 = db.Column(db.Date)
    vencimento4 = db.Column(db.Date)
    vencimento5 = db.Column(db.Date)
    cliente = db.Column(db.String(255))
    mensagem_dia = db.Column(db.String(255)) 
    redes = db.Column(db.String(255))
    data_de_envio = db.Column(db.Date)
    preco = db.Column(db.Float)
    sku = db.Column(db.String(100))
    
    
class PDVFoto(db.Model):
    __tablename__ = 'pdv_foto'
    id = db.Column(db.Integer, primary_key=True)
    pdv_id = db.Column(db.Integer, db.ForeignKey('PDV.id'), nullable=False)
    tipo = db.Column(db.String(10), nullable=False)  # "Antes" ou "Depois"
    foto = db.Column(db.LargeBinary(length=209715200))  # 200MB
    pdv = db.relationship('PDV', backref=db.backref('fotos', lazy=True))

class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cliente = db.Column(db.String(100), unique=True, nullable=False)
    skus = db.relationship('Sku', backref='cliente', lazy=True)

class Sku(db.Model):
    __tablename__ = 'sku'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    descricao = db.Column(db.String(200), nullable=False)
    foto = db.Column(db.LargeBinary(length=209715200))  # 200 MB

class Excel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.Text)