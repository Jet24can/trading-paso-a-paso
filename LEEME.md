# Trading Paso a Paso (v2: Oro swing)

Novedad: pantalla **Practicar → Oro swing** con gráfico de velas (1D y 4H), EMA 20/50, señales de compra/venta,
stop, objetivo y resultado. Datos en vivo (Yahoo Finance), simulados o tu propio CSV.

## Cómo actualizar tu app en Vercel
1. Copiá TODO el contenido de esta carpeta sobre tu carpeta local (reemplazá los archivos). Es importante la carpeta `api`.
2. Subí los cambios a GitHub (si usás la web: "Add file" → "Upload files", arrastrá los archivos y la carpeta `api`; "Commit changes").
3. Vercel publica solo en 1-2 minutos. Abrí la app en el celu y cerrala/abrila dos veces para que tome la versión nueva.

La carpeta `api` es una función de Vercel que trae las velas del oro. Sin ella, la app funciona igual con datos simulados o CSV.
