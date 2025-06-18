// app/stroop/stroop-test-client.tsx
// This is the interactive Client Component for the Stroop Test.

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Shadcn Button component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Shadcn Card components
import { Progress } from '@/components/ui/progress'; // Shadcn Progress component (if you add it)
import { saveStroopActivityResult } from './actions'; // Import Server Action
import { ActivityResult } from './actions'; // Import ActivityResult type from actions.ts

// Define types for props and internal state for better type safety
interface ActivityDetails {
  id: number;
  name: string;
  description: string;
  duration_seconds: number;
  instructions: string;
  details: {
    color_options: string[];
    stimulus_types: string[]; // e.g., 'congruent', 'incongruent', 'neutral'
    scoring: {
      congruent_correct: number;
      incongruent_correct: number;
      neutral_correct: number;
      incorrect: number;
    };
  };
}

interface StroopTestProps {
  wordPhaseDetails: ActivityDetails | null;
  colorPhaseDetails: ActivityDetails | null;
  completedWordPhase: boolean;
  completedColorPhase: boolean;
}

interface PhaseStats {
  correctAnswers: number;
  incorrectAnswers: number;
  durationSeconds: number; // Duration of the phase as per activity details
  congruentCorrect: number;
  congruentIncorrect: number;
  incongruentCorrect: number;
  incongruentIncorrect: number;
  neutralCorrect: number;
  neutralIncorrect: number;
  reactionTimes: number[]; // Store reaction times for average calculation
}

const COLORS: { [key: string]: string } = {
  red: 'text-red-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
};

const WORDS: string[] = ['Red', 'Blue', 'Green', 'Yellow'];

export default function StroopTestClient({
  wordPhaseDetails,
  colorPhaseDetails,
  completedWordPhase,
  completedColorPhase,
}: StroopTestProps) {
  const router = useRouter();

  // State for the current test phase
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0); // 0 for Word, 1 for Color
  const [activePhaseDetails, setActivePhaseDetails] = useState<ActivityDetails | null>(null);

  // Test state
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentScore, setCurrentScore] = useState(0); // Total score for current phase

  // Stimulus state
  const [stimulusWord, setStimulusWord] = useState('');
  const [stimulusColor, setStimulusColor] = useState(''); // Tailwind class for text color
  const [correctAnswerValue, setCorrectAnswerValue] = useState(''); // The text that is the correct answer
  const [lastAttemptTime, setLastAttemptTime] = useState(0); // Timestamp of the last stimulus display

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackColorClass, setFeedbackColorClass] = useState('');

  // Phase results tracking
  const [phaseStats, setPhaseStats] = useState<PhaseStats>({
    correctAnswers: 0,
    incorrectAnswers: 0,
    durationSeconds: 0,
    congruentCorrect: 0,
    congruentIncorrect: 0,
    incongruentCorrect: 0,
    incongruentIncorrect: 0,
    neutralCorrect: 0,
    neutralIncorrect: 0,
    reactionTimes: [],
  });

  // Store results of the first phase before submitting both at the end
  // Changed type from PhaseResult to ActivityResult as it holds the structure for DB submission
  const [wordPhaseFinalResult, setWordPhaseFinalResult] = useState<ActivityResult | null>(null);

  // Refs for timer and stimulus timeout
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Utility Functions ---

  const resetPhaseStats = useCallback(() => {
    setPhaseStats({
      correctAnswers: 0,
      incorrectAnswers: 0,
      durationSeconds: 0,
      congruentCorrect: 0,
      congruentIncorrect: 0,
      incongruentCorrect: 0,
      incongruentIncorrect: 0,
      neutralCorrect: 0,
      neutralIncorrect: 0,
      reactionTimes: [],
    });
    setCurrentScore(0);
  }, []);

  // Determine stimulus type (congruent, incongruent, neutral)
  // Moved this function definition before `handleAnswer`
  const getStimulusType = useCallback((word: string, colorClass: string): 'congruent' | 'incongruent' | 'neutral' => {
    // Extract the plain color name from the Tailwind class (e.g., 'red-500' -> 'red')
    const colorNameMatch = colorClass.match(/text-([a-z]+)-\d{3}/);
    const colorName = colorNameMatch ? colorNameMatch[1] : '';

    if (!colorName) return 'neutral'; // Fallback if color class format is unexpected

    if (word.toLowerCase() === colorName) {
      return 'congruent';
    } else if (WORDS.map(w => w.toLowerCase()).includes(word.toLowerCase()) && Object.keys(COLORS).includes(colorName)) {
      // If both are valid Stroop words/colors, and they don't match, it's incongruent
      return 'incongruent';
    }
    return 'neutral'; // e.g., if word is not a color word, or color is ambiguous
  }, []);

  // Generates a new Stroop stimulus (word and its display color)
  const generateStimulus = useCallback(() => {
    if (!activePhaseDetails) return;

    // Clear previous feedback
    setShowFeedback(false);
    setFeedbackMessage('');
    setFeedbackColorClass('');

    const colorOptions = activePhaseDetails.details.color_options;
    const stimulusTypes = activePhaseDetails.details.stimulus_types;

    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    const randomDisplayColorName = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    // Random stimulus type is generated but not directly used for display logic below
    // as visual congruence/incongruence is determined by word and display color.
    const randomStimulusType = stimulusTypes[Math.floor(Math.random() * stimulusTypes.length)];

    const displayWord = randomWord; // Changed to const as it's not reassigned within this function
    let displayColorClass = COLORS[randomDisplayColorName]; // The color it's displayed in
    let currentCorrectAnswer = '';

    if (currentPhaseIndex === 0) { // Word Phase: Identify word meaning
      currentCorrectAnswer = randomWord;
      // For word phase, the display color might be incongruent for interference
      // but the *correct answer* is always the word's meaning.
      // We still use randomDisplayColorName for visual interference.
    } else { // Color Phase: Identify text color
      currentCorrectAnswer = randomDisplayColorName;
      // For color phase, the displayed word might be incongruent for interference
      // but the *correct answer* is always the text color.
      // We still use displayWord for visual interference.
    }

    // Apply stimulus type logic (optional for visual setup but good for scoring)
    // This logic ensures that `displayColorClass` is adjusted based on `randomStimulusType`
    // to create truly congruent/incongruent stimuli based on `displayWord`.
    if (randomStimulusType === 'incongruent') {
      // Ensure display color is different from word meaning for incongruent
      let newDisplayColorName = randomDisplayColorName;
      let attempts = 0;
      // Keep trying until the displayed color is different from the word itself
      while (newDisplayColorName.toLowerCase() === randomWord.toLowerCase() && attempts < 10) {
        newDisplayColorName = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        attempts++;
      }
      displayColorClass = COLORS[newDisplayColorName];
    } else if (randomStimulusType === 'congruent') {
      // Ensure display color matches word meaning for congruent
      displayColorClass = COLORS[randomWord.toLowerCase()];
    }
    // 'neutral' doesn't require specific manipulation for this simple setup

    setStimulusWord(displayWord);
    setStimulusColor(displayColorClass);
    setCorrectAnswerValue(currentCorrectAnswer);
    setLastAttemptTime(performance.now()); // Mark time stimulus was displayed
  }, [activePhaseDetails, currentPhaseIndex]);

  // Handles user's answer selection
  const handleAnswer = useCallback((selectedButtonColorOrWord: string) => {
    if (!testStarted || testFinished) return;

    const reactionTime = performance.now() - lastAttemptTime;

    const isCorrect = selectedButtonColorOrWord.toLowerCase() === correctAnswerValue.toLowerCase();

    // Determine stimulus type for accurate scoring based on the current stimulus
    const currentStimulusType = getStimulusType(stimulusWord, stimulusColor);

    // Update phase statistics
    setPhaseStats(prevStats => {
      const newStats = { ...prevStats };
      newStats.reactionTimes.push(reactionTime);

      if (isCorrect) {
        newStats.correctAnswers++;
        // Get score value based on stimulus type and correctness from activity details
        const scoreValue = activePhaseDetails?.details.scoring[`${currentStimulusType}_correct` as keyof typeof activePhaseDetails.details.scoring] || 0;
        setCurrentScore(prevScore => prevScore + scoreValue);

        if (currentStimulusType === 'congruent') newStats.congruentCorrect++;
        else if (currentStimulusType === 'incongruent') newStats.incongruentCorrect++;
        else if (currentStimulusType === 'neutral') newStats.neutralCorrect++;

        setFeedbackMessage('Correct!');
        setFeedbackColorClass('text-green-600');
      } else {
        newStats.incorrectAnswers++;
        setFeedbackMessage('Incorrect!');
        setFeedbackColorClass('text-red-600');
        // Subtract points for incorrect answers if your scoring model dictates
        const scoreValue = activePhaseDetails?.details.scoring.incorrect || 0;
        setCurrentScore(prevScore => prevScore + scoreValue);
        
        // Track incorrect answers by stimulus type
        if (currentStimulusType === 'congruent') newStats.congruentIncorrect++;
        else if (currentStimulusType === 'incongruent') newStats.incongruentIncorrect++;
        else if (currentStimulusType === 'neutral') newStats.neutralIncorrect++;
      }
      return newStats;
    });

    setShowFeedback(true);
    // Hide feedback after a short delay
    if (stimulusTimeoutRef.current) {
      clearTimeout(stimulusTimeoutRef.current);
    }
    stimulusTimeoutRef.current = setTimeout(() => {
      generateStimulus();
    }, 500); // Short delay to show feedback before next stimulus
  }, [testStarted, testFinished, lastAttemptTime, correctAnswerValue, activePhaseDetails, stimulusWord, stimulusColor, generateStimulus, getStimulusType]); // getStimulusType is now defined before this usage


  // --- Effect Hooks ---

  // Initialize phase details when component mounts or phase changes
  useEffect(() => {
    if (currentPhaseIndex === 0 && wordPhaseDetails) {
      setActivePhaseDetails(wordPhaseDetails);
      setTimeRemaining(wordPhaseDetails.duration_seconds);
    } else if (currentPhaseIndex === 1 && colorPhaseDetails) {
      setActivePhaseDetails(colorPhaseDetails);
      setTimeRemaining(colorPhaseDetails.duration_seconds);
    } else {
      // If no phase details available for current index, handle end of test or error
      if (!testFinished && (completedWordPhase && completedColorPhase)) { // If both completed, redirect
        alert('You have already completed both Stroop test phases. Redirecting to dashboard.');
        router.push('/dashboard');
      } else if (!testFinished && (!wordPhaseDetails || !colorPhaseDetails)) {
         // This case handles when activePhaseDetails is null because initial fetch failed.
         // An error message is already shown in the parent page.tsx.
      }
    }
    resetPhaseStats(); // Reset stats for the new phase
    setTestStarted(false); // Reset test started state
    setTestFinished(false); // Reset test finished state
    setFeedbackMessage(''); // Clear any lingering messages
    setShowFeedback(false);
  }, [currentPhaseIndex, wordPhaseDetails, colorPhaseDetails, resetPhaseStats, testFinished, router, completedWordPhase, completedColorPhase]);

  // Handle initial phase setup based on completion status
  useEffect(() => {
    if (completedColorPhase) {
      // This is primarily handled in the `useEffect` above that watches `currentPhaseIndex`
      // and initial `completedWordPhase`/`completedColorPhase` props.
      // Keeping this for explicit clarity, but the other effect might handle the redirect first.
      router.push('/dashboard');
    } else if (completedWordPhase && currentPhaseIndex === 0) { // If word phase is done, start directly with color phase
      setCurrentPhaseIndex(1);
    }
  }, [completedWordPhase, completedColorPhase, currentPhaseIndex, router]);

  // Timer logic
  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && testStarted) {
      // Time is up, end the current phase
      clearInterval(timerRef.current!);
      timerRef.current = null;
      setTestStarted(false); // Stop the test for this phase
      setTestFinished(true); // Mark current phase as finished
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, timeRemaining]);

  // Handle phase completion and transition/submission
  useEffect(() => {
    if (testFinished && activePhaseDetails) {
      const avgReactionMs = phaseStats.reactionTimes.length > 0
        ? phaseStats.reactionTimes.reduce((sum, rt) => sum + rt, 0) / phaseStats.reactionTimes.length
        : 0;

      // Construct result to save, matching ActivityResult type
      const resultToSave: ActivityResult = {
        activity_id: activePhaseDetails.id,
        correct_answers: phaseStats.correctAnswers,
        incorrect_answers: phaseStats.incorrectAnswers,
        duration_seconds: activePhaseDetails.duration_seconds,
        details: {
          congruent: { correct: phaseStats.congruentCorrect, incorrect: phaseStats.congruentIncorrect },
          incongruent: { correct: phaseStats.incongruentCorrect, incorrect: phaseStats.incongruentIncorrect },
          neutral: { correct: phaseStats.neutralCorrect, incorrect: phaseStats.neutralIncorrect },
          avg_reaction_ms: avgReactionMs,
        },
      };

      // Store word phase result if it's the first phase, otherwise submit both
      if (currentPhaseIndex === 0) {
        setWordPhaseFinalResult(resultToSave); // Store the ActivityResult directly
        alert(`Word Phase Complete!\nYour score: ${currentScore}\nMoving to Color Phase...`);
        setCurrentPhaseIndex(1); // Move to the next phase
      } else {
        // This is the Color Phase, submit both results if Word Phase result exists
        const submitAllResults = async () => {
          let success = true;
          let message = 'Test complete! Results submitted.';

          if (wordPhaseFinalResult) {
            // Submit the stored word phase result
            const wordResult = await saveStroopActivityResult(wordPhaseFinalResult);
            if (!wordResult.success) {
              success = false;
              message = `Failed to save Word Phase result: ${wordResult.message}`;
              alert(message);
              return; // Stop if word phase save failed
            }
          }

          // Submit the current color phase result
          const colorResult = await saveStroopActivityResult(resultToSave);
          if (!colorResult.success) {
            success = false;
            message = `Failed to save Color Phase result: ${colorResult.message}`;
            alert(message);
          }

          if (success) {
            alert(message + '\nRedirecting to dashboard to see results.');
            router.push('/dashboard');
          }
        };
        submitAllResults();
      }
    // Removed 'saveStroopActivityResult' from dependency array as it's a stable Server Action reference.
    }
  }, [testFinished, activePhaseDetails, currentPhaseIndex, currentScore, phaseStats, wordPhaseFinalResult, router]);


  // Start test handler
  const startTest = useCallback(() => {
    setTestStarted(true);
    setTimeRemaining(activePhaseDetails?.duration_seconds || 0); // Reset time for the active phase
    resetPhaseStats(); // Ensure stats are reset at the start of a phase
    generateStimulus();
  }, [activePhaseDetails, generateStimulus, resetPhaseStats]);

  // Determine button labels based on the current phase
  const getButtonLabels = useCallback(() => {
    if (!activePhaseDetails) return [];
    if (currentPhaseIndex === 0) { // Word Phase: buttons for words
      return WORDS;
    } else { // Color Phase: buttons for colors
      // Ensure the labels match the expected `correctAnswerValue` which is the plain color name.
      return activePhaseDetails.details.color_options.map(color => color.charAt(0).toUpperCase() + color.slice(1));
    }
  }, [activePhaseDetails, currentPhaseIndex]);

  // Display initial instructions or test interface
  if (!activePhaseDetails) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Loading Test...</CardTitle>
            <CardDescription>Preparing Stroop Test environment.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please ensure activity details are correctly configured in Supabase.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-lg shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center">
            Stroop Test: {activePhaseDetails.name}
          </CardTitle>
          <CardDescription className="text-blue-100 text-center mt-2">
            {activePhaseDetails.instructions}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {!testStarted && !testFinished && (
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700">
                Click &quot;Start Test&quot; when you are ready.
              </p>
              <Button
                onClick={startTest}
                className="w-2/3 py-3 text-lg font-semibold bg-green-500 hover:bg-green-600 transition-colors"
              >
                Start Test
              </Button>
            </div>
          )}

          {testStarted && !testFinished && (
            <>
              <div className="flex justify-between items-center text-lg font-medium text-gray-800 mb-4">
                <span>Score: <span className="font-bold text-blue-600">{currentScore}</span></span>
                <span>Time Left: <span className="font-bold text-purple-600">{timeRemaining}s</span></span>
              </div>
              <Progress
                value={(timeRemaining / (activePhaseDetails.duration_seconds || 60)) * 100}
                className="w-full h-2 rounded-full"
              />

              <div className="text-center text-5xl font-extrabold mb-8 min-h-[80px] flex items-center justify-center">
                {/* Display the word in the specified color */}
                <span className={`${stimulusColor}`}>
                  {stimulusWord}
                </span>
              </div>

              {showFeedback && (
                <p className={`text-center text-xl font-semibold ${feedbackColorClass} mt-2 mb-4`}>
                  {feedbackMessage}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                {getButtonLabels().map((label) => (
                  <Button
                    key={label}
                    onClick={() => handleAnswer(label)}
                    className="p-4 text-xl font-bold rounded-lg shadow-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </>
          )}

          {testFinished && (
            <div className="text-center space-y-4">
              <p className="text-2xl font-bold text-gray-800">
                {currentPhaseIndex === 0 ? 'Word Phase Completed!' : 'Test Completed!'}
              </p>
              <p className="text-xl text-gray-700">
                Final Score: <span className="font-extrabold text-blue-600">{currentScore}</span>
              </p>
              <p className="text-md text-gray-600">
                {currentPhaseIndex === 0
                  ? 'Moving to the Color Phase shortly...'
                  : 'Redirecting to your dashboard to view full results.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
