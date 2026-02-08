import React, { useState, useRef } from 'react';
import { FaIdCard, FaCamera, FaUpload, FaSpinner, FaCheck, FaEdit } from 'react-icons/fa';

const BusinessCardScanner = ({ onSave }) => {
  const [image, setImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result);
        scanCard(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanCard = async (file) => {
    setIsScanning(true);
    // Simulate OCR processing
    setTimeout(() => {
      setExtractedData({
        name: 'John Smith',
        title: 'Senior Product Manager',
        company: 'Tech Solutions Inc.',
        email: 'john.smith@techsolutions.com',
        phone: '+1 (555) 123-4567',
        website: 'www.techsolutions.com',
        address: '123 Business Ave, Suite 100, San Francisco, CA 94102',
      });
      setIsScanning(false);
    }, 2000);
  };

  const handleChange = (field, value) => {
    setExtractedData({ ...extractedData, [field]: value });
  };

  const handleSave = () => {
    onSave?.(extractedData);
    setImage(null);
    setExtractedData(null);
  };

  const reset = () => {
    setImage(null);
    setExtractedData(null);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaIdCard className="text-primary-600 text-xl" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Card Scanner</h3>
      </div>

      {!image ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-primary-500 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
          <FaCamera className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">Take a photo or upload an image</p>
          <p className="text-sm text-gray-500">Supports JPG, PNG, HEIC</p>
          <div className="flex gap-4 justify-center mt-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg">
              <FaCamera /> Camera
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
              <FaUpload /> Upload
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="relative">
            <img src={image} alt="Business card" className="w-full rounded-lg max-h-48 object-contain bg-gray-100 dark:bg-gray-700" />
            {isScanning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <FaSpinner className="animate-spin text-3xl mx-auto mb-2" />
                  <p>Scanning card...</p>
                </div>
              </div>
            )}
          </div>

          {/* Extracted Data */}
          {extractedData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">Extracted Information</h4>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                >
                  <FaEdit /> {isEditing ? 'Done Editing' : 'Edit'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(extractedData).map(([field, value]) => (
                  <div key={field} className={field === 'address' ? 'col-span-2' : ''}>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 capitalize mb-1">
                      {field}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{value}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <FaCheck /> Save Contact
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  Scan Another
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessCardScanner;

