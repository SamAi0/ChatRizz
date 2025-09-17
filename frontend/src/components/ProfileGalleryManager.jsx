import { useState, useRef } from "react";
import { ImageIcon, PlusIcon, XIcon, EyeIcon, EyeOffIcon, TrashIcon } from "lucide-react";
import { useProfileStore } from "../store/useProfileStore";
import toast from "react-hot-toast";

const ProfileGalleryManager = ({ isOpen, onClose, gallery = [] }) => {
  const { addGalleryImage, removeGalleryImage } = useProfileStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    if (gallery.length >= 10) {
      toast.error("Gallery can contain maximum 10 images");
      return;
    }

    setIsUploading(true);
    try {
      const caption = prompt("Add a caption for this image (optional):");
      const isPublic = confirm("Make this image public?");
      await addGalleryImage(file, caption || "", isPublic);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (imageId) => {
    if (confirm("Are you sure you want to remove this image?")) {
      try {
        await removeGalleryImage(imageId);
      } catch (error) {
        console.error("Error removing image:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Profile Gallery
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading || gallery.length >= 10}
              className="w-full p-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-slate-500 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                {isUploading ? (
                  <div className="animate-spin mx-auto w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mb-4" />
                ) : (
                  <PlusIcon className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                )}
                <p className="text-slate-300">
                  {isUploading ? "Uploading..." : "Click to add new image"}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {gallery.length}/10 images ({10 - gallery.length} remaining)
                </p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Gallery Grid */}
          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((image, index) => (
                <div key={image._id || index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-700">
                    <img
                      src={image.url}
                      alt={image.caption || `Gallery image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <div className="absolute top-2 right-2 flex gap-2">
                      <div className="bg-slate-800 rounded-full p-1">
                        {image.isPublic ? (
                          <EyeIcon className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOffIcon className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveImage(image._id)}
                        className="bg-red-600 hover:bg-red-700 rounded-full p-1 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    
                    {image.caption && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-sm bg-black/70 rounded px-2 py-1 truncate">
                          {image.caption}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Date */}
                  <p className="text-slate-400 text-xs mt-1">
                    {new Date(image.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No images in your gallery yet</p>
              <p className="text-slate-500 text-sm">Upload your first image to get started</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileGalleryManager;