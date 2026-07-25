-- Adicionar políticas de storage para a role authenticated
-- (as existentes são apenas para anon / role 16385)

--=event-photos: permitir INSERT para authenticated
CREATE POLICY "authenticated_event_photos_insert"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket = 'event-photos');

--event-photos: permitir SELECT para authenticated
CREATE POLICY "authenticated_event_photos_select"
ON storage.objects
FOR SELECT TO authenticated
USING (bucket = 'event-photos');

--photos: permitir tudo para authenticated
CREATE POLICY "authenticated_photos_all"
ON storage.objects
FOR ALL TO authenticated
USING (bucket = 'photos')
WITH CHECK (bucket = 'photos');
