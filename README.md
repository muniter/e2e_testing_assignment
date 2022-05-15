# E2E Testing

- Aplicación bajo pruebas: [Ghost](https://github.com/TryGhost/Ghost)
- Versión: 4.41.1
- Versión for VRT: 4.36

Reportes VRT:

- [Kraken VRT](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/kraken_vrt.yml#L1)
- [Playwright VRT](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright_vrt.yml#L1)

## Funcionalidades bajo prueba

Las siguientes son las funcionalidades elegidas para realizar las pruebas.

| No  | Nombre                       | Descripción                                                                                                            |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | **Login**                    | Se puede hacer signin de un usuario registrado previamente.                                                            |
| 2   | **Crear una publicación**    | Se puede crear una publicación, esta es la unidad mínima de contenido de Ghost.                                        |
| 3   | **Editar una publicación**   | Se puede editar todos los detalles de una publicación ya creada.                                                       |
| 4   | **Eliminar una publicación** | Se puede eliminar una publicación ya creada.                                                                           |
| 5   | **Crear un member**          | Se crean los miembros de la página, aquellos que están suscritos a su contenido, se provee un nombre, correo y labels. |
| 6   | **Editar un member**         | Se puede editar todos los datos de un member ya creado.                                                                |
| 7   | **Eliminar un member**       | Se puede eliminar un member ya creado.                                                                                 |
| 8   | **Filtrar members**          | Se puede filtrar los miembros por nombre y otros identificadores.                                                      |

## Escenarios de prueba

**Despliegue la lista para ver el inventario de escenarios de prueba.**

<details>
<summary>Listado de escenarios de prueba</summary>

**Nota**: Solo son 15 por [autorización del profesor Mario Linares](https://github.com/muniter/e2e_testing_assignment/wiki#an%C3%A1lisis-y-comentarios-sobre-herramientas)

| Número | Nombre                                   | Descripción                                                                                                                                                                                                                                                                                             |
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

</details>

## Análisis y comentarios de las herramientas

Se encuentra en la [wiki](https://github.com/muniter/e2e_testing_assignment/wiki)

## Instrucciones

Los archivos de playwwright se encuentran en [e2e-playwright/](https://github.com/muniter/e2e_testing_assignment/tree/main/e2e-playwright/tests)

Los archivos de kraken, los features se encuentran en [features/](https://github.com/muniter/e2e_testing_assignment/tree/main/features), y los steps y support **están escritos en TypeScript** y se encuentran en [src_kraken/](https://github.com/muniter/e2e_testing_assignment/tree/main/features/web_src)

Ambas herramientas están corriendo en **Continuous Integration** en este repositorio, puede [navegar a actions](https://github.com/muniter/e2e_testing_assignment/actions) para ver los últimos resultados de los test, o puede ver el [listado de commits](https://github.com/muniter/e2e_testing_assignment/commits/main) para ver su estado final.

Los workflows, o definición de procedimientos están definidos de la siguiente manera:

1. [Playwright](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright.yml)
1. [Kraken](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/kraken.yml)
1. [Kraken VRT](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/kraken_vrt.yml#L1)
1. [Playwright VRT](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright_vrt.yml#L1)

Estos corren con cada commit a master en el repositorio.

**NOTA: Todas las pruebas corren en chromium**

### Playwright

[Ejemplo en CI](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright.yml)

Instrucciones para instalar en máquina en Unix like systems (Linux, Mac OS (**no probado**)).

#### 1. Instalar dependencias

```bash
npm install
```

#### 2. Instalar dependencias nivel de sistema

- Chromium
- Docker

#### 3. Correr las pruebas:

**NOTA**: El [global setup](https://github.com/muniter/e2e_testing_assignment/blob/main/global-setup.ts) de playwright se encargará de levantar una instancia de Ghost usando un contenedor en el puerto 9333. por lo cual solo el siguiente llamado es suficiente para hacer el bootstrap.

```bash
npx playwright test --workers 1
```

**NOTA: si se quiere correr las pruebas con una base de datos limpia**

Elimine el contenedor, en la próxima corrida se recreará automáticamente.

```bash
docker rm --force ghost-testing
```

#### Tips

Si tiene problemas para instalar o correr playwright [dirígase a la guía de instalación](https://playwright.dev/docs/intro#installation)

También le puede servir verificar como las pruebas [automátizadas se definen en CI](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright.yml)

### Kraken

[Ejemplo en CI](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/kraken.yml)

Instrucciones para instalar en máquina en Unix like systems (Linux, Mac OS (**no probado**)).

#### 1. Instalar dependencias

```bash
npm install
```

#### 2. Instalar dependencias nivel de sistema

- [Todos los requisitos de kraken](https://github.com/TheSoftwareDesignLab/Kraken#-installation)
- Chromium
- Docker

#### 3. Correr tests de kraken

**NOTA**: El [before step](https://github.com/muniter/e2e_testing_assignment/blob/main/features/web_src/support/hooks.ts#L11) de kraken se encargará de levantar una instancia de Ghost usando un contenedor en el puerto 9333. por lo cual solo el siguiente llamado es suficiente para hacer el bootstrap.

```bash
npm run kraken
```

**NOTA: si se quiere correr las pruebas con una base de datos limpia**

Elimine el contenedor, en la próxima corrida se recreará automáticamente.

```bash
docker rm --force ghost-testing
```

## Visual Regression Testing

Actualmente las pruebas de VRT se corren en cada commit de este repositorio, como se puede ver en los siguientes workflows:

- [Kraken VRT](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/kraken_vrt.yml#L1)
- [Playwright VRT](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright_vrt.yml#L1)

Los resultados son publicados automáticamente a la rama [gh-pages](https://github.com/muniter/e2e_testing_assignment/tree/gh-pages) de este repositorio y por lo tanto se sirve como contenido web en los siguientes links:

- [Kraken VRT results](https://muniter.github.io/e2e_testing_assignment/kraken.html)
- [Playwright VRT results](https://muniter.github.io/e2e_testing_assignment/playwright.html)

## Nota:

- Cuando se abre los resultados, puede que tarde un poco en cargar las imagenes, por la cantidad de estas.

Para correr las pruebas en modos VRT se hace necesario lo siguiente:

#### 1. Correr Ghost en ambas versiones de la siguiente manera:

**Kraken**

```bash
CI=1 GHOST_VRT=1 GHOST_VERSION=4.41.1 npm run kraken
CI=1 GHOST_VRT=1 GHOST_VERSION=4.36 npm run kraken
```

**Playwright**

```bash
CI=1 GHOST_VRT=1 GHOST_VERSION=4.41.1 npx playwright test --workers 1
CI=1 GHOST_VRT=1 GHOST_VERSION=4.36 npx playwright test --workers 1
```

#### 2. Procesamiento de datos y generación de reporte:

La automatización de este procesamiento se encuentra en el script [reporter](https://github.com/muniter/e2e_testing_assignment/blob/main/shared/reporter/index.ts#L12) donde se toman los resultados de los screenshots, [se analizan con resembleJS](https://github.com/muniter/e2e_testing_assignment/blob/main/shared/reporter/index.ts#L143) y luego se aplican un [template](https://github.com/muniter/e2e_testing_assignment/blob/main/shared/reporter/template.html#L1) HTML usando nunjucks.

**Kraken**

```bash
npm run reporter -- --process kraken --prev 4.36 --post 4.41.1
```

Esto generará un archivo en la base del repositorio [`kraken.html`](https://muniter.github.io/e2e_testing_assignment/kraken.html).

**Playwright**

```bash
npm run reporter -- --process playwright --prev 4.36 --post 4.41.1
```

Esto generará un archivo en la base del repositorio [`playwright.html`](https://muniter.github.io/e2e_testing_assignment/playwright.html).

## Autores

- [Hector Tenazaca](https://github.com/htenezaca) (@htenezaca)
- [Javier León Ferro](https://github.com/andesjavierleon) (@andesjavierleon)
- [Javier López Grau](https://github.com/muniter) (@muniter)
