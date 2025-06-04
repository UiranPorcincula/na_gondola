from flask import Blueprint, request, render_template, flash, session, redirect, url_for, jsonify, send_file
from app import db
from app.models.pdv import PDV
from app.utils.image_utils import convert_to_base64
from PIL import Image
from io import BytesIO
import base64
from datetime import datetime
import io

pdv_bp = Blueprint('pdv', __name__)

# Função para validar e converter datas no formato ISO ou brasileiro
def format_date(date_str):
    if not date_str:
        return None
    try:
        # Tenta converter a data no formato ISO (yyyy-mm-dd)
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        try:
            # Tenta converter a data no formato brasileiro (dd/mm/yyyy)
            return datetime.strptime(date_str, '%d/%m/%Y').date()
        except ValueError:
            # Log ou tratamento de erro, se necessário
            return None

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

    # Função para converter preço de string para float
    def convert_preco(preco_str):
        if preco_str:
            try:
                return float(preco_str.replace('R$', '').replace('.', '').replace(',', '.').strip())
            except ValueError:
                return None
        return None

    preco = convert_preco(preco)

    # Validar e converter as datas
    data_de_envio = format_date(data_de_envio)
    vencimentos = [
    format_date(request.form.get(f'vencimento{i}'))
    for i in range(1, 6)
    if request.form.get(f'vencimento{i}')
]

    # Fotos dinâmicas (convertendo para base64)
    fotos = [
        convert_to_base64(request.files.get(f'file{i}'))
        for i in range(1, 6)
        if request.files.get(f'file{i}')
    ]

    # Criar novo registro no banco de dados
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
        foto1=fotos[0] if len(fotos) > 0 else None,
        foto2=fotos[1] if len(fotos) > 1 else None,
        foto3=fotos[2] if len(fotos) > 2 else None,
        foto4=fotos[3] if len(fotos) > 3 else None,
        foto5=fotos[4] if len(fotos) > 4 else None,
    )

    db.session.add(pdv)
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

    # Adicionar a data atual ao contexto
    data_atual = datetime.utcnow().strftime('%d/%m/%Y')

    return render_template('pdv_estoque.html', lojas=lojas, lojas_por_rede=lojas_por_rede, data_atual=data_atual)

@pdv_bp.route('/ver_pdv')
def ver_pdv():
    if 'username' not in session or session.get('perfil') != 'gestao':
        return redirect(url_for('auth.login'))
    
    pdvs = PDV.query.all()
    return render_template('ver_pdv.html', pdvs=pdvs)

@pdv_bp.route('/imagem_base64/<int:pdv_id>/<string:tipo>')
def imagem_base64(pdv_id, tipo):
    campos_imagem = ['foto1', 'foto2', 'foto3', 'foto4', 'foto5']
    
    if tipo not in campos_imagem:
        return "Tipo de imagem inválido", 400
    
    pdv = PDV.query.get(pdv_id)
    
    if pdv:
        imagem_base64 = getattr(pdv, tipo)
        
        if imagem_base64:
            try:
                imagem_bytes = base64.b64decode(imagem_base64)
                with Image.open(BytesIO(imagem_bytes)) as img:
                    img = img.convert("RGB")
                    img_io = BytesIO()
                    img.save(img_io, 'JPEG')
                    img_io.seek(0)
                    return send_file(img_io, mimetype='image/jpeg')
            except Exception as e:
                return f"Erro ao processar a imagem: {e}", 500
        else:
            return "Imagem não disponível", 404
    else:
        return "PDV não encontrado", 404

@pdv_bp.route('/get_photos/<int:pdv_id>')
def get_photos(pdv_id):
    pdv = PDV.query.get(pdv_id)
    if pdv:
        photos = [getattr(pdv, f'foto{i}') for i in range(1, 6) if getattr(pdv, f'foto{i}')]
        if photos:
            photo_urls = [f"/imagem_base64/{pdv_id}/foto{i}" for i in range(1, 6) if getattr(pdv, f'foto{i}')]
            return jsonify(photo_urls)
        else:
            return jsonify([])
    else:
        return jsonify([])

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