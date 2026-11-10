$(document).ready(function() {
    var params = getUrlParameters();
    if (params.sucess) {
        $('#msg-sucesso').show().fadeOut(3000);
    }
    if (params.delete) {
        $('#msg-delete').show().fadeOut(3000);
    }

    if ($('#tabela-salas').length) {
        carregarTabelaSalas();
        $('#buscaSala').on('input', function() {
            var termo = normalizarTexto($(this).val());
            var linhas = $('#tabela-salas tr[data-search]');
            var linhasVisiveis = 0;

            $('#nenhum-resultado-sala').remove();
            linhas.each(function() {
                var corresponde = normalizarTexto($(this).attr('data-search')).includes(termo);
                $(this).toggle(corresponde);
                if (corresponde) {
                    linhasVisiveis++;
                }
            });

            if (linhas.length && !linhasVisiveis) {
                $('#tabela-salas').append('<tr id="nenhum-resultado-sala"><td colspan="3" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhuma sala encontrada para essa busca.</td></tr>');
            }
        });
        $(document).on('click', '.btn-excluir-sala', function() {
            var row = $(this).closest('tr');
            excluirSala($(this).data('id'), row.data('name'));
        });
    }

    if ($('#formCriarSala').length) {
        $('#formCriarSala').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/sala', formData);
            if (resp && resp.access !== false) {
                alert("Sala cadastrada com sucesso!");
                window.location.assign('/sala?sucess=true');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao cadastrar sala.");
            }
        });
    }

    if ($('#formSalvarSala').length) {
        var salaId = params.sala || params.id;
        if (salaId) {
            carregarDetalhesSala(salaId);
        } else {
            $('#orientacaoEditar').show();
        }

        $('#formSalvarSala').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/sala/salvar', formData);
            if (resp && resp.access !== false) {
                alert("Sala atualizada com sucesso!");
                window.location.assign('/sala?sucess=true');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao atualizar sala.");
            }
        });
    }
});

function carregarTabelaSalas() {
    var salas = apiGet('/salas');
    if (Array.isArray(salas) && salas.length > 0) {
        var html = '';
        salas.forEach(function(sala) {
            var searchText = escaparHtml([sala.nome, sala.id].join(' '));
            var nome = escaparHtml(sala.nome);
            html += `<tr data-name="${nome}" data-search="${searchText}" style="border-bottom:1px solid #f3f4f6; transition:background 0.15s;">
                <td style="padding:1rem; color:#9ca3af; font-size:0.75rem;">${escaparHtml(sala.id)}</td>
                <td style="padding:1rem; font-weight:500; color:#111827;">${nome}</td>
                <td style="padding:1rem; text-align:center;">
                    <a href="/sala/editar?sala=${encodeURIComponent(sala.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fffbeb; color:#92400e; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fde68a; transition:all 0.15s;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                        <i class="fas fa-edit" style="font-size:0.7rem;"></i> Editar
                    </a>
                    <button type="button" class="btn-excluir-sala" data-id="${escaparHtml(sala.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fee2e2; color:#991b1b; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fecaca; transition:all 0.15s; margin-left:0.25rem;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                        <i class="fas fa-trash" style="font-size:0.7rem;"></i> Excluir
                    </button>
                </td>
            </tr>`;
        });
        $('#tabela-salas').html(html);
    } else {
        $('#tabela-salas').html('<tr><td colspan="3" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhuma sala cadastrada.</td></tr>');
    }
}

function excluirSala(id, nome) {
    if (!confirm('Tem certeza que deseja excluir a sala "' + nome + '"?')) {
        return false;
    }

    var resp = apiPost('/sala/excluir', { id: id });
    if (resp && resp.access !== false) {
        alert("Sala excluída com sucesso!");
        window.location.assign('/sala?delete=true');
    } else {
        alert(resp && resp.message ? resp.message : "Erro ao excluir sala.");
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

function carregarDetalhesSala(id) {
    var sala = apiGet('/sala?id=' + encodeURIComponent(id));
    if (sala) {
        $('#salaId').val(id);
        $('#salaNome').val(sala.nome || '');
        $('#blocoEditar').show();
        $('#orientacaoEditar').hide();
    } else {
        $('#orientacaoEditar').text('Não foi possível carregar a sala selecionada.').css('color', '#dc2626').show();
    }
}
