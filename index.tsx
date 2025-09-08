import { GoogleGenAI, Type } from '@google/genai';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// --- Type Definitions ---
type Idea = {
  id: string; // Unique ID for feedback tracking
  conceptName: string;
  format: string;
  shortPlot: string;
  visualAudioDirection: string;
  hook: string;
  imageUrl?: string;
  script?: ScriptScene[]; // Script is now part of the idea
};

type ScriptScene = {
  scene: string;
  shot: string;
  cameraAngle: string;
  cameraMovement: string;
  visualDescription: string;
  audio: string;
  approxDuration: string;
};

type AssessmentResult = {
  scores: {
    [key: string]: number; // Dynamic keys for scores
  };
  feedback: {
    strengths: string;
    improvements: string;
  };
};

type DesignAssessmentResult = {
  scores: {
    visualAppeal: number;
    usabilityClarity: number;
    originality: number;
    designComposition: number;
    alignmentWithGoal: number;
  };
  feedback: {
    strengths: string;
    improvements: string;
  };
};

// --- Helper Functions ---
const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            const mimeType = result.split(';')[0].split(':')[1];
            resolve({ base64, mimeType });
        };
        reader.onerror = error => reject(error);
    });
};


// --- API Client Initialization ---
// The API key is expected to be available in the environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- UI Components ---

const Header = ({ onGoHome, user, onLogout }) => (
  <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 p-4 shadow-lg">
    <nav className="container mx-auto flex justify-between items-center">
      <button onClick={onGoHome} className="text-xl md:text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors">AI Creativity Tool</button>
      {user && (
         <div className="flex items-center gap-4 text-gray-300 text-sm">
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">{user}</span>
            </div>
            <button onClick={onLogout} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors font-medium bg-gray-700/50 hover:bg-red-500/50 px-3 py-1.5 rounded-md">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span>Logout</span>
            </button>
         </div>
      )}
    </nav>
  </header>
);

const Footer = () => (
  <footer className="bg-gray-800 p-4 mt-8 text-center text-sm text-gray-400">
    <p>ผู้จัดทำ: ฐากร อยู่วิจิตร | © {new Date().getFullYear()}</p>
  </footer>
);

const LoginModule = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !email.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
        return;
    }
    
    // Log user data to a Google Sheet via a Google Apps Script Web App.
    // This is a secure way to handle data submission from the client-side
    // without exposing credentials. The user needs to create a simple Apps Script
    // and replace the placeholder URL below.
    try {
      // IMPORTANT: Replace this placeholder with your actual Google Apps Script Web App URL.
      const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec';

      const formData = new FormData();
      formData.append('timestamp', new Date().toISOString());
      formData.append('user', user);
      formData.append('email', email);
      
      // Send the data. 'no-cors' mode is used for simple "fire-and-forget" POST requests
      // to a Google Apps Script. The browser won't read the response, which is fine for logging.
      await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body: formData,
          mode: 'no-cors',
      });
    } catch (logError) {
      // Log the error for debugging purposes but do not block the user's login.
      // The logging functionality should not interfere with the core app experience.
      console.error('Failed to log user data:', logError);
    }

    setError('');
    onLogin({ user, email });
  };

  return (
    <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xl animate-fade-in">
      <h2 className="text-3xl font-bold text-cyan-400 mb-2 text-center">AI Creativity Tool</h2>
      <p className="text-gray-400 mb-8 text-center">กรุณาลงชื่อเพื่อเข้าใช้งาน</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="user" className="block text-sm font-medium text-gray-300 mb-2">
            ผู้ใช้งาน (User)
          </label>
          <input
            id="user"
            name="user"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full bg-gray-700 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="ชื่อของคุณ"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            อีเมล์ (Email)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-700 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="you@example.com"
          />
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded transition disabled:bg-gray-500 flex items-center justify-center h-12"
          >
            Login / เข้าสู่ระบบ
          </button>
        </div>
      </form>
    </div>
  );
};


const Welcome = ({ onNavigate }) => (
    <div className="text-center p-8 md:p-16 bg-gray-800 rounded-lg shadow-2xl animate-fade-in container mx-auto mt-10">
        <h2 className="text-4xl md:text-6xl font-bold text-cyan-400 mb-4">AI-Powered Creativity Tool</h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8">เลือกเครื่องมือที่ต้องการใช้งาน</p>
        <div className="flex flex-col md:flex-row justify-center gap-6 flex-wrap">
            <button
                onClick={() => onNavigate('creativeCorner')}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
                สร้างสรรค์ไอเดีย
            </button>
            <button
                onClick={() => onNavigate('assessment')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
                ประเมินผลงานสื่อมีเดีย
            </button>
             <button
                onClick={() => onNavigate('designAssessment')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
                ประเมินผลงานการออกแบบ
            </button>
            <button
                onClick={() => onNavigate('userGuide')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
                คู่มือการใช้เครื่องมือ
            </button>
             <button
                onClick={() => onNavigate('creator')}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
                ผู้สร้างเครื่องมือ
            </button>
        </div>
    </div>
);

const CreativeCorner = ({ onGoHome }) => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [loadingScript, setLoadingScript] = useState(false);
  const [scriptLoadingIndex, setScriptLoadingIndex] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState('');
  const [activeScriptIdeaId, setActiveScriptIdeaId] = useState<string | null>(null);
  const [playingSceneIndex, setPlayingSceneIndex] = useState<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Effect to load speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    if ('speechSynthesis' in window) {
      loadVoices();
      // Some browsers load voices asynchronously.
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup function to cancel speech and remove listener
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  const handleGenerateIdeas = async () => {
    if (!topic || !audience || !goal) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    setError('');
    setLoadingIdeas(true);
    setIdeas([]);
    setActiveScriptIdeaId(null);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();


    try {
      const durationInfo = duration ? `- ความยาววิดีโอที่ต้องการ: ${duration}\n` : '';
      const prompt = `คุณคือผู้เชี่ยวชาญด้านกลยุทธ์คอนเทนต์สำหรับโซเชียลมีเดีย สร้างสรรค์ไอเดียสำหรับวิดีโอสั้น (เช่น TikTok หรือ Instagram Reels) ที่ไม่ซ้ำใครจำนวน 3 ไอเดียจากข้อมูลต่อไปนี้ โดยให้ผลลัพธ์ทั้งหมดเป็นภาษาไทย
      - หัวข้อ/ผลิตภัณฑ์: ${topic}
      - กลุ่มเป้าหมาย: ${audience}
      - เป้าหมายของคอนเทนต์: ${goal}
      ${durationInfo}สำหรับแต่ละไอเดีย ให้ระบุ ชื่อคอนเซ็ปต์ (conceptName), รูปแบบ (format), เรื่องย่อ (shortPlot), แนวทางภาพและเสียง (visualAudioDirection), และฮุคที่ดึงดูด (hook)`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ideas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    conceptName: { type: Type.STRING },
                    format: { type: Type.STRING },
                    shortPlot: { type: Type.STRING },
                    visualAudioDirection: { type: Type.STRING },
                    hook: { type: Type.STRING },
                  },
                  required: ['conceptName', 'format', 'shortPlot', 'visualAudioDirection', 'hook'],
                },
              },
            },
            required: ['ideas'],
          },
        },
      });

      const parsedResponse = JSON.parse(response.text);
      const newIdeas = parsedResponse.ideas.map((idea, index) => ({
        ...idea,
        id: `idea-${Date.now()}-${index}`, // Add unique ID
      }));
      setIdeas(newIdeas);
      localStorage.setItem('creativeContent', JSON.stringify(newIdeas));
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการสร้างไอเดีย โปรดลองอีกครั้ง');
    } finally {
      setLoadingIdeas(false);
    }
  };

  const handleGenerateImage = async (idea: Idea, index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: true }));
    setError('');

    try {
      const prompt = `ภาพตัวอย่างสำหรับวิดีโอสั้น สไตล์ภาพยนตร์ รายละเอียดสูง สไตล์: ${idea.visualAudioDirection} ฉาก: ${idea.shortPlot}`;

      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '9:16',
        },
      });

      const imageUrl = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
      
      const updatedIdeas = ideas.map((item, idx) =>
        idx === index ? { ...item, imageUrl } : item
      );
      setIdeas(updatedIdeas);
      localStorage.setItem('creativeContent', JSON.stringify(updatedIdeas));
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการสร้างภาพ โปรดลองอีกครั้ง');
    } finally {
      setImageLoading(prev => ({ ...prev, [index]: false }));
    }
  };
  
  const handleGenerateScript = async (idea: Idea, index: number) => {
    setLoadingScript(true);
    setScriptLoadingIndex(index);
    setError('');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    
    try {
      const prompt = `คุณคือมืออาชีพด้านการเขียนสคริปต์ภาษาไทย สร้างสคริปต์สำหรับถ่ายทำวิดีโอสั้นจากข้อมูลไอเดียต่อไปนี้ โดยให้ผลลัพธ์ทั้งหมดเป็นภาษาไทย
      - ชื่อคอนเซ็ปต์: "${idea.conceptName}"
      - ฮุค: "${idea.hook}"
      - พล็อตเรื่อง: "${idea.shortPlot}"
      - แนวทางภาพและเสียง: "${idea.visualAudioDirection}"
      สร้างสคริปต์โดยละเอียดสำหรับถ่ายทำ โดยผลลัพธ์ต้องเป็น JSON array ของแต่ละฉาก และค่าของ property ทั้งหมด (scene, shot, cameraAngle, cameraMovement, visualDescription, audio, approxDuration) ต้องเป็นภาษาไทย`;
      
       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              script: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    scene: { type: Type.STRING },
                    shot: { type: Type.STRING },
                    cameraAngle: { type: Type.STRING },
                    cameraMovement: { type: Type.STRING },
                    visualDescription: { type: Type.STRING },
                    audio: { type: Type.STRING },
                    approxDuration: { type: Type.STRING },
                  },
                  required: ['scene', 'shot', 'cameraAngle', 'cameraMovement', 'visualDescription', 'audio', 'approxDuration'],
                },
              },
            },
            required: ['script'],
          },
        },
      });

      const parsedResponse = JSON.parse(response.text);
      const newScript = parsedResponse.script;
      
      const updatedIdeas = ideas.map((item, idx) => 
        idx === index ? { ...item, script: newScript } : item
      );
      setIdeas(updatedIdeas);
      localStorage.setItem('creativeContent', JSON.stringify(updatedIdeas));
      setActiveScriptIdeaId(idea.id);

    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการสร้างสคริปต์ โปรดลองอีกครั้ง');
    } finally {
      setLoadingScript(false);
      setScriptLoadingIndex(null);
    }
  };
  
  const handlePlayAudio = (scene: ScriptScene, index: number) => {
    if (!('speechSynthesis' in window)) {
        alert("ขออภัย บราวเซอร์ของคุณไม่รองรับการอ่านออกเสียง");
        return;
    }

    if (playingSceneIndex === index) {
        window.speechSynthesis.cancel();
        setPlayingSceneIndex(null);
        return;
    }
    
    window.speechSynthesis.cancel();

    const textToSpeak = `ภาพ: ${scene.visualDescription} เสียง: ${scene.audio}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    const thaiVoice = voices.find(voice => voice.lang === 'th-TH');
    if (thaiVoice) {
        utterance.voice = thaiVoice;
    }
    utterance.lang = 'th-TH';

    utterance.onstart = () => setPlayingSceneIndex(index);
    utterance.onend = () => setPlayingSceneIndex(null);
    utterance.onerror = () => {
        setPlayingSceneIndex(null);
        setError("เกิดข้อผิดพลาดในการเล่นเสียง");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSaveScript = (ideaToSave: Idea) => {
    if (!ideaToSave.script || !ideaToSave.script.length) return;

    let fileContent = `Shooting Script for: ${ideaToSave.conceptName}\n`;
    fileContent += "==================================================\n\n";

    ideaToSave.script.forEach((scene) => {
        fileContent += `Scene Shot: ${scene.scene} / ${scene.shot}\n`;
        fileContent += `----------------------------------------\n`;
        fileContent += `Camera Angle: ${scene.cameraAngle}\n`;
        fileContent += `Camera Movement: ${scene.cameraMovement}\n`;
        fileContent += `Descript: ${scene.visualDescription}\n`;
        fileContent += `Sound: ${scene.audio}\n`;
        fileContent += `Time: ${scene.approxDuration}\n\n`;
    });
    
    fileContent += "Generated by AI Creativity Tool";

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${ideaToSave.conceptName.replace(/\s+/g, '_').toLowerCase()}_script.txt`;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4 space-y-8 animate-fade-in">
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cyan-400">1. สร้างไอเดีย (Idea Generation)</h2>
           <button onClick={onGoHome} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center space-x-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>หน้าหลัก</span>
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="หัวข้อ / ผลิตภัณฑ์" className="bg-gray-700 p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="กลุ่มเป้าหมาย" className="bg-gray-700 p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="เป้าหมายของคอนเทนต์" className="bg-gray-700 p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="ความยาววิดีโอ (เช่น 1 นาที)" className="bg-gray-700 p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
        <button onClick={handleGenerateIdeas} disabled={loadingIdeas} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition disabled:bg-gray-500 flex items-center justify-center h-10">
          {loadingIdeas ? <div className="loader !w-6 !h-6 !border-2"></div> : 'สร้างไอเดีย'}
        </button>
        {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
      </section>

      {ideas.length > 0 && (
        <section className="animate-fade-in">
          <h3 className="text-xl font-bold mb-4">ไอเดียที่สร้างโดย AI:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea, index) => (
              <div key={idea.id} className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-lg text-cyan-400">{idea.conceptName}</h4>
                  <p className="text-sm text-gray-400 mb-2"><strong>รูปแบบ:</strong> {idea.format}</p>
                  <p className="text-sm mb-2"><strong>Hook:</strong> {idea.hook}</p>
                  <p className="text-sm mb-2"><strong>เรื่องย่อ:</strong> {idea.shortPlot}</p>
                  <p className="text-sm mb-2"><strong>ภาพและเสียง:</strong> {idea.visualAudioDirection}</p>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="aspect-[9/16] bg-gray-700/50 rounded-md flex items-center justify-center overflow-hidden">
                    {imageLoading[index] ? (
                        <div className="loader"></div>
                    ) : idea.imageUrl ? (
                        <img src={idea.imageUrl} alt={`AI generated image for ${idea.conceptName}`} className="w-full h-full object-cover"/>
                    ) : (
                         <button onClick={() => handleGenerateImage(idea, index)} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded transition text-sm flex items-center space-x-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span>สร้างภาพตัวอย่าง</span>
                         </button>
                    )}
                  </div>
                  <button onClick={() => handleGenerateScript(idea, index)} disabled={loadingScript} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition disabled:bg-gray-500">
                    {scriptLoadingIndex === index ? 'กำลังสร้าง...' : idea.script ? 'สร้างสคริปต์ใหม่' : 'สร้างสคริปต์'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeScriptIdeaId && (() => {
        const activeIdeaForScript = ideas.find(i => i.id === activeScriptIdeaId);
        if (!activeIdeaForScript || !activeIdeaForScript.script) return null;
        
        return (
            <section className="bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-cyan-400">2. ร่างสคริปต์สำหรับ "{activeIdeaForScript.conceptName}"</h2>
                <button onClick={() => handleSaveScript(activeIdeaForScript)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>บันทึกสคริปต์</span>
                </button>
              </div>
              <div className="space-y-4">
                {activeIdeaForScript.script.map((scene, index) => (
                  <div key={index} className={`bg-gray-700/50 p-4 rounded-lg transition-all duration-300 ${playingSceneIndex === index ? 'bg-cyan-900/50 ring-2 ring-cyan-500' : 'border border-transparent hover:bg-gray-700'}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-cyan-400">
                          Scene Shot: {scene.scene} / {scene.shot}
                        </h4>
                      </div>
                      {'speechSynthesis' in window && (
                        <button onClick={() => handlePlayAudio(scene, index)} className="flex-shrink-0 text-gray-300 hover:text-cyan-400 transition p-2 rounded-full" aria-label={playingSceneIndex === index ? `Stop playing audio for scene ${scene.scene}` : `Play audio for scene ${scene.scene}`}>
                          {playingSceneIndex === index ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.118v3.764a1 1 0 001.555.832l3.198-1.882a1 1 0 000-1.664l-3.198-1.882z" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="mt-4 border-t border-gray-600 pt-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                        <div className="space-y-1">
                            <p className="font-semibold text-gray-300">Camera Angle:</p>
                            <p className="text-gray-400">{scene.cameraAngle}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-gray-300">Camera Movement:</p>
                            <p className="text-gray-400">{scene.cameraMovement}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-gray-300">Time:</p>
                            <p className="text-gray-400">{scene.approxDuration}</p>
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <p className="font-semibold text-gray-300">Descript:</p>
                            <p className="text-gray-400">{scene.visualDescription}</p>
                        </div>
                         <div className="md:col-span-3 space-y-1">
                            <p className="font-semibold text-gray-300">Sound:</p>
                            <p className="text-gray-400">{scene.audio}</p>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
        );
    })()}
    </div>
  );
};

const AssessmentModule = ({ onGoHome }) => {
  const [workToAssess, setWorkToAssess] = useState('');
  const [goalOfWork, setGoalOfWork] = useState('');
  const [mediaType, setMediaType] = useState('วีดิโอคอนเทนต์');
  const [fileName, setFileName] = useState('');
  const [videoForAssessment, setVideoForAssessment] = useState<{ file: File, base64: string, mimeType: string } | null>(null);
  const [imageForAssessment, setImageForAssessment] = useState<{ file: File, base64: string, mimeType: string } | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [error, setError] = useState('');
  
  // Professional Assessment Criteria by Media Type
  const assessmentCriteria = {
    'ภาพยนตร์': {
        plotAndNarrative: "โครงเรื่องและการเล่าเรื่อง (Plot & Narrative)",
        characterDevelopment: "การพัฒนาตัวละคร (Character Development)",
        cinematography: "การถ่ายทำและกำกับภาพ (Cinematography)",
        editingAndPacing: "การตัดต่อและจังหวะ (Editing & Pacing)",
        soundDesign: "การออกแบบเสียงและดนตรีประกอบ (Sound Design & Music Score)",
        themeAndMessage: "แก่นเรื่องและสาร (Theme & Message)"
    },
    'หนังสั้น': {
        conceptAndOriginality: "แนวคิดและความคิดริเริ่ม (Concept & Originality)",
        storytellingEfficiency: "ประสิทธิภาพการเล่าเรื่องในเวลาจำกัด (Storytelling Efficiency)",
        visualStorytelling: "การเล่าเรื่องด้วยภาพ (Visual Storytelling)",
        emotionalImpact: "ผลกระทบทางอารมณ์ (Emotional Impact)",
        technicalExecution: "คุณภาพการผลิตทางเทคนิค (Technical Execution)"
    },
    'สปอตโฆษณา': {
        brandMessageClarity: "ความชัดเจนของสาร (Brand Message Clarity)",
        callToAction: "ประสิทธิผลของ Call-to-Action (CTA Effectiveness)",
        memorabilityAndHook: "การสร้างการจดจำและ Hook (Memorability & Hook)",
        targetAudienceAlignment: "ความสอดคล้องกับกลุ่มเป้าหมาย (Target Audience Alignment)",
        persuasion: "พลังในการโน้มน้าวใจ (Persuasion)"
    },
    'วีดิโอคอนเทนต์': {
        engagementHook: "การดึงดูดความสนใจในช่วงต้น (Engagement Hook)",
        valueDelivery: "การนำเสนอคุณค่า (ข้อมูล/ความบันเทิง) (Value Delivery)",
        visualAndAudioQuality: "คุณภาพของภาพและเสียง (Visual & Audio Quality)",
        pacingAndEditing: "จังหวะและการตัดต่อ (Pacing & Editing)",
        viewerRetention: "การรักษาผู้ชม (Viewer Retention)"
    },
    'โมชั่นวีดิโอ': {
        visualDesignAndAesthetics: "การออกแบบภาพและความสวยงาม (Visual Design & Aesthetics)",
        animationQuality: "คุณภาพการเคลื่อนไหว (Animation Quality & Fluidity)",
        clarityOfMessage: "ความชัดเจนของข้อความ (Clarity of Message)",
        pacingAndRhythm: "จังหวะและความเร็ว (Pacing & Rhythm)",
        soundIntegration: "การผสมผสานของเสียง (Sound Integration)"
    },
    'แอนิเมชัน': {
        storytelling: "การเล่าเรื่องและโครงสร้าง (Storytelling & Structure)",
        artDirectionAndStyle: "สไตล์ภาพและอาร์ตไดเร็คชั่น (Art Direction & Style)",
        characterDesignAndAppeal: "การออกแบบตัวละครและความน่าดึงดูด (Character Design & Appeal)",
        animationPrinciples: "การใช้หลักการแอนิเมชัน (Application of Animation Principles)",
        soundDesign: "การออกแบบเสียงและดนตรี (Sound & Music Design)"
    },
    'สารคดี': {
        researchAndCredibility: "การค้นคว้าและความน่าเชื่อถือ (Research & Credibility)",
        narrativeStructure: "โครงสร้างการเล่าเรื่อง (Narrative Structure & Flow)",
        visualEvidenceAndStorytelling: "การใช้ภาพเพื่อเล่าเรื่องและสนับสนุนข้อมูล (Visual Evidence & Storytelling)",
        pointOfView: "มุมมองการนำเสนอและความเป็นกลาง (Point of View & Objectivity)",
        emotionalAndIntellectualImpact: "ผลกระทบทางอารมณ์และความคิด (Emotional & Intellectual Impact)"
    },
    'มิวสิควิดีโอ': {
        conceptAndOriginality: "แนวคิดและความคิดสร้างสรรค์ (Concept & Originality)",
        visualInterpretationOfMusic: "การตีความเพลงผ่านภาพ (Visual Interpretation of Music)",
        cinematographyAndEditing: "การถ่ายทำและการตัดต่อ (Cinematography & Editing)",
        artistPerformance: "การแสดงของศิลปิน (Artist Performance & Representation)",
        aestheticAndStyle: "สุนทรียศาสตร์และสไตล์ (Aesthetics & Style)"
    },
    'ภาพถ่าย': {
        composition: "องค์ประกอบภาพ (Composition)",
        lighting: "การจัดแสง (Lighting)",
        subjectAndStorytelling: "หัวข้อและเรื่องราว (Subject & Storytelling)",
        technicalQuality: "คุณภาพทางเทคนิค (Technical Quality)",
        emotionalImpact: "ผลกระทบทางอารมณ์ (Emotional Impact)"
    },
    'ศิลปะ': {
        conceptAndOriginality: "แนวคิดและความคิดริเริ่ม (Concept & Originality)",
        techniqueAndExecution: "เทคนิคและฝีมือ (Technique & Execution)",
        compositionAndForm: "องค์ประกอบและรูปทรง (Composition & Form)",
        emotionalExpression: "การแสดงออกทางอารมณ์ (Emotional Expression)",
        viewerInterpretation: "การเปิดกว้างต่อการตีความ (Viewer Interpretation)"
    },
    'อื่นๆ': {
        creativity: "ความคิดสร้างสรรค์ (Creativity)",
        clarity: "ความชัดเจนในการสื่อสาร (Clarity of Communication)",
        engagement: "การมีส่วนร่วมของผู้ชม (Audience Engagement)",
        goalAlignment: "ความสอดคล้องกับเป้าหมาย (Alignment with Goal)"
    }
  };
  
  const getCriteriaForMediaType = (type: string) => {
      return assessmentCriteria[type] || assessmentCriteria['อื่นๆ'];
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError('');
      setAssessmentResult(null);
      setFileName(file.name);
      
      // Clear previous inputs
      setWorkToAssess('');
      setVideoForAssessment(null);
      setImageForAssessment(null);

      if (file.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setWorkToAssess(text);
        };
        reader.onerror = () => {
          setError('เกิดข้อผิดพลาดในการอ่านไฟล์');
          setFileName('');
        };
        reader.readAsText(file);
      } else if (file.type.startsWith('video/')) {
        setIsProcessingFile(true);
        try {
          const { base64, mimeType } = await fileToBase64(file);
          setVideoForAssessment({ file, base64, mimeType });
        } catch (err) {
          console.error(err);
          setError('เกิดข้อผิดพลาดในการประมวลผลวิดีโอ');
          setFileName('');
        } finally {
          setIsProcessingFile(false);
        }
      } else if (file.type.startsWith('image/')) {
        setIsProcessingFile(true);
        try {
          const { base64, mimeType } = await fileToBase64(file);
          setImageForAssessment({ file, base64, mimeType });
        } catch (err) {
          console.error(err);
          setError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
          setFileName('');
        } finally {
          setIsProcessingFile(false);
        }
      } else {
        setError('กรุณาอัปโหลดไฟล์ .txt, วิดีโอ หรือรูปภาพเท่านั้น');
        setFileName('');
      }
      
      event.target.value = ''; // Reset file input
    }
  };

  const handleRemoveFile = () => {
    setVideoForAssessment(null);
    setImageForAssessment(null);
    setFileName('');
  };
  
  const handleAssessWork = async () => {
    if ((!workToAssess.trim() && !videoForAssessment && !imageForAssessment) || !goalOfWork.trim()) {
      setError('กรุณากรอกข้อมูลผลงาน (ข้อความ, วิดีโอ หรือรูปภาพ) และเป้าหมายให้ครบถ้วน');
      return;
    }
    setError('');
    setLoading(true);
    setAssessmentResult(null);

    const currentCriteria = getCriteriaForMediaType(mediaType);
    const criteriaPrompt = Object.entries(currentCriteria).map(([key, label]) => {
        return `- ${label} (key: ${key})`;
    }).join('\n');
    
    const scoreProperties = Object.keys(currentCriteria).reduce((acc, key) => {
      acc[key] = { type: Type.INTEGER, description: `คะแนนสำหรับ ${currentCriteria[key]} (1-10)` };
      return acc;
    }, {});


    try {
      const prompt = `คุณคือผู้เชี่ยวชาญด้านการวิเคราะห์และประเมินผลงานสร้างสรรค์ โปรดประเมินผลงานต่อไปนี้ตามเกณฑ์ที่กำหนดสำหรับสื่อประเภทนี้โดยเฉพาะ โดยให้คะแนนแต่ละเกณฑ์ 1-10 พร้อมทั้งให้ความคิดเห็นเกี่ยวกับจุดแข็งและข้อเสนอแนะเพื่อการปรับปรุง ผลลัพธ์ทั้งหมดต้องเป็นภาษาไทย

      - ประเภทของสื่อ: "${mediaType}"
      - ผลงานที่ต้องการประเมิน: ${videoForAssessment ? "[วิเคราะห์จากไฟล์วิดีโอที่แนบมา]" : imageForAssessment ? "[วิเคราะห์จากไฟล์รูปภาพที่แนบมา]" : `"""${workToAssess}"""`}
      - เป้าหมายของผลงานนี้: "${goalOfWork}"

      เกณฑ์การประเมิน:
      ${criteriaPrompt}

      โปรดตอบกลับในรูปแบบ JSON เท่านั้น`;
      
      const mediaFile = imageForAssessment || videoForAssessment;
      const contents = mediaFile
        ? {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: mediaFile.base64,
                  mimeType: mediaFile.mimeType,
                },
              },
            ],
          }
        : prompt;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scores: {
                type: Type.OBJECT,
                properties: scoreProperties,
                required: Object.keys(currentCriteria),
              },
              feedback: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.STRING, description: "จุดแข็งของผลงาน" },
                  improvements: { type: Type.STRING, description: "ข้อเสนอแนะเพื่อการปรับปรุง" },
                },
                required: ['strengths', 'improvements'],
              },
            },
            required: ['scores', 'feedback'],
          },
        },
      });
      
      const result = JSON.parse(response.text) as AssessmentResult;
      setAssessmentResult(result);

    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการประเมินผลงาน โปรดลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8 animate-fade-in">
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">ประเมินผลงานสื่อมีเดีย (Media Work Assessment)</h2>
            <button onClick={onGoHome} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center space-x-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>หน้าหลัก</span>
            </button>
        </div>
        <div className="space-y-4 mb-4">
           <select
            value={mediaType}
            onChange={(e) => {
              setMediaType(e.target.value);
              setAssessmentResult(null); // Reset result when type changes
            }}
            className="w-full bg-gray-700 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Media type"
          >
            <option value="วีดิโอคอนเทนต์">วีดิโอคอนเทนต์</option>
            <option value="หนังสั้น">หนังสั้น</option>
            <option value="ภาพยนตร์">ภาพยนตร์</option>
            <option value="สปอตโฆษณา">สปอตโฆษณา</option>
            <option value="โมชั่นวีดิโอ">โมชั่นวีดิโอ</option>
            <option value="แอนิเมชัน">แอนิเมชัน</option>
            <option value="สารคดี">สารคดี</option>
            <option value="มิวสิควิดีโอ">มิวสิควิดีโอ</option>
            <option value="ภาพถ่าย">ภาพถ่าย</option>
            <option value="ศิลปะ">ศิลปะ</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
           <input
            type="text"
            value={goalOfWork}
            onChange={(e) => setGoalOfWork(e.target.value)}
            placeholder="เป้าหมายของผลงานนี้คืออะไร? (เช่น เพิ่มการรับรู้, กระตุ้นยอดขาย)"
            className="w-full bg-gray-700 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Goal of the work"
          />
           <textarea
            value={workToAssess}
            onChange={(e) => {
              setWorkToAssess(e.target.value);
              if (videoForAssessment) {
                setVideoForAssessment(null);
                setFileName('');
              }
              if (imageForAssessment) {
                setImageForAssessment(null);
                setFileName('');
              }
            }}
            placeholder="วางเนื้อหา, สคริปต์... หรืออัปโหลดไฟล์ .txt / วิดีโอ / รูปภาพ"
            className="w-full bg-gray-700 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-40 resize-y disabled:bg-gray-700/50"
            aria-label="Work to assess"
            disabled={!!videoForAssessment || !!imageForAssessment}
          />
          {videoForAssessment && (
            <div className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-300 font-medium">วิดีโอสำหรับประเมิน:</p>
                    <button 
                        onClick={handleRemoveFile} 
                        className="text-red-500 hover:text-red-400 text-sm font-semibold flex items-center gap-1 transition-colors"
                        aria-label="ลบไฟล์วิดีโอ"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                        <span>ลบไฟล์</span>
                    </button>
                </div>
                <video 
                    src={URL.createObjectURL(videoForAssessment.file)} 
                    controls 
                    className="w-full max-w-sm mx-auto rounded-md"
                >
                    เบราว์เซอร์ของคุณไม่รองรับการแสดงวิดีโอ
                </video>
            </div>
           )}
           {imageForAssessment && (
            <div className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-300 font-medium">รูปภาพสำหรับประเมิน:</p>
                    <button 
                        onClick={handleRemoveFile} 
                        className="text-red-500 hover:text-red-400 text-sm font-semibold flex items-center gap-1 transition-colors"
                        aria-label="ลบไฟล์รูปภาพ"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                        <span>ลบไฟล์</span>
                    </button>
                </div>
                <img 
                    src={URL.createObjectURL(imageForAssessment.file)} 
                    alt="Preview for assessment"
                    className="w-full max-w-sm mx-auto rounded-md"
                />
            </div>
           )}
           <div className="flex items-center gap-4">
              <label htmlFor="media-upload" className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition flex items-center space-x-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
                 <span>อัปโหลดไฟล์ (TXT/Video/Image)</span>
              </label>
              <input id="media-upload" type="file" className="hidden" accept=".txt,text/plain,video/*,image/*" onChange={handleFileChange} />
              {isProcessingFile && <div className="loader !w-5 !h-5 !border-2"></div>}
              {fileName && !isProcessingFile && <span className="text-gray-400 text-sm truncate" title={fileName}>{fileName}</span>}
          </div>
        </div>
        <button onClick={handleAssessWork} disabled={loading || isProcessingFile} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition disabled:bg-gray-500 flex items-center justify-center h-10">
          {loading ? <div className="loader !w-6 !h-6 !border-2"></div> : 'ประเมินผลงาน'}
        </button>
        {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
      </section>
      
      {assessmentResult && (() => {
        const scoreValues = Object.values(assessmentResult.scores);
        const averageScore = scoreValues.length > 0 ? scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length : 0;
        const radius = 52;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (averageScore / 10) * circumference;

        return (
          <section className="bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 text-cyan-400 text-center">ผลการประเมิน: {mediaType}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

              {/* Overall Score Section */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded-xl">
                  <div className="relative w-40 h-40">
                      <svg className="w-full h-full" viewBox="0 0 120 120">
                          <circle
                              className="text-gray-700"
                              strokeWidth="10"
                              stroke="currentColor"
                              fill="transparent"
                              r={radius}
                              cx="60"
                              cy="60"
                          />
                          <circle
                              className="text-cyan-500"
                              strokeWidth="10"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r={radius}
                              cx="60"
                              cy="60"
                              transform="rotate(-90 60 60)"
                              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                          />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">
                              {averageScore.toFixed(1)}
                          </span>
                      </div>
                  </div>
                  <h4 className="text-xl font-semibold mt-4 text-gray-200">คะแนนโดยรวม</h4>
              </div>

              {/* Details Section */}
              <div className="lg:col-span-3">
                 {/* Scores Breakdown */}
                <div>
                  <h4 className="text-xl font-semibold mb-4 text-gray-200">คะแนนตามเกณฑ์</h4>
                  <div className="space-y-4">
                    {Object.entries(assessmentResult.scores).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-300">{getCriteriaForMediaType(mediaType)[key]}</span>
                          <span className="font-bold text-cyan-400">{value} / 10</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${value * 10}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Feedback Breakdown */}
                <div className="mt-8">
                  <h4 className="text-xl font-semibold mb-4 text-gray-200">ข้อเสนอแนะจาก AI</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <h5 className="font-bold text-green-400 mb-2">จุดแข็ง (Strengths)</h5>
                      <p className="text-gray-300 whitespace-pre-wrap">{assessmentResult.feedback.strengths}</p>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <h5 className="font-bold text-yellow-400 mb-2">ข้อเสนอแนะเพื่อการปรับปรุง (Improvements)</h5>
                      <p className="text-gray-300 whitespace-pre-wrap">{assessmentResult.feedback.improvements}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}
    </div>
  );
};

const DesignAssessmentModule = ({ onGoHome }) => {
  const [designConcept, setDesignConcept] = useState('');
  const [designAudience, setDesignAudience] = useState('');
  const [designGoal, setDesignGoal] = useState('');
  const [designImages, setDesignImages] = useState<Array<{ file: File, base64: string, mimeType: string }>>([]);
  const [assessmentResult, setAssessmentResult] = useState<DesignAssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
          setError('');
          const newImagesPromises = Array.from(files).map(file => {
              if (!file.type.startsWith('image/')) {
                  console.warn(`Skipping non-image file: ${file.name}`);
                  return Promise.resolve(null);
              }
              return fileToBase64(file).then(({ base64, mimeType }) => ({ file, base64, mimeType }));
          });

          try {
              const newImages = (await Promise.all(newImagesPromises)).filter((image): image is { file: File; base64: string; mimeType: string; } => image !== null);
              if (newImages.length === 0 && files.length > 0) {
                  setError('ไฟล์ที่เลือกไม่ใช่รูปภาพที่ถูกต้อง');
                  return;
              }
              setDesignImages(prev => [...prev, ...newImages]);
          } catch (err) {
              console.error(err);
              setError('เกิดข้อผิดพลาดในการประมวลผลไฟล์ภาพ');
          }
      }
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
      setDesignImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleAssessDesign = async () => {
    if (!designConcept.trim() || !designAudience.trim() || !designGoal.trim() || designImages.length === 0) {
        setError('กรุณากรอกข้อมูลและอัปโหลดรูปภาพให้ครบถ้วน');
        return;
    }
    setError('');
    setLoading(true);
    setAssessmentResult(null);

    try {
        const textPart = {
            text: `คุณคือผู้เชี่ยวชาญด้านการออกแบบและ UX/UI โปรดประเมินผลงานออกแบบที่แนบมานี้เป็นชุดเดียวกัน (เช่น แผ่นพับหลายหน้า, หนังสือ, หรือชุดโพสต์โซเชียล) ตามเกณฑ์ที่กำหนด โดยให้คะแนนแต่ละเกณฑ์ 1-10 พร้อมทั้งให้ความคิดเห็นเกี่ยวกับจุดแข็งและข้อเสนอแนะเพื่อการปรับปรุง ผลลัพธ์ทั้งหมดต้องเป็นภาษาไทย โดยพิจารณาจากข้อมูลต่อไปนี้:

            - แนวคิดการออกแบบ: "${designConcept}"
            - กลุ่มเป้าหมาย: "${designAudience}"
            - เป้าหมายของการออกแบบ: "${designGoal}"

            เกณฑ์การประเมิน:
            1. ความสวยงาม (visualAppeal): การใช้สี, สไตล์, ความสวยงามโดยรวม
            2. ความชัดเจนและการใช้งาน (usabilityClarity): ความง่ายต่อการเข้าใจ, การใช้งานไม่ซับซ้อน
            3. ความคิดสร้างสรรค์ (originality): ความแปลกใหม่, ความโดดเด่นไม่ซ้ำใคร
            4. องค์ประกอบด้านการออกแบบ (designComposition): การจัดวาง (layout), ลำดับชั้นของข้อมูล (hierarchy), ความสมดุล (balance), และการใช้พื้นที่ว่าง (whitespace)
            5. ความสอดคล้องกับเป้าหมาย (alignmentWithGoal): การออกแบบตอบโจทย์เป้าหมายที่ตั้งไว้ได้ดีเพียงใด

            โปรดตอบกลับในรูปแบบ JSON เท่านั้น`
        };
        const imageParts = designImages.map(image => ({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
            },
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, ...imageParts] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scores: {
                            type: Type.OBJECT,
                            properties: {
                                visualAppeal: { type: Type.INTEGER, description: "คะแนนความสวยงาม (1-10)" },
                                usabilityClarity: { type: Type.INTEGER, description: "คะแนนความชัดเจนและการใช้งาน (1-10)" },
                                originality: { type: Type.INTEGER, description: "คะแนนความคิดสร้างสรรค์ (1-10)" },
                                designComposition: { type: Type.INTEGER, description: "คะแนนองค์ประกอบด้านการออกแบบ (1-10)" },
                                alignmentWithGoal: { type: Type.INTEGER, description: "คะแนนความสอดคล้องกับเป้าหมาย (1-10)" },
                            },
                            required: ['visualAppeal', 'usabilityClarity', 'originality', 'designComposition', 'alignmentWithGoal'],
                        },
                        feedback: {
                            type: Type.OBJECT,
                            properties: {
                                strengths: { type: Type.STRING, description: "จุดแข็งของการออกแบบ" },
                                improvements: { type: Type.STRING, description: "ข้อเสนอแนะเพื่อการปรับปรุง" },
                            },
                            required: ['strengths', 'improvements'],
                        },
                    },
                    required: ['scores', 'feedback'],
                },
            },
        });

        const result = JSON.parse(response.text) as DesignAssessmentResult;
        setAssessmentResult(result);

    } catch (err) {
        console.error(err);
        setError('เกิดข้อผิดพลาดในการประเมินผลงานออกแบบ โปรดลองอีกครั้ง');
    } finally {
        setLoading(false);
    }
  };
  
  const scoreLabels: { [key in keyof DesignAssessmentResult['scores']]: string } = {
      visualAppeal: "ความสวยงาม (Visual Appeal)",
      usabilityClarity: "ความชัดเจนและการใช้งาน (Usability & Clarity)",
      originality: "ความคิดสร้างสรรค์ (Originality)",
      designComposition: "องค์ประกอบด้านการออกแบบ (Composition)",
      alignmentWithGoal: "ความสอดคล้องกับเป้าหมาย (Goal Alignment)"
  };

  const renderAssessmentResult = () => {
    if (!assessmentResult) return null;

    const scores = assessmentResult.scores;
    const averageScore = (scores.visualAppeal + scores.usabilityClarity + scores.originality + scores.alignmentWithGoal + scores.designComposition) / 5;
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (averageScore / 10) * circumference;

    return (
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
        <h3 className="text-2xl font-bold mb-6 text-cyan-400 text-center">ผลการประเมินการออกแบบ</h3>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Overall Score Section */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded-xl">
              <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 120 120">
                      <circle
                          className="text-gray-700"
                          strokeWidth="10"
                          stroke="currentColor"
                          fill="transparent"
                          r={radius}
                          cx="60"
                          cy="60"
                      />
                      <circle
                          className="text-emerald-500"
                          strokeWidth="10"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r={radius}
                          cx="60"
                          cy="60"
                          transform="rotate(-90 60 60)"
                          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                      />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                          {averageScore.toFixed(1)}
                      </span>
                  </div>
              </div>
              <h4 className="text-xl font-semibold mt-4 text-gray-200">คะแนนโดยรวม</h4>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-3">
             {/* Scores Breakdown */}
            <div>
              <h4 className="text-xl font-semibold mb-4 text-gray-200">คะแนนตามเกณฑ์</h4>
              <div className="space-y-4">
                {Object.entries(assessmentResult.scores).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">{scoreLabels[key]}</span>
                      <span className="font-bold text-cyan-400">{value} / 10</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${value * 10}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Feedback Breakdown */}
            <div className="mt-8">
              <h4 className="text-xl font-semibold mb-4 text-gray-200">ข้อเสนอแนะจาก AI</h4>
              <div className="space-y-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h5 className="font-bold text-green-400 mb-2">จุดแข็ง (Strengths)</h5>
                  <p className="text-gray-300 whitespace-pre-wrap">{assessmentResult.feedback.strengths}</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h5 className="font-bold text-yellow-400 mb-2">ข้อเสนอแนะเพื่อการปรับปรุง (Improvements)</h5>
                  <p className="text-gray-300 whitespace-pre-wrap">{assessmentResult.feedback.improvements}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-8 animate-fade-in">
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">ประเมินผลงานการออกแบบ (Design Assessment)</h2>
            <button onClick={onGoHome} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center space-x-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>หน้าหลัก</span>
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="space-y-4">
             <input type="text" value={designConcept} onChange={(e) => setDesignConcept(e.target.value)} placeholder="แนวคิดการออกแบบ" className="w-full bg-gray-700 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
             <input type="text" value={designAudience} onChange={(e) => setDesignAudience(e.target.value)} placeholder="กลุ่มเป้าหมาย" className="w-full bg-gray-700 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
             <input type="text" value={designGoal} onChange={(e) => setDesignGoal(e.target.value)} placeholder="เป้าหมายของการออกแบบ" className="w-full bg-gray-700 p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div className="flex flex-col bg-gray-700/50 rounded-lg p-4 space-y-4">
             {designImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {designImages.map((image, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img src={URL.createObjectURL(image.file)} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleRemoveImage(index)} className="text-white bg-red-600 hover:bg-red-700 rounded-full p-1.5" aria-label={`ลบรูปภาพ ${index + 1}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                 <label htmlFor="file-upload" className="cursor-pointer text-cyan-400 hover:text-cyan-300 font-semibold">
                     <span>{designImages.length > 0 ? 'เพิ่มรูปภาพ' : 'อัปโหลดรูปภาพ'}</span>
                     <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp, image/heic, image/heif, image/*" onChange={handleImageChange} multiple />
                 </label>
                 <p className="text-xs text-gray-500 mt-1">สามารถเลือกได้หลายไฟล์</p>
            </div>
          </div>
        </div>
        <button onClick={handleAssessDesign} disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded transition disabled:bg-gray-500 flex items-center justify-center h-10">
          {loading ? <div className="loader !w-6 !h-6 !border-2"></div> : 'ประเมินงานออกแบบ'}
        </button>
        {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
      </section>
      
      {renderAssessmentResult()}

    </div>
  );
};

const UserGuideModule = ({ onGoHome }) => {
  return (
    <div className="container mx-auto p-4 space-y-8 animate-fade-in">
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-cyan-400">คู่มือการใช้เครื่องมือ AI Creativity Tool</h2>
            <button onClick={onGoHome} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center space-x-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>หน้าหลัก</span>
            </button>
        </div>
        <div className="space-y-8">
            {/* Creative Corner Guide */}
            <div className="bg-gray-700/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-cyan-400 mb-3">1. สร้างสรรค์ไอเดีย (Creative Corner)</h3>
                <p className="mb-4 text-gray-300">เครื่องมือนี้ช่วยระดมสมอง สร้างไอเดียสำหรับวิดีโอสั้น สร้างภาพตัวอย่าง และพัฒนาสคริปต์พร้อมถ่ายทำ</p>
                <h4 className="font-semibold text-gray-200 mb-2">ขั้นตอนการใช้งาน:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>ไปที่หน้า "สร้างสรรค์ไอเดีย"</li>
                    <li>กรอกข้อมูล 3 ช่อง: <strong className="text-cyan-300">หัวข้อ/ผลิตภัณฑ์</strong>, <strong className="text-cyan-300">กลุ่มเป้าหมาย</strong>, และ <strong className="text-cyan-300">เป้าหมายของคอนเทนต์</strong></li>
                    <li>กดปุ่ม <strong className="text-cyan-300">"สร้างไอเดีย"</strong> AI จะเสนอ 3 ไอเดียให้เลือก</li>
                    <li>สำหรับแต่ละไอเดีย คุณสามารถ:
                        <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                            <li><strong>สร้างภาพตัวอย่าง:</strong> กดปุ่มเพื่อสร้างภาพประกอบคอนเซ็ปต์</li>
                            <li><strong>สร้างสคริปต์:</strong> กดปุ่มเพื่อเขียนสคริปต์ถ่ายทำโดยละเอียด</li>
                            <li><strong>ฟังเสียงบรรยาย:</strong> ในตารางสคริปต์ กดไอคอนรูปลำโพงเพื่อฟังเสียงบรรยายแต่ละฉาก</li>
                            <li><strong>บันทึกสคริปต์:</strong> กดปุ่มเพื่อดาวน์โหลดสคริปต์เป็นไฟล์ .txt</li>
                        </ul>
                    </li>
                </ol>
            </div>

            {/* Media Assessment Guide */}
            <div className="bg-gray-700/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-indigo-400 mb-3">2. ประเมินผลงานสื่อมีเดีย (Media Work Assessment)</h3>
                <p className="mb-4 text-gray-300">วิเคราะห์และให้คะแนนผลงานมีเดียประเภทต่างๆ ตามเกณฑ์มาตรฐานมืออาชีพ เพื่อหาจุดแข็งและแนวทางพัฒนา</p>
                 <h4 className="font-semibold text-gray-200 mb-2">ขั้นตอนการใช้งาน:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>ไปที่หน้า "ประเมินผลงานสื่อมีเดีย"</li>
                    <li>เลือก <strong className="text-indigo-300">ประเภทของสื่อ</strong> จากเมนู (เช่น ภาพยนตร์, สปอตโฆษณา, ภาพถ่าย)</li>
                    <li>ระบุ <strong className="text-indigo-300">เป้าหมายของผลงาน</strong></li>
                    <li>นำผลงานที่ต้องการประเมินใส่ในระบบ โดยมี 2 วิธี:
                         <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                            <li><strong>วางข้อความ:</strong> คัดลอกสคริปต์หรือเนื้อหามาวางในกล่องข้อความ</li>
                            <li><strong>อัปโหลดไฟล์:</strong> กดปุ่ม "อัปโหลดไฟล์" เพื่อเลือกไฟล์ .txt หรือไฟล์วิดีโอ</li>
                        </ul>
                    </li>
                    <li>กดปุ่ม <strong className="text-indigo-300">"ประเมินผลงาน"</strong> AI จะแสดงผลเป็นคะแนนในแต่ละเกณฑ์ พร้อมบอกจุดแข็งและข้อเสนอแนะ</li>
                </ol>
            </div>

            {/* Design Assessment Guide */}
            <div className="bg-gray-700/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-emerald-400 mb-3">3. ประเมินผลงานการออกแบบ (Design Assessment)</h3>
                <p className="mb-4 text-gray-300">ประเมินงานออกแบบภาพนิ่ง เช่น โปสเตอร์, UI, หรือชุดภาพโฆษณาตามหลักการออกแบบ</p>
                <h4 className="font-semibold text-gray-200 mb-2">ขั้นตอนการใช้งาน:</h4>
                 <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>ไปที่หน้า "ประเมินผลงานการออกแบบ"</li>
                    <li>กรอกข้อมูล 3 ช่อง: <strong className="text-emerald-300">แนวคิดการออกแบบ</strong>, <strong className="text-emerald-300">กลุ่มเป้าหมาย</strong>, และ <strong className="text-emerald-300">เป้าหมายของการออกแบบ</strong></li>
                    <li><strong className="text-emerald-300">อัปโหลดรูปภาพ</strong> ผลงานที่ต้องการประเมิน (สามารถอัปโหลดได้หลายภาพพร้อมกัน)</li>
                    <li>กดปุ่ม <strong className="text-emerald-300">"ประเมินงานออกแบบ"</strong> AI จะแสดงผลคะแนนโดยรวม, คะแนนตามเกณฑ์ย่อย, และข้อเสนอแนะ</li>
                </ol>
            </div>
        </div>
      </section>
    </div>
  );
};

const CreatorModule = ({ onGoHome }) => {
  const creatorImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAHgA8MDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigA'
  return (
    <div className="container mx-auto p-4 flex justify-center items-center animate-fade-in" style={{ minHeight: 'calc(100vh - 200px)' }}>
       <div className="relative w-full max-w-lg bg-gray-800 p-8 rounded-2xl shadow-2xl text-center">
         <button onClick={onGoHome} className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white font-bold p-2 rounded-full transition text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
         </button>
         
         <img src={creatorImage} alt="ฐากร อยู่วิจิตร" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-cyan-500 shadow-lg" />
         
         <h2 className="text-3xl font-bold text-cyan-400 mb-2">ฐากร อยู่วิจิตร</h2>
         <h3 className="text-lg text-gray-300 mb-1">Multimedia Technology Teacher & AI Developer</h3>
         <p className="text-md text-gray-400 mb-4">
            คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยเทคโนโลยีราชมงคลสุวรรณภูมิ
         </p>

         <div className="border-t border-gray-700 my-6"></div>

         <h4 className="text-lg font-semibold text-cyan-400 mb-2">แนวคิดในการออกแบบเครื่องมือ</h4>
         <p className="text-gray-400 mb-6 px-4">
          เครื่องมือนี้ถูกออกแบบมาเพื่อเป็นผู้ช่วยสำหรับนักสร้างสรรค์คอนเทนต์และนักออกแบบ ช่วยลดขั้นตอนการทำงานที่ซับซ้อน ตั้งแต่การระดมสมองไปจนถึงการประเมินผลงาน เพื่อให้ผู้ใช้งานสามารถมุ่งเน้นไปที่การสร้างสรรค์ผลงานที่มีคุณภาพได้อย่างเต็มที่
         </p>
         
         <div className="flex justify-center space-x-6">
            <a href="mailto:thakorn.yoo@gmail.com" className="text-gray-400 hover:text-cyan-400 transition" aria-label="Email">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
               </svg>
            </a>
            <a href="https://www.facebook.com/thakorn.yoo/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
            </a>
         </div>
      </div>
    </div>
  );
};


const App = () => {
  const [user, setUser] = useState<{ user: string, email: string } | null>(null);
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    // Check if user is already logged in from a previous session
    const storedUser = localStorage.getItem('ai-creativity-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentPage('welcome');
    }
  }, []);

  const handleLogin = (userData: { user: string, email: string }) => {
    setUser(userData);
    localStorage.setItem('ai-creativity-user', JSON.stringify(userData));
    setCurrentPage('welcome');
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ai-creativity-user');
    setCurrentPage('login');
  }

  const handleGoHome = () => {
    setCurrentPage('welcome');
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <Welcome onNavigate={setCurrentPage} />;
      case 'creativeCorner':
        return <CreativeCorner onGoHome={handleGoHome} />;
      case 'assessment':
        return <AssessmentModule onGoHome={handleGoHome} />;
      case 'designAssessment':
        return <DesignAssessmentModule onGoHome={handleGoHome} />;
      case 'userGuide':
        return <UserGuideModule onGoHome={handleGoHome} />;
      case 'creator':
        return <CreatorModule onGoHome={handleGoHome} />;
      case 'login':
      default:
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <LoginModule onLogin={handleLogin} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {currentPage !== 'login' && <Header onGoHome={handleGoHome} user={user?.user} onLogout={handleLogout} />}
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);