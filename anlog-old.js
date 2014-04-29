var fs = require('fs'),
    LogReader = require('./lib'),
    routes = require('./routes'),
    global = require('./routes/global'),
    path = require('path'),
    express = require('express');

var clients = [];

var gral = new LogReader({
    filename: '/var/adm/general',
    interval: 2500
});

var app = express();
app.set('port', process.env.PORT || global.Port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
    res.render("index", {
        url: global.IP,
        port: global.Port
    });
});

var io = require('socket.io').listen(app.listen(app.get('port'), function() {
    console.log(routes.getDate() + 'Server ' + global.IP + ' listening on port ' + global.Port);
    gral.start(function(status) {
        console.log(routes.getDate() + status);
    });
}), {
    'log level': 1
});

io.sockets.on('connection', function(socket) {
    var address = socket.handshake.address;
    var client_ip = address.address;
    socket.emitir = true;
    clients.push(socket);

    process.on('updated', function(data) {
        socket.emit('update', data);
        // console.log(data);
    });

    socket.emit('mensaje', {
        msg1: routes.getDate() + 'Logs inicializados correctamente.',
        msg2: routes.getDate() + 'Esperando nuevos eventos.'
    });

    socket.on('Stop_Start_Emit', function(data, callback) {
        console.log(routes.getDate() + "Emision de estadisticas: ", data.msg);
        socket.emitir = data.status;
        callback(data.status);
    });

    socket.on('disconnect', function() {
        var idx = routes.arrayObjectIndexOf(clients, socket.id);
        clients.splice(idx, 1); // Se carga la coneccion del cliente que se desconecta.
        io.sockets.emit('message', {
            text: 'Client disconected  ' + socket.handshake.address.address
        });
        console.log((new Date().toFormat('YYYY-MM-DD HH24:MI:SS - ')) + "  Realiza un disconect del cliente: ", socket.handshake.address.address);
    });
}); // io.sockets.on