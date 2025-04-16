import React, {useContext, useEffect, useState} from "react";
import Group from "./Group";
import AddGroup from "./AddGroup";

import AuthContext from "../../context/AuthProvider";
import apiClient from "../../api/api";

function GroupsPreview() {
    const {auth} = useContext(AuthContext);
    const [groups, setGroups] = useState([])

    useEffect(() => {
        apiClient.get(`/api/friends/my_groups/${auth.userID}`,
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            setGroups(res.data.groups);
        }).catch((err) => console.error(err))
    }, [auth.userID, auth.accessToken])

    return (
        <div>
            <div className="h-between">
                <h2> Your Groups</h2>
                <AddGroup />
            </div>
            <div>
                {groups.map((group, index) => (
                    <Group key={index} display={"Card"} data={group}/>
                ))}
            </div>
        </div>
    )
}

export default GroupsPreview;