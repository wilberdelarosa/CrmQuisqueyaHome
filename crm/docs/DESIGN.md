# Sistema de diseño

Tema claro. Fuente de la dirección: `E:\CRM Final Quisqueya Home noviembre\04-diseno\DESIGN.md` («consola operativa clara y compacta, con navegación azul marino y acento dorado») y la petición del dueño del 2026-11-12: tema claro, web muy profesional y modo app en el móvil.

## Para quién

Brokers que trabajan desde el teléfono, a menudo en la calle o en obra, y gerentes y administración en escritorio. La pantalla debe leerse rápido y bajo luz fuerte.

## Tokens

Todos en `src/app/tokens.css`. Nada de color ni medida suelto en una pantalla.

| Grupo | Tokens | De quién es |
|---|---|---|
| Lienzo y superficies | `canvas`, `surface`, `surface-alt`, `surface-hover`, `line`, `input-line` | Producto |
| Texto | `ink`, `text`, `ink-muted` | Producto |
| Marca | `brand-950/900/700/100`, `accent-600/700/800/100` | Empresa (`config/empresas/<id>.json`) |
| Estados | `success`, `warning`, `danger`, `info` y sus fondos | Producto |

El contraste AA de los pares de texto se vigila con una prueba.

## Tipografía

- **Hanken Grotesk** para títulos y cifras. Las cifras usan numerales tabulares (clase `cifra`).
- **Atkinson Hyperlegible Next** para texto e interfaz: diseñada para distinguir caracteres parecidos, útil en móvil y a pleno sol.

## Estructura

Un solo contenido, dos presentaciones.

- **Escritorio (1024 px o más):** barra de marca fija a la izquierda con el menú; el contenido sobre el lienzo claro, ancho máximo de 82 rem.
- **Móvil y tableta:** cabecera clara con el isotipo, barra inferior con hasta cuatro módulos y «Más», que abre una hoja deslizable con el resto, la cuenta y el cierre de sesión.

## Elemento propio: ritmo de la meta

Lo primero de Inicio. Una barra muestra lo cerrado frente a la meta y una marca señala el día del mes. Si la barra va detrás de la marca, hay que acelerar; la frase de abajo dice cuánto. La regla sale del dominio (`diagnosticarRitmo`), no de la pantalla. Según el alcance del usuario muestra la meta de la compañía, la del equipo o la propia.

## Reglas de pantalla

- Listas y tablas sobre el lienzo con líneas finas; el panel se reserva para agrupar, no para decorar.
- Radio de 7 px en controles y 10 px en paneles.
- Controles de 44 px de alto; objetivos táctiles de 40 px o más.
- Texto en frase normal, en español del negocio. Sin etiquetas en mayúsculas.
- Estado siempre con texto, nunca solo con color.
- Movimiento solo como respuesta a una acción (abrir la hoja, enviar). Se respeta «reducir movimiento».
- Foco visible en dorado oscuro sobre cualquier fondo.

## Por empresa

Cada instalación cambia nombre, logotipo, isotipo y las ocho claves de marca. El resto del sistema no cambia, para que el producto sea reconocible y accesible con cualquier marca.
