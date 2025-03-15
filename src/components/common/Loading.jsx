import React from 'react';

const Loading = ({ fullScreen = false }) => {
  const loadingContent = (
    <div className="flex flex-col items-center justify-center">
      <div className="text-4xl font-bold text-[#6B46C1]">
        P18
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {loadingContent}
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center">
      {loadingContent}
    </div>
  );
};

export default Loading;