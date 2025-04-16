import React from "react";
import ProfilePicture from "../ProfilePicture";

function MemberCard({member}) {
    return (
        <div className="friend-card">
            <ProfilePicture size="large" url={member.profilePic} />
            <p className="body-large bold"> 
                <span className="subtle"> #1 </span>
                {member.displayName} 
            </p>
        </div>
    )
}

export default MemberCard;