$(document).ready(function() {
    var params = getUrlParameters();
    if (params.sucess) {
        $('#msg-sucesso').show().fadeOut(3000);
    }
    if (params.delete) {
        $('#msg-delete').show().fadeOut(3000);
    }

    if ($('#tabela-tutores').length) {
        carregarTabelaTutores();
        $('#buscaTutore').on('input', function() {
            var termo = normalizarTexto($(this).val());
            var linhas = $('#tabela-tutores tr[data-search]');
            var linhasVisiveis = 0;

            $('#nenhum-resultado-tutore').remove();
            linhas.each(function() {
                var corresponde = normalizarTexto($(this).attr('data-search')).includes(termo);
                $(this).toggle(corresponde);
                if (corresponde) {
                    linhasVisiveis++;
                }
            });

            if (linhas.length && !linhasVisiveis) {
                $('#tabela-tutores').append('<tr id="nenhum-resultado-tutore"><td colspan="4" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhum tutore encontrado para essa busca.</td></tr>');
            }
        });
        $(document).on('click', '.btn-excluir-tutore', function() {
            var row = $(this).closest('tr');
            excluirTutore($(this).data('id'), row.data('name'));
        });
    }

    if ($('#formCriarTutore').length) {
        carregarDisciplinasSelect('#selectDisciplinaCadastro');

        $('#formCriarTutore').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/tutore', formData);
            if (resp && resp.access !== false) {
                alert("Tutore cadastrade com sucesso!");
                window.location.assign('/tutore?sucess=true');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao cadastrar tutore.");
            }
        });
    }

    if ($('#formSalvarTutore').length) {
        var tutoreId = params.tutore || params.id;
        carregarDisciplinasSelect('#selectDisciplinaEdicao');
        if (tutoreId) {
            carregarDetalhesTutore(tutoreId);
        } else {
            $('#blocoEditar').prepend('<h4 style="color:#92400e; font-weight:600; margin-bottom:1rem;">Acesse a edição pelo botão <strong>Editar</strong> na listagem.</h4>');
        }

        $('#formSalvarTutore').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/tutore/salvar', formData);
            if (resp && resp.access !== false) {
                alert("Tutore atualizade com sucesso!");
                window.location.assign('/tutore?sucess=true');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao atualizar tutore.");
            }
        });
    }

    if ($('#btnBuscarPresencaReuniao').length) {
        if (!params.tutore) {
            window.location.replace('/tutore');
            return;
        }

        carregarNomeTutore(params.tutore, '#nomeTutoreJustifica');
        if (params.data) {
            $('#dataJustificaReuniao').val(params.data);
        }

        $('#btnBuscarPresencaReuniao').click(function() {
            var tutore = params.tutore;
            var data = $('#dataJustificaReuniao').val();

            if (!tutore || !data) {
                alert("Preencha todos os campos para buscar a presença.");
                return;
            }

            var resp = apiPost('/presenca/reuniao/buscar', {
                tutore: tutore,
                data: data
            });

            $('#blocoResultadoReuniao').show();
            if (resp && resp.presente) {
                $('#statusPresenteReuniao').val(resp.presente);
                $('#msgReuniaoNaoEncontrada').hide();
                $('#formSalvarJustificativaReuniao').show();
            } else {
                $('#msgReuniaoNaoEncontrada').show();
                $('#formSalvarJustificativaReuniao').hide();
            }
        });

        $('#formSalvarJustificativaReuniao').submit(function(e) {
            e.preventDefault();
            var tutore = params.tutore;
            var data = $('#dataJustificaReuniao').val();
            var presente = $('#statusPresenteReuniao').val();

            var resp = apiPost('/presenca/reuniao/justificar', {
                tutore: tutore,
                data: data,
                presente: presente
            });

            if (resp && resp.access !== false) {
                alert("Presença em reunião justificada com sucesso!");
                $('#msg-sucesso').show().fadeOut(3000);
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao justificar presença.");
            }
        });
    }

    if ($('#btnBuscarPresencaTutore').length) {
        if (!params.tutore) {
            window.location.replace('/tutore');
            return;
        }

        carregarNomeTutore(params.tutore, '#nomeTutorePresenca');
        carregarSalasSelect('#selectSalaPresenca', params.sala);
        if (params.data) {
            $('#dataPresencaTutore').val(params.data);
        }
        if (params.aula) {
            $('#selectAulaPresenca').val(params.aula);
        }

        $('#btnBuscarPresencaTutore').click(function() {
            var tutore = params.tutore;
            var sala = $('#selectSalaPresenca').val();
            var aula = $('#selectAulaPresenca').val();
            var data = $('#dataPresencaTutore').val();

            if (!tutore || !sala || !aula || !data) {
                alert("Preencha todos os campos para buscar a presença.");
                return;
            }

            var resp = apiPost('/presenca/tutore/buscar', {
                tutore: tutore,
                sala: sala,
                aula: aula,
                data: data
            });

            $('#blocoResultadoTutore').show();
            if (resp && resp.presente) {
                $('#statusPresencaTutore').val(resp.presente);
                $('#msgPresencaTutoreNaoEncontrada').hide();
                $('#formSalvarPresencaTutore').show();
            } else {
                $('#msgPresencaTutoreNaoEncontrada').show();
                $('#formSalvarPresencaTutore').hide();
            }
        });

        $('#formSalvarPresencaTutore').submit(function(e) {
            e.preventDefault();
            var tutore = params.tutore;
            var sala = $('#selectSalaPresenca').val();
            var aula = $('#selectAulaPresenca').val();
            var data = $('#dataPresencaTutore').val();
            var presente = $('#statusPresencaTutore').val();

            var resp = apiPost('/presenca/tutore/editar', {
                tutore: tutore,
                sala: sala,
                aula: aula,
                data: data,
                presente: presente
            });

            if (resp && resp.access !== false) {
                alert("Presença de tutore atualizada com sucesso!");
                $('#msg-sucesso').show().fadeOut(3000);
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao atualizar presença.");
            }
        });
    }
});

function carregarTabelaTutores() {
    var tutores = apiGet('/tutores');
    var disciplinas = apiGet('/disciplinas');
    var disciplinasPorId = {};

    if (Array.isArray(disciplinas)) {
        disciplinas.forEach(function(disciplina) {
            disciplinasPorId[String(disciplina.id)] = disciplina.nome;
        });
    }

    if (Array.isArray(tutores) && tutores.length > 0) {
        var html = '';
        tutores.forEach(function(tutore) {
            var disciplinaNome = disciplinasPorId[String(tutore.cod_disciplina)] || 'Disciplina ' + (tutore.cod_disciplina || '');
            var searchText = escaparHtml([tutore.nome, disciplinaNome, tutore.id].join(' '));
            var nome = escaparHtml(tutore.nome);
            html += `<tr data-name="${nome}" data-search="${searchText}" style="border-bottom:1px solid #f3f4f6; transition:background 0.15s;">
                <td style="padding:1rem; color:#9ca3af; font-size:0.75rem;">${escaparHtml(tutore.id)}</td>
                <td style="padding:1rem; font-weight:500; color:#111827;">${nome}</td>
                <td style="padding:1rem; color:#6b7280;">${escaparHtml(disciplinaNome)}</td>
                <td style="padding:1rem; text-align:center;">
                    <a href="/tutore/editar?tutore=${encodeURIComponent(tutore.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fffbeb; color:#92400e; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fde68a; transition:all 0.15s;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                        <i class="fas fa-edit" style="font-size:0.7rem;"></i> Editar
                    </a>
                    <a href="/tutore/presenca?tutore=${encodeURIComponent(tutore.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fffbeb; color:#92400e; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fde68a; transition:all 0.15s; margin-left:0.25rem;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                        <i class="fas fa-calendar-check" style="font-size:0.7rem;"></i> Presença
                    </a>
                    <a href="/tutore/justificar?tutore=${encodeURIComponent(tutore.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fffbeb; color:#92400e; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fde68a; transition:all 0.15s; margin-left:0.25rem;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                        <i class="fas fa-people-group" style="font-size:0.7rem;"></i> Reunião
                    </a>
                    <button type="button" class="btn-excluir-tutore" data-id="${escaparHtml(tutore.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fee2e2; color:#991b1b; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fecaca; transition:all 0.15s; margin-left:0.25rem;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                        <i class="fas fa-trash" style="font-size:0.7rem;"></i> Excluir
                    </button>
                </td>
            </tr>`;
        });
        $('#tabela-tutores').html(html);
    } else {
        $('#tabela-tutores').html('<tr><td colspan="4" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhum tutore cadastrado.</td></tr>');
    }
}

function excluirTutore(id, nome) {
    if (!confirm('Tem certeza que deseja excluir o tutore "' + nome + '"?')) {
        return false;
    }

    var resp = apiPost('/tutore/excluir', { id: id });
    if (resp && resp.access !== false) {
        alert("Tutore excluíde com sucesso!");
        window.location.assign('/tutore?delete=true');
    } else {
        alert(resp && resp.message ? resp.message : "Erro ao excluir tutore.");
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

function carregarNomeTutore(id, selector) {
    var tutore = apiGet('/tutore?id=' + encodeURIComponent(id));
    $(selector).text(tutore ? tutore.nome : 'Tutore ' + id);
}

function carregarDisciplinasSelect(selector, selectedId) {
    var disciplinas = apiGet('/disciplinas');
    if (disciplinas && Array.isArray(disciplinas)) {
        var options = '<option value="">Selecione uma disciplina</option>';
        disciplinas.forEach(function(d) {
            var isSel = (selectedId && String(d.id) === String(selectedId)) ? 'selected' : '';
            options += `<option value="${d.id}" ${isSel}>${d.nome}</option>`;
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

function carregarDetalhesTutore(id) {
    var tutore = apiGet('/tutore?id=' + encodeURIComponent(id));
    if (tutore) {
        $('#tutoreId').val(tutore.id || id);
        $('#tutoreNome').val(tutore.nome || '');
        if (tutore.cod_disciplina) {
            $('#selectDisciplinaEdicao').val(tutore.cod_disciplina);
        }
        $('#blocoEditar').show();
    }
}
