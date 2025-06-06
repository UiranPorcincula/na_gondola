from flask import Blueprint, request, render_template, session, redirect, url_for, send_file
from app import db
from app.models.notas import NotaFiscal
from app.models.lojas import RedesLojas
from PIL import Image
from app.models.lojas import TotalLojas
import io
import zipfile  # Importando biblioteca para criar arquivos ZIP
import tempfile  # Para criar arquivo temporário
import os       # Para manipulação de arquivos

notas_bp = Blueprint('notas', __name__)

@notas_bp.route('/nota_fiscal', methods=['GET'])
def nota_fiscal_form():
    usuario = session.get('username')
    if not usuario:
        return redirect(url_for('auth.login'))

    # Buscar pares (rede, loja) para o promotor logado na tabela total_lojas
    resultados = db.session.query(TotalLojas.rede, TotalLojas.loja).filter_by(promotor=usuario).all()

    redes = sorted(set([r.rede for r in resultados if r.rede]))

    # Monta dicionário com lojas agrupadas por rede
    lojas_por_rede = {}
    for r in resultados:
        if r.rede not in lojas_por_rede:
            lojas_por_rede[r.rede] = []
        if r.loja not in lojas_por_rede[r.rede]:
            lojas_por_rede[r.rede].append(r.loja)

    return render_template('upload_nota.html', redes=redes, lojas_por_rede=lojas_por_rede)

@notas_bp.route('/enviar_nota', methods=['POST'])
def enviar_nota():
    numero_nota = request.form['numero_nota']
    usuario = session.get('username', 'desconhecido')
    rede = request.form.get('rede')
    loja = request.form.get('loja')
    
    # Coleta todas as fotos enviadas
    fotos_enviadas = []
    for key in request.files:
        if key.startswith('foto') and request.files[key].filename:
            fotos_enviadas.append(request.files[key])
    
    if not fotos_enviadas:
        return "Erro: Nenhuma foto enviada", 400
    
    try:
        # Prepara os dados para a nota fiscal
        nota_data = {
            'numero_nota': numero_nota,
            'usuario': usuario,
            'rede': rede,
            'loja': loja
        }
        
        # Processa cada foto e salva no campo correspondente
        for i, foto in enumerate(fotos_enviadas):
            if i >= 30:  # Limita a 30 fotos conforme sua estrutura de BD
                break
                
            campo_nome = f'arquivo_pdf{i+1}'  # arquivo_pdf1, arquivo_pdf2, etc.
            
            img = Image.open(foto).convert('RGB')
            pdf_bytes = io.BytesIO()
            img.save(pdf_bytes, format='PDF')
            pdf_data = pdf_bytes.getvalue()
            
            nota_data[campo_nome] = pdf_data
        
        # Cria a nota fiscal com todos os PDFs
        nova_nota = NotaFiscal(**nota_data)
        db.session.add(nova_nota)
        db.session.commit()
        
        return redirect(url_for('notas.lista_notas'))
    except Exception as e:
        db.session.rollback()
        return f"Erro ao processar as imagens: {str(e)}"

@notas_bp.route('/ver_nota/<int:nota_id>/<int:pdf_index>')
def ver_nota(nota_id, pdf_index):
    if pdf_index < 1 or pdf_index > 30:
        return "Índice de PDF inválido", 400
        
    nota = NotaFiscal.query.get_or_404(nota_id)
    
    campo_pdf = f'arquivo_pdf{pdf_index}'
    pdf_data = getattr(nota, campo_pdf)
    
    if pdf_data is None:
        return "PDF não encontrado", 404
    
    # Verificar se é para download ou visualização
    download = request.args.get('download', 'false').lower() == 'true'
    
    return send_file(
        io.BytesIO(pdf_data),
        mimetype='application/pdf',
        download_name=f'nota_{nota.numero_nota}_{pdf_index}.pdf',
        as_attachment=download  # True para download, False para visualizar no navegador
    )

@notas_bp.route('/lista_notas')
def lista_notas():
    usuario = session.get('username')
    if not usuario:
        return redirect(url_for('auth.login'))
    notas = NotaFiscal.query.filter_by(usuario=usuario).all()
    return render_template('lista_notas.html', notas=notas)

@notas_bp.route('/baixar_nota/<int:nota_id>')
def baixar_nota(nota_id):
    # Endpoint para verificar quais PDFs existem para uma nota
    nota = NotaFiscal.query.get_or_404(nota_id)
    pdfs_disponiveis = []
    
    for i in range(1, 31):
        campo_pdf = f'arquivo_pdf{i}'
        if getattr(nota, campo_pdf) is not None:
            pdfs_disponiveis.append(i)
    
    return {'pdfs': pdfs_disponiveis}

@notas_bp.route('/baixar_todos/<int:nota_id>')
def baixar_todos(nota_id):
    """
    Rota inteligente para baixar PDFs:
    - Se tiver apenas 1 PDF, baixa direto como PDF
    - Se tiver 2 ou mais, cria um ZIP
    """
    # Obter a nota fiscal
    nota = NotaFiscal.query.get_or_404(nota_id)
    
    # Identificar PDFs disponíveis
    pdfs_disponiveis = []
    for i in range(1, 31):
        campo_pdf = f'arquivo_pdf{i}'
        if getattr(nota, campo_pdf) is not None:
            pdfs_disponiveis.append(i)
    
    # Verificar se há PDFs disponíveis
    if not pdfs_disponiveis:
        return "Nenhum PDF disponível para esta nota", 404
    
    # Se tiver apenas 1 PDF, baixa diretamente
    if len(pdfs_disponiveis) == 1:
        pdf_index = pdfs_disponiveis[0]
        pdf_data = getattr(nota, f'arquivo_pdf{pdf_index}')
        
        return send_file(
            io.BytesIO(pdf_data),
            mimetype='application/pdf',
            download_name=f'nota_{nota.numero_nota}.pdf',
            as_attachment=True
        )
    
    # Se tiver 2 ou mais PDFs, cria um ZIP
    else:
        # Criar um arquivo ZIP temporário
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'a', zipfile.ZIP_DEFLATED, False) as zip_file:
            # Adicionar cada PDF disponível ao arquivo ZIP
            for i in pdfs_disponiveis:
                campo_pdf = f'arquivo_pdf{i}'
                pdf_data = getattr(nota, campo_pdf)
                
                # Nome do arquivo dentro do ZIP
                filename = f'nota_{nota.numero_nota}_{i}.pdf'
                zip_file.writestr(filename, pdf_data)
        
        # Mover o ponteiro do buffer para o início
        zip_buffer.seek(0)
        
        # Enviar o arquivo ZIP como resposta
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            download_name=f'nota_{nota.numero_nota}_completa.zip',
            as_attachment=True  # Forçar download
        )