insert into public.profiles (id, full_name, role, institution, bio)
select
  auth_user.id,
  coalesce(
    nullif(trim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(auth_user.email, ''), '@', 1), ''),
    'Gardenia user'
  ),
  'STUDENT'::public.app_role,
  nullif(trim(auth_user.raw_user_meta_data ->> 'institution'), ''),
  nullif(trim(auth_user.raw_user_meta_data ->> 'bio'), '')
from auth.users auth_user
left join public.profiles profile on profile.id = auth_user.id
where profile.id is null
on conflict (id) do nothing;

notify pgrst, 'reload schema';
