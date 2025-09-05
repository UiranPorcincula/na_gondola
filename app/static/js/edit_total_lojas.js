// Quando a página é carregada, configura os botões de dia de visita de acordo com os valores existentes
window.onload = function () {
    var diaVisita = document.getElementById("dia_visita").value;
    var diasSelecionados = diaVisita.split(", ");

    var buttons = document.querySelectorAll('#dia_visita_buttons button');
    buttons.forEach(function (button) {
        if (diasSelecionados.includes(button.id)) {
            button.classList.remove('btn-unselected');
            button.classList.add('btn-selected');
        } else {
            button.classList.remove('btn-selected');
            button.classList.add('btn-unselected');
        }
    });
};

// Adiciona eventos de clique para os botões de dia de visita
var buttons = document.querySelectorAll('#dia_visita_buttons button');
buttons.forEach(function (button) {
    button.addEventListener('click', function () {
        toggleDiaVisita(this.id);
    });
});

// Função para alternar a seleção de dias
function toggleDiaVisita(dia) {
    var diaButton = document.getElementById(dia);
    if (diaButton.classList.contains('btn-unselected')) {
        diaButton.classList.remove('btn-unselected');
        diaButton.classList.add('btn-selected');
    } else {
        diaButton.classList.remove('btn-selected');
        diaButton.classList.add('btn-unselected');
    }

    var diaInput = document.getElementById("dia_visita");
    var dias = diaInput.value.split(", ").map(function (item) {
        return item.trim();
    });
    var index = dias.indexOf(dia);
    if (index === -1) {
        dias.push(dia);
    } else {
        dias.splice(index, 1);
    }
    diaInput.value = dias.join(", ");
}
