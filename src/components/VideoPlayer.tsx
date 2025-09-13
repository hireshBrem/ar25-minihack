'use client';

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  file: File;
}

export default function VideoPlayer({ file }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && file) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="bg-black rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          controls
          className="w-full h-auto"
          style={{ maxHeight: '500px' }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="mt-2 text-sm text-gray-600 text-center">
        {file.name} - {(file.size / (1024 * 1024)).toFixed(2)} MB
      </div>
    </div>
  );
}
