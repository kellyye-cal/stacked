import React, {useEffect, useState, useRef} from "react";

import Chip from "../Chip";
import ChipColorPanel from "./ChipColorPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faTimes } from "@fortawesome/free-solid-svg-icons";

const DOLLAR_REGEX = /^\d*\.?\d{0,2}$/;

function ChipAmounts({chips, setChips, validAmounts, setValidAmounts}) {
    const [fallBackValidAmounts, setFallbackValidAmounts] = useState(false);
    const colors = ["#AE3939", "#3B8E53", "#BF653B", "#E3C240", "#2D33A3", "#7335C3", "#303832", "#E39999"];
    const chipRefs = useRef({});
    const chipContainerRef = useRef(null);
    const [colorPanelOpen, setColorPanelOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState("");
    const [colorPanelPos, setColorPanelPos] = useState({ top: 0, left: 0 });
    const colorPanelRef = useRef(null);


    useEffect(() => {
        if (chips.length === 0) {
            const initialChips = new Map();
            initialChips.set(colors[0], "0.50")
            initialChips.set(colors[1], "1.00")
            setChips(initialChips);
        }
    }, [])

    useEffect(() => {
        let allValid = true; 
        chips.entries().forEach(([color, value]) => {
            if (!DOLLAR_REGEX.test(value)) {
                allValid = false;
            }
        })
        setValidAmounts(allValid)
    }, [chips]);

    const handleNewChip = () => {
        setChips(prev => {
            const updated = new Map(prev);

            const usedColors = new Set([...prev.keys()]);
            const nextColor = colors.find(color => !usedColors.has(color));

            updated.set(nextColor, "0.00");
            return updated;
        })
    }

    const handleEditChip = (color) => {
        setColorPanelOpen(true);
        setSelectedColor(color);

        const chipEl = chipRefs.current[color];
        const containerEl = chipContainerRef.current;
    
        if (chipEl && containerEl) {
            const chipRect = chipEl.getBoundingClientRect();
            const containerRect = containerEl.getBoundingClientRect();
    
            const top = chipRect.top - containerRect.top;
            const left = chipRect.right - containerRect.left + 10;
    
            setColorPanelPos({ top, left });
        }
    }

    const handleNewColor = (oldColor, newColor) => {
        let oldValue = chips.get(oldColor);

        const newChipMap = new Map(chips);
        newChipMap.delete(oldColor);

        setSelectedColor(newColor);
        newChipMap.set(newColor, oldValue);
        setChips(newChipMap)
    }

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                colorPanelRef.current &&
                !colorPanelRef.current.contains(e.target) &&
                !Object.values(chipRefs.current).some(ref => ref && ref.contains(e.target))
            ) {
                setColorPanelOpen(false);
            }
        }
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const deleteChip = (color) => {
        setChips(prev => {
            const updated = new Map(prev);

            updated.delete(color);
            return updated;
        });
    }

    return (
        <div ref={chipContainerRef} style={{ position: "relative" }}>
            <div className="h-between">
                <label> Chip Amounts </label>

                <button type="button" 
                        onClick={handleNewChip}
                        disabled={chips.size >= colors.length}
                        className="add-chip-button"
                        >
                    <FontAwesomeIcon icon={faCirclePlus} size="sm"/>
                </button>
            </div>

            {colorPanelOpen && (
                <div
                    ref={colorPanelRef}
                    style={{
                        position: "absolute",
                        top: colorPanelPos.top,
                        left: colorPanelPos.left,
                        zIndex: 1000
                }}>
                    <ChipColorPanel
                        colors={colors}
                        selectedColor={selectedColor}
                        onSelect={handleNewColor}
                        chips={chips}
                        closeFunc={() => setColorPanelOpen(false)} />
                </div>
            )}

            {!validAmounts ? <p className="small-label red-text">Please enter valid dollar amounts without the $ symbol.</p> : <></>}
            <div style={{display: "flex", flexWrap: "wrap", gap: 24, marginTop: 8}}>
                {[...chips.entries()].map(([color, value], index) => (
                    <div className="chip-amount flex-column" style={{position: "relative"}}>
                        <button
                            type="button"
                            onClick={() => deleteChip(color)}
                            style={{
                                backgroundColor: "var(--red-text)",
                                padding: "2px 3px",
                                borderRadius: 20,
                                position: "absolute",
                                left: 2,
                            }}>
                            <FontAwesomeIcon icon={faTimes} size="xs"/>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleEditChip(color)}
                            ref={(el) => chipRefs.current[color] = el}
                        >
                            <Chip size={60} color={color}/>
                        </button>
                        <div style={{position: "relative"}}>
                            <div style={{
                                position: "absolute",
                                fontSize: "11pt",
                                backgroundColor: "var(--subtle-gray)",
                                left: 0,
                                width: 10,
                                textAlign: "center",
                                borderRadius:"4px 0px 0px 4px"}}> $ </div>
                            <input 
                                style={{paddingLeft: 20}}
                                value={value}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setChips(prev => {
                                        const updated = new Map(prev);
                                        updated.set(color, newValue);
                                        return updated;
                                    })
                                }}>
                            </input>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChipAmounts;