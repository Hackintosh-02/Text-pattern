import React, { useState, useEffect, useRef } from "react";
import { letterPatterns } from './letterPattern.js';

const Grid2 = () => {
    const [inputText, setInputText] = useState("LED");
    const [slices, setSlices] = useState([]);
    const [phase, setPhase] = useState('falling'); // 'falling' or 'exiting'
    const delayCounter = useRef(0);
    const nextSliceIndex = useRef(1);

    const gridHeight = 20;                       // Number of rows in the grid
    const gridWidth = inputText.length * 5;      // Total number of columns (5 pixels per letter)
    const speed = 1;                             // Speed of falling slices
    const delayBetweenSlices = 10;               // Delay between slices in frames

    // Utility function to generate horizontal slices from the input text
    const generateSlices = (inputText) => {
        const slices = [];

        // For each row in the LED pattern (there are 7 rows)
        // We start from the bottom row and move up to the top row
        for (let row = 6; row >= 0; row--) {
            let sliceData = [];

            // For each character in the input text
            for (let charIndex = 0; charIndex < inputText.length; charIndex++) {
                const char = inputText[charIndex].toUpperCase();
                const pattern = letterPatterns[char] || letterPatterns[" "];

                // Get the row-th row of the pattern
                const patternRow = pattern[row].split(''); // Convert string to array of '1's and '0's

                // Append this row to the slice data
                sliceData = sliceData.concat(patternRow);
            }

            // Each slice represents one horizontal row across all letters
            slices.push({
                data: sliceData,   // Array of '1's and '0's for this slice
                yPos: -1,          // Start position (above the grid)
                active: false,     // Initially not active
            });
        }

        return slices;
    };

    // Initialize slices when inputText changes
    useEffect(() => {
        const newSlices = generateSlices(inputText);
        if (newSlices.length > 0) {
            newSlices[0].active = true;          // Start the first slice
            newSlices[0].yPos = -1;
        }
        setSlices(newSlices);
        nextSliceIndex.current = 1;
        delayCounter.current = 0;
        setPhase('falling');
    }, [inputText]);

    // Animation loop
    useEffect(() => {
        const interval = setInterval(() => {
            setSlices(prevSlices => {
                const updatedSlices = [...prevSlices];

                if (phase === 'falling') {
                    // Falling and stacking phase
                    let allStopped = true;

                    // Update positions of active slices
                    for (let i = 0; i < updatedSlices.length; i++) {
                        const slice = updatedSlices[i];
                        if (slice.active) {
                            let newYPos = slice.yPos + speed;
                            let collision = false;

                            // Check collision with previous slice
                            if (i > 0) {
                                const prevSlice = updatedSlices[i - 1];
                                if (newYPos >= prevSlice.yPos - 1) {
                                    newYPos = prevSlice.yPos - 1;
                                    collision = true;
                                }
                            } else {
                                // Check collision with bottom of the grid
                                if (newYPos >= gridHeight - 1) {
                                    newYPos = gridHeight - 1;
                                    collision = true;
                                }
                            }

                            updatedSlices[i] = {
                                ...slice,
                                yPos: newYPos,
                                active: !collision,
                            };

                            if (!collision) {
                                allStopped = false;
                            }
                        }
                    }

                    // Handle activation of next slice
                    if (delayCounter.current >= delayBetweenSlices) {
                        if (nextSliceIndex.current < updatedSlices.length) {
                            updatedSlices[nextSliceIndex.current].active = true;
                            updatedSlices[nextSliceIndex.current].yPos = -1;
                            nextSliceIndex.current += 1;
                            delayCounter.current = 0;
                        }
                    } else {
                        delayCounter.current += 1;
                    }

                    // If all slices have stopped, switch to 'exiting' phase
                    if (allStopped && updatedSlices.length > 0) {
                        nextSliceIndex.current = 0; // Start from first slice
                        delayCounter.current = 0;
                        setPhase('exiting');
                    }
                } else if (phase === 'exiting') {
                    // Unstacking and exiting phase
                    let allExited = true;

                    // Update positions of active slices
                    for (let i = 0; i < updatedSlices.length; i++) {
                        const slice = updatedSlices[i];
                        if (slice.active) {
                            let newYPos = slice.yPos + speed;

                            updatedSlices[i] = {
                                ...slice,
                                yPos: newYPos,
                            };

                            // Check if slice has exited the grid
                            if (newYPos >= gridHeight) {
                                updatedSlices[i].active = false;
                            } else {
                                allExited = false;
                            }
                        }
                    }

                    // Handle activation of next slice
                    if (delayCounter.current >= delayBetweenSlices) {
                        if (nextSliceIndex.current < updatedSlices.length) {
                            updatedSlices[nextSliceIndex.current].active = true;
                            // Slices continue from current position
                            nextSliceIndex.current += 1;
                            delayCounter.current = 0;
                        }
                    } else {
                        delayCounter.current += 1;
                    }

                    // If all slices have exited, reset for next 'falling' phase
                    if (allExited) {
                        const resetSlices = generateSlices(inputText);
                        if (resetSlices.length > 0) {
                            resetSlices[0].active = true;
                            resetSlices[0].yPos = -1;
                        }
                        nextSliceIndex.current = 1;
                        delayCounter.current = 0;
                        setPhase('falling');
                        return resetSlices;
                    }
                }

                return updatedSlices;
            });
        }, 100); // Adjust the interval for animation speed

        return () => clearInterval(interval);
    }, [phase]); // Re-run effect when phase changes

    // Render the grid based on the slices' positions
    const renderGrid = () => {
        const grid = [];

        for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
            const row = [];

            for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
                let cellColor = "#0e0e0e"; // Default background color

                // Check if any slice is at this grid position
                for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
                    const slice = slices[sliceIndex];
                    const sliceYPos = Math.round(slice.yPos);

                    if (sliceYPos === rowIndex) {
                        const char = slice.data[colIndex];
                        if (char === '1') {
                            cellColor = "red"; // LED "on" color
                        }
                        break; // No need to check other slices
                    }
                }

                row.push(
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className="grid-cell flex items-center justify-center w-4 h-4 border border-gray-700"
                        style={{ backgroundColor: cellColor }}
                    ></div>
                );
            }
            grid.push(
                <div key={rowIndex} className="grid-row flex">
                    {row}
                </div>
            );
        }
        return grid;
    };

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.toUpperCase())}
                placeholder="Enter your text"
                className="mb-6 p-2 text-black bg-gray-300 rounded w-80"
            />
            <div className="grid gap-1">{renderGrid()}</div>
        </div>
    );
};

export default Grid2;
