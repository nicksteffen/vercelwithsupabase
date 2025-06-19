import { createClient } from "@/lib/supabase/server";
import { Activity } from "../types/Activity";
import ActivityCard from "./ActivityCard";



function activityCard(activity: Activity) {
    // should look if parent id and nest under parent if so
    return (
        <>
       <p>
       { activity.name }
       </p> 
       <p> { activity.description } </p>
       <a href={`/activities/${activity.activity_type}`}>  go to test</a>
        </>

    )



}


export default async function TestsPage() {
    const supabase = await createClient(); 

    const { data: activities  }= await supabase
        .from('activities')
        .select('*')
        .not('activity_type', 'is', null)
        .order('created_at', { ascending: false });
    // console.log('Activities:', activities);
    // console.log('data:', data);
    // activites are all that have a not null activity_type
    // generate links for each activity type

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Activities</h2>
            {activities && activities.length > 0 ? (
                    // activityCard(activity as Activity)
                activities.map(activity => 
                    <ActivityCard key={activity.id} activity={activity as Activity} />
            )) : (
                <p className="text-gray-500">No activities found.</p>
            )}
        </div>
    );

}
    
    
    