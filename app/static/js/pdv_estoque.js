// Constantes globais
const MAX_FIELDS = 5;
const MAX_DATAS = 5;
const DATA_CACHE_VALIDITY = 6 * 60 * 60 * 1000; // 6 horas em milissegundos

// Estado da aplicação
const appState = {
    envioEmAndamento: false,
    dataCache: null,
    ultimaAtualizacao: null
};

/**
 * Adiciona arquivos e datas ao FormData
 * @param {FormData} formData - Objeto FormData a ser preenchido
 * @returns {FormData} FormData preenchido
 */
function appendFilesAndDatesToFormData(formData) {
    // Adiciona arquivos
    $("#fotos-container input[type='file']").each(function () {
        const files = Array.from(this.files);
        files.forEach(file => formData.append(this.name, file));
    });

    // Adiciona datas
    $("#datas-container input[type='date']").each(function () {
        if (this.value) {
            formData.append(this.name, this.value);
        }
    });

    // Adiciona campos simples
    const campos = [
        'local', 'promotor', 'loja', 'quantidade_pdv',
        'quantidade_estoque', 'cliente', 'campoMensagem',
        'redes', 'data_de_envio', 'preco', 'ProdutoSelecionado'
    ];

    campos.forEach(campo => {
        const value = $(`#${campo}`).val();
        if (value) formData.append(campo, value);
    });

    return formData;
}

/**
 * Obtém a data atual com fallback inteligente
 * @returns {Promise<Date>} Promise que resolve com a data atual
 */
async function obterDataAtual() {
    try {
        // Verifica cache válido
        if (appState.dataCache && appState.ultimaAtualizacao &&
            (Date.now() - appState.ultimaAtualizacao) < DATA_CACHE_VALIDITY) {
            return new Date(appState.dataCache);
        }

        // 1. Tenta obter data do dispositivo
        const dataLocal = new Date();

        // 2. Verificação de qualidade da data local
        const ano = dataLocal.getFullYear();
        const diff = Math.abs(Date.now() - dataLocal.getTime());
        const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

        // Aceita se estiver dentro de parâmetros razoáveis
        if (diffDays <= 2 && ano >= 2020 && ano <= new Date().getFullYear() + 1) {
            appState.dataCache = dataLocal;
            appState.ultimaAtualizacao = Date.now();
            return dataLocal;
        }

        // 3. Busca data de API confiável com timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('https://worldtimeapi.org/api/ip', {
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!response.ok) throw new Error('API não disponível');

        const data = await response.json();
        const apiDate = new Date(data.datetime);

        // Atualiza cache
        appState.dataCache = apiDate;
        appState.ultimaAtualizacao = Date.now();

        return apiDate;

    } catch (error) {
        console.error('Falha ao obter data:', error);
        // Fallback para data local com validação mínima
        const fallbackDate = new Date();
        return (fallbackDate.getFullYear() >= 2020) ? fallbackDate : new Date(2023, 0, 1);
    }
}

/**
 * Formata data para padrão brasileiro
 * @param {Date} data - Data a ser formatada
 * @returns {string} Data formatada no padrão brasileiro
 */
function formatarData(data) {
    const opcoes = {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    return data.toLocaleDateString('pt-BR', opcoes);
}

/**
 * Adiciona um campo dinâmico ao container especificado
 * @param {string} containerId - ID do container
 * @param {string} inputType - Tipo do input
 * @param {number} limit - Limite máximo de campos
 * @param {string} buttonId - ID do botão de adicionar
 * @param {string} accept - Tipos de arquivo aceitos (opcional)
 * @param {boolean} required - Se o campo é obrigatório (opcional)
 */
function adicionarCampo(containerId, inputType, limit, buttonId, accept = '', required = false) {
    const container = $(`#${containerId}`);
    const index = container.children('.form-group').length + 1;

    if (index > limit) return;

    const campoHtml = `
    <div class="form-group d-flex align-items-center">
      <input type="${inputType}" name="${inputType}${index}" id="${inputType}${index}" 
             class="form-control me-2" ${accept ? `accept="${accept}"` : ''} 
             ${required ? 'required' : ''}>
      ${index > 1 ? '<i class="fas fa-trash-alt text-danger remove-campo ms-auto" style="cursor: pointer;"></i>' : ''}
    </div>
  `;

    container.append(campoHtml);
    $(`#${buttonId}`).appendTo(container);

    if (index === limit) $(`#${buttonId}`).hide();
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
    const datasContainer = document.getElementById('datas-container');
    const totalInputs = datasContainer.querySelectorAll('input[type="date"]').length;

    if (totalInputs >= MAX_DATAS) {
        document.getElementById('adicionar-data').style.display = 'none';
        return;
    }

    const novaDataDiv = document.createElement('div');
    novaDataDiv.className = 'form-group d-flex align-items-center';

    const novaData = document.createElement('input');
    novaData.type = 'date';
    novaData.name = 'vencimento' + (totalInputs + 1);
    novaData.className = 'form-control me-2';

    const btnRemove = document.createElement('i');
    btnRemove.className = 'fas fa-trash-alt text-danger remove-campo ms-auto';
    btnRemove.style.cursor = 'pointer';
    btnRemove.onclick = function () {
        datasContainer.removeChild(novaDataDiv);
        if (datasContainer.querySelectorAll('input[type="date"]').length < MAX_DATAS) {
            document.getElementById('adicionar-data').style.display = '';
        }
    };

    novaDataDiv.appendChild(novaData);
    novaDataDiv.appendChild(btnRemove);
    datasContainer.insertBefore(novaDataDiv, document.getElementById('adicionar-data'));

    if (totalInputs + 1 >= MAX_DATAS) {
        document.getElementById('adicionar-data').style.display = 'none';
    }
}

/**
 * Preenche um campo com um valor e opcionalmente o torna readonly
 * @param {string} id - ID do campo
 * @param {string} valor - Valor a ser preenchido
 */
function preencherCampo(id, valor) {
    if (valor) $(`#${id}`).val(valor).prop('readonly', true);
}

/**
 * Atualiza o dropdown de lojas baseado na rede selecionada
 * @param {string} rede - Nome da rede selecionada
 */
function atualizarLojasDropdown(rede) {
    const lojasDropdown = $("#lojasDropdown");
    lojasDropdown.empty();

    lojas.filter(loja => loja.rede === rede).forEach(loja => {
        lojasDropdown.append(
            `<li><a class="dropdown-item-loja" href="#" data-loja="${loja.loja}">${loja.loja}</a></li>`
        );
    });
}

/**
 * Salva os dados do formulário no localStorage
 */
function salvarDadosFormulario() {
    const dadosFormulario = {};
    const campos = [
        'local', 'promotor', 'loja', 'quantidade_pdv',
        'quantidade_estoque', 'cliente', 'campoMensagem',
        'redes', 'data_de_envio', 'preco', 'ProdutoSelecionado'
    ];

    campos.forEach(campo => {
        dadosFormulario[campo] = $(`#${campo}`).val();
    });

    localStorage.setItem("formData", JSON.stringify(dadosFormulario));
}

/**
 * Restaura os dados do formulário do localStorage
 */
function restaurarDadosFormulario() {
    const dadosFormulario = JSON.parse(localStorage.getItem("formData"));
    if (dadosFormulario) {
        Object.keys(dadosFormulario).forEach(campo => {
            $(`#${campo}`).val(dadosFormulario[campo]);
        });
    }
}

/**
 * Pré-visualiza uma foto selecionada
 * @param {HTMLInputElement} input - Elemento input do tipo file
 * @param {string} id - ID do preview
 */
function previewFoto(input, id) {
    const preview = document.getElementById(`foto-preview${id}`);
    const label = input.parentElement.querySelector('.foto-label');
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.src = e.target.result;
            preview.style.display = 'block';
            label.style.display = 'none';
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
        preview.style.display = 'none';
        label.style.display = 'block';
    }
}

/**
 * Remove a pré-visualização de uma foto
 * @param {string} id - ID do preview
 */
function apagarFoto(id) {
    const preview = document.getElementById(`foto-preview${id}`);
    const input = document.querySelector(`input[name="file${id}"]`);
    const label = input.parentElement.querySelector('.foto-label');

    preview.src = "";
    preview.style.display = 'none';
    label.style.display = 'block';
    input.value = "";
}

// Inicialização quando o documento estiver pronto
$(document).ready(async function () {
    // Configura data inicial
    $("#data_de_envio").val("Carregando...");
    try {
        const dataAtual = await obterDataAtual();
        $("#data_de_envio").val(formatarData(dataAtual));
    } catch (error) {
        console.error("Erro ao carregar data:", error);
        $("#data_de_envio").val(formatarData(new Date()));
    }

    // Preencher campos automaticamente
    preencherCampo('promotor', usernameText);
    preencherCampo('cliente', localStorage.getItem('selectedClienteName'));

    // Configurar dropdown de rede e loja
    $(document).on('click', '.dropdown-item-rede', function () {
        const selectedRede = $(this).data('rede');
        $("#redeDropdown").text(selectedRede);
        $("#redes").val(selectedRede);
        atualizarLojasDropdown(selectedRede);
        $("#redeError").hide();
    });

    $(document).on('click', '.dropdown-item-loja', function () {
        const selectedLoja = $(this).data('loja');
        $("#lojaDropdown").text(selectedLoja);
        $("#loja").val(selectedLoja);
        $("#lojaError").hide();
    });

    // Validação do formulário
    $("#enviarBotao").on("click", function (event) {
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
    $('#preco').on('keyup change', function () {
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

    // SKU selecionado
    const selectedSku = localStorage.getItem('selectedSku');
    if (selectedSku) {
        const skuObj = JSON.parse(selectedSku);
        $("#SKU").val(skuObj.sku);
        $("#ProdutoSelecionado").val(skuObj.descricao);
    }

    // Ocultar botões se os limites forem alcançados
    if ($("#fotos-container .form-group").length >= MAX_FIELDS) $("#adicionar-foto").hide();
    if ($("#datas-container .form-group").length >= MAX_DATAS) $("#adicionar-data").hide();

    // Restaurar dados do formulário
    restaurarDadosFormulario();

    // Envio do formulário
    $("#submit-form").submit(function (event) {
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

    // Event listeners para remoção de campos
    $(document).on('click', '.remove-campo', function () {
        $(this).parent().remove();

        // Mostrar botão de adicionar se o número de campos for menor que o máximo
        if ($("#fotos-container .form-group").length < MAX_FIELDS) {
            $("#adicionar-foto").show();
        }
        if ($("#datas-container .form-group").length < MAX_DATAS) {
            $("#adicionar-data").show();
        }
    });
});

// Exporta funções para o escopo global
window.appendFilesAndDatesToFormData = appendFilesAndDatesToFormData;
window.adicionarFoto = adicionarFoto;
window.adicionarData = adicionarData;
window.previewFoto = previewFoto;
window.apagarFoto = apagarFoto;

function previewFoto(input, id) {
    const preview = document.getElementById(`foto-preview${id}`);
    const placeholder = input.closest('.foto-wrapper').querySelector('.foto-placeholder');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function apagarFoto(event, id) {
    event.stopPropagation(); // Impede que o clique no ícone dispare o input file

    const preview = document.getElementById(`foto-preview${id}`);
    const input = document.getElementById(`fileInput${id}`);
    const placeholder = input.closest('.foto-wrapper').querySelector('.foto-placeholder');

    preview.src = "";
    preview.style.display = "none";
    input.value = "";
    placeholder.style.display = "flex";
}

//fotos

const MAX_FOTOS = 20;
let fotosData = []; // [{file, tipo, previewUrl, fileInput}]

function renderFotoQuadrados() {
    const grid = document.getElementById('fotos-grid');
    grid.innerHTML = '';

    fotosData.forEach((foto, idx) => {
        const fotoDiv = document.createElement('div');
        fotoDiv.className = 'foto-item';
        fotoDiv.innerHTML = `
            <div class="foto-wrapper">
                <div class="foto-container">
                    <img src="${foto.previewUrl}" class="foto-preview"/>
                    <span class="foto-tipo">${foto.tipo}</span>
                    <i class="fas fa-trash-alt foto-lixeira" onclick="removerFoto(${idx})"></i>
                </div>
            </div>
        `;
        fotoDiv.appendChild(foto.fileInput);
        const inputTipo = document.createElement('input');
        inputTipo.type = 'hidden';
        inputTipo.name = 'tipo_foto[]';
        inputTipo.value = foto.tipo;
        fotoDiv.appendChild(inputTipo);
        grid.appendChild(fotoDiv);
    });

    if (fotosData.length < MAX_FOTOS) {
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

function removerFoto(idx) {
    fotosData.splice(idx, 1);
    renderFotoQuadrados();
}

// ---- MODAL ANTES/DEPOIS LIVRE ----
// Adapte para o seu modal Bootstrap

function adicionarNovaFoto() {
    if (fotosData.length >= MAX_FOTOS) {
        alert('Limite máximo de 20 fotos atingido.');
        return;
    }
    // Nunca bloqueie o botão "Depois"!
    $('#btnDepois').prop('disabled', false);

    // Mostra o modal
    var tipoFotoModal = new bootstrap.Modal(document.getElementById('tipoFotoModal'));
    tipoFotoModal.show();

    $('#btnAntes').off('click').on('click', function () {
        tipoFotoModal.hide();
        escolherTipoFoto("Antes");
    });
    $('#btnDepois').off('click').on('click', function () {
        tipoFotoModal.hide();
        escolherTipoFoto("Depois");
    });
}

function escolherTipoFoto(tipo) {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';
    inputFile.name = 'file[]';
    inputFile.style.display = 'none';
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

// No submit
document.getElementById('submit-form').addEventListener('submit', function(e) {
    fotosData.forEach(foto => this.appendChild(foto.fileInput));
});
document.addEventListener('DOMContentLoaded', () => renderFotoQuadrados());