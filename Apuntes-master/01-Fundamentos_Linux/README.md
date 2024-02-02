# Fundamentos de Linux <a name="indice"></a>
  - [Gestión de paquetes en Ubuntu](#gestión-de-paquetes-en-ubuntu-)
  - [Gestión del entorno](#gestión-del-entorno-)
  - [Comandos básicos](#comandos-básicos-)
  - [Comandos de gestión de red](#comandos-red)
  - [Bash Scripting](#bash-scripting-)
  - [Configuración DNS](#config-dns)
  - [SSH](#ssh)
  - [Administración del sistema](#admin-sistema)


## Gestión de paquetes en Ubuntu <a name="gestion-paquetes"></a>
 - [Índice](#indice)
 - [Instalación de paquetes](#instalacion-paquetes)
 - [Actualización de paquetes](#actualizacion-paquetes)
 - [Eliminar paquetes](#eliminar-paquetes)
 - [Buscar paquetes en el repositorio](#buscar-paquetes)
 - [Mostrar paquetes instalados](#mostrar-paquetes)

<a name="instalacion-paquetes"></a>
Siempre que haya que instalar un nuevo paquete del repositorio de Ubuntu debemos actualizar los mismos y luego instalarlos.
- Se actualizan los repositorios
```shell
sudo apt-get update
```
- Se instala el paquete
```shell
apt-get install <nombre_paquete1> <nombre_paquete2> ... <nombre_paqueteX>
```
### Actualizar todos los paquetes instalados a la última version <a name="actualizacion-paquetes"></a>
```shell
apt-get upgrade
```
### Eliminar paquetes <a name="eliminar-paquetes"></a>
```shell
apt-get remove <nombre_paquete1> <nombre_paqueteX>
```
Debido a que `apt-get remove` solo elimina el programa pero no los ficheros de configuración hay que usar:
```shell
apt-get purge <nombre_paquete1> <nombre_paquete2>
```
Igualmente si por algún motivo hay algunas dependencias que no han sido eliminadas al desinstalar el paquete hay que usar
```shell
apt-get autoremove
```
### Buscar paquetes en el repositorio <a name="buscar-paquetes"></a>
```shell
apt-cache search <paquete>
```
Esto buscará en los repositorios paquetes que tengan relación directa o indirecta con el nombre del paquete o similares
### Mostrar paquetes instalados <a name="mostrar-paquetes"></a>
```shell
dpkg -l
```

## Gestión del entorno <a name="gestion-entorno"></a>
 - [Índice](#indice)

### top

El comando `top` es un comando para monitorizar los procesos en tiempo real. Se utiliza para mostrar un resumen de la información del sistema y el listado de procesos o hilos siendo manejados por el kernel de Linux

### htop

El comando `htop` es otro programa para monitorizar procesos con una interfaz más renovada. Permite además interactuar con el ratón también

### free

El comando `free` muestra la cantidad de memoria libre y en uso del sistema. Admite diferentes flags para mostrar en diferentes base (`-k` en KB, `-m` en MB, `-g` en GB

### fdisk

El comando `fdisk` se utiliza para manipular la tabla de particiones de un disco. Es un comando bastante sensible.

### netstat

El comando `netstat` se utiliza para mostrar las conexiones de red, tablas de enrutamiento, estadísticas de interfaces de red, etc.
Tiene muchos flags para filtrar según nuestras necesidades:

- `-u` para mostrar puertos UDP
- `-t` para mostrar puertos TCP
- `-x` para mostrar los sockets UNIX
- `-l` para mostrar sólo los sockets a la escucha.
- `-n` para mostrar puertos numéricos
- `-s` para mostrar estadísticas
- `-p` para mostrar el PID del proceso (requere de permisos de superusuario)
- `-r` para mostrar la tabla de enrutamiento (similar al comando `route`)

### ps

El comando `ps` muestra un reporte de los procesos actuales del sistema.
Tiene una gran variedad de opciones

### kill

El comando `kill` se utiliza para enviar señales al _PID_ o _Process ID_ que represente a un proceso. Existen diferentes señales que podemos ver mediante:

```shell
kill -L
```

## Comandos básicos <a name="comandos-basicos"></a>
 - [Índice](#indice)

### man

El comando `man` se utiliza para mostrar la ayuda del comando que le pasemos como argumento

### cd

El comando `cd` también conocido como `chdir` se utiliza para cambiar el directorio actual donde nos encontramos

### ls

El comando `ls` se utiliza para listar el contenido de un directorio
- `-l`: Muestra permisos, propietario, grupo y fecha de modificación del fichero o directorio.
- `-p`: Añade un `/` al final del nombre de los directorios.
- `-a`: Muestra directorios y ficheros ocultos.

### mkdir

El comando `mkdir` se utiliza para crear directorios. Se pueden crear directorios anidados utilizando el flag `-p`:
```shell
mkdir -p myfolder/level2/level3
```

### rmdir

El comando `rmdir` se utiliza para eliminar directorios vacíos. Podemos utilizar el flag `-p` para eliminar de forma recursiva directorios vacíos.
```shell
rmdir myfolder/level2
```
Elimina solamente level2
```shell
rmdir -p myfolder/level2
```
Elimina level2 y myfolder si ambos no tuvieran ficheros

### touch

Crea ficheros vacíos. Aunque otra forma es usando el operador de redirección:
```shell
> file1.txt
```

### cp

El comando `cp` se utiliza para copiar ficheros y/o directorios de una ruta origen a una ruta destino
```shell
cp /var/log/syslog ./
```
Podemos indicar otro nombre del fichero destino:
```shell
cp /var/log/syslog ./other-log
```
Si queremos copiar directorios tenemos que indicar el flag `-r` para copiar de forma recursiva, de otra forma se copiará el directorio pero no su contenido.

### mv

El comando `mv` se utiliza para mover y/o renombrar ficheros y directorios. A diferencia de `cp` al utilizar `mv` sobre directorios no hace falta aplicar flags `r`

### rm

El comando `rm` se utiliza para eliminar ficheros o directorios. El flag `-r` se usa para borrar directorios junto con sus ficheros.
- `-f`: Eliminación a la fuerza sin confirmación previa.
- `-i`: Muestra el fichero o directorio a borrar y pide confirmación

### echo

El comando `echo` se utiliza para mostrar una línea de texto

### cat

El comando `cat` se utiliza para volcar el contenido de uno o más ficheros pasados como argumentos a la salida estandar

### find

El comando `find` se utiliza para buscar ficheros (con `-type f`) o directorios (con `-type d`) atendiendo a los criterios que nosotros especifiquemos.

También podemos buscar en el nombre por patrones:

```shell
find . -name "file*"
```

Podemos añadir el flag `-exec` para poder ejecutar un comando con cada patrón encontrado:

```shell
find . -name "file*" -exec echo "File found: {}" \;
```

### grep

El comando `grep` se utiliza para buscar ocurrencias de cadenas de texto en uno o más ficheros. Este comando tiene muchas más funcionalidades que pueden verse [aquí](./extra/grep_cshet.md)

### head

El comando `head` se utiliza para mostrar líneas del principio de un fichero. Por defecto muestra las 10 primeras líneas, pero podemos especificar cuántas utilizando el flag `-n <number>` o `-<number>`

### tail

El comando `tail` se utiliza para mostrar las últimas líneas de un fichero. Por defecto muestra las últimas 10 líneas pero podemos especificar cuántas utilizando el flag `-n <number>` o `-<number>`

### less

El comando `less` se utiliza para visualizar el contenido de un fichero. El contenido es mostrado de forma interactiva y podemos navegar por el fichero utilizando las flechas del teclado

### Curl

El comando `curl` es una herramienta para transferir datos de cliente a servidor o servidor a cliente. Admite una gran variedad de protocolos como FTP, HTTP, IMAP, LDAP, POP3, SCP, SMTP, etc, por lo que soporta características como uso de proxies, autenticación, subida de ficheros, conexiones SSL, cookies y muchas otras más
```shell
curl https://www.google.es
```
- `-o`: Guarda la respuesta en fichero indicado
```shell
 curl -o ./google-response.txt https://www.google.es
```
Alternativamente podemos utilizar el comando redirección `>` (sobreescribe) o `>>` (añade) para redirigir la salida a la ruta del fichero que queremos guardar
```shell
 curl https://www.google.es > google-response.txt
```
- `-O`: Crea fichero con el nombre y contenido de la URL

Este comando tiene muchas más funcionalidades que pueden verse [aquí](./extra/cheat.sh_curl.md)

## Comandos de gestión de red <a name="comandos-red"></a>
 - [Índice](#indice)

### ping

El comando ping se utiliza para enviar mensajes ICMP a un host (IP o dominio). Utilizaremos ping verificar que la máquina destino responde y su tiempo de respuesta.

Envia un mensaje por segundo de forma constante hasta pararlo con `Ctrl + C` o si especificamos con `-c <number>` el número de paquetes a enviar

`-i`: Especifica el intervalo entre envíos
`-4` o `-6`: IPv4 o IPv6
`-I <iface>`: Especificar interfaz o IP de red enviar los paquetes

### traceroute

Proporciona información de los saltos entre nodos de red para llegar a la IP destino

### nslookup

Resuelve direcciones de nombre a IP

### ip

Se usa para manipular interfaces, redes y enrutamiento. Tiene diversos subcomandos: `link`, `route`, `address`, etc

```shell
## Ver listado de interfaces
ip link show

## Ver listado de interfaces con sus IPs
ip address show

## Activar/desactivar interfaces de red
ip link set dev <iface> down/up

## Ver tabla de enrutamiento
ip route

## Añadir nueva entrada a tabla de enrutamiento para una interfaz específica
ip route add <dirección ip> dev <iface>

## Para eliminar la entrada añadida
ip route del <dirección ip> dev <iface>
```
Todas estas alteraciones con este comando desaparecen al reiniciar. Para que persistan hay que usar herramientas como `systemd` o manipular `/etc/network`

## Bash Scripting <a name="bash-scripting"></a>
 - [Índice](#indice)
 - [Características básicas](#bash-caracteristicas)
 - [Operadores de salida estandar](#bash-salida)
 - [Operadores de entrada](#bash-entrada)
 - [Heredocument](#bash-heredocument)
 - [Pipelines](#bash-pipelines)
 - [Brace Expansion](#bash-brace)
 - [Expansión aritmética](#bash-expansion-aritmetica)
 - [Expansión de nombres de ficheros](#bash-expansion-nombre)
 - [Variables](#bash-variables)
 - [Condicionales](#bash-condicionales)
 - [Bucles](#bash-bucles)
 - [Funciones](#bash-funciones)

### Características básicas <a name="bash-caracteristicas"></a>

Al principio de todo fichero BASH hay que añadir el _shebang_ **#!/bin/bash**. Si fuera de un fichero en python el _shebang_ sería **#!/usr/bin/python3** 

Suelen guardarse con la extensión `.sh`. Para hacer un fichero BASH ejecutable hay que hacer:
```shell
chmod +x ./<fichero.sh>
```

Hay 3 formas de ejecutar un fichero BASH:
```shell
bash ./<fichero>
. ./<fichero>
source ./<fichero>
```

Existen muchas variables que están preestablecidas al utilizar una shell BASH. Muchas de ellas son estáticas y unas pocas cambian conforme interactuamos con el sistema. Para ver el listado de todas las variables disponibles podemos utilizar el comando **`env`** sin argumentos.

Para utilizar el valor de una variable la prefijaremos con el carácter `$`
```shell
## Visualizar el valor de una variable predefinida por el sistema
$ echo $WD
## Lanzar un error con mensaje si una variable no tiene valor
$ echo ${PASSWORD:?'Password is unset'}
```

Los comandos tienen una entrada y una salida. A la hora deje ejecutar cada comando podemos alterar su entrada y salida utilizando un **descriptor de fichero**:
- `0`: Representa la entrada estandar o STDIN
- `1`: Representa la salida estandar o STDOUT
- `2`: Representa la salida entandar de errores o STDERR
- del `3` al `9`: Reservados para abrir ficheros adicionales

### Operadores de salida estandar <a name="bash-salida"></a> 

El operador de redirección `>` se utiliza para redirigir la salida de un fichero descriptor a otro. `command > filename` es equivalente a `command 1> filename`

Caben destacar dos aspectos importantes de esta sintaxis:

- Si el fichero no existe será creado.
- Si el fichero existe su contenido será reemplazado por la salida del comando

El operador de redirección `>>` realiza la misma operación que el anterior pero en vez de sobreescribir el contenido lo añade. Es equivalente a `command 1>> filename`

Si escribimos un `2` delante del comando de redirección indicaremos que queremos cambiar la salida estandar de errores a un fichero, esta salida es la que vemos cuando nos aparece un mensaje de error al ejecutar un comando. Por ejemplo:
```shell
## En este ejemplo el fichero true.txt existiría y el false.txt no existiría

ls -l true.txt false.txt

## mostraría lo siguiente:
## ls: cannot access 'false.txt': No such file or directory
## -rwxrwxrwx 1 jose jose 0 Nov  3 20:41 true.txt

## Almacenamos la salida de haber encontrado true.txt en el fichero bien.txt y la salida de no haber encontrado false.txt en el fichero mal.txt 

ls -l true.txt false.txt 1>bien.txt 2>mal.txt
```

El _shorthand_ redirige ambos STDOUT y STDERR a un mismo fichero utilizando la sintaxis `command &> filename`

Para suprimir la salida de un comando se usa **`/dev/null`**

### Operadores de entrada <a name="bash-entrada"></a> 

El operador `<` se utiliza para redirigir la entrada al fichero descriptor de la izquierda con el contenido del fichero de la derecha
```shell
## Tenemos el fichero true.txt con el contenido:
## Hola amigos!
## Hasta luego!

$ grep "amigo" < true.txt
Hola amigos!
```

El operador `<` de entrada es perfectamente combinable con los operadores de salida `>` y `>>`.

### Heredocument <a name="bash-heredocument"></a> 

Es un tipo de redirección que permite pasar múltiples líneas de entrada de comando
```sh
command << DELIMITER
  YOUR TEXT
  WITH MULTIPLE
  LINES
DELIMITER
```
La palabra `DELIMITER` puede ser cualquier palabra que queramos y se utiliza para indicar el final del _heredocument_. Hay que utilizar una palabra con cuidado ya que si esta palabra está dentro del contenido podríamos enviar el texto cortado. Comúnmente se escribe `EOF` para indicar _End Of File_.

Hay que tener cuidado si nuestro contenido tiene variables ya que serán sustituidas a menos que las prefijemos con `\` o metiendo el delimitador del _heredoc_ entre comillas simples `'`

### Pipelines <a name="bash-pipelines"></a> 

Una _pipeline_ o _pipe_ es una característica muy conveniente que se utiliza para adjuntar la salida estandar (_STDOUT_) de un proceso a la entrada estandar (_STDIN_) de otro como si de un _stream_ se tratase. La sintaxis es la siguiente:

```
<command1> <...args> | <command2> <...args> | <command3> ...<args> ...
```
Veamos varios ejemplos:

```shell
# Contar cuántas palabras tiene el contenido de una API:
$ curl -s http://metaphorpsum.com/sentences/3 | wc -w
33
## Contar el número de ocurrencias de la palabra "the" devuelta por la API:
$ curl -s http://metaphorpsum.com/paragraphs/3 | grep -io "the" | wc -l
```

### Brace expansion <a name="bash-brace"></a> 

_Brace expansion_ se usa para generación de strings. Utliza las llaves `{` y `}` con caracteres separados por comas para crear nuevos strings separados por espacios:
```shell
## Anteponer "file" al string 1 2 y 3
$ echo file{1,2,3}

## Crear combinaciones de múltiples expansiones
$ echo {a,b,c}{1,2,3,4}

## Usando dos puntos `..` para generar secuencias
$ echo {1..10}
```

### Expansión aritmética <a name="bash-expansion-aritmetica"></a>

Con el operador `$` junto con doble paréntesis podemos hacer operaciones aritméticas. Veamos algunos ejemplos:
```shell
$ echo $((34 * 10))
340
$ echo $((24 == 24))
1
```

### Expansión de nombre de ficheros <a name="bash-expansion-nombre"></a>

Podemos utilizar ciertos caracteres a la hora de realizar operaciones para crear patrones que BASH escaneará para encontrar ficheros que coincidan:

- `*` junto a una cadena: Cualquier carácter repetido cualquier número de veces
  
- `?` en una cadena: Sustituye a cualquier carácter
  
- Encerrando ciertos caracteres en `[ ]` hace coincidir caracteres específicos:
```shell
$ ls -l tip[oh].txt
## Buscaría los ficheros tipo.txt y tiph.txt
```

### Variables <a name="bash-variables"></a>

por variables. Para declarar una variable utilizaremos la sintaxis `<nombrevariable>=<valor>` y para leerla antepondremos `$` al nombre de la variable

Un script en BASH puede utilizar argumentos. Los argumentos son referenciados por el signo `$` y su posición numérica empezando por `1`. La variable `$0` indica la shell que ha ejecutado el script o el nombre del propio script.

Vamos a modificar nuestro script para utilizar los operandos como argumentos:

```bash
#!/bin/bash

# $1 representa el primer argumento
# $2 representa el segundo argumento
echo $(($1 + $2))
```

```shell
$ ./calculadora.sh 27 30
57
```

### Condicionales <a name="bash-condicionales"></a>

Ejemplo de sintaxis:
```sh
if [[ $encontrado -eq 0 ]]
then
    echo "No se ha encontrado la palabra '"$1"'"
elif [[ $encontrado -eq 1 ]]
then
    echo "La palabra '"$1"' aparece $encontrado vez"
    echo "Aparece únicamente en la línea $linea"
else
    echo "La palabra '"$1"' aparece $encontrado veces"
    echo "Aparece por primera vez en la línea $linea"
fi
```

### Bucles <a name="bash-bucles"></a>

Tipos de bucles:

```sh
for var in list; do
  block
done
```

```sh
for ((initializer; condition; increment)); do
  block
done
```

```sh
while [ condition ]; do
  block
done
```

```sh
until [ condition ]; do
  block
done
```

### Funciones <a name="bash-funciones"></a>

Sintaxis:

```
function fun_name() {

}

fun_name() {

}
```

Dentro de una función los argumentos son también referenciados por `$1`, `$2`, etc. Para invocar a una función lo haremos sin paréntesis como si fuera otro comando más.

## Configuración DNS <a name="config-dns"></a>
 - [Índice](#indice)
### Resolución de nombres local

Podemos añadir entradas de resolución de DNS al fichero `/etc/hosts`. Este fichero sirve como una tabla estática para la resolución de nombres

La tabla de resoluciones tiene el siguiente formato:

```
IP_ADDRESS-1  HOSTNAME-1  HOSTNAME-2  ... HOSTNAME-N
IP_ADDRESS-2  HOSTNAME-1  HOSTNAME-2  ... HOSTNAME-N
...
IP_ADDRESS-N  HOSTNAME-1  HOSTNAME-2  ... HOSTNAME-N
```
Cuando un servicio requiere una resolución de nombres primero busca en esta tabla antes de realizar peticiones a servidores DNS externos.

### Resolución de nombres remota

La configuración de DNS viene establecida en el fichero `/etc/resolv.conf`. Este fichero no debería de ser manipulado directamente ya que es regenerado cuando el sistema inicia. Si queremos añadir servidores DNS tenemos varias alternativas. Una de ellas es instalar `resolvconf`. 

El servicio `resolvconf` interopera con `systemd-resolve` añadiendo a `/etc/resolv.conf` las entradas que necesitemos de forma automática.
```shell
apt-get install resolvconf
systemctl restart resolvconf
```
Los ficheros de configuración se encuentran en `/etc/resolvconf/resolv.conf.d/`. En ellos tenemos:

- `base`: El contenido no es incluido en `/etc/resolv.conf`. Este fichero contiene información básica del _resolver_ en uso.
- `head`: El contenido se añadirá al principio de `/etc/resolv.conf`
- `original`: Enlace a `/run/systemd/resolve/stub-resolv.conf`
- `tail`: El contenido se añadirá al final de `/etc/resolv.conf`

```shell
## Añadimos 2 servidores DNS
nameserver 8.8.8.8
nameserver 1.1.1.1

## Aplicamos la configuración
resolvconf -u

## Verificamos que se utilizan
nslookup google.com
```

## SSH <a name="ssh"></a>
 - [Índice](#indice)

### ¿Qué es SSH?

SSH (Secure SHell) es un protocolo de red que permite controlar o administrar de forma remota un servidor mediante un mecanismo de autentificación. Su comunicación está cifrada utilizando técnicas criptográficas.

SSH utiliza la arquitectura cliente-servidor donde los clientes acceden al servidor utilizando un sistema de autentificación (_password_, _publickey_, _GSSAPI_, _keyboardinteractive_).

Una conexión de SSH requiere mínimo tres partes:

- Usuario: la cuenta de usuario a la que quieres acceder.
- Host: el servidor SSH (dirección IP o nombre de dominio) al que se quiere acceder.
- Puerto: el puerto en el que está escuchando el servidor SSH.

### Funcionamiento

1. El cliente abre comunicación TCP por el puerto de escucha del servidor
2. El servidor envía su clave pública
3. El cliente analiza la identidad del servidor por conexiones pasadas, o si es por 1ª vez, el usuario elige si continuar o no
4. El servidor responde al cliente con la versión del protocolo que soporta y si el cliente soporta la misma versión, sigue el proceso de conexión
5. Cliente y servidor generan mediante algoritmo _Diffie-Hellman_ una clave de sesión secreta idéntica
6. En conexiones SSH se usan: claves simétricas, claves asimétricas y _hashing_. Una vez establecida la clave para encriptar la comunicación comienza el proceso de autentificación
7. El servidor comprueba las credenciales de usuario usadas por el cliente. Tras la verificación se inicia sesión en el sistema

### Usos frecuentes de SSH

- Transferencia de ficheros
- Ejecución de comandos remotos
- Gestión de infraestructura
- Servir como capa de seguridad sobre otros protocolos (SFTP)
- Reenvío de puertos en aplicaciones (_SSH Tunneling_)

### Instalación de SSH en cliente y servidor
```bash
sudo apt-get update

sudo apt-get install -y openssh-client

sudo apt-get install -y openssh-server

## Comprobamos si está corriendo
service ssh status

## En caso negativo
service ssh start
```
### Conexión mediante claves públicas

Lo primero es crear el par de claves en el cliente
```bash
ssh-keygen
## Esto crea la carpeta .ssh dentro de $HOME y añadirá un fichero id_rsa (clave privada) y id_rsa.pub (clave pública)
```
Una vez generadas las claves hay que añadir la clave pública a la lista de claves permitidas en el servidor, por lo que desde el servidor añadiremos el contenido de nuestra clave pública a `.ssh/authorized_keys` dentro de la carpeta del usuario al que queremos acceder
```bash
cat .ssh/id_rsa.pub
## Mostramos el contenido de la clave pública y lo copiamos al portapapeles

echo "<contenido clave pública>" >> .ssh/authorized_keys
## Copiamos el contenido de la clave pública al fichero
```

### Establenciendo conexión

Para conectarnos al servidor usando la clave anteriormente creada, desde el cliente ejecutaremos el siguiente comando:

```bash
ssh -i ~/.ssh/id_rsa <usuario>@<ip servidor>
```
Tras conectarse podemos ejecutar cualquier comando que necesitemos en la máquina remota. Para salir de la sesión hay que escribir `exit`

En el cliente en ~/.ssh habrá se habrá creado un fichero llamado `known_hosts` el cual almacena las identidades de todos los servidores a los que nos conectemos

En el servidor las claves SSH están almacenadas en /etc/ssh

### Comandos remotos

Aparte de conectarse por el terminal y escribir los comandos y luego salir, se pueden ejecutar los comandos de forma remota. Por ejemplo:
```shell
ssh <usuario>@<ip host> hostname

## También se pueden agrupar varios comandos en una cadena de texto. Por ejemplo para guardar en un fichero información del servidor:
ssh <usuario>@<ip host> '
echo "Server IPs: `hostname --all-ip-addresses`"
echo "Server name: `hostname`"
echo "Server uptime: `uptime -p`"
' > server-info.txt
```

### Fichero de configuración SSH en cliente

Cuando tenemos muchas máquinas a las que acceder, al tener cada una sus propias claves, lo ideal es crear en el cliente un fichero de configuración de SSH en `.ssh/config`
```bash
echo '
Host <ip host> <patron de nombre (opcional)>
  HostName <ip servidor>
  IdentityFile ~/.ssh/id_rsa
' > ~/.ssh/config

## Host se usa para diferenciar a un host de otro (se separan por espacios). Por ejemplo:
echo '
Host 172.30.249.2 ubuntu-server
  HostName 172.30.249.2
  IdentityFile ~/.ssh/id_rsa
' > ~/.ssh/config

## En este caso podremos conectarnos usando
ssh ubuntu-server
```

### SCP

El comando SCP se utiliza para copiar ficheros entre hosts en una red. Utiliza el protocolo SSH para transferir la información y provee la misma seguridad que `ssh` ya que utiliza el mismo sistema de autentificación. SCP pedirá tanto contraseñas como _passphrases_ si son requeridas para la autenticación. La sintaxis del comando es:
```bash
scp <ruta del fichero local> <servidor>:<ruta de destino>
```
Podemos copiar el fichero desde el servidor a nuestro local utilizando otro nombre destino:
```bash
scp <servidor>:<ruta del fichero a copiar> <ruta local/nombre fichero>
```
Se pueden copiar varios ficheros separándolos por espacios

`-r`: Copia estructuras de directorios de forma recursiva

## Administración del sistema <a name="admin-sistema"></a>
 - [Índice](#indice)

### Usuarios y grupos

Cada usuario de Linux permite separar entornos de ejecución para distintos propósitos. Cada usuario tiene directorio personal diferente y puede trabajar simultáneamente con otros usuarios.

Hay usuarios creados con el propósito de restringir acceso a servicios de sistemas (o demonios) de otros usuarios. Por lo que si un usuario es atacado, su acceso al servicio serviría como contención del ataque y no podrá acceder a otros servicios/ficheros de otros usuarios.

Ficheros con información de usuarios:

- `/etc/passwd`: Almacena información de usuarios y sus características. Cada fila corresponde a un usuario y cada campo se separa por `:`. Son los siguientes:
  - Nombre de usuario
  - Contraseña de usuario en texto plano, con `*` o `x` si está encriptada
  - _User ID_ o nº de identificación único de usuario (UID). El de root es `0`
  - _Group ID_ o nº identificación único de grupo. Los usuarios pueden compartir mismo grupo pero por defecto al crear usuario se genera un grupo con su mismo nombre
  - _General Comprehensive Operating System_ o campo de comentarios. Incluye información extra del usuario
  - _Home directory_ o directorio de inicio de usuario
  - Shell que el usuario utiliza por defecto

- `/etc/shadow`: Contiene información cifrada sobre contraseñas de usuarios definidos en `/etc/passwd`. Cada fila corresponde a un usuario y cada campo se separa por `:`. Son los siguientes:
  - Nombre de usuario
  - Contraseña encriptada. `*` indica que la cuenta nunca ha tenido contraseña y `!` indica que la cuenta de usuario ha sido bloqueada
  - Días transcurridos desde último cambio de contraseña
  - Mínimo de días hasta poder volver a cambiar contraseña
  - Máximo de días hasta que el sistema obliga a cambiar la contraseña
  - Nº de días previos a _Max en los que se avisa al usuario que debe cambiar su contraseña
  - Campo reservado para futuros usos

- `/etc/group`: Contiene información sobre grupos del sistema. La estructura es similar a los anteriores:
  - Nombre del grupo
  - Contraseña que permite a usuario cambiar de grupo. Si está vacío no requiere, si tiene `x` está encriptada en `/etc/gshadow`
  - _Group ID_ o identificador único de grupo
  - Lista separada por comas de usuarios pertenecientes al grupo

Los ficheros `/etc/passwd` y `/etc/shadow` no están pensados para modificarse diréctamente. Se haría con los siguientes comandos:

- `useradd`: Crea usuarios. Acepta opciones como la ruta del directorio personal, fecha de expiración, _UID_, _GID_, grupos, contraseñas, _shell_, etc
- `userdel`: Borra usuarios. Admite parámetros como borrar su directorio personal, etc
- `usermod`: Modifica parámetros de un usuario como nombre, pista para contraseña, ruta de directorio personal, etc
- `chsh`: Cambia el shell de inicio de usuario. Las shells válidas están en `/etc/shells` y los cambios se aplican en el próximo inicio de sesión
- `id`: Ofrece información del usuario y sus grupos
- `passwd`: Cambia la contraseña. Admite varios parámetros diferentes
- `groupadd`: Crea grupos. Comparte algunos parámetros con `useradd`
- `groupmod`: Cambia la definición de un grupo como nombre, _GID_, contraseña, etc
- `groupdel`: Elimina grupos

### Gestión de permisos

En linux cada fichero y directorio tienen permisos de:

- **Usuario**: El _UID_ del usuario propietario.
- **Grupo**: El _GID_ del grupo propietario.
- **Otros**: El resto de de usuarios que no tienen ni el _UID_ del usuario propietario ni el _GID_ de del grupo propietario.

El comando `ls -l` lista los archivos y directorios incluyendo información de sus permisos:
```shell
-rw-rw-r-- 1 vagrant vagrant 0 Aug 24 20:12 file.txt
```
El 1º carácter indica:
- `-`: Ficheros regulares
- `d`: Directorios
- `l`: Enlaces simbólicos

El resto de los carácteres indican los permisos de lectura, escritura y ejecución para el propietario, grupo y otros respectivamente:

- `r` indica que el fichero tiene permisos de lectura.
- `w` indica que el fichero tiene permisos de escritura.
- `x` indica que el fichero tiene permisos de ejecución.

El permiso de ejecución en directorios significa que se puede acceder dentro del mismo y listar su contenido. Un usuario sin permiso de lectura a un directorio no podrá ver su contenido. Un usuario sin permiso de ejecución a un directorio podrá ver el nombre de los ficheros pero no su información

`chmod` Modifica los permisos de un fichero o directorio. Estos se pueden cambiar de forma relativa o absoluta:

- Modo relativo: Cambia uno de los campos sin alterar el resto de permisos:
  
  - Se indica a quien se va a cambiar (se puede poner varios):
    - `u`: usuario
    - `g`: grupo
    - `o`: otros
    - `a`: todos (equivalente a `ugo`, también se puede dejar en blanco)
  
  - Se indica el tipo de operación:
  - `+`: añadir permisos
  - `-`: quitar permisos

  - Tipo de permiso:
    - `r`: lectura
    - `w`: escritura
    - `x`: ejecución

  ```shell
  ## Añadir permiso de lectura a otros
  chmod o+r file.txt

  ## Eliminar todos los permisos de escritura y ejecución para todos excepto elpropietario
  chmod go-wx file.txt

  ## Añadir permiso de ejecución para todos
  chmod +x file.txt
  ```
- Modo absoluto: Establece permisos de lectura, escritura y ejecución para propietario, grupo y otros de una vez. Se establecen en octal aunque se representan fácilmente en binario
  ```shell
  -rw-rw-r-- 1 vagrant vagrant 0 Aug 24 20:12 file.txt
  ```
  En este caso los permisos son `rw-` para el propietario, `rw-` para el grupo y `r--` para otros

  Si los transformamos en binario obtenemos:

- `110` para el propietario
- `110` para el grupo
- `100` para otros

Si los transformamos a octal:

- `6` para el propietario
- `6` para el grupo
- `4` para otros

  ```shell
  $ chmod 600 file.txt
  ## Sería 6=rw- para usuario, 0=--- para grupo y 0=--- para otros
  ```

  `chown`: Cambia el propietario de un fichero
  `cgrp`: Cambia el grupo de un fichero
  ```shell
  chown jose:jose file.txt

  sudo chgrp user1 file.txt
  ```

  En Linux se pueden ejecutar comandos de superusuario con `sudo <comando>`

  Se pueden configurar los privilegios de los usuarios para ejecutar ciertos comandos en `/etc/sudoers`. La modificación debe hacerse con el comando `visudo`
  ```shell
  ## Permitir al grupo `sudo` en cualquier definición de host ejecutar cualquier comando
  %sudo ALL=(ALL) ALL

  ## Permitir al usuario `user1` poder ver el fichero de auth.log sin requerir contraseña.
  user1 ALL=(ALL:NOPASSWD) /usr/bin/less /var/log/auth.log

  ## Permitir al grupo `developers` poder ejecutar el comando `ls` con contraseña
  %developers ALL=(ALL:PASSWD) /usr/bin/ls
  ```