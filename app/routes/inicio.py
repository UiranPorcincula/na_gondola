from flask import Blueprint, render_template, session, redirect, url_for, flash

inicio_bp = Blueprint('inicio', __name__, template_folder='templates')

@inicio_bp.route('/inicio')
def inicio():
    # Verificação básica de autenticação (opcional)
    if 'username' not in session:
        flash('🔒 Faça login para acessar o sistema', 'warning')
        return redirect(url_for('auth.login'))
    
    # Página puramente estática - apenas renderiza o template
    return render_template('inicio.html')