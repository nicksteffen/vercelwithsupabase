
'use client';

import { useState } from "react";

interface QuestionBodyProps {
    getAnswer: (answer: boolean) => void;
}   


interface StroopQuestion {
    word: string;
    color: string;
    code: string;
}

const colorOptions : StroopQuestion[] = [
    { word: "Red", color: "#FF0000" , code: "RED" },
    { word: "Green", color: "#00FF00", code: "GREEN" },
    { word: "Blue", color: "#0000FF", code: "BLUE" },
    { word: "Yellow", color: "#FFFF00", code: "YELLOW" },
    { word: "Orange", color: "#FFA500", code: "ORANGE" },
    { word: "Purple", color: "#800080", code: "PURPLE" },
    { word: "Pink", color: "#FFC0CB", code: "PINK" },
];

function StroopQuestion({word, color, code}: StroopQuestion) {
    // This function will render the question
    // It will display the word in the color specified
    return (
        <div className="text-3xl font-bold" style={{ color: color }}>
            {word}
        </div>
    );
}

export default function QuestionBody({getAnswer }: QuestionBodyProps) {
    // {getAnswer:  getAnswer, }: QuestionBodyProps) {
    // This component is a placeholder for the question body
    // It will be used to display the question and get the answer from the user
    // The getAnswer function will be passed as a prop to this component
    const [question, setQuestion] = useState<StroopQuestion | null>(null);

    const handleAnswer = (answer: boolean) => {
        // This function will handle the answer from the user
        // It will call the getAnswer function passed as a prop
        console.log("User answered:", answer);
        // setQuestion(`Question Value ${Math.random() }`)
        setQuestion({color: colorOptions[Math.floor(Math.random() * colorOptions.length)].color, word: colorOptions[Math.floor(Math.random() * colorOptions.length)].word, code: colorOptions[Math.floor(Math.random() * colorOptions.length)].code});



        getAnswer(answer);
    };


    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Question Body</h2>
            <p className="text-gray-700">This is where the question will be displayed.</p>
            <StroopQuestion
                word={question?.word || "Loading..."}
                color={question?.color || "#000000"}
                code={question?.code || "LOADING"}
            />

            <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleAnswer(true)}
            >
                True
                </button>
            <button 
                className="mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleAnswer(false)}
            >
                False
            </button>
            {/* Add your question content here */}
        </div>
    );
}       