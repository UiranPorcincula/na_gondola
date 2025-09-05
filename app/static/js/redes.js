$(document).ready(function () {
    function adicionarCliente(cliente) {
        var clienteDiv = $('<div>').addClass('cliente-item');
        var img = $('<img>').attr('src', 'data:image/png;base64,' + cliente.foto).attr('alt', cliente.nome);
        img.attr('data-cliente-id', cliente.id);
        
        img.on('click', function () {
            var clienteId = $(this).data('cliente-id');
            var clienteNome = $(this).data('cliente-nome'); // Certifique-se de que o nome do cliente está sendo corretamente atribuído
            localStorage.setItem('selectedClienteId', clienteId); // Armazenar o ID do cliente
            localStorage.setItem('selectedClienteName', clienteNome); // Armazenar o nome do cliente
            console.log('Cliente ID armazenado:', clienteId);
            console.log('Cliente Nome armazenado:', clienteNome);
            window.location.href = '/sku?cliente_id=' + encodeURIComponent(clienteId);
        });        
        

        clienteDiv.append(img);
        $('#clientes-list').append(clienteDiv);
    }

    function buscarClientes() {
        $.ajax({
            type: "GET",
            url: "/redes",
            dataType: "json",
            success: function (response) {
                $('#clientes-list').empty();
                response.clientes.forEach(function (cliente) {
                    adicionarCliente(cliente);
                });
            },
            error: function (error) {
                console.error('Erro ao buscar clientes:', error);
            }
        });
    }

    buscarClientes();
});
