"use client";

export default function LoadingSpinner({ 
  size = "md",
  color = "primary",
  className = "" 
}) {
  const sizeClasses = {
    sm: "h-4 w-4 border-[2px]",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-[4px]"
  };

  const colorClasses = {
    primary: "border-blue-500 border-r-transparent",
    white: "border-white border-r-transparent",
    dark: "border-gray-800 border-r-transparent"
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
      >
        <span className="sr-only">Yüklənir...</span>
      </div>
    </div>
  );
}