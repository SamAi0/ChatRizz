import React from "react";

const Logo = ({ size = "md", className = "", onClick, animated = false }) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  };

  const animationClasses = animated 
    ? "hover:scale-105 transition-transform duration-300" 
    : "";

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div 
      className={`flex items-center font-bold cursor-pointer select-none ${sizeClasses[size]} ${animationClasses} ${className}`}
      onClick={handleClick}
    >
      <span className="text-cyan-400">Chat</span>
      <span className="text-pink-500">Rizz</span>
    </div>
  );
};

export default Logo;