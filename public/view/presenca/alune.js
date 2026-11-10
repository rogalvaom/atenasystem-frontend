$(document).ready(function() {
    var selectSala = $('#selectSala');
    var formBuscarSala = $('#formBuscarSala');
    var formCriarPresenca = $('#formCriarPresenca');
    var formPresencaContainer = $('#formPresencaContainer');
    var tableAlunesBody = $('#tableAlunes tbody');
    var inputSalaId = $('#inputSalaId');
    var messageStatus = $('#messageStatus');

    // Carregar salas
    function carregarSalas() {
        var salas = apiGet('/salas');
        selectSala.empty();
        if (salas && Array.isArray(salas)) {
            selectSala.append('<option value="">Selecione uma sala</option>');
            salas.forEach(function(sala) {
                selectSala.append($('<option></option>').val(sala.id).text(sala.nome));
            });

            var urlParams = new URLSearchParams(window.location.search);
            var salaIdFromUrl = urlParams.get('sala');
            if (salaIdFromUrl) {
                selectSala.val(salaIdFromUrl);
                buscarAlunosPorSala(salaIdFromUrl);
            }
        } else {
            selectSala.append('<option value="">Erro ao carregar salas</option>');
        }
    }

    function buscarAlunosPorSala(salaId) {
        if (!salaId) {
            formPresencaContainer.hide();
            return;
        }

        var alunes = apiGet('/alune/sala', { sala: salaId });
        tableAlunesBody.empty();
        inputSalaId.val(salaId);

        if (alunes && Array.isArray(alunes) && alunes.length > 0) {
            alunes.forEach(function(alune) {
                var row = $('<tr></tr>');
                row.append($('<td></td>').css({ 'text-align': 'left', 'vertical-align': 'middle', padding: '0.75rem' }).text(alune.nome));
                var checkbox = $('<input>', {
                    type: 'checkbox',
                    name: 'presente[]',
                    value: alune.id,
                    'aria-label': 'Marcar ' + alune.nome + ' como presente'
                }).css({ transform: 'scale(1.2)' });
                row.append($('<td></td>').css({ 'text-align': 'center', 'vertical-align': 'middle', padding: '0.75rem' }).append(checkbox));
                tableAlunesBody.append(row);
            });
            formPresencaContainer.show();
            messageStatus.hide();
        } else {
            formPresencaContainer.hide();
            messageStatus.text('Nenhum alune encontrado para esta sala.').css('color', 'red').show();
        }
    }

    formBuscarSala.on('submit', function(e) {
        e.preventDefault();
        var salaId = selectSala.val();
        if (salaId) {
            buscarAlunosPorSala(salaId);
        } else {
            alert('Por favor, selecione uma sala.');
        }
    });

    formCriarPresenca.on('submit', function(e) {
        e.preventDefault();
        var sala = inputSalaId.val();
        var data = $('#inputData').val();
        var aula = $('#selectAula').val();

        var presentes = [];
        $('#tableAlunes input[name="presente[]"]:checked').each(function() {
            presentes.push($(this).val());
        });

        var payload = {
            sala: sala,
            data: data,
            aula: aula,
            presente: presentes
        };

        var resp = apiPost('/presenca/alune', payload);
        if (resp && resp.access) {
            alert(resp.message || 'Presença salva com sucesso!');
            messageStatus.text('Presença salva com sucesso!').css('color', 'green').show();
        } else {
            alert(resp && resp.message ? resp.message : 'Erro ao salvar presença.');
            messageStatus.text(resp && resp.message ? resp.message : 'Erro ao salvar presença.').css('color', 'red').show();
        }
    });

    carregarSalas();
});
