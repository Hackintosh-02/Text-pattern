import React, { useState, useEffect, useRef } from "react"; // Import necessary modules from React
import { letterPatterns } from './letterPattern.js'; // Import the letter patterns for the LED display

// Define the Grid2 component
const Grid2 = () => {
    // State variables to manage the input text and the slices of text
    const [inputText, setInputText] = useState("LED"); // The text to display in the grid
    const [slices, setSlices] = useState([]);          // An array to hold the slices (rows) of the text
    const [phase, setPhase] = useState('stacking');    // The current phase of the animation ('stacking', 'waiting', 'movingDown')

    // References (similar to variables) to keep track of counters and indices across renders
    const delayCounter = useRef(0);      // Counter to manage delay between activating slices
    const nextSliceIndex = useRef(0);    // Index of the next slice to activate
    const waitingCounter = useRef(0);    // Counter for the waiting phase duration

    // Configuration constants for the grid and animation
    const gridHeight = 15;               // Number of rows in the grid (vertical size)
    const gridWidth = 44;                // Number of columns in the grid (horizontal size)
    const speed = 1;                     // Speed at which the slices move (units per frame)
    const delayBetweenSlices = 5;        // Number of frames to wait before activating the next slice
    const stackingRow = 8;               // The row index where slices start stacking

    // Function to generate slices (rows) of the text based on the LED patterns
    const generateSlices = (inputText) => {
        const slices = []; // Initialize an empty array to hold the slices

        // Calculate the total width of the text in terms of columns
        const textWidth = inputText.length * 5 + (inputText.length - 1) * 1; // Each character is 5 columns wide, plus 1 column space between characters

        // Calculate the starting column to center the text horizontally in the grid
        const startCol = Math.floor((gridWidth - textWidth) / 2);

        // Loop through each row of the character patterns (there are 7 rows)
        // We start from the bottom row (row index 6) and go up to the top row (row index 0)
        for (let row = 6; row >= 0; row--) {
            // Initialize an array representing a row in the grid, filled with '0's (LEDs off)
            let sliceData = new Array(gridWidth).fill('0');

            // Position within the sliceData where we start adding character patterns
            let colPosition = startCol;

            // Loop through each character in the input text
            for (let charIndex = 0; charIndex < inputText.length; charIndex++) {
                const char = inputText[charIndex].toUpperCase(); // Get the character and convert it to uppercase
                const pattern = letterPatterns[char] || letterPatterns[" "]; // Get the LED pattern for the character

                // Get the specific row of the character's pattern
                const patternRow = pattern[row].split(''); // Split the string into an array of '1's and '0's

                // Copy the patternRow into the sliceData at the correct position
                for (let i = 0; i < patternRow.length; i++) {
                    sliceData[colPosition + i] = patternRow[i]; // Set '1's and '0's in the sliceData
                }

                colPosition += 5; // Move past the current character's width

                // Add a space between characters, except after the last character
                if (charIndex < inputText.length - 1) {
                    colPosition += 1; // Add one column for spacing
                }
            }

            // Create a slice object representing this row of the text
            slices.push({
                data: sliceData,   // The array of '1's and '0's for this slice (row)
                yPos: -1,          // The vertical position of the slice (-1 means it's above the grid)
                active: false,     // Whether the slice is currently moving
            });
        }

        return slices; // Return the array of slices
    };

    // useEffect hook to initialize slices whenever the inputText changes
    useEffect(() => {
        const newSlices = generateSlices(inputText); // Generate new slices based on the inputText

        if (newSlices.length > 0) {
            newSlices[0].active = true; // Activate the first slice to start moving
            newSlices[0].yPos = -1;     // Set its starting position above the grid
        }
        setSlices(newSlices);           // Update the slices state with the new slices
        nextSliceIndex.current = 1;     // Reset the index of the next slice to activate
        delayCounter.current = 0;       // Reset the delay counter
        waitingCounter.current = 0;     // Reset the waiting counter
        setPhase('stacking');           // Set the phase to 'stacking' to start the animation
    }, [inputText]); // This effect runs whenever inputText changes

    // Animation loop using useEffect and setInterval
    useEffect(() => {
        const interval = setInterval(() => {
            setSlices(prevSlices => {
                const updatedSlices = [...prevSlices]; // Create a copy of the slices to update

                if (phase === 'stacking') {
                    // Stacking phase: slices fall from the top and stack to form the text
                    let allStopped = true; // Flag to check if all slices have stopped moving

                    // Update positions of active slices
                    for (let i = 0; i < updatedSlices.length; i++) {
                        const slice = updatedSlices[i];
                        if (slice.active) {
                            let newYPos = slice.yPos + speed; // Move the slice down by 'speed' units
                            let collision = false;             // Flag to detect if the slice should stop moving

                            if (i === 0) {
                                // For the first slice, check if it has reached the stackingRow
                                if (newYPos >= stackingRow) {
                                    newYPos = stackingRow;     // Set the position to the stackingRow
                                    collision = true;          // Indicate that the slice should stop moving
                                }
                            } else {
                                // For other slices, check if they have reached the slice below
                                const prevSlice = updatedSlices[i - 1];
                                if (newYPos >= prevSlice.yPos - 1) {
                                    newYPos = prevSlice.yPos - 1; // Stack on top of the previous slice
                                    collision = true;             // Indicate that the slice should stop moving
                                }
                            }

                            // Update the slice with the new position and active status
                            updatedSlices[i] = {
                                ...slice,
                                yPos: newYPos,
                                active: !collision, // Deactivate the slice if a collision occurred
                            };

                            if (!collision) {
                                allStopped = false; // At least one slice is still moving
                            }
                        }
                    }

                    // Handle activation of the next slice after a delay
                    if (delayCounter.current >= delayBetweenSlices) {
                        if (nextSliceIndex.current < updatedSlices.length) {
                            updatedSlices[nextSliceIndex.current].active = true; // Activate the next slice
                            updatedSlices[nextSliceIndex.current].yPos = -1;      // Set its starting position
                            nextSliceIndex.current += 1;                          // Move to the next slice
                            delayCounter.current = 0;                             // Reset the delay counter
                        }
                    } else {
                        delayCounter.current += 1; // Increment the delay counter
                    }

                    // Check if all slices have been activated and have stopped moving
                    const allSlicesActivated = nextSliceIndex.current >= updatedSlices.length;
                    const allSlicesStopped = updatedSlices.every(slice => !slice.active);
                    if (allSlicesActivated && allSlicesStopped) {
                        // Transition to the 'waiting' phase after stacking is complete
                        // Deactivate all slices and reset counters
                        for (let i = 0; i < updatedSlices.length; i++) {
                            updatedSlices[i].active = false;
                        }
                        nextSliceIndex.current = 0;
                        delayCounter.current = 0;
                        waitingCounter.current = 0; // Initialize the waiting counter
                        setPhase('waiting');        // Set the phase to 'waiting'
                    }
                } else if (phase === 'waiting') {
                    // Waiting phase: pause for 2 seconds before moving down
                    waitingCounter.current += 1; // Increment the waiting counter

                    if (waitingCounter.current * 100 >= 2000) { // Each interval is 100 ms, so 20 intervals equal 2 seconds
                        // After 2 seconds, transition to the 'movingDown' phase
                        setPhase('movingDown');
                        // Reset activation and delayCounter for moving down phase
                        for (let i = 0; i < updatedSlices.length; i++) {
                            updatedSlices[i].active = false;
                        }
                        nextSliceIndex.current = 0;
                        delayCounter.current = 0;
                    }
                    // No changes to slices during the waiting phase
                } else if (phase === 'movingDown') {
                    // Moving down phase: slices move down and exit the grid
                    let allExited = true; // Flag to check if all slices have exited the grid

                    // Handle activation of the next slice after a delay
                    if (nextSliceIndex.current < updatedSlices.length) {
                        if (delayCounter.current >= delayBetweenSlices || nextSliceIndex.current === 0) {
                            updatedSlices[nextSliceIndex.current].active = true; // Activate the next slice
                            // The slice starts moving down from its current position
                            nextSliceIndex.current += 1;                          // Move to the next slice
                            delayCounter.current = 0;                             // Reset the delay counter
                        } else {
                            delayCounter.current += 1; // Increment the delay counter
                        }
                    }

                    // Update positions of active slices
                    for (let i = 0; i < updatedSlices.length; i++) {
                        const slice = updatedSlices[i];
                        if (slice.active) {
                            let newYPos = slice.yPos + speed; // Move the slice down by 'speed' units
                            updatedSlices[i] = {
                                ...slice,
                                yPos: newYPos, // Update the position
                            };

                            // Check if the slice has exited the grid
                            if (newYPos >= gridHeight) {
                                updatedSlices[i].active = false; // Deactivate the slice
                            } else {
                                allExited = false; // At least one slice is still within the grid
                            }
                        }
                    }

                    // If all slices have exited, reset for the next 'stacking' phase
                    if (allExited) {
                        const resetSlices = generateSlices(inputText); // Generate new slices
                        if (resetSlices.length > 0) {
                            resetSlices[0].active = true; // Activate the first slice
                            resetSlices[0].yPos = -1;     // Set its starting position
                        }
                        nextSliceIndex.current = 1;
                        delayCounter.current = 0;
                        waitingCounter.current = 0;
                        setPhase('stacking'); // Start over with the 'stacking' phase
                        return resetSlices;   // Return the new slices to update the state
                    }
                }

                return updatedSlices; // Return the updated slices
            });
        }, 100); // The interval for the animation loop (100 milliseconds per frame)

        return () => clearInterval(interval); // Clean up the interval when the component unmounts or the phase changes
    }, [phase]); // Re-run the effect whenever the 'phase' changes

    // Function to render the grid based on the slices' positions
    const renderGrid = () => {
        const grid = []; // Initialize an array to hold the rows of the grid

        // Loop through each row index of the grid
        for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
            const row = []; // Initialize an array to hold the cells in the row

            // Loop through each column index of the grid
            for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
                let cellColor = "#0e0e0e"; // Default background color (LED off)

                // Check if any slice is at the current grid position
                for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
                    const slice = slices[sliceIndex];
                    const sliceYPos = Math.floor(slice.yPos); // Get the integer part of the slice's vertical position

                    if (sliceYPos === rowIndex) {
                        // If the slice is at the current row
                        const char = slice.data[colIndex]; // Get the character ('1' or '0') at the current column
                        if (char === '1') {
                            cellColor = "red"; // Set the cell color to red (LED on)
                        }
                        break; // No need to check other slices for this cell
                    }
                }

                // Create a cell (div) with the appropriate background color
                row.push(
                    <div
                        key={`${rowIndex}-${colIndex}`} // Unique key for React
                        className="grid-cell flex items-center justify-center w-6 h-6 border border-gray-700" // CSS classes for styling
                        style={{ backgroundColor: cellColor }} // Set the background color of the cell
                    ></div>
                );
            }

            // Add the row to the grid
            grid.push(
                <div key={rowIndex} className="grid-row flex">
                    {row}
                </div>
            );
        }
        return grid; // Return the grid to be rendered
    };

    // The main return statement of the component, rendering the input field and the grid
    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 overflow-auto">
            {/* Input field for the user to enter text */}
            <input
                type="text"
                value={inputText} // The current value of the input text
                onChange={(e) => setInputText(e.target.value.toUpperCase())} // Update the input text on change
                placeholder="Enter your text" // Placeholder text
                className="mb-6 p-2 text-black bg-gray-300 rounded w-80" // Styling classes
            />
            {/* Render the grid */}
            <div className="grid gap-1">{renderGrid()}</div>
        </div>
    );
};

export default Grid2; // Export the Grid2 component as the default export
