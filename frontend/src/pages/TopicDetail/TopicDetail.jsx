import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./TopicDetail.css";

export default function TopicDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [flipped, setFlipped] = useState({});

  useEffect(() => {
    async function fetchWords() {
      try {
        // Lấy thông tin chủ đề theo slug
        const topicRes = await axios.get(`http://localhost:3000/api/topics/name/${name}`);
        setTopicName(topicRes.data.name);

        // Lấy danh sách từ vựng theo topicId
        const wordsRes = await axios.get(`http://localhost:3000/api/words?topic=${topicRes.data._id || topicRes.data.id}`);
        setWords(wordsRes.data);
      } catch {
        setTopicName("Không tìm thấy chủ đề");
        setWords([]);
      }
    }
    fetchWords();
  }, [name]);

  // Xử lý lật flashcard
  const handleFlip = (idx) => {
    setFlipped((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="container" style={{ background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: 30, marginTop: 80 }}>
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Quay lại chủ đề
      </button>
      <h2 style={{ textAlign: "center", color: "#4a5568", margin: "20px 0 30px" }}>{topicName}</h2>
      <div className="flashcard-grid">
        {words.map((word, idx) => (
          <div
            className={`flashcard${flipped[idx] ? " flipped" : ""}`}
            key={idx}
            onClick={() => handleFlip(idx)}
            style={{ cursor: "pointer" }}
          >
            <div className="flashcard-inner">
              <div className="flashcard-front">
                <div className="word">{word.word}</div>
                <div className="pronunciation">{word.pronunciation}</div>
              </div>
              <div className="flashcard-back">
                <div className="translation">{word.translation}</div>
                <div className="example">{word.example}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}