import { useState, useEffect } from "react";
import { CheckCircleIcon, AlertCircleIcon, StarIcon, UserIcon, BriefcaseIcon, HeartIcon, GlobeIcon } from "lucide-react";

const ProfileCompletenessIndicator = ({ profile, onComplete }) => {
  const [completeness, setCompleteness] = useState(0);
  const [missingFields, setMissingFields] = useState([]);
  const [completedSections, setCompletedSections] = useState([]);

  useEffect(() => {
    if (profile) {
      calculateCompleteness();
    }
  }, [profile]);

  const calculateCompleteness = () => {
    const requiredFields = [
      { key: 'fullName', label: 'Full Name', weight: 3 },
      { key: 'email', label: 'Email', weight: 3 },
    ];

    const optionalFields = [
      { key: 'bio', label: 'Bio', weight: 2 },
      { key: 'profilePic', label: 'Profile Picture', weight: 2 },
      { key: 'location', label: 'Location', weight: 1 },
      { key: 'phone', label: 'Phone', weight: 1 },
      { key: 'website', label: 'Website', weight: 1 },
      { key: 'jobTitle', label: 'Job Title', weight: 1 },
      { key: 'company', label: 'Company', weight: 1 },
      { key: 'skills', label: 'Skills', weight: 2, isArray: true },
      { key: 'interests', label: 'Interests', weight: 1, isArray: true },
      { key: 'socialMedia', label: 'Social Media', weight: 1, isObject: true },
    ];

    let totalWeight = 0;
    let completedWeight = 0;
    const missing = [];
    const completed = [];

    // Check required fields
    requiredFields.forEach(field => {
      totalWeight += field.weight;
      const isCompleted = checkFieldCompletion(profile[field.key], field);
      if (isCompleted) {
        completedWeight += field.weight;
        completed.push(field);
      } else {
        missing.push(field);
      }
    });

    // Check optional fields
    optionalFields.forEach(field => {
      totalWeight += field.weight;
      const isCompleted = checkFieldCompletion(profile[field.key], field);
      if (isCompleted) {
        completedWeight += field.weight;
        completed.push(field);
      } else {
        missing.push(field);
      }
    });

    const percentage = Math.round((completedWeight / totalWeight) * 100);
    setCompleteness(percentage);
    setMissingFields(missing);
    setCompletedSections(completed);

    // Call onComplete callback if profile is 100% complete
    if (percentage === 100 && onComplete) {
      onComplete();
    }
  };

  const checkFieldCompletion = (value, field) => {
    if (field.isArray) {
      return Array.isArray(value) && value.length > 0;
    }
    if (field.isObject) {
      return value && Object.values(value).some(v => v && v.trim());
    }
    return value && value.toString().trim().length > 0;
  };

  const getCompletenessColor = (percentage) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getCompletenessBarColor = (percentage) => {
    if (percentage >= 90) return 'from-green-500 to-emerald-500';
    if (percentage >= 70) return 'from-yellow-500 to-orange-500';
    if (percentage >= 50) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getSectionIcon = (fieldKey) => {
    switch (fieldKey) {
      case 'fullName':
      case 'email':
        return <UserIcon className="w-4 h-4" />;
      case 'bio':
      case 'profilePic':
        return <StarIcon className="w-4 h-4" />;
      case 'jobTitle':
      case 'company':
        return <BriefcaseIcon className="w-4 h-4" />;
      case 'skills':
      case 'interests':
        return <HeartIcon className="w-4 h-4" />;
      case 'socialMedia':
        return <GlobeIcon className="w-4 h-4" />;
      default:
        return <CheckCircleIcon className="w-4 h-4" />;
    }
  };

  if (!profile) return null;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <StarIcon className="w-5 h-5 text-cyan-400" />
          Profile Completeness
        </h3>
        <span className={`text-2xl font-bold ${getCompletenessColor(completeness)}`}>
          {completeness}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="bg-slate-700 rounded-full h-3 mb-2">
          <div 
            className={`bg-gradient-to-r ${getCompletenessBarColor(completeness)} h-full rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${completeness}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-slate-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Status Message */}
      <div className="mb-6">
        {completeness === 100 ? (
          <div className="flex items-center gap-2 text-green-400 bg-green-900/20 p-3 rounded-lg border border-green-500/30">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-medium">Profile Complete! 🎉</span>
          </div>
        ) : completeness >= 80 ? (
          <div className="flex items-center gap-2 text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
            <AlertCircleIcon className="w-5 h-5" />
            <span>Almost there! Just a few more details to complete your profile.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-orange-400 bg-orange-900/20 p-3 rounded-lg border border-orange-500/30">
            <AlertCircleIcon className="w-5 h-5" />
            <span>Complete your profile to make a great first impression!</span>
          </div>
        )}
      </div>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-slate-300 font-medium">Complete these sections:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {missingFields.slice(0, 6).map((field) => (
              <div key={field.key} className="flex items-center gap-2 text-slate-400 text-sm">
                <AlertCircleIcon className="w-4 h-4 text-orange-400" />
                {field.label}
              </div>
            ))}
            {missingFields.length > 6 && (
              <div className="text-slate-500 text-sm">
                +{missingFields.length - 6} more...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed Sections */}
      {completedSections.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-slate-300 font-medium">Completed sections:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {completedSections.slice(0, 8).map((field) => (
              <div key={field.key} className="flex items-center gap-2 text-slate-400 text-sm">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                {field.label}
              </div>
            ))}
            {completedSections.length > 8 && (
              <div className="text-slate-500 text-sm">
                +{completedSections.length - 8} more...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      {completeness < 100 && (
        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
          <h4 className="text-slate-300 font-medium mb-2">💡 Tips to improve your profile:</h4>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Add a professional profile picture</li>
            <li>• Write a compelling bio that describes who you are</li>
            <li>• Include your current job title and company</li>
            <li>• Add skills that showcase your expertise</li>
            <li>• Share your social media profiles</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletenessIndicator;

