import React, {useEffect, useContext, useState} from "react";
import { Link, useParams } from "react-router-dom";
import NavBar from "../NavBar";
import MemberCard from "./MemberCard";

import apiClient from "../../api/api";
import AuthContext from "../../context/AuthProvider";

function Group({display, data}) {
    const {auth} = useContext(AuthContext);
    const {groupID} = useParams();

    const [groupData, setGroupData] = useState([]);
    const [members, setMembers] = useState([]);


    useEffect(() => {
        apiClient.get(`/api/friends/get_group_by_id/${groupID}`,
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            setGroupData(res.data.groupData)
            setMembers(res.data.members)
            console.log(res.data.members)
        }).catch((err) => {console.error(err)})
    }, [groupID, auth.accessToken]);

    if (display === "Card") {
        return (
            <Link className="group card container-shadow" to={`/groups/${data.groupID}`}>
                <h4> {data.name} </h4>
                
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

                    <div>
                        <h2> Members </h2>
                        <div style={{display: "flex", gap: 24}}>
                            {members.map((member, id) => (
                                <MemberCard member={member} index={id} />
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