import React from "react";

const QuestionCard = ({
  question,
  onAnswerSelect,
  onNext,
  onPrevious,
  showPrevious = false,
  userAnswer,
}) => {
  const isAnswered = !!userAnswer;

  return (
    <div className="card question-card mb-4">
      <div className="card-body">
        <h2 className="h4 mb-3 fw-bold">{question.question_text}</h2>
        {question.question_clarification && (
          <div className="info-box mb-3" role="note">
            <small>{question.question_clarification}</small>
          </div>
        )}

        <ul className="list-unstyled mb-3">
          {question.answers.map((answer) => {
            const isSelected = userAnswer === answer.id;
            const answerText = (
              <div className="d-flex flex-column">
                <span className={isSelected ? "fw-bold mb-1" : "mb-1"}>
                  {answer.answer_text}
                </span>
                {answer.answer_clarification && (
                  <small className="text-muted">
                    {answer.answer_clarification}
                  </small>
                )}
              </div>
            );

            return (
              <li
                key={answer.id}
                className={`answer-row ${isSelected ? "selected" : ""}`}
                onClick={() => onAnswerSelect(answer.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAnswerSelect(answer.id);
                  }
                }}
              >
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`answer-${question.id}`}
                    id={`answer-${answer.id}`}
                    checked={isSelected}
                    onChange={() => onAnswerSelect(answer.id)}
                  />
                  <label
                    className="form-check-label w-100"
                    htmlFor={`answer-${answer.id}`}
                  >
                    {answerText}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="d-flex gap-3">
          {showPrevious && (
            <button className="btn btn-primary" onClick={onPrevious}>
              Previous
            </button>
          )}

          <button
            className="btn btn-primary ms-auto"
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
