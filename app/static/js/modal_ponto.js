document.addEventListener("DOMContentLoaded", function () {
    // Obtém os botões
    const btnEntrada = document.getElementById("btnEntrada");
    const btnInicioAlmoco = document.getElementById("btnInicioAlmoco");
    const btnFimAlmoco = document.getElementById("btnFimAlmoco");
    const btnSaida = document.getElementById("btnSaida");

    // Recupera o estado salvo no LocalStorage (caso já tenha clicado nos botões antes)
    let statusPonto = JSON.parse(localStorage.getItem("statusPonto")) || {
        entrada: false,
        inicioAlmoco: false,
        fimAlmoco: false,
        saida: false
    };

    function atualizarBotoes() {
        // Define os botões já clicados como verdes
        if (statusPonto.entrada) {
            btnEntrada.style.backgroundColor = "green";
            btnInicioAlmoco.disabled = false;
        }
        if (statusPonto.inicioAlmoco) {
            btnInicioAlmoco.style.backgroundColor = "green";
            btnFimAlmoco.disabled = false;
        }
        if (statusPonto.fimAlmoco) {
            btnFimAlmoco.style.backgroundColor = "green";
            btnSaida.disabled = false;
        }
        if (statusPonto.saida) {
            btnSaida.style.backgroundColor = "green";
        }
    }

    atualizarBotoes(); // Atualiza o estado inicial

    function registrarClique(acao, botao, proximoBotao) {
        botao.addEventListener("click", function (event) {
            event.preventDefault(); // Evita o envio imediato do formulário

            // Verifica se pode registrar a ação
            if (
                (acao === "inicio_almoco" && !statusPonto.entrada) ||
                (acao === "fim_almoco" && !statusPonto.inicioAlmoco) ||
                (acao === "saida" && !statusPonto.fimAlmoco)
            ) {
                alert("Você precisa primeiro registrar a etapa anterior!");
                return;
            }

            // Atualiza o status e salva no LocalStorage
            statusPonto[acao] = true;
            localStorage.setItem("statusPonto", JSON.stringify(statusPonto));

            // Muda a cor do botão atual
            botao.style.backgroundColor = "green";

            // Habilita o próximo botão, se existir
            if (proximoBotao) {
                proximoBotao.disabled = false;
            }

            // Envia o formulário após a validação
            botao.closest("form").submit();
        });
    }

    // Adiciona os eventos nos botões
    registrarClique("entrada", btnEntrada, btnInicioAlmoco);
    registrarClique("inicio_almoco", btnInicioAlmoco, btnFimAlmoco);
    registrarClique("fim_almoco", btnFimAlmoco, btnSaida);
    registrarClique("saida", btnSaida, null);
});
