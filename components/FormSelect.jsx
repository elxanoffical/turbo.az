export default function FormSelect({ register, name, label, options, error, required }) {
  return (
    <div>
      <label className="block font-medium mb-1" htmlFor={name}>{label}</label>
      <select
        id={name}
        {...register(name, { required: required ? `${label} mütləqdir` : false })}
        className={`w-full border px-3 py-2 rounded ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">Seçin</option>
        {options.map((opt, i) =>
          typeof opt === "string" ? (
            <option key={i} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
      {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
  );
}
