'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Video, X, Sparkles, Zap, Play } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useAnimation } from 'motion/react';


export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [streamOutput, setStreamOutput] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  
  const controls = useAnimation();
  
  useEffect(() => {
    // Trigger animations on mount
    setTitleVisible(true);
    setShowParticles(true);
  }, []);


  
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
        console.log("Running code");
        
        // check if a video file is selected
        if (!uploadedFile) {
            alert('Please select a video file before running the code.');
            return;
        }

        setIsStreaming(true);
        setStreamOutput('');

        try {
            console.log('Starting stream request...');
            const formData = new FormData();
            if (fileInput.current?.files?.[0]) {
                formData.append("file", fileInput.current.files[0]);
            }

            const response = await fetch("/api/chat", { 
                method: "POST", 
                body: formData 
            });

            console.log('Response received:', response.status, response.headers.get('content-type'));

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No reader available');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log('Stream finished');
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                console.log('Received chunk:', chunk);
                buffer += chunk;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            console.log('Received stream data:', data);
                            
                            // Handle different message types
                            if (data.type === 'connected') {
                                setStreamOutput(prev => prev + `🔗 ${data.message}\n\n`);
                            } else if (data.type === 'step') {
                                setStreamOutput(prev => prev + `📍 [${data.timestamp}]\n${JSON.stringify(data.data, null, 2)}\n\n`);
                            } else if (data.type === 'completed') {
                                setStreamOutput(prev => prev + `✅ ${data.message}\n\n`);
                            } else if (data.type === 'error') {
                                setStreamOutput(prev => prev + `❌ Error: ${data.message}\n\n`);
                            } else {
                                // Fallback for any other data format
                                setStreamOutput(prev => prev + JSON.stringify(data, null, 2) + '\n\n');
                            }
                        } catch (e) {
                            console.error('Error parsing stream data:', e);
                            setStreamOutput(prev => prev + `❌ Parse error: ${e}\n\n`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setStreamOutput(prev => prev + `Error: ${error}\n`);
        } finally {
            setIsStreaming(false);
        }
    }

  return (
    <motion.div 
      className="font-sans min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/20" />
        {/* Animated particles */}
        {showParticles && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0 
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 p-8 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Animated Header */}
          <motion.div 
            className="mb-12 text-center"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, type: "spring" }}
            >
              AR25 HACK
            </motion.h1>
            <motion.div
              className="flex items-center justify-center gap-2 text-xl text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span>AI-Powered Browser Automation</span>
              <Zap className="w-6 h-6 text-blue-400" />
            </motion.div>
          </motion.div>

          {/* Animated Form with file upload */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mb-8"
          >
            <motion.form 
              className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* File Upload Section */}
              <motion.div 
                className="mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
              >
                {!uploadedFile ? (
                  <motion.div
                    className={`
                      border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
                      ${isDragOver 
                        ? 'border-cyan-400 bg-cyan-400/10 scale-105' 
                        : 'border-gray-400/50 hover:border-cyan-400/70 hover:bg-cyan-400/5'
                      }
                    `}
                    onClick={handleUploadClick}
                    whileHover={{ 
                      borderColor: "rgb(34, 211, 238)",
                      backgroundColor: "rgba(34, 211, 238, 0.1)",
                      scale: 1.02 
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Upload className="mx-auto h-16 w-16 text-cyan-400 mb-4" />
                    </motion.div>
                    <motion.h3 
                      className="text-2xl font-bold text-white mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.2 }}
                    >
                      Upload Screen Recording
                    </motion.h3>
                    <motion.p 
                      className="text-gray-300 mb-4 text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.4 }}
                    >
                      Drop your video here or click to browse
                    </motion.p>
                    <motion.p 
                      className="text-sm text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.6 }}
                    >
                      Supports .mov, .mp4, and other video formats
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="border border-cyan-400/50 bg-cyan-400/10 rounded-xl p-6 backdrop-blur-sm"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <div className="flex items-center justify-between">
                      <motion.div 
                        className="flex items-center space-x-4"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Video className="h-10 w-10 text-cyan-400" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-white text-lg">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-300">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </motion.div>
                      <motion.button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-2 hover:bg-red-500/20 rounded-full transition-colors border border-red-400/50"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="h-6 w-6 text-red-400" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <input
                ref={fileInput}
                type="file"
                name="file"
                accept=".mov,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Animated Submit button */}
              <motion.button
                type="submit"
                disabled={isStreaming}
                onClick={uploadFile}
                className={`
                  relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 overflow-hidden
                  ${isStreaming 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 shadow-lg hover:shadow-cyan-500/25'
                  }
                  text-white
                `}
                whileHover={!isStreaming ? { 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(34, 211, 238, 0.5)"
                } : {}}
                whileTap={!isStreaming ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.8, duration: 0.5 }}
              >
                <motion.div 
                  className="flex items-center justify-center gap-3"
                  animate={isStreaming ? { x: [0, 5, 0] } : {}}
                  transition={isStreaming ? { duration: 1, repeat: Infinity } : {}}
                >
                  {isStreaming ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-6 h-6" />
                      </motion.div>
                      <span>Running Browser Agent...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      <span>Launch AI Agent</span>
                    </>
                  )}
                </motion.div>
                
                {/* Animated background effect */}
                {!isStreaming && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-yellow-500 opacity-0"
                    whileHover={{ opacity: 0.2 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            </motion.form>
          </motion.div>

          {/* Animated Video player - only show if file is uploaded */}
          <AnimatePresence>
            {uploadedFile && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              >
                <motion.div
                  className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.h2 
                    className="text-2xl font-bold text-white mb-4 flex items-center gap-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Video className="w-6 h-6 text-cyan-400" />
                    Video Preview
                  </motion.h2>
                  <motion.div
                    initial={{ borderRadius: 0 }}
                    animate={{ borderRadius: 16 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <VideoPlayer file={uploadedFile} />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Terminal Stream output display */}
          <AnimatePresence>
            {(streamOutput || isStreaming) && (
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
              >
                <motion.h2 
                  className="text-3xl font-bold mb-6 text-white flex items-center gap-3"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      color: ["#00ff00", "#00ffff", "#00ff00"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-8 h-8" />
                  </motion.div>
                  Browser Agent Stream
                </motion.h2>
                
                <motion.div 
                  className="relative backdrop-blur-md bg-black/80 border border-green-400/30 rounded-2xl overflow-hidden"
                  initial={{ scale: 0.9, rotateX: -10 }}
                  animate={{ scale: 1, rotateX: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {/* Terminal header */}
                  <motion.div 
                    className="bg-gray-800/90 px-6 py-3 border-b border-green-400/20 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex gap-2">
                      <motion.div 
                        className="w-3 h-3 bg-red-500 rounded-full"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div 
                        className="w-3 h-3 bg-yellow-500 rounded-full"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div 
                        className="w-3 h-3 bg-green-500 rounded-full"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 ml-4">AI Browser Agent Terminal</span>
                  </motion.div>
                  
                  {/* Terminal content */}
                  <motion.div 
                    className="p-6 min-h-[300px] max-h-[500px] overflow-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.pre 
                      className="text-green-400 font-mono text-sm whitespace-pre-wrap leading-relaxed"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 1 }}
                    >
                      {streamOutput || (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                        >
                          🤖 Initializing browser agent...
                          {'\n'}🔧 Setting up automation environment...
                          {'\n'}⚡ Ready to process your request...
                        </motion.span>
                      )}
                      {isStreaming && (
                        <motion.span 
                          className="inline-block w-3 h-5 bg-green-400 ml-1"
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        >
                          █
                        </motion.span>
                      )}
                    </motion.pre>
                  </motion.div>
                  
                  {/* Glowing effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(0, 255, 0, 0.1)",
                        "0 0 40px rgba(0, 255, 0, 0.2)",
                        "0 0 20px rgba(0, 255, 0, 0.1)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
