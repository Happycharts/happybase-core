// @/components/ui/IFrame.tsx
import React from 'react';

interface IFrameProps {
  url: string;
}

const IFrame: React.FC<IFrameProps> = ({ url }) => {
  return (
    <iframe
      src={url}
      style={{ width: '100%', height: '100vh', border: 'none' }}
      title="Embedded Content"
    />
  );
};

export default IFrame;
