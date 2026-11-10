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
        scanCard();
      };
      reader.readAsDataURL(file);
    }
  };

  /*
   * There is no OCR provider wired into this app, and the previous version
   * "scanned" every card into the same invented person — John Smith, Senior
   * Product Manager at Tech Solutions Inc. Saving that would have written a
   * fabrication into the user's real contacts.
   *
   * Instead the image is kept as a reference and the fields are left blank
   * for the user to type. That is slower but it is their data, not ours.
   */
  const scanCard = async () => {
    setIsScanning(true);
    setExtractedData({ name: '', title: '', company: '', email: '', phone: '', website: '', address: '' });
    setIsEditing(true);
    setIsScanning(false);
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
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaIdCard className="text-primary-600 text-xl" />
        <h3 className="text-lg font-semibold text-content">Business Card Scanner</h3>
      </div>

      <p className="mb-4 rounded-lg bg-surface-sunken p-3 text-xs text-content-muted">
        Automatic text recognition is not connected, so details are not read from the image — enter them
        yourself after attaching the card.
      </p>

      {!image ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-line rounded-lg p-12 text-center cursor-pointer hover:border-primary-500 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
          <FaCamera className="mx-auto text-4xl text-content-subtle mb-4" />
          <p className="text-content-muted mb-2">Take a photo or upload an image</p>
          <p className="text-sm text-content-muted">Supports JPG, PNG, HEIC</p>
          <div className="flex gap-4 justify-center mt-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg">
              <FaCamera /> Camera
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-sunken text-content rounded-lg">
              <FaUpload /> Upload
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="relative">
            <img src={image} alt="Business card" className="w-full rounded-lg max-h-48 object-contain bg-surface-sunken" />
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
                <h4 className="font-medium text-content">Extracted Information</h4>
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
                    <label className="block text-sm text-content-muted capitalize mb-1">
                      {field}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full px-3 py-2 border border-line rounded-lg bg-white bg-surface-sunken text-content"
                      />
                    ) : (
                      <p className="text-content">{value}</p>
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
                  className="px-4 py-2 bg-surface-sunken text-content rounded-lg"
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

