import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Test.css";

export default function Test() {
  const [topics, setTopics] = useState([]);
  const [step, setStep] = useState("select"); // select | chooseNum | test | result
  const [selectedTopic, setSelectedTopic] = useState("");
  const [words, setWords] = useState([]);
  const [testWords, setTestWords] = useState([]);
  const [numQuestions, setNumQuestions] = useState(6);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [time, setTime] = useState(0);
  const timer = useRef();

  // Lấy danh sách chủ đề
  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await axios.get("http://localhost:5000/api/topics");
        setTopics(res.data);
      } catch {
        setTopics([]);
      }
    }
    fetchTopics();
  }, []);

  // Lấy từ vựng theo chủ đề
  const fetchWords = async (topicId) => {
    try {
      if (topicId === "random") {
        // Lấy tất cả từ vựng của tất cả chủ đề
        let allWords = [];
        for (const topic of topics) {
          const res = await axios.get(`http://localhost:5000/api/words?topic=${topic._id || topic.id}`);
          allWords = allWords.concat(res.data);
        }
        return allWords;
      } else {
        const res = await axios.get(`http://localhost:5000/api/words?topic=${topicId}`);
        return res.data;
      }
    } catch {
      return [];
    }
  };

  // Khi chọn chủ đề
  const handleSelectTopic = async (topicId) => {
    setSelectedTopic(topicId);
    setStep("chooseNum");
    const ws = await fetchWords(topicId);
    setWords(ws);
  };

  // Tạo 4 đáp án trắc nghiệm cho mỗi câu hỏi
  function generateChoices(words, correctWord) {
    const wrongs = words
      .filter(w => w.translation !== correctWord.translation)
      .map(w => w.translation);
    const shuffledWrongs = wrongs.sort(() => 0.5 - Math.random()).slice(0, 3);
    const choices = [...shuffledWrongs, correctWord.translation].sort(() => 0.5 - Math.random());
    return choices;
  }

  // Khi chọn số câu hỏi và bắt đầu test
  const handleStartTest = () => {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numQuestions);
    const questions = selected.map(word => ({
      ...word,
      choices: generateChoices(words, word)
    }));
    setTestWords(questions);
    setAnswers(Array(numQuestions).fill(""));
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setSelected("");
    setShowFeedback(false);
    setStep("test");
    setTime(0);
    clearInterval(timer.current);
    timer.current = setInterval(() => setTime(t => t + 1), 1000);
  };

  // Chọn đáp án
  const handleSelectChoice = (choice) => {
    if (selected) return;
    setSelected(choice);
    setShowFeedback(true);
    setAnswers(ans => {
      const newAns = [...ans];
      newAns[current] = choice;
      return newAns;
    });
    if (choice === testWords[current].translation) setScore(s => s + 1);
  };

  // Câu tiếp theo hoặc kết thúc
  const handleNext = () => {
    if (current === testWords.length - 1) {
      setShowResult(true);
      setStep("result");
      clearInterval(timer.current);
    } else {
      setCurrent(c => c + 1);
      setSelected("");
      setShowFeedback(false);
    }
  };

  // Quay lại chọn chủ đề
  const handleBack = () => {
    setStep("select");
    setSelectedTopic("");
    setWords([]);
    setTestWords([]);
    setAnswers([]);
    setScore(0);
    setCurrent(0);
    setShowResult(false);
    setSelected("");
    setShowFeedback(false);
    setTime(0);
    clearInterval(timer.current);
  };

  // Giao diện chọn chủ đề
  if (step === "select") {
    return (
      <div className="test7-container">
        <h1 className="test7-title">🎯 Kiểm Tra Từ Vựng Theo Chủ Đề</h1>
        <div className="test7-topic-grid">
          <button className="test7-topic-card random" onClick={() => handleSelectTopic("random")}>
            <span role="img" aria-label="random">🔀</span> Ngẫu nhiên<br />
          </button>
          {topics.map(topic => (
            <button
              key={topic._id || topic.id}
              className={`test7-topic-card ${topic._id || topic.id}`}
              onClick={() => handleSelectTopic(topic._id || topic.id)}
            >
              {topic.icon ? <span style={{fontSize: "1.5em"}}>{topic.icon}</span> : null} {topic.name}
              <br />
              <small>{topic.count ? `${topic.count} từ vựng` : ""}</small>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Giao diện chọn số câu hỏi
  if (step === "chooseNum") {
    return (
      <div className="test7-container">
        <button className="test7-back-btn" onClick={handleBack}>← Quay lại</button>
        <h2>Chọn số câu hỏi</h2>
        <div className="test7-num-btns">
          {[6, 10, 20, 30].map(n => (
            <button
              key={n}
              className={`test7-num-btn${numQuestions === n ? " active" : ""}`}
              onClick={() => setNumQuestions(n)}
              disabled={words.length < n}
            >
              {n} câu
            </button>
          ))}
        </div>
        <button
          className="test7-start-btn"
          onClick={handleStartTest}
          disabled={words.length < numQuestions}
        >
          Bắt đầu kiểm tra
        </button>
        <div style={{marginTop: 16, color: "#888"}}>
          {words.length < numQuestions && "Không đủ từ vựng cho số câu này!"}
        </div>
      </div>
    );
  }

  // Giao diện làm bài kiểm tra trắc nghiệm từng câu
  if (step === "test") {
    const word = testWords[current];
    return (
      <div className="quiz-bg">
        <div className="quiz-main">
          <button className="quiz-back-btn" onClick={handleBack}>← Quay lại học từ vựng</button>
          <div className="quiz-header">
            <div>Câu hỏi: {current + 1}/{testWords.length}</div>
            <div>🎯 Kiểm Tra Từ Vựng</div>
            <div>Thời gian: {time}s</div>
          </div>
          <div className="quiz-card">
            <div className="quiz-question-title">Từ này có nghĩa là gì?</div>
            <div className="quiz-word">{word.word}</div>
            {word.pronunciation && (
              <div className="quiz-pronun">{word.pronunciation}</div>
            )}
            <div className="quiz-choices">
              {word.choices.map((choice, idx) => {
                let btnClass = "quiz-choice-btn";
                if (showFeedback) {
                  if (choice === word.translation) btnClass += " correct";
                  else if (choice === selected) btnClass += " wrong";
                }
                return (
                  <button
                    key={idx}
                    className={btnClass}
                    disabled={!!selected}
                    onClick={() => handleSelectChoice(choice)}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            {showFeedback && (
              <div className={`quiz-feedback ${selected === word.translation ? "right" : "wrong"}`}>
                {selected === word.translation
                  ? <>✔ Chính xác! +1 điểm</>
                  : <>❌ Sai rồi! Đáp án đúng là: <b>{word.translation}</b></>
                }
              </div>
            )}
            <button
              className="quiz-next-btn"
              disabled={!showFeedback}
              onClick={handleNext}
            >
              {current === testWords.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện kết quả (dạng bảng)
  if (step === "result") {
    return (
      <div className="quiz-bg">
        <div className="quiz-main">
          <button className="quiz-back-btn" onClick={handleBack}>← Quay lại học từ vựng</button>
          <div className="quiz-header">
            <div>Kết thúc</div>
            <div>🎯 Kiểm Tra Từ Vựng</div>
            <div>Thời gian: {time}s</div>
          </div>
          <div className="quiz-result-card">
            <div className="quiz-score">{score}/{testWords.length}</div>
            <div className="quiz-score-message">
              {score === testWords.length
                ? "🏆 Xuất sắc! Bạn đã trả lời đúng tất cả!"
                : score >= testWords.length * 0.7
                ? "👏 Tốt lắm! Bạn đã nắm vững hầu hết từ vựng!"
                : score >= testWords.length * 0.5
                ? "👍 Khá tốt! Hãy ôn tập thêm để cải thiện!"
                : "💪 Hãy cố gắng hơn! Quay lại học thêm từ vựng nhé!"}
            </div>
            <button className="quiz-next-btn" onClick={handleBack}>Làm lại</button>
            <div className="quiz-answer-list">
              <h3>Đáp án:</h3>
              <div style={{overflowX: "auto"}}>
                <table className="quiz-result-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Từ vựng</th>
                      <th>Đáp án đúng</th>
                      <th>Đáp án của bạn</th>
                      <th>Kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testWords.map((word, idx) => {
                      const isCorrect = answers[idx] === word.translation;
                      return (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>
                            <b>{word.word}</b>
                            {word.pronunciation && (
                              <div style={{fontSize: "0.95em", color: "#888"}}>{word.pronunciation}</div>
                            )}
                          </td>
                          <td>{word.translation}</td>
                          <td style={{ color: isCorrect ? "green" : "red" }}>
                            {answers[idx] || <span style={{color:"#888"}}>Chưa chọn</span>}
                          </td>
                          <td>
                            {isCorrect ? (
                              <span style={{ color: "green", fontWeight: 500 }}>Đúng</span>
                            ) : (
                              <span style={{ color: "red", fontWeight: 500 }}>Sai</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}