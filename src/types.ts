export interface Answer {
  id: string;
  answer_text: string;
  answer_clarification: string;
  score?: number;
  explanation?: string;
}

export interface Question {
  id: number;
  question_text: string;
  question_clarification: string;
  answers: Answer[];
  type?: string;
}

export interface Result {
  question: number;
  question_text: string;
  question_clarification?: string;
  selected_text: string;
  selected_clarification?: string;
  score?: number;
  explanation?: string;
  type?: string;
}
