// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./Chatbot.scss";
import ppImage from "../src/assets/icons/paubraIcon.jpg";
import { CgClose } from "react-icons/cg";
import { LuRefreshCcw } from "react-icons/lu";
import { RiSendPlane2Fill } from "react-icons/ri";
import { motion } from "framer-motion";
import { DarkModeContext } from "../context/Darkmode";
import { WiMoonWaxingCrescent4 } from "react-icons/wi";
import { MdLightMode } from "react-icons/md";

// List of API keys
const apiKeys = [
  import.meta.env.VITE_GEMINI_API_KEY_1,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  import.meta.env.VITE_GEMINI_API_KEY_4,
  import.meta.env.VITE_GEMINI_API_KEY_5,
];

let currentKeyIndex = 0;
function getGenAI() {
  return new GoogleGenerativeAI(apiKeys[currentKeyIndex]);
}

function Chatbot() {
  const initialMessage = {
    role: "ai",
    text: `Hi! I'm the assistant of PAUBRA. Do you have any questions about the app? Are you interested in becoming a worker or a provider? Feel free to ask, and I'll do my best to help you.`,
  };

  // Load messages from localStorage if available
  const [messages, setMessages] = useState(() => {
    const storedMessages = localStorage.getItem("paubra-chat-messages");
    return storedMessages ? JSON.parse(storedMessages) : [initialMessage];
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const { toggleTheme, theme } = useContext(DarkModeContext);

  // Sync messages to localStorage on update
  useEffect(() => {
    localStorage.setItem("paubra-chat-messages", JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (sending || isTyping || !input.trim()) return;

    setSending(true);
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const genAI = getGenAI();

      const textModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are the official assistant of PAUBRA — a mobile platform built for workers and clients.

Always speak as PAUBRA’s representative. Do not refer to yourself as Gemini, AI, chatbot, or assistant of any developer. Do not mention Ian Castillo.

About the PAUBRA app:
- PAUBRA is a mobile service platform that connects skilled workers with clients.
- Workers can register for free, set up a profile, and offer their services.
- Clients can search for services, view worker profiles, and book workers based on needs, ratings, and popularity.
- Worker popularity is based on successful transactions and affects search rankings.

Important notes:
- The app is currently not available on the Play Store as it is still being improved.
- If someone is interested in becoming a provider (someone who manages and earns from a team of workers), direct them to message our official Facebook page: https://www.facebook.com/profile.php?id=61579985695081
- If a user asks something you cannot answer, or if their request goes beyond what you can assist with, politely refer them to our Facebook page for further support.

Handling off-topic questions:
- Do **not** answer questions that are not related to PAUBRA or its services.
- If the user asks something unrelated to the business, respond politely with something like:
  “Pasensya na po, makakatulong lang ako sa mga bagay na may kinalaman sa PAUBRA. Kung may iba pa kayong concern tungkol sa app, feel free to ask!”

Tone and rules:
1. Keep the tone friendly, respectful, and informative — like a real human assistant.
2. Use light humor only if the user is joking or casual, but stay professional.
3. Do not invent features or information that aren’t officially part of the PAUBRA platform.
4. Never share personal opinions or unverified claims about the business.
5. If the user asks in **Tagalog**, respond in **Tagalog**.
`,
      });

      const conversation = messages
        .map(
          (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text || ""}`
        )
        .join("\n");

      const prompt = `${conversation}\nUser: ${currentInput}\nAssistant:`;

      const result = await textModel.generateContent(prompt);
      const aiResponse = result.response.text();

      setMessages((prev) => [...prev, { role: "ai", text: aiResponse }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);

      if (error.message.includes("429")) {
        if (currentKeyIndex < apiKeys.length - 1) {
          currentKeyIndex++;
          setSending(false);
          return handleSend();
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              text: "🚫 All API keys reached their quota. Please try again tomorrow.",
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Sorry, something went wrong. Please try again.",
          },
        ]);
      }
    }

    setIsTyping(false);
    setSending(false);
  };

  // Clear messages and localStorage
  const handleRefresh = () => {
    localStorage.removeItem("paubra-chat-messages");
    setMessages([initialMessage]);
    setInput("");
    setConfirmationModal(false);
  };

  return (
    <div className="container">
      <div className="chatbot-container">
        <div className="heading">
          <div className="left">
            <img src={ppImage} alt="profile" />
            <span>Paubra AI Assistant</span>
          </div>
          <div className="right">
            <div className="togglebutton-wrapper" onClick={toggleTheme}>
              {theme === "light" ? (
                <WiMoonWaxingCrescent4 className="icon-mode-moon" />
              ) : (
                <MdLightMode className="icon-mode-sun" />
              )}
            </div>
            <LuRefreshCcw
              onClick={() => setConfirmationModal(true)}
              className="refresh"
            />
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message-wrapper ${msg.role}`}>
              {msg.role === "ai" && (
                <div className="ai-profile">
                  <img className="ai-image" src={ppImage} alt="ai" />
                </div>
              )}
              <div className={`chat-message ${msg.role}`}>
                {msg.text && <p>{msg.text}</p>}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-message-wrapper ai">
              <div className="ai-profile">
                <img className="ai-image" src={ppImage} alt="ai" />
                <span>Paubra's Assistant</span>
              </div>
              <div className="chat-message ai typing">
                <div className="dot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className="chat-input-wrapper">
            <input
              type="text"
              value={input}
              placeholder="Ask something..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={sending}
            />
            <RiSendPlane2Fill
              onClick={handleSend}
              className={`sendIcon ${sending ? "disabled" : ""}`}
            />
          </div>
        </div>

        {confirmationModal && (
          <div className="confirmation-overlay">
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="confirmation-modal"
            >
              <p>
                Are you sure you want to refresh the chat? This will clear the
                current conversation.
              </p>
              <div className="bottom">
                <button onClick={handleRefresh} className="btn-yes">
                  Yes, Refresh
                </button>
                <button
                  onClick={() => setConfirmationModal(false)}
                  className="btn-no"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chatbot;
