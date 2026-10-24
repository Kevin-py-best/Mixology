-- Read-only verification, safe to run in the live project SQL Editor.
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  has_table_privilege('authenticated', c.oid, 'SELECT') as signed_in_read,
  not has_table_privilege('anon', c.oid, 'SELECT') as anonymous_blocked,
  not has_table_privilege('authenticated', c.oid, 'INSERT,UPDATE,DELETE') as direct_writes_blocked,
  (select count(*) from pg_policies p where p.schemaname = 'public'
    and p.tablename = c.relname and p.cmd = 'SELECT'
    and p.roles = array['authenticated']::name[]
    and p.qual like '%auth.uid()%') = 1 as own_row_policy,
  exists (select 1 from pg_trigger t join pg_proc f on f.oid = t.tgfoid
    join pg_namespace ns on ns.oid = f.pronamespace
    where t.tgrelid = 'auth.users'::regclass and t.tgname = 'mixology_sync_account'
      and t.tgenabled = 'O' and ns.nspname = 'mixology_private') as signup_sync_enabled,
  not has_schema_privilege('authenticated', 'mixology_private', 'USAGE')
    and not has_schema_privilege('anon', 'mixology_private', 'USAGE')
    and not exists (select 1 from pg_proc f join pg_namespace ns on ns.oid = f.pronamespace
      where ns.nspname = 'mixology_private'
      and (has_function_privilege('authenticated', f.oid, 'EXECUTE')
        or has_function_privilege('anon', f.oid, 'EXECUTE'))) as helpers_private
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('user_profiles', 'user_preferences')
order by c.relname;
