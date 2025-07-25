// components/FormSelect.jsx
export default function FormSelect({ register, name, label, options = [], required = false }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <select
        {...register(name, { required })}
        className="input border rounded px-3 py-2 w-full"
      >
        <option value="">Seçin</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
