import { useEffect, useRef, useState } from 'react';

import './App.css'
import Answer from './components/Answers';
import RecentSearch from './components/RecentSearch';
import QuestionAnswer from './components/QuestionAnswer';


function App() {

  const [question, setquestion] = useState('');
  const [result, setResult] = useState([]);
  const [recentHistory, setRecenthistory] = useState(getInitialQuestion());
  const [selectedHistory, setselectedHistory] = useState('');
  const scrollToAns = useRef();
  const [Loader, setLoader] = useState(false);
  const [listening, setListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);


  function getInitialQuestion() {
    if (localStorage.getItem('history')) {
      return JSON.parse(localStorage.getItem('history'))
    }
    return [];
  }

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log(event)
      setquestion(transcript);
      setTimeout(() => askquestion(transcript), 500);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

    } catch (err) {
      alert("Camera access denied or not supported");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/png");
    setSelectedImage(imageData);

    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());

    setCameraOpen(false);
  };

  const askquestion = async (voiceText) => {
    if (Loader) return;

    const finalQuestion = voiceText || question;
    if (!finalQuestion && !selectedHistory && !selectedImage) return;

    try {

      const payloadData = finalQuestion ? finalQuestion : selectedHistory;
      const partsArray = [];

      if (payloadData) {
        partsArray.push({ text: payloadData });
      }

      if (selectedImage) {
        const base64Data = selectedImage.split(",")[1];
        partsArray.push({
          inline_data: {
            mime_type: "image/png",
            data: base64Data
          }
        });
      }

      const payload = { contents: [{ parts: partsArray }] };

      setLoader(true);

      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      let URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`



      const response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(URL);
      }

      const data = await response.json();
      if (finalQuestion) {
        let history = JSON.parse(localStorage.getItem('history')) || [];

        history = [finalQuestion, ...history];

        history = history.map((item) =>
          item.charAt(0).toUpperCase() + item.slice(1).trim()
        );

        history = [...new Set(history)];

        localStorage.setItem('history', JSON.stringify(history));
        setRecenthistory(history);
      }

      if (!data.candidates || !data.candidates.length) {
        throw new Error("No response from API");
      }

      let dataString =
        data.candidates[0]?.content?.parts?.[0]?.text ||
        "No answer received.";


      dataString = dataString.split("* ").map((item) => item.trim());
      setResult(prev => [
        ...prev,
        { type: 'q', text: payloadData },
        { type: 'a', text: dataString }
      ]);

      setquestion('');
      setSelectedImage(null);
      setLoader(false);

    } catch (error) {
      console.error("Error:", error);
      setLoader(false);
    }
  };

  const isEnter = (event) => {
    if (event.key === 'Enter') askquestion();
  };

  useEffect(() => {
    if (selectedHistory) askquestion();
  }, [selectedHistory]);

  const [darkMode, setDarkMode] = useState('dark');

  useEffect(() => {
    if (darkMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (scrollToAns.current) {
      scrollToAns.current.scrollTo({
        top: scrollToAns.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [result]);

  return (
    <div>

      {Loader && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-zinc-800 px-8 py-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-black dark:text-white text-lg font-semibold">
              Please wait...
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 h-screen text-center">

        <select
          onChange={(event) => setDarkMode(event.target.value)}
          className='fixed  text-black bottom-0 p-5'
        >
          <option value="dark">light</option>
          <option value="light">Dark</option>
        </select>

        <RecentSearch
          recentHistory={recentHistory}
          setRecenthistory={setRecenthistory}
          setselectedHistory={setselectedHistory}
        />

        <div className="col-span-4 flex flex-col p-5 h-screen dark:bg-gray-400 bg-gray-900">

          <h1 className='!text-black gradient-text dark:!text-white font-semibold'>
            Hello user, ask me anything
          </h1>

          <div
            ref={scrollToAns}
            className="flex-1 overflow-y-auto text-white light:text-black mb-4"
          >
            <ul>
              {result.map((item, index) => (
                <QuestionAnswer
                  key={index}
                  item={item}
                  Answer={Answer}
                  index={index}
                />
              ))}
            </ul>
          </div>

          <div className="dark:bg-zinc-800 p-2 rounded-xl text-white flex flex-col sticky bottom-0">

            {cameraOpen && (
              <div className="mb-2 flex flex-col items-center">
                <video ref={videoRef} autoPlay className="w-64 rounded-lg" />
                <button
                  onClick={capturePhoto}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  Capture
                </button>
              </div>
            )}

            {selectedImage && (
              <div className="mb-2 relative inline-block">
                <img src={selectedImage} alt="preview" className="h-24 rounded-lg" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center">

              <button
                onClick={startListening}
                className={`ml-2 px-4 py-2 rounded-full text-white ${listening ? "bg-red-500 animate-pulse" : "bg-zinc-500"}`}
              >
                <i className="ri-mic-ai-line"></i>
              </button>

              <label className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-full cursor-pointer">
                <i className="ri-file-image-fill"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={startCamera}
                className="ml-2 px-4 py-2 bg-green-500 text-white rounded-full"
              >
                <i className="ri-camera-line"></i>
              </button>

              <input
                className="flex-1 p-2 border pl-4 ml-2 light:text-black  border-zinc-100  rounded-l-xl outline-none border-black light:border-zinc-100 "
                placeholder="Ask me anything..."
                onKeyDown={isEnter}
                type="text"
                value={question}
                onChange={(e) => setquestion(e.target.value)}
              />

              <button
                onClick={() => askquestion()}
                className="dark:text-white px-4 text-black rounded-r-xl text-white"
              >
                Ask
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;