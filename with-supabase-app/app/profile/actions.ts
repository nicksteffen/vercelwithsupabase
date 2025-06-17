// app/profile/actions.ts
// This file defines server actions for updating user profile information.
// Server actions run exclusively on the server, allowing direct database interactions.

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache'; // Used to clear the cache for a specific path after a mutation
import { redirect } from 'next/navigation'; // Used to redirect users if unauthenticated

// Define a type for the state returned by the server action
interface FormState {
  success: boolean;
  message: string;
}

interface ProfileUpdateData {
  username: string;
  full_name: string;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  updated_at: string; // ISO string format for timestamp
}

/**
 * Updates a user's profile information in the Supabase 'profiles' table.
 * This function is a Next.js Server Action, allowing it to be called directly from a form.
 *
 * @param {FormState} prevState The previous state returned by the useFormState hook (for form feedback).
 * @param {FormData} formData The form data submitted from the client.
 * @returns {Promise<FormState>} An object indicating success/failure and a message.
 */
export async function updateProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  // Initialize the Supabase client for server-side operations.
  const supabase = await createClient();

  // Get the currently authenticated user.
  const { data: { user } } = await supabase.auth.getUser();

  // If no user is authenticated, redirect them to the login page.
  if (!user) {
    redirect('/login'); // Ensure you have a /login route for unauthenticated users.
  }

  // Extract form data.
  const userId = user.id;
  const username = formData.get('username') as string;
  const fullName = formData.get('full_name') as string;
  const avatarUrl = formData.get('avatar_url') as string;
  const age = parseInt(formData.get('age') as string);
  const gender = formData.get('gender') as string;

  // --- Basic Input Validation ---
  if (!username || username.trim() === '') {
    return { success: false, message: 'Username is required.' };
  }
  if (!fullName || fullName.trim() === '') {
    return { success: false, message: 'Full Name is required.' };
  }
  // Validate age: must be a number and non-negative
  if (age !== undefined && (isNaN(age) || age < 0)) {
    return { success: false, message: 'Age must be a positive number.' };
  }
  // Validate gender: ensure it's one of the allowed values if provided
  if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
    return { success: false, message: 'Invalid gender value.' };
  }
  // Basic URL validation for avatar_url
  if (avatarUrl && !/^https?:\/\/.+\..+/.test(avatarUrl)) {
    return { success: false, message: 'Avatar URL must be a valid URL.' };
  }


  // Prepare the data for update with the defined interface.
  // Initialize with required fields and current timestamp.
  const updateData: ProfileUpdateData = {
    username: username.trim(),
    full_name: fullName.trim(),
    updated_at: new Date().toISOString(), // Update the updated_at timestamp
    avatar_url: null, // Default to null, will be updated if avatarUrl is provided
    age: null,        // Default to null, will be updated if valid age is provided
    gender: null      // Default to null, will be updated if gender is provided
  };

  // Conditionally add optional fields if they are provided and valid
  if (avatarUrl) {
    updateData.avatar_url = avatarUrl;
  } else {
    // If avatarUrl is empty, set it to null in the database
    updateData.avatar_url = null;
  }
  if (!isNaN(age)) { // Only update age if it's a valid number
    updateData.age = age;
  } else {
    updateData.age = null; // Set to null if parsed age is NaN (e.g., empty input)
  }
  if (gender) {
    updateData.gender = gender;
  } else {
    updateData.gender = null; // Set to null if gender is empty
  }

  // Perform the database update operation.
  // The .eq('user_id', userId) ensures that only the currently authenticated
  // user's profile can be updated, crucial for security with RLS.
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId);

  // Handle any errors from the Supabase update.
  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: `Error updating profile: ${error.message}` };
  }

  // Revalidate the cache for the profile page to ensure it displays the updated data.
  revalidatePath('/profile');

  // Return a success message.
  return { success: true, message: 'Profile updated successfully!' };
}
