# EKS (Amazon Elastic Kubernetes Service) <a name="eks"></a>

- [Instalación](#instalación)
- [Creación de un clúster](#creación-de-un-clúster)
- [El Dashboard](#el-dashboard)
- [Desplegar una App](#desplegar-una-app)
- [Exponer servicios con Ingress](#exponer-servicios-con-ingress)

Ofrece la flexibilidad de iniciar, ejecutar y escalar aplicaciones **Kubernetes** en la nube de **AWS** o en las instalaciones. **Amazon EKS** ayuda a proporcionar clústeres con alta disponibilidad y seguridad, y automatiza tareas clave, como la aplicación de parches, el aprovisionamiento de nodos y las actualizaciones

En el mundo DevOps se usan los **microservicios**. Si quisieramos hacer un *tracing* de todo lo que creamos o desaparece en la amalgama de servicios, **AWS** aporta una herramienta llamada **AWS X-Ray**, aunque hay un recurso que podemos crear dentro del *clúster* llamado **Jaeger** para la misma finalidad

# Instalación
- [Índice](#eks)

Necesitamos un entorno donde a parte de los permisos de usuario necesarios, tengamos **kubectl** y **eksctl** Vamos a instalarlo mediante **dev containers** en **VSCode**

Teniendo las extensiones de VSCode de **Docker** y **Dev Containers** instaladas, en VSCode abrimos WSL con una carpeta vacía, luego vamos a la paleta de comandos y escribimos `>dev containers: reopen in container`, posteriormente elegimos `Ubuntu`, en Ubuntu 22.04 elegimos `jammy` que es la default y funciona bien con esa versión, los siguiente es en `Select additional features to install` seleccionar el `kubectl, Helm, and Minikube` y `AWS CLI` y damos a *ok*. Esto nos levantará en WSL un contenedor de Ubuntu con Kubernetes y AWS CLI, y veremos que se abre una nueva ventana de VSCode con 2 nuevas herramientas: **Kubernetes y AWS**

A **EKS** para conectarse a **AWS** necesito darle unas credenciales. Para este lab creamos un usuario temporal con su key pública y privada:

1. Nos logueamos en la consola de AWS. Entramos en `IAM > Usuarios > Agregar usuarios`, damos nombre de usuario y seleccionamos `Clave de acceso: acceso mediante programación` y damos a `Siguiente`

2. En este caso le damos permisos de *Administrador* aunque lo ideal es dar permisos mínimos imprescindibles

3. En `Etiquetas` creamos la clave `Remove` con el valor `Remove after session`, y confirmamos la creación del usuario aportándonos un `Access Key` y `Secret Access Key`

4. Creamos en el directorio raíz un fichero llamado `credentials` que contendrá los valores de ambas keys

Ahora necesitamos una configuración básica para trabajar con ese usuario con el siguiente comando, aportando posteriormente las keys, la región `eu-west-3` y formato estandar de salida `json`
```shell
aws configure
```

Ahora este usuario que hemos creado tiene permisos elevados sobre los recursos de **AWS**. Como ya tenemos **kubectl** instalado, solo nos queda instalar **eksctl**:
https://docs.aws.amazon.com/es_es/emr/latest/EMR-on-EKS-DevelopmentGuide/setting-up-eksctl.html

```shell
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp # Descargamos y extraemos la última versión de eksctl

sudo mv /tmp/eksctl /usr/local/bin # Movemos el binario extraído a /usr/local/bin
```

para saber quien esta idetificado como usuario: aws sts get-caller-identity

# Creación de un clúster
- [Índice](#eks)

Antes de generar el *clúster* de **Kubernetes** averiguamos si tenemos seleccionado al usuario correcto
```shell
aws sts get-caller-identity
```

Al generar el *clúster* vamos a decir que la gestión de los *nodos* va a ser nuestra. Para poder conectarnos a una **Instancia EC2** mediante **SSH** necesito un *key-pair*
```shell
aws ec2 create-key-pair --key-name eks_bootcamp_pair --output text > eks_bootcamp_pair.pem
```

En el fichero con la **key privada** generada eliminamos el *fingerprint* que hay antes de *-----BEGIN RSA PRIVATE KEY-----* y con lo generado tras *-----END RSA PRIVATE KEY-----*

Ahora le damos los permisos necesarios a la *key* generada
```shell
chmod 400 eks_bootcamp_pair.pem
```

La *key privada* se queda ahí y no debe salir de mi máquina. Para despelegar una **EC2** lo que necesitamos es alimentar la *key pública* que generamos a partir de *key privada* anterior
```shell
ssh-keygen -y -f eks_bootcamp_pair.pem > eks_bootcamp_key.pub
```

Ahora nos vamos a la `AWS Console > Elastic Kubernetes Service` y vemos que no tenemos ningún *clúster*. Le damos a `Add clúster > Create` y ahí vemos la versión marcada como *default* que es con la que vamos a trabajar

**eksctl** puedde usarse como **kubectl**, de forma imperativa (CLI) o declarativa (ficheros YAML).

Creamos el clúster a través del `YAML`
```yaml
# cluster.yaml

apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: lc-cluster
  region: eu-west-3
  version: "1.24"

# Usamos IAM para poder acceder a recursos de fuera del clúster (recursos de disco, Load Balancers, etc). 
# También para hacer el clúster más configurable y darle capacidad de escalado de nodos

iam:
  withOIDC: true # Manera de identificarse

# Ahora genero un grupo de nodos

managedNodeGroups: # La creación de los nodos corre por cuenta de AWS. Aquí se va a generar un grupo de autoescalado que va a permitir escalar el nº de EC2 que van a asociarse al grupo de autoescalado
  - name: lc-nodes
    instanceType: t2.small # Si no definimos esto AWS usa mejores máquinas por defecto
    desiredCapacity: 3 # Nº de nodos
    minSize: 1 # Nº de máquinas mínimas funcionando
    maxSize: 4 # Nº de máquinas máximas a crear
    ssh:
      allow: true
      publicKeyPath: "./eks_bootcamp_key.pub" # Ubicación key pública
```

# tracing (en amazon es xRay) - debugging - jaeger (es para utilizarlo fuera del cluster). Esto sirve para ver logs y seguir pista a lo que generamos

Antes de generar el *clúster* podemos ver el `YAML` de que se va a generar, donde podemos ver opciones que no hemos definido (vpc, cidr...)
```shell
eksctl create cluster -f cluster.yaml --dry-run
```

Después de ver que está todo correcto creamos el *clúster*, lo cual tomará alrededor de 15 minutos
```shell
eksctl create cluster -f cluster.yaml
```


En lo relativo a la *IaC* tenemos **Terraform** que puede trabajar con varios proveedores. Hay un servicio en **EKS** llamado **CloudFormation** que es la *IaC* de **AWS** que mediante ciertas instrucciones nos permite crear infraestructura en **AWS**

Entrando en el servicio de **CloudFormation** en **AWS** podemos ver como el *clúster* antes desplegado se va generando con todos sus elementos correspondientes

Una vez el *clúster* se ha desplegado, en nuestra carpeta raíz podremos ver que se ha creado la carpeta **.kube** que tendrá alojada el fichero **config** donde podremos ver el **certificate-authority-data** que es un certificado necesario para comunicarnos con los distintos *clústers*. Podemos encontrarlo en `AWS > Elastic Kubernetes Service` y luego entrando en el *clúster*, como **Certificate authority**. En esa misma parte del interfaz dentro del *clúster* podemos ver los pods, nodos, y demás elementos

Comprobamos los 3 nodos que hemos creado. Observando que el nombre usado para cada uno contiene las *IPs* del **CIDR blocks** de la **VPC** generada
```shell
kubectl get nodes
```
Si desde **AWS** nos vamos a la `EC2 > Instancias` veremos que se están ejecutando 3. Si entramos en una de ellas podremos ver diversa información importante (IPs públicas, DNS público, etc). Si quisiéramos conectarnos, pulsamos `Connect` y en la opción **SSH client** copiamos la línea de *Example* y la pegamos en el terminal con la siguiente modificación:
```shell
ssh -i "fichero_clave_privada_creado_por_mi.pem" ec2-user@nombre_de_la_instancia_la_que_nos_conectamos
```

Si desde el CLI queremos ver todo lo que hemos desplegado en el *clúster* podemos usar
```shell
kubectl get all -A
```

Cuando se estamos trabajando en modo de prueba y terminamos hay que limpiar todos los recursos que hemos estado utilizando
```
eksctl delete cluster <nombre clúster>
```

# El Dashboard 	1:24:00
- [Índice](#eks)

Para ver todo esto desde una forma más gráfica podemos usar el **Dashboard** (Otra alternativa más completa es [**Lens**](https://k8slens.dev/)).
```shell
export DASHBOARD_VERSION="v2.0.0" # Definimos la versión del Dashboard a instalar
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/${DASHBOARD_VERSION}/aio/deploy/recommended.yaml # Generamos el Dashboard que se generará como un SVC
```

Para acceder al **Dashboard** lo haremos a través de un `kubectl proxy` que bloqueará una terminal y una vez la cerremos, la conexión segura creada desaparecerá también
```shell
kubectl proxy --port=8080
```

Seguidamente entramos a través de la URL `localhost:8080/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/`. Vamos a acceder utilizando un *token*. Lo generamos usando un comando de **AWS** unido a uno de jQuery para extraer solo el *token*:
```shell
aws eks get-token --cluster-name lc-cluster | jq -r '.status.token'
```

Introducimos el *token* en el **Dashboard** y nos logueamos *(si aparece un fallo acerca de que no tenemos *Ingress* hay que ignorarlo)*. Desde la interfaz podemos ver todo lo desplegado. Si queremos finalizar el proceso solo debemos hacer `pkill -f 'kubectl proxy --port=8080'`. Para borrar el **Dashboard** y liberar recursos en nuestro *clúster* usamos lo siguiente:
```shell
kubectl delete -f https://raw.githubusercontent.com/kubernetes/dashboard/${DASHBOARD_VERSION}/aio/deploy/recommended.yaml
```

# Desplegar una App
- [Índice](#eks)

Vamos a desplegar una solución que nos de la ubicación de las zonas geográficas de nuestros pods, esto va a constar de 2 aplicaciones sencillas con 1 frontal que va a hacer peticiones contra 2 servicios (age-service y name-service), lo interesante es que se va a usar una *API* dentro de los contenedores desplegados para ver la región y availability zones de *Amazon* están trabajando. Esto lo vamos a hacer en varias fases usando varios *Deployments*:

Creamos el primer *Deployment*
```yaml
# ./lc-age-service/deployment.yml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-age-service
  labels:
    app: lc-age-service
  namespace: default # No es necesario declarar ya que es el valor por defecto
spec:
  replicas: 1 # No es necesario declarar ya que es el valor por defecto
  selector: # Definimos esto para que el servicio se vincule con el Deployment, 
    matchLabels:
      app: lc-age-service
strategy: # 
  rollingUpdate:
    maxSurge: 25%
    maxUnavailable: 25%
  type: RollingUpdate
template: # Definimos la plantilla de los pods
  metadata:
    labels:
      app: lc-age-service
  spec:
    containers:
      - image: jaimesalas/lc-age-service:latest
        imagePullPolicy: Always
        name: lc-age-service
        ports:
          - containerPort: 3000
            protocol: TCP
```

Creamos el primer servicio de *ClusterIP* (solo son visibles dentro del *clúster*) para conectarnos al *Deployment*
```yaml
# ./lc-age-service/service.yml

apiVersion: v1
kind: Service
metadata:
  name: lc-age-service
spec:
  selector:
    app: lc-age-service
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

Creamos el segundo *Deployment*, que solo variará del 1º en las etiquetas y la imagen a usar
```yaml
# ./lc-name-service/deployment.yml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-name-service
  labels:
    app: lc-name-service
  namespace: default # No es necesario declarar ya que es el valor por defecto
spec:
  replicas: 1 # No es necesario declarar ya que es el valor por defecto
  selector: # Definimos esto para que el servicio se vincule con el Deployment
    matchLabels:
      app: lc-name-service
strategy: # 
  rollingUpdate:
    maxSurge: 25%
    maxUnavailable: 25%
  type: RollingUpdate
template: # Definimos la plantilla de los pods
  metadata:
    labels:
      app: lc-name-service
  spec:
    containers:
      - image: jaimesalas/lc-name-service:latest
        imagePullPolicy: Always
        name: lc-name-service
        ports:
          - containerPort: 3000
            protocol: TCP
```

Creamos el segundo servicio de *ClusterIP* para conectarnos al segundo *Deployment*
```yaml
# ./lc-name-service/service.yml

apiVersion: v1
kind: Service
metadata:
  name: lc-name-service
spec:
  selector:
    app: lc-name-service
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

Desplegamos ambos *Deployments* y *Servicios*
```shell
kubectl apply -f lc-age-service/ 
kubectl apply -f lc-name-service/
```

Creamos el front de la app
```yaml
# ./lc-front-service/deployment.yml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-front
  labels:
    app: lc-front
  namespace: default # No es necesario declarar ya que es el valor por defecto
spec:
  replicas: 1 # No es necesario declarar ya que es el valor por defecto
  selector: # Definimos esto para que el servicio se vincule con el Deployment
    matchLabels:
      app: lc-front
strategy: # 
  rollingUpdate:
    maxSurge: 25%
    maxUnavailable: 25%
  type: RollingUpdate
template: # Definimos la plantilla de los pods
  metadata:
    labels:
      app: lc-front
  spec:
    containers:
      - image: jaimesalas/lc-front:latest
        imagePullPolicy: Always
        name: lc-front
        ports:
          - containerPort: 3000
            protocol: TCP
# Declaramos las variables de entorno. También podría haberse usado un ConfigMap        
        env:
          - name: AGE_SERVICE_URL
            value: "http://lc-age-service.default.svc.cluster.local" # Usamos el DNS del servicio ClusterIP seguido del Namespace y de svc.cluster.local
          - name: NAME_SERVICE_URL
            value: "http://lc-name-service.default.svc.cluster.local"            
```

Creamos el servicio del front, que será *LoadBalancer* (aunque en la práctica sería mejor de tipo *Ingress*) para así poder acceder desde fuera del *clúster*
```yaml
# ./lc-front-service/service.yml

apiVersion: v1
kind: Service
metadata:
  name: lc-front
spec:
  selector:
    app: lc-front
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

Desplegamos el *Deployment* y *Servicio* del front, y cogemos la IP externa del servicio
```shell
kubectl apply -f lc-front-service/ 
kubectl apply -f lc-front-service/ 
ELB=${kubectl get svc lc-front -o json | jq -r '.status.loadBalancer.ingress[].hostname'} # Guardamos la IP externa en una variable

# Tras conectarnos a la IP externa nos cargará la web-app donde cada vez que refresca carga un pod distinto que muestra distintos nombre, edad, y ubicaciones.

# Si están todos en la misma availability zone solo hay que escalar los Deployments del age-service y el name-service. Al volver a la web-app veremos que aparte de ir variando el nombre, edad, y ubicaciones, también lo hacen las availability zones
```

# Exponer servicios con Ingress
- [Índice](#eks)

Vamos a exponer un servicio usando un **Nginx Ingress Controller**. La topología de red varía según el tipo de **Ingress Controller** que usemos. En el de tipo **Nginx** versión gratuita (la que usaremos) y de pago. Para que **Ingress** permita el acceso desde fuera hasta el *clúster* necesita un *LoadBalancer*: *Network LoadBalancer* (**AWS** asegura millones de conexiones pero gestiona los certificados en la Capa de Red OSI) o *Application LoadBalancer* (gestiona los certificados en la Capa de Aplicación OSI)

Network LoadBalancer: los certificados se negocian con el ingress.
Application LoadBalancer: Aqui gestionas los certificados en esta capa

Instalamos el **Ingress** usando **Helm** (administra las aplicaciones de **Kubernetes**)
Bucamos ingress nginx controler y le damos a Gertting Started, y en la pagina que abrimos Network Load Balancer 

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.5.1/deploy/static/provider/aws/deploy.yaml # Genera todo lo necesario para generar el Ingress Controller

kubectl get all -n ingress-nginx # Vemos todo lo que se ha generado
```

Creamos un nuevo pod que usa una imagen de Hashicorp, donde un servicio escuchando en el puerto 5678 ataca al pod y este devuelve el texto "apple"
```yaml
# apple.yml

kind: Pod
apiVersion: v1
metadata:
  name: apple-app
  labels:
    app: apple
spec:
  containers:
    - name: apple-app
      image: hashicorp/http-echo
      args:
        - "-text=apple"
---
kind: Service
apiVersion: v1
metadata:
  name: apple-service
spec:
  selector:
    app: apple
  ports:
    - port: 5678
```

Funcionamiento: el servicio a traves del puerto 5678 ataca al pod para que este devuelva un texto

Creamos otro nuevo pod que usa una imagen de Hashicorp, donde un servicio escuchando en el puerto 5678 ataca al pod y este devuelve el texto "banana"
```yaml
# banana.yml

kind: Pod
apiVersion: v1
metadata:
  name: banana-app
  labels:
    app: abanana
spec:
  containers:
    - name: banana-app
      image: hashicorp/http-echo
      args:
        - "-text=banana"
---
kind: Service
apiVersion: v1
metadata:
  name: banana-service
spec:
  selector:
    app: banana
  ports:
    - port: 5678
```

Desplegamos los 2 pods y los 2 servicios
```shell
kubectl apply -f .
```

Creamos el **Ingress**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx" # Sin especificar esta clase al generarlo no nos daría el ADDRESS
spec:
  rules:
  - host: "jaimesalas.com" # Necesitaríamos un dominio real y que el Application LoadBalancer detrás del Ingress estuviera asociado con el mismo, o no lo encontrará
    http:
      paths:
      - pathType: Prefix
        path: "/apple"
        backend:
          service:
            name: apple-service
            port:
              number: 5678
      - pathType: Prefix
        path: "/banana"
        backend:
          service:
            name: banana-service
            port:
              number: 5678
```

Lo desplegamos y cogemos la URL del *ADDRESS*
```shell
kubectl apply -f ingress.yml
kubectl get ingress -w # Y de ahí cogemos la URL del ADDRESS
```

Nos conectamos al **Ingress**
```shell
curl -I -H "Host: jaimesalas.com http://<url del ADDRESS>/<apple o banana>/" # -I nos devuelve el status y -H es la cabecera que tenemos que declarar
# jaimesalas.com debería estar dado de alta en un DNS para poder acceder a él y que ese DNS estuviera asociado con la URL del ADDRESS del Ingress de manera interna
```
