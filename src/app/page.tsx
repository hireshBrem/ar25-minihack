'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Zap, Play, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useAnimation } from 'motion/react';


export default function Home() {
  const [textInput, setTextInput] = useState<string>('');
  const [streamOutput, setStreamOutput] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const controls = useAnimation();
  
  useEffect(() => {
    // Trigger animations on mount
    setTitleVisible(true);
    setShowParticles(true);
  }, []);

  // Auto-scroll terminal to bottom when new content is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [streamOutput]);

    const router = useRouter();

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextInput(e.target.value);
    };

    async function launchAgent(evt: React.FormEvent) {
        
        evt.preventDefault();
        console.log("Launching AI agent");
        
        // check if text input is provided
        if (!textInput.trim()) {
            alert('Please enter some instructions before launching the AI agent.');
            return;
        }

        setIsStreaming(true);
        setStreamOutput('');

        try {
            console.log('Starting stream request...');
            const requestBody = {
                text: textInput
            };

            const response = await fetch("/api/chat", { 
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
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
                                const stepData = data.data;
                                let formattedOutput = `\n🤖 Step ${stepData.number}\n`;
                                formattedOutput += `⏰ ${new Date(data.timestamp).toLocaleTimeString()}\n`;
                                
                                if (stepData.url && stepData.url !== 'about:blank') {
                                    formattedOutput += `🌐 URL: ${stepData.url}\n`;
                                }
                                
                                if (stepData.memory) {
                                    formattedOutput += `🧠 Memory: ${stepData.memory}\n`;
                                }
                                
                                if (stepData.nextGoal) {
                                    formattedOutput += `🎯 Next Goal: ${stepData.nextGoal}\n`;
                                }
                                
                                if (stepData.screenshotUrl) {
                                    formattedOutput += `📸 Screenshot: Available\n`;
                                }
                                
                                if (stepData.actions && stepData.actions.length > 0) {
                                    formattedOutput += `🔧 Actions:\n`;
                                    stepData.actions.forEach((action: string, index: number) => {
                                        try {
                                            const actionObj = JSON.parse(action);
                                            const actionType = Object.keys(actionObj)[0];
                                            const actionData = actionObj[actionType];
                                            
                                            switch (actionType) {
                                                case 'go_to_url':
                                                    formattedOutput += `   → Navigate to: ${actionData.url}\n`;
                                                    break;
                                                case 'click_element_by_index':
                                                    formattedOutput += `   → Click element at index: ${actionData.index}\n`;
                                                    break;
                                                case 'done':
                                                    formattedOutput += `   → Task completed: ${actionData.text}\n`;
                                                    break;
                                                case 'type_text':
                                                    formattedOutput += `   → Type text: "${actionData.text}"\n`;
                                                    break;
                                                case 'scroll':
                                                    formattedOutput += `   → Scroll: ${actionData.direction}\n`;
                                                    break;
                                                default:
                                                    formattedOutput += `   → ${actionType}: ${JSON.stringify(actionData)}\n`;
                                            }
                                        } catch (e) {
                                            formattedOutput += `   → ${action}\n`;
                                        }
                                    });
                                }
                                
                                formattedOutput += `\n${'─'.repeat(60)}\n`;
                                setStreamOutput(prev => prev + formattedOutput);
                            } else if (data.type === 'completed') {
                                setStreamOutput(prev => prev + `\n🎉 ${data.message}\n\n`);
                            } else if (data.type === 'error') {
                                setStreamOutput(prev => prev + `\n❌ Error: ${data.message}\n\n`);
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
              {/* Text Input Section */}
              <motion.div 
                className="mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
              >
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2 }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <MessageSquare className="mx-auto h-16 w-16 text-cyan-400 mb-4" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl font-bold text-white mb-2 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.4 }}
                  >
                    AI Agent Instructions
                  </motion.h3>
                  
                  <motion.p 
                    className="text-gray-300 mb-4 text-lg text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.6 }}
                  >
                    Describe what you want the AI agent to do
                  </motion.p>
                  
                  <motion.textarea
                    value={textInput}
                    onChange={handleTextChange}
                    placeholder="Enter your instructions here... For example: 'Search for React tutorials on YouTube and bookmark the top 3 results'"
                    className="w-full min-h-[200px] p-4 bg-black/50 border border-cyan-400/30 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 resize-vertical"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.8 }}
                    whileFocus={{ 
                      borderColor: "rgb(34, 211, 238)",
                      scale: 1.01
                    }}
                  />
                  
                  <motion.p 
                    className="text-sm text-gray-400 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                  >
                    The AI agent will execute your instructions using a browser
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Animated Submit button */}
              <motion.button
                type="submit"
                disabled={isStreaming}
                onClick={launchAgent}
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
                    ref={terminalRef}
                    className="p-6 min-h-[300px] max-h-[600px] overflow-auto terminal-scrollbar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.pre 
                      className="text-green-300 font-mono text-sm whitespace-pre-wrap leading-relaxed"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 1 }}
                      style={{ 
                        textShadow: '0 0 10px rgba(34, 197, 94, 0.3)',
                        fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                      }}
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
