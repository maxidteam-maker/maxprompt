import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  label: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, label, disabled }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((selectedFile: File | null) => {
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        // Simple validation, can be expanded
        alert('Please select an image file.');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      onFileSelect(selectedFile);
    } else {
        setFile(null);
        setPreview(null);
        onFileSelect(null);
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] || null);
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
        setIsDragging(true);
    }
  }, [disabled]);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            handleFile(droppedFile);
        }
    }
  }, [disabled, handleFile]);


  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition ${isDragging ? 'border-lime-400 bg-lime-900/20' : 'border-gray-600 hover:border-lime-400'}`}
        >
        <div className="text-center">
          {preview ? (
            <img src={preview} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-md" />
          ) : (
            <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
          )}
          <div className="mt-4 flex text-sm leading-6 text-gray-400">
            <label htmlFor={label.replace(/\s+/g, '-')} className="relative cursor-pointer rounded-md font-semibold text-lime-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-lime-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-lime-500">
              <span>{file ? 'Change image' : 'Upload a file'}</span>
              <input id={label.replace(/\s+/g, '-')} name={label.replace(/\s+/g, '-')} type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={disabled} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-500">{file ? file.name : 'PNG, JPG, GIF up to 10MB'}</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
