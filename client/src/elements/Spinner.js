import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Spinner = () => {
    return (
        <div className="spinner-container">
            <div className="spinner"> <FontAwesomeIcon icon={faSpinner} size="xl"/> </div>
        </div>
    )
}

export default Spinner;