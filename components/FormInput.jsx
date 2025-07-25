// components/FormInput.jsx
export default function FormInput({ register, name, label, type = "text", required = false }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input
        {...register(name, { required })}
        type={type}
        className="input border rounded px-3 py-2 w-full"
      />
    </div>
  );
}
