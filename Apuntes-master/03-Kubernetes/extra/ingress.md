# Instalación de Ingress

Hay varios controladores de Ingress que se pueden instalar. Pero el más recomendado es https://github.com/kubernetes/ingress-nginx

Es posible que la instalación de _Ingress_ de problemas en versiones demasiado avanzadas de _Minikube_. En la versión `1.27.1 de Minikube` funciona correctamente

Teniendo Minikube iniciado, usamos el comando `minikube addons enable ingress`

# Uso de Ingress

Ingress nos da la posibilidad de dar acceso a nuestra app con sus distintos servicios a Internet. Si tuvieramos nuestra app con distintos servicios de tipo ClusterIP, dependiendo a que servicio quisieramos acceder desde fuera del clúster, ingress nos conectaría con uno u otro

## Ejercicio de laboratorio

Vamos a desplegar una aplicación con un ReplicaSet que tendrá 1 contenedor de Hello World y para acceder a ella creamos un servicio de tipo ClusterIP. Con Ingress vamos a acceder a ese servicio desde fuera del clúster:

1. Creamos el ReplicaSet
   ```yaml
    # rs.yaml
    apiVersion: apps/v1
    kind: ReplicaSet
    metadata:
    name: api
    spec:
    replicas: 1
    selector:
        matchLabels:
        app: api
    template:
        metadata:
        name: api
        labels:
            app: api
        spec:
        containers:
            - name: main
            image: lemoncodersbc/go-hello-world
            ports:
                - containerPort: 80
   ```
2. Creamos el servicio tipo ClusterIP
   ```yaml
    # service.yaml
    apiVersion: v1
    kind: Service
    metadata:
    name: api
    spec:
    selector:
        app: api
    ports:
    - port: 8080
        targetPort: 80
   ```
   
3. Creamos el Ingress
   ```yaml
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
    name: api
    labels:
        app: api
    annotations:
        nginx.ingress.kubernetes.io/ssl-redirect: "true"
    spec:
    rules:
    - host: testjose.xyz # Ingress no escucha por IPs
        http:
        paths:
        - pathType: Prefix
            path: "/api"
            backend:
            service:
                name: api
                port: 
                number: 8080
   ```
4. Desplegamos el ReplicaSet, el servicio y el Ingress
   ```docker
   kubectl apply -f rs.yaml
   kubectl apply -f service.yaml
   kubectl apply -f ingress.yaml
   ```
5. Ingress no escucha por IPs por lo que debemos añadir `testjose.xyz` con la IP de Minikube en /etc/hosts
   ```shell
   ## Sacamos la IP de Minikube   
   minikube ip

   ## Añadimos entrada a /etc/hosts 
   sudo /etc/hosts
   # añadimos la línea <ip Minikube>    testjose.xyz
   ```
6. Comprobamos la conexión
   ```shell
    ## Hacemos ping a testjose.xyz para ver si conecta
    ping testjose.xyz

    ## Intentamos conectarnos al servicio api que nos llevará hasta nuestra aplicación
    wget -qO- http://testjose.xyz/api

    ## Si tuvieramos otros servicios llamados api2, api3 ... a través de Ingress conectaríamos a los mismos usando testjose.xyz/api2, testjose.xyz/api3 ...
   ```
