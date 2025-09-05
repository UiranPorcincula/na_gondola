from flask import Blueprint, request, render_template, flash, session, redirect, url_for
from app import db
from app.models.login import Login

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/')
def home():
    return render_template('login.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if 'cpf' in request.form:  # Parte de cadastro
            cpf = request.form['cpf']
            username = request.form.get('username')
            password = request.form['password']
            existing_user = Login.query.filter_by(cpf=cpf).first()
            
            if existing_user:
                return render_template('login.html', message='CPF já cadastrado. Por favor, tente novamente.')
            if not username:
                return render_template('login.html', message='O campo "username" é obrigatório. Por favor, preencha-o.')
            
            new_user = Login(cpf=cpf, username=username, password=password, perfil='promotor')
            db.session.add(new_user)
            db.session.commit()

            session['username'] = new_user.username
            session['perfil'] = 'promotor'
            return redirect(url_for('lojas.redes'))
        
        else:  # Parte de login
            username = request.form['username']
            password = request.form['password']
            user = Login.query.filter_by(username=username, password=password).first()
            
            if user:
                session['username'] = user.username
                # Se perfil for None ou vazio, define como 'promotor'
                perfil = user.perfil.lower().strip() if user.perfil else 'promotor'
                session['perfil'] = perfil

                if perfil == 'gestao':
                    return redirect(url_for('pdv.ver_pdv'))
                else:
                    return redirect(url_for('lojas.redes'))
            else:
                return render_template('login.html', message='Username ou senha incorretos.')
    
    return render_template('login.html')

@auth_bp.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('auth.login'))

@auth_bp.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        # Verifica o formulário de cadastro
        if 'cpf' in request.form and 'username' in request.form and 'password' in request.form:
            cpf = request.form['cpf']
            username = request.form['username']
            password = request.form['password']
            # Aqui você implementaria a lógica de cadastro
    return render_template('cadastro.html')