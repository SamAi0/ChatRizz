import { MessageCircleIcon, UsersIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab, chats, allContacts } = useChatStore();

  const tabs = [
    {
      id: "chats",
      label: "Chats",
      icon: MessageCircleIcon,
      count: chats?.length || 0
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: UsersIcon,
      count: allContacts?.length || 0
    }
  ];

  return (
    <div className="px-4 py-2 border-b border-slate-700/30">
      <div className="flex bg-slate-800/50 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                isActive
                  ? "bg-cyan-600 text-white shadow-md transform scale-[0.98]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-slate-600 text-slate-300"
                }`}>
                  {tab.count > 99 ? "99+" : tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default ActiveTabSwitch;
