// app/dashboard/page.tsx
// This is the Next.js Server Component for the Dashboard page.
// It fetches and displays the user's Stroop test results.

import { redirect } from 'next/navigation';
import { getStroopAnalysisResults } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } = { user: null } } = await supabase.auth.getUser();

  // Redirect to login if user is not authenticated
  if (!user) {
    redirect('/login');
  }

  // Fetch the Stroop analysis results using the server action
  const results = await getStroopAnalysisResults();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans">
      <Card className="w-full max-w-2xl shadow-xl rounded-lg overflow-hidden my-8">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center">Your Stroop Test Results</CardTitle>
          <CardDescription className="text-teal-100 text-center mt-2">
            A summary of your performance in the Stroop Test phases.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!results ? (
            <div className="text-center text-gray-700">
              <p className="text-lg font-semibold mb-2">No Stroop test results found yet.</p>
              <p>Complete both the Word Phase and Color Phase to see your analysis here.</p>
              <p className="mt-4">
                <a href="/stroop" className="text-blue-600 hover:underline">
                  Start the Stroop Test
                </a>
              </p>
            </div>
          ) : (
            <Table className="w-full border rounded-lg">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="py-3 px-4 text-left text-gray-600 font-bold">Metric</TableHead>
                  <TableHead className="py-3 px-4 text-left text-gray-600 font-bold">Word Phase</TableHead>
                  <TableHead className="py-3 px-4 text-left text-gray-600 font-bold">Color Phase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="py-2 px-4 font-medium">Correct Answers</TableCell>
                  <TableCell className="py-2 px-4">{results.word_correct}</TableCell>
                  <TableCell className="py-2 px-4">{results.color_correct}</TableCell>
                </TableRow>
                <TableRow className="bg-gray-50">
                  <TableCell className="py-2 px-4 font-medium">Incorrect Answers</TableCell>
                  <TableCell className="py-2 px-4">{results.word_incorrect}</TableCell>
                  <TableCell className="py-2 px-4">{results.color_incorrect}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 px-4 font-medium">Accuracy</TableCell>
                  <TableCell className="py-2 px-4">{(results.word_accuracy * 100).toFixed(2)}%</TableCell>
                  <TableCell className="py-2 px-4">{(results.color_accuracy * 100).toFixed(2)}%</TableCell>
                </TableRow>
                <TableRow className="bg-gray-50">
                  <TableCell className="py-2 px-4 font-medium">Avg Reaction Time (ms)</TableCell>
                  <TableCell className="py-2 px-4">{results.word_reaction_ms.toFixed(0)}</TableCell>
                  <TableCell className="py-2 px-4">{results.color_reaction_ms.toFixed(0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 px-4 font-medium col-span-2">Interference Ratio (Color RT / Word RT)</TableCell>
                  <TableCell className="py-2 px-4" colSpan={2}>{results.interference_ratio.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
