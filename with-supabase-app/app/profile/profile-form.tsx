// app/profile/profile-form.tsx
// This is a React Client Component for the profile update form.
// It uses Next.js Server Actions for form submission and handles UI states like loading and messages.

'use client'; // This directive marks the component as a Client Component.

import { useFormState, useFormStatus } from 'react-dom'; // Hooks for form state management with Server Actions
import { useEffect, useRef } from 'react'; // React hooks for side effects and ref management
import { updateProfile } from './actions';


// Define an interface for the profile data shape, matching your Supabase table schema
interface ProfileData {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  // Add other fields from your profiles table if they are included in initialData
}

/**
 * A client component to display a submit button that shows a loading indicator
 * when the form is being submitted via a Server Action.
 * It uses the `useFormStatus` hook to determine the pending state of the form.
 */
function SubmitButton() {
  const { pending } = useFormStatus(); // Get the current pending status of the form

  return (
    <button
      type="submit"
      // Disable the button when the form is pending to prevent multiple submissions
      aria-disabled={pending}
      disabled={pending}
      className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 flex items-center justify-center font-semibold"
    >
      {pending ? (
        // Show a loading spinner and "Updating..." text when pending
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12V4a8 8 0 018-8v8H4z"></path>
          </svg>
          Updating...
        </>
      ) : (
        // Default button text when not pending
        'Update Profile'
      )}
    </button>
  );
}

/**
 * The main ProfileForm component for users to update their profile details.
 * It takes initial profile data as props to pre-fill the form fields.
 *
 * @param {object} props - The component props.
 * @param {any} props.initialData - The initial profile data to populate the form (e.g., { username: '...', ... }).
 */
export default function ProfileForm({ initialData }: { initialData: ProfileData | null }) {
  // `useFormState` links the form to the `updateProfile` server action.
  // It manages the state returned by the server action (`state`) and provides a
  // new action dispatcher (`formAction`) to pass to the form's `action` prop.
  // The initial state is `{ success: false, message: '' }`.
  const [state, formAction] = useFormState(updateProfile, { success: false, message: '' });
  const formRef = useRef<HTMLFormElement>(null); // Ref to access the form element directly

  // `useEffect` hook to run side effects based on the form's state.
  useEffect(() => {
    // If the server action returns a message, display it.
    if (state.message) {
      // Using `alert` for simplicity. For a real application, consider a more
      // user-friendly modal, toast notification, or inline message display.
      alert(state.message);
      // If the update was successful, you might want to perform other actions,
      // such as clearing specific form fields (though for profile updates,
      // revalidating the path usually re-fetches the latest data).
    }
  }, [state]); // Re-run this effect whenever the `state` object changes.

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username" // Name attribute matches the FormData key in the Server Action
          defaultValue={initialData?.username || ''} // Pre-fill with existing data
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-inter"
          required // Make username a required field
        />
      </div>

      {/* Full Name Field */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          defaultValue={initialData?.full_name || ''}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-inter"
          required // Make full name a required field
        />
      </div>

      {/* Avatar URL Field */}
      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-1">
          Avatar URL
        </label>
        <input
          type="url" // Use type="url" for better browser validation
          id="avatar_url"
          name="avatar_url"
          defaultValue={initialData?.avatar_url || ''}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-inter"
        />
      </div>

      {/* Age Field */}
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
          Age
        </label>
        <input
          type="number" // Use type="number" for numerical input
          id="age"
          name="age"
          defaultValue={initialData?.age || ''}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-inter"
          min="0" // Ensure age is not negative
        />
      </div>

      {/* Gender Dropdown */}
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          defaultValue={initialData?.gender || ''}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-inter"
        >
          <option value="">Select Gender</option> {/* Empty option for no selection */}
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Submit Button Component */}
      <SubmitButton />
    </form>
  );
}
