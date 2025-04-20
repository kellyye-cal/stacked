import React, {useEffect, useState, useContext} from "react";
import apiClient from "../../api/api";
import AuthContext from "../../context/AuthProvider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCheck } from '@fortawesome/free-solid-svg-icons';
import ProfilePicture from "../ProfilePicture";
import RequestCard from "../RequestCard";

function FriendCard({friend, status, setUpdateFriends}) {
    const {auth} = useContext(AuthContext);
    const [friendInfo, setFriendInfo] = useState([]);
    
    const [responded, setResponded] = useState(false);

    const [friendID, setFriendID] = useState(friend.userA);

    useEffect(() => {
        if (friend.userA === auth.userID) {
            setFriendID(friend.userB);
        }
    }, [auth.userID, friend])

    useEffect(() => {
        apiClient.get(
            `/api/friends/get_user/${friendID}`,
            {headers: {Authorization: `Bearer ${auth?.accessToken}`},
             withCredentials: true}
        ).then((res) => {
            setFriendInfo(res.data.friend);
        }).catch((err) => {console.error(err)})
    }, [auth.accessToken, auth.userID, friend.userA, friend.userB]);


    const respond = (response) => {
        setResponded(true);

        setTimeout(() => {
            setUpdateFriends(prev => !prev);
        }, 2000)
    
        apiClient.post(
            '/api/friends/respond',
            {userA: friendID, userB: auth.userID, response},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`},
             withCredentials: true}
        ).catch((err) => {console.error(err)})
    }

    if (status === "Pending") {
        return (
            responded ?
                (<div className="small card fade-out"
                style={{textAlign: "center", transition: "opacity 2000ms cubic-bezier(0.25, 0.8, 0.25, 1)"}}>
                    Response sent!
                </div>)
                :
                (<RequestCard buttonOneFunc={() => respond("Accept")} buttonTwoFunc={()=>respond("Reject")}>
                    <div style={{display: "flex", gap: 4, alignItems: "center"}}>
                        <ProfilePicture url={friendInfo.profilePic} size="small" />
                        <h6> {friendInfo.displayName} </h6>
                    </div>
                    <p className="subtle"> {friendInfo.fName + ' ' + friendInfo.lName} </p>
                </RequestCard>)
        )
    } else {
        return (
            <div className="friend-card">
                <ProfilePicture size={"large"} url={friendInfo.profilePic}/>
                <div>
                    <p className="body-large bold"> {friendInfo.displayName} </p>
                    <p className="subtle small-label">
                        <FontAwesomeIcon icon={faUsers} size="xs" style={{marginRight: 4}}/>
                        {friend.mutualGroups.join(", ")}
                    </p>
                </div>

            </div>
        )
    }
}

export default FriendCard;