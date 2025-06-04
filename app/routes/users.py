from flask import Blueprint, request, render_template, redirect, url_for
from app import db
from app.models.login import Login

users_bp = Blueprint('users', __name__)

@users_bp.route('/usuarios')
def usuarios():
    todos = Login.query.order_by(Login.username.asc()).all()
    return render_template('usuarios.html', usuarios=todos)

@users_bp.route('/usuarios/adicionar', methods=['POST'])
def adicionar_usuario():
    novo = Login(
        username=request.form['username'],
        password=request.form['password'],
        cpf=request.form['cpf'],
        perfil=request.form['perfil']
    )
    db.session.add(novo)
    db.session.commit()
    return redirect(url_for('users.usuarios'))

@users_bp.route('/usuarios/editar/<int:id>', methods=['POST'])
def editar_usuario(id):
    usuario = Login.query.get_or_404(id)
    usuario.username = request.form['username']
    usuario.password = request.form['password']
    usuario.cpf = request.form['cpf']
    usuario.perfil = request.form['perfil']
    db.session.commit()
    return redirect(url_for('users.usuarios'))

@users_bp.route('/usuarios/excluir/<int:id>', methods=['POST'])
def excluir_usuario(id):
    usuario = Login.query.get_or_404(id)
    db.session.delete(usuario)
    db.session.commit()
    return redirect(url_for('users.usuarios'))