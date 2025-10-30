import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./styles/CodeBlock.css";

const CodeBlock = ({ language, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${language || 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="code-block-wrapper">
            <div className="code-block-header">
                <span className="code-language">{language || 'plaintext'}</span>
                <div className="code-actions">
                    <button 
                        className="code-action-btn" 
                        onClick={handleDownload} 
                        title="Download code"
                    >
                        <span className="material-icons-outlined">download</span>
                    </button>
                    <button 
                        className="code-action-btn" 
                        onClick={handleCopy}
                        title={copied ? "Copied!" : "Copy code"}
                    >
                        {copied ? (
                            <>
                                <span className="material-icons-outlined">check</span>
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <span className="material-icons-outlined">content_copy</span>
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            <SyntaxHighlighter
                language={language || 'text'}
                style={oneDark}
                customStyle={{
                    margin: 0,
                    borderRadius: '0 0 8px 8px',
                    fontSize: '16px'
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeBlock;