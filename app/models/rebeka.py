from app import db

class Rebeka(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cargo = db.Column(db.String(50))
    nome = db.Column(db.String(50))
    modalidade = db.Column(db.String(50))
    salario = db.Column(db.Float)
    cpf = db.Column(db.String(20))
    rg = db.Column(db.String(20))
    endereco = db.Column(db.String(100))
    bairro = db.Column(db.String(50))
    cidade = db.Column(db.String(50))
    cep = db.Column(db.String(20))
    banco = db.Column(db.String(50))
    pix = db.Column(db.String(100))
    data_pagamento = db.Column(db.Date)

class Promotores(db.Model):
    __bind_key__ = 'rebeka'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100))
    lojas = db.Column(db.String(100))