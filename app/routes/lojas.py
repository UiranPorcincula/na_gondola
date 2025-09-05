from flask import Blueprint, request, render_template, flash, session, redirect, url_for, jsonify
from app import db
from app.models.lojas import Lojas, Lojastotal, TotalLojas, Roteiros, RedesLojas
from sqlalchemy import and_, or_

lojas_bp = Blueprint('lojas', __name__)

@lojas_bp.route('/total_lojas', methods=['GET', 'POST'])
def total_lojas():
    if 'username' not in session:
        return redirect(url_for('auth.login'))
    if request.method == 'POST':
        # Adicionar nova loja
        promotor = request.form['promotor']
        rede = request.form['rede']
        loja = request.form['loja']
        endereco = request.form['endereco']
        cidade = request.form['cidade']
        estado = request.form['estado']
        dia_visita = request.form['dia_visita']
        coordenada = request.form['coordenada']

        nova_loja = TotalLojas(promotor=promotor, rede=rede, loja=loja, endereco=endereco, cidade=cidade, estado=estado, dia_visita=dia_visita, coordenada=coordenada)
        db.session.add(nova_loja)
        db.session.commit()
        flash('Loja adicionada com sucesso!', 'success')

    total_lojas = TotalLojas.query.all()
    redes = list(set([loja.rede for loja in total_lojas]))
    promotores = list(set([loja.promotor for loja in total_lojas]))
    cidades = list(set([loja.cidade for loja in total_lojas]))
    return render_template('total_lojas.html', total_lojas=total_lojas, redes=redes, promotores=promotores, cidades=cidades)

@lojas_bp.route('/delete_loja/<int:id>', methods=['POST'])
def delete_loja(id):
    loja = TotalLojas.query.get_or_404(id)
    try:
        db.session.delete(loja)
        db.session.commit()
        flash('Loja excluída com sucesso!', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Erro ao excluir a loja. Tente novamente.', 'danger')
    return redirect(url_for('lojas.total_lojas'))

@lojas_bp.route('/add', methods=['POST'])
def add():
    promotor = request.form['promotor']
    rede = request.form['rede']
    loja = request.form['loja']
    endereco = request.form['endereco']
    cidade = request.form['cidade']
    estado = request.form['estado']
    dia_visita = request.form['dia_visita']
    coordenada = request.form['coordenada']
    new_loja = TotalLojas(promotor=promotor, rede=rede, loja=loja, endereco=endereco, cidade=cidade, estado=estado, dia_visita=dia_visita, coordenada=coordenada)
    db.session.add(new_loja)
    db.session.commit()
    return redirect(url_for('auth.home'))

@lojas_bp.route('/edit/<int:id>', methods=['GET', 'POST'])
def total_edit(id):
    loja = TotalLojas.query.get_or_404(id)
    
    if request.method == 'POST':
        novo_promotor = request.form['promotor']

        # Verificar se existem outras lojas com o mesmo promotor
        outras_lojas = TotalLojas.query.filter_by(promotor=novo_promotor).all()

        # Atualizar o promotor de todas as outras lojas
        for outra_loja in outras_lojas:
            outra_loja.promotor = novo_promotor

        # Atualizar os dados da loja atual
        loja.promotor = novo_promotor
        loja.rede = request.form['rede']
        loja.loja = request.form['loja']
        loja.endereco = request.form['endereco']
        loja.cidade = request.form['cidade']
        loja.estado = request.form['estado']
        loja.dia_visita = request.form['dia_visita']
        loja.coordenada = request.form['coordenada']

        # Salvar as alterações no banco de dados
        db.session.commit()

        # Redirecionar para a página de total_lojas
        return redirect(url_for('lojas.total_lojas'))
    
    return render_template('edit_loja.html', loja=loja)

@lojas_bp.route('/delete/<int:id>')
def total_delete(id):
    loja_to_delete = TotalLojas.query.get_or_404(id)
    db.session.delete(loja_to_delete)
    db.session.commit()
    return redirect(url_for('auth.home'))

@lojas_bp.route('/view/<int:id>')
def view(id):
    loja = TotalLojas.query.get_or_404(id)
    return render_template('view_loja.html', loja=loja)

@lojas_bp.route('/roteiros/<funcionario>', methods=['GET', 'POST'])
def buscar_roteiros(funcionario):
    if not funcionario:
        # Renderizar o template com a coluna "funcionario" visível
        roteiros = Roteiros.query.all()
        return render_template('roteiros.html', roteiros=roteiros)
    else:
        if request.method == 'POST':
            dia_semana = request.form.get('dia_semana')
            if dia_semana:
                roteiros = Roteiros.query.filter(and_(Roteiros.funcionario == funcionario, Roteiros.dia_semana == dia_semana)).all()
            else:
                roteiros = Roteiros.query.filter(Roteiros.funcionario == funcionario).all()
        else:
            roteiros = Roteiros.query.filter(and_(Roteiros.funcionario == funcionario, Roteiros.dia_semana.in_(["segunda", "terca", "quarta", "quinta", "sexta", "sabado"]))).all()
        if request.method == 'POST' and 'update_id' in request.form:
            update_id = int(request.form['update_id'])
            roteiro = Roteiros.query.get(update_id)
            if roteiro:
                roteiro.dia_semana = request.form['update_dia_semana']
                roteiro.lojas = request.form['update_lojas']
                roteiro.cidade = request.form['update_cidade']                
                db.session.commit()
                return redirect(url_for('lojas.buscar_roteiros', funcionario=funcionario))
        return render_template('roteiros_promotor.html', roteiros=roteiros, funcionario=funcionario)

@lojas_bp.route('/lojas', methods=['GET', 'POST'])
def lojas():
    if 'username' not in session:
        return redirect(url_for('auth.login'))
    if request.method == 'POST':
        pesquisa = request.form['pesquisa']
        resultados = buscar_lojas(pesquisa)
        return render_template('buscar_resultados.html', resultados=resultados)
    return render_template('lojas.html')

def buscar_lojas(pesquisa):
    resultados = Lojas.query.filter(
        or_(
            Lojas.funcionario.ilike('%{}%'.format(pesquisa)),
            Lojas.loja.ilike('%{}%'.format(pesquisa)),
            Lojas.cidade.ilike('%{}%'.format(pesquisa)),
            Lojas.endereco.ilike('%{}%'.format(pesquisa)),
            Lojas.regiao.ilike('%{}%'.format(pesquisa)),
            Lojas.bairro.ilike('%{}%'.format(pesquisa))
        )
    ).all()
    return resultados

@lojas_bp.route('/search', methods=['POST'])
def search():
    pesquisa = request.form['pesquisa']
    resultados = buscar_lojas(pesquisa)
    return render_template('buscar_resultados.html', resultados=resultados)

@lojas_bp.route('/lojastotal')
def lojastotal_route():
    if 'username' not in session:
        return redirect(url_for('auth.login'))
    dados_lojas = Lojastotal.query.all()
    return render_template('lojastotal.html', lojas=dados_lojas)

@lojas_bp.route('/lista_lojas')
def lista_lojas():
    return render_template('lista_lojas.html')

@lojas_bp.route('/autocomplete')
def autocomplete():
    from app.models.rebeka import Promotores
    term = request.args.get('term')
    resultados = db.session.query(Promotores.nome).filter(Promotores.nome.ilike(f'{term}%')).all()
    nomes = [resultado[0] for resultado in resultados]
    return jsonify(nomes)

@lojas_bp.route('/redes')
def redes():
    if 'username' not in session:
        return render_template('login.html', message='Nenhum promotor logado.')

    username = session['username']

    # Buscar os clientes associados ao promotor logado
    redes = RedesLojas.query.filter_by(promotor=username).first()

    if redes:
        # Função para garantir que a foto não seja None
        def get_cliente_data(cliente_col):
            return cliente_col if cliente_col else 'default'

        clientes = [
            {'id': 1, 'nome': redes.cliente1, 'foto': get_cliente_data(redes.cliente1) + '.jpeg'},
            {'id': 2, 'nome': redes.cliente2, 'foto': get_cliente_data(redes.cliente2) + '.png'},
            {'id': 3, 'nome': redes.cliente3, 'foto': get_cliente_data(redes.cliente3) + '.png'},
            {'id': 4, 'nome': redes.cliente4, 'foto': get_cliente_data(redes.cliente4) + '.jpeg'},
            {'id': 5, 'nome': redes.cliente5, 'foto': get_cliente_data(redes.cliente5) + '.jpeg'},
            {'id': 6, 'nome': redes.cliente6, 'foto': get_cliente_data(redes.cliente6) + '.png'},
            {'id': 7, 'nome': redes.cliente7, 'foto': get_cliente_data(redes.cliente7) + '.png'},
            {'id': 8, 'nome': redes.cliente8, 'foto': get_cliente_data(redes.cliente8) + '.jpeg'},
            {'id': 9, 'nome': redes.cliente9, 'foto': get_cliente_data(redes.cliente9) + '.jpeg'},
            {'id': 10, 'nome': redes.cliente10, 'foto': get_cliente_data(redes.cliente10) + '.png'}
        ]

        # Filtra clientes que possuem nome
        clientes = [cliente for cliente in clientes if cliente['nome']]
        clientes.sort(key=lambda x: x['id'])  # Ordena pela ordem do ID

        return render_template('redes.html', clientes=clientes)

    return render_template('redes.html', message='Nenhum cliente associado ao promotor logado.')