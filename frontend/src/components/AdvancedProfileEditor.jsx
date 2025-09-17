import { useState } from "react";
import { XIcon, SaveIcon, BriefcaseIcon, GraduationCapIcon, StarIcon, HeartIcon, GlobeIcon, MapPinIcon, ClockIcon } from "lucide-react";
import { useProfileStore } from "../store/useProfileStore";
import { ValidatedInput } from "./ProfileValidation";
import toast from "react-hot-toast";

const AdvancedProfileEditor = ({ isOpen, onClose, initialData = {} }) => {
  const { updateProfile, isUpdatingProfile } = useProfileStore();
  
  const [formData, setFormData] = useState({
    jobTitle: initialData.jobTitle || "",
    company: initialData.company || "",
    industry: initialData.industry || "",
    experience: initialData.experience || "",
    education: initialData.education || {},
    skills: initialData.skills || [],
    interests: initialData.interests || [],
    languages: initialData.languages || [],
    socialMedia: initialData.socialMedia || {},
    contactInfo: initialData.contactInfo || {},
    customStatus: initialData.customStatus || {},
    timezone: initialData.timezone || "UTC",
    workingHours: initialData.workingHours || { enabled: false, start: "09:00", end: "17:00", days: [] }
  });

  const [activeTab, setActiveTab] = useState("professional");

  const tabs = [
    { id: "professional", label: "Professional", icon: BriefcaseIcon },
    { id: "education", label: "Education", icon: GraduationCapIcon },
    { id: "skills", label: "Skills", icon: StarIcon },
    { id: "interests", label: "Interests", icon: HeartIcon },
    { id: "social", label: "Social", icon: GlobeIcon },
    { id: "contact", label: "Contact", icon: MapPinIcon },
    { id: "availability", label: "Availability", icon: ClockIcon },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      onClose();
      toast.success("Advanced profile updated successfully!");
    } catch (error) {
      console.error("Error updating advanced profile:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-200">Advanced Profile Editor</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <XIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Professional Tab */}
            {activeTab === "professional" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-200">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                    placeholder="Job Title"
                    validationType="name"
                  />
                  <ValidatedInput
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Company"
                    validationType="name"
                  />
                </div>
              </div>
            )}

            {/* Add other tab contents as needed */}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
            >
              <SaveIcon className="w-4 h-4 mr-2 inline" />
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedProfileEditor;