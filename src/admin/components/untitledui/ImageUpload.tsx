import React, { useState, useRef } from 'react';
import { UploadCloud02, Trash01, Image01, RefreshCw01 } from '@untitledui/icons';

interface ImageUploadProps {
  label?: string;
  helperText?: string;
  value?: string | null;
  onChange: (webpDataUrl: string | null) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Featured Image',
  helperText = 'PNG, JPG, or GIF up to 10MB. Automatically converted to WebP.',
  value,
  onChange,
  className = '',
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileMeta, setFileMeta] = useState<{ sizeKb?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileToWebp = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setIsConverting(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsConverting(false);
          return;
        }

        ctx.drawImage(img, 0, 0);

        // Convert to WebP format at 0.88 quality
        const webpDataUrl = canvas.toDataURL('image/webp', 0.88);
        const approxSizeKb = Math.round((webpDataUrl.length * 3) / 4 / 1024);
        setFileMeta({ sizeKb: approxSizeKb });
        onChange(webpDataUrl);
        setIsConverting(false);
      };
      img.onerror = () => {
        setIsConverting(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFileToWebp(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFileToWebp(file);
    }
  };

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {label && <label className="block text-xs font-semibold text-[#17191A]">{label}</label>}

      {value ? (
        <div className="relative rounded-[10px] border border-[#E1E0DD] bg-white p-3 space-y-3 shadow-xs">
          <div className="relative h-44 w-full rounded-[8px] overflow-hidden bg-[#FAF9F6] border border-[#E1E0DD] flex items-center justify-center">
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-[#17191A]/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[11px] font-mono">
              <span>WebP</span>
              {fileMeta?.sizeKb && <span>• {fileMeta.sizeKb} KB</span>}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#17645F] hover:text-[#155A56] cursor-pointer"
            >
              <RefreshCw01 className="w-3.5 h-3.5" />
              <span>Replace Image</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setFileMeta(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D92D20] hover:text-red-700 cursor-pointer"
            >
              <Trash01 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-[10px] p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-[#17645F] bg-[#E2ECEB]/30'
              : 'border-[#C8C7C5] bg-[#FAF9F6] hover:bg-[#F0EFEC]/60 hover:border-[#17645F]'
          }`}
        >
          <div className="mx-auto w-10 h-10 rounded-full bg-[#E2ECEB] text-[#17645F] flex items-center justify-center mb-3">
            <UploadCloud02 className="w-5 h-5" />
          </div>

          <p className="text-sm font-semibold text-[#17191A]">
            <span className="text-[#17645F] underline underline-offset-2">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-[#5D5E5F] mt-1">{helperText}</p>

          {isConverting && (
            <p className="text-xs font-semibold text-[#17645F] mt-2 animate-pulse">
              Converting image to high-efficiency WebP...
            </p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
