import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, Image, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface UploadInvoiceFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const UploadInvoiceForm: React.FC<UploadInvoiceFormProps> = ({ onBack, onSuccess }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        alert(`Tipo de archivo no permitido: ${file.name}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`Archivo demasiado grande: ${file.name} (máximo 10MB)`);
        return false;
      }
      return true;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      status: 'uploading',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setFiles(prev => [...prev, ...newFiles]);
    uploadFiles(newFiles);
  };

  const uploadFiles = async (filesToUpload: UploadedFile[]) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      filesToUpload.forEach(fileData => {
        formData.append('files', fileData.file);
      });

      const response = await fetch('http://167.86.90.102:7000/api/invoices/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Update file status to success
        setFiles(prev => prev.map(file => 
          filesToUpload.find(f => f.file === file.file) 
            ? { ...file, status: 'success' as const }
            : file
        ));

        // Simulate data extraction (in real app, this would come from OCR/AI)
        setTimeout(() => {
          const mockExtractedData = {
            type: 'boleta',
            client: {
              documentType: 'DNI',
              documentNumber: '12345678',
              name: 'Cliente Extraído',
              email: 'cliente@ejemplo.com'
            },
            items: [
              {
                description: 'Producto extraído de imagen',
                quantity: 1,
                unitPrice: 100.00,
                total: 100.00
              }
            ],
            amounts: {
              subtotal: 100.00,
              igv: 18.00,
              total: 118.00
            },
            date: new Date().toISOString()
          };
          setExtractedData(mockExtractedData);
        }, 2000);

      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(file => 
        filesToUpload.find(f => f.file === file.file) 
          ? { ...file, status: 'error' as const, error: 'Error al subir archivo' }
          : file
      ));
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    const file = files[index];
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const createInvoiceFromExtracted = async () => {
    if (!extractedData || files.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('http://167.86.90.102:7000/api/invoices/from-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          fileData: {
            filename: files[0].file.name,
            originalName: files[0].file.name
          },
          extractedData
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error creating invoice from upload:', error);
      alert('Error al crear el comprobante desde el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Subir Archivo</h1>
          <p className="text-sm text-gray-600">Sube una imagen, PDF o Excel</p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Arrastra archivos aquí o haz clic para seleccionar
        </h3>
        <p className="text-gray-600 mb-4">
          Formatos soportados: JPG, PNG, GIF, PDF, XLS, XLSX
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Tamaño máximo: 10MB por archivo
        </p>
        <Button
          variant="primary"
          onClick={() => fileInputRef.current?.click()}
          className="mx-auto"
        >
          Seleccionar Archivos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.pdf,.xls,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Archivos Subidos</h3>
          {files.map((fileData, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
              {fileData.preview ? (
                <img
                  src={fileData.preview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                  {fileData.file.type.includes('pdf') ? (
                    <FileText className="w-6 h-6 text-red-500" />
                  ) : (
                    <Image className="w-6 h-6 text-blue-500" />
                  )}
                </div>
              )}
              
              <div className="flex-1">
                <p className="font-medium text-gray-900">{fileData.file.name}</p>
                <p className="text-sm text-gray-500">
                  {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {fileData.status === 'uploading' && (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                {fileData.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {fileData.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extracted Data Preview */}
      {extractedData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            ✅ Datos Extraídos del Archivo
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Tipo:</strong> {extractedData.type}</p>
            <p><strong>Cliente:</strong> {extractedData.client.name}</p>
            <p><strong>Documento:</strong> {extractedData.client.documentType} {extractedData.client.documentNumber}</p>
            <p><strong>Items:</strong> {extractedData.items.length} producto(s)</p>
            <p><strong>Total:</strong> S/ {extractedData.amounts.total.toFixed(2)}</p>
          </div>
          
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={createInvoiceFromExtracted}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creando...' : 'Crear Comprobante'}
            </Button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">💡 Consejos para mejores resultados:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Asegúrate de que el texto sea claro y legible</li>
          <li>• Usa buena iluminación si es una foto</li>
          <li>• Los archivos PDF dan mejores resultados que las imágenes</li>
          <li>• Verifica los datos extraídos antes de crear el comprobante</li>
        </ul>
      </div>
    </div>
  );
};