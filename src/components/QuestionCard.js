import React from "react";

const QuestionCard = ({ question, onAnswerSelect }) => {
  // Static placeholder - will receive actual question data and handler later
  const mockQuestion = {
    id: 1,
    question_text:
      "Is your data architecture designed for analytical query (looking at the past) or predictive modeling (training the future)?",
    question_clarification:
      "Analytical systems (e.g., data warehouses) are optimized for reporting on known data, while AI/ML systems require architectures optimized for iteration, experimentation, and processing unstructured data.",
    answers: [
      { id: "1a", answer_text: "Optimized for Predictive Modeling", score: 2 },
      {
        id: "1b",
        answer_text: "Optimized for Analytics / Reporting",
        score: 1,
      },
      { id: "1c", answer_text: "Ad-hoc / Not Formally Designed", score: 0 },
    ],
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h2 className="card-title h4 mb-3">{mockQuestion.question_text}</h2>
        {mockQuestion.question_clarification && (
          <div className="alert alert-info mb-3" role="note">
            <small>{mockQuestion.question_clarification}</small>
          </div>
        )}

        <div className="answers mb-4">
          {mockQuestion.answers.map((answer) => (
            <button
              key={answer.id}
              className="btn btn-outline-primary w-100 mb-2 text-start"
              onClick={() => onAnswerSelect && onAnswerSelect(answer.id)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>{answer.answer_text}</span>
                <small className="text-muted">
                  {answer.score === 2 && "✓✓"}
                  {answer.score === 1 && "✓"}
                  {answer.score === 0 && "✗"}
                </small>
              </div>
            </button>
          ))}
        </div>

        <div className="d-flex justify-content-between">
          <button className="btn btn-secondary" disabled>
            Previous
          </button>
          <button className="btn btn-primary">Next</button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
