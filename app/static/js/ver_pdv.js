$(document).ready(function () {
    // Inicializa a tabela DataTable com tradução para português
    var table = $('#pdv-table').DataTable({
        language: {
            "sProcessing": "Processando...",
            "sLengthMenu": "Mostrar _MENU_ entradas",
            "sZeroRecords": "Nenhum registro encontrado",
            "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ entradas",
            "sInfoEmpty": "Mostrando 0 até 0 de 0 entradas",
            "sInfoFiltered": "(filtrado de _MAX_ entradas no total)",
            "sSearch": "Pesquisar:",
            "oPaginate": {
                "sFirst": "Primeiro",
                "sPrevious": "Anterior",
                "sNext": "Próximo",
                "sLast": "Último"
            }
        }
    });

    // Quando o botão "Ver Fotos" for clicado
    $('#pdv-table').on('click', '.verFotos-btn', function () {
        var pdvId = $(this).data('pdv-id');
        var carouselInner = $('#carouselImages');
        carouselInner.empty();

        $.ajax({
            url: '/get_photos/' + pdvId,
            method: 'GET',
            success: function (response) {
                if (response && Array.isArray(response)) {
                    response.forEach(function (foto, index) {
                        var activeClass = index === 0 ? 'active' : '';
                        var imageHtml = `<div class="carousel-item ${activeClass}">
                                            <img src="${foto}" class="d-block w-100" alt="Foto">
                                        </div>`;
                        carouselInner.append(imageHtml);
                    });
                    $('#modal-photo').modal('show');
                } else {
                    console.error("Fotos não encontradas ou resposta inesperada");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Erro na requisição: " + textStatus + " - " + errorThrown);
            }
        });
    });

    // Quando o botão "Datas de vencimento" for clicado
    $('#pdv-table').on('click', '.btn-vencimento', function () {
        var pdvId = $(this).data('id');
        var button = $(this);

        $.ajax({
            url: '/get_vencimentos',
            method: 'GET',
            data: { id_pdv: pdvId },
            success: function (response) {
                if (response && Array.isArray(response)) {
                    var tooltipContent = "<ul>";
                    response.forEach(function (date) {
                        var formattedDate = formatDate(date); // Formata a data
                        var dateStyle = isNearExpiration(date) ? 'style="font-weight: bold; color: red;"' : ''; // Aplica estilo se estiver próxima do vencimento
                        tooltipContent += `<li ${dateStyle}>${formattedDate}</li>`;
                    });
                    tooltipContent += "</ul>";

                    button.tooltip({
                        title: tooltipContent,
                        html: true,
                        placement: 'top'
                    }).tooltip('show');
                } else {
                    button.tooltip({
                        title: "Nenhuma data de vencimento encontrada.",
                        placement: 'top'
                    }).tooltip('show');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Erro na requisição: " + textStatus + " - " + errorThrown);
                button.tooltip({
                    title: "Erro ao carregar datas de vencimento.",
                    placement: 'top'
                }).tooltip('show');
            }
        });
    });

    // Função para converter "AAAA-MM-DD" para "DD/MM/AAAA"
    function formatDate(dateString) {
        var parts = dateString.split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    }

    // Função para verificar se a data está a 15 dias ou menos do vencimento
    function isNearExpiration(dateString) {
        var today = new Date(); // Data atual
        var expirationDate = new Date(dateString); // Data de vencimento
        var timeDifference = expirationDate.getTime() - today.getTime(); // Diferença em milissegundos
        var daysDifference = timeDifference / (1000 * 3600 * 24); // Diferença em dias

        // Se a data de vencimento estiver a 15 dias ou menos, retorna true
        return daysDifference <= 15 && daysDifference >= 0;
    }

    // Fecha o tooltip ao clicar fora dele
    $(document).on('click', function (e) {
        $('[data-bs-toggle="tooltip"]').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 &&
                $('.tooltip').has(e.target).length === 0) {
                $(this).tooltip('hide');
            }
        });
    });

    // Função para alternar a exibição dos vencimentos
    window.toggleVencimentos = function(pdvId) {
        var vencimentoDiv = document.getElementById('vencimentos-' + pdvId);
        if (vencimentoDiv.style.display === 'none') {
            vencimentoDiv.style.display = 'block';
        } else {
            vencimentoDiv.style.display = 'none';
        }
    };

    // Função para buscar e exibir a foto ao clicar no botão
    $('.btn-view-photo').on('click', function () {
        var pdvId = $(this).data('pdv-id'); // Obtém o ID do PDV do botão
        var fotoTipo = $(this).data('foto-tipo'); // Obtém o tipo de foto do botão

        // Requisição AJAX para obter os dados da foto em base64
        $.get(`/imagem_base64/${pdvId}/${fotoTipo}`, function (data) {
            // Verifica se os dados da foto foram retornados com sucesso
            if (data && data.imagem_base64) {
                var fotoBase64 = data.imagem_base64;
                // Atualiza a imagem no modal com a foto obtida
                $('#modal-photo').find('.modal-body img').attr('src', `data:image/jpeg;base64, ${fotoBase64}`);
                // Abre o modal com a foto
                $('#modal-photo').modal('show');
            } else {
                alert('Foto não encontrada ou indisponível.');
            }
        }).fail(function () {
            alert('Erro ao carregar a foto.');
        });
    });

    // Cria o tooltip para o endereço completo ao clicar
    $('.truncated-text').on('click', function (e) {
        e.stopPropagation(); // Evita fechar o tooltip ao clicar no texto

        // Remove todos os tooltips ativos
        $('[data-bs-toggle="tooltip"]').tooltip('hide');

        // Cria o tooltip para o endereço
        var tooltip = new bootstrap.Tooltip(this, {
            title: $(this).attr('title'),
            trigger: 'manual',
            placement: 'top',
            html: true,
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner">'
                + $(this).attr('title') +
                '<button class="btn btn-sm btn-secondary ms-2 close-btn">X</button></div></div>'
        });

        // Exibe o tooltip
        tooltip.show();

        // Fecha o tooltip ao clicar no botão de fechar
        $('.tooltip .close-btn').on('click', function () {
            tooltip.dispose();
        });
    });

    // Função para copiar o texto para a área de transferência
    function copyText(btn) {
        var textToCopy = $(btn).siblings('.tooltip-inner').text().trim();
        navigator.clipboard.writeText(textToCopy).then(function () {
            alert('Texto copiado para a área de transferência: ' + textToCopy);
        }, function (err) {
            console.error('Erro ao copiar texto: ', err);
        });
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const itemsToHide = ["Home", "Lojas", "Promotores", "Roteiros", "Contatos", "PDV Estoque", "Ver PDV"];
    
    document.querySelectorAll('.navbar-nav .nav-item').forEach(item => {
        if (itemsToHide.includes(item.textContent.trim())) {
            item.style.display = 'none';
        }
    });
});