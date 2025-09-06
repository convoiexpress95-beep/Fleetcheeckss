-- Create ASCII alias views for tables with accents to avoid URL encoding issues
-- and PostgREST 404 when using non-ASCII identifiers.

-- missions_du_marché -> missions_du_marche
create or replace view public.missions_du_marche as
  select * from public."missions_du_marché";
alter view public.missions_du_marche owner to postgres;
grant select, insert, update, delete on public.missions_du_marche to anon, authenticated;

-- documents_de_vérification -> documents_de_verification
create or replace view public.documents_de_verification as
  select * from public."documents_de_vérification";
alter view public.documents_de_verification owner to postgres;
grant select, insert, update, delete on public.documents_de_verification to anon, authenticated;

-- Keep original tables' RLS policies effective via views
-- Optionally add INSTEAD OF triggers if needed for computed columns; not required here.
