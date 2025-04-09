import React from "react";
import { Link } from "react-router-dom";

function Group({display}) {
    if (display === "Card") {
        return (
            <Link className="group card container-shadow">
                <h4> Little Buddies </h4>
                
                <div style={{display: "flex", gap: 8}}>
                    <p> Ranked #7/8 </p>
                    <p> | </p>
                    <p> -%50.42 </p>
                </div>
            </Link>
        )
    } else {
        return (
            <></>
        )
    }
};

export default Group;