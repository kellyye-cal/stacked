import React, {useContext, useEffect, useState} from "react";
import AuthContext from "../../context/AuthProvider";
import apiClient from "../../api/api";
import Modal from "../Modal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import Toggle from "../Toggle";

const CODE_REGEX = /^[A-Za-z0-9]{4}$/;

function AddGroup() {
    const {auth} = useContext(AuthContext);
    const [isOpen, setOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedDisplay, setSubmittedDisplay] = useState("");
    const [groupToggle, setGroupToggle] = useState("Join Existing");

    const closeModal = () => {
        setOpen(false);
    }

    const [groupInviteCode, setGroupInviteCode] = useState("");
    const [validInviteCode, setValidInviteCode] = useState(false);
    const [requestErr, setRequestErr] = useState(0);

    useEffect(() => {
        setValidInviteCode(CODE_REGEX.test(groupInviteCode));
    }, [groupInviteCode])

    const handleJoinRequest = (e) => {
        e.preventDefault();
        
        apiClient.post('/api/friends/request_join',
            {userID: auth.userID, groupID: groupInviteCode},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            if (res.data.response === "Success") {
                setSubmittedDisplay("Request sent!")
                setSubmitted(true);

                setTimeout(() => {
                    closeModal();
                    setGroupInviteCode("");
                    setRequestErr("");
                }, 600)
            } else {
                setRequestErr(res.data.response);
            }
        }).catch((err) => {console.error(err)})
    }

    const [newGroupName, setNewGroupName] = useState("");
    const [validGroupName, setValidGroupName] = useState(false);

    useEffect(() => {
        setValidGroupName(newGroupName.length > 0);
    }, [newGroupName])

    const handleCreateRequest = (e) => {
        e.preventDefault();

        apiClient.post('/api/friends/create_group',
            {user: auth.userID, groupName: newGroupName},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            setSubmittedDisplay("Group created!")
            setSubmitted(true);

            setTimeout(() => {
                closeModal();
                setNewGroupName("");
            }, 600)

        
        }).catch((err) => {console.error(err)})
    }

    return (
        <div>
            <button onClick={() => {setOpen(true); setSubmitted(false)}} className="vibrant-blue-bg pill">
                <FontAwesomeIcon icon={faPlus} size="xs" style={{marginRight: 4}} />
                New Group
            </button>

            <Modal isOpen={isOpen} closeFunc={closeModal} closing={submitted}>
                {submitted ?
                <div>
                    {submittedDisplay}
                </div>
                :
                <div>
                    <div className="h-between" style={{marginBottom: 8}}>
                        <h4> Add Group </h4>
                        <button onClick={closeModal} style={{color: "#fff", padding: 0}}> <FontAwesomeIcon icon={faTimes} /> </button>
                    </div>

                    <Toggle optionA={"Join Existing"} optionB={"Create New"} setSelected={setGroupToggle}/>

                    {groupToggle === "Join Existing" ?
                        <form style={{width: "100%", marginTop: 12}} onSubmit={handleJoinRequest}>
                            <div>
                                <label for="code"> Enter group invite code </label>
                                <div style={{position: "relative", marginTop: 4}}>
                                    <input
                                        style={{width: "calc(100% - 20px)"}}
                                        type="text"
                                        id="code"
                                        onChange={(e) => {
                                            setGroupInviteCode(e.target.value.toUpperCase().replace(/[^A-Za-z0-9]/g, ''));
                                            setRequestErr("")
                                        }}
                                        value={groupInviteCode}
                                        required
                                        placeholder={"AB12"}
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
                                        disabled={!validInviteCode}
                                    > 
                                        Send Request 
                                    </button>
                                </div>
                                {requestErr ? <p className="small-label red-text"> {requestErr} </p> : <></>}
                            </div>


                        </form>

                        :

                        <form style={{width: "100%", marginTop: 12}} onSubmit={handleCreateRequest}>
                            <div>
                                <label for="name"> New Group Name </label>
                                <input
                                    style={{width: "calc(100% - 20px)", marginTop: 4}}
                                    type="text"
                                    id="name"
                                    onChange={(e) => {
                                        setNewGroupName(e.target.value);
                                    }}
                                    value={newGroupName}
                                    required
                                    placeholder={"Start typing..."}
                                />

                                <button 
                                        className="vibrant-blue-bg"
                                        style={{color: "#fff",
                                            borderRadius: 4,
                                            padding: "4px 12px",
                                            margin: "12px auto 0px auto"
                                        }}
                                        disabled={!validGroupName}
                                    > 
                                        Create New Group
                                </button>
                            </div>
                        </form>
                    }
                </div>}

            </Modal>
        </div>

    )
};

export default AddGroup;