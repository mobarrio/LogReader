LogReader
==============

###Configuracion del syslog.conf Central
--------------
#####Actualizamos la configuracion del syslog.conf para que recepcione y almacene los eventos localmente.
    # vi /etc/syslog.conf
     
    #
    # Configuracion personalizada para LogReader
    #
    mail.none;*.warning;mail.err;local0.none;auth.notice;kern.debug;daemon.notice;*.notice;   /var/adm/general
    
**Nota:** *En Solaris el espacio entre el filtro y el log tiene que ser un* **TAB**

#####Reinicio del servicio

    # svcadm restart system/system-log
    # svcadm refresh svc:/system/system-log:default



###Configuracion del syslog.conf en los equipos remotos
--------------
#####Actualizamos la configuracion del syslog.conf para que redirija a nuestro log central.

    # vi /etc/syslog.conf
    # more syslog.conf
    *.warning                                       @192.168.XXX.XXX <- Apunta al LogCentral

#####Reinicio del servicio

    # svcadm restart system/system-log
    # svcadm refresh svc:/system/system-log:default

#####Prueba de la nueva configuracion

    # logger -p user.error "Test message"
    # logger -p user.notice "Test message user.notice"
    # logger -p mail.warning "Test message mail.warning"
    # logger -p local7.error "Test message local7.error"
    # logger -p local7.warning "Test message local7.warning"
    # logger -p local7.notice "Test message local7.notice"



###Configuracion del servicio para un Oracle Solaris
--------------

    # vi  /lib/svc/method/anlog
    # chmod 755 /lib/svc/method/anlog
    # vi /var/svc/manifest/site/anlog.xml
    # svccfg import /var/svc/manifest/site/anlog.xml
    # svcs -a
    # svcadm enable anlog

**Nota:** *La definicion del los archivos estan en el directorio servicios_solaris*



###Instalacion, ejecucion y pruebas
--------------

#####Intalacion
Clonar el repositorio desde Github [here](https://github.com/mobarrio/LogReader.git)

#####Instalamos los paquetes y las dependencias

    # npm install
    
#####Arrancamos la aplicacion

    # node anlog.js [--port {Puerto}]

**Nota:** Por defecto arranca en el puerto 8080, si queremos que arranque en otro puerto pasamos el paramereo 
          --port [Puerto]

#####Probamos desde el Navegador

    http://SEVER:PUERTO

#####Arrancar la aplicacion como servicio

    # svcadm enable anlog
    # svcs -a