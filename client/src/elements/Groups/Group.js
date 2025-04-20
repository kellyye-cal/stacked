import React, {useEffect, useContext, useState} from "react";
import { Link, useParams } from "react-router-dom";
import NavBar from "../NavBar";
import MemberCard from "./MemberCard";

import apiClient from "../../api/api";
import AuthContext from "../../context/AuthProvider";
import InviteMember from "./InviteMember";
import ProfilePicture from "../ProfilePicture";
import RequestCard from "../RequestCard";
import CreateGame from "../Games/CreateGame";
import GameCard from "../Games/GameCard";
import Leaderboard from "../Friends/Leaderboard";
import { formatCurrency } from "../../utils";

function Group({display, data}) {
    const {auth} = useContext(AuthContext);
    const {groupID} = useParams();

    const [groupData, setGroupData] = useState([]);
    const [members, setMembers] = useState([]);
    const [games, setGames] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([])

    const [showPending, setShowPending] = useState(false);

    const [requests, setRequests] = useState([]);

    const [rank, setRank] = useState(0);
    const [netEarnings, setMyNetEarnings] = useState(0);

    const fetchGroupData = async () => {
        apiClient.get(`/api/friends/get_group_by_id/${groupID}`,
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            setGroupData(res.data.groupData);
            setMembers(res.data.members);
            setGames(res.data.games)

            let req = []

            res.data.members.forEach(member => {
                if (member.role === "Requested") {
                    req.push(member)
                }
            })

            setRequests(req);
        }).catch((err) => {console.error(err)})
    
        apiClient.get(`/api/friends/get_leaderboard/${groupID}`,
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            setLeaderboardData(Object.values(res.data).sort((a, b) => b.netEarnings - a.netEarnings));
        }).catch((err) => {console.error(err)})
    }

    useEffect(() => {
        fetchGroupData();

        if (data?.groupID) {
            apiClient.post('/api/friends/my_rank',
                {groupID: data.groupID, userID: auth.userID},
                {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
            ).then((res) => {
                setMyNetEarnings(res.data.netEarnings);
                setRank(res.data.rank);
            }).catch((err) => {console.error(err)})
        }
    }, [groupID, auth.accessToken, data?.groupID]);


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
                
                <div className="medium-font" style={{display: "flex", gap: 8}}>
                    <p> Ranked #{rank}<span className="subtle">/{data.members.length}</span></p>
                    <p> | </p>
                    <p className={`${netEarnings <= 0 ? "red-text" : "green-text"}`}> {formatCurrency(netEarnings)} </p>
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
                            {members
                                .map((member) => ({
                                    ...member,
                                    rank: leaderboardData.findIndex(player => player.userID === member.userID) + 1
                                }))
                                .sort((a, b) => a.rank - b.rank)
                                .map((member, id) => (
                                    member.role === "Invited" && showPending ? 
                                        <MemberCard pending={true} member={member} key={id} />
                                    : member.role === "Member" ?
                                        <MemberCard 
                                            pending={false} 
                                            member={member} 
                                            key={id} 
                                            rank={member.rank}/>
                                    : <></>
                                ))
                            }
                        </div>
                    </div>

                    <div>
                        <h2> Leaderboard </h2>
                        <Leaderboard data={leaderboardData}/>
                    </div>

                    <div>
                        <h2> Games </h2>
                        <div style={{display: "grid", 
                                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                                    columnGap: "min(20px, 8px)",
                                    rowGap: "12px",
                                    width: "100%"}}>
                            <CreateGame groupID={groupID}/>
                            {games.map((game) => (
                                <GameCard game={game} />
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        )
    }
};

export default Group;