# CV exportados a mano (obsoletos)

Los dos PDF que estaban en `public/` antes de que el CV se generara desde la
base. Se movieron acá y no se borraron por dos razones:

1. Las rutas `/CV_Nicolas_Fernandez_FullStack_UXUI_{EN,ES}.pdf` ahora las sirve
   un route handler. Un archivo con ese mismo nombre en `public/` lo taparía:
   Next sirve los estáticos antes que las rutas, y el PDF generado no se vería
   nunca — sin ningún error que lo delate.

2. Sirven de referencia de la maqueta anterior mientras se ajusta la nueva.

Se pueden borrar cuando el PDF generado esté aprobado. Git conserva la versión.
