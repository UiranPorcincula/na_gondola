function confirmarExclusao() {
    return confirm("Tem certeza que deseja excluir este item?");
}

function filtrarPorRede() {
    var rede = document.getElementById("filtro_rede").value;
    var table, tr, td, i, txtValue;
    table = document.getElementById("total_lojas_table");
    tr = table.getElementsByTagName("tr");
    for (i = 1; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1]; // Coluna da Rede
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue === rede || rede === "Todos") {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
    contarLinhas();
}

function filtrarPorPromotor() {
    var promotor = document.getElementById("filtro_promotor").value;
    var table, tr, td, i, txtValue;
    table = document.getElementById("total_lojas_table");
    tr = table.getElementsByTagName("tr");
    for (i = 1; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0]; // Coluna do Promotor
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue === promotor || promotor === "Todos") {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
    contarLinhas();
}        

function filtrarPorCidade() {
    var cidade = document.getElementById("filtro_cidade").value;
    var table, tr, td, i, txtValue;
    table = document.getElementById("total_lojas_table");
    tr = table.getElementsByTagName("tr");
    for (i = 1; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[4]; // Coluna da Cidade
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue === cidade || cidade === "Todos") {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
    contarLinhas();
}

function contarLinhas() {
    var table = document.getElementById("total_lojas_table");
    var rowCount = 0;
    for (var i = 1; i < table.rows.length; i++) {
        if (table.rows[i].style.display !== "none") {
            rowCount++;
        }
    }
    document.getElementById("contador_linhas").innerText = "Quantidade de Lojas: " + rowCount;
}

function toggleDiaVisita(dia) {
    var diaButton = document.getElementById(dia);
    diaButton.classList.toggle('btn-selected');
    diaButton.classList.toggle('btn-unselected');

    var diaInput = document.getElementById("dia_visita");
    var dias = diaInput.value.split(",").map(function(item) {
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



// Contar as linhas visíveis quando a página é carregada
window.onload = function() {
    contarLinhas();
};

// Função para limpar o formulário quando a modal for fechada
$('#modalAdicionarPessoa').on('hidden.bs.modal', function () {
    $('#formAdicionarPessoa').trigger('reset');
});

