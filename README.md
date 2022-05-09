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
