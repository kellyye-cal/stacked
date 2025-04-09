import React, {useEffect, useRef} from "react";

function Modal({isOpen, closeFunc, closing, children}) {
    const modalRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                closeFunc();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [closeFunc]);

    if (isOpen) {
        return (
            <div className="overlay">
                <div ref={modalRef} className={`modal ${closing ? 'fade-out' : ''}`}>
                    {children}
                </div>
            </div>
        )
    } else {
        return(<></>)
    }
};

export default Modal;