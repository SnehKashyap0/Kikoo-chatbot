import { useState, useRef, useEffect } from "react";

function ChatFooter({
  message,
  setMessage,
  onSend,
  setVoiceDraft,
  speaking,
  onStopSpeaking,
}) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const wantListening = useRef(false); 
  const ignoreResults = useRef(false); 
  const baseText = useRef(""); 
  const finalText = useRef(""); 

  const stopMic = () => {
    wantListening.current = false;
    recRef.current?.stop();
    setListening(false);
  };

  useEffect(() => {
    return () => {
      wantListening.current = false;
      recRef.current?.stop();
    };
  }, []);

  const startMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input ke liye Chrome ya Edge use karo");
      return;
    }

    baseText.current = message.trim() ? message.trim() + " " : "";
    finalText.current = "";
    ignoreResults.current = false;
    wantListening.current = true;

    const rec = new SR();
    rec.lang = "en-IN"; 
    rec.continuous = true; 
    rec.interimResults = true; 

    rec.onstart = () => setListening(true);

    rec.onresult = (e) => {
      if (ignoreResults.current) return;
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText.current += t;
        else interim += t;
      }
      setMessage(
        (baseText.current + finalText.current + interim).replace(/\s+/g, " "),
      );
      setVoiceDraft(true); 
    };

    rec.onerror = (e) => {
      console.error("Mic error:", e.error, e.message);
      if (e.error !== "no-speech" && e.error !== "aborted") {
        wantListening.current = false;
      }
    };

    rec.onend = () => {
      console.log("Mic ended, wantListening =", wantListening.current);
      if (wantListening.current) {
        setTimeout(() => {
          if (!wantListening.current) return;
          try {
            rec.start();
          } catch (err) {
            console.error("Restart failed:", err);
            wantListening.current = false;
            setListening(false);
          }
        }, 300);
      } else {
        setListening(false);
      }
    };

    rec.start();
    recRef.current = rec;
  };

  const toggleMic = () => {
    if (speaking) {
      onStopSpeaking();
      return;
    }
    if (wantListening.current) stopMic("mic button dabaya");
    else startMic();
  };

  const handleSend = () => {
    ignoreResults.current = true;
    stopMic();
    onSend();
  };

  return (
    <div className='chat-footer'>
      <div className='input-wrapper'>
        <input
          type='text'
          placeholder={
            listening
              ? "Listening..."
              : speaking
                ? "Speaking..."
                : "Type your message..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button
          className={`mic-btn ${listening ? "listening" : ""} ${speaking ? "speaking" : ""}`}
          onClick={toggleMic}
          type='button'
          placeholder={
            listening
              ? "Listening..."
              : speaking
                ? "Speaking..."
                : "Type your message..."
          }
        >
          <i
            className={speaking ? "fa-solid fa-stop" : "fa-solid fa-microphone"}
          ></i>
        </button>

        <button className='send-btn' onClick={handleSend}>
          ↑
        </button>
      </div>

      <div className='powered'>Powered by Kikoo</div>
    </div>
  );
}

export default ChatFooter;
