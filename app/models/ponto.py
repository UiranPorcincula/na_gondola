from app import db
from datetime import datetime

class RegistroPonto(db.Model):
    __tablename__ = 'registro_ponto'

    id = db.Column(db.Integer, primary_key=True)
    promotor_id = db.Column(db.Integer, nullable=False)
    entrada = db.Column(db.DateTime, nullable=True)
    inicio_almoco = db.Column(db.DateTime, nullable=True)
    fim_almoco = db.Column(db.DateTime, nullable=True)
    saida = db.Column(db.DateTime, nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_clique = db.Column(db.String(20), nullable=True)

    def __repr__(self):
        return f'<RegistroPonto {self.id}, Promotor {self.promotor_id}>'