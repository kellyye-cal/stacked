import React, {useState, useEffect, useContext} from "react";
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

import Modal from "../Modal";
import apiClient from "../../api/api";
import ChipAmounts from "./ChipAmounts";
import AuthContext from "../../context/AuthProvider";
import ProfilePicture from "../ProfilePicture";
import Spinner from "../Spinner";

const DOLLAR_REGEX = /^\d*\.?\d{0,2}$/;

function formatTimestamp(ts) {
    const date = new Date(ts);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
  
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  
    return `${mm}/${dd}/${yy} ${hours}:${minutes} ${ampm}`;
  }

function CreateGame({groupID}) {
    const navigate = useNavigate();
    const {auth} = useContext(AuthContext)
    const [isOpen, setIsOpen] = useState(false);
    const [page, setPage] = useState(1);

    const [placeholderName, setPlaceholderName] = useState("New Game " + formatTimestamp(Date.now()))
    const [gameName, setGameName] = useState("");
    const [buyIn, setBuyIn] = useState("");
    const [validBuyIn, setValidBuyIn] = useState("");
    const [chips, setChips] = useState(new Map());
    const [validAmounts, setValidAmounts] = useState(false);
    const [allMembers, setAllMembers] = useState([]);
    const [invited, setInvited] = useState([]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        apiClient.get(`api/friends/get_group_by_id/${groupID}`,
            {headers: {Authorization: `Bearer ${auth?.accessToken}`},
             withCredentials: true}
        ).then((res) => {
            setAllMembers(res.data.members);
        }).catch((err) => console.error(err))
    }, [auth.accessToken, groupID])

    const closeModal = () => {
        setIsOpen(false);
    }
    const openModal = () => {
        setIsOpen(true);
    }

    useEffect(() => {
        setValidBuyIn(DOLLAR_REGEX.test(buyIn))
    }, [buyIn])    

    const invitePlayer = (member) => {
        setAllMembers(prev => prev.filter(m => m.userID !== member.userID));

        setInvited(prev => [...prev, member]);
    }

    const uninvitePlayer = member => {
        setInvited(prev => prev.filter(m => m.userID !== member.userID));

        setAllMembers(prev => [...prev, member]);
    }

    const handleCreateGame = (e) => {
        e.preventDefault();
        setCreating(true);

        let buyinPrice = buyIn || "0.00"
        let chipsObj = Object.fromEntries(chips)

        apiClient.post('/api/games/create',
            {groupID, buyinPrice, chips: chipsObj, sessionName: gameName || placeholderName, invited, userID: auth.userID},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            if (res.status === 200) {
                setTimeout(() => {
                    const {gameID} = res.data
                    navigate(`/groups/${groupID}/game/${gameID}`);
                }, 1000)
            }
        }).catch((err) => {console.error(err)})
    }

    return (
        <div>
            <button className="game card dotted" onClick={openModal}>
                <h2> <FontAwesomeIcon icon={faPlus} size="sm" style={{marginRight: 4}}/> New Game </h2>
            </button>

            <Modal isOpen={isOpen} closeFunc={closeModal}>
                <div>
                    <div className="h-between">
                        <h3> Start New Game </h3>
                        <button onClick={closeModal}> <FontAwesomeIcon icon={faTimes} /> </button>
                    </div>

                    {page === 1 ? 
        
                        <div style={{width: "100%"}}>
                            <div style={{display: "flex", gap: 12}}>
                                <div className="flex-column" style={{flexGrow: 1}}>
                                    <label for="name" style={{marginBottom: 4}}> Session Name </label>
                                    <input
                                        type="text"
                                        id="name"
                                        onChange={(e) => {
                                            setGameName(e.target.value);
                                        }}
                                        value={gameName}
                                        placeholder={placeholderName}
                                    />
                                </div>

                                <div className="flex-column" style={{width: 100}}>
                                    <label for="buyin" style={{marginBottom: 4}}> Buy in </label>
                                    <div style={{position: "relative"}}>
                                        <input
                                            type="text"
                                            id="buyin"
                                            onChange={(e) => {
                                                setBuyIn(e.target.value);
                                            }}
                                            value={buyIn}
                                            placeholder={"0.00"}
                                            style={{paddingLeft: 40, boxSizing: "border-box", width: "100%"}}
                                        />
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "50%",
                                                left: 0,
                                                transform: "translateY(-50%)",
                                                backgroundColor: "var(--subtle-gray)",
                                                height: "100%",
                                                padding: "0px 10px",
                                                display: "flex",
                                                alignItems: "center",
                                                borderRadius: "4px 0px 0px 4px"
                                            }}> 
                                            $
                                        </div>
        
                                    </div>
    
                                    {validBuyIn ? <></> : <p className="small-label red-text">Please enter a valid dollar amount. </p>}
                                </div>
                            </div>

                            <div style={{marginTop: 12}}>
                                    <ChipAmounts
                                        chips={chips} setChips={setChips}
                                        validAmounts={validAmounts}
                                        setValidAmounts={setValidAmounts}/>
                            </div>
                            
                            <div style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                marginTop: 16
                            }}>
                                <button
                                    onClick={() => {setPage(2)}}
                                    className="square vibrant-blue-bg">
                                    Next
                                </button>
                            </div>
    
                        </div>
                    :   page === 2 && !creating ? <div>
                            <div>
                                {allMembers.length > 0 ?
                                <div>
                                    <label> Invite Players </label>
                                    <div className="hide-scrollbar"
                                        style={{display: "flex", width: "100%", overflowX: "scroll", gap: 8, marginTop: 4}}>
                                        {allMembers.map((member) => (
                                            <div className="flex-column" style={{alignItems: "center"}}>
                                                <div key={member.userID} style={{position: "relative", height: 60, width: 60}}>
                                                    <ProfilePicture size="large" url={member.profilePic}/>
                                                    <button
                                                        className="hover-display"
                                                        type="button"
                                                        onClick={() => {invitePlayer(member)}}
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
                                        ))}
                                    </div>
                                </div>
                                : <></>}
                            </div>

                            {invited.length > 0 ? 
                                <div style={{marginTop: 8}}>
                                    <label> Invited Players </label>
                                    {invited.map((member) => (
                                        <div className="h-between" style={{margin: "4px 0"}}>
                                            <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                                <ProfilePicture size="med" url={member.profilePic} />
                                                <p> {member.displayName} </p>
                                            </div>

                                            <button 
                                                type="button"
                                                className="red-text"
                                                onClick={() => uninvitePlayer(member)}
                                                >
                                                <FontAwesomeIcon icon={faTimes} size="xs"/>
                                            </button>
                                        </div>
                                    ))}
                                </div> 
                                : <></>
                            }

                            <div 
                                className="h-between"
                                style={{
                                    width: "100%",
                                    marginTop: 16
                                }}>
                                <button
                                    type="button"
                                    className="subtle"
                                    onClick={() => {setPage(1)}}>
                                    Back
                                </button>

                                <button
                                    onClick={handleCreateGame}
                                    disabled={!invited.length > 0}
                                    className="square vibrant-blue-bg">
                                    Create Game
                                </button>
                            </div>
                        </div>
                        : creating ?
                        <div className="flex-column" style={{alignItems: "center", color: "var(--vibrant-blue)"}} >
                            <Spinner />
                            <h6> Creating Game... </h6>
                        </div>
                        :
                        <></>}
                </div>
            </Modal>
        </div>
    )
}

export default CreateGame;