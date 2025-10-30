import "./styles/AIAvatar.css";

const AIAvatar = ({ isLoading = false, isStreaming = false }) => {
    return (
        <div className={`ai-avatar ${isLoading ? 'loading' : ''} ${isStreaming ? 'streaming' : ''}`}>
           <svg viewBox="0 0 100 100" className="avatar-svg">
    <defs>
        <linearGradient id="coreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
    </defs>
    <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="none" 
        stroke="url(#coreGradient)" 
        strokeWidth="7.5" 
        className="avatar-ring" 
    />
</svg>
            <div className="avatar-icon">
                <span className="material-icons">auto_awesome</span>
            </div>
        </div>
    );
};

export default AIAvatar;