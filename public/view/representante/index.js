function getFormData(form) {
    return new FormData(form);
}

$(document).ready(function() {
    // Menu carregado automaticamente

    var params = getUrlParameters();
    carregarTabelaRepresentantes();
    if ($('#tabela-representantes').length) {
        $('#buscaRepresentante').on('input', function() {
            var termo = normalizarTextoRepresentante($(this).val());
            var linhas = $('#tabela-representantes tr[data-search]');
            var linhasVisiveis = 0;

            $('#nenhum-resultado-representante').remove();
            linhas.each(function() {
                var corresponde = normalizarTextoRepresentante($(this).attr('data-search')).includes(termo);
                $(this).toggle(corresponde);
                if (corresponde) {
                    linhasVisiveis++;
                }
            });

            if (linhas.length && !linhasVisiveis) {
                $('#tabela-representantes').append('<tr id="nenhum-resultado-representante"><td colspan="5" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhum representante encontrado para essa busca.</td></tr>');
            }
        });
    }
    $(document).on('click', '.btn-excluir-representante', function() {
        var row = $(this).closest('tr');
        excluirRepresentante($(this).data('id'), row.data('name'));
    });
    if (params.sucess) {
        $('#msg-sucesso').show().fadeOut(3000);
    }
    if (params.delete) {
        $('#msg-delete').show().fadeOut(3000);
    }

    // 1. Tela de Cadastro de Representante
    if ($('#formCriarRepresentante').length) {
        $('#formCriarRepresentante').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/representante', formData);
            if (resp && resp.access !== false) {
                alert("Representante cadastrade com sucesso!");
                window.location.assign('/representante');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao cadastrar representante.");
            }
        });
    }

    // 2. Tela de Edição de Representante
    if ($('#formSalvarRepresentante').length) {
        if (params.representante || params.id) {
            carregarDetalhesRepresentante(params.representante || params.id);
            setTimeout(function() {
                if (!$('#representanteId').val()) {
                    $('#blocoEditar').prepend('<h4 style="color:#dc2626; font-weight:600; margin-bottom:1rem;">Erro ao carregar dados do representante selecionado.</h4>');
                }
            }, 500);
        } else {
            $('#blocoEditar').show();
            $('#blocoEditar').prepend('<h4 style="color:#92400e; font-weight:600; margin-bottom:1rem;">Acesse pelo link <strong>Editar</strong> na lista para editar um representante específico.</h4>');
        }

        $('#formSalvarRepresentante').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/representante/salvar', formData);
            if (resp && resp.access !== false) {
                alert("Representante atualizade com sucesso!");
                window.location.assign('/representante');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao atualizar representante.");
            }
        });


    }
});

function loadRepresentantes(selector, selectedId) {
    var representantes = apiGet('/representantes');
    if (representantes && Array.isArray(representantes)) {
        var options = '<option value="">Selecione um representante</option>';
        representantes.forEach(function(r) {
            var isSel = (selectedId && String(r.id) === String(selectedId)) ? 'selected' : '';
            options += `<option value="${r.id}" ${isSel}>${r.nome}</option>`;
        });
        $(selector).html(options);

        if (selectedId && selector === '#selectRepresentante') {
            carregarDetalhesRepresentante(selectedId);
        }
    }
}

function carregarDetalhesRepresentante(id) {
    var representante = apiGet('/representante?id=' + id);
    if (representante) {
        $('#representanteId').val(representante.id || id);
        $('#representanteNome').val(representante.nome || '');
        $('#representanteUsuario').val(representante.usuario || '');
        $('#representanteSenha').val('');

        var imgUrl = '/public/assinatura/' + id + '.png?t=' + new Date().getTime();
        var imgTester = new Image();
        imgTester.onload = function() {
            $('#imgAssinaturaAtual').attr('src', imgUrl);
            $('#blocoAssinaturaAtual').show();
        };
        imgTester.onerror = function() {
            $('#blocoAssinaturaAtual').hide();
        };
        imgTester.src = imgUrl;

        $('#blocoEditar').show();
    }
}


function carregarTabelaRepresentantes() {
    var reps = apiGet('/representantes');
    if (reps && Array.isArray(reps) && reps.length > 0) {
        var html = '';
        reps.forEach(function(r) {
            var representanteId = escaparHtmlRepresentante(r.id);
            var assinaturaUrlId = encodeURIComponent(r.id == null ? '' : r.id);
            var nome = escaparHtmlRepresentante(r.nome);
            var usuario = escaparHtmlRepresentante(r.usuario);
            html += `<tr data-name="${nome}" data-search="${escaparHtmlRepresentante([r.nome, r.usuario, r.id].join(' '))}" style="border-bottom:1px solid #f3f4f6; transition:background 0.15s;">
                <td style="padding:1rem; color:#9ca3af; font-size:0.75rem;">${representanteId}</td>
                <td style="padding:1rem; font-weight:500; color:#111827;">${nome}</td>
                <td style="padding:1rem; color:#6b7280;">${usuario}</td>
                <td style="padding:1rem;"><img src="/public/assinatura/${assinaturaUrlId}.png" alt="Assinatura de ${nome}" style="display:block; max-width:120px; max-height:48px; object-fit:contain;" onerror="this.replaceWith(document.createTextNode('Sem assinatura'))"></td>
                <td style="padding:1rem; text-align:center;">
                    <a href="/representante/editar?representante=${assinaturaUrlId}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fffbeb; color:#92400e; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fde68a; transition:all 0.15s;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                        <i class="fas fa-edit" style="font-size:0.7rem;"></i> Editar
                    </a>
                    <button class="btn-excluir-representante" data-id="${representanteId}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fee2e2; color:#991b1b; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fecaca; transition:all 0.15s; margin-left:0.25rem;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                        <i class="fas fa-trash" style="font-size:0.7rem;"></i> Excluir
                    </button>
                </td>
            </tr>`;
        });
        $('#tabela-representantes').html(html);
    } else {
        $('#tabela-representantes').html('<tr><td colspan="5" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhum representante encontrado.</td></tr>');
    }
}

function escaparHtmlRepresentante(value) {
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

function normalizarTextoRepresentante(value) {
    return String(value == null ? '' : value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function excluirRepresentante(id, nome) {
    if (!confirm('Tem certeza que deseja excluir o representante "' + nome + '"?')) {
        return false;
    }
    var resp = apiPost('/representante/excluir', { id: id });
    if (resp && resp.access !== false) {
        alert("Representante excluíde com sucesso!");
        window.location.assign('/representante');
    } else {
        alert(resp && resp.message ? resp.message : "Erro ao excluir representante.");
    }
}
