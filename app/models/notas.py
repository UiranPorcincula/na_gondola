from app import db

class NotaFiscal(db.Model):
    __tablename__ = 'nota_fiscal'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    numero_nota = db.Column(db.String(50))
    usuario = db.Column(db.String(100))
    rede = db.Column(db.String(100))
    loja = db.Column(db.String(100))
    arquivo_pdf1 = db.Column(db.LargeBinary)
    arquivo_pdf2 = db.Column(db.LargeBinary)
    arquivo_pdf3 = db.Column(db.LargeBinary)
    arquivo_pdf4 = db.Column(db.LargeBinary)
    arquivo_pdf5 = db.Column(db.LargeBinary)
    arquivo_pdf6 = db.Column(db.LargeBinary)
    arquivo_pdf7 = db.Column(db.LargeBinary)
    arquivo_pdf8 = db.Column(db.LargeBinary)
    arquivo_pdf9 = db.Column(db.LargeBinary)
    arquivo_pdf10 = db.Column(db.LargeBinary)
    arquivo_pdf11 = db.Column(db.LargeBinary)
    arquivo_pdf12 = db.Column(db.LargeBinary)
    arquivo_pdf13 = db.Column(db.LargeBinary)
    arquivo_pdf14 = db.Column(db.LargeBinary)
    arquivo_pdf15 = db.Column(db.LargeBinary)
    arquivo_pdf16 = db.Column(db.LargeBinary)
    arquivo_pdf17 = db.Column(db.LargeBinary)
    arquivo_pdf18 = db.Column(db.LargeBinary)
    arquivo_pdf19 = db.Column(db.LargeBinary)
    arquivo_pdf20 = db.Column(db.LargeBinary)
    arquivo_pdf21 = db.Column(db.LargeBinary)
    arquivo_pdf22 = db.Column(db.LargeBinary)
    arquivo_pdf23 = db.Column(db.LargeBinary)
    arquivo_pdf24 = db.Column(db.LargeBinary)
    arquivo_pdf25 = db.Column(db.LargeBinary)
    arquivo_pdf26 = db.Column(db.LargeBinary)
    arquivo_pdf27 = db.Column(db.LargeBinary)
    arquivo_pdf28 = db.Column(db.LargeBinary)
    arquivo_pdf29 = db.Column(db.LargeBinary)
    arquivo_pdf30 = db.Column(db.LargeBinary)

    def __repr__(self):
        return f"<NotaFiscal(id={self.id}, numero_nota='{self.numero_nota}', usuario='{self.usuario}')>"