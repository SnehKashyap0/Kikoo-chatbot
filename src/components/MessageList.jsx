import { useEffect, useRef } from "react";

function MessageList({ messages, renderMessage, loading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <div className='messages'>
      {messages.map((msg) => (
        <div key={msg.id} className={`message-row ${msg.type}`}>
          {msg.type === "bot" && (
            <div className='small-avatar'>
              <img src='/bot-avatar.png' alt='Kikoo Assistant' />
            </div>
          )}

          <div className='message-content'>
            <div className='message-bubble'>{renderMessage(msg.text)}</div>

            <span className='message-time'>Just now</span>
          </div>
        </div>
      ))}

      {loading && (
        <div className='message-row bot'>
          <div className='small-avatar'>
            <img src='/bot-avatar.png' alt='Kikoo Assistant' />
          </div>

          <div className='message-content'>
            <div className='message-bubble'>Typing...</div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef}></div>
    </div>
  );
}

export default MessageList;
