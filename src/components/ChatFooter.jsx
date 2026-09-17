function ChatFooter({ message, setMessage, onSend }) {
  return (
    <div className='chat-footer'>
      <div className='input-wrapper'>
        <input
          type='text'
          placeholder='Type your message...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSend();
            }
          }}
        />

        <button className='send-btn' onClick={onSend}>
          ↑
        </button>
      </div>

      <div className='powered'>Powered by Kikoo</div>
    </div>
  );
}

export default ChatFooter;
