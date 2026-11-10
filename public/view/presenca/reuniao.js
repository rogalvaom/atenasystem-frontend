$(document).ready(function() {
    var tableTutoresBody = $('#tableTutores tbody');
    var formCadastro = $('#formCadastroReuniao');
    var messageStatus = $('#messageStatusReuniao');

    // Carregar tutores
    var tutores = apiGet('/tutores');
    tableTutoresBody.empty();
    if (tutores && Array.isArray(tutores)) {
        tutores.forEach(function(t) {
            var row = $('<tr></tr>');
            row.append($('<td></td>').css({ 'text-align': 'left', 'vertical-align': 'middle', padding: '0.75rem' }).text(t.nome));
            var checkbox = $('<input>', {
                type: 'checkbox',
                name: 'presente[]',
                value: t.id,
                'aria-label': 'Marcar ' + t.nome + ' como presente'
            }).css({ transform: 'scale(1.2)' });
            row.append($('<td></td>').css({ 'text-align': 'center', 'vertical-align': 'middle', padding: '0.75rem' }).append(checkbox));
            tableTutoresBody.append(row);
        });
    }

    formCadastro.on('submit', function(e) {
        e.preventDefault();
        var data = $('#inputDataReuniao').val();
        var presentes = [];
        $('#tableTutores input[name="presente[]"]:checked').each(function() {
            presentes.push($(this).val());
        });

        var payload = {
            data: data,
            presente: presentes
        };

        var resp = apiPost('/presenca/reuniao', payload);
        if (resp && resp.access) {
            alert(resp.message || 'Presença de reunião salva com sucesso!');
            messageStatus.text('Presença cadastrada com sucesso!').css('color', 'green').show();
        } else {
            alert(resp && resp.message ? resp.message : 'Erro ao cadastrar presença.');
            messageStatus.text(resp && resp.message ? resp.message : 'Erro ao cadastrar presença.').css('color', 'red').show();
        }
    });
});
