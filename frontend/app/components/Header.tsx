"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={"/"}>
            <h1 className="text-xl font-bold text-gray-900">Stock Tracker</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <SearchBar/>
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 ml-2 border-l pl-4 border-gray-200">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 