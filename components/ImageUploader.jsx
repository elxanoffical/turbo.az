export default function ImageUploader({ onChange, maxFiles }) {
  const handleChange = (e) => {
    let files = Array.from(e.target.files);
    if (files.length > maxFiles) {
      alert(`Maksimum ${maxFiles} şəkil seçə bilərsiniz.`);
      files = files.slice(0, maxFiles);
    }
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