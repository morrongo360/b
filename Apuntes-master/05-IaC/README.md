# Infraestructura como Código: Terraform<a name="iac"></a>

La **Infraestructura como Código o Infraestructure as Code (IaC)** sirve para proveer infraestructura a través de software para conseguir despliegues consistentes, predecibles y repetibles. Esto se hace a través de código por lo que usamos un lenguaje de programación

 - [Instalación](#instalación)
 - [Configuración mínima de AWS](#configuración-mínima-de-aws)
 - [Uso de varias Zonas de Disponibilidad](#uso-de-varias-zonas-de-disponibilidad)
  
**Terraform** nos permite definir *Iac* mediante el lenguaje **HCL (HashiCorp Configuration Language)**. Tendremos que adaptarnos al proveedor de *Cloud* con el que estemos trabajando

Es **idempotente** por lo que si tenemos algo ya creado aunque se lo pidamos no lo vuelve a construir

Trabaja en formato push/pull

Para hablar con los distintos proveedores de *Cloud* (Azure, AWS...) necesita tener instalados ciertos paquetes, estos son los **Providers**

Cuando generamos recursos en **AWS** lo hacemos en nuestra **Virtual Private Cloud (VPC)**. Uno de los recursos que pueden hospedarse en la **VPC** son las **EC2** que son el producto de las instancias de las **Amazon Machine Images** (máquinas virtuales). Las **VPC** por defecto no se exponen a Internet y para que sea así necesitamos que exista una **Subnet pública** (**VPC** que tiene acceso a una **Internet Gateway**) para que la máquina desplegada en esa **Subnet pública** tenga acceso a Internet

En **AWS** podemos tener distintos **Workspaces** (como distintas carpetas) para los distintos entornos que tengamos configurados

[Para saber todo lo relacionados con los distintos recursos de **Terraform** debemos consultar la documentación](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

## Instalación
 - [Índice](#iac)
  
Puede instalarse desde la web de *Hashicorp* pero en este caso vamos a instalarlo mediante **dev containers** en **VSCode**

Teniendo las extensiones de VSCode de **Docker** y **Dev Containers** instaladas, en VSCode abrimos WSL con una carpeta vacía, luego vamos a la paleta de comandos y escribimos `>dev containers: reopen in container`, posteriormente elegimos `Ubuntu`, en Ubuntu 22.04 elegimos `jammy` que es la default y funciona bien con esa versión, los siguiente es en `Select additional features to install` seleccionar el `Terraform, tflint, and TFGRunt` y `AWS CLI` y damos a *ok*. Esto nos levantará en WSL un contenedor de Ubuntu con Terraform y AWS CLI, y veremos que se abre una nueva ventana de VSCode con 2 nuevas herramientas: **Terraform y AWS**

A **Terraform** para conectarse a **AWS** necesito darle unas credenciales. Para este lab creamos un usuario temporal con su key pública y privada:

1. Nos logueamos en la consola de AWS. Entramos en `IAM > Usuarios > Agregar usuarios`, damos nombre de usuario y seleccionamos `Clave de acceso: acceso mediante programación` y damos a `Siguiente`

2. En este caso le damos permisos de *Administrador* aunque lo ideal es dar permisos mínimos imprescindibles

3. En `Etiquetas` creamos la clave `Remove` con el valor `Remove after session`, y confirmamos la creación del usuario aportándonos un `Access Key` y `Secret Access Key`

4. Nos descargamos el *CSV*, creamos la carpeta `.credentials` junto a la de `.devcontainer` y movemos el *CSV* dentro

## Configuración mínima de AWS
 - [Índice](#iac)
  
Vamos a generar una *VPC*, a ella le asociamos una *Internet Gateway*, y dentro de la *VPC* vamos a asociarle una *Subnet*

![](extra/01.JPG)

Creamos junto a los 2 directorios anteriores `lab/lc_web_app` y dentro creamos el fichero `main.tf` que va a llevar nuestra infraestructura básica
```javascript
// main.tf

// El formato es de los recursos es: resource "nombre del recurso de AWS" "etiqueta que le demos"

provider "aws" { // Primer objeto que se crea siempre. Puede usarse varios
    access_key = "AKIA3Y7QC6EMZMMQMTPX" // Lo cogemos del CSV (esto nunca se haría así, es solo para el lab)
    secret_key = "4dq0FtDt3VFVVQi5BhzN90E78dTrWKuuvuPi12Tx" // Igual que el anterior no se haría así en la práctica
    region = "eu-west-3" // Una vez usamos una región es mejor no modificarla ya que las máquinas creadas en una región son invisibles para la otra región
}
// Este bloque le indica a Terraform que usaremos AWS como provider
data "aws_ssm_parameter" "ami" {
    name = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
}

// NETWORKING 

resource "aws_vpc" "vpc" { // Creamos la VPC
    cidr_block = "10.0.0.0/16" // Rango de IPs con las que vamos a trabajar
}

resource "aws_internet_gateway" "igw" { // Para tener acceso a Internet
    vpc_id = aws_vpc.vpc.id // Le decimos al aws_internet_gateway la VPC a la que va asociado
}

resource "aws_subnet" "subnet1" { // Creamos una Subnet asociada a la VPC
    cidr_block = "10.0.0.0/24" //Rango de IPs con que trabajará
    vpc_id = aws_vpc.vpc.id // Definimos VPC a la que tiene que pertenecer
    map_public_ip_on_launch = true // Esto nos proporciona una IP pública
}

resource "aws_route_table" "rtb" { // Creamos una Route Table asociada a la VPC para redirigir el tráfico
    vpc_id = aws_vpc.vpc.id // Asociamos la Route Table a la VPC

    route { // Le decimos a donde redirigimos el tráfico
    // Para todas las IPs usará la Internet Gateway generada anteriormente. De esta manera el tráfico puede salir fuera de la VPC a través de la internet gateway
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.igw.id
    }
}
resource "aws_route_table_association" "rtb-subnet1" { // Asociamos nuestra Route Table con una única Subnet
    subnet_id = aws_subnet.subnet1.id // Subnet asociada a la route table
    route_table_id = aws_route_table.rtb.id // Route table con la que vamos a trabajar
}

// SECURITY GROUPS (reglas tipo cortafuegos)

// Ingress Traffic (tráfico de entrada) está cerrado por defecto
// Egress Traffic (tráfico de salida) está abierto por defecto

resource "aws_security_group" "nginx_sg" { // Creamos un security group asociado a nuestra VPC que permita al puerto 80 de cualquier dirección hablar nuestra instancia EC2
    name = "nginx_sg"
    vpc_id = aws_vpc.vpc.id

    // Hacer que protocolo HTTP sea accesible desde cualquier sitio
    ingress {
        from_port = 80
        to_port = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port = 0 // Todos los puertos
        to_port = 0 // Todos los puertos
        protocol = "-1"  // Todos los protocolos
        cidr_blocks = ["0.0.0.0/0"] // Todas las IPs
    }
}

// Levantamos nuestra instancia (EC2)

resource "aws_instance" "nginx1" {
    ami = nonsensitive(data.aws_ssm_parameter.ami.value)// Tipo de máquina a usar
    instance_type = "t2.micro"
    subnet_id = aws_subnet.subnet1.id // Ponemos la subnet antes declarada que tiene acceso a Internet ya que en su Route Table le dijimos como redireccionar el tráfico. Por lo tanto cuando se levante esta máquina va a recibir una IP que podremos visitar
    vpc_security_group_ids = [aws_security_group.nginx_sg.id] // Añadimos el cortafuegos

    // Alimentamos ficheros de inicialización para cuando la máquina se levante no esté vacía
    user_data = <<EOF
    #! /bin/bash
    sudo amazon-linux-extras install -y nginx1
    sudo service nginx start
    sudo rm /usr/share/nginx/html/index.html
    echo '<html><head><title>Lemon Land Server</title></head><body style=\"background-color:#1F778D\"><p style=\"text-align: center;\"><span style=\"color:#FFFFFF;\"><span style=\"font-size:28px;\">Welcome to Lemon Land</span></span></p></body></html>' | sudo tee /usr/share/nginx/html/index.html
    EOF
}
```

Ahora vamos a desplegar **Terraform**. Lo primero es hacer un `terraform init` desde el directorio raíz del proyecto, que comprobará que estén instalados los proveedores necesarios para comunicarse con el proveedor de *Cloud*, si no lo tiene que descargar de **terraform.io**
```shell
terraform init
```

Ahora hacemos un plan, que nos dice que tenemos y que nos va a generar
```shell
terraform plan -out d1.tfplan
```

Aplicamos el plan que hemos generado
```shell
terraform apply "d1.tfplan" # Usamos el fichero generado con el comando anterior
```

Posteriormente desde **AWS** vamos a `EC2 > Instances` y podemos ver la que hemos creado. Entramos dentro y copiamos la `Public IPv4 address` y la pegamos en el navegador para acceder a nuestra app

Destruimos la infraestructura creada
```shell
terraform destroy
```

### Inputs, Outputs y Variables

En el caso anterior cuando hemos levantado nuestra máquina hemos tenido que ir a la consola de **AWS** para ver cual era. Usando **Outputs** podemos recoger esa salida en consola al generar el recurso

Inicializar los valores con los que va a trabajar **Terraform** lo hacemos mediante **Inputs** (especie de variables de entorno a las que le asignamos un valor por defecto), y estos son necesarios para que **Terraform** arranque

Existen un tipo de variables que se generan con **Locals** que adquieren sus valores en función de las operaciones que se realicen al generar la infraestructura

Vamos a mejorar el ejemplo anterior usando lo ahora expuesto. Primero creamos otro fichero donde iran los valores de los **Inputs**
```javascript
// variables.tf - Fichero para las variables
variable "aws_access_key" { // Solucionamos el hardcodeo de la Access Key
    type = string // Tipo de variable
    description = "AWS Access Key" // Descripción opcional
    sensitive = true // Las oculta con asteriscos
}

variable "aws_secret_key" { // Solucionamos el hardcodeo de la Secret Key
    type = string 
    description = "AWS Secret Key" 
    sensitive = true
}

variable "aws_region" { // Definimos la Región
    type = string 
    description = "AWS Region to use for resources" 
    default = "eu-west-3" // Valor por defecto del input
}

// NETWORKING (Actualizaremos los valores de los recursos de Networking)

variable "vpc_cidr_block" { 
    type = string 
    description = "VPC cidr block" 
    default = "20.0.0.0/16"
}

variable "vpc_enable_dns_hostnames" { // Habilitamos los nombres de DNS en la VPC
    type = bool // Tipo booleano
    description = "Enable / Disable DNS hostnames on VPC"
    default = true
} 

variable "subnet_cidr_block" { 
    type = string 
    description = "Subnet cidr block" 
    default = "20.0.0.0/24"
}

variable "subnet_map_public_ip_on_launch" { 
    type = bool 
    description = "Launched instances onto subnet assign a Public IP" 
    default = true
}

// ROUTING (Actualizaremos los valores de los recursos de Routing)

variable "route_table_cidr_block" { 
    type = string 
    description = "IPs to redirect to the Internet" 
    default = "0.0.0.0/0"
}

// SECURITY GROUP (Actualizaremos los valores de los recursos de SG)

variable "sg_ingress_cidr_blocks" {
    type = list(string) // Tipo colección de strings (puede tener múltiples valores)
    description = "cidr blocks allow for ingress"
    default = ["0.0.0.0/0"] // Entre corchetes por ser de tipo list
}

variable "sg_egress_cidr_blocks" {
    type = list(string)
    description = "cidr blocks allow for egress"
    default = ["0.0.0.0/0"]
}

variable "sg_ingress_port" {
    type = number // Tipo número
    default = 80
}

variable "sg_egress_port" {
    type = number
    default = 0
}

// INSTANCIAS (Actualizaremos los valores de la Instancia)

variable "aws_instance_type" {
    type = string
    description = "The EC2 to be used"
    default = "t2.micro"
}

// COMMON - Definimos las Locals a usar en el proyecto

variable "company" {
    type = string
    default = "Lemoncode"
}

variable "project" {
    type = string
    description = "Project name for resource tagging"
}

variable "billing_code" {
    type = string
    description = "Billing code for resource tagging"
}

// A project y billing_code no le hemos dado valor por defecto. Posteriormente crearemos el fichero terraform.tfvars para que dichos valores sean rescatados durante el despliegue
```

En algunos casos nos puede interesar usar **Tags** para usar etiquetas personalizadas en nuestros recursos. Para esto usamos los **Locals** cuyos valores no se pueden asignar de forma directa como con las **Variables**, sino que dichos valores se generan en el despluegue. Creamos un fichero aparte para los **Locals**:
```javascript
// locals.tf
locals {
    common_tags = { // Esto va a ser un nuevo Map (diccionario de clave = valor)
    // Queremos añadir 3 valores, company, project y billing_code. Vamos a sacar esta información de las variables. Por lo que en variables.tf creamos la sección COMMON
        company = var.company
        project = "${var.company}-${var.project}" // Usamos interpolación
        billing_code = var.billing_code
    }
}
```

Aplicamos los cambios (uso de Variables, Locals) en el fichero del ejemplo anterior
```javascript
// main.tf - Alimentándole los valores de los demas ficheros .tf

// PROVIDERS
provider "aws" {
    access_key = var.aws_access_key
    secret_key = var.aws_secret_key
    region = var.aws_region
}

// DATA

data "aws_ssm_parameter" "ami" {
    name = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
}

// RESOURCES ----------------------------------------

// NETWORKING

resource "aws_vpc" "vpc" { 
    cidr_block = var.vpc_cidr_block
    enable_dns_hostnames = var.vpc_enable_dns_hostnames

    tags = local.common_tags // Declaramos las etiquetas de locals.tf
}

resource "aws_internet_gateway" "igw" { 
    vpc_id = aws_vpc.vpc.id

    tags = local.common_tags // Declaramos las etiquetas de locals.tf
}

resource "aws_subnet" "subnet1" {
    cidr_block = var.subnet_cidr_block 
    vpc_id = aws_vpc.vpc.id 
    map_public_ip_on_launch = var.subnet_map_public_ip_on_launch

    tags = local.common_tags // Declaramos las etiquetas de locals.tf
}

resource "aws_route_table" "rtb" { 
    vpc_id = aws_vpc.vpc.id 

    route { 
        cidr_block = var.route_table_cidr_block
        gateway_id = aws_internet_gateway.igw.id
    }

    tags = local.common_tags // Declaramos las etiquetas de locals.tf
}
resource "aws_route_table_association" "rtb-subnet1" {
    subnet_id = aws_subnet.subnet1.id 
    route_table_id = aws_route_table.rtb.id 
}

// SECURITY GROUPS

resource "aws_security_group" "nginx_sg" {
    name = "nginx_sg"
    vpc_id = aws_vpc.vpc.id

    ingress {
        from_port = var.sg_ingress_port
        to_port = var.sg_ingress_port
        protocol = "tcp"
        cidr_blocks = var.sg_ingress_cidr_blocks
    }

    egress {
        from_port = var.sg_egress_port 
        to_port = var.sg_egress_port 
        protocol = "-1"  
        cidr_blocks = var.sg_egress_cidr_blocks
    }

    tags = local.common_tags // Declaramos las etiquetas de locals.tf
}

resource "aws_instance" "nginx1" {
    ami = nonsensitive(data.aws_ssm_parameter.ami.value)
    instance_type = var.aws_instance_type
    subnet_id = aws_subnet.subnet1.id
    vpc_security_group_ids = [aws_security_group.nginx_sg.id] 

    user_data = <<EOF
    #! /bin/bash
    sudo amazon-linux-extras install -y nginx1
    sudo service nginx start
    sudo rm /usr/share/nginx/html/index.html
    echo '<html><head><title>Lemon Land Server</title></head><body style=\"background-color:#1F778D\"><p style=\"text-align: center;\"><span style=\"color:#FFFFFF;\"><span style=\"font-size:28px;\">Welcome to Lemon Land</span></span></p></body></html>' | sudo tee /usr/share/nginx/html/index.html
    EOF

    tags = local.common_tags // Declaramos las etiquetas de locals.tf
}
```

Generamos otro fichero para declarar los **Outputs** que es como sacamos información de **Terraform**
```javascript
// outputs.tf

output "aws_instance_public_dns" { // Podemos llamarlo como queramos
    value = aws_instance.nginx1.public_dns // Se le asignará el valor que tenga el la Instancia definida en main.tf cuando despleguemos
}

output "aws_instance_public_ip" {
    value = aws_instance.nginx1.public_ip 
}
```

Si quisiéramos que **Terraform** formateara automáticamente nuestros ficheros podemos usar
```shell
terraform fmt
```

Validamos la declaración de los ficheros creados para comprobar que no hay errores
```shell
terraform validate
```
Hemos comprobado que no hay errores pero en este punto ni los *keys* ni algunos *tags* (project y billing_code) tienen alimentados ningún valor, por lo que creamos otro fichero para alimentar los *tags*
```javascript
// terraform.tfvars
billing_code = "B99999"
project = "web-app"
```
Posteriormente alimentamos por consola los valores de las *keys* para no almacenarlas en ficheros
```shell
# Introducimos ambos valores desde el terminal antes de desplegar
export TF_VAR_aws_access_key="AKIA3Y7QC6EMXMX7YTFR"
export TF_VAR_aws_secret_key="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"
```

Creamos el plan
```shell
terraform plan -out d2.tfplan
```

Aplicamos el plan para hacer el despliegue
```shell
terraform apply "d2.tfplan"
```
Podemos comprobar en el output que nos muestra la DNS e IPs públicas creadas puediendo acceder mediante ambos

Si queremos ver que hemos aplicado podemos usar
```shell
terraform show
```

Si queremos recuperar los Outputs podemos usar
```shell
terraform output
```

Destruimos la infraestructura creada
```shell
terraform destroy
```

## Uso de varias Zonas de Disponibilidad
 - [Índice](#iac)
  
Las zonas de disponibilidad son ubicaciones concretas de una región de **AWS** que están interconectadas y además de bajar la latencia, aislan de errores unas de otras. En este ejemplo vamos a crear 2 Zonas de Disponibilidad, 2 instancias de EC2 (para dar más disponibilidad a la aplicación), y un Load Balancer (o Balanceador de Carga)

![](extra/02.JPG)

Para esto vamos a crear los siguientes ficheros:
- `network.tf`: Con el contenido del anterior `main.tf` del ejemplo anterior como base para luego ser modificado
- `instances.tf`: Donde estarán definidas las 2 **Instancias de EC2** a usar
- `variables.tf`: Con el contenido del anterior `variables.tf` del ejemplo anterior como base para luego ser modificado
- `loadbalancer.tf`: Definiremos lo necesario para crear el **Load Balancer**
- `locals.tf`: Con el contenido del anterior `locals.tf`
- `terraform.tfvars`: Con el contenido del anterior `terraform.tfvars`
- `outputs.tf`: Para mostrar la dirección del DNS para conectarnos a nuestra app tras el despliegue

Cortamos la instancia de `network.tf` y la pegamos en `instances.tf`
```diff
# instances.tf
# INSTANCES #
resource "aws_instance" "nginx1" {
  ami                    = nonsensitive(data.aws_ssm_parameter.ami.value)
  instance_type          = var.aws_instance_type
  subnet_id              = aws_subnet.subnet1.id
  vpc_security_group_ids = [aws_security_group.nginx-sg.id]

  user_data = <<EOF
#! /bin/bash
sudo amazon-linux-extras install -y nginx1
sudo service nginx start
sudo rm /usr/share/nginx/html/index.html
echo '<html><head><title>Lemon Land Server</title></head><body style=\"background-color:#1F778D\"><p style=\"text-align: center;\"><span style=\"color:#FFFFFF;\"><span style=\"font-size:28px;\">Welcome to &#127819; land</span></span></p></body></html>' | sudo tee /usr/share/nginx/html/index.html
EOF

  tags = local.common_tags

}
```
Para definir las Zonas de Disponibilidad (Availability Zones) podemos encontrar la información en la [documentación de Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs). Añadimos las **Availability Zones** en `network.tf` debajo de `data "aws_ssm_parameter" "ami"`:
```diff
# DATA
data "aws_ssm_parameter" "ami" {
  name = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
}
+
+data "aws_availability_zones" "available" { // Devuelve las Zonas de Disponibilidad asociadas a la Región que he seleccionado
+  state = "available"
+}
```
Tras añadir la fuente de datos de las **Availability Zones**, vamos a actualizar los **Security Groups** relacionados con las **Subnets** e **Instancias EC2**

Primero preparamos la nueva **Subnet**:

1. Actualizamos `network.tf`:
```diff
resource "aws_subnet" "subnet1" {
cidr_block              = var.subnet_cidr_block
vpc_id                  = aws_vpc.vpc.id
map_public_ip_on_launch = var.subnet_map_public_ip_on_launch
+availability_zone       = data.aws_availability_zones.available.names[0]
# Asociamos la Subnet (cada una tiene una EC2 distinta) para que se despliegue en esa Zona de Disponibilidad. El valor 0 es para usar la 1ª

tags = local.common_tags
}   
```
2. Antes de crear la 2ª **Subnet**, definimos en un solo lugar sus `cidr blocks`. Actualizamos `variables.tf`:
```diff
-variable "subnet_cidr_block" {
-  type        = string
-  description = "Subnet cidr block"
-  default     = "20.0.0.0/24"
-}
+
+variable "subnets_cidr_block" {
+  type        = list(string)
+  description = "Subnet cidr block"
+  default     = ["20.0.0.0/24", "20.0.1.0/24"]
+}   
```
3. Actualizamos la **Subnet** con el valor del 1º `cidr block` en `network.tf`:
```diff
resource "aws_subnet" "subnet1" {
- cidr_block              = var.subnet_cidr_block
+ cidr_block              = var.subnets_cidr_block[0]
  vpc_id                  = aws_vpc.vpc.id
  map_public_ip_on_launch = var.subnet_map_public_ip_on_launch
  availability_zone       = data.aws_availability_zones.available.names[0]

  tags = local.common_tags
}
```
4. Añadimos la 2ª **Subnet** en `network.tf`:
```diff
+resource "aws_subnet" "subnet2" {
+ cidr_block              = var.subnets_cidr_block[1]
+ vpc_id                  = aws_vpc.vpc.id
+ map_public_ip_on_launch = var.subnet_map_public_ip_on_launch
+ availability_zone       = data.aws_availability_zones.available.names[1]
+
+ tags = local.common_tags
+}
```
5. Actualizamos las **Route Tables** en `network.tf` para poder también redirigir el tráfico desde la nueva **EC2** al exterior
```diff
# Asociamos tabla de ruta a Subnet 1. Se pueden asociar varias Subnets a una Route Table
resource "aws_route_table_association" "rtb-subnet1" { 
    subnet_id = aws_subnet.subnet1.id 
    route_table_id = aws_route_table.rtb.id 
}

# Asociamos tabla de ruta a Subnet 2
+resource "aws_route_table_association" "rtb-subnet2" {
+    subnet_id = aws_subnet.subnet2.id 
+    route_table_id = aws_route_table.rtb.id 
+}
```
6. Creamos la 2ª **Instancia EC2** en `instances.tf`:
```diff
resource "aws_instance" "nginx2" {
  ami                    = nonsensitive(data.aws_ssm_parameter.ami.value)
  instance_type          = var.aws_instance_type
  subnet_id              = aws_subnet.subnet2.id
  vpc_security_group_ids = [aws_security_group.nginx_sg.id]

  user_data = <<EOF
#! /bin/bash
sudo amazon-linux-extras install -y nginx1
sudo service nginx start
sudo rm /usr/share/nginx/html/index.html
echo '<html><head><title>Lemon Land Server</title></head><body style=\"background-color:#1F778D\"><p style=\"text-align: center;\"><span style=\"color:#FFFFFF;\"><span style=\"font-size:28px;\">Welcome to &#127819; land</span></span></p></body></html>' | sudo tee /usr/share/nginx/html/index.html
EOF

  tags = local.common_tags

}
```
7. Añadimos un **Security Group** adicional en `network.tf` para el **Load Balancer**, así este permitirá el tráfico al puerto 80 desde cualquier dirección:
```diff
resource "aws_security_group" "alb_sg" { # Definimos el Security Group para el Application Load Balancer, ya que es quien redirige el tráfico a las diferentes Instancias
  name   = "nginx_alb_sg"
  vpc_id = aws_vpc.vpc.id

  # HTTP access from anywhere
  ingress {
    from_port   = var.sg_ingress_port
    to_port     = var.sg_ingress_port
    protocol    = "tcp"
    cidr_blocks = var.sg_ingress_cidr_blocks
  }

  # outbound internet access
  egress {
    from_port   = var.sg_egress_port
    to_port     = var.sg_egress_port
    protocol    = "-1"
    cidr_blocks = var.sg_egress_cidr_blocks
  }

  tags = local.common_tags
}
```
8. Ahora que tendremos un **Load Balancer** por delante de nuestras **Instancias** solo queremos aceptar tráfico que venga desde dentro de la **VPC**. Actualizamos el 1º **Security Group** en `network.tf`:
```diff
resource "aws_security_group" "nginx-sg" {
  name   = "nginx_sg"
  vpc_id = aws_vpc.vpc.id

  # HTTP access from anywhere
  ingress {
    from_port = var.sg_ingress_port
    to_port   = var.sg_ingress_port
    protocol  = "tcp"
-   cidr_blocks = var.sg_ingress_cidr_blocks
+   cidr_blocks = [var.vpc_cidr_block]
  }
```

Lo siguiente es incorporar los recursos al **Load Balancer** en `loadbalancer.tf`. El **Load Balancer** es quien se ocupa de redirigir el tráfico a las **Instancias** (quienes solo deben aceptan tráfico desde el mismo). Creamos 4 elementos: El Load Balancer, el Target Group que necesita este primero, un Lisener (para especificar al Load Balancer que eventos tiene que escuchar), y un Target Group para definir hacia donde tiene que redirigir el tráfico:

1. Creamos el Load Balancer:
```diff
## aws_lb
resource "aws_lb" "nginx" {
  name               = "lc-web-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]

  enable_deletion_protection = false

  tags = local.common_tags
}
```
2. Añadimos el Target Group:
```diff
## aws_lb_target_group
+resource "aws_lb_target_group" "nginx" {
+ name     = "lc-web-alb-tg"
+ port     = 80
+ protocol = "HTTP"
+ vpc_id   = aws_vpc.vpc.id
+
+ tags = local.common_tags
+}
```
3. Añadimos el Listener:
```diff
## aws_lb_listener
+resource "aws_lb_listener" "nginx" {
+ load_balancer_arn = aws_lb.nginx.arn
+ port              = "80"
+ protocol          = "HTTP"
+ 
+ default_action {
+   type             = "forward"
+   target_group_arn = aws_lb_target_group.nginx.arn
+ }
+
+ tags = local.common_tags
+}
```
4. Enlazamos las Instancias:
```diff
## aws_lb_target_group_attachment
+resource "aws_lb_target_group_attachment" "nginx1" {
+  target_group_arn = aws_lb_target_group.nginx.arn
+  target_id        = aws_instance.nginx1.id
+  port             = 80
+}
+
+resource "aws_lb_target_group_attachment" "nginx2" {
+  target_group_arn = aws_lb_target_group.nginx.arn
+  target_id        = aws_instance.nginx2.id
+  port             = 80
+}
```

Añadimos el **Output** en `outputs.tf` para mostrar la dirección del DNS del **Load Balancer**
```diff
output "aws_instance_public_dns" { # Podemos llamarlo como queramos
    value = aws_lb.nginx.dns_name # Ahora accedemos a través del DNS Name
}
```

Validamos la configuración
```shell
terraform validate
```

Posteriormente alimentamos por consola los valores de las *keys* para no almacenarlas en ficheros
```shell
# Introducimos ambos valores desde el terminal antes de desplegar
export TF_VAR_aws_access_key="AKIA3Y7QC6EMXMX7YTFR"
export TF_VAR_aws_secret_key="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"
```

Creamos el plan
```shell
terraform plan -out d3.tfplan
```

Aplicamos el plan para hacer el despliegue
```shell
terraform apply "d3.tfplan"
```

Podemos comprobar en el output que nos muestra la DNS para acceder a la app

Destruimos la infraestructura creada
```shell
terraform destroy
```
