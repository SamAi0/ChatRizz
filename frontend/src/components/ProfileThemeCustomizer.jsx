import { useState } from "react";
import { PaletteIcon, SaveIcon, RefreshCwIcon } from "lucide-react";
import { useProfileStore } from "../store/useProfileStore";
import toast from "react-hot-toast";

const ProfileThemeCustomizer = ({ isOpen, onClose, currentTheme = {} }) => {
  const { updateProfileTheme } = useProfileStore();
  
  const [theme, setTheme] = useState({
    backgroundColor: currentTheme.backgroundColor || "#0f172a",
    accentColor: currentTheme.accentColor || "#06b6d4",
    layout: currentTheme.layout || "modern",
    fontStyle: currentTheme.fontStyle || "default"
  });

  const presetThemes = [
    { name: "Ocean", backgroundColor: "#0c4a6e", accentColor: "#0891b2" },
    { name: "Forest", backgroundColor: "#14532d", accentColor: "#16a34a" },
    { name: "Sunset", backgroundColor: "#7c2d12", accentColor: "#ea580c" },
    { name: "Purple", backgroundColor: "#581c87", accentColor: "#a855f7" },
    { name: "Rose", backgroundColor: "#881337", accentColor: "#e11d48" }
  ];

  const layouts = [
    { value: "modern", label: "Modern" },
    { value: "classic", label: "Classic" },
    { value: "minimal", label: "Minimal" },
    { value: "creative", label: "Creative" }
  ];

  const fontStyles = [
    { value: "default", label: "Default" },
    { value: "serif", label: "Serif" },
    { value: "mono", label: "Monospace" },
    { value: "rounded", label: "Rounded" }
  ];

  const handleSave = async () => {
    try {
      await updateProfileTheme(theme);
      onClose();
      toast.success("Profile theme updated successfully!");
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <PaletteIcon className="w-5 h-5" />
            Theme Customizer
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Color Customization */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200">Colors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({...theme, backgroundColor: e.target.value})}
                    className="w-12 h-10 rounded border border-slate-600"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({...theme, backgroundColor: e.target.value})}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => setTheme({...theme, accentColor: e.target.value})}
                    className="w-12 h-10 rounded border border-slate-600"
                  />
                  <input
                    type="text"
                    value={theme.accentColor}
                    onChange={(e) => setTheme({...theme, accentColor: e.target.value})}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preset Themes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200">Preset Themes</h3>
            <div className="grid grid-cols-3 gap-3">
              {presetThemes.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setTheme({...theme, ...preset})}
                  className="p-3 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                  style={{ backgroundColor: preset.backgroundColor }}
                >
                  <div className="text-white font-medium mb-1">{preset.name}</div>
                  <div 
                    className="w-full h-2 rounded"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Layout and Font */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Layout Style</label>
              <select
                value={theme.layout}
                onChange={(e) => setTheme({...theme, layout: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
              >
                {layouts.map(layout => (
                  <option key={layout.value} value={layout.value}>{layout.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Font Style</label>
              <select
                value={theme.fontStyle}
                onChange={(e) => setTheme({...theme, fontStyle: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
              >
                {fontStyles.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200">Preview</h3>
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: theme.backgroundColor,
                borderColor: theme.accentColor 
              }}
            >
              <div className="text-white font-medium mb-2">Sample Profile Card</div>
              <div 
                className="w-full h-2 rounded mb-2"
                style={{ backgroundColor: theme.accentColor }}
              />
              <div className="text-gray-300 text-sm">This is how your profile theme will look</div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setTheme({ backgroundColor: "#0f172a", accentColor: "#06b6d4", layout: "modern", fontStyle: "default" })}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2 inline" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <SaveIcon className="w-4 h-4 mr-2 inline" />
            Save Theme
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileThemeCustomizer;