// app/profile/page.tsx
// This is a Next.js Server Component responsible for fetching initial profile data
// and rendering the client-side ProfileForm.

import { redirect } from 'next/navigation'; // Used for server-side redirection
import ProfileForm from './profile-form'; // Import the client-side form component
import { createClient } from '@/lib/supabase/server';

/**
 * Renders the user's profile editing page.
 * This is a Server Component, meaning data fetching happens on the server before rendering.
 *
 * @returns {JSX.Element} The profile editing UI.
 */
export default async function ProfilePage() {
  const supabase = await createClient();

  // Get the current user's authentication status.
  const { data: { user } } = await supabase.auth.getUser();

  // If no user is logged in, redirect them to the login page.
  if (!user) {
    redirect('/login'); // Redirect to your application's login route.
  }

  // Fetch the current profile data for the authenticated user.
  // We select specific columns to limit data transfer.
  // .single() expects exactly one row; if none or more, it will return an error.
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, age, gender')
    .eq('user_id', user.id)
    .single();

  // Handle errors during profile data fetching.
  if (error) {
    console.error('Error fetching profile:', error);
    // You might want a more sophisticated error display or redirection here.
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center text-red-500">
          <h1 className="text-xl font-bold mb-4">Error Loading Profile</h1>
          <p>There was an issue retrieving your profile data. Please try again.</p>
          <p className="text-sm text-gray-600 mt-2">Error details: {error.message}</p>
        </div>
      </div>
    );
  }

  // Render the page.
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md font-sans">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Edit Profile</h1>
        {/* Pass the fetched profile data to the client-side form component. */}
        <ProfileForm initialData={profile} />
      </div>
    </div>
  );
}
