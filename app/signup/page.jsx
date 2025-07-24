'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp(form);
    if (error) {
      setError(error.message);
    } else {
      router.push('/login');
    }
  };

  return (
    <form onSubmit={handleSignup} className="p-4 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Qeydiyyat</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="border p-2 w-full mb-2"
      />
      <input
        type="password"
        placeholder="Şifrə"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="border p-2 w-full mb-4"
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 w-full">
        Qeydiyyatdan keç
      </button>
    </form>
  );
}
