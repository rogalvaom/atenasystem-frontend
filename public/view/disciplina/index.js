$(document).ready(function() {
    var params = getUrlParameters();
    if (params.sucess) {
        $('#msg-sucesso').show().fadeOut(3000);
    }
    if (params.delete) {
        $('#msg-delete').show().fadeOut(3000);
    }

    if ($('#tabela-disciplinas').length) {
        carregarTabelaDisciplinas();
        $('#buscaDisciplina').on('input', function() {
            var termo = normalizarTexto($(this).val());
            var linhas = $('#tabela-disciplinas tr[data-search]');
            var linhasVisiveis = 0;

            $('#nenhum-resultado-disciplina').remove();
            linhas.each(function() {
                var corresponde = normalizarTexto($(this).attr('data-search')).includes(termo);
                $(this).toggle(corresponde);
                if (corresponde) {
                    linhasVisiveis++;
                }
            });

            if (linhas.length && !linhasVisiveis) {
                $('#tabela-disciplinas').append('<tr id="nenhum-resultado-disciplina"><td colspan="3" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhuma disciplina encontrada para essa busca.</td></tr>');
            }
        });
        $(document).on('click', '.btn-excluir-disciplina', function() {
            var row = $(this).closest('tr');
            excluirDisciplina($(this).data('id'), row.data('name'));
        });
    }

    if ($('#formCriarDisciplina').length) {
        $('#formCriarDisciplina').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/disciplina', formData);
            if (resp && resp.access !== false) {
                alert("Disciplina cadastrada com sucesso!");
                window.location.assign('/disciplina?sucess=true');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao cadastrar disciplina.");
            }
        });
    }

    if ($('#formSalvarDisciplina').length) {
        var disciplinaId = params.disciplina || params.id;
        if (disciplinaId) {
            carregarDetalhesDisciplina(disciplinaId);
        } else {
            $('#blocoEditar').prepend('<h4 style="color:#92400e; font-weight:600; margin-bottom:1rem;">Acesse a edição pelo botão <strong>Editar</strong> na listagem.</h4>');
        }

        $('#formSalvarDisciplina').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/disciplina/salvar', formData);
            if (resp && resp.access !== false) {
                alert("Disciplina atualizada com sucesso!");
                window.location.assign('/disciplina?sucess=true');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao atualizar disciplina.");
            }
        });
    }
});

function carregarTabelaDisciplinas() {
    var disciplinas = apiGet('/disciplinas');
    if (Array.isArray(disciplinas) && disciplinas.length > 0) {
        var html = '';
        disciplinas.forEach(function(disciplina) {
            var searchText = escaparHtml([disciplina.nome, disciplina.id].join(' '));
            var nome = escaparHtml(disciplina.nome);
            html += `<tr data-name="${nome}" data-search="${searchText}" style="border-bottom:1px solid #f3f4f6; transition:background 0.15s;">
                <td style="padding:1rem; color:#9ca3af; font-size:0.75rem;">${escaparHtml(disciplina.id)}</td>
                <td style="padding:1rem; font-weight:500; color:#111827;">${nome}</td>
                <td style="padding:1rem; text-align:center;">
                    <a href="/disciplina/editar?disciplina=${encodeURIComponent(disciplina.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fffbeb; color:#92400e; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fde68a; transition:all 0.15s;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                        <i class="fas fa-edit" style="font-size:0.7rem;"></i> Editar
                    </a>
                    <button type="button" class="btn-excluir-disciplina" data-id="${escaparHtml(disciplina.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fee2e2; color:#991b1b; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fecaca; transition:all 0.15s; margin-left:0.25rem;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                        <i class="fas fa-trash" style="font-size:0.7rem;"></i> Excluir
                    </button>
                </td>
            </tr>`;
        });
        $('#tabela-disciplinas').html(html);
    } else {
        $('#tabela-disciplinas').html('<tr><td colspan="3" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhuma disciplina cadastrada.</td></tr>');
    }
}

function excluirDisciplina(id, nome) {
    if (!confirm('Tem certeza que deseja excluir a disciplina "' + nome + '"?')) {
        return false;
    }

    var resp = apiPost('/disciplina/excluir', { id: id });
    if (resp && resp.access !== false) {
        alert("Disciplina excluída com sucesso!");
        window.location.assign('/disciplina?delete=true');
    } else {
        alert(resp && resp.message ? resp.message : "Erro ao excluir disciplina.");
    }
}

function escaparHtml(value) {
    var entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(character) {
        return entities[character];
    });
}

function normalizarTexto(value) {
    return String(value == null ? '' : value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function carregarDetalhesDisciplina(id) {
    var disciplina = apiGet('/disciplina?id=' + encodeURIComponent(id));
    if (disciplina) {
        $('#disciplinaId').val(disciplina.id || id);
        $('#disciplinaNome').val(disciplina.nome || '');
        $('#blocoEditar').show();
    } else {
        $('#blocoEditar').prepend('<h4 style="color:#dc2626; font-weight:600; margin-bottom:1rem;">Não foi possível carregar a disciplina selecionada.</h4>');
    }
}
