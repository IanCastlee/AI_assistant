import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Chatbot from "../chatbot/Chatbot";
import "./App.css";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chatbot />} />
      </Routes>
    </Router>
  );
}

export default App;
