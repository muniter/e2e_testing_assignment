# WARNING

## Generar VRT reports

1. Correr Ghost en ambas versiones de la siguiente manera:

Nota: se usa `CI=1` para que corra headless.

```bash
CI=1 GHOST_VRT=1 GHOST_VERSION=4.41.1 npm run kraken
CI=1 GHOST_VRT=1 GHOST_VERSION=4.38.1 npm run kraken
```

Cuando los anteriores comandos corran y pasen se genera la siguiente estructura en la carpeta screenshots:

```
screenshots
└── kraken
    ├── 4.38.1
    │   └── toProcess.json
    └── 4.41.1
        └── toProcess.json
```

3. Para procesar los archivos `toProcess.json`

```bash
npm run reporter -- --process kraken --prev 4.38.1 --post 4.41.1
```

Cuando el anterior comando corra y pasen se genera la siguiente estructura en la carpeta screenshots: Esto habrá extraido los screenshots tomados por los reportes de kraken, y combinado la información sacará una carpeta adicional con nomber `reoprt_{prev}_{post}' en esta se encontrará un archivo `report.json` dondé estará todo combinado, referenciando las imágenes que corresponden a cada paso de cada escenario:

La

```bash
screenshots
└── kraken
    ├── 4.36
    │   └── toProcess.json
    ├── 4.38.1
    │   ├── images
    │   │   ├── 0022c060-811b-4349-927f-c7ba13cb0a77.png
    │   │   ├── ...
    │   │   └── ff8a0f18-eea9-4a4a-8ef6-c422554b5381.png
    │   └── toProcess.json
    ├── 4.41.1
    │   ├── images
    │   │   ├── 00b7feb9-ee8c-4724-a039-9ceed34b2585.png
    │   │   ├── ...
    │   │   └── ff188d3f-64a2-411b-ac04-4bd17c5eec52.png
    │   └── toProcess.json
    └── report_4.38.1_4.41.1
        ├── images
        │   ├── 01401cc4-4c31-4ed5-b9b6-81db02cf6230.png
        │   ├── ...
        │   └── ffe8f115-cb28-4d7b-b978-0d33da1458b8.png
        └── report.json
```

4. De este output se genera una página HTML.

# Para correr se necesita docker

Para correr las pruebas de playwright:

```
GHOST_VERSION=4.41.1 npx playwright test
```

Cuando vayamos a hacer VRT, las cosas cambian, solo se pueden correr en 1 worker, pues la base de datos se eliminará en cada corrida de cada caso, pero esto hasta ahora no está implementado.

```
GHOST_VRT=1 GHOST_VERSION=4.41.1 npx playwright test --worker 1
```

# E2E Testing


## Funcionalidades bajo prueba

Las siguientes son las funcionalidades elegidas para realizar las pruebas.

| No | Nombre                        | Descripción                                                                                                             |
| -- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1  | **Login**                     | Se puede hacer signin de un usuario registrado previamente.                                                             |
| 2  | **Crear una publicación**     | Se puede crear una publicación, esta es la unidad mínima de contenido de Ghost.                                         |
| 3  | **Editar una publicación**    | Se puede editar todos los detalles de una publicación ya creada.                                                        |
| 4  | **Eliminar una publicación**  | Se puede eliminar una publicación ya creada.                                                                            |
| 5  | **Crear un member**           | Se crean los miembros de la página, aquellos que están suscritos a su contenido, se provee un nombre, correo y labels.  |
| 6  | **Editar un member**          | Se puede editar todos los datos de un member ya creado.                                                                 |
| 7  | **Eliminar un member**        | Se puede eliminar un member ya creado.                                                                                  |
| 8  | **Filtrar members**           | Se puede filtrar los miembros por nombre y otros identificadores.                                                       |

## Escenarios de prueba

**Nota**: Solo son 15 por [autorización del profesor Mario Linares](https://github.com/muniter/e2e_testing_assignment/wiki#an%C3%A1lisis-y-comentarios-sobre-herramientas)

| Número | Nombre                                 | Descripción                                                                                                                                                                                                                                                                                             |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Create member                            | Login<br>Crear miembro<br>Revisar que el miembro fue creado                                                                                                                                                                                                                                             |
| 2      | Create member with same name             | Login<br>Crear miembro con nombre A y email X<br>Revisar que el miembro fue creado<br>Crear miembro con nombre A y email Y<br>Revisar que el miembro fue creado                                                                                                                                         |
| 3      | Create member invalid email              | Login<br>Crear miembro con email invalido<br>Intentar guardar<br>Ver que guardar falla                                                                                                                                                                                                                  |
| 4      | Create member without name               | Login<br>Crear miembro sin nombre<br>Revisar que el miembro fue creado                                                                                                                                                                                                                                  |
| 5      | Create member duplicate email            | Login<br>Crear miembro con email X<br>Validar creación<br>Crear miembro con email Y<br>Validar creación<br>Editar miembro con email Y colocando email de X<br>Intentar guardar<br>Verificar fallo del guardado por duplicado                                                                            |
| 6      | Create member retry                      | Login<br>Crear miembro con email invalido<br>Intentar guardar<br>Confirmar que falló por invalidez<br>Cambiar emaill a email valido<br>Guardar<br>Revisar que el miembro aparece en la lista bien creado                                                                                                |
| 7      | Delete member                            | Login<br>Crear miembro<br>Revisar que el miembro fue creado<br>Entrar a vista de edición de miembro<br>Eliminar miembro<br>Revisar que no aparece y ha sido eliminado correctamente                                                                                                                     |
| 8      | Filter member                            | Login<br>Crear miembro con nombre A<br>Crear miembro con nombre B<br>Filtrar miembro usando parte distintiva del nombre de A<br>Asegurar que aparezca en la lista el miembro A<br>Asegurar que no aparezca en la lista el miembro B                                                                     |
| 9      | Filter member delete                     | Login<br>Crear miembro con nombre A y email B<br>Crear miembro con nombre A y email C<br>Filtrar miembros usando el nombre A<br>Hacer una operación eliminar filtrados<br>Volver a la lista general<br>Filtrar nuevamente con nombre A<br>Validar que ninguno de los miembros con correo B y C aparecen |
| 10     | Filter member remove label               | Login<br>Crear miembro A con label X<br>Crear miembro B con label X<br>Filtrar miembros<br>Hacer una operación múltiple eliminar label X<br>Entrar a vista miembro A y verificar que no tiene label X<br>Entrar a vista miembro B y verificar que no tiene label X                                      |
| 11     | Create post                              | Login<br>Crear Post con título y contenido<br>Publicar Post<br>Validar creación del Post                                                                                                                                                                                                                |
| 12     | Create post without content              | Login<br>Crear Post sin contenido<br>Publicar Post<br>Validar creación del Post                                                                                                                                                                                                                         |
| 13     | Create multiple post with the same title | Login<br>Crear Post con titulo X<br>Publicar Post<br>Validar creación del Post<br>Crear post con titulo X<br>Publicar Post<br>Validar creación del Post                                                                                                                                                 |
| 14     | Create post and edit it                  | Login<br>Crear Post<br>Publicar Post<br>Editar Post<br>Validar Post publicado                                                                                                                                                                                                                           |
| 15     | Create post and delete it                | Login<br>Crear Post<br>Publicar Post<br>Eliminar Post                                                                                                                                                                                                                                                   |

## Análisis y comentarios de las herramientas

Se encuentra en la [wiki](https://github.com/muniter/e2e_testing_assignment/wiki)

## Instrucciones

Los archivos de playwwright se encuentran en [e2e-playwright/](https://github.com/muniter/e2e_testing_assignment/tree/main/e2e-playwright/tests)

Los archivos de kraken, los features se encuentran en [features/](https://github.com/muniter/e2e_testing_assignment/tree/main/features), y los steps y support **están escritos en TypeScript** y se encuentran en [src_kraken/](https://github.com/muniter/e2e_testing_assignment/tree/main/src_kraken)

Ambas herramientas están corriendo en **Continuous Integration** en este repositorio, puede [navegar a actions](https://github.com/muniter/e2e_testing_assignment/actions) para ver los últimos resultados de los test, o puede ver el [listado de commits](https://github.com/muniter/e2e_testing_assignment/commits/main) para ver su estado final.

Los workflows, o definición de procedimientos están definidos de la siguiente manera:

1. [Playwright](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright.yml)
1. [Kraken](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/kraken.yml)

Estos corren con cada commit a master en el repositorio.

**NOTA: Es muy importante que instale Ghost en el puerto en que explicamos, de esto dependen las pruebas**

**NOTA: Todas las pruebas corren en chromium**

### Playwright

[Ejemplo en CI](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright.yml)

Instrucciones para instalar en máquina en Unix like systems (Linux, Mac OS (**no probado**)).

* Instalar dependencias

```bash
npm install
```

* Instalar dependencias nivel de sistema

  * Chromium

* Instalar Ghost

```bash
npx ghost install 4.41.1 --local --port 9333 --dir ./Ghost
```

* Correr ghost: estará disponible en  http://localhost:9333/ghost/

```bash
npx ghost start --dir ./Ghost
```

* Correr test de playwright (en un solo worker)

```bash
npx playwright test --workers 1
```

**NOTA: si se quiere correr las pruebas con una base de datos limpia**

Corra para eliminar la base de datos de Ghost y reiniciar.

```bash
rm -rf Ghost/content/data/ghost-local.db && npx ghost restart -d Ghost
```

#### Tips

Si tiene problemas para instalar o correr playwright [dirígase a la guía de instalación](https://playwright.dev/docs/intro#installation)

También le puede servir verificar como las pruebas [automátizadas se definen en CI](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright.yml)


### Kraken

[Ejemplo en CI](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/kraken.yml)

Instrucciones para instalar en máquina en Unix like systems (Linux, Mac OS (**no probado**)).

* Instalar dependencias

```bash
npm install
```

* Instalar dependencias nivel de sistema

  * [Todos los requisitos de kraken](https://github.com/TheSoftwareDesignLab/Kraken#-installation)

* Instalar Ghost

**NOTA:** Si ya lo instaló **de la forma explicada (puerto 9333)** puede eliminar la base de datos y reiniciarlo (más adelante se encuentra como).

```bash
npx ghost install 4.41.1 --local --port 9333 --dir ./Ghost
```

* Correr ghost: estará disponible en  http://localhost:9333/ghost/

```bash
npx ghost start --dir ./Ghost
```

* **Compilar el código**

Los steps y demás archivos que usa kraken son transpilados de TypeScript a JavaScript, se encuentran en la [carpeta src_kraken/](https://github.com/muniter/e2e_testing_assignment/tree/main/src_kraken) por lo cual se necesita hacer compilación antes de correr las pruebas de kraken.

**Sin cambiar de directorio**, desde el **root** del repositorio correr:
```bash
tsc
```

* Correr tests de kraken

```bash
npx kraken-node run
```

**NOTA: si se quiere correr las pruebas con una base de datos limpia**

Corra para eliminar la base de datos de Ghost y reiniciar.

```bash
rm -rf Ghost/content/data/ghost-local.db && npx ghost restart -d Ghost
```

## Autores

- [Hector Tenazaca](https://github.com/htenezaca) (@htenezaca)
- [Javier León Ferro](https://github.com/andesjavierleon) (@andesjavierleon)
- [Javier López Grau](https://github.com/muniter) (@muniter)
