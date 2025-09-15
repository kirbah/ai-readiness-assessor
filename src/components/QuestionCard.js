import React from "react";

const QuestionCard = ({
  question,
  onAnswerSelect,
  onPrevious,
  showPrevious = false,
  userAnswer,
  currentQuestionId,
}) => {
  const isCurrentQuestion = currentQuestionId === question.id;
  const isAnswered = !!userAnswer;
  const allowChanges = isAnswered && !isCurrentQuestion; // Allow changes when revisiting previous questions

  const handleAnswerClick = (answerId) => {
    if (onAnswerSelect) {
      onAnswerSelect(answerId);
    }
  };

  const handlePreviousClick = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  const handleNextClick = () => {
    // For now, just log - will be handled by parent state in full implementation
    console.log("Next clicked - would navigate to next question");
  };

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
            let buttonClass, isDisabled, opacityClass;

            if (isCurrentQuestion && isAnswered) {
              // Current question, already answered - disable all
              buttonClass = isSelected
                ? "btn-primary"
                : "btn-outline-secondary";
              isDisabled = true;
              opacityClass = isSelected ? "" : "opacity-50";
            } else if (allowChanges && isAnswered) {
              // Previous question, allow changing answer
              buttonClass = "btn-outline-primary";
              isDisabled = false;
              opacityClass = "";
            } else {
              // Not answered yet
              buttonClass = "btn-outline-primary";
              isDisabled = false;
              opacityClass = "";
            }

            return (
              <button
                key={answer.id}
                className={`btn ${buttonClass} w-100 mb-2 text-start ${opacityClass}`}
                onClick={() => !isDisabled && handleAnswerClick(answer.id)}
                disabled={isDisabled}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span>{answer.answer_text}</span>
                  <div>
                    {isSelected && !isCurrentQuestion && (
                      <span className="badge bg-warning me-2">Change?</span>
                    )}
                    {isSelected && isCurrentQuestion && (
                      <span className="badge bg-success me-2">Selected</span>
                    )}
                    <small className="text-muted">
                      {answer.score === 2 && "✓✓"}
                      {answer.score === 1 && "✓"}
                      {answer.score === 0 && "✗"}
                    </small>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="d-flex justify-content-between">
          {showPrevious && (
            <button className="btn btn-secondary" onClick={handlePreviousClick}>
              Previous
            </button>
          )}
          {!showPrevious && <div className="w-25"></div>}

          <button
            className={`btn btn-primary ${
              isAnswered && isCurrentQuestion ? "" : "opacity-50"
            }`}
            onClick={handleNextClick}
            disabled={!isAnswered || !isCurrentQuestion}
          >
            {isAnswered && isCurrentQuestion
              ? "Next"
              : "Please select an answer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
