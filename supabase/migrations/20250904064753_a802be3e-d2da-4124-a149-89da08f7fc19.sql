-- Assigner le rôle admin aux utilisateurs spécifiés
DO $$
BEGIN
  -- Pour chaque email, si l'utilisateur existe, lui assigner le rôle admin
  
  -- mahdi.convoyages@gmail.com
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'mahdi.convoyages@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT u.id, 'admin'::public.user_role
    FROM auth.users u
    WHERE u.email = 'mahdi.convoyages@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- convoiexpress95@gmail.com
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'convoiexpress95@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT u.id, 'admin'::public.user_role
    FROM auth.users u
    WHERE u.email = 'convoiexpress95@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- mahdi.benamor1994@gmail.com
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'mahdi.benamor1994@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT u.id, 'admin'::public.user_role
    FROM auth.users u
    WHERE u.email = 'mahdi.benamor1994@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- xcrackz1994@gmail.com
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'xcrackz1994@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT u.id, 'admin'::public.user_role
    FROM auth.users u
    WHERE u.email = 'xcrackz1994@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
END $$;