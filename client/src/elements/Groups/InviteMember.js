import React, {useState, useEffect, useContext} from "react";
import Modal from "../Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faClipboard } from '@fortawesome/free-solid-svg-icons';
import AuthContext from "../../context/AuthProvider";
import apiClient from "../../api/api";

const CODE_REGEX = /^[A-Za-z0-9]{6}$/;

function InviteMember({groupID}) {
    const {auth} = useContext(AuthContext);
    const [inviting, setInviting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [friendCode, setFriendCode] = useState("");
    const [statusCode, setStatusCode] = useState("");
    const [validFriendCode, setValidFriendCode] = useState("");
    const [showCopy, setShowCopy] = useState(false);

    const closeModal = () => {setInviting(false)}

    const handleSubmit = (e) => {
        e.preventDefault();

        apiClient.post('/api/friends/invite_to_group',
            {groupID, invitingUser: auth.userID, invitedUser: friendCode},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            console.log(res.data.status)
            if (res.data.status === 204) {
                setSubmitted(true);

                setTimeout(() => {
                    closeModal();
                    setFriendCode("");
                    setInviting(false);
                    setShowCopy(false);
                }, 600)
            } else {
                setStatusCode(res.data.status);
            }
        }).catch((err) => {console.error(err)})
    }

    useEffect(() => {
        setValidFriendCode(CODE_REGEX.test(friendCode));
    }, [friendCode])

    return (
        <>
            <button onClick={() => {
                setInviting(true);
            }} className="friend-card" style={{color: "var(--subtle-gray)", padding: 0}}>
                <div style={{fontSize: 32, fontWeight: 200, backgroundColor: "transparent"}} className="dotted circle profile-pic large"> + </div>
                <p className="body-large bold"> Invite </p>
            </button>

            <Modal isOpen={inviting} closeFunc={closeModal} closing={submitted}>
                {submitted ?
                    <div>
                        Invite sent!
                    </div>
                    :
                    <div>
                        <div className="h-between">
                            <h4> Invite new member </h4>
                            <button onClick={closeModal} style={{color: "#fff", padding: 0}}> <FontAwesomeIcon icon={faTimes} /> </button>
                        </div>
    
                        <form style={{width: "100%"}} onSubmit={handleSubmit}>
                            <div style={{margin: "12px 0px"}}>
                                <label for="code" style={{marginBottom: 4}}> Enter your friend's invite code </label>
                                
                                <div style={{position: "relative", marginTop: 4}}>
                                    <input
                                        style={{width: "calc(100% - 20px)"}}
                                        type="text"
                                        id="code"
                                        onChange={(e) => {
                                            setFriendCode(e.target.value.toUpperCase().replace(/[^A-Za-z0-9]/g, ''));
                                            setStatusCode(null);
                                        }}
                                        value={friendCode}
                                        required
                                        placeholder={auth.userID}
                                    />
    
                                    <button 
                                        className="vibrant-blue-bg"
                                        style={{position: "absolute",
                                            right: "8px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#fff",
                                            fontSize: "11pt",
                                            borderRadius: 4
                                        }}
                                        disabled={!validFriendCode}
                                    > 
                                        Send Invite 
                                    </button>
                                </div>
    
                                {statusCode === 404 ? <p className="red-text small-text" style={{marginTop: 4}}> No user found with that code. </p> : <></>}
                                {statusCode === 422 ? <p className="red-text small-text" style={{marginTop: 4}}> You've already sent them a friend request. </p> : <></>}
                            </div>
                        </form>
    
                        <div style={{display:"flex", alignItems: "center", textAlign: "center", gap: 20, margin: "20px 100px"}}>
                            <hr style={{height: 1, flex: 1, border: "none", backgroundColor: "#fff"}}/>
                            <p> OR </p>
                            <hr style={{height: 1, flex: 1, border: "none", backgroundColor: "#fff"}}/>
                        </div>
                    
                        <div style={{marginBottom: 4}}> Ask them to add your group code. </div>
    
                        <button 
                            className="h-between"
                            style={{width: "100%", padding: 0, borderRadius: 4, backgroundColor: "var(--input-color)"}}
                            onClick={() => {
                                navigator.clipboard.writeText(auth.userID);
                                setShowCopy(true);
                            }}
                        >
                            <p style={{padding: 8, margin: "0px 8px 0px 4px", color: "#fff"}}> #{groupID} </p>
                            {showCopy ? <div style={{color: "var(--subtle-gray)"}}>  Code copied to clipboard! </div> : <></>}
                            <div style={{padding: "8px 12px", borderRadius: "0 4px 4px 0", color: "#fff", backgroundColor: "var(--vibrant-blue)", height: "100%"}}> <FontAwesomeIcon icon={faClipboard} size="xs"/> </div>
                        </button>
    
                    </div>}
            </Modal>
        </>
    )
}

export default InviteMember;