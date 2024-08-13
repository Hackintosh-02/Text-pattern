import React, { useState, useEffect } from "react";
import { letterPatterns } from './letterPattern';

const Grid = () => {
  const rows = 15;
  const cols = 20;

  const [inputText, setInputText] = useState("HELLO");
  const [grid, setGrid] = useState(Array(rows).fill(Array(cols).fill("")));
  const [position, setPosition] = useState(0);
  const [textLength, setTextLength] = useState(inputText.length * 6);

  useEffect(() => {
    setTextLength(inputText.length * 6);
  }, [inputText]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateGrid();
    }, 200); 

    return () => clearInterval(interval);
  }, [position, inputText]);

  const updateGrid = () => {
    const newGrid = Array(rows).fill("").map((_, rowIndex) => 
      Array(cols).fill("").map((_, colIndex) => {
        const offset = (colIndex + position) % textLength;
        const letterIndex = Math.floor(offset / 6); 
        const letter = inputText[letterIndex] || " ";
        const pattern = letterPatterns[letter.toUpperCase()] || letterPatterns[" "];

        const patternRow = rowIndex - 4;
        const patternCol = offset % 6;

        if (
          rowIndex >= 4 &&
          rowIndex < 11 &&
          patternCol >= 0 &&
          patternCol < 5 &&
          patternRow >= 0 &&
          patternRow < 7 &&
          pattern[patternRow][patternCol] === "1"
        ) {
          return {
            text: "",
            color: "red",
          };
        }
        return {
          text: "",
          color: "#0e0e0e",
        };
      })
    );

    setGrid(newGrid);
    setPosition((prevPosition) => (prevPosition + 1) % (cols + textLength));
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter your text"
        className="mb-6 p-2 text-black bg-gray-300 rounded w-80"
      />
      <div className="grid gap-1">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row flex">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className="grid-cell flex items-center justify-center w-8 h-8 border border-gray-700"
                style={{ backgroundColor: cell.color }}
              >
                {cell.text}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grid;
