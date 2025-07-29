export default function FormInput({ register, name, label, error, ...rest }) {
  return (
    <div>
      <label className="block font-medium mb-1" htmlFor={name}>{label}</label>
      <input
        id={name}
        {...register(name, { required: `${label} mütləqdir` })}
        className={`w-full border px-3 py-2 rounded ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...rest}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
  );
}
