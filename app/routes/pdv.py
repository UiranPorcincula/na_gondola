from flask import Blueprint, request, render_template, flash, session, redirect, url_for, jsonify, send_file, Response
from app import db
from app.models.pdv import PDV, PDVFoto
from datetime import datetime
from io import BytesIO

pdv_bp = Blueprint('pdv', __name__)

def format_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        try:
            return datetime.strptime(date_str, '%d/%m/%Y').date()
        except ValueError:
            return None

def convert_preco(preco_str):
    if preco_str:
        try:
            return float(preco_str.replace('R$', '').replace('.', '').replace(',', '.').strip())
        except ValueError:
            return None
    return None

@pdv_bp.route('/foto/<int:foto_id>')
def foto(foto_id):
    foto = PDVFoto.query.get_or_404(foto_id)
    return Response(foto.foto, mimetype='image/jpeg')

@pdv_bp.route('/imagem_base64_nova/<int:foto_id>')
def imagem_base64_nova(foto_id):
    foto = PDVFoto.query.get_or_404(foto_id)
    if foto.foto:
        return send_file(BytesIO(foto.foto), mimetype='image/jpeg')
    return "Imagem não encontrada", 404

@pdv_bp.route('/get_photos/<int:pdv_id>')
def get_photos(pdv_id):
    fotos = PDVFoto.query.filter_by(pdv_id=pdv_id).all()
    if fotos:
        photo_infos = [
            {
                "url": url_for('pdv.imagem_base64_nova', foto_id=foto.id),
                "tipo": foto.tipo.lower() if foto.tipo else ""
            }
            for foto in fotos
        ]
        return jsonify(photo_infos)
    else:
        return jsonify([])

@pdv_bp.route('/submit', methods=['POST'])
def submit():
    promotor = request.form.get('promotor')
    loja = request.form.get('loja')
    local = request.form.get('local')
    quantidade_pdv = request.form.get('quantidade_pdv')
    quantidade_estoque = request.form.get('quantidade_estoque')
    cliente = request.form.get('cliente')
    mensagem_dia = request.form.get('campoMensagem')
    redes = request.form.get('redes')
    data_de_envio = request.form.get('data_de_envio')
    preco = request.form.get('preco')
    sku = request.form.get('ProdutoSelecionado')

    preco = convert_preco(preco)
    data_de_envio = format_date(data_de_envio)

    vencimentos = [
        format_date(request.form.get(f'vencimento{i}'))
        for i in range(1, 6)
        if request.form.get(f'vencimento{i}')
    ]

    pdv = PDV(
        promotor=promotor,
        loja=loja,
        local=local,
        quantidade_pdv=quantidade_pdv,
        quantidade_estoque=quantidade_estoque,
        cliente=cliente,
        mensagem_dia=mensagem_dia,
        redes=redes,
        data_de_envio=data_de_envio,
        preco=preco,
        sku=sku,
        vencimento1=vencimentos[0] if len(vencimentos) > 0 else None,
        vencimento2=vencimentos[1] if len(vencimentos) > 1 else None,
        vencimento3=vencimentos[2] if len(vencimentos) > 2 else None,
        vencimento4=vencimentos[3] if len(vencimentos) > 3 else None,
        vencimento5=vencimentos[4] if len(vencimentos) > 4 else None,
    )
    db.session.add(pdv)
    db.session.commit()

    # Salva múltiplas fotos (até 20, cada uma com tipo)
    fotos = request.files.getlist('file[]')
    tipos = request.form.getlist('tipo_foto[]')
    for file, tipo in zip(fotos, tipos):
        if file and tipo in ['Antes', 'Depois']:
            foto_blob = file.read()
            pdv_foto = PDVFoto(pdv_id=pdv.id, tipo=tipo, foto=foto_blob)
            db.session.add(pdv_foto)
    db.session.commit()

    flash('Dados salvos com sucesso!')
    return redirect(url_for('pdv.pdv_estoque_handler'))

@pdv_bp.route('/pdv_estoque', methods=['GET', 'POST'], endpoint='pdv_estoque_handler')
def handle_pdv_estoque():
    if 'username' not in session:
        return redirect(url_for('auth.login'))
    username = session['username']

    if request.method == 'POST':
        selected_rede = request.form.get('selected_rede')
        from app.models.lojas import TotalLojas
        lojas = TotalLojas.query.filter_by(promotor=username, rede=selected_rede).all()
    else:
        from app.models.lojas import TotalLojas
        lojas = TotalLojas.query.filter_by(promotor=username).all()

    lojas_por_rede = {}
    for loja in lojas:
        rede = loja.rede
        if rede not in lojas_por_rede:
            lojas_por_rede[rede] = []
        lojas_por_rede[rede].append(loja.loja)

    data_atual = datetime.utcnow().strftime('%d/%m/%Y')

    return render_template('pdv_estoque.html', lojas=lojas, lojas_por_rede=lojas_por_rede, data_atual=data_atual)

@pdv_bp.route('/ver_pdv')
def ver_pdv():
    if 'username' not in session or session.get('perfil') != 'gestao':
        return redirect(url_for('auth.login'))
    
    pdvs = PDV.query.all()
    return render_template('ver_pdv.html', pdvs=pdvs)

@pdv_bp.route('/get_vencimentos', methods=['GET'])
def get_vencimentos():
    id_pdv = request.args.get('id_pdv')
    
    if not id_pdv:
        return jsonify({"message": "ID do PDV não fornecido"}), 400
    
    produto = PDV.query.get(id_pdv)
    
    if produto:
        vencimentos = [
            produto.vencimento1,
            produto.vencimento2,
            produto.vencimento3,
            produto.vencimento4,
            produto.vencimento5
        ]
        
        vencimentos = [v.strftime("%d/%m/%Y") if isinstance(v, datetime) else v for v in vencimentos if v is not None]

        if vencimentos:
            return jsonify(vencimentos)
        else:
            return jsonify({"message": "Nenhuma data encontrada."}), 404
    else:
        return jsonify({"message": "Produto não encontrado"}), 404

@pdv_bp.route('/formularios', methods=['GET'])
def formularios():
    pdvs = PDV.query.all()
    return render_template('formularios.html', pdvs=pdvs)