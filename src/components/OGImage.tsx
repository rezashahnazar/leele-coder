import React from "react";

export function OGImage() {
  return (
    <div className="w-[1200px] h-[630px] bg-[#18181B] flex items-center justify-center p-16 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-purple-500/10" />

      {/* Content */}
      <div className="relative flex items-center gap-8">
        {/* Logo */}
        <div className="relative w-32 h-32 bg-[#27272A] rounded-2xl flex items-center justify-center">
          <div className="absolute left-[20%] top-[20%] bottom-[20%] w-3 bg-blue-500 rounded-full" />
          <div className="absolute left-[20%] bottom-[20%] right-[20%] h-3 bg-blue-500 rounded-full" />
          <div className="absolute right-[35%] top-[35%] w-[30%] h-2 bg-violet-500 rounded-full" />
          <div className="absolute right-[35%] bottom-[35%] w-[30%] h-2 bg-violet-500 rounded-full" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-start">
          <h1 className="text-7xl font-bold text-white tracking-tight">
            LeelE Coder
          </h1>
          <p className="text-2xl text-gray-400 mt-4">
            A Magical Code Editor for React Components
          </p>
          <div className="flex items-center gap-3 mt-8 text-gray-500">
            <span>by Reza Shahnazar</span>
            <span>•</span>
            <span>leele.vercel.app</span>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-12 right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-12 left-12 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
    </div>
  );
}
