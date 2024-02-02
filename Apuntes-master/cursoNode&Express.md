- [Introducción](#introducción)
  - [Instalación Node.js](#instalación-nodejs)
- [Creación de un proyecto nuevo](#creación-de-un-proyecto-nuevo)
  - [Instalar paquete del framework Express de forma local en el proyecto](#instalar-paquete-del-framework-express-de-forma-local-en-el-proyecto)
  - [Creación de main.js](#creación-de-mainjs)
- [Responses](#responses)
  - [Response en json](#response-en-json)
  - [Response renderizando contenido HTML](#response-renderizando-contenido-html)
- [Static Assets](#static-assets)
- [Project Generators](#project-generators)
  - [Instalación de turbo-cli](#instalación-de-turbo-cli)
- [Dynamic Data](#dynamic-data)
  - [Request Parameters](#request-parameters)
  - [Query Parameters](#query-parameters)
- [Post Requests](#post-requests)
- [Profile Page](#profile-page)
- [Styling and Images](#styling-and-images)
- [Middleware](#middleware)


# Introducción

## Instalación Node.js

```sh
sudo apt update # Actualizamos repositorios

sudo apt install nodejs # Instalamos Node.js

sudo apt isntall npm # Instalación gestor de paquetes de node (npm)
```

# Creación de un proyecto nuevo

```sh
mkdir first-project # Creamos la carpeta del proyecto

cd first-project # Accedemos a ella

npm init # Creamos en nuestro proyecto el fichero package.json
```

## Instalar paquete del framework Express de forma local en el proyecto

```sh
npm install express –save # esto crea package-lock.json y la carpeta node_modules, que es la que contendrá todas las dependencias. En este caso se ha instalado express y varias carpetas de subdependencias del mismo
```

## Creación de main.js

En nuestro fichero package.json com página principal aparece index.js, que es donde crearemos nuestro node express server, por lo que la creamos:


```js
// index.js

const express = require('express') // Importamos Express Framework

const app = express() // Creamos nuestra primera aplicación

// Creamos request handler para responder a las peticiones entrantes a la homepage. Al intentar acceder a una web la petición es un GET

app.get('/', (req, res, next) => { // Creamos función que le pasamos los 3 argumentos: request, response, y next

res.send('Hello!!!') // Mostramos mensaje de respuesta 

}) 

// Conectamos la aplicación al servidor al puerto 3000. Los típicos puertos son 3000, 5000, 8000 y 8080

app.listen(3000)
console.log('El servidor está ejecutándose en http://localhost:3000') // Al hacer node index nos mostrará el mensaje de que el servidor está en funcionamiento

```

Arrancamos el servidor usando Node

```sh
node index.js # O node, ya que el js va implícito
```

Vamos a http://localhost:3000 y vemos que el servidor está en marcha

Paramos el servidor pulsando CTRL+C


# Responses

## Response en json

Ahora vamos a enviar al servidor raw data en json. Añadimos esta response a index.js

```js

app.get('/json',  (req, res, next) => {
    const data = {
        greeting: 'Hello'
    }
    res.json(data)
})
```

Arrancamos el servidor de nuevo

```sh
node index
```

Vamos a http://localhost:3000/json y veremos la response {"greeting":"Hello"}

Paramos el servidor con CTRL+C

## Response renderizando contenido HTML

Crearemos varias páginas web (o plantillas) y luego las renderizaremos. Para esto vamos a utilizar "Template engine", de esta forma podremos inyectar datos en estas templates y luego renderizarlas dinámicamente

```sh
mkdir views # Cramos el directorio que contendrá las plantillas o páginas
cd views # Accedemos al mismo
```
Creamos el fichero home.mustache (es una plantilla en HTML)

```diff
# home.mustache
<html>
    <head>

    </head>
    <body>
        <h1> Esta es la página de inicio </h1>
    </body>
</html>
```

Configuramos el directorio "views" añadiendo la línea a index.js

```js
// index.js

//const express = require('express') 
//..
const path = require('path') // Importamos el modulo path para poder añadir el directorio "views"

//const app = express()
//...
app.set('views', path.join(__dirname, 'views')) // Configuramos la carpeta "views" dentro de nuestra aplicación
```

 Instalamos el Template Engine

 ```sh
 npm install hjs --save 
 npm install hogan-middleware --save # Nos permite usar el mustache template engine
 
 ```

Conectamos el Template Engine configurando el view engine en la aplicación y habilitamos las plantillas mustache

```js
// index.js

//const path = require('path')
//...
const hoganMiddleware = require('hogan-middleware')

//app.set('views', path.join(__dirname, 'views'))
//...
app.set('view engine', 'mustache') // Configuramos el view engine para que sea mustache
app.engine('mustache', hoganMiddleware.__express) // Usamos el hogan-middleware para la configuración de express
```

Renderizamos la plantilla html añadiendo al final de index.js

```js
app.get('/home', (req, res, next) => { 
res.render('home',null)  // Coge 2 argumentos: template (en este caso home que es el nombre de la plantilla) y datos (si no hay es null)
}) 
```
Ahora hacemos `node index` y al ir a http://localhost:3000/home veremos el HTML renderizado

El fichero final queda así

```js
// index.js
const express = require('express') 
const path = require('path') 
const app = express()
const hoganMiddleware = require('hogan-middleware')

app.set('views', path.join(__dirname, 'views')) 
app.set('view engine', 'mustache') /
app.engine('mustache', hoganMiddleware.__express)

app.get('/', (req, res, next) => { 
res.send('Hello!!!') 
}) 

app.get('/json',  (req, res, next) => { 
    const data = {
        greeting: 'Hello'
    }
    res.json(data)
})

app.get('/home', (req, res, next) => { 
    res.render('home',null)  
    }) 

app.listen(3000)
console.log('El servidor está ejecutándose en http://localhost:3000')
```

# Static Assets

Los static assets son las imágenes, css, pdf, js, etc. Ahora vamos a conectarlos al proyecto

Primero creamos el directorio "public" y dentro del mismo los directorios "css", "images" y "js"

```js
// index.js

//app.engine('mustache', hoganMiddleware.__express)
//...
app.use(express.static(path.join(__dirname, 'public')))
```

Ahora vamos a la plantilla html e insertamos un fichero css que hemos creado en su carpeta y una imagen que hemos guardados en su carpeta

```diff
# home.mustache

#<head>
#...
<link rel="stylesheet" type="text/css" href="/">

# <h1> Esta es la página de inicio </h1>
# ...
<img src="/images/boston.jpeg"> 
# AL haber declarado el directorio public como contenedor de los static assets en index.jpg ponemos la ruta como si estuvieramos dentro
```

Cuando arrancamos de nuevo el servidor vemos los cambios

Ahora vamos a organizar mejor nuestras routes, para ello eliminamos las 3 rutas que creamos inicialmente en index.js y vamos a crear las nuevas en routes/index.js

```js
// /routes/index.js

const express = require('express') // Añadimos express
const router = express.Router() // Añadimos la librería Router de express

// Creamos las 3 rutas usando la libreria Router

router.get('/', (req, res, next) => {

    res.send('Hola desde el directorio de rutas')

})

router.get('/home', (req, res, next) => {

    res.render('home', null)
    
})

router.get('/json', (req, res, next) => {

    res.json({
        gretting: 'Hola desde el directorio de rutas'
    })
    
})

module.exports = router // Exportamos el router
```

```js
// index.js

const express = require('express') 
const path = require('path') 
const app = express()
const hoganMiddleware = require('hogan-middleware')

app.set('views', path.join(__dirname, 'views')) 
app.set('view engine', 'mustache') /
app.engine('mustache', hoganMiddleware.__express)
app.use(express.static(path.join(__dirname, 'public')))

// Hemos eliminado las 3 rutas declaradas en los ejemplos anteriores

// Importamos el fichero routes/index.js
const indexRouter = require('./routes/index')

// Decimos que use las rutas del fichero importado arriba
app.use('/', indexRouter) 

app.listen(3000)
console.log('El servidor está ejecutándose en http://localhost:3000')
```

# Project Generators

En un proyecto de Node.js normalmente ciertas librerías son utilizadas en multitud de ocasiones, pero no nos interesa estar declarándolas cada vez. Para esto están los Generators, que son forma de crear proyectos out of the box con las dependencias ya configuradas. En este caso usaremos turbo-cli (Generator de node express)

Vamos a hacerlo con todas las librerías y dependencias que hemos creado en index.js

## Instalación de turbo-cli

```sh
sudo npm install turbo-cli -g # Lo instalamos de forma global que es como se instalan los Generators en nuestras máquinas

turbo new sample-project # Creamos un nuevo proyecto
```

Como podemos comprobar el nuevo proyecto se crea con los ficheros y carpetas principales ya creados y con las configuraciones básicas ya realizadas

Lo siguiente es instalar las dependencias que aparecen en el package.json y arrancar el servidor para ver la aplicación

Podemos observar lo práctico que es este Project Generator. Existen otros tipos similares que pueden ser utilizados para el mismo fin

```sh
# Desde dentro de sample-project
npm install # Instalamos las dependencias, que creará la carpeta node_modules con las dependencias dentro

sudo npm install nodemon -g # Vamos a instalar nodemon globalmente para arrancar el servidor de forma automática cada vez que haya cambios en la aplicación, de esta forma no hay que hacerlo manualmente

nodemon # Iniciamos nodemon y ya podemos ver nuestra aplicación en http://localhost:3000

# Lo mismo que el comando anterior pero usando turbo-cli sería utilizar su propio comando para el servidor local
turbo devserver
```

# Dynamic Data

Cuando creamos una nueva ruta, por ejemplo la "/test", al introducir la url seguida de esa ruta nos dará la response, que podría devolvernos por ejemplo un json. A esta URL también se le llama "Endpoint". En Node.js podemos extraer valores dinámicos de los diferentes endpoints

Es importante recalcar que no debemos usar Request y Query Parameters en un mismo fichero ya que esto confunde a node a la hora de recopilar los datos de la URL

## Request Parameters

De esta forma podemos usar los endpoints como si fueran variables, usando el formato "/:<variable>"

```js
// index.js

  //res.render('index', { text: 'This is the dynamic data. Open index.js from the routes directory to see.' })
//})
//...
router.get('/:path', (req, res) => {
    const parametro = req.params.path // Cogemos el objeto params de la request en la URL y se guarda en la variable "parametro"

    res.json({
        data: parametro
    })
})

```
Esto hace que al introducir por ejemplo la URL http://localhost:3000/byron, nos la response nos devolvería el json con "data: byron"

Ahora crearemos otro GET handler con 2 request parameters

```js
// index.js

//    data: parametro
//   })
// })
//...

router.get('/:profile/:username', (req, res) => {
    const profile = req.params.profile
    const username = req.params.username 

    res.json({
        profile: profile,
        username: username
    })
})
```
En este caso si pusieramos solo 1 request parameter, nos devolvería el json con {"data":"prueba"}, y en el caso de usar 2 como por ejemplo http://localhost:3000/jota/lopez, nos devolvería el json con {"profile":"jota","username":"lopez"}

## Query Parameters

Usando las queries no se recoge el valor como una varible, sino hardcodeado, usando el formato "/<query>" y separados por "&" en caso de varias

```js
// index.js

    //res.render('index', { text: 'This is the dynamic data. Open index.js from the routes directory to see.' })
//})
//...

router.get('/query', (req, res) => {
    const nombre = req.query.name // Guardamos el valor de la key name en la variable nombre
    const trabajo = req.query.occupation // Guardamos el valor de la key occupation en trabajo

    res.json({
        name: nombre,
        occupation: trabajo
    })
})
```

De esta forma al poner http://localhost:3000/query?name=jose&occupation=developer nos devolvería el json con {"name":"jose","occupation":"developer"}

Tanto Request como Query Parameters pueden usarse para renderizar un HTML. Para probar esto creamos en /views el fichero profile.mustache

```diff
# profile.mustache

<html>
    <head>

    </head>
    <body>
# Aquí va la parte que variará de forma dinámica
        <h1>Name: {{name}} </h1>
        <h2>Occupation: {{occupation}}</h2>
    </body>
</html>
```

Creamos el handler en index.js

```js
// index.js

    //res.render('index', { text: 'This is the dynamic data. Open index.js from the routes directory to see.' })
// })
//...

router.get('/query', (req, res) => {
    const nombre = req.query.name 
    const trabajo = req.query.occupation 

    const data = { // Almacenamos la información en la variable data
        name: nombre,
        occupation: trabajo
    }

    res.render('profile', data)
})
```

Por lo que al introducir la URL http://localhost:3000/query?name=Tatiana&occupation=Cientifica nos renderizará el HTML con los datos introducidos

Si quisieramos hacerlo con Request Parameters sería como el siguiente código y usando la URL tipo http://localhost:3000/juan/camarero

```js
//index.js

//...

router.get('/:name/:occupation', (req, res) => {
  const nombre = req.params.name // Guardamos el valor de la variable name en la variable nombre
  const trabajo = req.params.occupation // Guardamos el valor de la variable occupation en la variable trabajo

  const data = { 
    name: nombre,
    occupation: trabajo
  }

  res.render('profile', data)
})
```

# Post Requests

Las http request que hemos estado realizando son de tipo GET. Hay gran variedad, pero las 4 principales son: GET, POST, PUT, DELETE

```js
//index.js

//...

router.post('/post', (req, res) => {
  const body = req.body // Esto recoge la solicitud post, que normalmente viene de un <FORM>
  
  res.json({
    confirmation: 'success',
    data: body // Pasamos a data el parámetro POST recogido
  })

})
```

Ahora vamos a crear un formulario en /views/index.mustache por el que introducir los datos que pasaremos por POST

```diff
 <div style="  margin: auto;width: 50%;border: 3px solid green;padding: 50px;text-align: center;">
  <h1>FORMULARIO</h1>
# Enviamos los datos al endpoint "/post" que tenemos creado en index.js
    <form action="/post">
      <input type="text" name="nombre" placeholder="Introduzca nombre"><br><br>
      <input type="text" name="ocupación" placeholder="Introduzca ocupación"><br><br>
      <input type="submit" value="confirmar">
    </form>
  </div>
```

Cuando enviamos los datos a través del formulario, nos devolverá el json con {"confirmation":"success","data":{"nombre":"Juan","ocupación":"Lechero"}}

En node es muy común usari diversas rutas para hacer nuestra aplicación más modular. Vamos a probar a crear una nueva ruta, para esto crearemos un formulario de registro. Primero creamos el archivo /routes/register.js que recogerá y procesará los datos introducidos en el POST form

```js
//register.js

// Ponemos los imports que están en index.js
const express = require('express')
const router = express.Router()

router.post('/user', (req, res) =>{
    const body = req.body // Recogemos los datos del POST form

    res.json({
        confirmation: 'success',
        route: 'register',
        data: body
    })
})

module.exports = router // Exportamos el router
```

Ahora en app.js conectamos la ruta /register con el directorio ./routes/register

```diff
#app.js
// import routes
const index = require('./routes/index')
+const register = require('./routes/register')

// set routes
app.use('/', index)
+app.use('/register', register)
```

Dentro de la ruta /register tenemos otro handler llamado /user que recoge los datos. Para que esto ocurra debemos definirlo en el POST form

```diff
 <div style="  margin: auto;width: 50%;border: 3px solid green;padding: 50px;text-align: center;">
  <h1>FORMULARIO</h1>
# Enviamos los datos al handler "/user" que está creado dentro de la ruta /register
    <form action="/register/user">
      <input type="text" name="nombre" placeholder="Introduzca nombre"><br><br>
      <input type="text" name="ocupación" placeholder="Introduzca ocupación"><br><br>
      <input type="submit" value="Registrarse">
    </form>
  </div>
```

Por lo que ahora cuando enviamos el formulario nos lleva a la ruta http://localhost:3000/register/user, mostrando el json con {"confirmation":"success","route":"register","data":{"nombre":"Ana","ocupación":"Maestra"}}

# Profile Page

Vamos a crear dynamic requests y mostraremos dynamic data basado en esas requests, renderizándolos con el Mustache Template Engine. Para esto vamos a crear una lista de perfiles y basándonos en una query o parameter request, cogeremos uno de los perfiles y lo renderizaremos en la página web

Lo primero es crear el objeto perfiles

```js
//const router = vertex.router()
//...
const profiles = { 
// Usaremos cada username para coger el perfil en cuestión
    jota: {
        name: 'jota lopez',
        company: 'self',
        languages: ['javascript','python','c#']
    },
    loky: {
        name: 'loky luke', 
        company: 'vaqtech',
        languages: ['php','c++','html']
    },
    panter: {
        name: 'paco terra',
        company: 'pacbytes',
        languages: ['java','ruby','rust']
    }
}
```
Ahora creamos una parameter request con el perfil y el usuario para escoger el perfil del usuario que pasemos como parámetro

```js
//index.js

router.get('/:profile/:username', (req, res) => {
  const perfil = req.params.profile // Guardamos el valor del parámetro profile en la variable perfil
  const usuario = req.params.username // Guardamos el valor del parámetro username en la variable usuario
  const perfilSeleccionado = profiles[usuario] // Cogemos el perfil del objeto profiles usando el username almacenado en la variable usuario como la key

  if (perfilSeleccionado == null){ //Con esta excepción nos devuelve un json con el error en caso de no encontrar el usuario
    res.json({
        confirmation: 'fail',
        message: 'Perfil ' + usuario + ' no encontrado' 
    })
    return
  }

  res.json({
    confirmation: 'success',
    profile: perfilSeleccionado // Se devuelve una json response con el perfil seleccionado
  })
})
```

De esta forma cuando introducimos una URL con un usuario que está en el objeto profiles como http://localhost:3000/profile/panter, nos devuelve el json con {"confirmation":"success","profile":{"name":"paco terra","company":"pacbytes","languages":["java","ruby","rust"]}}, en caso de introducir un usuario que no existe nos devuelve el json con {"confirmation":"fail","message":"Perfil dodo no encontrado"}

Ahora en vez de devolver un json vamos a renderizarlo en nuestra plantilla

```diff
# profile.mustache

<html>
    <head> </head>
    <body>
        <h1>{{name}} </h1>
        <h2>Company: {{company}}</h2>
        <h3>Languages</h3>
# Creamos una lista ordenada con los lenguajes que dicho usuario domina
        <ol>
# En Mustache Templates recorremos un array abriéndolo con # y cerrándolo con /        
            {{#languages}}
# Al ser un array de strings se define con un .
            <li>
                {{.}} 
            </li>
            {{/languages}}
        </ol>
    </body>
</html>
```
Modificamos el parameter request para que renderice el html con los datos del usuario introducido

```js
//index.js

//        message: 'Perfil ' + usuario + ' no encontrado' 
//    })
//    return
//  }
//...

  res.render('profile',perfilSeleccionado)
```

Ahora vamos a crear un formulario en la template para no tener que introducir el usuario a través de la URL

```diff
# profile.mustache

#    <head> </head>
#    <body>
#...
# En action ponemos la ruta addprofile que es a la que nos enviará al confirmar el formulario
<form action="/addprofile" method="post">
    <input type="text" name="name" placeholder="Nombre"><br>
    <input type="text" name="username" placeholder="Nombre de usuario"><br>
    <input type="text" name="company" placeholder="Empresa"><br>
    <input type="text" name="languages" placeholder="Lenguajes"><br>
    <input type="submit" value="Introduzca usuario">
</form>
```

Vamos a crear la ruta addprofile que grabará en el objeto profiles un nuevo usuario introducido por el formulario junto con su nombre, compañía y lenguajes que utiliza. Posteriormente redireccionará a la ruta que formatea el HTML de la plantilla profile.mustache

Para probar que se recogen bien los datos introducidos en el formulario, antes de redireccionar a la ruta "/:profile/:username", los mostraremos en json

Los usuarios grabados en profiles solo estarán disponibles en esta sesión del servidor, al tumbarlo dichos datos desaparecerán

```js
//index.js

  router.post('/addprofile', (req, res) => { // Al acceder a esta ruta recogerá los datos de los campos del formulario
    const body = req.body // Almacenamos en la variable body los datos recogidos del formulario

    body['languages'] = req.body.languages.split(', ') //hacemos que nos almacene en un array los lenguajes que pongamos separados por ", y 1 espacio"

    /* Lo dejamos comentado porque era solo para probar que recogia los datos
        res.json({ // Hacemos que nos devuelva los datos introducido en el formulario por json para comprobar que los recoge bien
        confirmation: 'success',
        data: body
        })
    */

    profiles[body.username] = body // Grabamos en el objeto profiles el nuevo usuario con su nombre, compañía y lenguajes
    res.redirect('/profiles/'+body.username) // Tras grabar los datos en el objeto profiles, redirecciona a la ruta /profiles/<nuevo usuario grabado> y renderiza el HTML con la plantilla profile.mustache
  })

  router.get('/:profile/:username', (req, res) => {
    const perfil = req.params.profile 
    const usuario = req.params.username 
    const perfilSeleccionado = profiles[usuario] // Cogemos el perfil del objeto profiles usando el username como la key
  
    if (perfilSeleccionado == null){ 
      res.json({
          confirmation: 'fail',
          message: 'Perfil ' + usuario + ' no encontrado' 
      })
      return
    }
  
    res.render('profile',perfilSeleccionado)
  })
```

# Styling and Images

Con el generador de proyectos nos crea el fichero "app.js" que tiene la variable "config", la cual contiene diversas configuraciones como el directorio con las views, el public (donde se almacenan los static assets), etc. Toda esta configuración puede ser modificada a nuestra conveniencia. Dentro de /public/css tenemos el fichero bootstrap.css (creado por el generador de proyectos), que vamos a importar a profile.mustache

```diff
# profile.mustache

# <html>
# <head> 
# La ruta no es /public/css... ya que en app.js viene definido que public contiene los static assets
+    <link rel="stylesheet" href="/css/bootstrap.css" type="text/css">
  </head>
# Si añadimos la clase de bootstrap a body vemos que funciona perfectamente
+ <body class="container"> 
```

Lo siguiente será añadir una imagen a cada uno de los perfiles que habíamos creado en index.js

```diff
//index.js

const profiles = { 
  
      jota: {
+         image: '/images/jota.jpg',
          name: 'jota lopez',
          company: 'self',
          languages: ['javascript','python','c#']
      },
# E igual con el resto de perfiles
```

Ahora añadimos las imágenes a nuestra plantilla html usando la key image, que es parte del objeto profile. Por lo que cuando en index.js cogemos el perfil en la ruta "/:profile/:username", la key image es almacenada en la variable (u objeto mejor dicho) "currentProfile"

```diff
# profile.mustache

#...
# <body class="container"> 
#   <h1>{{name}}</h1>
+   <img src="{{image}}">
```

Ahora vamos a añadir de forma dinámica un perfil como hicimos anteriormente y esta vez con su imagen incluída. Para ello vamos a añadir el campo imagen en nuestro formulario de la plantilla html

```diff
# profile.mustache

#...
# <input type="text" name="username" placeholder="Nombre de usuario"><br>
+ <input type="text" name="image" placeholder="Imagen (/images/example.jpg)"><br>
```

Al introducir los datos del nuevo perfil con la ruta de la imagen, se nos añade dicho perfil con su imagen correspondiente. Ahora vamos a estilizar las imágenes creando el fichero style.css e importándolo a la plantilla y creando 2 clases en el mismo

```diff
# profile.mustache

#...
# <link rel="stylesheet" href="/css/bootstrap.css" type="text/css">
+ <link rel="stylesheet" href="/css/style.css" type="text/css">
```

```css
/* style.css */

h1 {
    color: red;
    text-transform: capitalize;
}

.profile-image {
  max-width: 360px;
}
```

# Middleware

Para explicar esto, lo primero vamos a crear la plantilla html profiles.mustache que a parte del formulario nos mostrará un listado de los perfiles que tengamos creados

Antes de nada en index.js al objeto profiles le añadimos el campo "username" con el nombre de usuario de cada perfil y creamos la ruta a la plantilla profiles.mustache

```diff
#index.js

#...
const profiles = { 
      jota: {
+         username: 'jota',
          image: '/images/jota.jpg',
#...
```

```js
//index.js

// Creamos la ruta profiles
  router.get('/profiles', (req, res) => {
  
    const keys = Object.keys(profiles) // Guardamos en el array "keys" las keys de nuestro objeto profiles. En este caso: jota, loky, panter
    const list = [] // Creamos un array vacío
    // Mientras recorremos el array "keys", añadimos al array vacío "list" cada perfil de usuario que coincide con la key actual del array keys
    keys.forEach(key => {
      list.push(profiles[key])
    })
    const timestamp = new Date() // Creamos la variable timestamp con la hora actual
    const data = { // Creamos el objeto data que contendrá el array profiles que contendrá cada perfil y el timestamp
      profiles: list,
      timestamp: timestamp.toString() // Pasamos el dato de la variable timestamp convertido a string
    }
    res.render('profiles',data) // Renderizamos profiles.mustache con la información almacenada en data

  })
```

```diff
# profiles.mustache

#...
</form>
# Será una copia de profile.mustache pero bajo el formulario solo listamos los perfiles con los enlaces a sus detalles

# Añadimos el campo timestamp para mostrar la hora
        <span>{{timestamp}}</span>
        <h1> Profiles </h1>
        <ol>
            {{#profiles}}
            <li>
                <a href="/profile/{{username}}">{{name}}</a> 
            </li>
            {{/profiles}}
        </ol>
    </body>
</html>
```

Añadimos el timestamp también para que aparezca en la página de cada perfil, añadiéndolo a profile.mustache y la ruta "/:profile/:username" en index.js

```diff
#profile.mustache

#...
</form>
+       <span>{{timestamp}}</span>
        <h1>{{name}} </h1>

```

```diff
#index.js

      return
    }
+ const timestamp = new Date()
# Le pasamos el valor de timestamp al objeto currentProfile
+ perfilSeleccionado.timestamp = timestamp.toString
```

En este punto hemos creado el timestamp en ambas rutas, pero en programación repetir lógicas es algo que no se debe hacer, para esto usamos los "Middlewares". Por lo que vamos a usar una función Middleware para aplicarla a todas las rutas request definidas abajo

```js
//app.js

//...
//Creamos la función middleware que se aplicará a las 2 rutas creadas
app.use((req, res, next) => { //Además de pasarle los objetos req y res, le pasamos next
  const timestamp = new Date()
  req.timestamp = timestamp.toString() //Pasamos el valor del timestamp al objeto request de las rutas definidas más abajo
  next() //Llamamos a la función next() para que la función middleware no se cuelgue y proceda a las rutas abajo definidas
}) 
// set routes
//app.use('/', index)
//app.use('/register', register)
```

Después de haber creado el middleware, vamos a modificar la lógica anteriormente creada en ambas rutas en index.js. De esta forma podremos visualizar el timestamp tanto en el listado de perfiles como en cada perfil sin tener que repetir código al pasarle el valor desde el middleware

```diff
#index.js

# Modificamos la ruta /profiles
#...
      list.push(profiles[key])
    })
- const timestamp = new Date(
  const data = {
    profiles: list,
-    timestamp: timestamp.toString()
# Cogemos el valor del timestamp de la request que hemos asignado en el middleware
+    timestamp: req.timestamp 
    }
)

# Modificamos la ruta /:profile/:username
#...
      return
    }
-    const timestamp = new Date()

-  perfilSeleccionado.timestamp = timestamp.toString
# Aquí también pasamos el valor del timestamp definido en el middleware
+  perfilSeleccionado.timestamp = req.timestamp

```

Si quisiéramos que el middleware se aplicara solo a la ruta "/register" colocariamos el middleware justo encima de su definición y en este caso no se aplicaría a la ruta "/"

```js
// set routes
app.use('/', index)

// Función middleware
app.use((req, res, next) => { 
  const timestamp = new Date()
  req.timestamp = timestamp.toString()
  next() 
}) 

app.use('/register', register)
```
Otra forma de hacer exactamente lo mismo sería así
```diff
-app.use((req, res, next) => { 
+const timestamp = (req, res, next) => {
  const timestamp = new Date()
  req.timestamp = timestamp.toString()
  next() 
-}) 
+}

# Ahora añadimos la siguiente línea en vez de toda la función middleware encima de la definición de la/s ruta/s que queramos que se apliquen
+ app.use(timestamp)
app.use('/register', register)
```
