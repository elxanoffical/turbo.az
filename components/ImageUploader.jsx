// components/ImageUploader.jsx
export default function ImageUploader({ onChange }) {
  return (
    <div>
      <label className="block mb-1 font-medium">Şəkillər</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onChange(e.target.files)}
        className="input w-full"
      />
    </div>
  );
}
