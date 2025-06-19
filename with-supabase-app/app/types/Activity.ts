export interface Activity {
  // temporarily using a simplified interface
  id: number;
  activity_type: string;
  name: string;
  description: string;
  category: string;
  duration_seconds: number;
  scoring_metric: string; 
}


export interface ActivitySession {
    id: number;
    user_id: string;
    activity_id: number;
    started_at: Date;
    completed: boolean;
    client_metadata?: Record<string, string>; // Additional metadata about the session

}

export interface ActivityResult {
    id: number;
    user_id: string;
    activity_id: number;
    correct_answers: number;
    incorrect_answers: number;
    total_attempts: number;
    accuracy: number; // Percentage of correct answers
    duration_seconds: number;
    completed_at: Date; // Timestamp when the activity was completed
    details?: Record<string, string>; // Additional details about the results
}



export interface ActivityResultSubmission {
    user_id: string;
    activity_id: number;
    correct_answers: number;
    incorrect_answers: number;
    duration_seconds: number;
    completed_at: Date; // Timestamp when the activity was completed
    details?: Record<string, string>; // Additional details about the results
}