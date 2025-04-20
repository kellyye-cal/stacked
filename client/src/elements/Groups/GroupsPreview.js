import React, {useContext, useEffect, useState} from "react";
import Group from "./Group";
import AddGroup from "./AddGroup";

import AuthContext from "../../context/AuthProvider";
import apiClient from "../../api/api";
import ProfilePicture from "../ProfilePicture";
import RequestCard from "../RequestCard";

function GroupsPreview() {
    const {auth} = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [invites, setInvites] = useState([]);
    const [responseErr, setResponseErr] = useState("");

    const fetchGroups = () => {
        apiClient.get(`/api/friends/my_groups/${auth.userID}`,
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            setGroups(res.data.groups);
        }).catch((err) => console.error(err));

        apiClient.get(`/api/friends/my_group_invites/${auth.userID}`,
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            setInvites(res.data.invites);
        }).catch((err) => {console.error(err)})
    }

    useEffect(() => {
        fetchGroups();
    }, [auth.userID, auth.accessToken]);

    const respondToGroupInvite = async(response, groupID) => {
        apiClient.post('/api/friends/respond_group',
            {userID: auth.userID, groupID, response},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            if (res.data.response === "Success") {
                fetchGroups();
            } else {
                setResponseErr(res.data.response)
            }
        }).catch((err) => console.error(err))
    }

    return (
        <div style={{margin: "8px 0px 20px 0px"}}>
            <div className="h-between">
                <h2> Your Groups</h2>
                <AddGroup />
            </div>

            {groups.length === 0 && (
                <p className="body-large">No groups yet, <span className="vibrant-blue medium-font">add or create one!</span></p>
            )}
            
            <div>
                {groups.map((group, index) => (
                    <Group key={index} display={"Card"} data={group}/>
                ))}
            </div>

            {invites.length > 0 ?
                <div>
                    <h3> Pending Invites </h3>
                    <p className="red-text small-label"> {responseErr} </p>
                    <div>
                        {invites.map((invite) => (
                            <RequestCard 
                                buttonOneFunc={() => {respondToGroupInvite("Accept", invite.groupID)}}
                                buttonTwoFunc={() => {respondToGroupInvite("Reject", invite.groupID)}}>
                                <div className="small-label subtle" style={{display: "inline-flex", alignItems: "center", gap: 4}}>        
                                        <ProfilePicture url={invite.invitedByPic} size="small" />
                                        <span> {invite.invitedBy} </span>
                                        <span> invited you to join  </span>
                                </div>
                                <h6> {invite.name} </h6>
                            </RequestCard>
    
                        ))}
                    </div>
                </div>
                : <></>}
        </div>
    )
}

export default GroupsPreview;