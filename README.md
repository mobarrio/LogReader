LogReader

# vi  /lib/svc/method/anlog

#!/bin/sh
# DESC: SMF method definitions/wrapper.
# VERSION: $id$
#
# Sebastian Suarez
# 22/06/2008

. /lib/svc/share/smf_include.sh

case "$1" in
        start)
        cd /var/www/tiadm/LogReader
        /usr/bin/nohup /opt/Node/bin/node /var/www/tiadm/LogReader/anlog.js & 2>&1 >/dev/null
        ;;
*)
        echo "Usage: $0 {start}"
        exit 1
        ;;
esac

exit $SMF_EXIT_OK  

# chmod 755 /lib/svc/method/anlog



# vi /var/svc/manifest/site/anlog.xml
<?xml version='1.0'?>
<!DOCTYPE service_bundle SYSTEM '/usr/share/lib/xml/dtd/service_bundle.dtd.1'>
<service_bundle type='manifest' name='export'>
  <service name='site/anlog' type='service' version='0'>
    <create_default_instance enabled='false'/>
    <single_instance/>
    <dependency name='fs-local' grouping='require_all' restart_on='none' type='service'>
      <service_fmri value='svc:/system/filesystem/local'/>
    </dependency>
    <dependency name='fs-autofs' grouping='optional_all' restart_on='none' type='service'>
      <service_fmri value='svc:/system/filesystem/autofs'/>
    </dependency>
    <dependency name='net-loopback' grouping='require_all' restart_on='none' type='service'>
      <service_fmri value='svc:/network/loopback'/>
    </dependency>
    <dependency name='net-physical' grouping='require_all' restart_on='none' type='service'>
      <service_fmri value='svc:/network/physical'/>
    </dependency>
    <exec_method name='start' type='method' exec='/lib/svc/method/anlog start' timeout_seconds='60'>
      <method_context/>
    </exec_method>
    <exec_method name='stop' type='method' exec=':kill' timeout_seconds='60'>
      <method_context/>
    </exec_method>
    <template>
      <common_name>
        <loctext xml:lang='C'>NodeJS anlog Server Port 8080</loctext>
      </common_name>
      <description>
        <loctext xml:lang='C'>Servicio de Globalia Sistemas - anlog.</loctext>
      </description>
    </template>
  </service>
</service_bundle>

# svccfg import /var/svc/manifest/site/anlog.xml

# svcs -a

# svcadm enable anlog


root@sierra # more syslog.conf 
#auth.notice                    ifdef(`LOGHOST', /var/log/authlog, @loghost)
mail.debug                      ifdef(`LOGHOST', /var/log/syslog, @loghost)
*.warning                                       @192.168.152.31
*.warning;mail.err;local0.none;auth.notice;kern.err;daemon.notice               @10.150.2.68


*.err;kern.notice;auth.notice                   /dev/sysmsg
*.err;kern.debug;daemon.notice;mail.crit        /var/adm/messages



$ svcadm restart system/system-log
$ svcadm refresh svc:/system/system-log:default


logger -p user.info "Test message"


*.info;mail.none;kern.none;daemon.none @10.67.33.115
auth.notice @10.67.33.115
daemon.info @10.67.33.115

/etc/host local,
10.67.33.115 loghost



The facility field can contain only 17 codes:
  - kern Messages generated by the kernel.
  - user Messages generated by user processes.
  - mail The mail system.
  - daemon System daemons, such as the in.ftpd and the telnetd daemons.
  - auth The authorization system, including the login and su commands.

  syslog Messages generated internally by the syslogd daemon.
  - lpr The line printer spooling system, such as the lpr and lpc commands.
  - news Files reserved for the USENET network news system.
  - uucp  (obsolete) The UNIX-to-UNIX copy (UUCP) system does not use the syslog function.
  - cron The cron and at facilities, including crontab, at, and cron.
  - mark  Timing  messages. For example mark.* /dev/console line causes the time to be printed on the system console every 20 minutes. This is useful if you have other information being printed on the console, and you want a running clock on the printout.
  - local0-7 Eight user-defined codes.
  the level selector specifies the severity or importance of the message. Each level includes all the levels above (of a higher severity).  To remember the sequence for the certification exam you can use an appropriately constructed phase like "Every alerted cardriver escapes warning notice"

  - emerg or 0 Panic conditions that are normally broadcast to all users
  - alert or 1 Conditions that should be corrected immediately, such as a corrupted system database. Only sysadmin of a particular server needs to be informed by mail or paged.
  - crit or 2 Warnings about critical conditions, such as hard device errors. 
  - err  or 3 Errors other than hard device errors
  - warning  or 4 Warning messages, that generally does not interfere with normal operation.
  - notice or 5 Non-error conditions that might require special handling
  - info  or 6 Purely informational messages (usually does not require any handling)
  - debug or 7 Messages that are normally used only when debugging a program
  - none  or 8 Messages are not sent from the indicated facility to the selected file

Facility
--------
user
kern
mail
daemon
auth
lpr
news
uucp
cron
audit
local0-7
mark


Level
-----
emerg
alert
crit
err
warning
notice
info
debug
none

<facility>.*    -> All messages belonging to <facility> 
*.<severity>    -> All messages of the given <severity> 
*.*             -> All messages
<facility>.none -> Log all messages except those of the given facility



-- LogCentral
mail.none;*.warning;mail.err;local0.none;auth.notice;kern.debug;daemon.notice;*.notice;                 /var/adm/general
svcadm restart system/system-log


*.notice        @192.168.152.31
svcadm restart system/system-log
logger -p user.notice "Test message user.notice"
logger -p mail.warning "Test message mail.warning"

logger -p local7.error "Test message local7.error"
logger -p local7.warning "Test message local7.warning"
logger -p local7.notice "Test message local7.notice"

-- Centralizacion del log
-- # vi /etc/syslog.conf
local7.*                 /var/adm/dashboard





NODEJS: https://github.com/squeeks/glossy
NODEJS: https://nodejsmodules.org/tags/syslog
PERL: http://search.cpan.org/dist/Parse-Syslog/lib/Parse/Syslog.pm