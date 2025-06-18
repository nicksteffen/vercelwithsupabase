import { createClient } from "@/lib/supabase/server";

export default async function ActivitiesPage() {
    const supabase = await createClient();

    const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
    return (
        <div>
            <h2>Activities</h2>
            {error && <p>Error loading activities: {error.message}</p>}
            <pre>{JSON.stringify(activities, null, 2)}</pre>
        </div>
    )
}
