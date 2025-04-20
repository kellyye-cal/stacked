import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSlash, faTimes } from "@fortawesome/free-solid-svg-icons";

function ChipColorPanel({colors, chips, onSelect, selectedColor, closeFunc}) {
    return (
        <div style={{
            position: "absolute",
            backgroundColor: "#282C35",
            padding: "8px 12px",
            borderRadius: 4
        }}>
            <div className="h-between" style={{paddingBottom: 4}}>
                <p className="small-label"> Edit Color </p>
                <button onClick={closeFunc} style={{padding: 0}}>
                    <FontAwesomeIcon icon={faTimes} size="xs"/>
                </button>
            </div>
            <div style={{display: "flex", columnGap: 8, rowGap: 4,
                flexWrap: "wrap", width: 104
            }}>
                {colors.map((color) => (
                    [...chips.keys()].includes(color) && color != selectedColor?
                   <div key={color} style={{ position: "relative", height: 20, width: 20 }}>
                        <div
                        style={{
                        height: "100%",
                        width: "100%",
                        backgroundColor: color,
                        borderRadius: "50%",
                        opacity:  0.5,
                        }}
                        ></div>

                        <FontAwesomeIcon
                            icon={faSlash}
                            style={{
                                position: "absolute",
                                width: "16px",
                                height: "16px",
                                color: "var(--subtle-gray)",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        ></FontAwesomeIcon>
                 </div> :
                 <button key={color}
                    type="button"
                    style={{
                        height: 20,
                        width: 20,
                        backgroundColor: color,
                        borderRadius: 200,
                        boxSizing: "border-box",
                        border: `${color === selectedColor ? "2px solid var(--vibrant-blue)" : ""}`
                        }}
                    onClick={() => onSelect(selectedColor, color)}
                    >
                </button>
                ))}
            </div>
        </div>
    )
}

export default ChipColorPanel;