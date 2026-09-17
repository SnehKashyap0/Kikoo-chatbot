function ChatHeader({ onClose }) {
  return (
    <div className='chat-header'>
      <div className='header-left'>
        <div className='bot-avatar'>
          <img src='/bot-avatar.png' alt='Kikoo Assistant' />
        </div>

        <div>
          <h2>Kikoo Assistant</h2>

          <div className='online'>
            <span></span>
            Online
          </div>
        </div>
      </div>

      <button className='close-btn' onClick={onClose}>
        <i className='fa-solid fa-xmark'></i>
      </button>
    </div>
  );
}

export default ChatHeader;
