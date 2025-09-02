import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy } from "lucide-react";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [review, setReview] = useState("");
  const [fixedCode, setFixedCode] = useState(""); 
  const [copied, setCopied] = useState(false);
  const reviewEndRef = useRef(null);

  const handleReview = async () => {
    try {
      const res = await axios.post(
  `${import.meta.env.VITE_BACKEND_URL}/review`,
  { code, language }
);


      if (res.data && res.data.review) {
        const reviewText = res.data.review;
        setReview(reviewText);

       
        const codeMatch = reviewText.match(/```[\s\S]*?```/);
        if (codeMatch) {
          const cleanCode = codeMatch[0]
            .replace(/```[a-zA-Z]*/g, "")
            .replace(/```/g, "")
            .trim();
          setFixedCode(cleanCode);
        } else {
          setFixedCode("");
        }
      } else {
        setReview("No review returned from Gemini.");
      }
    } catch (err) {
      console.error("Error fetching review:", err);
      setReview(err.response?.data?.review || "Error fetching review.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode =
        code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleCopy = () => {
    if (!fixedCode) return;
    navigator.clipboard.writeText(fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  
  useEffect(() => {
    reviewEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [review]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "#121212",
      }}
    >
      {/* Code Input */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          background: "#1e1e1e",
          color: "white",
        }}
      >
        <h2>Write your code</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
        <textarea
          style={{
            width: "100%",
            height: "75%",
            marginTop: "10px",
            background: "#2e2e2e",
            color: "white",
            fontFamily: "monospace",
            borderRadius: "5px",
            padding: "8px",
            resize: "both", 
          }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleReview}
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            cursor: "pointer",
            borderRadius: "5px",
            background: "#4caf50",
            color: "#fff",
            border: "none",
          }}
        >
          Review Code
        </button>
      </div>

      {/* Gemini Review Output */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          background: "#121212",
          color: "white",
          overflowY: "auto",
          lineHeight: "1.6",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        <h2 style={{ display: "flex", alignItems: "center" }}>
          Code Review
        </h2>

        {/* Render raw review */}
        <div style={{ whiteSpace: "pre-wrap" }}>{review}</div>

        {/* Show extracted code block with highlighting + copy */}
        {fixedCode && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <h3 style={{ marginRight: "10px" }}>Suggested Fix:</h3>
              <button
                onClick={handleCopy}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background: "#333",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Copy size={16} /> {copied ? "Copied!" : "Copy Fix"}
              </button>
            </div>
            <SyntaxHighlighter language={language} style={oneDark}>
              {fixedCode}
            </SyntaxHighlighter>
          </div>
        )}

        <div ref={reviewEndRef} />
      </div>
    </div>
  );
}

export default App;