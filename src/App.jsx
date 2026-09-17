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

  const sendMessage = async () => {
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

    try {
      const response = await fetch(
        "https://bot-ai-1-372t.onrender.com/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userText,
          }),
        },
      );
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: data.answer,
        },
      ]);
    } catch (err) {
      console.error("API error", err);
    }
  };

  const handleQuickReply = async (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text: text,
      },
    ]);

    try {
      const response = await fetch(
        "https://bot-ai-1-372t.onrender.com/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        },
      );

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: data.answer,
        },
      ]);
    } catch (error) {
      console.error("API Error:", error);
    }
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
          {/* Header */}
          <div className='chat-header'>
            <div className='header-left'>
              <div className='bot-avatar'>🐣</div>

              <div>
                <h2>Kikoo Assistant</h2>

                <div className='online'>
                  <span></span>
                  Online
                </div>
              </div>
            </div>

            <button className='close-btn' onClick={closeChat}>
              ×
            </button>
          </div>

          {/* Messages */}
          <div className='chat-body'>
            <div className='welcome'>
              <div className='welcome-avatar'>🐣</div>

              <h3>Hi there! 👋</h3>

              <p>I'm here to help you with Kikoo.</p>
            </div>

            <div className='messages'>
              {messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.type}`}>
                  {msg.type === "bot" && <div className='small-avatar'>🐣</div>}

                  <div className='message-content'>
                    <div className='message-bubble'>
                      {renderMessage(msg.text)}
                    </div>

                    <span className='message-time'>Just now</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick replies */}
            <div className='quick-replies'>
              {quickReplies.map((item) => (
                <button key={item} onClick={() => handleQuickReply(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className='chat-footer'>
            <div className='input-wrapper'>
              <input
                type='text'
                placeholder='Type your message...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button className='send-btn' onClick={sendMessage}>
                ↑
              </button>
            </div>

            <div className='powered'>Powered by Kikoo</div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
