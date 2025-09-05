from flask import Blueprint, request, render_template, redirect, url_for, request, session, jsonify
from app import db
from app.models.pdv import Sku
import base64

sku_bp = Blueprint('sku', __name__)

@sku_bp.route('/sku')
def sku_route():  # O nome da função é sku_route, não sku
    if 'username' not in session:
        return redirect(url_for('auth.login'))
    cliente_id = request.args.get('cliente_id')
    return render_template('sku.html', cliente_id=cliente_id)

@sku_bp.route('/buscar_skus', methods=['POST'])
def buscar_skus():
    # Obter o cliente_id enviado na requisição
    cliente_id = request.form.get('cliente_id')
    
    # Consultar o banco de dados para obter os SKUs correspondentes ao cliente
    cliente_skus = Sku.query.filter_by(cliente_id=cliente_id).all()

    # Verificar se o cliente foi encontrado no banco de dados
    if cliente_skus:
        # Criar uma lista para armazenar os SKUs e fotos encontrados
        skus = []

        # Iterar sobre os SKUs encontrados
        for sku in cliente_skus:
            # Verificar se a foto não é None antes de codificá-la para Base64
            if sku.foto is not None:
                # Adicionar o SKU e a foto à lista, codificando a foto para Base64
                skus.append({
                    'descricao': sku.descricao,
                    'foto': base64.b64encode(sku.foto).decode('utf-8')
                })

        # Retornar os SKUs e fotos como uma resposta JSON
        return jsonify({'skus': skus})
    else:
        # Se o cliente não foi encontrado, retornar uma lista vazia de SKUs
        return jsonify({'skus': []})

@sku_bp.route('/inserir_sku', methods=['GET', 'POST'])
def inserir_sku():
    if request.method == 'POST':
        cliente_id = request.form['cliente_id']
        descricao = request.form['descricao']
        foto = request.files['foto']
        
        foto_blob = foto.read()
        
        novo_sku = Sku(cliente_id=cliente_id, descricao=descricao, foto=foto_blob)
        db.session.add(novo_sku)
        db.session.commit()
        return redirect(url_for('sku.inserir_sku'))
    else:
        skus = Sku.query.all()
        return render_template('inserir_sku.html', skus=skus)

@sku_bp.route('/editar_sku/<int:id>', methods=['GET', 'POST'])
def editar_sku(id):
    sku = Sku.query.get_or_404(id)
    if request.method == 'POST':
        # Atualiza os dados do SKU
        sku.cliente_id = request.form['cliente_id']
        sku.descricao = request.form['descricao']
        foto = request.files['foto']
        if foto:
            foto_blob = foto.read()
            sku.foto = foto_blob
        
        db.session.commit()
        return redirect(url_for('sku.inserir_sku'))
    else:
        return render_template('editar_sku.html', sku=sku)

@sku_bp.route('/excluir_sku/<int:id>', methods=['POST'])
def excluir_sku(id):
    sku = Sku.query.get_or_404(id)
    db.session.delete(sku)
    db.session.commit()
    return redirect(url_for('sku.inserir_sku'))