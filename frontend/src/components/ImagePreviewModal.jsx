import React from "react";

function ImagePreviewModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <img
        src={imageUrl}
        alt="Preview"
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute top-4 right-4 bg-slate-800 text-slate-200 px-3 py-1 rounded-md hover:bg-slate-700"
      >
        Close
      </button>
    </div>
  );
}

export default ImagePreviewModal;


