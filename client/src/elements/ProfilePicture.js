import React  from "react";

function ProfilePicture({url, size}) {

    return url ? (
        <img
            className={`profile-pic ${size}`}
            src={url}
            alt="Profile"
        />
    ) : (
        <div className={`profile-pic ${size}`}></div>
    );
};

export default ProfilePicture;