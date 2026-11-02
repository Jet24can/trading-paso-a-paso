# Trading Paso a Paso

App web instalable (PWA), sin dependencias ni paso de compilación. Son archivos estáticos.

## Publicarla en Vercel (para instalarla en el celular)

**Opción A, desde GitHub**
1. Creá un repositorio nuevo y subí todo el contenido de esta carpeta a la raíz.
2. En Vercel: Add New > Project > elegí el repositorio > Deploy. No hace falta cambiar ninguna configuración.

**Opción B, con la CLI**
1. En esta carpeta: `npx vercel --prod`

## Instalarla en el celular
Abrí la URL de Vercel en el celular.
- **Android (Chrome):** menú ⋮ > "Instalar app".
- **iPhone (Safari):** Compartir > "Agregar a inicio".

Después de la primera carga funciona sin conexión.

## Actualizar
Cuando cambies archivos, subí el número de versión en `sw.js` (`const VERSION = 'tpp-v2'`) para que los celulares descarguen la versión nueva.

## Archivos
- `engine.js`: cálculos (backtest, indicadores, riesgo, CSV).
- `content.js`: lecciones, quizzes, glosario, estrategias.
- `app.js`: pantallas y lógica de la interfaz.
- `style.css`: diseño.
- `sw.js`, `manifest.webmanifest`, íconos: lo que la hace instalable.

Tu progreso, diario y plan se guardan en el propio dispositivo (localStorage).
Material educativo. No es recomendación de inversión.
