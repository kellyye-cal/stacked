import ReactDOM from "react-dom";
import React, { useEffect, useState, useRef} from 'react';


const Dropdown = ({ isOpen, closeFunc, buttonRef, children }) => {
    const dropdownRef = useRef(null);
    const [position, setPosition] = useState({top: 0, left: 0})

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.right + window.scrollX ,
                width: rect.width,
            });
        }
    }, [isOpen, buttonRef]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                closeFunc();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [closeFunc]);


    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div ref={dropdownRef}
            className="dropdown container-shadow"
            style={{
                position: "absolute",
                top: `${position.top + 8}px`,
                left: `${position.left}px`,
                transform: "translateX(-100%)"
            }}>
            {/* <button className="close-button" onClick={closeFunc}>×</button> */}
            {children}
        </div>,
        document.body
    );
};

export default Dropdown;