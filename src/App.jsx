import React from "react";
import Grid from "./Grid";
import Grid2 from "./Grid2";
import Pattern  from "./Pattern";

function App() {
  return (
    <div className="App text-white flex flex-col items-center justify-center h-screen bg-white">
      <h1 className="text-4xl font-bold text-center mb-10">Text Pattern Grid</h1>
      <Pattern />
    </div>
  );
}

export default App;
