document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("hot");
    const hot = new Handsontable(container, {
        data: [[]], // Os dados da planilha serão carregados dinamicamente
        rowHeaders: true,
        colHeaders: true,
        minSpareRows: 1,
        minSpareCols: 1,
        contextMenu: true,
    });

    // Função para enviar os dados ao servidor (Flask) para salvar no banco de dados
    function saveDataToServer(data) {
        fetch("/save_data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    }

    // Evento que será acionado toda vez que houver uma mudança nos dados da planilha
    hot.addHook("afterChange", function (changes) {
        if (changes && changes.length > 0) {
            saveDataToServer(hot.getData());
        }
    });

    // Função para carregar os dados da planilha a partir do servidor (Flask)
    function loadDataFromServer() {
        fetch("/load_data")
            .then((response) => response.json())
            .then((data) => {
                hot.loadData(data);
            });
    }

    // Carregar os dados iniciais da planilha
    loadDataFromServer();
});
