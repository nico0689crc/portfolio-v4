-- El CV en PDF pasa a generarse desde la base.
--
-- `cv_files` apuntaba a dos archivos exportados a mano desde Google Docs y
-- subidos a /public. Al no salir de la misma fuente que el resto del sitio,
-- quedaban desactualizados en silencio: el JSON Resume decía una cosa y el PDF
-- otra, sin nada que lo detectara.
--
-- Las rutas nuevas se renderizan con los mismos datos que la página del CV.
-- Los archivos viejos quedan en /public: sirven de respaldo por si hay que
-- volver atrás, y no molestan a nadie.

update public.settings
set value = '{"es": "/cv.es.pdf", "en": "/cv.pdf"}'::jsonb
where key = 'cv_files';
