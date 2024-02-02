# Kubernetes <a name="indice"></a>
- [Kubernetes ](#kubernetes-)
  - [Instalación de Minikube ](#instalación-de-minikube-)
  - [Comandos básicos ](#comandos-básicos-)
  - [Uso de ficheros YAML ](#uso-de-ficheros-yaml-)
  - [Servicios ](#servicios-)
    - [Instalación y uso de Ingress](#instalación-y-uso-de-ingress)
    - [Asignar pods a servicios](#asignar-pods-a-servicios)
  - [ReplicaSets ](#replicasets-)
  - [Deployments ](#deployments-)
    - [Rollouts](#rollouts)
  - [Namespaces ](#namespaces-)
  - [ConfigMaps ](#configmaps-)
  - [Secretos ](#secretos-)
  - [StatefulSets ](#statefulsets-)
  - [Almacenamiento Persistente ](#almacenamiento-persistente-)
    - [Aprovisionamiento estático de Volúmenes Persistentes ](#aprovisionamiento-estático-de-volúmenes-persistentes-)
    - [Aprovisionamiento dinámico de Volúmenes Persistentes ](#aprovisionamiento-dinámico-de-volúmenes-persistentes-)
  - [Liveness y Readiness Probes ](#liveness-y-readiness-probes-)
  - [Peticiones y Límites de Recursos ](#peticiones-y-límites-de-recursos-)
  - [Autoescalado ](#autoescalado-)
  - [Otros Controladores ](#otros-controladores-)
    - [Jobs ](#jobs-)
    - [CronJobs ](#cronjobs-)
    - [DaemonSets ](#daemonsets-)
  - [Scheduling ](#scheduling-)
    - [Taints y Tolerations ](#taints-y-tolerations-)
    - [Affinity y Anti-Affinity ](#affinity-y-anti-affinity-)

Kubernetes es una plataforma de orquestación de contenedores para automatizar el despliegue, escalado y gestión de aplicaciones de contenedores

Un cluster de Kubernetes está formado por los nodos `master o control panel` y `workers`. El `control panel` gestiona el sistema y administra los nodos `workers` mientras que en los `workers` alojarán los `pods` y los servicios, y serán a los que acceda el usuario final

En Kubernetes la unidad mínima es el _Pod_, y este puede contener 1 o más _contenedores_, los cuales comparten el mismo _namespace_ por lo que todos los _contenedores_ de un _pod_ tendrían la misma IP

Los pods no son permanentes por lo que los mismos pueden destruirse y crearse otros nuevos

![](extra/kubernetes-constructs-concepts-architecture.jpg)

## Instalación de Minikube <a name="instalacion-de-minikube"></a>
 - [Índice](#indice)

Minikube es una herramienta que permite crear un cluster de Kubernetes en nuestro host. En __Ubuntu 20.04__ se instala de la forma siguiente:
```shell
## Actualizamos repositorios
sudo apt update && apt upgrade -y

## Si no tenemos Docker lo instalamos y configuramos
sudo apt install docker.io
sudo service docker start
sudo usermod -aG docker <usuario> ## Damos a nuestro usuario permisos de ejecución de Docker

## Instalamos kubectl y lo configuramos

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

curl -LO "https://dl.k8s.io/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"

echo "$(<kubectl.sha256)  kubectl" | sha256sum --check

sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

kubectl version --client ## Verificamos si está instalado

## Instalamos Minikube

curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube_latest_amd64.deb

## Si esa versión da problemas la 1.27.1 funciona (https://github.com/kubernetes/minikube/releases/download/v1.27.1/minikube_1.27.1-0_amd64.deb)

sudo dpkg -i minikube_latest_amd64.deb

minikube version ## Vemos la versión

## Iniciamos Minikube
minikube start

## Opcional

kubectl cluster-info ## Vemos información del cluster

minikube dashboard ## Habilitar dashboard de Minikube
```

## Comandos básicos <a name="comandos-basicos"></a>
 - [Índice](#indice)
  
`kubectl get nodes`: Lista los nodos del cluster:
- `-o wide`: Muestra más info

`kubectl run <nombre pod> --image <nombre imagen>`
- `--restart=Never`: Para que no se reinicie (Por defecto los pods intentan reiniciar los contenedores)
- `--rm`: Se borra tras ejecutarse
- `--port=<puerto>`: Expone un puerto 
- `--env <nombre variable>=<valor>`

`kubectl exec -it <nombre pod> -- /bin/sh -c 'env' | grep foo`: Verifica las variables de entorno

`kubectl get pods`: Muestra todos los pods
- `-o wide`: Muestra datos adicionales
- `--show-labels`: Muestra todas sus etiquetas

`kubectl get all`: Muestra todos los pods, svc, rs, deployments...

`kubectl delete pod <nombre pod>`: Elimina un pod

`kubectl port-forward <nombre pod> <puerto a vincular>:<puerto del pod>`: Vincular puerto en local al puerto del pod:
- `>/dev/null &`: Deja libre el terminal

```docker
## Ejecuta una API hello world y expone el puerto 80
kubectl run helloworld --image eiximenis/go-hello-world --port=80

## Vincula el puerto 8080 local al 80 del pod 
kubectl port-forward helloworld 8080:80 >/dev/null &

## Probamos a conectarnos
curl http://localhost:8080 

## Si queremos dejar de nuevo el puerto 8080 libre
lsof -i :8080
kill -9 <PID>
```
`kubectl logs <nombre pod>`: Muestra los logs del pod
- `-l <etiqueta=valor>`: Sirve para ver los logs de varios logs que comparten etiquetas (porque formen parte de un mismo deployment por ejemplo)
- `-f`: Deja el terminal a la escucha para que muestre cambios en tiempo real

`kubectl describe pod <nombre pod>`: Muestra una descripción del pod

`kubectl explain`: Muestra información de cualquier objeto de Kubernetes

## Uso de ficheros YAML <a name="yaml"></a>
 - [Índice](#indice)

A través de la línea de comandos `(forma imperativa)` podemos usar Kubernetes pero en la práctica es muy trabajoso, como se puede observar en el siguiente ejemplo:
```docker
## Creamos el pod con la base de datos
kubectl run mysql --image mysql:5 --env MYSQL_ROOT_PASSWORD=my-secret-pw  --env MYSQL_DATABASE=lcwp --env MYSQL_USER=eiximenis --env MYSQL_PASSWORD=Pa+a+a1! --port 3306

## Mostramos la IP del pod
kubectl get pods -o wide

## La metemos en la variable 'mysqlip'
mysqlip=$(kubectl get po mysql -o jsonpath='{.status.podIP}')

# Ejecutamos el pod de WP y le pasamos la IP del pod de MySQL
kubectl run wp --image wordpress:php7.2 --env WORDPRESS_DB_HOST=$mysqlip --env WORDPRESS_DB_PASSWORD=Pa+a+a1! --env WORDPRESS_DB_USER=eiximenis --env WORDPRESS_DB_PASSWORD=Pa+a+a1! --env WORDPRESS_DB_NAME=lcwp  --port 80
```
Por eso la forma correcta de trabajar con _Kubernetes_ es a través de ficheros `YAML (forma declarativa)`. Este sería el del ejemplo anterior:
```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: wpall
  name: wpall
spec:
  containers:
  - env:
    - name: MYSQL_ROOT_PASSWORD
      value: my-secret-pw
    - name: MYSQL_DATABASE
      value: lcwp
    - name: MYSQL_USER
      value: eiximenis
    - name: MYSQL_PASSWORD
      value: Pa+a+a1!
    image: mysql:5
    name: mysql
    ports:
    - containerPort: 3306
    resources: {}
  - env:
    - name: WORDPRESS_DB_HOST
      value: "127.0.0.1"
    - name: WORDPRESS_DB_NAME
      value: lcwp
    - name: WORDPRESS_DB_USER
      value: eiximenis
    - name: WORDPRESS_DB_PASSWORD
      value: Pa+a+a1!
    image: wordpress:php7.2
    name: wp
    ports:
    - containerPort: 80
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
```
Definicion de parametros: https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.29/#pod-v1-core

# apiVersion: APIVersion define el esquema versionado de esta representación de un objeto. 

# kind: es un valor de cadena que representa el recurso REST que representa este objeto. Los servidores pueden deducir esto del punto final al que el cliente envía las solicitudes. No se puede actualizar. En CamelCase. Más información: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

# metadata: Metadatos del objeto estándar. Más información: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata

# spec: Especificación del comportamiento deseado del pod. Más información: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status

# status: Estado del grupo observado más recientemente. Es posible que estos datos no estén actualizados. Poblado por el sistema. Solo lectura. Más información: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status


`kubectl create -f <fichero.yml>`: Despliega la aplicación desde la ruta donde está el fichero `.yml`

## Servicios <a name="servicios"></a>
 - [Índice](#indice)
 - [Instalación y uso de Ingress](#instalación-y-uso-de-ingress)
 - [Asignar pods a servicios](#asignar-pods-a-servicios)

Debido a que los pods pueden destruirse en cualquier momento, no es conveniente apuntar a la IP de un pod, para eso están los servicios:

- **ClusterIP**: Es el servicio que se crea por defecto. Se usan en redes privadas. Proporciona dirección IP interna del cluster. Para acceder a un pod detrás de un servicio, las otras apps del clúster pueden usar esa IP o enviar una solicitud usando el nombre de ese servicio. 
  
- **NodePort**: Ideales para probar el acceso público o privado o proporcionar acceso por breve periodo de tiempo. Abre un puerto del rango 30000-32767 en todos los nodos del clúster. Para acceder al servicio desde fuera del clúster se usa la IP de cualquier nodo worker y el nodeport (IP:nodeport). Estas IPs no son permanentes, cuando un nodo worker se elimina y se crea se le asigna una nueva IP

- **LoadBalancer**: Es el modo más estándar de exponer un servicio en Internet. Activa un balanceador de carga que da una única IP que reenvía todo el tráfico a su servicio. Sirve para exponer un servicio en concreto pero no varios (por lo que habría que usar varios _LoadBalancer_ lo cual es caro en la nube)

- **Ingress**: Forma más completa de exponer un servicio. No es un servicio como el resto, sino un enrutador que permite la entrada al clúster y gestionar el acceso a múltiples servicios. En este caso solo se necesita una IP para exponer varios servicios (al contrario que en _LoadBalancer_)
  
### Instalación y uso de Ingress
 - [Índice](#servicios)

`kubectl expose pod <nombre pod> --name <nombre servicio> --port <puerto>`: Crea un servicio tipo ClusterIP

```docker
## Creamos el pod
kubectl run helloworld --image eiximenis/go-hello-world

## Exponemos el puerto 80 crando un servicio de ClusterIP
kubectl expose pod helloworld --name helloworld-svc --port 80

## Mapeamos el puerto
kubectl port-forward svc/helloworld-svc 3000:80
## Ahora podemos acceder al pod directamente con http://<dirección ip>:3000
```
[Ejercicio de laboratorio: configuración de servicio](extra/README.md)

### Asignar pods a servicios
 - [Índice](#servicios)
  
Los pods son asignados a servicios mediante las etiquetas. Por lo que una vez eliminamos un pod y creamos otro nuevo con la misma etiqueta, automáticamente estará vinculado al mismo servicio

```docker
## Creamos un pod
kubectl run helloweb --image lemoncodersbc/hello-world-web:v1 --port 3000

## Creamos el servicio
kubectl expose pod helloweb --port 3000 --name helloweb-svc

# Probar el servicio usando un pod temporal de busybox
kubectl run bb --image busybox -it --rm -- /bin/sh

## Accedemos al servicio desde dentro del terminal:
wget -qO- http://helloweb-svc:3000
exit

## Quitamos la label del pod
kubectl label pod helloweb run-
## Ahora al probar el servicio de nuevo no va a ser posible conectarse al pod

## Asignar la label al pod de nuevo
kubectl label pod helloweb run=helloweb
## Ahora al probar el servicio si se conectaría al pod

## Borramos el pod y creamos uno nuevo
kubectl delete pod helloweb
kubectl run helloweb --image lemoncodersbc/hello-world-web:v1 --port 3000
## Al probar de nuevo el servicio funcionaría ya que al crear el pod con la label 'helloweb', ha sido asignado automáticamente al servicio
```
`kubectl get endpoints`: Nos muestra los pods asociados a un servicio

## ReplicaSets <a name="replicasets"></a>
 - [Índice](#indice)

Recurso de Kubernetes que asegura que siempre se ejecute un número de réplicas de un pod determinado. Por lo tanto, nos asegura que un conjunto de pods siempre están funcionando y disponibles. Esto nos aporta:
- Que no haya caída del servicio
- Tolerancia a errores
- Escalabilidad dinámica

El ReplicaSet gestiona determinados pods y se basa en las etiquetas que tengan esos pods. Para el ReplicaSet dos pods que tengan la misma etiqueta son "iguales".

Un _ReplicaSet_ solo puede crearse de forma declarativa, por lo que podemos usar `kubectl get pod <nombre pod> -o yaml > fichero_destino.yml` para generar un fichero `YAML` y crear el _ReplicaSet_ a partir del mismo

```docker
# Empezamos creando un pod de la API go-hello-world
kubectl run helloworld --image lemoncodersbc/go-hello-world  

# Etiquetamos el pod
kubectl label pod helloworld app=helloworld

# Vamos a crear un ReplicaSet. No hay manera de hacerlo imperativamente.
kubectl get pod helloworld -o yaml > helloworld-pod

# Borramos el pod
kubectl delete pod helloworld
```
```yaml
# Lo siguiente es limpiar a mano el fichero YAML para convertirlo en un YAML de ReplicaSet

apiVersion: apps/v1 # Versión de la API
kind: ReplicaSet # Definimos que es un ReplicaSet
metadata:
  name: helloworld-rs ## Nombre del ReplicaSet
  labels:
    app: helloworld
spec:
  replicas: 2 # Número de réplicas
  selector: # Indicamos pods a replicar y vamos a controlar con ReplicaSet. En este caso controlará los pods con 'label' con valor 'helloworld'
    matchLabels:
      app: helloworld
  template: # Contiene la definición de un pod
    metadata:
      labels:
        app: helloworld
    spec:
      containers:
      - image: lemoncodersbc/go-hello-world # Imagen del contenedor de cada réplica
        name: helloworld # Nombre del contenedor de cada réplica
      dnsPolicy: ClusterFirst # Tipo de DNS usado
      restartPolicy: Always # Define que los contenedores se inicien
```
```docker
# Generamos el replicaset a partir del fichero YAML
kubectl create -f helloworld-rs.yaml
# Esto ha generado 2 pods de helloworld

# Si creamos otro pod de helloworld desde fuera tendríamos 3 pods
kubectl run helloworld --image lemoncodersbc/go-hello-world 

# Pero si ese tercero lo etiquetamos como 'helloworld', el ReplicaSet eliminaría uno de esos 3 pods ya que en su configuración solo debe haber 2 réplicas
kubectl label pod helloworld app=helloworld
```
`kubectl scale rs <nombre ReplicaSet> --replicas=<numero>`: Escalamos las réplicas que le indiquemos

Podemos aplicar el ReplicaSet a un servicio usando `kubectl expose rs/<nombre ReplicaSet> --port <puerto> --name <nombre servicio>` y seguido se pone `--dry-run=client -o YAML | kubectl create -f -` para que la salida del YAML del comando se ejecute como si lo hubieramos hecho de forma declarativa

```docker
# Se crea un servicio tipo ClusterIP del ReplicaSet del ejemplo anterior
kubectl expose rs/helloworld-rs --port 80 --name helloworld-svc --dry-run=client -o YAML | kubectl create -f -

# Al ser de ClusterIP se puede probar con port-forward
kubectl port-forward svc/helloworld-svc 9000:80
wget -qO- localhost:9000

# Podemos actualizar el servicio a tipo NodePort / LoadBalancer. En este caso usamos LoadBalancer al estar usando Minikube

# Eliminamos el servicio anterior
kubectl delete svc helloworld-svc

# Creamos el servicio tipo LoadBalancer
kubectl expose rs/helloworld-rs --port 80 --name helloworld-svc --type LoadBalancer

# Vemos la información del servicio
kubectl get svc

# NAME                   TYPE        CLUSTER-IP    EXTERNAL-IP       PORT(S)        AGE
# <nombre servicio>   LoadBalancer     <ip>        <pending>     80:<segundo>/TCP   27s

# En el caso de NodePort el segundo puerto (<segundo>) es el puerto donde está escuchando el servicio en cualquiera de los nodos del clúster. Haz un curl a http://<ip-nodo-cluster>:<segundo> y te responderá

# En el caso de LoadBalancer el valor de EXTERNAL-IP te indica la IP a la que debes apuntar. En este caso el puerto es 80 (el balanceador hace la redirección interna al puerto del nodo del clúster).
# Minikube es especial (ya que usa LoadBalancer sin existir un balanceador real)
# Hay 2 formas de crear un tunel para probar el LoadBalancer:
# Opción 1.
minikube tunnel # Ingresamos contraseña de root
kubectl get svc # Cogemos la IP Externa y el puerto 80
# Opción 2. Da un puerto temporal sobre localhost
minikube service helloworld-svc
# Conectándonos a localhost:<puerto temporal> podríamos acceder al servicio

# Ahora podemos escalar las réplicas y el servicio seguirá activo independientemente de que contenedores se eliminen. 

# Si dejamos el ReplicaSet a 0 el servicio no funcionará ya que no hay pods al que conectarse por lo que no nos cargará la web de helloworld

# Si dejamos el ReplicaSet a 1 y eliminamos ese pod, la web de helloworld no se cargará hasta que se haya generado el nuevo pod del ReplicaSet, tras lo que la web volverá a cargar pero con el contador a 0
```
## Deployments <a name="deployments"></a>
 - [Índice](#indice)

Controlador de Kubernetes que ofrece actualizaciones enfocadas a los _ReplicaSets_ y los _Pods_ disponibles, de manera que cuando hay un cambio de estado, el _Deployment_ lleva de forma controlada la transición entre el estado actual y el estado deseado por el usuario. Esto nos aporta:
- Control de réplicas
- Estabilidad de pods
- Actualizaciones continuas
- Despliegues automáticos
- Rollback a versiones anteriores

Un _Deployment_ debe crearse de forma declarativa, aunque también puede hacerse de forma imperativa usando `kubectl create deployment <nombre deployment> --image=<imagen app> --port=<puerto> --replicas=<numero>` y seguido se pone `--dry-run=client -o YAML | kubectl create -f -` para que la salida del YAML del comando se ejecute como si lo hubieramos hecho de forma declarativa

```docker
# Creamos el deployment
kubectl create deployment helloworld --image=lemoncodersbc/go-hello-world --port=80 --replicas=3 --dry-run=client -o yaml | kubectl create -f -

kubectl get deployment  # Aparece un deployment
kubectl get pods    # Aparecen 3 pods
kubectl get rs      # Aparece 1 replica set

# Podemos escalar el ReplicaSet asociado al deployment. Sin interaccionar directamente con el ReplicaSEt
kubectl scale deployment helloworld --replicas=4  

# Exponemos el deployment
kubectl expose deployment helloworld --port 80 --name helloworld-svc --type LoadBalancer

# Limpieza
kubectl delete svc helloworld-svc # Limpiamos el servicio creado
kubectl delete deploy helloworld # Limpiamos los pods y el ReplicaSet
```

El despliegue de un `Deployment` crea un Replicaset, los pods correspondientes, y en su caso un servicio. La forma correcta es crearlo de forma declarativa usando un YAML:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: helloworld
  name: helloworld
spec:
  replicas: 2
  selector:
    matchLabels:
      app: helloworld
  strategy: {} # Indica como realizar la actualización: Recreate (elimina pods antiguos y crea nuevos) o RollingUpdate (actualiza los pods a la nueva versión)
  template:
    metadata:
      labels:
        app: helloworld
    spec:
      containers:
      - image: lemoncodersbc/go-hello-world
        name: go-helloworld
        ports:
        - containerPort: 80
status: {}
--- # En caso de incluir un servicio en el Deployment
apiVersion: v1
kind: Service
metadata:
  labels:
    app: helloworld
  name: helloworld-svc
spec:
  ports:
  - port: 80  #es el puerto de mi maquina, que lo mapea al targetPort
    protocol: TCP
    targetPort: 80  # es el puerto del servicio 
  selector:
    app: helloworld
  type: LoadBalancer # Usar NodePort si se necesita
```

`kubectl create -f <fichero.yaml>`: Desplegar el Deployment

`Kubectl scale rs <replicaset> --replicas=<numero>`: Escalar los pods del ReplicaSet del Deployment

`kubectl get deploy`: Muestra los Deployments

`kubectl delete -f <fichero.yaml>`: Elimina todo el Deployment

`kubectl apply -f <fichero.yaml>`: Crea si no existe, y si ya existe, actualiza el recurso definido en el fichero `YAML` (ya sea deployment, servicio, ReplicaSet...)

Si tenemos varios ficheros `YAML` que queremos ejecutarlos dentro de una carpeta no hace falta hacerlo uno a uno sino usando `kubectl apply -f .`

### Rollouts

Es el proceso de modificar (actualizar) los pods asociados a un Deployment. Un Rollout implica:
1. Crear un ReplicaSet con la nueva definición de los pods
2. Escalar dicho ReplicaSet
3. Desescalar el ReplicaSet antiguo

`kubectl set image deployment <deployment> *=<nueva_imagen:tag>`: Modifica la imagen de un pod/ReplicaSet/Deployment

`kubectl rollout undo deploy helloworld`: Deshacer último cambio realizado en el Deployment. Si se ejecuta por 2ª vez los rehace

`kubectl rollout status deploy <deployment>`: Muestra información del proceso de actualización del Deployment

`kubectl rollout history deploy <deployment>`: Muestra el historial de cambios en el Deployment

Podemos encontrarnos en situaciones en las que por alguna razón necesitamos deshacer los últimos cambios realizados en un Deployment (una actualización de imagen en los pods de su ReplicaSet que nos da error, etc) Haciendo `Rollouts` podemos volver a la versión anterior para deshacer esos cambios

```docker
# Creamos un Deployment de una app con nginx:1.18-alpine usando el fichero YAML (1 rs, 2 pods y 1 svc)
kubectl create -f deployment.yaml 

# Actualizamos la imagen a la versión nginx:1.23.2-alpine
kubectl set image deployment helloworld *=nginx:1.23.2-alpine
# Esto nos deja con:
# - 2 pods nuevos pods con la nueva imagen (los 2 pods anteriores se han eliminado)
# - 2 rs: El nuevo con DESIRED, CURRENT y READY en 2 y el antiguo con DESIRED, CURRENT y READY en 0
# - 1 deployment

# Si actualizaramos de nuevo la imagen a otra versión, se generaría un 3º ReplicaSet y los 2 anteriores se quedarían en 0

# Si quisieramos deshacer los cambios
kubectl rollout undo deploy helloworld
# Esto nos deja con:
# - 2 pods nuevos pods con la anterior imagen (los 2 pods anteriores se han eliminado)
# - 2 rs: El antiguo con DESIRED, CURRENT y READY en 2 y el nuevo con DESIRED, CURRENT y READY en 0
# - 1 deployment

#Limpieza del deployment
kubectl delete -f deployment.yaml
```
## Namespaces <a name="namespaces"></a>
 - [Índice](#indice)

En Kubernetes podemos trabajar con distintos `Namespaces`, los cuales nos permiten aislar recursos para el uso por los distintos usuarios del cluster, para trabajar en distintos proyectos. Por lo tanto podemos crear pods, servicios, y demás objetos de Kubernetes en un _Namespace_ concreto para airlarlos de otros _Namespaces_

Estos _Namespaces_ no impiden la comunicación entre pods

`kubectl create ns <nombre>`: Crea un nuevo Namespace

`kubectl get namespaces`: Lista los Namespaces

`kubectl describe ns <namespace>`: Muestra las características del Namespace

`kubectl get <pod/svc/rs/deploy> -n <namespace>`: Nos mostrará el recurso del Namespace. con `kubectl get all -n <namespace>` mostrará todos los objetos del Namespace

También podemos crear Namespace a partir de un fichero `YAML`:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: proyecto1
```
## ConfigMaps <a name="configmaps"></a>
 - [Índice](#indice)

La forma en la que se pasan valores desde el entorno al código de nuestra aplicación es mediante el uso de `variables de entorno`. A nuestros contenedores podemos pasarle variables de entorno mediante `-env`

En los ficheros ``YAML`` podemos introducir variables de entorno a la hora de crear los pods
```yml
env:
- name: <variable>
  value: <valor>
```
El inconveniente de poner las variables de entorno directamente en el `YAML` de, por ejemplo, un `Deployment`, si quiere desplegarlo en 2 entornos distintos necesitaría 2 `Deployments` para que ambos entornos recibieran las variables. Kubernetes aporta un mecanismo para separar los valores de las variables entorno de su uso. Esto se hace mediante `ConfigMaps`, los cuales, entre otras funciones, se usan para obtener valores y asignarlos a variables de entorno

Un ConfigMap es un recurso de Kubernetes que almacena datos de configuración en pares clave-valor.

Por lo que para usar variables de entorno en nuestros pods en distintos entornos, se crearían `ConfigMaps` a medida en cada uno de los entornos. Estos pueden crearse de forma imperativa en la propia `Pipeline` de despliegue en un Script

`kubectl create cm <nombre> --from-literal clave=valor --from-literal clave2=valor2`: Crea un ConfigMap de forma imperativa

En la práctica es mejor tener las variables de entorno en un `ConfigMap` y hacer referencia al mismo desde el `Deployment`. Hay 2 formas de pasar las variables desde los `ConfigMaps` a nuestros pods:
- Pasamos variables concretas al pod:
    ```yml
    # cm-dev.yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: democm
    data: # En este ConfigMap hay 3 variables
      user: josedev
      user2: pepedev
      user3: lolodev
    ```
    ```yaml
    # deployment.yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
    name: demo
    labels:
      name: demo
    spec:
      selector:
        matchLabels:
          name: demo
      template:
        metadata:
          labels:
            name: demo
        spec:
          containers:
          - name: main
          image: busybox
          args:
          - "tail"
          - "-f"
          - "/dev/null"
          env:
          - name: DEMO_VAR
            valueFrom:
              configMapKeyRef:
                key: user # Importamos solo la variable user
                name: democm
    ```
- Pasamos todas las variables del ConfigMap juntas al pod
    ```yml
    # cm-dev.yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: democm
    data:
      DEMO_VAR: josedev
      DEMO_VAR2: josedev2
    ```
    ```yaml
    # deployment.yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: demo
      labels:
        name: demo
    spec:
      selector:
        matchLabels:
          name: demo
      template:
        metadata:
          labels:
            name: demo
        spec:
          containers:
          - name: main
            image: busybox
            args:
            - "tail"
            - "-f"
            - "/dev/null"
            envFrom: ## Cogemos todas las variables de entorno del ConfigMap 'democm'
              - configMapRef:
                  name: democm
    ```

Aplicamos tanto el `ConfigMap` como el `Deployment`
```docker
kubectl apply -f .
```
Cuando se crea el pod, verificamos que tiene la variable de entorno
```docker
kubectl exec <nombre pod> -it -- /bin/sh
env
# Si hemos usado la opción 1 debería aparecer la variable DEMO_VAR=josedev
# Si hemos usado la opción 2 deberían aparecer las variables DEMO_VAR=josedev y DEMO_VAR2=josedev2
```

Otro uso que se le puede dar al `ConfigMap` es que a través de él, el entorno inyecte un fichero de configuración en la imagen de `Docker`. En `Docker` podríamos hacer un `Bind Mount` para compartir una carpeta del Host con el contenedor pero en Kubernetes es distinto, ya que no tenemos un Host como máquina local sino distintos nodos

Para pasar ficheros de configuración a través de `ConfigMaps` en Kubernetes se usan `Volúmenes` (distintos a los de `Docker`) que son espacios de almacenamiento del pod, que tiene su mismo ciclo de vida y solo lo usan sus contenedores

El uso más simple de los `Volúmenes` es:
1. Usar un `ConfigMap` que contenga un fichero (o claves multilínea)
   ```yaml
    # Creamos el YAML con las claves multilínea
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: configcm
    data: # Podemos combinar clave:valor con claves multilínea
      LOG_LEVEL: Debug # Introducimos 1 clave:valor
      config.xml: |- # Introducimos una clave multilínea llamada config.xml
        <root>
            <values>
                <add name="x">value_x</add>
            <values>
        </root>
      config.json: |- # Introducimos una clave multilínea llamada config.json
        {
            "log_value": 1
        }      
   ```
2. Meter ese fichero en un `volumen` del pod, definiendo un `volumen` en el pod cuyo origen sea el `ConfigMap`
3. Mapear este `volumen` del pod a un directorio del sistema de ficheros de un contenedor
   ```yaml
    # deploy_file_.yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: demo
      labels:
        name: demo
    spec:
      selector:
        matchLabels:
          name: demo
      template:
        metadata:
          labels:
            name: demo
        spec:
          # Inicio Paso 2 #
          volumen: # Creamos el volumen con contenido del ConfigMap
          - name: configvol # Nombre del volumen          
          - configMap: # Decimos que el tipo de volumen es ConfigMap
              name: configcm # Nombre del ConfigMap
          # Fin Paso 2 #    
          containers:
          - name: main
            image: busybox
            # Inicio Paso 3 #
            volumeMounts: # Montamos el volumen en el contenedor
            - mounthPath: /config # Ruta de montaje
              name: configvol # Nombre del volumen creado en paso 2
            # Fin Paso 3 #  
            args:
            - "tail"
            - "-f"
            - "/dev/null"
            envFrom:
              - configMapRef:
                  name: democm
   ```
   ```docker
   kubectl apply -f deploy_file.yaml
   kubectl exec <pod> -it -- /bin/sh
   # Desde dentro del pod podemos ver que se ha creado la carpeta /config que contendrá 1 fichero por cada clave (LOG_LEVEL, config.json y config.xml)
   ```

## Secretos <a name="secretos"></a>
 - [Índice](#indice)

El objeto `Secret` es muy parecidoa a los `ConfigMaps`, pero los secretos deberían usarse para guardar información que debiera ser secreta, ya que Kubernetes toma medidas de seguridad para ocultar su contenido en el clúster, aunque una vez dentro del pod la información del secreto es visible

No deberíamos tener `YAML` de secretos ya que no es seguro, sino que deberían generarse automáticamente en el despliegue

Todo lo que creamos en Kubernetes se guarda en /etcd, pero los secretos se guardan de forma encriptada

Se pueden crear de forma imperativa usando `kubectl create secret generic <nombre secreto> --from-literal "constr=<clave>=<valor>;<clave2>=<valor2>"`

`kubectl create secret generic <nombre secreto> --from-file <fichero>=./<fichero>`: Crea secreto a partir de fichero
```docker
# Creamos el secreto
kubectl create secret generic dbconfig --from-file config.xml=./config.xml

# Mostramos el YAML y copiamos el campo encriptado
kubectl get secret dbfile -o yaml

# Lo decodificamos ya que está en Base64
echo <campo codificado> | base64 --decode
```
Ejemplo de como usar las 2 técnicas en un mismo pod, montando un secreto que nos de una variable de entorno y uno que nos de un fichero
```yaml
# secret_dbconfig.yaml - Guardamos un secreto tipo clave:valor
apiVersion: v1
kind: Secret
metadata:
  name: dbconfig
type: Opaque
data:
  user: cGF0YXRhO3B3ZD1wYXRhdGE= # Información codificada en base64
```

```yaml
# secret_dbfile.yaml - Guardamos un secreto tipo fichero
apiVersion: v1
kind: Secret
metadata:
  name: dbfile
type: Opaque
data:
  config.xml: cGF0Ydklj345543jklXRhO3B3ZD1wYXRhdGE= # Información codificada en base64
```

```yaml
# deploy_secret.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo
  labels:
    name: demo
spec:
  selector:
    matchLabels:
      name: demo
    template:
      metadata:
        labels:
          name: demo
      spec:
        volumes: # Creamos un volumen
          - name: dbconfig # Nombre del volumen
            secret:
              secretName: dbfile # Nombre del secreto
        containers:
        - name: main
          image: busybox
          volumeMounts: # Montamos el volumen
            - mountPath: /config
              name: dbconfig
          args:
          - "tail"
          - "-f"
          - "/dev/null"
          env:
            - name: constr # Creamos variable de entorno
              valueFrom: # Le damos valor a esa variable de entorno
                secretKeyRef:
                  key: user # Referenciamos la clave user de secret_dbconfig.yaml
                  name: dbconfig # Referenciamos al nombre del secreto en secret_dbconfig.yaml
```
```docker
# Desplegamos el pod con la configuración
kubectl apply -f deploy_secret.yaml

kubectl exec <nombre pod> -it -- /bin/sh
env # Nos mostraría el listado de variables de entorno y ahí debería aparecer nuestro secreto de dbconfig decodificado
cat /config/config.xml # Nos mostraría el fichero (o variable multilínea) que le pasamos por dbfile decodificado
```

## StatefulSets <a name="statefulsets"></a>
 - [Índice](#indice)

Es otro tipo de `controlador` de Kubernetes, o sea es una pieza de software que crea y gestiona ciertos objetos, generalmente Pods. Como por ejemplo `ReplicaSet`, que se encarga de que siempre hayan pods corriendo, o el `Deployment` que controla `ReplicaSets`

`StateFulSet` gestiona réplicas de pods **con estado**, o sea, que tienen ownership de unos datos a los que solo ellos pueden tener acceso (por ejemplo una Base de datos)

A diferencia de un `ReplicaSet` o `Deployment` que trata a los pods como entes sin entidad (para él todos son iguales), dándole nombres aleatorios y creándolos/destruyéndolos al azar), el `StatefulSet` si le da una identidad a cada pod (aunque son todos idénticos: mismos contenedores, imágenes, volúmenes...), y les asigna nombres con sufijo predictivo (pod xxx-0, pod xxx-1, pod xxx-2...), y estos son creados de menor a mayor y destruídos en orden inverso

A la hora de crearlos/eliminarlos realiza la acción con el siguiente cuando el anterior ha acabado, aunque esto puede configurarse para que funcionen como los `ResplicaSet` o los `Deployments`

Creamos un `YAML` de un `StateFulSet` (la unica diferencia con uno de `Deployment` es el `kind: StatefulSet`)
```yaml
# ss_azure.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: demoss
spec:
  serviceName: demoss
  selector:
    matchLabels:
      app: demo
  template:
    metadata:
      labels:
        app: demo
    spec:
      containers:
      - image: lemoncodersbc/go-hello-world
        name: main
        ports:
        - containerPort: 80
```
Creamos el `StatefulSet` a través del `YAML`
```docker
kubectl apply -f ss_azure.yaml
```
Comprobamos que nos ha creado un pod
```docker
kubectl get pod
# Nos muestra el pod demoss-0
```
Lo escalamos a 5 réplicas
```docker
kubectl scale statefulset/demoss --replicas=3
# Va creando cada pod cuando el otro acaba y con nombres correlativos
```

Hasta ahora solo los `servicios` tenían una entrada **DNS**, pues el `StatefulSet` además de los `servicios` también la obtienen los pods. Porque desde un pod me puede interesar acceder a otro concreto. Para obtener estas entradas **DNS** se crea un `servicio` enlazado a los pods del `StatefulSet`

Creamos el `YAML` de un `servicio`
```yaml
#svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: demoss ## Tiene que tener el mismo nombre que el StatefulSet
spec:
  selector:
    app: demo ## tiene que usar el mismo selector 'app' que el StatefulSet para seleccionar sus pods
  ports:
  - port: 80
```
Creamos el `servicio` a través del `YAML`
```docker
kubectl apply -f svc.yaml
```
Comprobamos que los pods están enlazados con el servicio
```docker
kubectl get endpoints
# Muestra que el servicio 'demoss' tiene las IPs de los 3 pods como endpoints
```
Comprobamos las entradas DNS
```docker
# Creamos un pod que abra un terminal
kubectl run bb --image busybox --rm --restart Never -it -- /bin/sh
# Hacemos llamada a los pods con wget -qO- http://<nombre pod>.<nombre svc>
wget -qO- http://demoss-1.demoss
# Vemos que puede conectarse a cada uno de los pods creados a través de sus DNS
```

Puede haber un escenario donde me interese a través de una consulta **DNS** obtener las IPs de todos los pods que estén detrás de un servicio para acceder selectivamente a uno de ellos. Se hace con un tipo de `servicio` de tipo `ClusterIP` llamado **Headless** (servicios que no tienen IP)

Creamos el `YAML` de un `servicio` **Headless**
```yaml
#svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: demoss 
spec:
  clusterIP: None ## Para hacerlo Headless hay que especificar ClusterIP: None
  selector:
    app: demo
  ports:
  - port: 80
```
Creamos el `servicio` a través del `YAML`
```docker
kubectl apply -f svc.yaml
```
Comprobamos que el servicio no tiene IP
```docker
kubectl get svc
```
Comprobamos que acceda a los pods enlazados al servicio
```docker
# Creamos pod de busybox
kubectl run bb  --image busybox --rm --restart Never -it -- /bin/sh
# Intentamos acceder a los pods a través del dns del servicio
wget -qO- http://demoss
# Comprobamos que va accediendo a los distintos pods
```
Este ejemplo demuestra que un `servicio` que no tiene `ClusterIP` lo que tiene en la entrada DNS son las IPs de todos los pods en vez de la de la IP del `servicio` (como en el caso de `ClusterIP`). Por lo que si hago una consulta **DNS** lo que obtengo es la lista de IPs de todos los pods detrás de ese `servicios` y puedo usar los pods que yo quiera

Otra característica importante de los `StatefulSets` es la unión que nos dan entre ellos y los [`volúmenes persistentes`](#aprovisionamiento-estatico). En el fichero `YAML` nos permite crear una plantilla de `PersistentVolumeClaim`

Creamos el `YAML` de un `StatefulSet` que va a llevar la plantilla del `PersistentVolumeClaim` (este ejemplo es específico de AKS)
```yaml
# ss_azure_pvc.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: demoss
spec:
  serviceName: demoss
  selector:
    matchLabels:
      app: demo
  volumeClaimTemplates: # Inicio Plantilla de pvc
    - metadata:
        name: demoss
      spec:
        storageClassName: managed
        resources:
          requests:
            storage: 500Mi
        accessModes:
          - ReadWriteOnce # Fin Plantilla de pvc
  template:
    metadata:
      labels:
        app: demo
    spec:
      containers:
      - image: lemoncodersbc/go-hello-world
        name: main
        ports:
        - containerPort: 80
        volumeMounts: # Monto el volumen en el directorio /data del pod (en este caso no hace falta definirlo más arriba)
          - mountPath: /data
            name: demoss # El nombre debe coincidir con el de la Plantilla de pvc
```
Creamos el `StatefulSet` a través del `YAML`
```docker
kubectl apply -f ss_azure_pvc.yaml
# Podemos comprobar que se ha creado el pod, el pvc y el pv
```
Escalamos el `StatefulSet` a 5 réplicas
```docker
kubectl scale statefulset demoss --replicas=5
# Podemos ver que se van creando los pods correlativos
```
Comprobamos los pvc y pv
```docker
kubectl get pvc
# Podemos ver que a la vez que se van escalando los pods, se van escalando los pvc, escalando a la vez los pv, para que cada pod tenga el suyo propio

# Cada pv que se ha creado crea un disco virtual en Azure
```
Probamos el **almacenamiento persistente** de cada pod
```docker
# Entramos en el shell del pod 2
kubectl exec -it demoss-2 -- /bin/sh

# Vamos al directorio de montaje /data
cd /data

# Creamos texto.txt con el contenido "Hola mundo"
echo "Hola mundo" > texto.txt

# Salimos del shell del pod 2 y buscamos a través del shell del pod 3 el fichero texto.txt en /data, y comprobamos que en su pv no existe (ya que se creó en el pv del pod 2)

# Borramos el pod 2 y en un instante el 'StatefulSet' lo vuelve a crear. Entramos en el shell del pod 2 de nuevo y buscamos texto.txt en /data, comprobando que el fichero sigue ahí aunque el pod se eliminó ya que el ciclo de vida de su pvc no es el mismo que el del pod, y aunque el pod se eliminara al volverlo a crear sigue asociado a su antiguo pvc

# Incluso si borramos el 'StatefulSet', los pvc siguen persistiendo (a no ser que los configuremos para lo contrario), volviendo a linkearse a sus correspondientes pods si volvieran a crearse
```

## Almacenamiento Persistente <a name="almacenamiento-persistente"></a>
 - [Índice](#indice)
 - [Aprovisionamiento estático de Volúmenes Persistentes](#aprovisionamiento-estatico)
 - [Aprovisionamiento dinámico de Volúmenes Persistentes](#aprovisionamiento-dinamico)

Un `volumen` es un espacio de almacenamiento que tiene el pod y por lo tanto está ligado a su ciclo de vida, si el pod muere el `volumen` también. El `almacenamiento persistente` o `volumen persistente` son los datos almacenados que persisten a los pods, por lo que si se crea un pod, le vinculamos un almacenamiento persistente, eliminamos el pod, y creamos un nuevo pod, este podrá acceder a los datos que había escrito el pod anterior

Al igual que los `volúmenes` nos permiten compartir datos entre contenedores dentro de un mismo pod, el `almacenamiento persistente` permite compartir datos entre pods.
- Lo ideal es que esté almacenado fuera del clúster, por ejemplo, en un NAS (on-prem) o en algún servicio de Cloud, ya que si lo guardamos en el disco duro de un `nodo` y este se cae sería inaccesible. 
- El clúster debe tener un driver llamado `aprovisionador` que es almacenado en un contenedor y al ejecutarse permite crear una conexión entre clúster y almacén externo. Usando los `aprovisionadores` creamos **clases de almacenamiento** (cada uno es un objeto de Kubernetes que usa un `aprovisionador` determinado con unos parámetros específicos para acceder a un elemento externo)
- Utilizando una **clase de almacenamiento** vamos a crear un **volumen persistente** para almacenar datos en la **clase de almacenamiento** 
- Para que el pod use un **volumen persistente**, este tiene que hacer una petición de uno que cumpla unos requisitos. Si en ese momento el clúster no tiene ninguno definido y no puede crearlo, el pod no podrá arrancar, pero si el clúster pudiera crearlo, se le asignará al pod y el pod montará tal volumen como uno propio

Las **clases de almacenamiento** se representan mediante objeto de tipo `storage.k8s.io/v1/StorageClass`

Los **volúmenes persistentes** se representan mediante objeto de tipo `v1/PersistentVolume`

Las **peticiones de volumen persistente** que hacen los pods se representan mediante objeto de tipo `v1/PersistentVolumeClaim` (esto está separado del `YAML` del pod porque tienen ciclos de vida distintos)

Tanto las **clases de almacenamiento** como los **volúmenes persistentes** no tienen `Namespace` por lo que son globales al cluster

### Aprovisionamiento estático de Volúmenes Persistentes <a name="aprovisionamiento-estatico"></a>
 - [Índice](#almacenamiento-persistente)

El aprovisionamiento estático es cuando creamos el volumen persistente apuntando a un hardware concreto (escenario típico on-prem)

Para este ejemplo usaremos Minikube. La creación en Minikube (solo tiene 1 nodo) sería distinta a como se haría por ejemplo en un clúster de Kubernetes (tiene varios nodos y en la práctica se usarían aprovisionamientos dinámicos)

Vemos las clases de almacenamiento que hay definidas en Minikube
```docker
kubectl get sc
# Tiene la clase de almacenamiento 'standard', la cual usa el provisionador 'k8s.io/minikube-hostpath'
```
Creamos el `YAML` de la clase de almacenamiento
```yaml
# sc.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  labels:
    addonmanager.kubernetes.io/mode: EnsureExists
  name: prueba
provisioner: k8s.io/minikube-hostpath # Guarda los datos en un directorio de disco de Minikube
reclaimPolicy: Delete
volumeBindingMode: Immediate
# Aquí decimos a este StorageClass que todos volumenes persistentes que se creen utilizando la StorageClass 'standard' van a usar el aprovisionador 'k8s.io/minikube-hostpath'
```
Creamos la `clase de almacenamiento` a través del `YAML`
```docker
kubectl apply -f sc.yaml
```
Vemos la `clase de almacenamiento` creada
```docker
kubectl get sc
```
Creamos el `YAML` del `volumen persistente`
```yaml
# pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mypv
spec:
  storageClassName: clasejose  # metemos el nombre del storageclass
  accessModes:
    - ReadWriteOnce
  capacity:
    storage: 1Gi
  hostPath:
    path: /data/pv001 # Aqui no estamos usando aun una clase de almacenamiento, sino el aprovisionador hostPad
```
Creamos el `volumen persistente` a través del `YAML`
```docker
kubectl apply -f pv.yaml
```
Vemos el volumen persistente creado
```docker
kubectl get pv
```
Un pod no va a acceder directamente a el `volumen persistente` "mypv", sino que usa el objeto intermedio llamado `PersistentVolumeClaim` para pedir uno, por lo que creamos su `YAML`
```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mypvclaim
spec:
  storageClassName: clasejose # Si hubieran varios PersistenVolume creados, al nombrar aqui la clase uno de ellos (clasejose), PersistentVolumeClaim se enlazaría al PersistentVolume con clase clasejose
  accessModes:
    - ReadWriteOnce
  resources:
    requests: 
      storage: 500Mi
```
Creamos el `PersistentVolumeClaim` a través del `YAML`
```docker
kubectl apply -f pvc.yaml
```
Vemos que el PersistentVolumeClaim "mypvclaim "se ha enlazado al PersistentVolume "mypv" 
```docker
kubectl get pv
# Si en la pvc hubieramos pedido 2Gi en vez de 500Mi y los volúmenes persistentes que tenemos son de menor capacidad, esta pvc se va a quedar en estado "Pendiente" hasta que haya un pv de la capacidad que esta necesita
```
Ahora creamos un `Deployment` (también puede hacerse con un pod). Creamos primero el `YAML`
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demodeploy
spec:
  selector:
    matchLabels:
      app: demo
  template:
    metadata:
      labels:
        app: demo
    spec:
      volumes:
      - name: external
        persistentVolumeClaim: # Creo el volumen que referencia al pvc "mypvclaim"
          claimName: mypvclaim
      containers:
      - image: lemoncodersbc/go-hello-world
        name: main
        ports:
        - containerPort: 80
        volumeMounts: # Monto el volumen en el directorio /data del pod
          - mountPath: /data
            name: external
```
Creamos el `Deployment` a través del `YAML`
```docker
kubectl apply -f deployment.yaml
```
Verificamos que funcione
```docker
# Abrimos shell dentro del pod que ha creado el deployment
kubectl exec -it <nombre pod> -- /bin/sh

# Entramos en la carpeta /data y creamos fichero.txt con el contenido "Hola amigos"
cd /data
echo "Hola amigos" > fichero.txt

# Escalamos a 0 réplicas para destruir el pod
kubectl scale deploy demodeploy --replicas=0

# Volvemos a escalarlo a 1 para crear nuevo pod
kubectl scale deploy demodeploy --replicas=1

# Abrimos shell dentro del nuevo pod
kubectl exec -it <nombre pod> -- /bin/sh

# Vamos a la carpeta /data y allí se encontrará el fichero fichero.txt con el contenido "Hola amigos", lo que significa que el almacenamiento persistente funciona

# Podemos acceder al nodo para ver donde está realmente el fichero
minikube ssh # Accedemos al nodo mediante SSH
ls /data/pv001 # Ahí estaría fichero.txt
```

### Aprovisionamiento dinámico de Volúmenes Persistentes <a name="aprovisionamiento-dinamico"></a>
 - [Índice](#almacenamiento-persistente)

En un escenario tipo Cloud al ser los recursos virtuales y generalmente no tenemos discos físicos, no se suele usar el **aprovisionamiento estático de volúmenes persistentes** por lo que el Administrador del clúster no crea `volúmenes persistentes`, sino que las `PersistentVolumeClaim` son las que automáticamente van a crear esos `volúmenes persistentes`, lo que se traduce en **aprovisionamiento dinámico de volúmenes persistentes**

Cuando trabajamos con varios clusters, cubernetes los llama `contextos`, para listarlos se usa `kubectl config get-contexts` y para cambiar entre unos y otros se usa `kubectl config use-context <nombre contexto>`

Para este ejemplo se usará un clúster de AKS (Azure Kubernetes Service)

Nos logueamos a Azure desde el terminal
```shell
az login --use-device-code
## Posteriormente entramos a https://microsoft.com/devicelogin e introducimos el código de autentificación proporcionado. Tras unos segundos ya estaremos logueados desde el terminal

## Generamos el fichero de configuración de kubectl lo que haría que los comandos se dirigan al clúster de AKS (y no al de Minikube en este caso)
az account set -s <id de subscripción>
az AKS get-credentials -n <AKS cluster> -g <grupo de recursos>
``` 
Creamos el fichero `YAML` de la pvc
```yaml
# pvc_azure.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mypvc
spec:
  storageClassName: managed # Usamos una de las múltiples StorageClass que proporciona AKS para crear el volumen persistente
  accessModes:
    - ReadWriteOnce
  resources:
    requests: 
      storage: 500Mi
```
Creamos el `pvc` a través del `YAML`
```docker
kubectl apply -f pvc_azure.yaml
```

Listamos la `pvc`
```docker
kubectl get pvc
# Estará en estado "Pending" porque la StorageClass "managed" tiene el valor "WaitForFistConsumer" en el atributo "VOLUMEBINDINGMODE".

# El atributo "VOLUMEBINDINGMODE" de una StorageClass puede tener 2 valores: Immediate (Se crea el pv al crear la pvc) o WaitForFistConsumer (El pv no se crea físicamente hasta que un pod pida esa pvc, momento en el que automáticamente se creará el pv)
```
Creamos el fichero `YAML` del `Deployment`
```yaml
# deploy_azure.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demodeploy
spec:
  selector:
    matchLabels:
      app: demo
  template:
    metadata:
      labels:
        app: demo
    spec:
      volumes:
      - name: external
        persistentVolumeClaim: # Creo el volumen que referencia al pvc "mypvclaim"
          claimName: mypvc
      containers:
      - image: lemoncodersbc/go-hello-world
        name: main
        ports:
        - containerPort: 80
        volumeMounts: # Monto el volumen en el directorio /data del pod
          - mountPath: /data
            name: external
```
Creamos el `Deployment` a través del `YAML`
```docker
kubectl apply -f deploy_azure.yaml
```
Listamos la `pvc` de nuevo
```docker
kubectl get pvc
# Ahora está en estado "Bound" ya que automáticamente se ha creado el pv físicamente porque al crear el Deployment su pod pidió al pvc
```
Al borrar el `PersistentVolumeClaim` se borra automáticamente el `PersistentVolume`, y tras borrarse este último seguídamente se elimina el recurso del Cloud

## Liveness y Readiness Probes <a name="liveness-readiness"></a>
 - [Índice](#indice)

 Los contenedores y los pods tienen distinto ciclo de vida:

 - Los pods pueden estar en 3 estados:
    - Pending: En proceso de creación y asignación de nodo)
    - Running: Con nodo asignado y corriendo)
    - El estado de terminación que puede ser de 3 tipos:
      - Error: Por error del contenedor (y el pod muere)
      - Complete: Contenedores terminan ok (de 1 sola ejecución)
      - Evicted: Por falta de recursos

    Un pod nunca se reinicia por lo que si se acaba muere.

 - Los contenedores pueden estar 3 estados principales (Running lo gestiona Kubernetes y Live y Ready la aplicación en cuestión):
    - Live: Está corriendo y responde a peticiones
    - Running: Corriendo y ejecutando algo
    - Ready: Preparado para atender peticiones (no está listo si está cargando aun, si ya puede atender peticiones pero está pendiente de alguna dependencia, o por estar saturado)

La comunicación entre Kubernetes y nuestra aplicación se realiza a través de pruebas. Estas son las **livenessProbe** (si falla, el pod reinicia el contenedor) y **readinessProbe** (si falla, el pod es eliminado de los endpoints de los servicios hasta que la prueba sea exitosa). 

Cualquiera de las 2 pruebas pueden hacerse mediante 4 mecanismos distintos que son ejecutados por el pod para ver si el contenedor sigue live/ready

1. Kubernetes ejecuta un comando dentro del contenedor (kubectl exec) y si devuelve exit(0) está ok

2. Abrir un socket contra un puerto y si se puede asume que está live/ready

3. Hacer una llamada http get a una URL expuesta por el contenedor. Si devuelve 200 está live/ready

4. Hacer una llamada GRPC y ver si devuelve respuesta correcta

Las pruebas deben ser relativamente rápidas porque Kubernetes las ejecutará cada cierto tiempo (definido por nosotros)

Imaginemos un escenario donde tengo una app a la que le he creado distintos endpoints para que devuelva distintos endpoints (live, ready, noready...). Esa app la hemos subido al repositorio de GitHub y la queremos desplegar en Kubernetes y de paso hacer las readinessProbes y livenessProbes correspondientes:

Creamos el fichero `YAML` del `Deployment`
```yaml
# deploy_probes.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: probes
spec:
  selector:
    matchLabels:
      app: probes
  template:
    metadata:
      labels:
        app: probes
    spec:
      containers:
      - image: eiximenis/probestest
        name: main
        ports:
        - containerPort: 80
        readinessProbe:
          httpGet: # Elegimos 1 de los 4 mecanismos a usar (exec, httpGet, tcpSocket o GRPC)
            path: /ready # Apunta al endpoint de la app creado para devolverle la señal de que está ready
            port: 80
            periodSeconds: 15 # Cada cuanto se ejecutará la prueba
            failureThreshold: 1 # Cuantos errores tiene que devolver para quitar el pod de la lista de endpoints
            successThreshold: 1 # Cuantas llamadas positivas tiene que devolver para volver a meter al pod en la lista de endpoints
            initialDelaySeconds: 10 # Cuanto tarda en lanzar la primera prueba, para así dar tiempo a un contenedor que tarde un poco de tiempo en arrancar
        livenessProbe: 
          httpGet:
            path: /live # Apunta al endpoint para comprobar que la app está live
            port: 80
            periodSeconds: 10
            
```
Creamos un `servicio` ClusterIP para el `Deployment`
```docker
kubectl expose deploy probes --port 80 --name probesvc
```

Abrimos 3 terminales:
1. Lanzamos comandos para hacer la prueba
2. Monitoreamos los pods que tenemos: `kubectl get pods -w` 
3. Monitoreamos los endpoints del servicio del `Deployment`: `kubectl get endpoints probesvc -W`

- En el terminal 1 partimos con el Deployment a 0 y escalamos a 2 réplicas

- En el terminal 2 vemos como los 2 pods se van generando, y pasados los 10 segundos se ejecutará la **livenessProbe** y comprobará que los contenedores están Ready

- En el terminal 3 vemos como las IPs de ambos endpoints aparecen en el servicio

- Kubernetes estará cada 15 segundos lanzando la **readinessProbe**. Ahora en el terminal 1 hago un `kubectl port-forward <1 de los 2 pods> 8700:80` para acceder a mi pod desde local e ir al endpoint "noready" (que en la app devuelve un ready=false), entrando en http://localhost:8700/noready

- Cuando se vuelve a ejecutar el **readinessProbe** y ver que el contenedor le devuelve ready=false, se comprueba en el terminal 2 que el contenedor de dicho pod pasa a estado "not ready" y en el terminal 3 se ve como el pod se ha eliminado de la lista de endpoints del servicio ya que Kubernetes entiende que ese pod no está listo para atender ninguna petición

## Peticiones y Límites de Recursos <a name="peticiones-limites"></a>
 - [Índice](#indice)

La capacidad del clúster es finita y sus nodos tienen una cantidad de CPU y memoria. Por esto podemos definir `peticiones` (cantidad de CPU y memoria que mi contendor necesita para trabajar en condiciones normales) y `límites de recursos`  (cantidad máxima de CPU y memoria que dejamos que nuestro contenedor utilice)

En Kubernetes cuando se crea un pod,el `Scheduler` solo va a crearlo en un `nodo` que tenga los recursos suficientes que el contenedor del pod solicita (en el `nodo` esa memoria se quedaría ocupada para el pod aunque no la esté usando). Si al desplegar nuestro pod se queda en `Pending` puede ser por 2 cosas:
- No existe un `nodo` que tenga suficientes recursos (overcommitted)
- No tengamos nodos suficientes

Un clúster `Autoscaler` ante esta situación crearía un `nodo` nuevo, del mismo modo cuando un `nodo` se queda vacío lo eliminaría

Si queremos crear un pod con una app muy pesada y hacemos una `petición` de recursos muy baja, encontraremos fácilmente un `nodo` donde crear ese pod, y si le ponemos un límite alto una vez creado podrá consumir todos los recursos que necesite, pero eso es un problema, porque cuando un `nodo` no tiene suficientes recursos (overcommitted), Kubernetes penaliza (desaloja `Evicted`) primero a los pods que no hayan hecho `peticiones` (lo cual es obligatorio en la práctica) y después a los que tengan una gran diferencia entre `petición` y `límites` y estén consumiendo muchos recursos.

Para evitar `nodos` overcommitted lo mejor es que la `petición` y `límite` definidos sean el mismo, además que Kubernetes premia a esos pods haciéndolos "garantizados", por lo que nunca serían `Evicted`. Para conseguir este equilibrio la única forma es testeando nuestra app para comprobar que recursos necesitará en la práctica

Haciendo un `kubectl describe pod <pod>` podemos ver un apartado llamado **QoS Class** (Quality of Service) donde según lo anterior explicado Kubernetes cataloga a los pods en 3 categorías (por orden de desalojo):
1. `BestEffort`: No han definido `petición` ni `límites`
2. `Burstable`: Hay gap entre `petición` y `límite`
3. `Guaranteed`: Misma `petición` y `límite`

Las peticiones y límites se especifican en el `YAML` en el apartado del contenedor:
```yaml
containers:
- image: eiximenis/probestest
  name: main
  resources: # Aquí especificamos los valores
    requests: # Petición
      memory: 100Mi
      CPU: 50m # Hay 1000 milicores en 1 core de CPU real
    limits: # Limite
      memory: 200Mi
      cpu: 200m
  ports:
```

`kubectl top node`: Muestra la cantidad de CPU y memoria ocupada en los nodos. Para que este comando funcione debemos tener instalado un **Servidor de métricas**, que no viene instalado por defecto [pero está en GitHub](https://github.com/kubernetes-sigs/metrics-server)

`kubectl top pod`: Muestra cantidad de CPU y memoria actual está usando un pod

`kubectl describe node <nodo>`: Nos va a mostrar información del nodo y lista los pods que hay en el mismo

## Autoescalado <a name="autoescalado"></a>
 - [Índice](#indice)

Funciona creando un `controlador` llamado `HPA (Horizontal Pod Autoscaler)` que gestiona un `ReplicaSet` o `Deployment` monitorizando la CPU y memoria que están ocupando sus pods, y creando/destruyendo sus pods en base a los recursos que estos estén consumiendo en función de un objetivo definido sobre un % de las `peticiones` de los pods

Creamos el `YAML` para crear un `HPA` de CPU
```yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: probes
spec:
  maxReplicas: 15 # Máximo de réplicas que queremos
  minReplicas: 2 # Mínimo de réplicas que queremos
  scaleTargetRef: # Hacemos referencia al Deployment o ReplicaSet a gestionar
    apiVersion: app/v1
    kind: Deployment
    name: probes
  targetCPUUtilizationPercentage: 150 # % de media de las peticiones que quiero que ocupe

# En el HPA de memoria en vez de establecer un % sobre los recursos, se establece el valor de Mi que queremos que se ocupe de media
```
Creamos el `HPA` a partir del fichero `YAML`
```docker
kubectl apply -f hpa.yaml
```
Lo listamos y vemos la desripción
```docker
kubectl get hpa
# En el apartado 'TARGETS' nos mostrará '% de media actual / % del objetivo'

kubectl describe hpa probes
# Nos fijamos que el atributo 'AbleToScale' esté 'True' o si no es que hay algún problema con el servidor de métricas    
```
Cuando el HPA está en marcha si nuestra aplicación no tiene suficiente actividad y por lo tanto los pods no necesitan más recursos irá desescalándo réplicas hasta quedarnos con un mínimo de 2, y en el caso opuesto las escalará hasta un máximo de 15

## Otros Controladores <a name="otros-controladores"></a>
 - [Índice](#indice)
 - [Jobs](#jobs)
 - [CronJobs](#cronjobs)
 - [DaemonSets](#daemonsets)

 ### Jobs <a name="jobs"></a>
 - [Índice](#otros-controladores)

Al contrario que los `StatefulSet`, `Deployments`, etc, este `controlador` crea tareas que empiezan y terminan, creando un pod que pone en marcha un contenedor y espera que el contenedor termine en algún momento. Por lo que no se usa para levantar un servicio sino para realizar una tarea (enviar correos, realizar migración de BD, etc )

Creamos el fichero `YAML` del `Job`
```yaml
#job.  
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  template:
    spec:
      completions: 5 # Espera que se terminen 5 pods para finalizar
      parallelism: 2 # Pods que se van a crear a la vez
      #template:     con esto hacemos lo mismo que select control, 
        #nodoSelector:
          #Kubernete.io/os: linux      
      containers: # Plantilla del pod que crea el Job
      - name: pi
        image: perl:5.34.0
        command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(2000)"]
      restartPolicy: Never 
```
Creamos el `Job` a través del fichero `YAML`
```docker
kubectl apply -f job.yaml
```
Comprobamos que se ha creado
```docker
kubectl get job # Comprobamos que se ha creado el 'Job'. Muestra 'COMPLETIONS' 0/5
kubectl get pod # Comprobamos que el 'Job' ha creado los pods
```
Cuando los 5 pods se terminan de ejecutar queda en 'STATUS' Completed y el `Job` en 'COMPLETIONS' 5/5 y se finaliza. El `Job` debe eliminarse manualmente (y este eliminará automáticamente el pod)

Kubernete no ofrece ningún mecanismo para la sincronización, hay que hacerlo manual
 
 ### CronJobs <a name="cronjobs"></a>
 - [Índice](#otros-controladores)

Es un `Job` programado que se ejecuta cada cierto tiempo. Realmente el `CronJob` cuando le toca ejecutarse crea un `Job` que a su vez crea el pod correspondiente
```yaml
apiVersion: batch/v1
kind: CronJob
metadata: 
  name: hello
spec:
  schedule: * * * * * # Programar la ejecución del CronJob. Puede configurarse fácilmente a través de https://crontab.guru/
  jobTemplate: # Plantilla del Job que crea
    spec:
      jobTemplate: # Plantilla del Job que crea
        spec:
          completions: 5
          parallelism: 2
          containers: # Plantilla del pod que crea el Job
          - name: hello
            image: busybox:1.28
            imagePullPolicy: IfNotPresent
            command:
            - /bin/sh
            - -c
            - date; echo Hello from the Kubernetes cluster
          restartPolicy: OnFailure
```

### DaemonSets <a name="daemonsets"></a>
 - [Índice](#otros-controladores)

Crea un pod en cada `nodo` que tengamos en el clúster. Si el orquestador añadiera un nuevo `nodo` automáticamente el `DaemonSet` crearía otro pod en ese nodo.

Esto se usa con la idea de crear contenedores de infraestructura para dar servicio a nivel de `nodo`

## Scheduling <a name="scheduling"></a>
 - [Índice](#indice)
 - [Taints y Tolerations](#taints-tolerations)
 - [Affinity y Anti-Affinity](#affinity-antiaffinity)

Hay un conjunto de herramientas que pueden usarse para indicar al **Scheduler** como gestionar el envío de pods a distintos `nodos`. Hay que tener en cuenta que abusar del uso de estas opciones puede ir en detrimento del rendimiento de nuestra aplicación

### Taints y Tolerations <a name="taints-tolerations"></a>
 - [Índice](#scheduling)

Se usa cuando queremos que un nodo repela ciertos pods. Por ejemplo si tenemos un nodo específico de GPU y no queremos que en él se cree cualquier tipo de pod

Tain es para manchar el nodo y que los pod no vayan hacia el
Tolerance es para el POD, hace que puda entrar en un nodo manchado.

`kubectl taint node <nodo> <razón>:<acción>`: Aplica el `taint` en el nodo especificado. <razón> es la etiqueta y <acción> lo que queremos que haga (NoSchedule, NoExecute, etc). Si ejecutamos el mismo comando agregando `-` al final de la acción eliminamos el `taint`

Por ejemplo, hacemos que el nodo de Minikube repela cualquier nuevo pod
```docker
kubectl taint node minikube gpu:NoSchedule
# NoSchedule significa que no quiero más pods en este nodo pero que me mantenga los que ya haya

# NoExecute desalojaría a los pods del nodo pero los recrearía en otro nodo distinto
```
Este `taint` queda reflejado al hacer `kubectl describe node minikube` en el apartado "Taints"

Todos los pods que intentemos crear en este nodo quedarán en estado "Pending" y si vemos la descripción de algún pod especificará que es por el `taint`

Para que los `taints` no afecten a nuestros pods y el **Scheduler** pueda crearlos en el nodo que queremos se usan los `tolerations` como en este ejemplo:
```yaml
#toleration.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  template:
    spec:
      tolerations:
        - key: gpu # Especificamos la 'razón' del taint
      containers:
      - name: pi
        image: perl:5.34.0
        command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(2000)"]
      restartPolicy: Never 
```
Cuando se cree este `Job`, podrá generar los pods en el nodo y se mostrarán en estado "Running"

### Affinity y Anti-Affinity <a name="affinity-antiaffinity"></a>
 - [Índice](#scheduling)

Nos permite mediante etiquetas crear grupos de nodos que están relacionados por esas etiquetas, y con esto podemos hacer que ciertos pods se creen en esos nodos concrétamente o viceversa

Por ejemplo, una API desplegada en un `Deployment`. Hay 8 `nodos` y el `Deployment` está escalado a 3 réplicas. Esta API tiene una caché de nivel 1 y está implementado con un "Redis", y queremos que cada pod tenga una caché de "Redis". Por lo que habría un pod de "Redis" y escalado a 3 réplicas. Nos interesa que cada pod de la API esté junto a un pod de "Redis" ya que el networking es más rápido, por lo que usando `affinity` si las cada réplica de la API se ha creado en los nodos 1, 3 y 5, las de "Redis" se crearán allí también. En este ejemplo podemos usar la `anti-affinity` para evitar que 2 pods de la API acaben en el mismo nodo


### Herramientas  

Panel grafico
Sfens  ** http://k8sfens.dev ** Gratuito

KEDA 
Te autoescala en base de mensajes pendientes

Helm 
Instalador de  recusos para kubernete 

bitnary 
Instalador de aplicacion, ver min 2:10:00. Explicacion utilizacion Helm con Bitnari