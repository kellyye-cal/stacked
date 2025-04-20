import React, { useContext, useEffect, useState } from "react";
import apiClient from "../../api/api";
import Modal from "../Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import ProfilePicture from "../ProfilePicture";
import AuthContext from "../../context/AuthProvider";

function GameSettings({isOpen, setOpen, groupID, gameID, players, name, fetchGameData}) {
    const {auth} = useContext(AuthContext);
    const closeFunc = () => {setOpen(false)};
    const [changesMade, setChangesMade] = useState(false);

    const [newGameName, setNewGameName] = useState(name);
    const [newPlayers, setNewPlayers] = useState(players);

    const [allGroupMembers, setAllGroupMembers] = useState([]);

    useEffect(() => {
        setNewGameName(name);
        setNewPlayers(players);
    }, [name, players])

    useEffect(() => {
        apiClient.get(`/api/friends/get_group_by_id/${groupID}`,
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            setAllGroupMembers(res.data.members);
        }).catch((err) => console.error(err))
    })

    const resetChanges = () => {
        setNewGameName(name);
        setNewPlayers(players);
        setChangesMade(false);
    }

    const handleRemovePlayer = (userID) => {
        setNewPlayers((prev) => {
            const updated = {...prev};
            delete updated[userID];
            return updated;
          });

        setChangesMade(true);
    }
    
    const saveChanges = () => {
        apiClient.post('/api/games/updateSettings',
            {gameID, groupID, newGameName, newPlayers, userID: auth.userID},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            if (res.status === 204) {
                resetChanges();
                closeFunc();
                fetchGameData();
            }
        }).catch((err) => console.error(err));

    }

    const invitePlayer = (userID, info) => {
        setNewPlayers((prev) => {
            const updated = {...prev};
            updated[userID] = {
                profilePic: info.profilePic,
                displayName: info.displayName,
            };
            return updated;
          });

        setChangesMade(true);
    }

    return (
        <Modal isOpen={isOpen} closeFunc={closeFunc}>
            <div className="h-between">
                <h3> Game Settings </h3>
                <button onClick={closeFunc}>
                    <FontAwesomeIcon icon={faTimes}/>
                </button>
            </div> 
                
            <div className="flex-column game settings" style={{gap: 16}}>
                <div className="flex-column">
                    <label for="name" style={{marginBottom: 4}}> Session Name </label>
                    <input
                        type="text"
                        id="name"
                        onChange={(e) => {
                            setNewGameName(e.target.value);
                            setChangesMade(true);
                        }}
                        value={newGameName}
                        placeholder={name}
                    />
                </div>

                <div className="flex-column">
                    <label style={{marginBottom: 4}}> Players </label>
                    <div className="flex-column" style={{gap: 8}}>
                        {Object.entries(newPlayers).map(([userID, info]) => (
                            <div className="h-between" key={userID}>
                                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                    <ProfilePicture url={info.profilePic} size="med"/>
                                    <p> {info.displayName} </p>
                                </div>

                                <button
                                    className="red-text"
                                    onClick={() => handleRemovePlayer(userID)}>
                                    <FontAwesomeIcon icon={faTimes} size="xs"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-column">
                    <label style={{marginBottom: 4}}> Invite Players </label>
                    <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                    {Object.entries(allGroupMembers).map(([index, member]) => {
                        return !(member.userID in newPlayers) ? (
                            <div key={member.userID}>
                                <div className="flex-column" style={{alignItems: "center"}}>
                                    <div style={{position: "relative", height: 60, width: 60}}>
                                        <ProfilePicture size="large" url={member.profilePic}/>
                                        <button
                                            className="hover-display"
                                            type="button"
                                            onClick={() => {invitePlayer(member.userID, member)}}
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                left: "50%",
                                                top: "50%",
                                                transform: "translateX(-50%) translateY(-50%)",
                                                padding: 0,
                                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                                width: "60px",
                                                height: "60px",
                                                borderRadius: "50%",
                                                display: "flex",
                                                justifyContent: "center",
                                                fontSize: 12,
                                            }}>
                                            Add
                                        </button>
                                    </div>

                                    <p className="small-label"> {member.displayName} </p>
                                </div>
                            </div>
                        ) : null;
                    })}
                    </div>
                </div>

                <div className="h-between">
                    <button className="subtle" onClick={resetChanges}> Reset </button>
                    <button 
                        className="square vibrant-blue-bg" 
                        onClick={saveChanges}
                        disabled={!changesMade}>  
                        Save Changes </button>
                </div>

            </div>
        </Modal>
    )
}

export default GameSettings;