$(document).ready(function() {
    var params = getUrlParameters();
    if (params.sucess) {
        $('#msg-sucesso').show().fadeOut(3000);
    }
    if (params.delete) {
        $('#msg-delete').show().fadeOut(3000);
    }

    if ($('#tabela-monitores').length) {
        carregarTabelaMonitores();
        $('#buscaMonitore').on('input', function() {
            var termo = normalizarTexto($(this).val());
            var linhas = $('#tabela-monitores tr[data-search]');
            var linhasVisiveis = 0;

            $('#nenhum-resultado-monitore').remove();
            linhas.each(function() {
                var corresponde = normalizarTexto($(this).attr('data-search')).includes(termo);
                $(this).toggle(corresponde);
                if (corresponde) {
                    linhasVisiveis++;
                }
            });

            if (linhas.length && !linhasVisiveis) {
                $('#tabela-monitores').append('<tr id="nenhum-resultado-monitore"><td colspan="4" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhum monitore encontrado para essa busca.</td></tr>');
            }
        });
        $(document).on('click', '.btn-excluir-monitore', function() {
            var row = $(this).closest('tr');
            excluirMonitore($(this).data('id'), row.data('name'));
        });
    }

    if ($('#formCriarMonitore').length) {
        $('#formCriarMonitore').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/monitore', formData);
            if (resp && resp.access !== false) {
                alert("Monitore cadastrade com sucesso!");
                window.location.assign('/monitore?sucess=true');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao cadastrar monitore.");
            }
        });
    }

    if ($('#formSalvarMonitore').length) {
        var monitoreId = params.monitore || params.id;
        if (monitoreId) {
            carregarDetalhesMonitore(monitoreId);
        } else {
            $('#blocoEditar').prepend('<h4 style="color:#92400e; font-weight:600; margin-bottom:1rem;">Acesse a edição pelo botão <strong>Editar</strong> na listagem.</h4>');
        }

        $('#formSalvarMonitore').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/monitore/salvar', formData);
            if (resp && resp.access !== false) {
                alert("Monitore atualizade com sucesso!");
                window.location.assign('/monitore?sucess=true');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao atualizar monitore.");
            }
        });
    }

    // 3. Tela de Editar Presença Monitore
    if ($('#btnBuscarPresencaMonitore').length) {
        if (!params.monitore) {
            window.location.replace('/monitore');
            return;
        }

        var monitoreSelecionado = apiGet('/monitore?id=' + encodeURIComponent(params.monitore));
        $('#nomeMonitoreSelecionado').text(monitoreSelecionado ? monitoreSelecionado.nome : 'Monitore ' + params.monitore);
        carregarSalasSelect('#selectSalaPresenca', params.sala);
        if (params.data) {
            $('#dataPresencaMonitore').val(params.data);
        }

        $('#btnBuscarPresencaMonitore').click(function() {
            var monitore = params.monitore;
            var sala = $('#selectSalaPresenca').val();
            var data = $('#dataPresencaMonitore').val();

            if (!monitore || !sala || !data) {
                alert("Preencha todos os campos para buscar a presença.");
                return;
            }

            var resp = apiPost('/presenca/monitore/buscar', {
                monitore: monitore,
                sala: sala,
                data: data
            });

            $('#blocoResultadoMonitore').show();
            if (resp && resp.presente) {
                $('#statusPresencaMonitore').val(resp.presente);
                $('#msgPresencaMonitoreNaoEncontrada').hide();
                $('#formSalvarPresencaMonitore').show();
            } else {
                $('#msgPresencaMonitoreNaoEncontrada').show();
                $('#formSalvarPresencaMonitore').hide();
            }
        });

        $('#formSalvarPresencaMonitore').submit(function(e) {
            e.preventDefault();
            var monitore = params.monitore;
            var sala = $('#selectSalaPresenca').val();
            var data = $('#dataPresencaMonitore').val();
            var presente = $('#statusPresencaMonitore').val();

            var resp = apiPost('/presenca/monitore/editar', {
                monitore: monitore,
                sala: sala,
                data: data,
                presente: presente
            });

            if (resp && resp.access !== false) {
                alert("Presença de monitore atualizada com sucesso!");
                $('#msg-sucesso').show().fadeOut(3000);
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao atualizar presença.");
            }
        });
    }
});

function carregarTabelaMonitores() {
    var monitores = apiGet('/monitores');
    if (Array.isArray(monitores) && monitores.length > 0) {
        var html = '';
        monitores.forEach(function(monitore) {
            var searchText = escaparHtml([monitore.nome, monitore.usuario, monitore.id].join(' '));
            var nome = escaparHtml(monitore.nome);
            html += `<tr data-name="${nome}" data-search="${searchText}" style="border-bottom:1px solid #f3f4f6; transition:background 0.15s;">
                <td style="padding:1rem; color:#9ca3af; font-size:0.75rem;">${escaparHtml(monitore.id)}</td>
                <td style="padding:1rem; font-weight:500; color:#111827;">${nome}</td>
                <td style="padding:1rem; color:#6b7280;">${escaparHtml(monitore.usuario)}</td>
                <td style="padding:1rem; text-align:center;">
                    <a href="/monitore/editar?monitore=${encodeURIComponent(monitore.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fffbeb; color:#92400e; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fde68a; transition:all 0.15s;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                        <i class="fas fa-edit" style="font-size:0.7rem;"></i> Editar
                    </a>
                    <a href="/monitore/presenca?monitore=${encodeURIComponent(monitore.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fffbeb; color:#92400e; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fde68a; transition:all 0.15s; margin-left:0.25rem;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                        <i class="fas fa-calendar-check" style="font-size:0.7rem;"></i> Presença
                    </a>
                    <button type="button" class="btn-excluir-monitore" data-id="${escaparHtml(monitore.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fee2e2; color:#991b1b; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fecaca; transition:all 0.15s; margin-left:0.25rem;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                        <i class="fas fa-trash" style="font-size:0.7rem;"></i> Excluir
                    </button>
                </td>
            </tr>`;
        });
        $('#tabela-monitores').html(html);
    } else {
        $('#tabela-monitores').html('<tr><td colspan="4" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhum monitore cadastrado.</td></tr>');
    }
}

function excluirMonitore(id, nome) {
    if (!confirm('Tem certeza que deseja excluir o monitore "' + nome + '"?')) {
        return false;
    }

    var resp = apiPost('/monitore/excluir', { id: id });
    if (resp && resp.access !== false) {
        alert("Monitore excluíde com sucesso!");
        window.location.assign('/monitore?delete=true');
    } else {
        alert(resp && resp.message ? resp.message : "Erro ao excluir monitore.");
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

function loadMonitores(selector, selectedId) {
    var monitores = apiGet('/monitores');
    if (monitores && Array.isArray(monitores)) {
        var options = '<option value="">Selecione um monitore</option>';
        monitores.forEach(function(m) {
            var isSel = (selectedId && String(m.id) === String(selectedId)) ? 'selected' : '';
            options += `<option value="${m.id}" ${isSel}>${m.nome}</option>`;
        });
        $(selector).html(options);

    }
}

function carregarSalasSelect(selector, selectedId) {
    var salas = apiGet('/salas');
    if (salas && Array.isArray(salas)) {
        var options = '<option value="">Selecione uma sala</option>';
        salas.forEach(function(s) {
            var isSel = (selectedId && String(s.id) === String(selectedId)) ? 'selected' : '';
            options += `<option value="${s.id}" ${isSel}>${s.nome}</option>`;
        });
        $(selector).html(options);
    }
}

function carregarDetalhesMonitore(id) {
    var monitore = apiGet('/monitore?id=' + id);
    if (monitore) {
        $('#monitoreId').val(monitore.id || id);
        $('#monitoreNome').val(monitore.nome || '');
        $('#monitoreUsuario').val(monitore.usuario || '');
        $('#monitoreSenha').val('');
        $('#blocoEditar').show();
    }
}
