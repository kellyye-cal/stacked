import React, {useState} from "react";

function Toggle({optionA, optionB, setSelected}) {
    const [selectedOption, setSelectedOption] = useState(0);

    const selectA = () => {
        setSelectedOption(0);
        setSelected(optionA);
    }

    const selectB = () => {
        setSelectedOption(1);
        setSelected(optionB);
    }

    return (
        <div className="toggle">
            <button 
                className={`${selectedOption === 0 ? "vibrant-blue-bg" : ""}`}
                onClick={selectA}
                >
                {optionA}
            </button>

            <button
                className={`${selectedOption === 1 ? "vibrant-blue-bg" : ""}`}
                onClick={selectB}
                >
                {optionB}
            </button>
        </div>
    )
};

export default Toggle;