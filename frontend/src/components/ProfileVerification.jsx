import { useState } from "react";
import { 
  ShieldCheckIcon, 
  AwardIcon, 
  StarIcon, 
  CheckCircleIcon, 
  ClockIcon,
  MailIcon,
  PhoneIcon,
  IdCardIcon,
  BriefcaseIcon,
  PlusIcon
} from "lucide-react";
import { useProfileStore } from "../store/useProfileStore";
import toast from "react-hot-toast";

const ProfileVerification = ({ profile, isOwnProfile = false }) => {
  const { addVerificationBadge } = useProfileStore();
  const [showAddBadge, setShowAddBadge] = useState(false);
  const [newBadgeType, setNewBadgeType] = useState("");
  const [newBadgeDescription, setNewBadgeDescription] = useState("");

  const verificationLevels = [
    {
      level: "email",
      name: "Email Verified",
      description: "Email address has been verified",
      icon: MailIcon,
      color: "text-blue-400",
      bgColor: "bg-blue-400/20",
      borderColor: "border-blue-400/30",
      isCompleted: profile?.verification?.isVerified || false
    },
    {
      level: "phone",
      name: "Phone Verified",
      description: "Phone number has been verified",
      icon: PhoneIcon,
      color: "text-green-400",
      bgColor: "bg-green-400/20",
      borderColor: "border-green-400/30",
      isCompleted: profile?.verification?.verificationLevel === "phone"
    },
    {
      level: "id",
      name: "ID Verified",
      description: "Government ID has been verified",
      icon: IdCardIcon,
      color: "text-purple-400",
      bgColor: "bg-purple-400/20",
      borderColor: "border-purple-400/30",
      isCompleted: profile?.verification?.verificationLevel === "id"
    },
    {
      level: "professional",
      name: "Professional Verified",
      description: "Professional credentials verified",
      icon: BriefcaseIcon,
      color: "text-orange-400",
      bgColor: "bg-orange-400/20",
      borderColor: "border-orange-400/30",
      isCompleted: profile?.verification?.verificationLevel === "professional"
    }
  ];

  const availableBadges = [
    { type: "verified", name: "Verified User", description: "Email verified user" },
    { type: "professional", name: "Professional", description: "Professional in their field" },
    { type: "influencer", name: "Influencer", description: "Social media influencer" },
    { type: "developer", name: "Developer", description: "Software developer" },
    { type: "contributor", name: "Contributor", description: "Active contributor" },
    { type: "beta_tester", name: "Beta Tester", description: "Beta testing participant" }
  ];

  const handleAddBadge = async () => {
    if (!newBadgeType) {
      toast.error("Please select a badge type");
      return;
    }

    try {
      await addVerificationBadge(newBadgeType, newBadgeDescription);
      setNewBadgeType("");
      setNewBadgeDescription("");
      setShowAddBadge(false);
    } catch (error) {
      console.error("Error adding badge:", error);
    }
  };

  const getVerificationProgress = () => {
    if (!profile) return 0;
    const completed = verificationLevels.filter(level => level.isCompleted).length;
    return Math.round((completed / verificationLevels.length) * 100);
  };

  const getVerificationStatus = () => {
    const progress = getVerificationProgress();
    if (progress === 100) return { status: "Fully Verified", color: "text-green-400" };
    if (progress >= 75) return { status: "Highly Verified", color: "text-blue-400" };
    if (progress >= 50) return { status: "Partially Verified", color: "text-yellow-400" };
    if (progress >= 25) return { status: "Minimally Verified", color: "text-orange-400" };
    return { status: "Unverified", color: "text-red-400" };
  };

  if (!profile) return null;

  const verificationStatus = getVerificationStatus();
  const progress = getVerificationProgress();

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-cyan-400" />
          Verification Status
        </h3>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${verificationStatus.color}`}>
            {verificationStatus.status}
          </span>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Verification Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm">Verification Progress</span>
          <span className="text-slate-200 font-medium">{progress}%</span>
        </div>
        <div className="bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-green-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Verification Levels */}
      <div className="space-y-3 mb-6">
        {verificationLevels.map((level) => {
          const Icon = level.icon;
          return (
            <div 
              key={level.level}
              className={`p-4 rounded-lg border ${level.bgColor} ${level.borderColor} ${
                level.isCompleted ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${level.bgColor}`}>
                  <Icon className={`w-5 h-5 ${level.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-slate-200 font-medium">{level.name}</h4>
                    {level.isCompleted && (
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">{level.description}</p>
                </div>
                <div className="text-right">
                  {level.isCompleted ? (
                    <span className="text-green-400 text-sm font-medium">Verified</span>
                  ) : (
                    <span className="text-slate-500 text-sm">Not verified</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-slate-200 font-medium flex items-center gap-2">
            <AwardIcon className="w-4 h-4 text-yellow-400" />
            Badges ({profile.verification?.badges?.length || 0})
          </h4>
          {isOwnProfile && (
            <button
              onClick={() => setShowAddBadge(true)}
              className="px-3 py-1 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm flex items-center gap-1"
            >
              <PlusIcon className="w-3 h-3" />
              Add Badge
            </button>
          )}
        </div>

        {profile.verification?.badges?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.verification.badges.map((badge, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full text-yellow-400 text-sm font-medium"
              >
                {badge.type.charAt(0).toUpperCase() + badge.type.slice(1).replace('_', ' ')}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500">
            <AwardIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No badges yet</p>
          </div>
        )}
      </div>

      {/* Add Badge Modal */}
      {showAddBadge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Add Verification Badge</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Badge Type</label>
                <select
                  value={newBadgeType}
                  onChange={(e) => setNewBadgeType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Select a badge type</option>
                  {availableBadges.map((badge) => (
                    <option key={badge.type} value={badge.type}>
                      {badge.name} - {badge.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                <textarea
                  value={newBadgeDescription}
                  onChange={(e) => setNewBadgeDescription(e.target.value)}
                  placeholder="Add a description for this badge..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddBadge(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBadge}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Add Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Tips */}
      {!isOwnProfile && progress < 100 && (
        <div className="p-4 bg-slate-700/30 rounded-lg">
          <h4 className="text-slate-300 font-medium mb-2">💡 Verification Tips</h4>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Verify your email address for basic verification</li>
            <li>• Add and verify your phone number for enhanced security</li>
            <li>• Upload a government ID for identity verification</li>
            <li>• Provide professional credentials for professional verification</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileVerification;
