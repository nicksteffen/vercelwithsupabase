// app/stroop/actions.ts
// Server Actions for the Stroop Test: fetching activity details and submitting results.

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Updated import path

// Define types for consistency and type safety
interface Activity {
  id: number;
  name: string;
  description: string;
  category: string;
  duration_seconds: number;
  scoring_metric: string;
  instructions: string;
  parent_activity_id: number | null;
  details: {
    color_options: string[];
    stimulus_types: string[];
    scoring: {
      congruent_correct: number;
      incongruent_correct: number;
      neutral_correct: number;
      incorrect: number;
    };
  };
}

export interface ActivityResult {
  activity_id: number;
  correct_answers: number;
  incorrect_answers: number;
  duration_seconds: number;
  details: {
    congruent?: { correct: number; incorrect: number; };
    incongruent?: { correct: number; incorrect: number; };
    neutral?: { correct: number; incorrect: number; };
    avg_reaction_ms?: number;
    // Add other relevant details you might store
  };
}

/**
 * Fetches the details for the Stroop Word Phase (ID 5) and Color Phase (ID 6).
 * This is a Server Action and runs on the server.
 * @returns {Promise<{ wordPhase: Activity | null; colorPhase: Activity | null; }>} The activity details.
 */
export async function getStroopActivitiesDetails() {
  const supabase = await createClient(); // Updated initialization
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login'); // Redirect unauthenticated users
  }

  // Fetch Word Phase details
  const { data: wordPhase, error: wordError } = await supabase
    .from('activities')
    .select('*')
    .eq('id', 5) // Stroop - Word Phase
    .single();

  if (wordError) {
    console.error('Error fetching word phase details:', wordError);
    // In a production app, you might want more robust error handling or throw
  }

  // Fetch Color Phase details
  const { data: colorPhase, error: colorError } = await supabase
    .from('activities')
    .select('*')
    .eq('id', 6) // Stroop - Color Phase
    .single();

  if (colorError) {
    console.error('Error fetching color phase details:', colorError);
  }

  return {
    wordPhase: wordPhase as Activity | null,
    colorPhase: colorPhase as Activity | null,
  };
}

/**
 * Saves a single activity result to the 'activity_results' table.
 * This is a Server Action and handles database insertion.
 *
 * @param {Omit<ActivityResult, 'id'>} resultData The data to insert into activity_results.
 * @returns {Promise<{ success: boolean; message: string; }>} Result of the operation.
 */
export async function saveStroopActivityResult(resultData: ActivityResult) {
  const supabase = await createClient(); // Updated initialization
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'User not authenticated.' };
  }

  const { error } = await supabase.from('activity_results').insert({
    user_id: user.id,
    activity_id: resultData.activity_id,
    correct_answers: resultData.correct_answers,
    incorrect_answers: resultData.incorrect_answers,
    duration_seconds: resultData.duration_seconds,
    completed_at: new Date().toISOString(), // Use current timestamp
    details: resultData.details,
  });

  if (error) {
    console.error('Error saving activity result:', error);
    return { success: false, message: `Failed to save result: ${error.message}` };
  }

  // Revalidate paths that depend on activity_results data (e.g., dashboard)
  revalidatePath('/dashboard');
  revalidatePath('/stroop'); // Revalidate stroop to ensure it reflects completion status if needed

  return { success: true, message: 'Result saved successfully!' };
}

/**
 * Checks which Stroop test phases the current user has already completed.
 * This is a Server Action.
 * @returns {Promise<{ completedWordPhase: boolean; completedColorPhase: boolean; }>} Completion status.
 */
export async function getCompletedStroopPhases() {
  const supabase = await createClient(); // Updated initialization
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { completedWordPhase: false, completedColorPhase: false };
  }

  const { data: wordPhaseResult, error: wordError } = await supabase
    .from('activity_results')
    .select('id')
    .eq('user_id', user.id)
    .eq('activity_id', 5) // Stroop - Word Phase
    .maybeSingle(); // Use maybeSingle to get null if no row found

  if (wordError) {
    console.error('Error checking word phase completion:', wordError);
  }

  const { data: colorPhaseResult, error: colorError } = await supabase
    .from('activity_results')
    .select('id')
    .eq('user_id', user.id)
    .eq('activity_id', 6) // Stroop - Color Phase
    .maybeSingle();

  if (colorError) {
    console.error('Error checking color phase completion:', colorError);
  }

  return {
    completedWordPhase: !!wordPhaseResult,
    completedColorPhase: !!colorPhaseResult,
  };
}
