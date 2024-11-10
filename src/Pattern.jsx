import React, { useState, useEffect, useRef } from "react";

const Grid = () => {
    const rows = 20;
    const cols = 20;
    const maxGridLength = 80; // Max length for the grid side

    const [grid, setGrid] = useState(
        Array(rows).fill().map(() => Array(cols).fill({ text: "", color: "#0e0e0e" }))
    );

    const [wavePosition, setWavePosition] = useState(null);
    const [waveLayer, setWaveLayer] = useState(0); 
    const intervalRef = useRef(null); 

    useEffect(() => {
        if (rows > maxGridLength || cols > maxGridLength) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current); 
            }
            return;
        }
        if (wavePosition !== null) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current); 
            }

            intervalRef.current = setInterval(() => {
                setWaveLayer((prevLayer) => prevLayer + 1);
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [wavePosition, rows, cols]);

    useEffect(() => {
        if (waveLayer >= Math.max(rows, cols)) {
            setWavePosition(null); 
            setWaveLayer(0);
            return;
        }

        if (wavePosition !== null) {
            const { row, col } = wavePosition;

            const newGrid = grid.map((gridRow, rowIndex) =>
                gridRow.map((cell) => ({
                    ...cell,
                    color: "#0e0e0e", 
                }))
            );

            const updatedGrid = newGrid.map((gridRow, rowIndex) =>
                gridRow.map((cell, colIndex) => {
                    if (
                        // Top boundary
                        (rowIndex === row - waveLayer || rowIndex === row + waveLayer) &&
                        colIndex >= col - waveLayer &&
                        colIndex <= col + waveLayer ||
                        // Bottom boundary
                        (rowIndex === row - waveLayer || rowIndex === row + waveLayer) &&
                        colIndex >= col - waveLayer &&
                        colIndex <= col + waveLayer ||
                        // Left boundary
                        (colIndex === col - waveLayer || colIndex === col + waveLayer) &&
                        rowIndex >= row - waveLayer &&
                        rowIndex <= row + waveLayer ||
                        // Right boundary
                        (colIndex === col - waveLayer || colIndex === col + waveLayer) &&
                        rowIndex >= row - waveLayer &&
                        rowIndex <= row + waveLayer
                    ) {
                        return { ...cell, color: "red" };
                    }
                    return cell; 
                })
            );

            setGrid(updatedGrid);
        }
    }, [waveLayer, wavePosition, rows, cols]);

    const handleCellClick = (row, col) => {
        const newGrid = Array(rows).fill().map(() => Array(cols).fill({ text: "", color: "#0e0e0e" }));
        setGrid(newGrid);

        setWavePosition({ row, col });
        setWaveLayer(1); 
    };

    return (
        <div className="flex flex-col items-center justify-center h-full bg-white">
            <div className="grid gap-1">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid-row flex">
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                className="grid-cell flex items-center justify-center w-8 h-8 border border-gray-700"
                                style={{ backgroundColor: cell.color }} // Use cell color here
                                onClick={() => handleCellClick(rowIndex, colIndex)}
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
