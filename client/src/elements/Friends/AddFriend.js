import React, {useState, useContext, useEffect} from "react";
import Modal from "../Modal";

import AuthContext from "../../context/AuthProvider";
import apiClient from "../../api/api"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faClipboard } from '@fortawesome/free-solid-svg-icons';

const CODE_REGEX = /^[A-Za-z0-9]{6}$/;

function AddFriend() {
    const {auth, setAuth} = useContext(AuthContext);
    const [isOpen, setOpen] = useState(false);
    const [friendCode, setFriendCode] = useState("");
    const [validFriendCode, setValidFriendCode] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showCopy, setShowCopy] = useState(false);
    const [statusCode, setStatusCode] = useState(null);

    useEffect(() => {
        setValidFriendCode(CODE_REGEX.test(friendCode));
    }, [friendCode])

    const closeModal = () => {
        setOpen(false);
        setShowCopy(false);
    }

    const handleSubmit = async(e) => {
        e.preventDefault();

        await apiClient.post(
            '/api/friends/add',
            {sender: auth.userID, friendCode},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            if (res.data.status === 204) {
                setSubmitted(true);

                setTimeout(() => {
                    closeModal();
                    setFriendCode("");
                    setShowCopy(false);
                }, 600)
            } else {
                setStatusCode(res.data.status);
            }
        }).catch((err) => {console.error(err)});


    }

    return (
        <>
            <button onClick={() => {
                setOpen(true);
                setSubmitted(false);
            }} className="friend-card" style={{color: "var(--subtle-gray)", padding: 0}}>
                <div style={{fontSize: 32, fontWeight: 200, backgroundColor: "transparent"}} className="dotted circle profile-pic large"> + </div>
                <p className="body-large bold"> Add friend </p>
            </button>

            <Modal isOpen={isOpen} closeFunc={closeModal} closing={submitted}>
                {submitted ?
                <div>
                    Invite sent!
                </div>
                :
                <div>
                    <div className="h-between">
                        <h4>Add Friend </h4>
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
                
                    <div style={{marginBottom: 4}}> Give them your invite code. </div>

                    <button 
                        className="h-between"
                        style={{width: "100%", padding: 0, borderRadius: 4, backgroundColor: "var(--input-color)"}}
                        onClick={() => {
                            navigator.clipboard.writeText(auth.userID);
                            setShowCopy(true);
                        }}
                    >
                        <p style={{padding: 8, margin: "0px 8px 0px 4px", color: "#fff"}}> #{auth.userID} </p>
                        {showCopy ? <div style={{color: "var(--subtle-gray)"}}>  Code copied to clipboard! </div> : <></>}
                        <div style={{padding: "8px 12px", borderRadius: "0 4px 4px 0", color: "#fff", backgroundColor: "var(--vibrant-blue)", height: "100%"}}> <FontAwesomeIcon icon={faClipboard} size="xs"/> </div>
                    </button>

                </div>}

            </Modal>
        </>
    )
}

export default AddFriend;