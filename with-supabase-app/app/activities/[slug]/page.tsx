// src/app/activities/[slug]/page.tsx
// import { supabase } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
// import { Tables } from '@/types/supabase'; // Using the generated type

// Step 1: Import all your specific activity components
// import StroopTest from '@/components/activities/StroopTest';
import StroopTest from '@/components/activities/StroopTest';
import NBackTest from '@/components/activities/NBackTest';
import DefaultActivity from '@/components/activities/DefaultActivity'; // A fallback component
import { createClient } from '@/lib/supabase/server';
import { Activity } from '@/app/types/Activity';
import ActivityContainer from './ActivityContainer';
// import DefaultActivity from '@/components/activities/DefaultActivity'; // A fallback component



// TODO: probablely move this to a separate file for better organization
// Step 2: Create the Component Map
// This object maps the `activity_type` string from your DB to the actual React component.
const activityComponentMap: { [key: string]: React.ComponentType<{ activity: Activity }> } = {
  'stroop1': StroopTest,
  'stroop2': StroopTest,
  'n-back': NBackTest,
  // To add a new test, just create the component and add a line here!
};

// The rest of the page component
type ActivityPageProps = {
  slug: string;
};

export default async function ActivityPage({ params }: {params: Promise<ActivityPageProps> }) {
  const { slug } = await params
  // const param = await params
  // console.log('ActivityPage params:', param);
  // Fetch the activity data from Supabase
  const supabase = await createClient();
  const { data: activity, error } = await supabase
    .from('activities')
    .select('*')
    .eq('activity_type', slug) // Assuming 'slug' is the activity_type
    // .eq('slug', slug)
    .single();
    // ;
  

  if (error || !activity) {
    // todo maybe indicate that there is not activity type for the url? not found probably makes more sense tho
    notFound();
  }

  // Step 3: Look up the component to render using the activity_type
  // Use the DefaultActivity component as a fallback if the type isn't in our map.

  // const ActivityComponent = activityComponentMap[slug] || DefaultActivity;
  const ActivityComponent = activityComponentMap[activity.activity_type] || DefaultActivity;

  return (
    <main className="container mx-auto p-8">
      {/* Step 4: Render the selected component, passing the activity data as a prop */}
      <ActivityContainer activity={activity} />
      <ActivityComponent activity={activity} />
    </main>
  );
}