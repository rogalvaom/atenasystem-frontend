function buscarTutore(){
    var id = $("#tutore").val();
    if (!id) return;
    var response = apiPost('/certificado/tutore/buscar', { id: id });
    if(response && response.access){
        $('.nomeTutore').html(response.tutore.nome);
        $('.nomeMateria').html("Professor(a) de " + response.tutore.nome_disciplina);
    }
}

function buscarTutores(){
    var tutores = apiGet('/certificado/tutores');
    if (tutores && Array.isArray(tutores)) {
        $('#tutore').empty().append('<option value="">Selecione o tutore</option>');
        tutores.forEach(function(item) {
            $('#tutore').append('<option value="' + item.id + '">' + item.nome + '</option>');
        });
    }
}

function buscarRepresentantes(){
    var representantes = apiGet('/certificado/representantes');
    if (representantes && Array.isArray(representantes)) {
        $('#discente').empty().append('<option value="">Selecione o discente</option>');
        $('#docente').empty().append('<option value="">Selecione o docente</option>');
        representantes.forEach(function(item) {
            $('#discente').append('<option value="' + item.id + '">' + item.nome + '</option>');
            $('#docente').append('<option value="' + item.id + '">' + item.nome + '</option>');
        });
    }
}

function buscarMonitores(){
    var monitores = apiGet('/certificado/monitores');
    if (monitores && Array.isArray(monitores)) {
        $('#monitore').empty().append('<option value="">Selecione o monitore</option>');
        monitores.forEach(function(item) {
            $('#monitore').append('<option value="' + item.id + '">' + item.nome + '</option>');
        });
    }
}

function buscarMonitore(){
    var id = $("#monitore").val();
    if (!id) return;
    var response = apiPost('/certificado/monitore/buscar', { id: id });
    if(response && response.access){
        $('.nomeMonitore').html(response.monitore.nome);
    }
}

function gerarCertificadoTutore(){
    var tutore = $('#tutore').val();
    var dataInicial = $('#dataInicial').val();
    var dataFinal = $('#dataFinal').val();
    var response = apiPost('/certificado/tutore', {
        tutore: tutore,
        dataInicial: dataInicial,
        dataFinal: dataFinal
    });
    if(response && response.access){
        var presencaAulas = response.presencaAulas * 2;
        var presencaReuniao = response.presencaReuniao * 1.5;
        var presencaAdminsitrativa = parseInt($('#horasAdministrativa').val()) || 0;
        var presencaTotal = presencaAulas + presencaReuniao + presencaAdminsitrativa;
        $('#detalhes').show();
        $('.anoFinal').html(response.anoFinal);
        $('.mesFinal').html(response.mesFinal);
        $('.mesInicial').html(response.mesInicial);
        $('.presencaAulas').html(' ' + presencaAulas + ' horas');
        $('.presencaReuniao').html(' ' + presencaReuniao + ' horas');
        $('.presencaAdministrativa').html(' ' + presencaAdminsitrativa + ' horas');
        $('.presencaTotal').html(' ' + presencaTotal + ' horas');
    } else {
        var alertEl = document.getElementById("messageAlert");
        if (alertEl) {
            alertEl.innerHTML = (response && response.message) ? response.message : "Por favor, insira todos os dados";
            alertEl.style.color = "red";
            setTimeout(function(){
                alertEl.innerHTML = "";
            }, 2000);
        }
    }
}

function gerarCertificadoMonitore(){
    var monitore = $('#monitore').val();
    var dataInicial = $('#dataInicial').val();
    var dataFinal = $('#dataFinal').val();
    var response = apiPost('/certificado/monitore', {
        monitore: monitore,
        dataInicial: dataInicial,
        dataFinal: dataFinal
    });
    if(response && response.access){
        var presencaMonitoria = response.monitoria * 4;
        $('#detalhes').show();
        $('.anoFinal').html(response.anoFinal);
        $('.mesFinal').html(response.mesFinal);
        $('.mesInicial').html(response.mesInicial);
        $('.presencaMonitorias').html(presencaMonitoria + ' horas');
    } else {
        var alertEl = document.getElementById("messageAlert");
        if (alertEl) {
            alertEl.innerHTML = (response && response.message) ? response.message : "Por favor, insira todos os dados";
            alertEl.style.color = "red";
            setTimeout(function(){
                alertEl.innerHTML = "";
            }, 2000);
        }
    }
}

function buscarDiscente(){
    var id = $("#discente").val();
    if (!id) return;
    var response = apiPost('/certificado/representante/buscar', { id: id });
    if(response && response.access){
        var newImage = document.createElement('img');
        newImage.src = "/public/assinatura/" + id + ".png";
        newImage.style.maxWidth = "100%";
        newImage.style.maxHeight = "100%";
        var el = document.getElementById("assinaturaDiscente");
        if (el) el.innerHTML = newImage.outerHTML;
        $('#nomeDiscente').html(response.representante.nome);
    }
}

function buscarDocente(){
    var id = $("#docente").val();
    if (!id) return;
    var response = apiPost('/certificado/representante/buscar', { id: id });
    if(response && response.access){
        var newImage = document.createElement('img');
        newImage.src = "/public/assinatura/" + id + ".png";
        newImage.style.maxWidth = "100%";
        newImage.style.maxHeight = "100%";
        var el = document.getElementById("assinaturaDocente");
        if (el) el.innerHTML = newImage.outerHTML;
        $('#nomeDocente').html("Prof. " + response.representante.nome);
    }
}

function downloadVersoTutore(){
    var id = $("#tutore").val();
    var alertEl = document.getElementById("messageAlert");
    if (id > 0){
        var tutore = $('#tutore option[value="'+ id+'"]').html();
        html2canvas(document.getElementById("verso"),{
            allowTaint: true,
            scale: 2,
        }).then(function (canvas) {
            var anchorTag = document.createElement("a");
            document.body.appendChild(anchorTag);
            anchorTag.download = tutore + " Verso.png";
            anchorTag.href = canvas.toDataURL();
            anchorTag.target = '_blank';
            anchorTag.click();
        });
    } else {
        $('html, body').animate({scrollTop: 0}, 'slow');
        if (alertEl) {
            alertEl.style.color = "red";
            alertEl.innerHTML = "Por favor, insira todos os dados";
            setTimeout(function(){
                alertEl.innerHTML = "";
            }, 2000);
        }
    }
}

function downloadFrenteTutore(){
    var id = $("#tutore").val();
    var alertEl = document.getElementById("messageAlert");
    if (id > 0){
        var tutore = $('#tutore option[value="'+ id+'"]').html();
        html2canvas(document.getElementById("frente"),{
            allowTaint: true,
            scale: 2,
        }).then(function (canvas) {
            var anchorTag = document.createElement("a");
            document.body.appendChild(anchorTag);
            anchorTag.download = tutore + " Frente.png";
            anchorTag.href = canvas.toDataURL();
            anchorTag.target = '_blank';
            anchorTag.click();
        });
    } else {
        $('html, body').animate({scrollTop: 0}, 'slow');
        if (alertEl) {
            alertEl.style.color = "red";
            alertEl.innerHTML = "Por favor, insira todos os dados";
            setTimeout(function(){
                alertEl.innerHTML = "";
            }, 2000);
        }
    }
}

function downloadVersoMonitore(){
    var id = $("#monitore").val();
    var alertEl = document.getElementById("messageAlert");
    if (id > 0){
        var monitore = $('#monitore option[value="'+ id+'"]').html();
        html2canvas(document.getElementById("verso"),{
            allowTaint: true,
            scale: 2,
        }).then(function (canvas) {
            var anchorTag = document.createElement("a");
            document.body.appendChild(anchorTag);
            anchorTag.download = monitore + " Verso.png";
            anchorTag.href = canvas.toDataURL();
            anchorTag.target = '_blank';
            anchorTag.click();
        });
    } else {
        $('html, body').animate({scrollTop: 0}, 'slow');
        if (alertEl) {
            alertEl.style.color = "red";
            alertEl.innerHTML = "Por favor, insira todos os dados";
            setTimeout(function(){
                alertEl.innerHTML = "";
            }, 2000);
        }
    }
}

function downloadFrenteMonitore(){
    var id = $("#monitore").val();
    var alertEl = document.getElementById("messageAlert");
    if (id > 0){
        var monitore = $('#monitore option[value="'+ id+'"]').html();
        html2canvas(document.getElementById("frente"),{
            allowTaint: true,
            scale: 2,
        }).then(function (canvas) {
            var anchorTag = document.createElement("a");
            document.body.appendChild(anchorTag);
            anchorTag.download = monitore + " Frente.png";
            anchorTag.href = canvas.toDataURL();
            anchorTag.target = '_blank';
            anchorTag.click();
        });
    } else {
        $('html, body').animate({scrollTop: 0}, 'slow');
        if (alertEl) {
            alertEl.style.color = "red";
            alertEl.innerHTML = "Por favor, insira todos os dados";
            setTimeout(function(){
                alertEl.innerHTML = "";
            }, 2000);
        }
    }
}