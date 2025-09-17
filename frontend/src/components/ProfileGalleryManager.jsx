import { useState } from "react";
import { XIcon, UploadIcon, TrashIcon, ImageIcon, PlusIcon } from "lucide-react";
import { useProfileStore } from "../store/useProfileStore";
import toast from "react-hot-toast";

const ProfileGalleryManager = ({ isOpen, onClose, gallery = [] }) => {
  const { updateProfileGallery, isUpdatingProfile } = useProfileStore();
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState([]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(files);

    try {
      const uploadedImages = [];
      
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB.`);
          continue;
        }

        // Convert to base64 for upload
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        uploadedImages.push({
          id: Date.now() + Math.random(),
          url: base64,
          name: file.name,
          uploadedAt: new Date().toISOString()
        });
      }

      const newGallery = [...gallery, ...uploadedImages];
      await updateProfileGallery(newGallery);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploadingImages([]);
    }
  };

  const handleDeleteImages = async () => {
    if (selectedImages.length === 0) return;

    const updatedGallery = gallery.filter(img => !selectedImages.includes(img.id));
    
    try {
      await updateProfileGallery(updatedGallery);
      setSelectedImages([]);
      toast.success(`${selectedImages.length} image(s) deleted successfully!`);
    } catch (error) {
      console.error("Error deleting images:", error);
      toast.error("Failed to delete images");
    }
  };

  const toggleImageSelection = (imageId) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Gallery Manager
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <XIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors cursor-pointer">
              <UploadIcon className="w-4 h-4 mr-2 inline" />
              Upload Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            
            {selectedImages.length > 0 && (
              <button
                onClick={handleDeleteImages}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-2 inline" />
                Delete Selected ({selectedImages.length})
              </button>
            )}
          </div>
          
          <div className="text-sm text-slate-400">
            {gallery.length} image(s) in gallery
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {gallery.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No images yet</h3>
              <p className="text-slate-400 mb-4">Upload some images to get started</p>
              <label className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors cursor-pointer">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((image) => (
                <div
                  key={image.id}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImages.includes(image.id) 
                      ? 'border-cyan-500' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="aspect-square">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleImageSelection(image.id)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedImages.includes(image.id)
                            ? 'bg-cyan-500 border-cyan-500'
                            : 'bg-transparent border-white'
                        }`}
                      >
                        {selectedImages.includes(image.id) && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Image info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-xs truncate">{image.name}</div>
                    <div className="text-xs text-gray-300">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Upload progress */}
          {uploadingImages.length > 0 && (
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
                <span className="text-slate-200">Uploading {uploadingImages.length} image(s)...</span>
              </div>
              <div className="space-y-1">
                {uploadingImages.map((file, index) => (
                  <div key={index} className="text-sm text-slate-400">
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileGalleryManager;