
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
  level = 'M',
  className = ''
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="brutal-card p-4 bg-white">
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          includeMargin={true}
          className="border-2 border-black"
        />
      </div>
    </div>
  );
};

export default QRCodeDisplay;
