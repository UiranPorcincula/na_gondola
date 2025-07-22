// Variáveis globais
const MAX_FIELDS = 20;
const MAX_DATAS = 5;
const MAX_FOTOS = 20;
let fotosData = []; // [{file, tipo, previewUrl, fileInput}]

// Estado da aplicação
const appState = {
    envioEmAndamento: false
};

/**
 * Adiciona arquivos e datas ao FormData
 * @param {FormData} formData - Objeto FormData para anexar os dados
 */
function appendFilesAndDatesToFormData(formData) {
    fotosData.forEach(foto => {
        formData.append('files[]', foto.file);
        formData.append('tipos[]', foto.tipo);
    });
    
    document.querySelectorAll('input[name^="data"]').forEach(input => {
        if (input.value) formData.append('datas[]', input.value);
    });
}

/**
 * Exibe o preview da foto selecionada
 * @param {HTMLInputElement} input - Elemento input file
 * @param {number} id - ID do campo de foto
 */

 function previewFoto(input, id) {
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Encontra os elementos relevantes
        const wrapper = input.closest('.foto-wrapper');
        if (!wrapper) return;
        
        // Cria ou encontra o elemento de preview
        let previewImg = wrapper.querySelector('.foto-preview');
        if (!previewImg) {
            previewImg = document.createElement('img');
            previewImg.className = 'foto-preview';
            wrapper.querySelector('.foto-container').appendChild(previewImg);
        }
        
        // Configura o preview
        previewImg.src = e.target.result;
        wrapper.classList.add('has-preview');
        
        // Esconde o placeholder
        const placeholder = wrapper.querySelector('.foto-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // Cria o overlay se não existir
        let overlay = wrapper.querySelector('.foto-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'foto-overlay';
            
            const tipoSpan = document.createElement('span');
            tipoSpan.className = 'foto-tipo antes'; // Tipo padrão
            tipoSpan.textContent = 'Antes';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'foto-lixeira';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.onclick = function(e) {
                e.stopPropagation();
                removerFoto(input);
            };
            
            overlay.appendChild(tipoSpan);
            overlay.appendChild(deleteBtn);
            wrapper.querySelector('.foto-container').appendChild(overlay);
        }
        
        // Atualiza o array fotosData
        const existingIndex = fotosData.findIndex(f => f.fileInput === input);
        const fotoData = {
            file: file,
            tipo: determinarTipoFoto(input),
            previewUrl: e.target.result,
            fileInput: input
        };
        
        if (existingIndex >= 0) {
            fotosData[existingIndex] = fotoData;
        } else {
            fotosData.push(fotoData);
        }
        
        // Atualiza o tipo no overlay
        const tipoSpan = overlay.querySelector('.foto-tipo');
        if (tipoSpan) {
            tipoSpan.className = `foto-tipo ${fotoData.tipo.toLowerCase()}`;
            tipoSpan.textContent = fotoData.tipo;
        }
    };
    
    reader.onerror = function() {
        console.error('Erro ao ler a imagem:', reader.error);
        alert('Erro ao carregar a imagem. Por favor, tente novamente.');
    };
    
    reader.readAsDataURL(file);
}


function determinarTipoFoto(input) {
    // Verifica se o input tem um atributo data-tipo
    return input.getAttribute('data-tipo') || 'Antes';
}

function removerFoto(input) {
    const wrapper = input.closest('.foto-wrapper');
    if (!wrapper) return;
    
    // Remove dos dados
    const index = fotosData.findIndex(f => f.fileInput === input);
    if (index >= 0) {
        fotosData.splice(index, 1);
    }
    
    // Remove o elemento
    wrapper.remove();
    
    // Garante que sempre haja pelo menos um item para adicionar fotos
    if (document.querySelectorAll('.foto-item').length === 0) {
        adicionarNovaFoto();
    }
}

function adicionarNovaFoto() {
    if (fotosData.length >= MAX_FOTOS) {
        alert('Limite máximo de fotos atingido!');
        return;
    }
    
    // Mostra o modal para escolher o tipo
    const modal = new bootstrap.Modal(document.getElementById('tipoFotoModal'));
    modal.show();
    
    // Configura os botões do modal
    document.getElementById('btnAntes').onclick = function() {
        modal.hide();
        criarInputFoto('Antes');
    };
    
    document.getElementById('btnDepois').onclick = function() {
        modal.hide();
        criarInputFoto('Depois');
    };
}

function criarInputFoto(tipo) {
    const id = Date.now(); // ID único
    
    const fotoItem = document.createElement('div');
    fotoItem.className = 'foto-item';
    
    fotoItem.innerHTML = `
        <div class="foto-wrapper">
            <div class="foto-container">
                <div class="foto-placeholder">
                    <i class="fas fa-camera"></i>
                    <span>Adicionar foto</span>
                </div>
            </div>
            <input type="file" id="fileInput${id}" class="foto-input" accept="image/*" data-tipo="${tipo}">
        </div>
    `;
    
    const input = fotoItem.querySelector('.foto-input');
    input.onchange = function() {
        previewFoto(this, id);
    };
    
    // Insere antes do último item (que é sempre o botão de adicionar)
    const grid = document.getElementById('fotos-grid');
    grid.insertBefore(fotoItem, grid.lastElementChild);
    
    // Dispara o clique no input file
    input.click();
}


/**
 * Determina o tipo da foto baseado no contexto
 * @param {HTMLInputElement} input - Input file
 * @returns {string} Tipo da foto
 */
function determinarTipoFoto(input) {
    // Verifica se está no grid principal
    if (input.closest('#fotos-grid')) {
        return input.getAttribute('data-tipo') || 'Antes';
    }
    // Verifica se está no container de fotos adicionais
    return 'Adicional';
}

/**
 * Remove uma foto
 * @param {Event} event - Evento de clique
 * @param {number} id - ID do campo de foto
 */
function apagarFoto(event, id) {
    event.stopPropagation();
    
    const input = document.getElementById(`fileInput${id}`);
    const wrapper = input.closest('.foto-wrapper');
    
    // Remove dos dados
    const index = fotosData.findIndex(f => f.fileInput === input);
    if (index >= 0) fotosData.splice(index, 1);
    
    // Reseta o visual
    if (wrapper) {
        input.value = '';
        const preview = wrapper.querySelector('.foto-preview');
        if (preview) {
            preview.style.display = 'none';
            preview.src = '';
        }
        
        const placeholder = wrapper.querySelector('.foto-placeholder');
        if (placeholder) placeholder.style.display = 'flex';
    }
}

/**
 * Adiciona um campo no container especificado
 * @param {string} containerId - ID do container
 * @param {string} type - Tipo do campo
 * @param {number} max - Número máximo de campos
 * @param {string} addButtonId - ID do botão de adicionar
 * @param {string} accept - Tipos de arquivo aceitos (opcional)
 */
function adicionarCampo(containerId, type, max, addButtonId, accept = '') {
    const container = document.getElementById(containerId);
    const totalInputs = container.getElementsByClassName('form-group').length;
    
    if (totalInputs >= max) {
        alert(`Máximo de ${max} ${type === 'file' ? 'fotos' : 'datas'} atingido!`);
        return;
    }
    
    const novaDiv = document.createElement('div');
    novaDiv.className = 'form-group';
    
    if (type === 'file') {
        const id = Date.now(); // ID único
        novaDiv.innerHTML = `
            <div class="foto-wrapper">
                <img id="foto-preview${id}" class="foto-preview">
                <input type="file" id="fileInput${id}" name="file[]" accept="${accept}"
                       onchange="previewFoto(this, ${id})" class="foto-input">
                <div class="foto-placeholder">
                    <i class="fas fa-camera"></i>
                    <span>Adicionar foto</span>
                </div>
                <i class="fas fa-trash-alt remove-foto" onclick="apagarFoto(event, ${id})"></i>
            </div>`;
    } else {
        novaDiv.innerHTML = `
            <input type="date" name="data${totalInputs + 1}" class="form-control" required>
            <button type="button" class="btn btn-danger btn-sm remove-campo">
                <i class="fas fa-times"></i>
            </button>`;
    }
    
    container.insertBefore(novaDiv, document.getElementById(addButtonId));
    
    if (totalInputs + 1 >= max) {
        document.getElementById(addButtonId).style.display = 'none';
    }
}

/**
 * Adiciona um campo de foto
 */
function adicionarFoto() {
    salvarDadosFormulario();
    adicionarCampo("fotos-container", "file", MAX_FIELDS, "adicionar-foto", 'image/*');
}

/**
 * Adiciona um campo de data
 */
function adicionarData() {
    adicionarCampo("datas-container", "date", MAX_DATAS, "adicionar-data");
}

/**
 * Renderiza o grid de fotos principal
 */
function renderFotoQuadrados() {
    const grid = document.getElementById('fotos-grid');
    grid.innerHTML = '';

    fotosData.forEach((foto, idx) => {
        if (!foto.fileInput.closest('#fotos-container')) { // Ignora fotos dos campos adicionais
            const fotoDiv = document.createElement('div');
            fotoDiv.className = 'foto-item';
            
            fotoDiv.innerHTML = `
                <div class="foto-wrapper">
                    <div class="foto-container">
                        <div class="foto-overlay">
                            <span class="foto-tipo ${foto.tipo.toLowerCase()}">${foto.tipo}</span>
                            <button class="foto-lixeira" onclick="removerFoto(${idx})">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        <img src="${foto.previewUrl}" class="foto-preview" alt="Preview da foto"/>
                    </div>
                </div>
            `;
            
            grid.appendChild(fotoDiv);
        }
    });

    if (fotosData.filter(f => !f.fileInput.closest('#fotos-container')).length < MAX_FOTOS) {
        const nextDiv = document.createElement('div');
        nextDiv.className = 'foto-item';
        nextDiv.innerHTML = `
            <div class="foto-wrapper" onclick="adicionarNovaFoto()">
                <div class="foto-placeholder">
                    <i class="fas fa-camera"></i>
                    <span>Adicionar foto</span>
                </div>
            </div>
        `;
        grid.appendChild(nextDiv);
    }
}

/**
 * Remove uma foto do grid principal
 * @param {number} idx - Índice no array fotosData
 */
function removerFoto(idx) {
    fotosData.splice(idx, 1);
    renderFotoQuadrados();
}

/**
 * Inicia o processo de adicionar nova foto ao grid principal
 */
function adicionarNovaFoto() {
    if (fotosData.filter(f => !f.fileInput.closest('#fotos-container')).length >= MAX_FOTOS) {
        alert('Limite máximo de fotos atingido.');
        return;
    }
    
    $('#btnDepois').prop('disabled', false);
    const tipoFotoModal = new bootstrap.Modal(document.getElementById('tipoFotoModal'));
    tipoFotoModal.show();

    $('#btnAntes').off('click').on('click', function() {
        tipoFotoModal.hide();
        escolherTipoFoto("Antes");
    });
    
    $('#btnDepois').off('click').on('click', function() {
        tipoFotoModal.hide();
        escolherTipoFoto("Depois");
    });
}

/**
 * Processa a escolha do tipo de foto
 * @param {string} tipo - Tipo da foto (Antes/Depois)
 */
function escolherTipoFoto(tipo) {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';
    inputFile.capture = 'environment';
    inputFile.name = 'file[]';
    inputFile.setAttribute('data-tipo', tipo);
    
    inputFile.onchange = function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(ev) {
                fotosData.push({
                    file: file,
                    tipo: tipo,
                    previewUrl: ev.target.result,
                    fileInput: inputFile
                });
                
                renderFotoQuadrados();
            };
            
            reader.readAsDataURL(file);
        }
    };
    
    inputFile.click();
}

// Restante das funções permanecem inalteradas (obterDataAtual, formatarData, preencherCampo, etc.)
// ...

// Inicialização quando o documento estiver pronto
$(document).ready(async function() {
    // Configura data inicial
    $("#data_de_envio").val("Carregando...");
    try {
        const dataAtual = await obterDataAtual();
        $("#data_de_envio").val(formatarData(dataAtual));
    } catch (error) {
        console.error("Erro ao carregar data:", error);
        $("#data_de_envio").val(formatarData(new Date()));
    }

    // Preencher campos automáticos
    preencherCampo('promotor', usernameText);
    preencherCampo('cliente', localStorage.getItem('selectedClienteName'));

    // Configurar dropdowns
    $(document).on('click', '.dropdown-item-rede', function() {
        const selectedRede = $(this).data('rede');
        $("#redeDropdown").text(selectedRede);
        $("#redes").val(selectedRede);
        atualizarLojasDropdown(selectedRede);
        $("#redeError").hide();
    });

    $(document).on('click', '.dropdown-item-loja', function() {
        const selectedLoja = $(this).data('loja');
        $("#lojaDropdown").text(selectedLoja);
        $("#loja").val(selectedLoja);
        $("#lojaError").hide();
    });

    // Validação do formulário
    $("#enviarBotao").on("click", function(event) {
        let isValid = true;

        if ($("#redes").val() === "") {
            $("#redeError").show();
            isValid = false;
        }

        if ($("#loja").val() === "") {
            $("#lojaError").show();
            isValid = false;
        }

        if (!isValid) event.preventDefault();
    });

    // Formatação do preço
    $('#preco').on('keyup change', function() {
        let preco = $(this).val().replace(/\D/g, '');
        if (preco.length > 2) {
            preco = preco.replace(/^0+/, '').replace(/(\d{2})$/, ',$1');
        }
        $(this).val('R$' + preco);

        if (parseFloat(preco.replace(",", ".")) > 10.0) {
            alert("O preço não pode ser superior a R$10,00.");
            $(this).val("");
        }
    });

    // Configurar SKU
    const selectedSku = localStorage.getItem('selectedSku');
    if (selectedSku) {
        const skuObj = JSON.parse(selectedSku);
        $("#SKU").val(skuObj.sku);
        $("#ProdutoSelecionado").val(skuObj.descricao);
    }

    // Restaurar dados do formulário
    restaurarDadosFormulario();

    // Configurar envio do formulário
    $("#submit-form").submit(function(event) {
        event.preventDefault();
        if (appState.envioEmAndamento) return;

        appState.envioEmAndamento = true;
        $("#loading").removeClass('d-none');
        $("#enviarBotao").prop("disabled", true);
        $("#mensagem-envio").addClass('d-none').removeClass('alert-success alert-danger').text('');

        const formData = new FormData(this);
        appendFilesAndDatesToFormData(formData);

        $.ajax({
            url: "/submit",
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: () => {
                $("#mensagem-envio")
                    .removeClass('d-none alert-danger')
                    .addClass('alert-success')
                    .text("Dados enviados com sucesso!");
                // Limpar fotos após envio bem-sucedido
                fotosData = [];
                renderFotoQuadrados();
            },
            error: () => {
                $("#mensagem-envio")
                    .removeClass('d-none alert-success')
                    .addClass('alert-danger')
                    .text("Ocorreu um erro ao enviar os dados.");
            },
            complete: () => {
                $("#loading").addClass('d-none');
                $("#enviarBotao").prop("disabled", false);
                appState.envioEmAndamento = false;
            }
        });
    });

    // Event listeners para campos
    $(document).on('click', '.remove-campo', function() {
        const wrapper = $(this).closest('.form-group');
        const inputFile = wrapper.find('input[type="file"]')[0];
        
        // Remove dos dados se for um campo de foto
        if (inputFile) {
            const index = fotosData.findIndex(f => f.fileInput === inputFile);
            if (index >= 0) fotosData.splice(index, 1);
        }
        
        wrapper.remove();

        // Mostra botão de adicionar se estiver abaixo do limite
        if ($("#fotos-container .form-group").length < MAX_FIELDS) {
            $("#adicionar-foto").show();
        }
        if ($("#datas-container .form-group").length < MAX_DATAS) {
            $("#adicionar-data").show();
        }
    });
    
    // Inicializa o grid de fotos
    renderFotoQuadrados();
});