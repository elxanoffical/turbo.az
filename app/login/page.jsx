"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/profile");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-[#00272b]">Daxil ol</h2>
      {error && (
        <p className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="block mb-1 font-medium text-[#00272b]">
          Email
          <input
            type="email"
            placeholder="Email daxil edin"
            {...register("email", {
              required: "Email tələb olunur",
              pattern: {
                value:
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Düzgün email formatı daxil edin",
              },
            })}
            className={`w-full p-2 border rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            } mt-1 mb-2 focus:outline-none focus:ring-2 focus:ring-[#e0FF4F]`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-0.5">{errors.email.message}</p>
          )}
        </label>

        <label className="block mb-4 font-medium text-[#00272b] relative">
          Şifrə
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Şifrənizi daxil edin"
            {...register("password", {
              required: "Şifrə tələb olunur",
              minLength: {
                value: 6,
                message: "Şifrə ən az 6 simvol olmalıdır",
              },
            })}
            className={`w-full p-2 border rounded ${
              errors.password ? "border-red-500" : "border-gray-300"
            } mt-1 pr-10 mb-2 focus:outline-none focus:ring-2 focus:ring-[#e0FF4F]`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-[38px] text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? "Gizlə" : "Göstər"}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-0.5">{errors.password.message}</p>
          )}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00272b] text-[#e0FF4F] py-2 rounded font-semibold hover:bg-[#004b48] transition disabled:opacity-50"
        >
          {loading ? "Yüklənir..." : "Daxil ol"}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600">
        Hesabınız yoxdur?
        <a
          href="/signup"
          className="ml-1 text-[#00272b] font-semibold hover:underline"
        >
          Qeydiyyatdan keçin
        </a>
      </p>
    </div>
  );
}
