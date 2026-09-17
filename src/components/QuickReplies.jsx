function QuickReplies({ quickReplies, onQuickReply }) {
  return (
    <div className='quick-replies'>
      {quickReplies.map((item) => (
        <button key={item} onClick={() => onQuickReply(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

export default QuickReplies;
