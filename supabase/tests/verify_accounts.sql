-- Run in the local account database test harness. All fixtures are rolled back.
begin;

insert into auth.users (id, raw_user_meta_data) values
  ('a1000000-0000-4000-8000-000000000001', '{"display_name":"Alex","role":"admin","quiz_answers":{"flavor":"Sweet & fruity","vibe":"Chill and easy-going","style":"Light and refreshing","strength":2}}'),
  ('a1000000-0000-4000-8000-000000000002', '{"display_name":"Sam","quiz_answers":{"flavor":"Bitter & bold","vibe":"Bold and adventurous","style":"Something unique and different","strength":4}}');

do $$
begin
  if (select role from public.user_profiles where auth_user_id = 'a1000000-0000-4000-8000-000000000001') <> 'customer' then
    raise exception 'User metadata must never grant admin access';
  end if;
  if (select strength from public.user_preferences where auth_user_id = 'a1000000-0000-4000-8000-000000000001') <> 2 then
    raise exception 'Signup metadata must populate validated preferences';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000001', true);
do $$
begin
  if (select count(*) from public.user_profiles) <> 1 then
    raise exception 'Authenticated users must only see their own profile';
  end if;
  if (select count(*) from public.user_preferences) <> 1 then
    raise exception 'Authenticated users must only see their own preferences';
  end if;
  if exists (select 1 from public.user_profiles where auth_user_id = 'a1000000-0000-4000-8000-000000000002') then
    raise exception 'Another account profile was visible';
  end if;
  begin
    update public.user_profiles set role = 'admin';
    raise exception 'A client was allowed to update roles';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.user_preferences;
    raise exception 'A client was allowed to delete preferences directly';
  exception when insufficient_privilege then null;
  end;
  begin
    perform mixology_private.sync_account_data('a1000000-0000-4000-8000-000000000002', '{"display_name":"Forged"}');
    raise exception 'A client was allowed to call the privileged sync function';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
select set_config('request.jwt.claim.sub', '', true);

set local role anon;
do $$
begin
  begin
    perform 1 from public.user_profiles;
    raise exception 'Anonymous users were allowed to read profiles';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.user_preferences;
    raise exception 'Anonymous users were allowed to read preferences';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

update public.user_profiles set role = 'admin'
where auth_user_id = 'a1000000-0000-4000-8000-000000000001';
update auth.users set raw_user_meta_data =
  '{"display_name":"Alex Updated","role":"customer","quiz_answers":{"flavor":"Sour & refreshing","vibe":"Fun and energetic","style":"Fruity and easy to drink","strength":3}}'
where id = 'a1000000-0000-4000-8000-000000000001';

do $$
begin
  if not exists (select 1 from public.user_profiles where auth_user_id = 'a1000000-0000-4000-8000-000000000001' and display_name = 'Alex Updated' and role = 'admin') then
    raise exception 'Profile sync must update the name and preserve trusted roles';
  end if;
  if not exists (select 1 from public.user_preferences where auth_user_id = 'a1000000-0000-4000-8000-000000000001' and strength = 3 and flavor = 'Sour & refreshing') then
    raise exception 'Quiz completion must update saved preferences';
  end if;
  begin
    update public.user_preferences set strength = 6;
    raise exception 'Invalid strength was accepted';
  exception when check_violation then null;
  end;
end;
$$;

-- Incomplete/invalid legacy metadata cannot break a signup or overwrite a valid quiz.
update auth.users set raw_user_meta_data = '{"display_name":"Alex","quiz_answers":{"strength":99}}'
where id = 'a1000000-0000-4000-8000-000000000001';
insert into auth.users (id, raw_user_meta_data) values
  ('a1000000-0000-4000-8000-000000000003', '{}');
do $$
begin
  if not exists (select 1 from public.user_profiles where auth_user_id = 'a1000000-0000-4000-8000-000000000003') then
    raise exception 'A signup without optional metadata must still create a profile';
  end if;
  if (select strength from public.user_preferences where auth_user_id = 'a1000000-0000-4000-8000-000000000001') <> 3 then
    raise exception 'Invalid metadata overwrote a valid preference';
  end if;
end;
$$;

delete from auth.users where id = 'a1000000-0000-4000-8000-000000000001';
do $$
begin
  if exists (select 1 from public.user_profiles where auth_user_id = 'a1000000-0000-4000-8000-000000000001')
    or exists (select 1 from public.user_preferences where auth_user_id = 'a1000000-0000-4000-8000-000000000001') then
    raise exception 'Deleting an Auth user must cascade to their app data';
  end if;
end;
$$;

rollback;
