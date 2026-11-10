$(document).ready(function() {
    var params = getUrlParameters();
    if (params.error) {
        $("#msg-erro").show();
    }

    $("#formLogin").submit(function(e) {
        e.preventDefault();
        var usuario = $("#usuario").val();
        var senha = $("#senha").val();

        var response = apiPost('/login', {
            usuario: usuario,
            senha: md5(senha)
        });

        if (response && response.access) {
            window.location.assign('/home');
        } else {
            $("#msg-erro").show();
        }
    });
});
