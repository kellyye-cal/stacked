import React from "react";
import ProfilePicture from "../ProfilePicture";

function MemberCard({member, pending, rank}) {
    return (
        <div className="friend-card">
            <ProfilePicture size="large" url={member.profilePic} />

            <div>
            <p className="body-large bold"> 
                {pending ? <></> : <span className="subtle"> #{rank} </span>}
                {member.displayName} 
            </p>
            {pending ? <p className="small-label subtle" style={{marginTop: 0}}> Pending </p> : <></>}
            </div>
        </div>
    )
}

export default MemberCard;