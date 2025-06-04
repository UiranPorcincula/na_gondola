// local.js
$(document).ready(function () {
    // Flag para verificar se a localização foi obtida com sucesso
    var localizacaoObtida = false;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;

                var nominatimURL = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + latitude + '&lon=' + longitude;

                $.getJSON(nominatimURL, function (data) {
                    var address = data.display_name;
                    $("#local").val(address);

                    // Defina a flag como true para indicar que a localização foi obtida com sucesso
                    localizacaoObtida = true;
                });
            },
            function (error) {
                console.error('Erro ao obter a localização: ' + error.message);
                alert("Por favor, ative o GPS para continuar.");
            }
        );
    } else {
        console.error('Geolocalização não suportada pelo navegador.');
        alert("Geolocalização não é suportada pelo seu navegador. Por favor, ative o GPS.");
    }

    // Agora, adicione um controle de fluxo para verificar a localização antes de permitir outras ações
    $("#algum-botao-ou-formulario").click(function (event) {
        // Verifica se a localização foi obtida com sucesso
        if (!localizacaoObtida) {
            alert("Por favor, ative o GPS antes de prosseguir.");
            event.preventDefault(); // Impede a execução da ação do botão ou formulário
        } else {
            // Se a localização foi obtida, permita que o usuário prossiga
            console.log("Localização obtida com sucesso. Prossiga com a ação desejada.");
        }
    });
});
