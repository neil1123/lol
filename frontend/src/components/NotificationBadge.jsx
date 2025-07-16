import React from 'react';

const NotificationBadge = ({ count, className = '' }) => {
  if (!count || count === 0) return null;
  
  return (
    <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;