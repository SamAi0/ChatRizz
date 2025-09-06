function ProfileSettings({ user, setUser }) {
  try {
    const [profile, setProfile] = React.useState({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      preferredLanguage: user?.preferredLanguage || 'en'
    });
    const [saving, setSaving] = React.useState(false);

    const handleSave = async () => {
      setSaving(true);
      try {
        const updatedUser = await updateUserProfile(profile);
        setUser(updatedUser);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Update error:', error);
        alert('Failed to update profile');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-6" data-name="profile-settings" data-file="components/ProfileSettings.js">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Profile Settings</h1>
          <a
            href="index.html"
            className="flex items-center text-[var(--primary-color)] hover:underline"
          >
            <div className="icon-arrow-left mr-2"></div>
            Back to Chat
          </a>
        </div>

        <div className="setting-card">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Profile Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="setting-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="setting-input"
                disabled
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="setting-input"
                rows="3"
                placeholder="Tell others about yourself..."
              />
            </div>
          </div>
        </div>

        <LanguageSettings 
          preferredLanguage={profile.preferredLanguage}
          setPreferredLanguage={(lang) => setProfile({...profile, preferredLanguage: lang})}
        />

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProfileSettings component error:', error);
    return null;
  }
}