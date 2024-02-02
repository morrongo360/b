# GIT
- [GIT](#git)
  - [Introducción ](#introducción-)
  - [Loguearse desde el terminal ](#loguearse-desde-el-terminal-)
  - [Crear repositorio ](#crear-repositorio-)
  - [Actualizar repositorio ](#actualizar-repositorio-)
  - [Borrar repositorio ](#borrar-repositorio-)
  - [Clonar repositorio ](#clonar-repositorio-)
    - [Hacer un Pull](#hacer-un-pull)

## Introducción <a name="intro"></a>
Para poder trabajar con nuestros repositorios en GitHub debemos descargar e instalar [**Git**](https://git-scm.com/downloads)

Con la integración de VSCode podemos trabajar con Git e inicializar nuestro repositorio y subir los cambios directamente a GitHub

## Loguearse desde el terminal <a name="login"></a>
Para poder realizar acciones con **GitHub** desde el terminal debemos introducir nuestro usuario y email:
```shell
git config --global user.name "usuario"
git config --global user.email "email"
```

## Crear repositorio <a name="borrar_repo"></a>
Tras haber guardado todos los cambios. Desde la **extensión de GitHub** en VSCode:
- Pulsamos **Initialize Repository**
- Introducimos el nombre del **Commit** y pulsamos el botón **Commit**
- Hacemos el "staging" diciendo que si al mensaje
- Pulsamos en **Publish Branch**
- Elegimos el nombre del repositorio y la opción **público o privado**

## Actualizar repositorio <a name="actualiza_repo"></a>
Tras haber guardado todos los cambios. Desde la **extensión de GitHub** en VSCode:
- Introducimos el nombre del "Commit" y pulsamos el botón **Commit**
- Hacemos el "staging" diciendo que si al mensaje
- Pulsamos en "Sync Changes"
- Elegimos el nombre del repositorio y la opción **público o privado**

Para hacerlo desde la línea de comandos hacemos:
```sh
git add . ## Hacemos staging de los cambios
git commit -m "mensaje commit" ## Hacemos commit
git push ## Subimos los cambios a GitHub
```

## Borrar repositorio <a name="borrar_repo"></a>
Para eliminar un repositorio tanto localmente como en Github hay que realizar 2 pasos:

- Eliminarlo de forma local desde el terminal en la carpeta raiz del reposiorio
```shell
rm -fr .git
``` 
- Posteriormente desde nuestro repositorio en GitHub entrar en **Settings** y en la parte inferior seleccionar **delete this repository**

## Clonar repositorio <a name="clonar_repo"></a>
Clonar un repositorio de GitHub nos permite traerlo a local por primera vez. Desde la carpeta donde queremos que se cree usamos el comando:
```shell
git clone https://github.com/<usuario_github>/<nombre_repositorio>.git
```
### Hacer un Pull
Cuando queramos actualizar a nivel local los cambios en el repositorio remoto, desde dentro de la carpeta del repositorio local usar el comando:
```shell
git pull
```