// app/dashboard/actions.ts
// Server Actions for the Dashboard: fetching Stroop test analysis results.

'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Define the interface for the stroop_analysis view results
interface StroopAnalysisResult {
  user_id: string;
  word_phase_id: number;
  color_phase_id: number;
  word_correct: number;
  word_incorrect: number;
  color_correct: number;
  color_incorrect: number;
  word_reaction_ms: number;
  color_reaction_ms: number;
  word_accuracy: number;
  color_accuracy: number;
  interference_ratio: number;
}

/**
 * Fetches the Stroop test analysis results for the current authenticated user
 * from the 'stroop_analysis' view.
 * This is a Server Action.
 * @returns {Promise<StroopAnalysisResult | null>} The combined Stroop analysis result or null if not found.
 */
export async function getStroopAnalysisResults(): Promise<StroopAnalysisResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login'); // Redirect unauthenticated users
  }

  // Fetch data from the stroop_analysis view for the current user
  const { data, error } = await supabase
    .from('stroop_analysis')
    .select('*')
    .eq('user_id', user.id)
    .single(); // Expecting one combined result per user for the analysis view

  if (error) {
    // If no results are found (e.g., user hasn't completed the test), data will be null
    // or an error might occur if the view definition is problematic or no user_id matches.
    if (error.code === 'PGRST116') { // Specific code for no rows found by .single()
      console.log('No Stroop analysis results found for user:', user.id);
      return null;
    }
    console.error('Error fetching Stroop analysis results:', error);
    return null;
  }

  return data as StroopAnalysisResult;
}
