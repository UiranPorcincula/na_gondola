from app import db

class Login(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cpf = db.Column(db.String(20), unique=True)
    username = db.Column(db.String(20), unique=True)
    password = db.Column(db.String(50))
    perfil = db.Column(db.String(20))