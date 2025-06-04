from flask import Blueprint, request, render_template, session, redirect, url_for, jsonify
from app import db
from app.models.ponto import RegistroPonto
from app.models.login import Login
from datetime import datetime, date

ponto_bp = Blueprint('ponto', __name__)

@ponto_bp.route('/registrar_ponto', methods=['GET', 'POST'])
def registrar_ponto():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    username_logado = session['username']
    promotor = Login.query.filter_by(username=username_logado).first()

    if not promotor:
        return "Usuário não encontrado", 404

    promotor_id = promotor.id

    if request.method == 'POST':
        acao = request.form.get('acao')
        hora_atual = datetime.now()

        # Verifica se já existe registro no dia atual
        hoje = date.today()
        registro_existente = RegistroPonto.query.filter(
            RegistroPonto.promotor_id == promotor_id,
            db.func.date(RegistroPonto.data_criacao) == hoje
        ).first()

        if registro_existente and all([
            registro_existente.entrada,
            registro_existente.inicio_almoco,
            registro_existente.fim_almoco,
            registro_existente.saida
        ]):
            return jsonify({
                'status': 'error',
                'modal': True,
                'message': 'Todos os pontos do dia já foram registrados'
            })

        if registro_existente:
            if acao == 'entrada' and registro_existente.entrada:
                return jsonify({'status': 'error', 'message': 'Entrada já registrada'})
            if acao == 'inicio_almoco' and registro_existente.inicio_almoco:
                return jsonify({'status': 'error', 'message': 'Início do almoço já registrado'})
            if acao == 'fim_almoco' and registro_existente.fim_almoco:
                return jsonify({'status': 'error', 'message': 'Fim do almoço já registrado'})
            if acao == 'saida' and registro_existente.saida:
                return jsonify({'status': 'error', 'message': 'Saída já registrada'})

            setattr(registro_existente, acao, hora_atual)
            registro_existente.ultimo_clique = acao
            db.session.commit()
        else:
            novo_registro = RegistroPonto(
                promotor_id=promotor_id,
                data_criacao=hora_atual,
                ultimo_clique=acao
            )
            setattr(novo_registro, acao, hora_atual)
            db.session.add(novo_registro)
            db.session.commit()

        return jsonify({'status': 'success', 'message': 'Ponto registrado com sucesso'})

    # Busca TODOS os registros do usuário, ordenados do mais recente para o mais antigo
    registros = RegistroPonto.query.filter(
        RegistroPonto.promotor_id == promotor_id
    ).order_by(RegistroPonto.data_criacao.desc()).all()

    # Se for requisição AJAX, retorna JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        registros_json = [{
            'data_criacao': r.data_criacao.strftime('%d/%m/%Y'),
            'entrada': r.entrada.strftime('%H:%M:%S') if r.entrada else '-',
            'inicio_almoco': r.inicio_almoco.strftime('%H:%M:%S') if r.inicio_almoco else '-',
            'fim_almoco': r.fim_almoco.strftime('%H:%M:%S') if r.fim_almoco else '-',
            'saida': r.saida.strftime('%H:%M:%S') if r.saida else '-'
        } for r in registros]
        return jsonify(registros=registros_json)

    # Se for requisição normal, renderiza o template
    return render_template('modal_ponto.html', registros=registros)

@ponto_bp.route('/modal_ponto')
def modal_ponto():
    return render_template('modal_ponto.html')