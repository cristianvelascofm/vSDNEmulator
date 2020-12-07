$(document).ready(function () {

    var mininet = $('#btn-mn');
    var mininetW = $('#btn-w');
    var mininetIot = $('#btn-Iot');
    var maxinet = $('#btn-mx');
    var tool = "";
    var environmentSelected = "";

    $(".button-env").click(function () {
        tool = $(this).attr('id');
        activeTool(tool);
    });


    function activeTool(id) {
        var activeTool = $("#" + id);
        desactiveTool();
        activeTool.css("backgroundColor", "#a4e7a4ad");

    }

    function desactiveTool() {

        mininet.css("backgroundColor", "#E1F3F1");
        mininetW.css("backgroundColor", "#E1F3F1");
        mininetIot.css("backgroundColor", "#E1F3F1");
        maxinet.css("backgroundColor", "#E1F3F1");

    }

    $("#do_login").click(function () {

        closeLoginInfo();
        switch (tool) {
            case 'btn-mn':
                $(location).attr('href', 'alambric_emulator/');
                break;
            case 'btn-w':
                $(location).attr('href', '');
                break;
            case 'btn-mx':
                $(location).attr('href', '');
                break;
            case 'btn-Iot':
                $(location).attr('href', '');
                break;
            case '':
                alert("Selecciona una opción")
                break;
        }

    });

    //reset previously results and hide all message on .keyup()
    $("#login_form input").keyup(function () {
        $(this).parent().find('span').css("display", "none");
    });

    openLoginInfo();
    setTimeout(closeLoginInfo, 1000);
});

function openLoginInfo() {
    $(document).ready(function () {
        $('.b-form').css("opacity", "0.01");
        $('.box-form').css("left", "-37%");
        $('.box-info').css("right", "-37%");
    });
}

function closeLoginInfo() {
    $(document).ready(function () {
        $('.b-form').css("opacity", "1");
        $('.box-form').css("left", "0px");
        $('.box-info').css("right", "-5px");
    });
}

$(window).on('resize', function () {
    closeLoginInfo();
});

$('#btn-mn').on('click', function () {


});