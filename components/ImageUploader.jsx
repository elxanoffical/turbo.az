// components/ImageUploader.jsx
export default function ImageUploader({ onChange, maxFiles }) {
  const handleChange = (e) => {
    const files = Array.from(e.target.files).slice(0, maxFiles);
    onChange(files);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="input w-full"
      />
    </div>
  );
}