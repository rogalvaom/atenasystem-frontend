$(document).ready(function() {
    var inputDataInicial = $('#inputDataInicialReuniao');
    var inputDataFinal = $('#inputDataFinalReuniao');
    var formRelatorio = $('#formRelatorioReuniao');
    var tableRelatorioBody = $('#tableRelatorioReuniao tbody');
    var relatorioContainer = $('#relatorioTableContainerReuniao');

    var urlParams = new URLSearchParams(window.location.search);
    var dataIniParam = urlParams.get('data_inicial');
    var dataFimParam = urlParams.get('data_final');

    if (dataIniParam) inputDataInicial.val(dataIniParam);
    if (dataFimParam) inputDataFinal.val(dataFimParam);

    if (dataIniParam && dataFimParam) {
        gerarRelatorio(dataIniParam, dataFimParam);
    }

    function gerarRelatorio(dataIni, dataFim) {
        var payload = {
            data_inicial: dataIni,
            data_final: dataFim
        };

        var relatorioData = apiPost('/presenca/relatorio/reuniao', payload);
        tableRelatorioBody.empty();

        if (relatorioData && Array.isArray(relatorioData) && relatorioData.length > 0) {
            relatorioData.forEach(function(item) {
                var presencas = parseInt(item.presencas) || 0;
                var ausencias = parseInt(item.ausencias) || 0;
                var justificadas = parseInt(item.justificadas) || 0;
                var row = $('<tr></tr>');
                var cor = ausencias < 4 ? 'green' : 'red';
                row.append($('<td></td>').css({ 'text-align': 'left', 'font-weight': 'bold', color: cor }).text(item.nome));
                row.append($('<td></td>').text(presencas));
                row.append($('<td></td>').text(ausencias));
                row.append($('<td></td>').text(justificadas));
                tableRelatorioBody.append(row);
            });
            relatorioContainer.show();
        } else {
            tableRelatorioBody.append('<tr><td colspan="4">Nenhum dado encontrado para o período selecionado.</td></tr>');
            relatorioContainer.show();
        }
    }

    formRelatorio.on('submit', function(e) {
        e.preventDefault();
        var dataIni = inputDataInicial.val();
        var dataFim = inputDataFinal.val();

        if (dataIni && dataFim) {
            gerarRelatorio(dataIni, dataFim);
        }
    });
});
