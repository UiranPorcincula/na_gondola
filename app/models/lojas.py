from app import db

class Lojas(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    funcionario = db.Column(db.String(50))
    loja = db.Column(db.String(50))
    cidade = db.Column(db.String(50))
    endereco = db.Column(db.String(100))
    regiao = db.Column(db.String(50))
    bairro = db.Column(db.String(50))

class Lojastotal(db.Model):
    id = db.Column(db.Integer, primary_key=True)    
    codigo_loja = db.Column(db.String(50), nullable=False)
    nome_loja = db.Column(db.String(100), nullable=False)
    cidade = db.Column(db.String(50), nullable=False)
    endereco = db.Column(db.String(100), nullable=False)
    
class TotalLojas(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    promotor = db.Column(db.String(512), nullable=False)
    rede = db.Column(db.String(512), nullable=False)
    loja = db.Column(db.String(512), nullable=False)
    endereco = db.Column(db.String(512), nullable=False)
    cidade = db.Column(db.String(512), nullable=False)
    estado = db.Column(db.String(512), nullable=False)
    dia_visita = db.Column(db.String(512), nullable=False)
    coordenada = db.Column(db.String(255), nullable=False)
    
class Roteiros(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    funcionario = db.Column(db.String(20))
    dia_semana = db.Column(db.String(20))
    lojas = db.Column(db.String(20))
    cidade = db.Column(db.String(20))
    regiao = db.Column(db.String(20))
    
class RedesLojas(db.Model):
    __tablename__ = 'redes_lojas'
    
    promotor = db.Column(db.String(100), primary_key=True)
    cliente1 = db.Column(db.String(255))
    cliente2 = db.Column(db.String(255))
    cliente3 = db.Column(db.String(255))
    cliente4 = db.Column(db.String(255))
    cliente5 = db.Column(db.String(255))
    cliente6 = db.Column(db.String(255))
    cliente7 = db.Column(db.String(255))
    cliente8 = db.Column(db.String(255))
    cliente9 = db.Column(db.String(255))
    cliente10 = db.Column(db.String(255))   
    promotor_id = db.Column(db.Integer, db.ForeignKey('login.id'))
    promotor_relacao = db.relationship('Login', backref='redes_lojas')
    rede = db.Column(db.String(100))
    loja = db.Column(db.String(100))