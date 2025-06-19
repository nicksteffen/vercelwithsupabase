'use server'

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ActivityResultSubmission } from "@/app/types/Activity";

export async function submitResult(activityResult: ActivityResultSubmission) {
    const supabase = await createClient();
    const {data: {user }, error } = await supabase.auth.getUser(); 
    if (!user) {
        redirect('/auth/login'); // Redirect unauthenticated users
    }
    if (error) {
        console.error("Error fetching user:", error);
        throw new Error("Failed to fetch user");
    }
    activityResult.user_id = user.id; // Set the user_id from the authenticated user
    console.log("Submitting activity result:", activityResult);
    const { data, error: insertError } = await supabase
        .from('activity_results')
        .insert(activityResult)
        .select()
        .single();  
    if (insertError) {
        console.error("Error inserting activity result:", insertError);
        throw new Error("Failed to submit activity result");
    }
    console.log("Activity result submitted successfully:", data);
    return data;
}