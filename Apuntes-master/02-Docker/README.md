# Docker <a name="indice"></a>
  - [Instalación de Docker](#instalacion-de-docker)
  - [Comandos básicos](#comandos-basicos)
  - [Trabajo con imágenes](#trabajo-imagenes)
  - [Volúmenes](#volumenes)
  - [Bind mounts](#bind-mounts)
  - [Backups](#backups)
  - [Networking](#networking)
  - [Docker Compose](#docker-compose)
  - [Extra: Tmpfs, Monitorización y Docker Swarm](extra/README.md)

## Instalación de Docker <a name="instalacion-de-docker"></a>
 - [Índice](#indice)

Para utilizar _Docker_ lo primero es instalarlo en nuestro sistema.
- Para usuarios de _Windows_ hay que instalar [_Docker Desktop_](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe)
- Para usuarios de Ubuntu hay que seguir estos pasos:
1. Configurar el repositorio
  ```shell
  ## Desinstalar posibles versiones antiguas
  sudo apt-get remove docker docker-engine docker.io containerd runc
  ## Actualizar el repositorio apt e instalar paquetes para habilitar atp a usar repositorios sobre HTTPS
  sudo apt-get update
  sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
    
  ## Añadir la clave oficial de Docker
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

  ## Configurar el repositorio
  echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  ```
2. Instalar Docker Engine
  ```shell
  ## Actualizar repositorios apt
  sudo apt-get update

  ## Instalar la última versión de Docker Engine
  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

  ## Verificar que la instalación ha sido correcta
  sudo docker run hello-world
  ## Todo está bien si arranca el contenedor de bienvenida
```
3. Añadir nuestro usuario al grupo _docker_
  ```shell
  ## Crear el grupo docker y añadir al usuario
  sudo groupadd docker
  sudo usermod -aG docker $USER

  ## Salir y volver a entrar a la sesión para que se evalúen los cambios. También se puede usar este comando para activar los cambios
  newgrp docker

  ## Comprobar que se puede ejecutar docker sin sudo
  docker run hello-world
  ## Todo está bien si arranca el contenedor de bienvenida
  ```
 Para que docker funcione en Windows debe estar ejecutado _Docker Desktop_ y para que funcione en Linux el servicio debe estar habilitado
 ```shell
 sudo service docker start
 ```

Si se va a trabajar desde VSCode con _Docker_, lo ideal es instalar la extensión de [**Docker**](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) y [**Dev Containers**](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).

## Comandos básicos <a name="comandos-basicos"></a>
 - [Índice](#indice)

Docker ejecuta _contenedores_ y estos se crean a partir de _imágenes_. Una imagen es un objeto que contiene un SO, una aplicación y las dependencias que esta necesita

### Ejecutar un contenedor

```docker
docker run <nombre contenedor>
## Si no tuvieramos la imagen ya descargada en local, la descargaría desde DockerHub
```
Usando el flag `-d` o `--detach` lo ejecutaría en 2º plano y dejaría el terminal libre para seguir trabajando con él

### Detener un contenedor

```docker
docker stop <nombre contenedor>
```

### Iniciar un contenedor

```docker
docker start <nombre contenedor>
```

### Eliminar un contenedor

```docker
## Antes de borrarlo hay que detenerlo
docker stop <nombre contenedor>

docker rm <nombre contenedor>

#Eliminar todos los contenedores
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
```

### Listar imágenes descargadas en local

```docker
docker images
## Si no tuvieramos la imagen ya descargada en local, la descargaría desde DockerHub
```

### Exponer puertos en localhost
Para poder acceder a los contenedores desde nuestro _locahost_ tenemos que mapear un puerto al puerto del contenedor usando `-p` o `--publish`

```docker
docker run -p <puerto mapeado>:<puerto contenedor> <contenedor>

## Si ejecutamos un contenedor de nginx que usa el puerto 80, podemos mapearlo al 8080 de nuestro localhost
docker run -p 8080:80 nginx
## de esta forma podríamos acceder al mismo desde http://localhost:8080
```

### Visualizar contenedores

```docker
## Mostrar contenedores en ejecución
docker ps

## Mostrar todos los contenedores con -a o --all
docker ps -a
```

### Nombrar un contenedor

Cuando creamos un contenedor _Docker_ crea un nombre aleatorio, pero podemos nombrarlo como queramos usando `--name`
```docker
docker run --name my-contenedor nginx

## También se puede renombrar contenedores existentes
docker rename nombre_contenedor nombre_nuevo
```

### Lanzar un shell interactivo 

Para lanzar un shell al arrancar un contenedor se añade el flag `--interactive --tty` <nombre contenedor> <tipo shell>

```docker
docker run -it ubuntu /bin/bash
## Se genera un contenedor de ubuntu y nos conecta a su shell directamente

docker run --name mycont -d nginx
docker exec -it mycont bash
## Crearíamos un contenedor, ejecutaría el proceso bash dentro del mismo y con '-it' me atacho a él
```

### Ejecutar comandos desde mi local dentro del contenedor

Se usa `docker exec <nombre contenedor> <comando>`
```docker
## Ver el listado de carpetas de la raz del contenedor
docker exec mycontenedor ls -l
```

### Copiar archivos entre local y un contenedor

Para copiar un fichero de local al contenedor e usa `docker cp <ruta fichero local> <nombre contenedor:ruta fichero destino/nombre fichero destino>`
```docker
## Copiar local.html en contenedor nginx
docker cp ./local.html mycontenedor:/usr/share/nginx/html/local.html
```

Para copiar un fichero desde el contenedor a local se usa `docker cp <nombre contenedor:ruta al fichero/nombre fichero origen> <ruta fichero destino/fichero destino>`
```docker
## Copiar múltiples archivos en una carpeta
mkdir carpeta
docker cp mycontenedor:/var/log/nginx/. ./carpeta
```

### Uso de variables de entorno

Ciertos contenedores requieren ser creados con ciertas variables de entorno configuradas. Para ello usaríamos `-e 'NOBRE_VARIABLE=VALOR'`
```docker
## Crear un contenedor con un SQL Server
docker run --name mysqlserver -p 1433:1433 -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=Lem0nCode!' -d mcr.microsoft.com/mssql/server:2019-latest

## Conectarse al mismo con nuestra instancia
docker exec -it mysqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Lem0nCode!
```

## Trabajo con imágenes <a name="trabajo-imagenes"></a>
 - [Índice](#indice)
 - [Listado de imágenes](#listado-imagenes)
 - [Pulling o descarga](#pulling)
 - [Eliminar imágenes](#eliminar)
 - [Buscar imágenes en Docker Hub](#buscar)
 - [Pushing o subida](#pushing)
 - [Crear imágenes propias](#crear)
 - [Contenerización de aplicaciones](#contenerizacion)

### Listado de imágenes <a name="listado-imagenes"></a>
 - [Índice](#trabajo-imagenes)

Ciertos contenedores requieren ser cread
Para visualizar todas las imágenes usamos `docker images`, pero en caso de tener varias del mismo tipo podemos usar `docker images <imagen>
```docker
## Mostrar todas las imágenes de nginx descargadas en local
docker images nginx
```

### Pulling o descarga <a name="pulling"></a>
 - [Índice](#trabajo-imagenes)

Cuando creamos un contenedor y su imagen no está descargada, la descarga automáticamente. Pero hay casos en los que solo queremos descargar la imagen:
- `docker pull <imagen>`: Descarga la imagen desde el repositorio
```docker
## Descargar la última version de Ubuntu
docker pull ubuntu
```
- `docker pull <imagen:version>`: Descarga una versión/tag específica
```docker
## Descargar la versión 6.0.5 de redis
docker pull redis:6.0.5
```
Cada imagen tiene un _#Digest_ que es el hash específico para el contenido específico de una imagen. Dicha información puede encontrarse en DockerHub
```docker
docker pull redis@sha256:800f2587bf3376cb01e6307afe599ddce9439deafbd4fb8562829da96085c9c5
```

Hay mas repositorios aparte de _Docker Hub_. Para descargar una imagen desde otro hay que especificarlo
```docker
## Descargar imagen de busybox desde el repositorio de Google
docker pull gcr.io/google-containers/busybox
```

### Eliminar imágenes <a name="eliminar"></a>
 - [Índice](#trabajo-imagenes)

Docker solo permite eliminar una imagen cuando no existan contenedores creados a partir de la misma

`docker rmi <imagen>`: Elimina la imagen que le indiquemos

`docker rmi -f $(docker images -a -q <imagen>`: Elimina todas las versiones de la imagen que le indiquemos

`docker rmi -f $(docker images -a -q`: Elimina todas las imágenes en local

`docker image prune`: Elimina las imágenes inservibles que Docker genera a veces, dejando solo las útiles

`docker image prune -a`: Elimina las imágenes que no tengan ningún contenedor creado

### Buscar imágenes en Docker Hub <a name="buscar"></a>
 - [Índice](#trabajo-imagenes)

`docker search <imagen>`
```shell
## Buscar imagen de nginx con al menos 50 estrellas
docker search --filter=stars=50 nginx

##  Formatear la visualización de la búsqueda
docker search --format "{{.Name}}: {{.StarCount}}" nginx

## Buscar solo versión oficial de nginx
docker search --filter is-official=true nginx
```

### Pushing o subida <a name="pushing"></a>
 - [Índice](#trabajo-imagenes)

`docker push <imagen:tag>`: Permite subir nuestra imagen a Docker Hub
```docker
## Sube la imagen al repositorio de Git Hub de 0gis0
docker push 0gis0/simple-nginx:v1
```

### Crear imágenes propias <a name="crear"></a>
 - [Índice](#trabajo-imagenes)

Una imagen personalizada se crea a partir de un `Dockerfile`. Un ejemplo de sintaxis es:
```Dockerfile
#Imagen que voy a utilizar como base
FROM nginx:alpine

#Etiquetado
LABEL maintainer="gisela.torres@returngis.net"
LABEL project="lemoncode"

#Como metadato, indicamos que el contenedor utiliza el puerto 80
EXPOSE 80

#Modificaciones sobre la imagen que he utilizado como base, en este caso alpine
COPY content/ /usr/share/nginx/html/
## ADD y COPY permiten copiar archivos de local dentro de una imagen de Docker. ADD ademas permite usar una URL como origen, incluso extraer un .tar y descomprimirlo directamente en el destino
```
Para crear una imagen desde un _Dockerfile_ debemos estar en el directorio donde este se encuentre y ejecutar `docker build <ruta Dockerfile>` seguido de `-t` o `--tag` y `<nombre imagen:tag>`

```docker
## Crear imagen de nginx a partir de Dockefile
docker build . -t simple-nginx:v1
```
Para ver los cambios hechos al construir la imagen se use `docker history <imagen:tag>`
```docker
docker history simple-ninx:v1
```
Para ver información de una imagen, como por ejemplo cuantas capas tiene se usa `docker inspect <imagen:tag>`

Para subir las imágenes a Docker Hub es necesario etiquetarlas con el formato `<usuario Docker Hub>/<imagen:tag>`

`docker tag <imagen:tag> <nuevo nombre:tag>`: Cambia el nombre de la imagen
```docker
## Cambia el nombre de la imagen de nginx con el formato para que el usuario 0gis0 la suba a su repositorio de Git Hub
docker tag simple-nginx:v1 0gis0/simple-nginx:v1
```

### Contenerización de aplicaciones <a name="contenerizacion"></a>
 - [Índice](#trabajo-imagenes)

Tenemos una aplicación realizada por ejemplo en Node.js y la queremos contenerizar:

1. La probamos en local y funciona:
```shell
## Instalamos dependencias de la aplicación
npm install

## Arreglamos vulnerabilidades
npm run test

## Ejecutamos la aplicación
node server.js
```
2. Una forma rápida de crear el _Dockerfile_ y _.dockerignore_ es mediante la extensión de Docker de VSCode:
   
   1. View > Command Palette
   2. Add Docker Files to Workspace
   3. Elejimos la plataforma Node.js
   4. Seleccionamos _package.json_
   5. Seleccionamos el puerto de escucha de la aplicación. Nodej.js usa el 3000
   6. No incluímos el fichero opcional de _Docker Compose_
   
3. Generamos la imagen en base al _Dockerfile_ usando `docker build -t <imagen:tag> .`
```shell
docker build -t hello-world:prod .
```
4. Ejecutamos un nuevo contenedor usando la nueva imagen
```shell
docker run -d -p 4000:3000 hello-world:prod
```

## Volúmenes <a name="volumenes"></a>
 - [Índice](#indice)

Un volumen es una especie de disco duro virtual usado por Docker, para almacenar la información que no queremos que se pierda cuando destruyamos un contenedor

`docker volume ls`: Lista los volúmenes en el host

`docker volume create <nombre>`: Crea un nuevo volumen

`docker volume rm <nombre>`: Elimina un volumen específico. Un volumen no puede eliminarse si existe un contenedor que lo tiene atachado

`docker volume prune -f`: Elimina todos los volúmenes no atachados a un contenedor

Los volúmenes pueden ser creados con el mismo comando de creación de un contenedor. Puede hacerse usando `--mount` o `-v`

- La sintaxis de `--mount` es `--mount source=<nombre volumen>,target=<ruta de creación directorio en el contenedor>`

- La sintaxis de `-v` es `-v <nombre volumen>:<ruta de creación directorio en el contenedor>`

```docker
## Creamos un contenedor de alpine con un volumen llamado 'my-data' vinculado con la carpeta 'almacen' creada dentro del contenedor
docker container run -dit --name my-container \
    --mount source=my-data,target=/almacen \
    alpine

## Nos conectamos al shell del contenedor
docker exec -it my-container sh

## Añadimos datos al volumen
echo "Hola Lemoncoders!" > /almacen/file1

## Vemos el contenido de file1
cat /almacen/file1 

## Si eliminamos el contendor y creamos uno nuevo atachado al mismo volumen, al acceder al contenido de /almacen/file1, podremos comprobar que los datos siguen ahí
```

  - Mostrar contenedores asociados a un volumen: `docker ps --filter volume=<nombre volumen> --format "table {{.Names}}\t{{.Mounts}}"`

  - Inspeccionar un volumen: `docker volume inspect <nombre volumen>`

## Bind mounts <a name="bind-mounts"></a>
 - [Índice](#indice)

Se usa cuando quieres montar un directorio dentro de un contenedor, lo que nos deja una carpeta en local vinculada a una ruta del contenedor. Cualquier cambio que se haga en la carpeta en el host repercutirá en el contenedor directamente. La sintaxis es:

`--mount type=bind,source=<carpeta del host>,target=<directorio del contenedor>`

Si tras el _target_ añadimos `,readonly`, el bind mount será de solo lectura, por lo que no se podrá modificar ningún dato desde dentro del contenedor

```docker
## Creamos un contenedor que crea la carpeta /dev-folder en mi directorio actual y la monta dentro del contenedor en /usr/share/nginx/html/
docker run -d --name devtest --mount type=bind,source="$(pwd)"/dev-folder,target=/usr/share/nginx/html/ -p 8080:80 nginx

## Cualquier fichero que creemos o eliminemos en /dev-folder o dentro del contenedor en /usr/share/nginx/html afectará a ambos destinos simultáneamente
```

Un _bind mount_ puede inspeccionarse al igual que el resto de elementos de docker con `docker inspect <nombre bind mount>`

## Backups <a name="backups"></a>
 - [Índice](#indice)

Se pueden hacer backups del contenido de un volumen creando un fichero comprimido en local gracias al comando `tar`
 ```docker
## Creo contenedor llamado dbstore con imagen de ubuntu y un volumen llamado dbdata vinculado a la carpeta /dbdata del contenedor
docker run -dit -v dbdata:/dbdata --name dbstore ubuntu

## Copio varios ficheros dentro del volumen
docker cp some-files/. dbstore:/dbdata

## Con el siguiente comando se realizan varias acciones
docker run --rm --volumes-from dbstore -v $(pwd)/copias:/backup ubuntu tar cvf /backup/backup.tar /dbdata

## - Creo un nuevo contenedor temporal ya que con `--rm` tras ejecutarse se borrará

## - Monto en el contenedor el volumen del contenedor 'dbstore' usando `--volumes-from dbstore`

## - Ejecuto el comando `tar cvf /backup/backup.tar /dbdata` que comprime el contenido de la carpeta /dbdata del volumen y lo guarda en el fichero backup.tar dentro de la carpeta /backup del contenedor

## - con `-v $(pdw)/copias:/backup` indico que el el fichero backup.tar del directorio /backup del contenedor se copie en $(pwd)/copias de mi máquina local

## Tras el último paso el contenedor desaparece por lo que también la carpeta /backup y su fichero backup.tar, pero antes de esto ocurrir el fichero backup.tar fue grabado a mi máquina local
```
## Networking <a name="networking"></a>
 - [Índice](#indice)

La red por defecto a la que se conectan los contenedores es `bridge` (no es la mejor opción en entornos productivos)

`docker network ls`: Lista las redes disponibles en el host

`docker network inspect <nombre red>`: Muestra información de la red y los contenedores de la misma. Añadiendo `--format '{{json .Containers}}' | jq` formatea la salida para mostrar información de los contenedores de forma clara

`docker network create <nombre red>`: Crea una red (por defecto es tipo _bridge_ en Linux y _NAT_ en Windows)

`docker network connect <nombre red><nombre contenedor>`: Conecta un contenedor a una red. Con este comando puede conectarse un contenedor a varias redes

`docker network rm <nombre red>`: Elimina una red

`docker network prune`: Elimina todas las redes en desuso en un host

`docker network create --driver overlay <nombre red>`: Crea red de tipo overlay (debe estar Docker en modo cluster. Se verá en último módulo)

```docker
#Creamos una red personalizada
docker network create prueba

## Creamos un contenedor dentro de la red 'prueba'
docker run -d --name prueba_cont --network prueba nginx

## Creamos un contenedor no asociado a ninguna red
docker run -d --name prueba_cont --network none nginx
```

## Docker Compose <a name="docker-compose"></a>
 - [Índice](#indice)

Docker Compose es una herramienta de orquestación local de dockers, es decir, se utiliza con el objetivo de definir y ejecutar aplicaciones Docker de varios contenedores de forma fácil y rápida. Por lo que nos ayudaría a simplificar la despliegue de una aplicación que contenga por ejemplo varios contenedores un volumen y su red. Todo se definiría en ficheros `YAML` con el formato `.yml`
```yml
## Ejemplo una aplicación que contiene un contenedor con un Wordpress y otro con una base de datos en MySQL, 2 volúmenes (wordpress_data y db_data) y la red wordpress-network   
services: # Sección donde van los contenedores
   db: # Nombre del contenedor de MySQL
     image: mysql:5.7 # Imagen del contenedor
     volumes: # Volumen asociado al contenedor
       - db_data:/var/lib/mysql
     restart: always
     environment: # Variables de entorno del contenedor
       MYSQL_ROOT_PASSWORD: root_pwd
       MYSQL_DATABASE: wpdb
       MYSQL_USER: wp_user
       MYSQL_PASSWORD: wp_pwd
     networks: # Redes asociadas al contenedor
        - wordpress-network
   wordpress: # Nombre del contenedor de Wordpress
     depends_on: # No se crea hasta que no se haya creado el contenedor anterior
       - db
     image: wordpress:latest # Imagen del contenedor
     volumes: # Volumen asociado al contenedor
      - wordpress_data:/var/www/html
     ports: # mapeo de puertos
       - "8000:80"
     restart: always
     environment: # Variables de entorno del contenedor
       WORDPRESS_DB_HOST: db:3306
       WORDPRESS_DB_USER: wp_user
       WORDPRESS_DB_PASSWORD: wp_pwd
       WORDPRESS_DB_NAME: wpdb
     networks: # Red asociada al contenedor
       - wordpress-network
volumes: # Listado de volúmenes usados
    db_data: 
    wordpress_data: 
networks: # Listado de redes usadas
    wordpress-network: 
```
Para usar _Docker Compose_ debemos estar en el mismo directorio donde se encuentra el fichero _YAML_

`docker-compose up`: Levanta la aplicación:
- `&`: Deja usar el terminal y ver la salida
- `-d`: Ejecuta mi aplicación en segundo plano
- `--build &`: Genera de nuevo la imagen de la app al levantarla
- `--project-name <nombre>`: Para darle nombre a la aplicación
  
`docker-compose stop`: Para la aplicación

`docker-compose down`: Para y elimina la aplicación

`docker-compose -p <nombre app> restart`: Reiniciar la aplicación

`docker-compose ps`: Muestra los contenedores en ejecución, pero solo los del proyecto en la carpeta actual con el nombre actual. Para ver todos se usa `docker ps -a`

`docker ps -a --filter "label=com.docker.compose.project" -q | xargs docker inspect --format='{{index .Config.Labels "com.docker.compose.project"}}'| sort | uniq`: Lista todos los proyectos en ejecución
