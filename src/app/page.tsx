'use client';

import { useState, useRef } from 'react';
import { Upload, Video, X } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { useRouter } from 'next/navigation';


export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [streamOutput, setStreamOutput] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(true);
//   };

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(false);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(false);
    
//     const files = Array.from(e.dataTransfer.files);
//     const videoFile = files.find(file => 
//       file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mov')
//     );
    
//     if (videoFile && fileInput.current) {
//       // Create a new FileList with the dropped file
//       const dt = new DataTransfer();
//       dt.items.add(videoFile);
//       fileInput.current.files = dt.files;
//       setUploadedFile(videoFile);
//     }
//   };

  
    const fileInput = useRef<HTMLInputElement | null>(null);
    const router = useRouter();


    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        setUploadedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        if (fileInput.current) {
            fileInput.current.value = '';
        }
    };

    const handleUploadClick = () => {
        fileInput.current?.click();
    };

    async function uploadFile(evt: React.FormEvent) {
        evt.preventDefault();
        console.log("Uploading file");
        console.log(fileInput.current?.files);
        if (!fileInput.current?.files?.[0]) {
            console.log("No file found");
            return;
        }

        console.log("File found");
        const formData = new FormData();
        formData.append("file", fileInput.current.files[0]);
        await fetch("/api/chat", { method: "POST", body: formData });
        router.refresh();
    }

  return (
    <div className="font-sans min-h-screen p-8 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header with title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">AR25 Hack</h1>
        </div>

            {/* Form with file upload */}
            <form className="mb-8">
                <input
                        ref={fileInput}
                        type="file"
                        name="file"
                        accept=".mov,video/*"
                        onChange={handleFileSelect}
                        // className="hidden"
                />
            {/* <div className="mb-8">
                <div className="w-full max-w-2xl mx-auto">
                {!uploadedFile ? (
                    <div
                    className={`
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                        ${isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                        }
                    `}
                    // onDragOver={handleDragOver}
                    // onDragLeave={handleDragLeave}
                    // onDrop={handleDrop}
                    onClick={handleUploadClick}
                    >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Upload Screen Recording
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Drag and drop your screen recording here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                        Supports .mov, .mp4, and other video formats
                    </p>
                    <input
                        ref={fileInput}
                        type="file"
                        name="file"
                        accept=".mov,video/*"
                        onChange={handleFileSelect}
                        // className="hidden"
                    />
                    </div>
                ) : (
                    <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                        <Video className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                            <p className="text-sm text-gray-500">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>
                        </div>
                        <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                        <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                    </div>
                )}
                </div>
            </div> */}

            {/* Video player - only show if file is uploaded */}
            {/* {uploadedFile && (
                <div className="mb-8">
                <VideoPlayer file={uploadedFile} />
                </div>
            )}     */}

            {/* Submit button to run the code */}
            <button
                type="submit"
                // disabled={isStreaming}
                onClick={uploadFile}
                className={`px-4 py-2 rounded-md ${
                isStreaming 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
            >
                {isStreaming ? 'Streaming...' : 'Run Code'}
            </button>
        </form>

        {/* Stream output display */}
        {(streamOutput || isStreaming) && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Stream Output:</h2>
            <div className="bg-gray-100 p-4 rounded-lg min-h-[200px] font-mono text-sm whitespace-pre-wrap">
              {streamOutput || 'Waiting for stream to start...'}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1">|</span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
