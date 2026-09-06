-- El CV generado recupera los nombres de archivo históricos.
--
-- Las rutas /cv.pdf y /cv.es.pdf eran nuevas, y estrenar URLs para un documento
-- que ya circula es gratuito sólo en apariencia: esos nombres pueden estar en
-- un LinkedIn, en una firma de correo o en una postulación ya enviada. Nada de
-- eso se puede corregir después.
--
-- Conservándolos, todo lo que ya apunta ahí sigue resolviendo — y ahora sirve el
-- CV al día en lugar de la copia congelada que había en /public.

update public.settings
set value = '{"es": "/CV_Nicolas_Fernandez_FullStack_UXUI_ES.pdf", "en": "/CV_Nicolas_Fernandez_FullStack_UXUI_EN.pdf"}'::jsonb
where key = 'cv_files';
