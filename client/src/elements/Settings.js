import React, { useState, useCallback, useContext } from "react";
import { useDropzone } from 'react-dropzone';
import apiClient from "../api/api";
import AuthContext from "../context/AuthProvider";

import NavBar from "./NavBar";
import ProfilePicture from "./ProfilePicture";
import Modal from "./Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from '@fortawesome/free-solid-svg-icons';


function Settings() {
    const {auth, setAuth} = useContext(AuthContext);
    const [editingProfilePic, setEditingProfilePic] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setSelectedFile(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
          'image/*': [],
        },
        maxFiles: 1,
      });
    
      const handleUpload = async () => {
        if (!selectedFile) return;
        setPreview(URL.createObjectURL(selectedFile));
    };

    const saveProfilePic = async() => {
        const formData = new FormData();
        if (!selectedFile) return;
        formData.append('image', selectedFile);
        formData.append('userID', auth.userID);
        stopEditProfilePic();

        await apiClient.post('/api/auth/upload_profile',
            formData,
            {
            headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${auth.accessToken}`,
            },
            withCredentials: true,
        }).then((res) => {
            sessionStorage.setItem('profilePic', res.data.url);
            setAuth((prev) => ({ ...prev, profilePic: res.data.url}));
        }).catch((err) => {
            console.error('Upload error:', err);
        })
    }

    const handleEditProfilePic = async() => {
        setEditingProfilePic(true);
    }

    const stopEditProfilePic = async() => {
        setEditingProfilePic(false);
        setSelectedFile(null);
        setPreview(null);
    }
    

    return (
        <div className="page">
            <NavBar />

            <div className="content">
                <h1> Settings </h1>

                <div>
                    <h2> Profile Picture </h2>

                    {editingProfilePic?
                        (<Modal isOpen={editingProfilePic} closeFunc={stopEditProfilePic}>
                            <div className="h-between" style={{marginBottom: 12}}>
                                <h3> Edit profile picture</h3>
                                <button> <FontAwesomeIcon icon={faTimes} /> </button>
                            </div>
                            
                            {!preview ?
                            (<>
                                <div
                                {...getRootProps()}
                                style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                border: '2px dashed var(--subtle-gray)',
                                padding: 20,
                                textAlign: 'center',
                                cursor: 'pointer',
                                height: 40,
                                borderRadius: '8px',
                                background: isDragActive ? 'var(--subtle-gray)' : 'var(--container-color)',
                                }}>
                                    <input {...getInputProps()} />
                                    {isDragActive ? (
                                    <p>Drop the image here ...</p>
                                    ) : (!isDragActive && !selectedFile) ? (
                                    <div>
                                        <p>Drag & drop, or click to upload</p>
                                        <p className="small-label subtle"> Accepted file types: JPG, JPEG, PNG</p>
                                    </div>
                                    ) : (
                                        <div>
                                            <p className="bold"> Uploaded: <span className="vibrant-blue"> {selectedFile.name} </span></p>
                                            <p>Drag & drop, or click to replace</p>
                                            <p className="small-label subtle"> Accepted file types: JPG, JPEG, PNG</p>
                                        </div>
                                    )}
                            </div>
                            <div className="h-between" style={{ marginTop: 16 }}>
                                <button className="subtle" onClick={stopEditProfilePic}> Cancel </button>

                                <button
                                    className="square vibrant-blue-bg"
                                    onClick={handleUpload}
                                    disabled={!selectedFile}
                                >
                                    Next
                                </button>
                            </div>
                             </>) : (
                            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover' }}
                                />

                                <div className="h-between" style={{marginTop: 16, width: "100%"}}>
                                    <button 
                                        onClick={() => {setPreview("")}}>
                                             Back 
                                    </button>

                                    <button className="square vibrant-blue-bg" onClick={saveProfilePic}> Save Changes </button>
                                </div>
                            </div>)}

                        </Modal>) : (
                            <></>)}
                <div
                style={{
                    position: 'relative',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    cursor: 'pointer'
                }}
                onClick={handleEditProfilePic}
                >
        
                <div
                    className="profile-overlay"
                >
                    Change
                </div>

                <ProfilePicture url={auth.profilePic} size="xl" />
                </div>
                            
                    </div>
                </div>
            </div>
    )
}

export default Settings;