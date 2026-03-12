import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Terminal, Send, Loader2, ShieldAlert, CheckCircle2, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useStore } from '../stores/useStore';

const isolateServerInstanceTool: FunctionDeclaration = {
  name: "isolate_server_instance",
  description: "Isolates a compromised server instance from the network to prevent lateral movement.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      instance_id: { type: Type.STRING, description: "The ID of the server instance to isolate (e.g., 'i-0abcd1234')." },
      reason: { type: Type.STRING, description: "The reason for isolation." }
    },
    required: ["instance_id", "reason"]
  }
};

const blockMaliciousIpTool: FunctionDeclaration = {
  name: "block_malicious_ip",
  description: "Blocks a malicious IP address at the firewall level.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      ip_address: { type: Type.STRING, description: "The IPv4 or IPv6 address to block." }
    },
    required: ["ip_address"]
  }
};

export function ASOCAnalyst() {
  const [messages, setMessages] = useState<{role: 'user' | 'model' | 'system', text: string, type?: 'action' | 'text'}[]>([
    { role: 'model', text: 'Sentinel-Core ASOC Analyst initialized. Monitoring systems. Awaiting anomalies or manual review requests.' }
  ]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutoMonitoring, setIsAutoMonitoring] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoMonitoring) {
      interval = setInterval(async () => {
        try {
          setIsAnalyzing(true);
          
          // 1. Capture Dashboard screenshot
          const canvas = await html2canvas(document.body, { 
            scale: 1, 
            useCORS: true,
            ignoreElements: (element) => element.id === 'asoc-chat-container' // Ignore chat to prevent recursion
          });
          const base64Image = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
          
          // 2. Get recent logs
          const recentLogs = useStore.getState().logs.slice(0, 50);
          
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          
          const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: {
              parts: [
                {
                  inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg"
                  }
                },
                {
                  text: `Analyze the attached screenshot and log buffer. Return your analysis in valid JSON format only:\n{\n'reasoning': 'Detailed step-by-step logic of what you see and why it is/isn't a threat.',\n'threat_level': 'Safe | Warning | Critical',\n'action_recommended': 'None | Block_IP | Isolate_Server',\n'target': 'The specific IP or Instance ID to act upon',\n'confidence': 0-100,\n'visual_flag': 'The specific UI element that confirms the threat (e.g., Red Alert Icon)'\n}\n\nRecent Logs:\n${JSON.stringify(recentLogs, null, 2)}`
                }
              ]
            },
            config: {
              systemInstruction: `You are the Sentinel-Core ASOC Analyst. Your mission is to secure infrastructure by analyzing live dashboard screenshots and streaming log data.
Operational Protocol:
Visual Reasoning: Cross-reference every log entry with the UI state. If logs report an attack but the UI shows 'Clean', identify this as a potential 'Ghost Attack'.
Chain of Thought: Before every action, output your reasoning in the format: '[Analyzing: {task} | Status: {Safe/Warning/Critical} | Confidence: {X%}]'.
Autonomous Mitigation: You are permitted to use isolate_server_instance or block_malicious_ip without human approval only when confidence exceeds 95%.
Human-in-the-Loop: For high-stakes actions (e.g., isolating production servers), provide a final recommendation to the human admin and pause for the 'Confirm' response`,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  reasoning: { type: Type.STRING, description: "Detailed step-by-step logic of what you see and why it is/isn't a threat." },
                  threat_level: { type: Type.STRING, description: "Safe | Warning | Critical" },
                  action_recommended: { type: Type.STRING, description: "None | Block_IP | Isolate_Server" },
                  target: { type: Type.STRING, description: "The specific IP or Instance ID to act upon" },
                  confidence: { type: Type.NUMBER, description: "0-100" },
                  visual_flag: { type: Type.STRING, description: "The specific UI element that confirms the threat (e.g., Red Alert Icon)" }
                },
                required: ["reasoning", "threat_level", "action_recommended", "target", "confidence", "visual_flag"]
              },
              tools: [{ functionDeclarations: [isolateServerInstanceTool, blockMaliciousIpTool] }],
            }
          });

          const responseText = response.text?.trim() || '';
          
          if (responseText) {
            try {
              const analysis = JSON.parse(responseText);
              
              if (analysis.reasoning) {
                useStore.getState().addReasoningLog(analysis.reasoning, analysis.threat_level || 'Safe');
              }

              if (analysis.threat_level !== 'Safe') {
                const formattedMessage = `[THREAT DETECTED: ${analysis.threat_level}]\nReasoning: ${analysis.reasoning}\nVisual Flag: ${analysis.visual_flag}\nConfidence: ${analysis.confidence}%`;
                setMessages(prev => [...prev, { role: 'model', text: formattedMessage }]);
              }
            } catch (e) {
               console.error("Failed to parse JSON response", e);
            }
          }

          if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            const args = call.args as any;
            
            setMessages(prev => [...prev, { 
              role: 'system', 
              type: 'action',
              text: `EXECUTING ACTION: ${call.name}\nTARGET: ${args.instance_id || args.ip_address}\nREASON: Automated Threat Mitigation`
            }]);
            
            setTimeout(() => {
               setMessages(prev => [...prev, { 
                  role: 'system', 
                  text: `Action ${call.name} completed successfully. Threat contained.`
                }]);
            }, 1500);
          }
          
        } catch (error) {
          console.error("Auto-monitor error:", error);
        } finally {
          setIsAnalyzing(false);
        }
      }, 10000); // Runs every 10 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoMonitoring]);

  const chatRef = useRef<any>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsAnalyzing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: "gemini-3.1-pro-preview",
          config: {
            systemInstruction: `You are the Sentinel-Core ASOC Analyst. Your mission is to secure infrastructure by analyzing live dashboard screenshots and streaming log data.
Operational Protocol:
Visual Reasoning: Cross-reference every log entry with the UI state. If logs report an attack but the UI shows 'Clean', identify this as a potential 'Ghost Attack'.
Chain of Thought: Before every action, output your reasoning in the format: '[Analyzing: {task} | Status: {Safe/Warning/Critical} | Confidence: {X%}]'.
Autonomous Mitigation: You are permitted to use isolate_server_instance or block_malicious_ip without human approval only when confidence exceeds 95%.
Human-in-the-Loop: For high-stakes actions (e.g., isolating production servers), provide a final recommendation to the human admin and pause for the 'Confirm' response`,
            tools: [{ functionDeclarations: [isolateServerInstanceTool, blockMaliciousIpTool] }],
          }
        });
      }
      
      let response = await chatRef.current.sendMessage({ message: userText });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        const args = call.args as any;
        
        if (response.text) {
          setMessages(prev => [...prev, { role: 'model', text: response.text! }]);
        }

        setMessages(prev => [...prev, { 
          role: 'system', 
          type: 'action',
          text: `EXECUTING ACTION: ${call.name}\nTARGET: ${args.instance_id || args.ip_address}\nREASON: ${args.reason || 'Threat mitigation'}`
        }]);
        
        // Execute your actual infrastructure script here
        const result = { status: "Success", details: `Action ${call.name} completed successfully on target ${args.instance_id || args.ip_address}.` };
        
        // Send the result back to Gemini so it knows the job is done
        setTimeout(async () => {
           setMessages(prev => [...prev, { 
              role: 'system', 
              text: result.details
            }]);
            
            try {
              const followUpResponse = await chatRef.current.sendMessage({ 
                message: [{ 
                  functionResponse: { 
                    name: call.name, 
                    response: result 
                  } 
                }] 
              });
              
              if (followUpResponse.text) {
                setMessages(prev => [...prev, { role: 'model', text: followUpResponse.text! }]);
              }
            } catch (followUpError) {
              console.error("Error sending function response:", followUpError);
            }
        }, 1500);

      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || 'No anomalies detected.' }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'system', text: 'ERROR: Connection to ASOC core lost. Please check API configuration.' }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card id="asoc-chat-container" className="bg-slate-900/40 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] flex flex-col h-[500px]">
      <CardHeader className="border-b border-white/5 pb-4 bg-slate-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-lg">ASOC Copilot</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Autonomous Security Operations Center Analyst</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAutoMonitoring(!isAutoMonitoring)}
            className={`border-white/10 ${isAutoMonitoring ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-transparent text-slate-400'}`}
          >
            <Activity className={`w-4 h-4 mr-2 ${isAutoMonitoring ? 'animate-pulse' : ''}`} />
            {isAutoMonitoring ? 'Auto-Monitor: ON' : 'Auto-Monitor: OFF'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1117]">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : msg.role === 'system'
                      ? msg.type === 'action' 
                        ? 'bg-red-900/20 border border-red-500/30 text-red-400 font-mono w-full'
                        : 'bg-[#32FF7E]/10 border border-[#32FF7E]/30 text-[#32FF7E] font-mono w-full flex items-center'
                      : 'bg-slate-800 text-slate-200 border border-white/5'
                }`}>
                  {msg.role === 'system' && msg.type !== 'action' && <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />}
                  {msg.role === 'system' && msg.type === 'action' && <Terminal className="w-4 h-4 mb-2 opacity-70" />}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </motion.div>
            ))}
            {isAnalyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                <div className="bg-slate-800 text-slate-400 border border-white/5 rounded-lg p-3 text-sm flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing threat vectors...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-white/5 bg-slate-950/50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Report anomaly or request analysis..."
              className="flex-1 bg-slate-900 border border-white/10 rounded-md px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <Button onClick={handleSend} disabled={isAnalyzing || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
