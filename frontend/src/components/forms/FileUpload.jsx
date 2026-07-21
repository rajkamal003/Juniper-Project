// frontend/src/components/forms/FileUpload.jsx
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

export const FileUpload = ({
  label,
  maxSizeMB = 2,
  allowedTypes = ['image/jpeg', 'image/png'],
  onFileLoaded, // callback to feed form value
  required = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const validateAndUpload = (selectedFile) => {
    setError('');
    
    if (!selectedFile) return;

    // Check type
    if (allowedTypes.length > 0 && !allowedTypes.includes(selectedFile.type)) {
      const extensions = allowedTypes.map(t => t.split('/')[1]).join(', ').toUpperCase();
      setError(`Invalid file type. Supported: ${extensions}`);
      return;
    }

    // Check size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds limit (${maxSizeMB}MB max)`);
      return;
    }

    // Start simulation
    setFile(selectedFile);
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          // Read file as base64 data URL and pass to form
          const reader = new FileReader();
          reader.onload = (e) => {
            if (onFileLoaded) {
              onFileLoaded(e.target.result);
            }
          };
          reader.readAsDataURL(selectedFile);
          return 100;
        }
        return prev + 25; // 25% increments
      });
    }, 200);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploadProgress(0);
    setError('');
    if (onFileLoaded) {
      onFileLoaded('');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider select-none">
        {label} {required && <span className="text-brand-danger font-bold">*</span>}
      </label>

      {!file ? (
        // Drop zone
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-200 ${
            dragActive 
              ? 'border-brand-primary bg-blue-500/5' 
              : error 
              ? 'border-brand-danger bg-red-500/5' 
              : 'border-[#334155] hover:border-brand-primary hover:bg-[#1e293b]/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            className="hidden"
            accept={allowedTypes.join(',')}
          />
          <Upload className="w-8 h-8 text-[#94a3b8] mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-semibold text-brand-text">
            Drag & drop file or <span className="text-brand-primary">Choose file</span>
          </p>
          <p className="text-[10px] text-brand-secondary mt-1">
            Max Size: {maxSizeMB}MB • Supported: {allowedTypes.map(t => t.split('/')[1]).join(', ').toUpperCase()}
          </p>
          {error && (
            <p className="text-[11px] text-brand-danger font-medium mt-2 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </div>
      ) : (
        // File list item
        <div className="p-4 rounded-xl border border-[#334155] bg-slate-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-8 h-8 text-brand-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-brand-text truncate">{file.name}</p>
              <p className="text-[10px] text-brand-secondary">{formatSize(file.size)}</p>
              
              {uploading && (
                <div className="w-36 bg-[#334155] h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-brand-primary h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {uploadProgress === 100 && (
              <CheckCircle className="w-5 h-5 text-brand-success shrink-0" />
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="text-[11px] font-bold text-brand-danger hover:underline focus:outline-none"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default FileUpload;
