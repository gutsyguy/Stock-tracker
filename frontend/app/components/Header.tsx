"use client";

import Link from "next/link";
import AuthButton from "./AuthButton";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={"/"}>
            <h1 className="text-xl font-bold text-gray-900">Stock Tracker</h1>
            </Link>
          </div>
          <div>
            <SearchBar/>
          </div>
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
} 