import React, {useEffect, useContext, useState} from "react";
import { Link, useParams } from "react-router-dom";
import NavBar from "../NavBar";
import MemberCard from "./MemberCard";

import apiClient from "../../api/api";
import AuthContext from "../../context/AuthProvider";
import InviteMember from "./InviteMember";
import ProfilePicture from "../ProfilePicture";
import RequestCard from "../RequestCard";

function Group({display, data}) {
    const {auth} = useContext(AuthContext);
    const {groupID} = useParams();

    const [groupData, setGroupData] = useState([]);
    const [members, setMembers] = useState([]);

    const [showPending, setShowPending] = useState(false);

    const [requests, setRequests] = useState([]);

    const fetchGroupData = async () => {
        apiClient.get(`/api/friends/get_group_by_id/${groupID}`,
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            setGroupData(res.data.groupData);
            setMembers(res.data.members);

            let req = []

            res.data.members.forEach(member => {
                if (member.role === "Requested") {
                    req.push(member)
                }
            })

            setRequests(req);
        }).catch((err) => {console.error(err)})
    }

    useEffect(() => {
        fetchGroupData();
    }, [groupID, auth.accessToken]);

    const [responseErr, setResponseErr] = useState("")

    const handleRequest = (response, userID) => {
        apiClient.post('/api/friends/respond_join',
            {groupID, userID, memberID: auth.userID, response},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            if (res.data.response === "Success") {
                fetchGroupData();
                setResponseErr("");
            } else {
                setResponseErr(res.data.response);
            }
        }).catch((err) => {console.error(err)});
    }

    if (display === "Card") {
        return (
            <Link className="group card container-shadow" to={`/groups/${data.groupID}`}>
                <h4> {data.name} </h4>

                <div className="group-card-members">
                    {data.members.map((member) => (
                        (member.role === "Member" ? 
                            <ProfilePicture size="small" url={member.profilePic} key={member.userID}/>
                            : <></>)
                    ))}
                </div>
                
                <div style={{display: "flex", gap: 8}}>
                    <p> Ranked #7/8 </p>
                    <p> | </p>
                    <p> -%50.42 </p>
                </div>
            </Link>
        )
    } else if (display === "Page") {
        return (
            <div className="page">
                <NavBar />

                <div className="content">
                    <div className="h-between">
                        <h1> {groupData.name} </h1>
                        <h6 className="subtle"> #{groupData.groupID} </h6>
                    </div>

                    {requests.length > 0 && (<div>
                        <h2> Join Requests </h2>
                        <p className="red-text small-label"> {responseErr} </p>
                        {requests.map((req) => (
                            <RequestCard key={req.userID}
                                buttonOneFunc={() => {handleRequest("Accept", req.userID)}}
                                buttonTwoFunc={() => {handleRequest("Reject", req.userID)}}>
                                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                    <ProfilePicture url={req.profilePic} size="small" />
                                    <h6> {req.displayName} </h6>
                                </div>
                                <p className="small-label subtle"> #{req.userID} </p>
                            </RequestCard>
                        ))}
                    </div>)}

                    <div>
                        <div className="h-between">
                            <h2> Members </h2>
                            <button className="subtle" onClick={() => {setShowPending(!showPending)}}> 
                                {showPending ? "Hide Pending" : "Show Pending"}
                            </button>
                        </div>
                        <div style={{display: "flex", gap: 4}}>
                            <InviteMember groupID={groupID}/>
                            {members.map((member, id) => (
                                (member.role === "Invited" && showPending ? 
                                    <MemberCard pending={true} member={member} key={id} />

                                    : member.role === "Member" ?
                                    <MemberCard pending={false} member={member} key={id} />
                                    : <></>
                                )
                            
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2> Leaderboard </h2>
                    </div>

                    <div>
                        <h2> Games </h2>
                    </div>
                </div>

            </div>
        )
    }
};

export default Group;