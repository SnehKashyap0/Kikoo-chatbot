import ChatHeader from "./components/ChatHeader";
import Welcome from "./components/Welcome";
import MessageList from "./components/MessageList";
import QuickReplies from "./components/QuickReplies";
import ChatFooter from "./components/ChatFooter";
import { useState } from "react";
import "./App.css";

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

  const callAPI = async (text) => {
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

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: data.answer || "Sorry I couldn't generate a response",
        },
      ]);
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

    const userText = message;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text: userText,
      },
    ]);

    setMessage("");

    callAPI(userText);
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
          />
        </div>
      )}
    </>
  );
}

export default App;
