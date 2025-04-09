import React, {useContext, useEffect, useState} from 'react';
import AuthContext from '../../context/AuthProvider';
import apiClient from '../../api/api';

import FriendCard from './FriendCard';
import AddFriend from './AddFriend';

function FriendsPreview() {
    const {auth, setAuth} = useContext(AuthContext);
    const [friends, setFriends] = useState([]);
    const [pending, setPending] = useState([]);
    const [updateFriends, setUpdateFriends] = useState(false);

    useEffect(() => {
        apiClient.get(
            `/api/friends/get_friends/${auth.userID}`,
            {params: {limit: 5},
             headers: {Authorization: `Bearer ${auth?.accessToken}`},
             withCredentials: true}
        ).then((res) => {
            const pendingList = [];
            const friendsList = [];

            for (let i = 0; i < res.data.length; i++) {
                if (res.data[i].status === 'Pending' && res.data[i].userB === auth.userID) {
                    pendingList.push(res.data[i].userA)
                } else if (res.data[i].status === "Accepted") {
                    if (res.data[i].userA === auth.userID) {
                        friendsList.push(res.data[i].userB)
                    } else {
                        friendsList.push(res.data[i].userA)
                    }
                }
            }

            setPending(pendingList);
            setFriends(friendsList);

        }).catch((err) => {
            console.error(err);
        })
    }, [updateFriends])

    return (
        <div>
            <h2> Friends </h2>

            {pending.length > 0 ?
                <div>
                    <h3 style={{marginBottom: 4}}> Pending Requests </h3>
                    <div>
                        {pending.map((friendID) => (
                            <FriendCard friendID={friendID} status={"Pending"} setUpdateFriends={setUpdateFriends}/>
                        ))}
                    </div>
                </div>
            : <></>}
                    
            <div style={{display: "flex", gap: 24}}>
                <AddFriend />
                {friends.map((friendID) => (
                    <FriendCard friendID={friendID} status={"Accepted"} />
                ))}
            </div>
        </div>
    )
};

export default FriendsPreview;