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

  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const { toggleTheme, theme } = useContext(DarkModeContext);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (isTyping || !input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setIsTyping(true);

    try {
      const genAI = getGenAI();

      const textModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are the official assistant of PAUBRA — a mobile platform built for workers and clients.

Always speak as PAUBRA’s representative. Do not call yourself Gemini, AI, chatbot, or assistant of any developer. Do not mention Ian Castillo.

About the PAUBRA app:
- PAUBRA is a mobile service platform that connects skilled workers with clients.
- Workers can register for free, set up a profile, and offer their services.
- Clients can search for services, view worker profiles, and book workers based on needs, ratings, and popularity.
- Worker popularity is based on successful transactions and affects search rankings.

Additional info:
- The app is currently not available on the Play Store as it is still being improved.
- If someone is interested in becoming a provider (someone who manages and earns from a team of workers), ask them to message our Facebook page: https://www.facebook.com/profile.php?id=61579985695081
- If a user asks a question you can’t answer, or if they want help beyond what the assistant can offer, politely refer them to our Facebook page.

Handling off-topic questions:
- If the user asks a question not related to PAUBRA, you're allowed to answer it using your general knowledge — as long as it’s appropriate and helpful.
- After answering, kindly steer the conversation back to PAUBRA with a follow-up like:
  “By the way, if you need help with anything about the PAUBRA app, feel free to ask!”

Tone and rules:
1. Keep the tone friendly, respectful, and informative — like a real human assistant.
2. Use light humor if the user is joking.
3. Do not invent features or information that isn’t officially part of the PAUBRA platform.
4. Never share personal opinions or unverified facts about the business.
5. If the user asks in **Tagalog**, respond in **Tagalog**.
`,
      });

      const conversation = messages
        .map(
          (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text || ""}`
        )
        .join("\n");

      const prompt = `${conversation}\nUser: ${input}\nAssistant:`;

      const result = await textModel.generateContent(prompt);
      const aiResponse = result.response.text();

      setMessages((prev) => [...prev, { role: "ai", text: aiResponse }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);

      if (error.message.includes("429")) {
        if (currentKeyIndex < apiKeys.length - 1) {
          currentKeyIndex++;
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
  };

  const handleRefresh = () => {
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
                  <span>Ian's Assistant</span>
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
                <span>Ian's Assistant</span>
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
            />
            <RiSendPlane2Fill onClick={handleSend} className="sendIcon" />
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
