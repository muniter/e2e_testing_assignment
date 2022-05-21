# E2E Testing

- Aplicación bajo pruebas: [Ghost](https://github.com/TryGhost/Ghost)
- Versión: 4.41.1
- Versión for VRT: 4.36

## Quick Links:

Apartes en la Wiki:

- [E2E Testing Playwright & Kraken](https://github.com/muniter/e2e_testing_assignment/wiki/E2E)
- [Visual Regression Testing Ressemble JS](https://github.com/muniter/e2e_testing_assignment/wiki/VRT)
- [Data Validation Scenarios](https://github.com/muniter/e2e_testing_assignment/wiki/DV)

Reportes VRT:

- [Kraken VRT](https://muniter.github.io/e2e_testing_assignment/kraken.html)
- [Playwright VRT](https://muniter.github.io/e2e_testing_assignment/playwright.html)

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
| 9   | **Crear un tag**             | Se puede crear un tag,  llenando todos sus campos                                                                      |

## Instrucciones

Los archivos de playwwright se encuentran en [e2e-playwright/](https://github.com/muniter/e2e_testing_assignment/tree/main/e2e-playwright/tests)

Los archivos de kraken, los features se encuentran en [features/](https://github.com/muniter/e2e_testing_assignment/tree/main/features), y los steps y support **están escritos en TypeScript** y se encuentran en [features/web_src/](https://github.com/muniter/e2e_testing_assignment/tree/main/features/web_src)

Ambas herramientas están corriendo en **Continuous Integration** en este repositorio, puede [navegar a actions](https://github.com/muniter/e2e_testing_assignment/actions) para ver los últimos resultados de los test, o puede ver el [listado de commits](https://github.com/muniter/e2e_testing_assignment/commits/main) para ver su estado final.

Los workflows, o definición de procedimientos están definidos de la siguiente manera:

1. [Playwright (E2E & Data Validation)](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright.yml)
1. [Kraken](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/kraken.yml)
1. [Kraken VRT](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/kraken_vrt.yml#L1)
1. [Playwright VRT](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright_vrt.yml#L1)

Estos corren con cada commit a master en el repositorio.

## E2E Testing

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
npx playwright test --project=regular --workers 1
```

**NOTA: si se quiere correr las pruebas con una base de datos limpia, necesario para evitar problemas de máximo 100 logins en 1 hora.**

Elimine el contenedor, en la próxima corrida se recreará automáticamente.

```bash
docker rm --force ghost-testing
```

#### Tips

Si tiene problemas para instalar o correr playwright [dirígase a la guía de instalación](https://playwright.dev/docs/intro#installation)

También le puede servir verificar como las pruebas [automátizadas se definen en CI](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright.yml)

---
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

**NOTA: si se quiere correr las pruebas con una base de datos limpia, necesario para evitar problemas de máximo 100 logins en 1 hora.**

Elimine el contenedor, en la próxima corrida se recreará automáticamente.

```bash
docker rm --force ghost-testing
```

---
## Visual Regression Testing

Actualmente las pruebas de VRT se corren en cada commit de este repositorio, como se puede ver en los siguientes workflows:

- [Kraken VRT](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/kraken_vrt.yml#L1)
- [Playwright VRT](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright_vrt.yml#L1)

Los resultados son publicados automáticamente a la rama [gh-pages](https://github.com/muniter/e2e_testing_assignment/tree/gh-pages) de este repositorio y por lo tanto se sirve como contenido web en los siguientes links:

- [Kraken VRT results](https://muniter.github.io/e2e_testing_assignment/kraken.html)
- [Playwright VRT results](https://muniter.github.io/e2e_testing_assignment/playwright.html)

Para correr las pruebas en modos VRT se hace necesario lo siguiente:

---
### Playwright

#### 1. Instalar dependencias

```bash
npm install
```

#### 2. Instalar dependencias nivel de sistema

- Chromium
- Docker

#### 3. Correr las pruebas en ambas versiones de Ghost:

```bash
CI=1 GHOST_VRT=1 GHOST_VERSION=4.41.1 npx playwright test --workers 1
CI=1 GHOST_VRT=1 GHOST_VERSION=4.36 npx playwright test --workers 1
```

#### 4. Procesamiento de datos y generación de reporte

```bash
npm run reporter -- --process playwright --prev 4.36 --post 4.41.1
```

Esto generará un archivo en la base del repositorio [`playwright.html`](https://muniter.github.io/e2e_testing_assignment/playwright.html).

---
### Kraken

#### 1. Instalar dependencias

```bash
npm install
```

#### 2. Instalar dependencias nivel de sistema

- [Todos los requisitos de kraken](https://github.com/TheSoftwareDesignLab/Kraken#-installation)
- Chromium
- Docker

#### 3. Correr las pruebas en ambas versiones de Ghost:

**NOTA**: El [before step](https://github.com/muniter/e2e_testing_assignment/blob/main/features/web_src/support/hooks.ts#L11) de kraken se encargará de levantar una instancia de Ghost usando un contenedor en el puerto 9333. por lo cual solo el siguiente llamado es suficiente para hacer el bootstrap.

```bash
CI=1 GHOST_VRT=1 GHOST_VERSION=4.41.1 npm run kraken
CI=1 GHOST_VRT=1 GHOST_VERSION=4.36 npm run kraken
```

#### 4. Procesamiento de datos y generación de reporte

```bash
npm run reporter -- --process playwright --prev 4.36 --post 4.41.1
```

Esto generará un archivo en la base del repositorio [`playwright.html`](https://muniter.github.io/e2e_testing_assignment/playwright.html).

### Sobre el procesamiento de Datos

La automatización de este procesamiento se encuentra en el script [reporter](https://github.com/muniter/e2e_testing_assignment/blob/main/shared/reporter/index.ts#L12) donde se toman los resultados de los screenshots, [se analizan con resembleJS](https://github.com/muniter/e2e_testing_assignment/blob/main/shared/reporter/index.ts#L143) y luego se aplican un [template](https://github.com/muniter/e2e_testing_assignment/blob/main/shared/reporter/template.html#L1) HTML usando nunjucks.

## Validación de Datos

Explicación e inventario: [Data Validation Scenarios](https://github.com/muniter/e2e_testing_assignment/wiki/DV)

### Playwright

[Ejemplo en CI](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright.yml#L33)

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
npx playwright test --project=data --workers 1
```

Luego los escenarios de prueba anteriores que usan faker.js y datos aleatorios en todos.

```bash
npx playwright test --project=regular --workers 1
```

**NOTA: si se quiere correr las pruebas con una base de datos limpia, necesario para evitar problemas de máximo 100 logins en 1 hora.**

Elimine el contenedor, en la próxima corrida se recreará automáticamente.

```bash
docker rm --force ghost-testing
```

#### Tips

Si tiene problemas para instalar o correr playwright [dirígase a la guía de instalación](https://playwright.dev/docs/intro#installation)

También le puede servir verificar como las pruebas [automátizadas se definen en CI](https://github.com/muniter/e2e_testing_assignment/blob/main/.github/workflows/playwright.yml)

## Autores

- [Hector Tenazaca](https://github.com/htenezaca) (@htenezaca)
- [Javier León Ferro](https://github.com/andesjavierleon) (@andesjavierleon)
- [Javier López Grau](https://github.com/muniter) (@muniter)
