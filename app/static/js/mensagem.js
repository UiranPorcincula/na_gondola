// mensagem.js

$(document).ready(function() {
    // Função para carregar e escolher aleatoriamente uma palavra
    function carregarPalavra() {
        // Obter a mensagem e a data armazenadas
        const mensagemAntiga = localStorage.getItem('mensagemDia');
        const dataAntiga = localStorage.getItem('dataMensagem');

        // Verificar se a mensagem precisa ser atualizada
        if (!dataAntiga || precisaAtualizar(dataAntiga)) {
            // Requisição AJAX para o arquivo de palavras
            $.get("/static/mensagem.txt", function(data) {
                // Dividir o conteúdo do arquivo em linhas
                const linhas = data.split("\n");

                // Filtrar palavras que têm até 5 letras
                const palavrasDisponiveis = linhas.filter(palavra => palavra.length <= 5);

                // Escolher aleatoriamente uma palavra
                const palavraAleatoria = palavrasDisponiveis[Math.floor(Math.random() * palavrasDisponiveis.length)];

                // Armazenar a nova mensagem e a data atual
                localStorage.setItem('mensagemDia', palavraAleatoria.trim());
                localStorage.setItem('dataMensagem', obterDataAtual());

                // Preencher o campo "Mensagem do dia"
                $("#campoMensagem").val(palavraAleatoria.trim());
            });
        } else {
            // Utilizar a mensagem armazenada
            $("#campoMensagem").val(mensagemAntiga);
        }
    }

    // Verificar se a mensagem precisa ser atualizada
    function precisaAtualizar(dataAntiga) {
        const agora = new Date();
        const dataAtual = obterDataAtual();

        // Verificar se já passou das 05:30AM do próximo dia
        return agora > new Date(dataAntiga + ' 05:30:00') && dataAtual !== dataAntiga;
    }

    // Obter a data atual no formato YYYY-MM-DD
    function obterDataAtual() {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = agora.getMonth() + 1; // Os meses começam do zero
        const dia = agora.getDate();

        return `${ano}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    }

    // Chamar a função de verificação ao carregar a página
    carregarPalavra();
});
