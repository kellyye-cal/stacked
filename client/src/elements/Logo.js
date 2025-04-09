import React from "react";
import {ReactComponent as LogoSVG} from '../logo.svg';

function Logo({size}) {
    let height;

    if (size === "m") {
        height = 36;
    }

    return (
        <LogoSVG height={height} preserveAspectRatio="xMinYMin"/>
    )
}

export default Logo;