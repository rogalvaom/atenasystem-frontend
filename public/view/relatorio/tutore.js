$(document).ready(function() {
    var selectCodSala = $('#selectCodSalaTutore');
    var inputDataInicial = $('#inputDataInicialTutore');
    var inputDataFinal = $('#inputDataFinalTutore');
    var formRelatorio = $('#formRelatorioTutore');
    var tableRelatorioBody = $('#tableRelatorioTutore tbody');
    var relatorioContainer = $('#relatorioTableContainerTutore');

    // Carregar salas
    var salas = apiGet('/salas');
    selectCodSala.empty();
    if (salas && Array.isArray(salas)) {
        selectCodSala.append('<option value="">Selecione uma sala</option>');
        salas.forEach(function(s) {
            selectCodSala.append($('<option></option>').val(s.id).text(s.nome));
        });

        var urlParams = new URLSearchParams(window.location.search);
        var salaParam = urlParams.get('cod_sala');
        var dataIniParam = urlParams.get('data_inicial');
        var dataFimParam = urlParams.get('data_final');

        if (salaParam) selectCodSala.val(salaParam);
        if (dataIniParam) inputDataInicial.val(dataIniParam);
        if (dataFimParam) inputDataFinal.val(dataFimParam);

        if (salaParam && dataIniParam && dataFimParam) {
            gerarRelatorio(salaParam, dataIniParam, dataFimParam);
        }
    }

    function gerarRelatorio(sala, dataIni, dataFim) {
        var payload = {
            cod_sala: sala,
            data_inicial: dataIni,
            data_final: dataFim
        };

        var relatorioData = apiPost('/presenca/relatorio/tutore', payload);
        tableRelatorioBody.empty();

        if (relatorioData && Array.isArray(relatorioData) && relatorioData.length > 0) {
            var temLinha = false;
            relatorioData.forEach(function(item) {
                var presencas = parseInt(item.presencas) || 0;
                if (presencas > 0) {
                    temLinha = true;
                    var row = $('<tr></tr>');
                    row.append($('<td></td>').css('text-align', 'left').text(item.nome));
                    row.append($('<td></td>').text(presencas));
                    tableRelatorioBody.append(row);
                }
            });

            if (!temLinha) {
                tableRelatorioBody.append('<tr><td colspan="2">Nenhuma presença de tutore registrada no período.</td></tr>');
            }
            relatorioContainer.show();
        } else {
            tableRelatorioBody.append('<tr><td colspan="2">Nenhum dado encontrado para o período selecionado.</td></tr>');
            relatorioContainer.show();
        }
    }

    formRelatorio.on('submit', function(e) {
        e.preventDefault();
        var sala = selectCodSala.val();
        var dataIni = inputDataInicial.val();
        var dataFim = inputDataFinal.val();

        if (sala && dataIni && dataFim) {
            gerarRelatorio(sala, dataIni, dataFim);
        }
    });
});
