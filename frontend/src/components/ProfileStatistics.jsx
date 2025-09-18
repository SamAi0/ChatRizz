import { useState, useEffect } from "react";
import { 
  MessageCircleIcon, 
  CalendarIcon, 
  StarIcon, 
  UsersIcon, 
  ActivityIcon,
  TrendingUpIcon,
  AwardIcon,
  ClockIcon
} from "lucide-react";

const ProfileStatistics = ({ profile, profileStats }) => {
  const [stats, setStats] = useState({
    messageCount: 0,
    daysSinceJoined: 0,
    profileCompleteness: 0,
    skillsCount: 0,
    interestsCount: 0,
    socialLinksCount: 0,
    galleryCount: 0,
    badgesCount: 0,
    isVerified: false,
    lastActive: null,
    memberSince: null
  });

  useEffect(() => {
    if (profile && profileStats) {
      calculateStats();
    }
  }, [profile, profileStats]);

  const calculateStats = () => {
    const newStats = {
      messageCount: profileStats.messageCount || 0,
      daysSinceJoined: profileStats.daysSinceJoined || 0,
      profileCompleteness: profile.isProfileComplete ? 100 : calculateCompleteness(),
      skillsCount: profile.skills?.length || 0,
      interestsCount: profile.interests?.length || 0,
      socialLinksCount: profile.socialMedia ? Object.values(profile.socialMedia).filter(link => link && link.trim()).length : 0,
      galleryCount: profile.profileGallery?.length || 0,
      badgesCount: profile.verification?.badges?.length || 0,
      isVerified: profile.verification?.isVerified || false,
      lastActive: profile.lastActiveAt,
      memberSince: profile.createdAt
    };
    setStats(newStats);
  };

  const calculateCompleteness = () => {
    if (!profile) return 0;
    const requiredFields = ['fullName', 'email'];
    const optionalFields = ['bio', 'profilePic', 'location', 'phone', 'website', 'jobTitle', 'company'];
    
    const completedRequired = requiredFields.filter(field => profile[field] && profile[field].trim()).length;
    const completedOptional = optionalFields.filter(field => {
      if (field === 'profilePic') return profile[field] && profile[field].trim();
      return profile[field] && profile[field].trim();
    }).length;
    
    const totalRequired = requiredFields.length;
    const totalOptional = optionalFields.length;
    
    return Math.round(((completedRequired * 2 + completedOptional) / (totalRequired * 2 + totalOptional)) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Never";
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y ago`;
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

  if (!profile) return null;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
        <TrendingUpIcon className="w-5 h-5 text-cyan-400" />
        Profile Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Messages */}
        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
          <MessageCircleIcon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-200">{stats.messageCount}</div>
          <div className="text-sm text-slate-400">Messages</div>
        </div>

        {/* Days Active */}
        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
          <CalendarIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-200">{stats.daysSinceJoined}</div>
          <div className="text-sm text-slate-400">Days Active</div>
        </div>

        {/* Skills */}
        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
          <StarIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-200">{stats.skillsCount}</div>
          <div className="text-sm text-slate-400">Skills</div>
        </div>

        {/* Social Links */}
        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
          <UsersIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-200">{stats.socialLinksCount}</div>
          <div className="text-sm text-slate-400">Social Links</div>
        </div>
      </div>

      {/* Profile Completeness */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-300 font-medium">Profile Completeness</span>
          <span className={`font-bold ${getCompletenessColor(stats.profileCompleteness)}`}>
            {stats.profileCompleteness}%
          </span>
        </div>
        <div className="bg-slate-700 rounded-full h-2">
          <div 
            className={`bg-gradient-to-r ${getCompletenessBarColor(stats.profileCompleteness)} h-full rounded-full transition-all duration-500`}
            style={{ width: `${stats.profileCompleteness}%` }}
          />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Interests</span>
            <span className="text-slate-200 font-medium">{stats.interestsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Gallery Images</span>
            <span className="text-slate-200 font-medium">{stats.galleryCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Badges</span>
            <span className="text-slate-200 font-medium">{stats.badgesCount}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Member Since</span>
            <span className="text-slate-200 font-medium">{formatDate(stats.memberSince)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Last Active</span>
            <span className="text-slate-200 font-medium">{formatTimeAgo(stats.lastActive)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Verification</span>
            <div className="flex items-center gap-1">
              {stats.isVerified ? (
                <>
                  <AwardIcon className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">Verified</span>
                </>
              ) : (
                <span className="text-slate-500 text-sm">Not verified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Level Indicator */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <ActivityIcon className="w-5 h-5 text-cyan-400" />
          <span className="text-slate-300 font-medium">Activity Level</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-600 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, (stats.messageCount / 100) * 100)}%` 
              }}
            />
          </div>
          <span className="text-slate-400 text-sm">
            {stats.messageCount > 1000 ? 'Very Active' : 
             stats.messageCount > 500 ? 'Active' : 
             stats.messageCount > 100 ? 'Moderate' : 'New User'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileStatistics;
