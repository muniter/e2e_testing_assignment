# E2E Testing


## Funcionalidades bajo prueba

Las siguientes son las funcionalidades elegidas para realizar las pruebas.

| No | Descripción                                                                                                                                                                                |
| -- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1  | **Crear una publicación**: Se puede crear una publicación, esta es la unidad mínima de contenido de Ghost, en esta se puede escribir texto en formato markdown, agregar imágenes y demás.  |
| 2  | **Editar una publicación**: Se puede editar todos los detalles de una publicación ya creada.                                                                                               |
| 3  | **Eliminar una publicación**: Se puede eliminar una publicación ya creada.                                                                                                                 |
| 4  | **Crear una página**: Se puede crear una página con menos funcionalidades a un post, pues esta página no tendrá autor, tags, etc.                                                          |
| 5  | **Crear una tag**: Se puede crear un tag, este es un elemento de organización bajo agrupación, se provee un nombre, descripción y post asociados.                                          |
| 6  | **Crear un staff**: Se crean los staff de la página, aquellos que escriben contenido en la página, se provee un nombre, correo, password, etc.                                             |
| 7  | **Editar un staff**: Se puede editar todos los datos de un staff ya creado.                                                                                                                |
| 8  | **Crear un member**: Se crean los miembros de la página, aquellos que están suscritos a su contenido, se provee un nombre, correo y labels.                                                |
| 9  | **Editar un member**: Se puede editar todos los datos de un member ya creado.                                                                                                              |
| 10 | **Eliminar un member**: Se puede eliminar un member ya creado.                                                                                                                             |

## Escenarios de prueba


| No | Funcionalidad | Descripción                                                                                                                                                                |
| -- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | 1             |                                                                                                                                                                            |
| 2  | 1             |                                                                                                                                                                            |
| 3  | 2             |                                                                                                                                                                            |
| 4  | 2             |                                                                                                                                                                            |
| 5  | 3             |                                                                                                                                                                            |
| 6  | 3             |                                                                                                                                                                            |
| 7  | 4             |                                                                                                                                                                            |
| 8  | 4             |                                                                                                                                                                            |
| 9  | 5             |                                                                                                                                                                            |
| 10 | 5             |                                                                                                                                                                            |
| 11 | 6             |                                                                                                                                                                            |
| 12 | 6             |                                                                                                                                                                            |
| 13 | 7             |                                                                                                                                                                            |
| 14 | 7             |                                                                                                                                                                            |
| 15 | 8             |                                                                                                                                                                            |
| 16 | 8             |                                                                                                                                                                            |
| 17 | 9             |                                                                                                                                                                            |
| 18 | 9             |                                                                                                                                                                            |
| 19 | 10            |                                                                                                                                                                            |
| 20 | 10            |                                                                                                                                                                            |

## Instrucciones

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

### Tips

Si quiere correr las pruebas con una nueva instancia de Ghost en cada ocasión:

Corra el siguiente comando antes:

```bash
rm -rf Ghost/content/data/ghost-local.db
```

En Linux puede correrlos juntos así:

```bash
rm -rf Ghost/content/data/ghost-local.db && npx ghost restart -d Ghost && npx playwright test --repeat-each 10
```

Si quiere correr el test muchas veces para asegurarse que no sea flaky

```bash
npx playwright test --repeat-each 10
```

Si quiere correr el test en solamente un worker y un browser

```bash
npx playwright test --workers 1 --project firefox
```

## Autores

- [Hector Tenazaca](https://github.com/htenezaca) (@htenezaca)
- [Javier León Ferro](https://github.com/andesjavierleon) (@andesjavierleon)
- [Javier López Grau](https://github.com/muniter) (@muniter)
