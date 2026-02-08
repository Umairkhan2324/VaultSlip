-- On sign-up: create default org (plan=free) and profile for the new user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  INSERT INTO public.organizations (name, plan)
  VALUES ('My Organization', 'free')
  RETURNING id INTO new_org_id;
  INSERT INTO public.profiles (id, org_id, email, role)
  VALUES (NEW.id, new_org_id, NEW.email, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
