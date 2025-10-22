import { useState, useRef } from "react"
import "./styles/Bottombar.css"

function Bottombar(){
    const [message, setMessage] = useState("");
    const [attachedFiles, setAttachedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const handleFileAttach = (e) => {
        const files = Array.from(e.target.files);
        setAttachedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (message.trim() || attachedFiles.length > 0) {
            console.log("Sending:", { message, files: attachedFiles });
            setMessage("");
            setAttachedFiles([]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const autoResize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    };

    return (
        <div className="bottom-bar">
            <div className="input-container">
                {/* Attached Files Preview - Mobile Only */}
                {attachedFiles.length > 0 && (
                    <div className="attached-files mobile-only">
                        {attachedFiles.map((file, index) => (
                            <div key={index} className="file-chip">
                                <span className="material-icons-outlined file-icon">description</span>
                                <span className="file-name">{file.name}</span>
                                <button 
                                    className="remove-file-btn"
                                    onClick={() => removeFile(index)}
                                >
                                    <span className="material-icons-outlined">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Input Area */}
                <div className="input-wrapper">
                    {/* Add Button - Desktop */}
                    <button 
                        className="input-action-btn add-btn desktop-only"
                        onClick={() => fileInputRef.current?.click()}
                        title="Add attachment"
                    >
                        <span className="material-icons-outlined">add</span>
                    </button>

                    {/* Attach Button - Mobile */}
                    <button 
                        className="input-action-btn attach-btn mobile-only"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach files"
                    >
                        <span className="material-icons-outlined">attach_file</span>
                    </button>

                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileAttach}
                        multiple
                        hidden
                    />

                    {/* Textarea */}
                    <textarea 
                        ref={textareaRef}
                        placeholder="Ask Cortex"
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            autoResize();
                        }}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />

                    {/* Research Chip - Desktop Only */}
                    <div className="research-chip desktop-only">
                        <span className="material-icons-outlined">search</span>
                        <span>research</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        {/* Image Button - Mobile Only */}
                        <button 
                            className="input-action-btn image-btn mobile-only"
                            title="Add image"
                        >
                            <span className="material-icons-outlined">image</span>
                        </button>

                        {/* Camera Button - Mobile Only */}
                        <button 
                            className="input-action-btn camera-btn mobile-only"
                            title="Take photo"
                        >
                            <span className="material-icons-outlined">photo_camera</span>
                        </button>

                        {/* More Options - Desktop */}
                        <button 
                            className="input-action-btn more-btn desktop-only"
                            title="More options"
                        >
                            <span className="material-icons-outlined">more_horiz</span>
                        </button>

                        {/* Voice Button */}
                        <button 
                            className="input-action-btn voice-btn"
                            title="Voice input"
                        >
                            <span className="material-icons-outlined">mic</span>
                        </button>
                        
                        {/* Send Button */}
                        <button 
                            className={`input-action-btn send-btn ${message.trim() || attachedFiles.length > 0 ? 'active' : ''}`}
                            onClick={handleSubmit}
                            disabled={!message.trim() && attachedFiles.length === 0}
                            title="Send message"
                        >
                            <span className="material-icons-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Character Count - Mobile Only */}
                <div className="input-info mobile-only">
                    <span className="char-count">{message.length} characters</span>
                    <span className="file-count">{attachedFiles.length} file(s) attached</span>
                </div>
            </div>
        </div>
    )
}

export default Bottombar;