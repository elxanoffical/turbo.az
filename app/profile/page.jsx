import { createServerClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="p-4">
      <h1 className="text-xl">Xoş gəldin, {user.email}</h1>
    </div>
  );
}
