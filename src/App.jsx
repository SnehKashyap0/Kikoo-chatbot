import ChatHeader from "./components/ChatHeader";
import Welcome from "./components/Welcome";
import MessageList from "./components/MessageList";
import QuickReplies from "./components/QuickReplies";
import ChatFooter from "./components/ChatFooter";
import { useState, useRef } from "react";
import "./App.css";

const toAudioUrl = (b64) => {
  if (b64.startsWith("data:")) return b64;
  const mime = b64.startsWith("UklGR")
    ? "audio/wav"
    : b64.startsWith("T2dnU")
      ? "audio/ogg"
      : "audio/mpeg"; 
  return `data:${mime};base64,${b64}`;
};

const renderMessage = (text) => {
  const parts = text.split(/(Instagram:|YouTube:|Facebook:|X \(Twitter\):)/);

  return parts.map((part, index) => {
    if (
      part === "Instagram:" ||
      part === "YouTube:" ||
      part === "Facebook:" ||
      part === "X (Twitter):"
    ) {
      return (
        <span key={index} className='social-label'>
          {part}
        </span>
      );
    }

    const urlRegex =
      /(https?:\/\/[^\s]+|www\.[^\s]+|(?:instagram|youtube|facebook|x)\.com\/[^\s]+)/g;

    return part.split(urlRegex).map((item, i) => {
      if (item.match(urlRegex)) {
        const href = item.startsWith("http") ? item : `https://${item}`;

        return (
          <a
            key={`${index}-${i}`}
            href={href}
            target='_blank'
            rel='noopener noreferrer'
          >
            {item}
          </a>
        );
      }

      return item;
    });
  });
};

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const audioCache = useRef(new Map());
  const audioRef = useRef(null);
  const speakToken = useRef(0);
  const [speaking, setSpeaking] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hi! 👋 Welcome to Kikoo.",
    },
    {
      id: 2,
      type: "bot",
      text: "How can I help you today?",
    },
  ]);

  const quickReplies = [
    "How to participate?",
    "Contest rules",
    "How to vote?",
    "Prizes",
  ];

  const stopSpeaking = () => {
    speakToken.current += 1; 
    audioRef.current?.pause();
    setSpeaking(false);
  };

  const speak = async (text) => {
    stopSpeaking(); 
    const myToken = speakToken.current;
    setSpeaking(true);

    try {
      let url = audioCache.current.get(text);

      if (!url) {
        const res = await fetch(import.meta.env.VITE_SPEAK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error(`Speak API error: ${res.status}`);

        const type = res.headers.get("content-type") || "";
        if (type.startsWith("audio/")) {
          url = URL.createObjectURL(await res.blob());
        } else {
          const data = await res.json();
          if (!data.audio) {
            console.log("speak response keys:", Object.keys(data));
            setSpeaking(false);
            return;
          }
          url = toAudioUrl(data.audio);
        }
        audioCache.current.set(text, url);
      }

      if (myToken !== speakToken.current) return;

      const audio = new Audio(url);
      window.debugAudioUrl = url;
      audioRef.current = audio;
      audio.onended = () => setSpeaking(false);
      await audio.play();
    } catch (err) {
      console.error(err);
      setSpeaking(false);
    }
  };

  const callAPI = async (text, viaVoice = false) => {
    setLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();
      const answer = data.answer || "Sorry I couldn't generate a response";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: answer,
        },
      ]);

      if (viaVoice && data.answer) speak(answer);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    stopSpeaking(); 

    const userText = message;
    const viaVoice = voiceDraft;
    setVoiceDraft(false);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text: userText,
      },
    ]);

    setMessage("");

    callAPI(userText, viaVoice);
  };

  const handleQuickReply = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text: text,
      },
    ]);

    callAPI(text);
  };

  const closeChat = () => {
    stopSpeaking();
    setIsClosing(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  return (
    <>
      {/* Your actual website */}
      <div className='website'>
        <h1>Kikoo</h1>
        <p>Website content goes here...</p>
      </div>

      {/* Floating Chat Button */}
      {!isOpen && (
        <button className='chat-button' onClick={() => setIsOpen(true)}>
          <span className='chat-icon'>💬</span>
          <span className='chat-label'>Chat with us</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-widget ${isClosing ? "closing" : ""}`}>
          <ChatHeader onClose={closeChat} />

          <div className='chat-body'>
            <Welcome />

            <MessageList
              messages={messages}
              renderMessage={renderMessage}
              loading={loading}
            />

            <QuickReplies
              quickReplies={quickReplies}
              onQuickReply={handleQuickReply}
            />
          </div>

          <ChatFooter
            message={message}
            setMessage={setMessage}
            onSend={sendMessage}
            setVoiceDraft={setVoiceDraft}
            speaking={speaking}
            onStopSpeaking={stopSpeaking}
          />
        </div>
      )}
    </>
  );
}

export default App;
