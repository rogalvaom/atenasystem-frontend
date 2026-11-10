$(document).ready(function() {
    var params = getUrlParameters();

    if (params.sucess) {
        $('#msg-sucesso').show().fadeOut(3000);
    }
    if (params.delete) {
        $('#msg-delete').show().fadeOut(3000);
    }

    if ($('#tabela-comissoes').length) {
        carregarTabelaComissoes();
        $('#buscaComissao').on('input', function() {
            var termo = normalizarTexto($(this).val());
            var linhas = $('#tabela-comissoes tr[data-search]');
            var linhasVisiveis = 0;

            $('#nenhum-resultado-comissao').remove();
            linhas.each(function() {
                var corresponde = normalizarTexto($(this).attr('data-search')).includes(termo);
                $(this).toggle(corresponde);
                if (corresponde) {
                    linhasVisiveis++;
                }
            });

            if (linhas.length && !linhasVisiveis) {
                $('#tabela-comissoes').append('<tr id="nenhum-resultado-comissao"><td colspan="4" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhuma comissão encontrada para essa busca.</td></tr>');
            }
        });

        $(document).on('click', '.btn-excluir-comissao', function() {
            var row = $(this).closest('tr');
            excluirComissao($(this).data('id'), row.data('name'));
        });
    }

    if ($('#formCriarComissao').length) {
        $('#formCriarComissao').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/comissao', formData);
            if (resp && resp.access !== false) {
                alert("Comissão cadastrada com sucesso!");
                window.location.assign('/comissao?sucess=true');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao cadastrar comissão.");
            }
        });
    }

    if ($('#formSalvarComissao').length) {
        var comissaoId = params.comissao || params.id;
        if (comissaoId) {
            carregarDetalhesComissao(comissaoId);
        } else {
            $('#blocoEditar').prepend('<h4 style="color:#92400e; font-weight:600; margin-bottom:1rem;">Selecione <strong>Editar</strong> na listagem para abrir uma comissão.</h4>');
        }

        $('#formSalvarComissao').submit(function(e) {
            e.preventDefault();
            var formData = getFormData(this);
            var resp = apiPost('/comissao/salvar', formData);
            if (resp && resp.access !== false) {
                alert("Comissão atualizada com sucesso!");
                window.location.assign('/comissao?sucess=true');
            } else {
                alert(resp && resp.message ? resp.message : "Erro ao atualizar comissão.");
            }
        });
    }
});

function carregarTabelaComissoes() {
    var comissoes = apiGet('/comissoes');
    if (Array.isArray(comissoes) && comissoes.length > 0) {
        var html = '';
        comissoes.forEach(function(comissao) {
            var searchText = escaparHtml([comissao.nome, comissao.usuario, comissao.id].join(' '));
            var nome = escaparHtml(comissao.nome);
            html += `<tr data-name="${nome}" data-search="${searchText}" style="border-bottom:1px solid #f3f4f6; transition:background 0.15s;">
                <td style="padding:1rem; color:#9ca3af; font-size:0.75rem;">${escaparHtml(comissao.id)}</td>
                <td style="padding:1rem; font-weight:500; color:#111827;">${nome}</td>
                <td style="padding:1rem; color:#6b7280;">${escaparHtml(comissao.usuario)}</td>
                <td style="padding:1rem; text-align:center;">
                    <a href="/comissao/editar?comissao=${encodeURIComponent(comissao.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fffbeb; color:#92400e; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fde68a; transition:all 0.15s;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                        <i class="fas fa-edit" style="font-size:0.7rem;"></i> Editar
                    </a>
                    <button type="button" class="btn-excluir-comissao" data-id="${escaparHtml(comissao.id)}" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.35rem 0.75rem; border-radius:0.5rem; background:#fee2e2; color:#991b1b; font-size:0.75rem; font-weight:600; text-decoration:none; border:1px solid #fecaca; transition:all 0.15s; margin-left:0.25rem;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                        <i class="fas fa-trash" style="font-size:0.7rem;"></i> Excluir
                    </button>
                </td>
            </tr>`;
        });
        $('#tabela-comissoes').html(html);
    } else {
        $('#tabela-comissoes').html('<tr><td colspan="4" style="padding:2rem; text-align:center; color:#9ca3af;">Nenhuma comissão cadastrada.</td></tr>');
    }
}

function carregarDetalhesComissao(id) {
    var comissao = apiGet('/comissao?id=' + encodeURIComponent(id));
    if (comissao) {
        $('#comissaoId').val(comissao.id || id);
        $('#comissaoNome').val(comissao.nome || '');
        $('#comissaoUsuario').val(comissao.usuario || '');
        $('#comissaoSenha').val('');
    } else {
        $('#blocoEditar').prepend('<h4 style="color:#dc2626; font-weight:600; margin-bottom:1rem;">Não foi possível carregar a comissão selecionada.</h4>');
    }
}

function excluirComissao(id, nome) {
    if (!confirm('Tem certeza que deseja excluir a comissão "' + nome + '"?')) {
        return false;
    }

    var resp = apiPost('/comissao/excluir', { id: id });
    if (resp && resp.access !== false) {
        alert("Comissão excluída com sucesso!");
        window.location.assign('/comissao?delete=true');
    } else {
        alert(resp && resp.message ? resp.message : "Erro ao excluir comissão.");
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
