import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

function RequestCard({children, buttonOneFunc, buttonTwoFunc}) {
    return (
        <div className="small card" style={{marginBottom: 16}}>
            {children}

            <div className="h-between" style={{gap: 12, margin: "8px auto"}}>
                <button
                    style={{flex: 1, padding: "6px 0px", textAlign: "center", justifyContent: "center", gap: 5, fontSize: "11pt"}}
                    className="vibrant-blue-bg"
                    onClick={buttonOneFunc}>
                    <FontAwesomeIcon icon={faCheck} size="xs"/> Accept
                </button>

                <button
                    style={{flex: 1, padding: "6px 0px", textAlign: "center", justifyContent: "center", fontSize: "11pt"}} 
                    className="subtle-gray-bg"
                    onClick={buttonTwoFunc}>
                    Reject
                </button>
            </div>
        </div>
    )
}

export default RequestCard;