import React, { useState } from "react";

const QuestionCard = ({
  question,
  onAnswerSelect,
  onNext,
  onPrevious,
  showPrevious = false,
  userAnswer,
}) => {
  const isAnswered = !!userAnswer;
  const [expandedAnswer, setExpandedAnswer] = useState(null);

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h2 className="card-title h4 mb-3">{question.question_text}</h2>
        {question.question_clarification && (
          <div className="alert alert-info mb-3" role="note">
            <small>{question.question_clarification}</small>
          </div>
        )}

        <div className="answers mb-4">
          {question.answers.map((answer) => {
            const isSelected = userAnswer === answer.id;
            const buttonClass = isSelected
              ? "btn-primary"
              : "btn-outline-primary";

            return (
              <>
                <button
                  key={`${answer.id}-btn`}
                  className={`btn ${buttonClass} w-100 mb-2 text-start`}
                  onClick={() => onAnswerSelect(answer.id)}
                  onMouseEnter={() => setExpandedAnswer(answer.id)}
                  onMouseLeave={() => setExpandedAnswer(null)}
                  onTouchStart={() => setExpandedAnswer(answer.id)}
                  onTouchEnd={() => {
                    // Delay clearing to allow seeing the panel briefly
                    setTimeout(() => setExpandedAnswer(null), 2000);
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{answer.answer_text}</span>
                    {isSelected && (
                      <span className="badge bg-success me-2">Selected</span>
                    )}
                  </div>
                </button>
                {expandedAnswer === answer.id && (
                  <div
                    className="mb-2 p-3 bg-light rounded shadow-sm border-start border-primary border-3"
                    role="note"
                  >
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      {answer.answer_clarification}
                    </small>
                  </div>
                )}
              </>
            );
          })}
        </div>

        {isAnswered && (
          <div
            className="alert alert-light border-start border-primary border-3 mb-3 ps-3"
            role="note"
          >
            <small className="text-muted">
              <strong>Why this choice?</strong>{" "}
              {(() => {
                const selectedAnswer = question.answers.find(
                  (a) => a.id === userAnswer
                );
                return selectedAnswer
                  ? selectedAnswer.answer_clarification
                  : "";
              })()}
            </small>
          </div>
        )}

        <div className="d-flex justify-content-between">
          {showPrevious && (
            <button className="btn btn-secondary" onClick={onPrevious}>
              Previous
            </button>
          )}
          {!showPrevious && <div className="w-25"></div>}

          <button
            className="btn btn-primary"
            onClick={onNext}
            disabled={!isAnswered}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
