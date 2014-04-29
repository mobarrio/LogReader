var LogReader = (function() {
    // Locales
    var debug = 0,
        socket = {
            isOnline: false
        },
        timeout = null;
    var log_count = {};
    log_count.emerg = 0;
    log_count.alert = 0;
    log_count.crit = 0;
    log_count.err = 0;
    log_count.error = 0;
    log_count.warn = 0;
    log_count.warning = 0;
    log_count.notice = 0;
    log_count.info = 0;
    log_count.debug = 0;
    log_count.none = 0;
    log_count.full = 0;


    var SeverityIndex = [
        'emerg',
        'alert',
        'crit',
        'err',
        'error',
        'warn',
        'warning',
        'notice',
        'info',
        'debug',
        'none'
    ];

    var FacilityIndex = [
        'kern',
        'user',
        'mail',
        'daemon',
        'auth',
        'syslog',
        'lpr',
        'news',
        'uucp',
        'clock',
        'sec',
        'ftp',
        'ntp',
        'audit',
        'alert',
        'clock',
        'local0',
        'local1',
        'local2',
        'local3',
        'local4',
        'local5',
        'local6',
        'local7',
        'mark'
    ];

    var settings = {
        url: false,
        interval: 5000,
        overrideAjax: false,
        updateTitle: false,
        updateFavicon: {
            id: "favicon",
            textColor: "#fff",
            backgroundColor: "#e74c3c",
            location: "full",
            shape: "square"
        },
        done: function() {}
    };

    titleclear = function() {
        var matches, regex;
        regex = /\(([0-9]+)\)/;
        matches = document.title;

        if (matches !== null) {
            document.title = document.title.replace(regex, '');
        }
    }

    clearFavicon = function() {
        titleclear();
        if ($("#" + settings.updateFavicon.id).data("initial")) {
            init = $("#" + settings.updateFavicon.id).attr("data-initial")
        } else {
            init = $("#" + settings.updateFavicon.id).attr("href")
        }
        $("#" + settings.updateFavicon.id).attr("href", init)
        $("#new-favicon").remove()
        $("<link id='new-favicon' type='image/x-icon' href='" + init + "' rel='shortcut icon'>").appendTo("head")

        $(this).hide().html("")
    }

    changeFavicon = function(fx) {
        if (fx > 0) {
            var canvas = document.createElement('canvas'),
                ctx,
                img = document.createElement('img'),
                link = document.getElementById(settings.updateFavicon.id).cloneNode(true);
            if (fx > 99) fx = 99
            if (canvas.getContext) {
                canvas.height = canvas.width = 16;
                ctx = canvas.getContext('2d');
                img.onload = function() {
                    ctx.drawImage(this, 0, 0);

                    switch (settings.updateFavicon.location) {
                        case "full":

                            if (settings.updateFavicon.shape == "square") {
                                ctx.fillStyle = settings.updateFavicon.backgroundColor;
                                ctx.fillRect(0, 0, 16, 16);
                            } else {
                                var centerX = canvas.width / 2;
                                var centerY = canvas.height / 2;
                                var radius = 8;
                                ctx.beginPath();
                                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                                ctx.fillStyle = settings.updateFavicon.backgroundColor;
                                ctx.fill();
                            }
                            ctx.textAlign = "center";
                            ctx.font = 'bold 10px "helvetica", sans-serif';
                            ctx.fillStyle = settings.updateFavicon.textColor;
                            ctx.fillText(fx, 8, 12);
                            break;
                        case "se":
                            if (settings.updateFavicon.shape == "square") {
                                ctx.fillStyle = settings.updateFavicon.backgroundColor;
                                ctx.fillRect(5, 5, 16, 16);
                            } else {
                                var radius = 6;
                                ctx.beginPath();
                                ctx.arc(12, 12, radius, 0, 2 * Math.PI, false);
                                ctx.fillStyle = settings.updateFavicon.backgroundColor;
                                ctx.fill();
                            }

                            ctx.font = 'bold 8px "helvetica", sans-serif';
                            ctx.textAlign = "right";
                            ctx.fillStyle = settings.updateFavicon.textColor;
                            ctx.fillText(fx, 15, 15);
                            break;
                        case "ne":

                            if (settings.updateFavicon.shape == "square") {
                                ctx.fillStyle = settings.updateFavicon.backgroundColor;
                                ctx.fillRect(5, 0, 11, 10);
                            } else {
                                var radius = 6;
                                ctx.beginPath();
                                ctx.arc(12, 3, radius, 0, 2 * Math.PI, false);
                                ctx.fillStyle = settings.updateFavicon.backgroundColor;
                                ctx.fill();
                            }

                            ctx.font = 'bold 8px "helvetica", sans-serif';
                            ctx.textAlign = "right";
                            ctx.fillStyle = settings.updateFavicon.textColor;
                            ctx.fillText(fx, 15, 7);
                            break;
                        case "nw":

                            if (settings.updateFavicon.shape == "square") {
                                ctx.fillStyle = settings.updateFavicon.backgroundColor;
                                ctx.fillRect(0, 0, 11, 10);
                            } else {
                                var radius = 6;
                                ctx.beginPath();
                                ctx.arc(5, 3, radius, 0, 2 * Math.PI, false);
                                ctx.fillStyle = settings.updateFavicon.backgroundColor;
                                ctx.fill();
                            }

                            ctx.font = 'bold 8px "helvetica", sans-serif';
                            ctx.textAlign = "left";
                            ctx.fillStyle = settings.updateFavicon.textColor;
                            ctx.fillText(fx, 1, 7);
                            break;
                        case "sw":
                            if (settings.updateFavicon.shape == "square") {
                                ctx.fillStyle = settings.updateFavicon.backgroundColor;
                                ctx.fillRect(0, 5, 11, 11);
                            } else {
                                var radius = 6;
                                ctx.beginPath();
                                ctx.arc(5, 12, radius, 0, 2 * Math.PI, false);
                                ctx.fillStyle = settings.updateFavicon.backgroundColor;
                                ctx.fill();
                            }

                            ctx.font = 'bold 8px "helvetica", sans-serif';
                            ctx.textAlign = "left";
                            ctx.fillStyle = settings.updateFavicon.textColor;
                            ctx.fillText(fx, 1, 14);
                            break;
                    }
                    var init = $("#" + settings.updateFavicon.id).attr("href")

                    if ($("#" + settings.updateFavicon.id).data("initial")) {
                        $("#" + settings.updateFavicon.id).attr("href", canvas.toDataURL('image/png'));
                    } else {
                        $("#" + settings.updateFavicon.id).attr("data-initial", init).attr("href", canvas.toDataURL('image/png'));
                    }

                    $("#new-favicon").remove()
                    $("<link id='new-favicon' type='image/x-icon' href='" + canvas.toDataURL('image/png') + "' rel='shortcut icon'>").appendTo("head")

                };
                img.src = '/img/favicon.png';
            }
        }
    };

    InitSocket = function(host) {
        socket = io.connect("http://" + host);
        socket.removeAllListeners();
        socket.on('update', function(data) {
            var HTML = new Array();
            HTML.push('<div style="white-space:pre;">');
            HTML.push(data.msg);
            HTML.push('</div>');
            if (data.parsed.isparsed) {
                log_count[data.parsed.severity]++
                $("#log-" + data.parsed.severity).prepend(HTML.join(""));
                if ($('.iniciando-' + data.parsed.severity).length > 0) $('.iniciando-' + data.parsed.severity).remove();
                if (log_count[data.parsed.severity] >= 1) {
                    var HTML_WAR = new Array();
                    HTML_WAR.push('<span class="label-init-severity" data-severity="' + data.parsed.severity + '"><i class="fa fa-check" style="font-size: 15px;"></i> Confirmar</span>');
                    $(".log-" + data.parsed.severity + "-count").html(HTML_WAR.join(""));
                    $(".infobox-log-" + data.parsed.severity + "-count").html(log_count[data.parsed.severity]);
                    $(".container-" + data.parsed.severity).css({
                        "display": ""
                    });
                    $(".infobox-icon-" + data.parsed.severity).addClass("icon-animated-bell");
                    $(".check-severity-" + data.parsed.severity).fadeIn();
                }

            } else {
                log_count.info++
                $("#log-info").prepend(HTML.join(""));
                if ($('.iniciando-info').length > 0) $('.iniciando-info').remove();
                if (log_count.info >= 1) {
                    var HTML_NOT = new Array();
                    HTML_NOT.push('<span class="label-init-severity" data-severity="info"><i class="fa fa-check" style="font-size: 15px;"></i> Confirmar</span>');
                    $(".log-info-count").html(HTML_NOT.join(""));
                    $(".infobox-log-info-count").html(log_count.info);
                    $(".container-info").css({
                        "display": ""
                    });
                    $(".infobox-icon-info").addClass("icon-animated-bell");
                    $(".check-severity-info").fadeIn();
                }
            }
            log_count.full++;
            changeFavicon(log_count.full);
            //console.log("severity:", data.parsed.severity, " Count: ", log_count.full);
        });

        /* NOTICE: alloc: /oracle/pkg16/grid/arch: file system full */
        socket.on('mensaje', function(data) {
            SeverityIndex.forEach(function(severity) {
                if ($('.iniciando-' + severity).length > 0) $('.iniciando-' + severity).remove();
                $(".infobox-log-" + severity + "-count").html("0");
                $(".container-" + severity).css({
                    "display": "none"
                });
            });
        });

        socket.on("connect", socketEnabled);
        socket.on("reconnect", socketEnabled);
        socket.on("connecting", socketDisabled);
        socket.on("connect_failed", socketDisabled);
        socket.on("close", socketDisabled);
        socket.on("reconnecting", socketDisabled);
        socket.on("reconnect_failed", socketDisabled);
        socket.on("error", socketDisabled);
        socket.on('disconnect', socketDisabled);
    };

    socketEnabled = function() {
        socket.isOnline = true;
        $(".info-service-logreader").fadeOut(function() {
            $(".service-logreader").fadeIn('slow');
        });
    };

    socketDisabled = function() {
        socket.isOnline = false;
        $(".service-logreader").fadeOut(function() {
            $(".info-service-logreader").fadeIn('slow');
        });

    };

    preInit = function(callback) {
        if (debug) console.log("Iniciando conexion.");
        typeof callback === 'function' && callback();
    };

    socket_status = function(socket_status) {
        console.log("Recepcion de eventos ", (socket_status ? "activada" : "desactivada"), ".");
    };

    setRecvOff = function() {
        if (socket !== null) socket.emit('Stop_Start_Emit', {
            "status": false,
            "msg": "Desactivada."
        }, socket_status);
    };

    setRecvOn = function() {
        if (socket !== null) socket.emit('Stop_Start_Emit', {
            "status": true,
            "msg": "Activada."
        }, socket_status);
    };

    return {
        init: function(host) {
            InitSocket(host);
            preInit();
        },
        stop: function() {
            setRecvOff();
        },
        start: function() {
            preInit(function() {
                setRecvOn();
            });
        },
        connected: function() {
            return socket.socket.connected;
        },
        isOnline: function() {
            return socket.isOnline;
        },
        changeFavicon: changeFavicon,
        clearFavicon: clearFavicon,
        init_severity_counter: function(severity) {
            log_count[severity] = 0;
            $(".log-" + severity + "-count").html("");
            $(".infobox-log-" + severity + "-count").html("0");
            $(".container-" + severity).css({
                "display": "none"
            });
            $(".infobox-icon-" + severity).removeClass("icon-animated-bell");
            $(".check-severity-" + severity).fadeOut();
            this.clearFavicon();
        },
    };
}());