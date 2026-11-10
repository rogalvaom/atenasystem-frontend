$(document).ready(function() {
    var params = getUrlParameters();
    if (params.sucess) {
        $('#msg-sucesso').show().fadeOut(3000);
    }
    if (params.delete) {
        $('#msg-delete').show().fadeOut(3000);
    }

    if ($('#tabela-alunes').length) {
        carregarTabelaAlunes();
        $('#buscaAlune').on('input', function() {
            var termo = normalizarTexto($(this).val());
            var linhas = $('#tabela-alunes tr[data-search]');
            var linhasVisiveis = 0;

            $('#nenhum-resultado-busca').remove();
            linhas.each(function() {
                var corresponde = normalizarTexto($(this).attr('data-search')).includes(termo);
                $(this).toggle(corresponde);
                if (corresponde) {
                    linhasVisiveis++;
                }
            });

            if (linhas.length && !linhasVisiveis) {
                $('#tabela-alunes').append('<tr id="nenhum-resultado-busca"><td colspan="4" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhum alune encontrado.</td></tr>');
            }
        });
        $(document).on('click', '.btn-excluir-alune', function() {
            var row = $(this).closest('tr');
            excluirAlune($(this).data('id'), row.data('name'));
        });
    }

    // 1. Tela de Cadastro de Alune
    if ($('#formCriarAlune').length) {
        carregarSalasSelect('#selectSalaCadastro');

        $('#formCriarAlune').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/alune', formData);
            if (resp && resp.access !== false) {
                alert("Alune cadastrade com sucesso!");
                window.location.assign('/alune?sucess=true');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao cadastrar alune.");
            }
        });
    }

    // 2. Tela de Edição de Alune
    if ($('#selectAlune').length) {
        carregarSalasSelect('#selectSalaEdicao');
        loadAlunes(params.alune);

        $('#btnBuscarAlune').click(function() {
            var selectedId = $('#selectAlune').val();
            if (selectedId) {
                carregarDetalhesAlune(selectedId);
            }
        });

        $('#formSalvarAlune').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/alune/salvar', formData);
            if (resp && resp.access !== false) {
                alert("Alune atualizade com sucesso!");
                window.location.assign('/alune/editar?sucess=true&alune=' + formData.id);
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao atualizar alune.");
            }
        });

    }

    // 3. Tela de Justificar Presença
function carregarTabelaAlunes() {
    var alunes = apiGet('/alunes');
    var salas = apiGet('/salas');
    var salasPorId = {};

    if (Array.isArray(salas)) {
        salas.forEach(function(sala) {
            salasPorId[String(sala.id)] = sala.nome;
        });
    }

    if (Array.isArray(alunes) && alunes.length > 0) {
        var html = '';
        alunes.forEach(function(alune) {
            var salaNome = salasPorId[String(alune.cod_sala)] || 'Sala ' + (alune.cod_sala || '');
            var nome = escaparHtml(alune.nome);
            html += `<tr data-name="${nome}" data-search="${escaparHtml(alune.nome + ' ' + salaNome + ' ' + alune.id)}" style="border-bottom:1px solid #f3f4f6; transition:background 0.15s;">
                <td style="padding:1rem; color:#9ca3af; font-size:0.75rem;">${escaparHtml(alune.id)}</td>
                <td style="padding:1rem; font-weight:500; color:#111827;">${nome}</td>
                <td style="padding:1rem; color:#6b7280;">${escaparHtml(salaNome)}</td>
                <td style="padding:1rem; text-align:center;">
                    <a href="/alune/editar?alune=${encodeURIComponent(alune.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fffbeb; color:#92400e; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fde68a; transition:all 0.15s;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                            <i class="fas fa-edit" style="font-size:0.7rem;"></i> Editar
                        </a>
                        <a href="/alune/justificar?sala=${encodeURIComponent(alune.cod_sala)}&alune=${encodeURIComponent(alune.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fffbeb; color:#92400e; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fde68a; transition:all 0.15s; margin-left:0.25rem;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                            <i class="fas fa-calendar-check" style="font-size:0.7rem;"></i> Justificar
                        </a>
                    <button type="button" class="btn-excluir-alune" data-id="${escaparHtml(alune.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fee2e2; color:#991b1b; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fecaca; transition:all 0.15s; margin-left:0.25rem;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                            <i class="fas fa-trash" style="font-size:0.7rem;"></i> Excluir
                        </button>
                </td>
            </tr>`;
        });
        $('#tabela-alunes').html(html);
    } else {
        $('#tabela-alunes').html('<tr><td colspan="4" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhum alune cadastrado.</td></tr>');
    }
}

function excluirAlune(id, nome) {
    if (!confirm('Tem certeza que deseja excluir o alune "' + nome + '"?')) {
        return false;
    }

    var resp = apiPost('/alune/excluir', { id: id });
    if (resp && resp.access !== false) {
        alert("Alune excluíde com sucesso!");
        window.location.assign('/alune?delete=true');
    } else {
        alert(resp && resp.message ? resp.message : "Erro ao excluir alune.");
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

    if ($('#btnBuscarPresenca').length) {
        if (!params.sala || !params.alune) {
            window.location.replace('/alune');
            return;
        }

        carregarResumoJustificativa(params.sala, params.alune);
        $('#blocoAluneFiltro').show();
        $('#btnBuscarPresenca').click(function() {
            var sala = params.sala;
            var alune = params.alune;
            var data = $('#dataJustifica').val();
            var aula = $('#aulaJustifica').val();

            if (!sala || !alune || !data) {
                alert("Preencha todos os campos para buscar a presença.");
                return;
            }

            var resp = apiPost('/presenca/alune/buscar', {
                sala: sala,
                alune: alune,
                data: data,
                aula: aula
            });

            $('#blocoResultadoPresenca').show();
            if (resp && resp.presente) {
                $('#statusPresente').val(resp.presente);
                $('#msgNaoEncontrada').hide();
                $('#formSalvarJustificativa').show();
            } else {
                $('#msgNaoEncontrada').show();
                $('#formSalvarJustificativa').hide();
            }
        });

        $('#formSalvarJustificativa').submit(function(e) {
            e.preventDefault();
            var sala = params.sala;
            var alune = params.alune;
            var data = $('#dataJustifica').val();
            var aula = $('#aulaJustifica').val();
            var presente = $('#statusPresente').val();

            var resp = apiPost('/presenca/alune/justificar', {
                sala: sala,
                alune: alune,
                data: data,
                aula: aula,
                presente: presente
            });

            if (resp && resp.access !== false) {
                alert("Presença justificada com sucesso!");
                $('#msg-sucesso').show().fadeOut(3000);
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao justificar presença.");
            }
        });
    }
});

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

function loadAlunes(selectedId) {
    var alunes = apiGet('/alunes');
    if (alunes && Array.isArray(alunes)) {
        var options = '<option value="">Selecione um alune</option>';
        alunes.forEach(function(a) {
            var isSel = (selectedId && String(a.id) === String(selectedId)) ? 'selected' : '';
            options += `<option value="${a.id}" ${isSel}>${a.nome}</option>`;
        });
        $('#selectAlune').html(options);

        if (selectedId) {
            carregarDetalhesAlune(selectedId);
        }
    }
}

function carregarDetalhesAlune(id) {
    var alune = apiGet('/alune?id=' + id);
    if (alune) {
        $('#aluneId').val(alune.id || id);
        $('#aluneNome').val(alune.nome || '');
        if (alune.cod_sala) {
            $('#selectSalaEdicao').val(alune.cod_sala);
        }
        $('#blocoEditar').show();
    }
}

function carregarResumoJustificativa(salaId, aluneId) {
    var salas = apiGet('/salas');
    var alunes = apiGet('/alune/sala?sala=' + encodeURIComponent(salaId));
    var salaSelecionada = null;
    var aluneSelecionade = null;

    if (Array.isArray(salas)) {
        salas.forEach(function(sala) {
            if (String(sala.id) === String(salaId)) {
                salaSelecionada = sala;
            }
        });
    }

    if (Array.isArray(alunes)) {
        alunes.forEach(function(alune) {
            if (String(alune.id) === String(aluneId)) {
                aluneSelecionade = alune;
            }
        });
    }

    $('#nomeSalaSelecionada').text(salaSelecionada ? salaSelecionada.nome : 'Sala ' + salaId);
    $('#nomeAluneSelecionade').text(aluneSelecionade ? aluneSelecionade.nome : 'Alune ' + aluneId);
    $('#aluneSelecionadeContext').show();
}
