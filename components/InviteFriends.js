function InviteFriends({ user }) {
  try {
    const [emails, setEmails] = React.useState(['']);
    const [inviteLink, setInviteLink] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [invitationHistory, setInvitationHistory] = React.useState([]);
    const [pendingInvitations, setPendingInvitations] = React.useState([]);
    const [activeTab, setActiveTab] = React.useState('email');

    React.useEffect(() => {
      generateInviteLink();
      loadInvitationHistory();
      loadPendingInvitations();
    }, []);

    React.useEffect(() => {
      if (searchQuery.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, [searchQuery]);

    const generateInviteLink = () => {
      const baseUrl = window.location.origin;
      const referralCode = btoa(user.id).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
      const link = `${baseUrl}/auth.html?ref=${referralCode}&from=${encodeURIComponent(user.name)}`;
      setInviteLink(link);
    };

    const addEmailField = () => {
      setEmails([...emails, '']);
    };

    const removeEmailField = (index) => {
      if (emails.length > 1) {
        setEmails(emails.filter((_, i) => i !== index));
      }
    };

    const updateEmail = (index, value) => {
      const newEmails = [...emails];
      newEmails[index] = value;
      setEmails(newEmails);
    };

    const searchUsers = async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setSearchResults(data.users || []);
      } catch (error) {
        console.error('Search users error:', error);
        setSearchResults([]);
      }
    };

    const loadInvitationHistory = async () => {
      try {
        const response = await fetch('/api/invitations/history', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setInvitationHistory(data.invitations || []);
      } catch (error) {
        console.error('Load invitation history error:', error);
      }
    };

    const loadPendingInvitations = async () => {
      try {
        const response = await fetch('/api/invitations/pending', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setPendingInvitations(data.invitations || []);
      } catch (error) {
        console.error('Load pending invitations error:', error);
      }
    };

    const sendInvites = async () => {
      const validEmails = emails.filter(email => email.trim() && email.includes('@'));
      if (validEmails.length === 0) return;

      setLoading(true);
      try {
        // Try to send invitations via API
        await Promise.all(validEmails.map(email => 
          fetch('/api/invitations/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              email: email,
              inviteLink: inviteLink,
              message: message
            })
          })
        ));
        alert('Invitations sent successfully!');
        setEmails(['']);
        setMessage('');
        loadInvitationHistory();
      } catch (error) {
        console.log('API not available, simulating invitation send');
        // Simulate sending invitations when API is not available
        setTimeout(() => {
          alert(`Mock: Invitations would be sent to: ${validEmails.join(', ')}`);
          setEmails(['']);
          setMessage('');
        }, 1000);
      } finally {
        setLoading(false);
      }
    };

    const acceptInvitation = async (invitationId) => {
      try {
        const response = await fetch(`/api/invitations/accept/${invitationId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          alert('Invitation accepted! Chat created successfully.');
          loadPendingInvitations();
          // Redirect to chat
          window.location.href = `index.html?chat=${data.chatId}`;
        } else {
          alert('Failed to accept invitation: ' + data.error);
        }
      } catch (error) {
        console.error('Accept invitation error:', error);
        alert('Failed to accept invitation');
      }
    };

    const inviteUserToChat = async (userId, chatId) => {
      try {
        const response = await fetch('/api/invitations/invite-to-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            userId: userId,
            chatId: chatId,
            message: message
          })
        });
        const data = await response.json();
        
        if (data.success) {
          alert(`Successfully added ${data.addedUser.name} to the chat!`);
          setMessage('');
        } else {
          alert('Failed to invite user: ' + data.error);
        }
      } catch (error) {
        console.error('Invite user to chat error:', error);
        alert('Failed to invite user to chat');
      }
    };

    const copyToClipboard = () => {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl" data-name="invite-friends" data-file="components/InviteFriends.js">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Invite Friends</h1>
          <a
            href="index.html"
            className="flex items-center text-[var(--primary-color)] hover:underline"
          >
            <div className="icon-arrow-left mr-2"></div>
            Back to Chat
          </a>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'email' 
                ? 'bg-white text-[var(--primary-color)] shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email Invitations
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-white text-[var(--primary-color)] shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Invite Users
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pending' 
                ? 'bg-white text-[var(--primary-color)] shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({pendingInvitations.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-white text-[var(--primary-color)] shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History
          </button>
        </div>

        {/* Email Invitations Tab */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <div className="invite-card">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Send Email Invitations</h2>
          
              {/* Personal Message */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message to your invitation..."
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none"
                  rows="3"
                />
              </div>

              {emails.map((email, index) => (
                <div key={index} className="flex items-center space-x-3 mb-3">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                  {emails.length > 1 && (
                    <button
                      onClick={() => removeEmailField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <div className="icon-x text-lg"></div>
                    </button>
                  )}
                </div>
              ))}
          
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={addEmailField}
                  className="flex items-center text-[var(--primary-color)] hover:bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <div className="icon-plus mr-2"></div>
                  Add Another Email
                </button>
                
                <button
                  onClick={sendInvites}
                  disabled={loading || emails.every(e => !e.trim())}
                  className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Invites'}
                </button>
              </div>
            </div>

            {/* Share Link */}
            <div className="invite-card">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Share Invitation Link</h2>
          
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-50 border border-[var(--border-color)] rounded-lg"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-[var(--accent-color)] text-white px-4 py-3 rounded-lg hover:opacity-90"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              <div className="flex space-x-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Join me on ChatRizz! ${inviteLink}`)}`}
                  target="_blank"
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  <div className="icon-message-circle mr-2"></div>
                  WhatsApp
                </a>
                
                <a
                  href={`mailto:?subject=Join me on ChatRizz&body=Hi! I'd like to invite you to join ChatRizz, a modern chat app. Click here to sign up: ${inviteLink}`}
                  className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  <div className="icon-mail mr-2"></div>
                  Email
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Invite Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="invite-card">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Invite Existing Users</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Search Users
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-[var(--text-primary)]">Search Results</h3>
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            {user.is_online ? 'Online' : `Last seen: ${new Date(user.last_seen).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => inviteUserToChat(user.id, 'current-chat')}
                        className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:opacity-90 text-sm"
                      >
                        Invite to Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Invitations Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <div className="invite-card">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Pending Invitations</h2>
              
              {pendingInvitations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending invitations</p>
              ) : (
                <div className="space-y-3">
                  {pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-bold">
                          {invitation.inviter_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {invitation.inviter_name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-600">{invitation.email}</p>
                          {invitation.message && (
                            <p className="text-sm text-gray-500 italic">"{invitation.message}"</p>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(invitation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => acceptInvitation(invitation.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="invite-card">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Invitation History</h2>
              
              {invitationHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No invitations sent yet</p>
              ) : (
                <div className="space-y-3">
                  {invitationHistory.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          invitation.status === 'accepted' ? 'bg-green-500' : 
                          invitation.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{invitation.email}</p>
                          {invitation.message && (
                            <p className="text-sm text-gray-500 italic">"{invitation.message}"</p>
                          )}
                          <p className="text-xs text-gray-400">
                            Sent: {new Date(invitation.created_at).toLocaleDateString()}
                            {invitation.accepted_at && (
                              <span> • Accepted: {new Date(invitation.accepted_at).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invitation.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                        invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {invitation.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('InviteFriends component error:', error);
    return null;
  }
}