
"use client";
import { Activity, ActivityResultSubmission } from "@/app/types/Activity"
import Clock from "../Clock";
import { useCallback, useState } from "react";
import { submitResult } from "./actions";


interface StroopTestProps {
    activity: Activity
}


export default function StroopTest({activity}: StroopTestProps) {
    // we have our activity defined 
    // console.log("StroopTest activity:", activity);



    // const user_id = "12345"; // Replace with actual user ID from your auth context or state management


    // UNIVERSAL CODE
    // how long the test should run
    // lets keep the clock in the tests/ activitty test runners, but we'll make a clock component
    const duration_seconds = activity.duration_seconds || 5; // Default to 60 seconds if not defined
    const [isRunning, setIsRunning] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);    


    // TODO create an isCorrect function based on activity type


    const submitResults = useCallback(() => {
        // 'use server';
        const activityResults : ActivityResultSubmission = {
            user_id: "", // This will be set by the server action
            activity_id: activity.id,
            correct_answers: correctAnswers,
            incorrect_answers: incorrectAnswers,
            duration_seconds: duration_seconds,
            completed_at: new Date(), // This will be set when the activity is completed
            // details?>>>>
        };
        console.log("Submitting results...");
        const submission = submitResult(activityResults);
        console.log("Submission result:", submission);
        // After submission, you might want to reset the state or redirect
        setIsRunning(false); // Reset the running state after submission
        console.log("Results submitted successfully.");
        // TODO rediredt to next test if exists, else redirect to dashboard
    }, [activity, correctAnswers, incorrectAnswers, duration_seconds]);
    const startTimer = () => {
        setIsRunning(true);
        setCorrectAnswers(0);
        setIncorrectAnswers(0);
        console.log("Timer started");
    }; 
    const testEnd = useCallback(() => {
        setIsRunning(false);
        // for testing purposes:

        submitResults(); // Call the function to submit results when the test ends
        console.log("Test ended");

    }, [submitResults]);





    return (
        <>
        <h1 className="text-2xl font-bold mb-4"> Stroop Test </h1>
        <button onClick={startTimer} disabled={isRunning} className="btn btn-primary">
            {isRunning ? 'Running...' : 'Start Timer'}
        </button>
        {/* <Clock onExpire={testEnd} startTrigger={isRunning} initialTimeInSeconds={duration_seconds} /> */}
        <Clock onExpire={testEnd} startTrigger={isRunning} initialTimeInSeconds={10} />
        <button onClick={() => setCorrectAnswers(correctAnswers + 1)} className="btn btn-success">
            Correct Answer ({correctAnswers})    
        </button>
        <button onClick={() => setIncorrectAnswers(incorrectAnswers + 1)} className="btn btn-error">
            Incorrect Answer ({incorrectAnswers})
        </button>
        </>
    )
}