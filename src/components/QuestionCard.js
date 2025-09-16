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
              ? "btn btn-primary w-100 mb-2 text-start"
              : "btn btn-outline-primary w-100 mb-2 text-start";

            return (
              <button
                key={answer.id}
                className={buttonClass}
                onClick={() => onAnswerSelect(answer.id)}
              >
                <div className="d-flex flex-column text-start">
                  <span className={isSelected ? "fw-bold mb-1" : "mb-1"}>
                    {answer.answer_text}
                  </span>
                  <small className="text-muted">
                    {answer.answer_clarification || "No additional details"}
                  </small>
                  {isSelected && (
                    <span className="badge bg-success mt-2 align-self-start">
                      Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

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
