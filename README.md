LogReader

== Configuracion del syslog.conf en los equipos ==
   # vi /etc/syslog.conf

   # more syslog.conf 
   *.warning                                       @192.168.XXX.XXX

- Reinicio del servicio

   # svcadm restart system/system-log
   # svcadm refresh svc:/system/system-log:default

- Prueba de la nueva configuracion
   # logger -p user.error "Test message"
   # logger -p user.notice "Test message user.notice"
   # logger -p mail.warning "Test message mail.warning"
   # logger -p local7.error "Test message local7.error"
   # logger -p local7.warning "Test message local7.warning"
   # logger -p local7.notice "Test message local7.notice"


== Configuracion del syslog.conf Central ==

   # vi /etc/syslog.conf

   #
   # Configuracion personalizada para LogReader
   #
   mail.none;*.warning;mail.err;local0.none;auth.notice;kern.debug;daemon.notice;*.notice;                 /var/adm/general



== Configuracion del servicio para un Oracle Solaris ==

   # vi  /lib/svc/method/anlog
   # chmod 755 /lib/svc/method/anlog
   # vi /var/svc/manifest/site/anlog.xml
   # svccfg import /var/svc/manifest/site/anlog.xml
   # svcs -a
   # svcadm enable anlog

 Nota: Todos los archivos estan en el directorio servicios_solaris