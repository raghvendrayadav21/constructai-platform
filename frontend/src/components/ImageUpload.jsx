import { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({ file, preview, onFile, onClear, label = 'Upload Image', hint = 'PNG, JPG, JPEG, WEBP' }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) onFile(dropped);
  }, [onFile]);

  const handleChange = useCallback((e) => {
    const selected = e.target.files[0];
    if (selected) onFile(selected);
  }, [onFile]);

  if (preview) {
    return (
      <div className="upload-preview">
        <img src={preview} alt="Preview" />
        <div className="upload-preview-overlay">
          <button className="btn btn-secondary btn-sm" onClick={onClear}>
            <X size={14} />
            Remove
          </button>
        </div>
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <ImageIcon size={14} />
          {file?.name} · {(file?.size / 1024).toFixed(1)} KB
        </div>
      </div>
    );
  }

  return (
    <label
      className="upload-zone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      htmlFor="image-upload"
    >
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <div className="upload-zone-icon">📸</div>
      <div className="upload-zone-title">{label}</div>
      <div className="upload-zone-sub">Drag & drop or click to browse</div>
      <div className="upload-zone-sub" style={{ marginTop: 6, opacity: 0.6 }}>{hint}</div>
    </label>
  );
}
