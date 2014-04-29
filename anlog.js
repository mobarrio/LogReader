var fs = require('fs'),
    tail = require('./lib/tail'),
    routes = require('./routes'),
    global = require('./routes/global'),
    path = require('path'),
    express = require('express'),
    argv = require('minimist')(process.argv.slice(2));

var clients = [];

// Define en ilimitado el numero de Listeners, por defecto muestra un mensaje de warning si hay mas de 10
process.setMaxListeners(0);

var app = express();
app.set('port', argv['port'] || global.Port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
    res.render("index", {
        url: global.IP,
        port: global.Port
    });
});

var general = tail('/var/adm/general');

var io = require('socket.io').listen(app.listen(app.get('port'), function() {
    console.log(routes.getDate() + 'Server ' + global.IP + ' listening on port ' + app.get('port'));
    general.start(function(status) {
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

    general.on('updated', function(line) {
        socket.emit('update', line);
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