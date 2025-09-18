import { useState, useEffect } from "react";
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
    education: initialData.education || { degree: "", institution: "", fieldOfStudy: "", graduationYear: "" },
    skills: initialData.skills || [],
    interests: initialData.interests || [],
    languages: initialData.languages || [],
    socialMedia: initialData.socialMedia || { linkedin: "", twitter: "", github: "", instagram: "", portfolio: "" },
    contactInfo: initialData.contactInfo || { alternateEmail: "", telegram: "", discord: "", skype: "" },
    customStatus: initialData.customStatus || {},
    timezone: initialData.timezone || "UTC",
    workingHours: initialData.workingHours || { enabled: false, start: "09:00", end: "17:00", days: [] }
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        jobTitle: initialData.jobTitle || "",
        company: initialData.company || "",
        industry: initialData.industry || "",
        experience: initialData.experience || "",
        education: initialData.education || { degree: "", institution: "", fieldOfStudy: "", graduationYear: "" },
        skills: initialData.skills || [],
        interests: initialData.interests || [],
        languages: initialData.languages || [],
        socialMedia: initialData.socialMedia || { linkedin: "", twitter: "", github: "", instagram: "", portfolio: "" },
        contactInfo: initialData.contactInfo || { alternateEmail: "", telegram: "", discord: "", skype: "" },
        customStatus: initialData.customStatus || {},
        timezone: initialData.timezone || "UTC",
        workingHours: initialData.workingHours || { enabled: false, start: "09:00", end: "17:00", days: [] }
      });
    }
  }, [initialData, isOpen]);

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
                  <ValidatedInput
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    placeholder="Industry"
                    validationType="name"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Experience Level</label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="">Select Experience</option>
                      <option value="entry">Entry Level</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-200">Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    type="text"
                    value={formData.education.degree || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      education: {...formData.education, degree: e.target.value}
                    })}
                    placeholder="Degree"
                    validationType="name"
                  />
                  <ValidatedInput
                    type="text"
                    value={formData.education.institution || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      education: {...formData.education, institution: e.target.value}
                    })}
                    placeholder="Institution"
                    validationType="name"
                  />
                  <ValidatedInput
                    type="text"
                    value={formData.education.fieldOfStudy || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      education: {...formData.education, fieldOfStudy: e.target.value}
                    })}
                    placeholder="Field of Study"
                    validationType="name"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Graduation Year</label>
                    <input
                      type="number"
                      value={formData.education.graduationYear || ""}
                      onChange={(e) => setFormData({
                        ...formData, 
                        education: {...formData.education, graduationYear: parseInt(e.target.value) || ""}
                      })}
                      min="1950"
                      max={new Date().getFullYear() + 10}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                      placeholder="Year"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-200">Skills</h3>
                <div className="space-y-4">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={skill.name || ""}
                        onChange={(e) => {
                          const newSkills = [...formData.skills];
                          newSkills[index] = {...skill, name: e.target.value};
                          setFormData({...formData, skills: newSkills});
                        }}
                        placeholder="Skill name"
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                      />
                      <select
                        value={skill.level || "beginner"}
                        onChange={(e) => {
                          const newSkills = [...formData.skills];
                          newSkills[index] = {...skill, level: e.target.value};
                          setFormData({...formData, skills: newSkills});
                        }}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const newSkills = formData.skills.filter((_, i) => i !== index);
                          setFormData({...formData, skills: newSkills});
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData, 
                        skills: [...formData.skills, { name: "", level: "beginner", verified: false }]
                      });
                    }}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Add Skill
                  </button>
                </div>
              </div>
            )}

            {/* Interests Tab */}
            {activeTab === "interests" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-200">Interests</h3>
                <div className="space-y-4">
                  {formData.interests.map((interest, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={interest}
                        onChange={(e) => {
                          const newInterests = [...formData.interests];
                          newInterests[index] = e.target.value;
                          setFormData({...formData, interests: newInterests});
                        }}
                        placeholder="Interest"
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newInterests = formData.interests.filter((_, i) => i !== index);
                          setFormData({...formData, interests: newInterests});
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData, 
                        interests: [...formData.interests, ""]
                      });
                    }}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Add Interest
                  </button>
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === "social" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-200">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    type="url"
                    value={formData.socialMedia.linkedin || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialMedia: {...formData.socialMedia, linkedin: e.target.value}
                    })}
                    placeholder="LinkedIn URL"
                    validationType="website"
                  />
                  <ValidatedInput
                    type="url"
                    value={formData.socialMedia.twitter || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialMedia: {...formData.socialMedia, twitter: e.target.value}
                    })}
                    placeholder="Twitter URL"
                    validationType="website"
                  />
                  <ValidatedInput
                    type="url"
                    value={formData.socialMedia.github || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialMedia: {...formData.socialMedia, github: e.target.value}
                    })}
                    placeholder="GitHub URL"
                    validationType="website"
                  />
                  <ValidatedInput
                    type="url"
                    value={formData.socialMedia.instagram || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialMedia: {...formData.socialMedia, instagram: e.target.value}
                    })}
                    placeholder="Instagram URL"
                    validationType="website"
                  />
                  <ValidatedInput
                    type="url"
                    value={formData.socialMedia.portfolio || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialMedia: {...formData.socialMedia, portfolio: e.target.value}
                    })}
                    placeholder="Portfolio URL"
                    validationType="website"
                  />
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === "contact" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-200">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    type="email"
                    value={formData.contactInfo.alternateEmail || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      contactInfo: {...formData.contactInfo, alternateEmail: e.target.value}
                    })}
                    placeholder="Alternate Email"
                    validationType="email"
                  />
                  <ValidatedInput
                    type="text"
                    value={formData.contactInfo.telegram || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      contactInfo: {...formData.contactInfo, telegram: e.target.value}
                    })}
                    placeholder="Telegram"
                    validationType="name"
                  />
                  <ValidatedInput
                    type="text"
                    value={formData.contactInfo.discord || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      contactInfo: {...formData.contactInfo, discord: e.target.value}
                    })}
                    placeholder="Discord"
                    validationType="name"
                  />
                  <ValidatedInput
                    type="text"
                    value={formData.contactInfo.skype || ""}
                    onChange={(e) => setFormData({
                      ...formData, 
                      contactInfo: {...formData.contactInfo, skype: e.target.value}
                    })}
                    placeholder="Skype"
                    validationType="name"
                  />
                </div>
              </div>
            )}

            {/* Availability Tab */}
            {activeTab === "availability" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-200">Availability Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="workingHoursEnabled"
                      checked={formData.workingHours.enabled}
                      onChange={(e) => setFormData({
                        ...formData, 
                        workingHours: {...formData.workingHours, enabled: e.target.checked}
                      })}
                      className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="workingHoursEnabled" className="text-slate-200">
                      Enable working hours
                    </label>
                  </div>
                  
                  {formData.workingHours.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={formData.workingHours.start}
                          onChange={(e) => setFormData({
                            ...formData, 
                            workingHours: {...formData.workingHours, start: e.target.value}
                          })}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
                        <input
                          type="time"
                          value={formData.workingHours.end}
                          onChange={(e) => setFormData({
                            ...formData, 
                            workingHours: {...formData.workingHours, end: e.target.value}
                          })}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                      <option value="Asia/Shanghai">Shanghai</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
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