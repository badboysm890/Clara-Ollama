import React, { useState, useEffect } from 'react';
import { MessageSquare, Archive, Star, Trash2, Settings, ChevronRight, Bot } from 'lucide-react';
import type { Chat } from '../db';
import { db } from '../db';

interface AssistantSidebarProps {
  activeChat: string | null;
  onChatSelect: (id: string | null) => void;
  chats: Chat[];
  onOpenSettings: () => void;
}

const AssistantSidebar = ({ 
  activeChat, 
  onChatSelect, 
  chats, 
  onOpenSettings 
}: AssistantSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<{ chatId: string; type: 'star' | 'archive' | 'delete' } | null>(null);
  const [counts, setCounts] = useState({
    archived: 0,
    starred: 0,
    deleted: 0
  });
  // Add local state to track modified chats
  const [localChats, setLocalChats] = useState<Chat[]>([]);

  // Initialize local chats from props
  useEffect(() => {
    setLocalChats(chats || []);
  }, [chats]);

  useEffect(() => {
    const allChats = localChats || [];
    setCounts({
      archived: allChats.filter(chat => chat.is_archived && !chat.is_deleted).length,
      starred: allChats.filter(chat => chat.is_starred && !chat.is_deleted && !chat.is_archived).length,
      deleted: allChats.filter(chat => chat.is_deleted).length
    });
  }, [localChats]);

  const handleChatAction = async (chatId: string, action: 'archive' | 'star' | 'delete', e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionInProgress) return;
    
    setActionInProgress({ chatId, type: action });
    
    try {
      const chat = await db.getChat(chatId);
      if (!chat) return;

      const updates: Partial<Chat> = {};
      
      switch (action) {
        case 'archive':
          updates.is_archived = !chat.is_archived;
          if (updates.is_archived) {
            updates.is_starred = false;
          }
          break;
        case 'star':
          updates.is_starred = !chat.is_starred;
          if (chat.is_archived) {
            updates.is_archived = false;
          }
          break;
        case 'delete':
          updates.is_deleted = true;
          updates.is_starred = false;
          updates.is_archived = false;
          break;
      }

      await db.updateChat(chatId, updates);
      
      if (action === 'delete' && chatId === activeChat) {
        onChatSelect(null);
      }

      // Update local chats state
      setLocalChats(prevChats => 
        prevChats.map(c => 
          c.id === chatId ? {...c, ...updates} : c
        )
      );

      // Automatically show the relevant section if the action changes the chat's category
      if (action === 'star' && updates.is_starred === true) {
        setShowStarred(true);
      } else if (action === 'archive' && updates.is_archived === true) {
        setShowArchived(true);
      } else if (action === 'delete') {
        setShowDeleted(true);
      }
    } catch (error) {
      console.error('Error updating chat:', error);
    } finally {
      setTimeout(() => {
        setActionInProgress(null);
      }, 300);
    }
  };

  // Use localChats for filtering instead of chats from props
  const filteredChats = localChats.filter(chat => {
    if (showArchived) return chat.is_archived && !chat.is_deleted;
    if (showStarred) return chat.is_starred && !chat.is_deleted && !chat.is_archived;
    if (showDeleted) return chat.is_deleted;
    return !chat.is_archived && !chat.is_deleted && !chat.is_starred;
  });

  const renderBadge = (count: number) => {
    if (count === 0) return null;
    return (
      <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-sakura-100 dark:bg-sakura-100/10 text-sakura-500">
        {count}
      </span>
    );
  };

  const renderActionButton = (chatId: string, action: 'star' | 'archive' | 'delete', chat: Chat) => {
    const isInProgress = actionInProgress?.chatId === chatId && actionInProgress?.type === action;
    
    const getIcon = () => {
      if (isInProgress) return <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />;
      switch (action) {
        case 'star':
          return <Star className={`w-3 h-3 ${chat.is_starred ? 'text-yellow-400 fill-yellow-400' : ''}`} />;
        case 'archive':
          return <Archive className={`w-3 h-3 ${chat.is_archived ? 'text-blue-400' : ''}`} />;
        case 'delete':
          return <Trash2 className="w-3 h-3 text-red-400" />;
      }
    };

    return (
      <button
        onClick={(e) => handleChatAction(chatId, action, e)}
        className={`p-1 rounded transition-all transform ${
          isInProgress ? 'scale-110' : 'hover:scale-110'
        } ${
          action === 'delete' 
            ? 'hover:bg-red-100 dark:hover:bg-red-900/20' 
            : 'hover:bg-sakura-100 dark:hover:bg-sakura-100/10'
        }`}
        title={
          action === 'star' ? (chat.is_starred ? 'Unstar' : 'Star') :
          action === 'archive' ? (chat.is_archived ? 'Unarchive' : 'Archive') :
          'Delete'
        }
        disabled={isInProgress}
      >
        {getIcon()}
      </button>
    );
  };

  const menuItems = [
    { icon: Star, label: 'Starred', onClick: () => setShowStarred(!showStarred), active: showStarred, count: counts.starred },
    { icon: Archive, label: 'Archived', onClick: () => setShowArchived(!showArchived), active: showArchived, count: counts.archived },
    { icon: Trash2, label: 'Trash', onClick: () => setShowDeleted(!showDeleted), active: showDeleted, count: counts.deleted },
    { icon: Settings, label: 'Settings', onClick: onOpenSettings }
  ];

  return (
    <div
      className={`glassmorphic h-full flex flex-col gap-6 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`flex items-center py-4 ${
        isExpanded ? 'px-4 justify-start gap-3' : 'justify-center'
      }`}>
        <Bot className="w-8 h-8 text-sakura-500 flex-shrink-0" />
        <h1 
          className={`text-2xl font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
          }`}
        >
          Clara
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredChats.length > 0 ? (
          <div className="px-2 space-y-0.5">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full flex items-center gap-2 py-2 rounded-lg transition-colors group relative cursor-pointer ${
                  isExpanded ? 'px-3' : 'justify-center px-0'
                } ${
                  activeChat === chat.id
                    ? 'bg-sakura-100 text-sakura-500 dark:bg-sakura-100/10'
                    : isExpanded 
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-sakura-50 dark:hover:bg-sakura-100/5'
                      : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <MessageSquare className="w-5 h-5 flex-shrink-0" />
                {isExpanded && (
                  <div className="flex-1 text-left overflow-hidden min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {chat.title}
                      </span>
                      {chat.is_starred && (
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(chat.updated_at).toLocaleDateString()}
                        {chat.is_archived && (
                          <Archive className="w-3 h-3 text-blue-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderActionButton(chat.id, 'star', chat)}
                        {renderActionButton(chat.id, 'archive', chat)}
                        {renderActionButton(chat.id, 'delete', chat)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          isExpanded && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-6 h-6 mb-2 opacity-50" />
              <p className="text-sm">
                {showArchived ? 'No archived chats' :
                 showStarred ? 'No starred chats' :
                 showDeleted ? 'No deleted chats' :
                 'No chats yet. Start a new conversation!'}
              </p>
            </div>
          )
        )}
      </div>

      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
        <nav className="space-y-0.5">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center rounded-lg transition-colors ${
                isExpanded ? 'px-3 py-2 justify-start gap-2' : 'h-10 justify-center px-0'
              } ${
                item.active
                  ? 'bg-sakura-100 text-sakura-500 dark:bg-sakura-100/10'
                  : isExpanded
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-sakura-50 dark:hover:bg-sakura-100/5'
                    : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <>
                  <span className="text-sm">{item.label}</span>
                  {renderBadge(item.count || 0)}
                </>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div 
        className={`absolute top-1/2 -right-3 transform -translate-y-1/2 transition-transform duration-300 ${
          isExpanded ? 'rotate-180' : ''
        }`}
      >
        <div className="bg-sakura-500 rounded-full p-1 shadow-lg cursor-pointer">
          <ChevronRight className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
};

export default AssistantSidebar;