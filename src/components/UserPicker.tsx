/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, UserRole } from "../types.js";
import { Shield, User as UserIcon, Check } from "lucide-react";

interface UserPickerProps {
  users: User[];
  activeUser: User | null;
  onSelectUser: (user: User) => void;
}

export default function UserPicker({ users, activeUser, onSelectUser }: UserPickerProps) {
  return (
    <div className="flex items-center gap-2 bg-[#121A2B]/80 backdrop-blur border border-slate-800 p-1.5 rounded-full" id="user-picker-container">
      <span className="text-xs font-medium text-slate-400 px-3 hidden sm:inline" id="user-role-label">VAI TRÒ:</span>
      <div className="flex gap-1" id="user-list">
        {users.map((user) => {
          const isActive = activeUser?.id === user.id;
          return (
            <button
              key={user.id}
              id={`user-select-btn-${user.id}`}
              onClick={() => onSelectUser(user)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-4 h-4 rounded-full"
                referrerPolicy="no-referrer"
                id={`user-avatar-${user.id}`}
              />
              <span id={`user-name-${user.id}`}>{user.name}</span>
              {user.role === UserRole.ADMIN ? (
                <Shield className="w-3.5 h-3.5" id={`admin-icon-${user.id}`} />
              ) : (
                <UserIcon className="w-3.5 h-3.5" id={`trader-icon-${user.id}`} />
              )}
              {isActive && <Check className="w-3 h-3 text-white ml-0.5" id={`active-check-${user.id}`} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
