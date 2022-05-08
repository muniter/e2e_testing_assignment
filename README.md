# E2E Testing


## Funcionalidades bajo prueba

Las siguientes son las funcionalidades elegidas para realizar las pruebas.

| No | Nombre | Descripción                                                                                                                                                                                |
| -- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1  | **Login** | Se puede hacer signin de un usuario registrado previamente.   |
| 2  | **Crear una publicación** | Se puede crear una publicación, esta es la unidad mínima de contenido de Ghost.  |
| 3  | **Editar una publicación**| Se puede editar todos los detalles de una publicación ya creada.                                                                                               |
| 4  | **Eliminar una publicación**| Se puede eliminar una publicación ya creada.                                                                                                                 |
| 5  | **Crear un member**| Se crean los miembros de la página, aquellos que están suscritos a su contenido, se provee un nombre, correo y labels.                                                |
| 6  | **Editar un member**| Se puede editar todos los datos de un member ya creado.                                                                                                              |
| 7 | **Eliminar un member**| Se puede eliminar un member ya creado.                                                                                                                             |

## Escenarios de prueba

| Número | Nombre                        | Descripción                                                                                                                                                                                                                                                                                             |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Create member                 | Login<br>Crear miembro<br>Revisar que el miembro fue creado                                                                                                                                                                                                                                             |
| 2      | Create member with same name  | Login<br>Crear miembro con nombre A y email X<br>Revisar que el miembro fue creado<br>Crear miembro con nombre A y email Y<br>Revisar que el miembro fue creado                                                                                                                                         |
| 3      | Create member invalid email   | Login<br>Crear miembro con email invalido<br>Intentar guardar<br>Ver que guardar falla                                                                                                                                                                                                                  |
| 4      | Create member without name    | Login<br>Crear miembro sin nombre<br>Revisar que el miembro fue creado                                                                                                                                                                                                                                  |
| 5      | Create member duplicate email | Login<br>Crear miembro con email X<br>Validar creación<br>Crear miembro con email Y<br>Validar creación<br>Editar miembro con email Y colocando email de X<br>Intentar guardar<br>Verificar fallo del guardado por duplicado                                                                            |
| 6      | Create member retry           | Login<br>Crear miembro con email invalido<br>Intentar guardar<br>Confirmar que falló por invalidez<br>Cambiar emaill a email valido<br>Guardar<br>Revisar que el miembro aparece en la lista bien creado                                                                                                |
| 7      | Delete member                 | Login<br>Crear miembro<br>Revisar que el miembro fue creado<br>Entrar a vista de edición de miembro<br>Eliminar miembro<br>Revisar que no aparece y ha sido eliminado correctamente                                                                                                                     |
| 8      | Filter member                 | Login<br>Crear miembro con nombre A<br>Crear miembro con nombre B<br>Filtrar miembro usando parte distintiva del nombre de A<br>Asegurar que aparezca en la lista el miembro A<br>Asegurar que no aparezca en la lista el miembro B                                                                     |
| 9      | Filter member delete          | Login<br>Crear miembro con nombre A y email B<br>Crear miembro con nombre A y email C<br>Filtrar miembros usando el nombre A<br>Hacer una operación eliminar filtrados<br>Volver a la lista general<br>Filtrar nuevamente con nombre A<br>Validar que ninguno de los miembros con correo B y C aparecen |
| 10     | Filter member remove label    | Login<br>Crear miembro A con label X<br>Crear miembro B con label X<br>Filtrar miembros<br>Hacer una operación múltiple eliminar label X<br>Entrar a vista miembro A y verificar que no tiene label X<br>Entrar a vista miembro B y verificar que no tiene label X                                      |
| 11     | Create post                   | Login<br>Crear Post con título y contenido<br>Publicar Post<br>Validar creación del Post                                                                                                                                                                                                                |
| 12     | Create post without content   | Login<br>Crear Post sin contenido<br>Publicar Post<br>Validar creación del Post                                                                                                                                                                                                                         |
| 13     | Create post without title     | Login<br>Crear Post sin titulo<br>Publicar Post<br>Validar creación del Post                                                                                                                                                                                                                            |
| 14     | Create post and edit it       | Login<br>Crear Post con título “X”<br>Publicar Post<br>Editar Post con título “Y”<br>Validar Post publicado                                                                                                                                                                                             |
| 15     | Create post and delete it     | Login<br>Crear Post<br>Publicar Post<br>Eliminar Post                                                                                                                                                                                                                                                   |

## Instrucciones

### Playwright

* Instalar dependencias

```bash
npm install
```

* Instalar Ghost

```bash
npx ghost install 4.41.1 --local --port 9333 --dir ./Ghost
```

* Correr ghost

```bash
npx ghost start --dir ./Ghost
```

* Correr test de playwright

```bash
npx playwright test
```

#### Tips

Al momento de ejecutar ghost en el siguiente enlace:
```bash
http://localhost:9333/ghost/
```
Le va a pedir que se registre, si usted no crea un .env file para los datos de email y password puede registrarse con los siguientes datos:
```bash
email: tester@tester.com
password: Very_Strong1!
```

Nueva instancia de Ghost y corre todas las pruebas de Playwright.

```bash
rm -rf Ghost/content/data/ghost-local.db && npx ghost restart -d Ghost && npx playwright test
```

Si quiere correr el test muchas veces para asegurarse que no sea flaky

```bash
npx playwright test --repeat-each 10
```

Si quiere correr el test en solamente un worker y un browser

```bash
npx playwright test --workers 1 --project chromium
```


### Kraken

* Instalar dependencias

```bash
npm install
```

* Instalar Ghost

```bash
npx ghost install 4.41.1 --local --port 9333 --dir ./Ghost
```

* Correr ghost

```bash
npx ghost start --dir ./Ghost
```

* Correr test de Kraken

```bash
npx kraken-node run
```

#### Tips

Si quiere correr las pruebas con una nueva instancia de Ghost en cada ocasión:

Corra el siguiente comando antes:

```bash
rm -rf Ghost/content/data/ghost-local.db
```

Nueva instancia de Ghost y corre todas las pruebas de Kraken.

```bash
rm -rf Ghost/content/data/ghost-local.db && npx kraken-node run
```

Si usted no tiene instalado adb puede que se le presenten errores, por tanto puede usar el siguiente comando para instalarlo.
```bash
sudo apt install android-tools-adb android-tools-fastboot
```

## Autores

- [Hector Tenazaca](https://github.com/htenezaca) (@htenezaca)
- [Javier León Ferro](https://github.com/andesjavierleon) (@andesjavierleon)
- [Javier López Grau](https://github.com/muniter) (@muniter)
