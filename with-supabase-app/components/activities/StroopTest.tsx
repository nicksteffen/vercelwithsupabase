"use client";
import { Activity, ActivityResultSubmission } from "@/app/types/Activity"
import { useCallback, useState, useEffect } from "react";
import { submitResult } from "./actions";
import QuestionBody from "./QuestionBody";
// import Clock2 from "./Clock2"; // Assuming Clock2 is your updated component
import Clock3 from "./Clock3";


interface StroopTestProps {
    activity: Activity
}


export default function StroopTest({activity}: StroopTestProps) {
    const duration_seconds = activity.duration_seconds || 5;
    const [isRunning, setIsRunning] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);
    const [shouldSubmit, setShouldSubmit] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // NEW state to receive expired status from Clock2
    const [clockExpired, setClockExpired] = useState(false);


    const handleAnswer = (isCorrect: boolean) => {
        if (isRunning) { // Only record answers if the timer is running
          if (isCorrect) {
              setCorrectAnswers(correctAnswers + 1);
          } else {
              setIncorrectAnswers(incorrectAnswers + 1);
          }
          console.log(`Answer recorded: ${isCorrect ? 'Correct' : 'Incorrect'}`);
        }
    };

    // useEffect to handle the submission when shouldSubmit becomes true
    useEffect(() => {
        if (shouldSubmit && !submitted) {
            const activityResults : ActivityResultSubmission = {
                user_id: "", // This will be set by the server action
                activity_id: activity.id,
                correct_answers: correctAnswers,
                incorrect_answers: incorrectAnswers,
                duration_seconds: duration_seconds,
                completed_at: new Date(),
                // details?>>>>
            };

            console.log("Submitting results...");
            const performSubmission = async () => {
                const submission = await submitResult(activityResults);
                console.log("Submission result:", submission);
                setSubmitted(true);
                console.log("Results submitted successfully.");
            };

            performSubmission();
        }
    }, [shouldSubmit, submitted, activity, correctAnswers, incorrectAnswers, duration_seconds]);


    // NEW useEffect to handle the end-of-test sequence when Clock2 signals expiration
    useEffect(() => {
        if (clockExpired) {
            console.log("Clock has expired, triggering test end sequence.");
            setIsRunning(false); // Stop the test
            setShouldSubmit(true); // Trigger submission

            // Reset the clockExpired state so the effect doesn't run again
            setClockExpired(false);
        }
    }, [clockExpired, setIsRunning, setShouldSubmit]); // Dependencies: clockExpired and the state setters/callbacks

    const startTimer = () => {
        setIsRunning(true);
        setCorrectAnswers(0);
        setIncorrectAnswers(0);
        setSubmitted(false);
        setShouldSubmit(false);
        setClockExpired(false); // Reset clockExpired state on start
        console.log("Timer started");
    };


    // Removed the testEnd useCallback function entirely, as Clock2 no longer calls it directly.

    return (
        <>
        <h1 className="text-2xl font-bold mb-4"> Stroop Test </h1>
        <p> Submitted: { submitted ? "True" : "False"} </p>
        <div>
        <button onClick={() => setSubmitted(submitted ? false : true)} className="btn btn-secondary">
            {submitted ? 'Reset Submission' : 'Mark as Submitted'}
        </button>
        </div>
        <button onClick={startTimer} disabled={isRunning} className="btn btn-primary">
            {isRunning ? 'Running...' : 'Start Timer'}
        </button>
        {/* Pass the setClockExpired callback as the onExpiredStatus prop */}
        {/* <Clock3 isExpiredStatus={setClockExpired} startTrigger={isRunning} initialTimeInSeconds={duration_seconds} /> */}
        <Clock3 isExpiredStatus={setClockExpired} startTrigger={isRunning} initialTimeInSeconds={10} />
        <button onClick={() => handleAnswer(true)} className="btn btn-success">
            Correct Answer ({correctAnswers})
        </button>
        <button onClick={() => handleAnswer(false)} className="btn btn-error">
            Incorrect Answer ({incorrectAnswers})
        </button>


        {isRunning && (
        <QuestionBody getAnswer={handleAnswer}/>
        )}

        </>
    )
}
