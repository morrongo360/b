# Laboratorio

## Desplegamos nuestra app desde este yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: web-1
  name: web-1
spec:
  containers:
  - image: lemoncodersbc/hello-world-web:v1
    name: web-1
    ports:
    - containerPort: 3000
  dnsPolicy: ClusterFirst
  restartPolicy: Always
---
apiVersion: v1
kind: Service
metadata:
  labels:
    run: web-1
  name: web-1-svc
spec:
  ports:
  - port: 80
  selector:
    run: web-1
  type: ClusterIP

```

## Tarea: 1 Verifica que la web está corriendo

### Mira que el pod esté corriendo:
```docker
kubectl get po web-1 # Tiene que aparecer READY 1/1 y STATUS Running
```
## Tarea 2: Verifica que puedes acceder al pod de la web directamente

### Prueba con un port-forward para ver si puedes acceder
```docker
kubectl port-forward pod/web-1 3000:3000 
wget -qO- http://localhost:3000 # Esto debería funcionar. La web está corriendo!
```

## Tarea 3. Verifica si puedes acceder a la web usando el servicio, desde dentro del cluster

### Puedes hacerlo usando un pod de busybox:
```docker
kubectl run -it --rm bb --image busybox -- /bin/sh
# Aparece un terminal
wget -qO- http://web-1-svc:3000
# Esto no debería funcionar. Parece que el servicio está mal configurado.
```
### Obtén el YAML del servicio
```docker
kubectl get svc web-1-svc -o yaml
# Se observa spec.port. Parece que el servicio está ecuchando por el puerto 80 cuando debería ser por el 3000 
```
### Borramos el servicio
```docker
kubectl delete svc web-1-svc
```
### Exponemos el pod de nuevo
```docker
kubectl expose pod web-1 --port 3000 --name web-1-svc
```
### Probamos de nuevo
```docker
kubectl run -it --rm bb --image busybox -- /bin/sh
# Aparece un terminal
wget -qO- http://web-1-svc:3000
# Ahora debería funcionar!!! :)
```