import React, {useEffect, useState, useContext} from "react";
import apiClient from "../../api/api";
import AuthContext from "../../context/AuthProvider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCheck } from '@fortawesome/free-solid-svg-icons';
import ProfilePicture from "../ProfilePicture";

function FriendCard({friendID, status, setUpdateFriends}) {
    const {auth} = useContext(AuthContext);
    const [friendInfo, setFriendInfo] = useState([]);
    
    const [responded, setResponded] = useState(false);

    useEffect(() => {
        apiClient.get(
            `/api/friends/get_user/${friendID}`,
            {headers: {Authorization: `Bearer ${auth?.accessToken}`},
             withCredentials: true}
        ).then((res) => {
            setFriendInfo(res.data.friend);
        }).catch((err) => {console.error(err)})
    }, [friendID]);

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
                (<div className="small card">
                    <h6> {friendInfo.displayName} </h6>
                    <p className="subtle"> {friendInfo.fName + ' ' + friendInfo.lName} </p>

                    <div className="h-between" style={{gap: 12, margin: "8px auto"}}>
                        <button
                            style={{flex: 1, padding: "6px 0px", textAlign: "center", justifyContent: "center", gap: 5, fontSize: "11pt"}}
                            className="vibrant-blue-bg"
                            onClick={() => respond("Accept")}>
                            <FontAwesomeIcon icon={faCheck} size="xs"/> Accept
                        </button>

                        <button
                            style={{flex: 1, padding: "6px 0px", textAlign: "center", justifyContent: "center", fontSize: "11pt"}} 
                            className="subtle-gray-bg"
                            onClick={() => respond("Reject")}>
                            Reject
                        </button>
                    </div>
                </div>)
        )
    } else {
        return (
            <div className="friend-card">
                <ProfilePicture size={"large"}/>
                <div>
                    <p className="body-large bold"> {friendInfo.displayName} </p>
                    <p className="subtle small-label"> <FontAwesomeIcon icon={faUsers} size="xs"/> No mutual groups. </p>
                </div>

            </div>
        )
    }
}

export default FriendCard;