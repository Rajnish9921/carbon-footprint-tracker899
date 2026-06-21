import { useState } from "react";

export default function EmissionForm() {
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("Please enter a value");
  };

  return (
    <div>
      <input type="text" placeholder="Enter value" />
      <button type="button" onClick={handleCalculate}>
        Calculate
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
