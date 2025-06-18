// app/stroop/page.tsx
// This is the Next.js Server Component for the Stroop Test page.
// It fetches initial data and passes it to the client-side StroopTestClient.

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // Corrected import path for createClient
import StroopTestClient from './stroop-test-client';
import { getStroopActivitiesDetails, getCompletedStroopPhases } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Shadcn Card components

export default async function StroopPage() {
  const supabase = await createClient(); // Corrected createClient invocation
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if user is not authenticated
  if (!user) {
    redirect('/login');
  }

  // Fetch activity details for both phases using the server action
  const { wordPhase, colorPhase } = await getStroopActivitiesDetails();

  // Fetch current user's completed phases
  const { completedWordPhase, completedColorPhase } = await getCompletedStroopPhases();

  // Basic check to ensure activity details were fetched successfully
  if (!wordPhase || !colorPhase) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg rounded-lg">
          <CardHeader className="bg-red-500 text-white p-6 rounded-t-lg text-center">
            <CardTitle className="text-2xl font-bold">Error Loading Test</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center text-gray-700">
            {/* Escaped apostrophes */}
            <p className="mb-4">Could not retrieve all necessary Stroop test details from the database.</p>
            <p>Please ensure the activity IDs (5 and 6) and their configurations are correct in your Supabase &apos;activities&apos; table.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <StroopTestClient
      wordPhaseDetails={wordPhase}
      colorPhaseDetails={colorPhase}
      completedWordPhase={completedWordPhase}
      completedColorPhase={completedColorPhase}
    />
  );
}
