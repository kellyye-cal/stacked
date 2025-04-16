import React, {useContext} from 'react';
import NavBar from '../NavBar';

import AuthContext from '../../context/AuthProvider';
import FriendsPreview from '../Friends/FriendsPreview';
import GroupsPreview from '../Groups/GroupsPreview';

function Home() {
    const {auth, setAuth} = useContext(AuthContext);

    return (
        <div className="page">
            <NavBar userID={auth.userID}/>

            <div className="content">
                <h1> Welcome back, <span className="vibrant-blue"> {auth.displayName}</span>! </h1>

                <GroupsPreview />

                <FriendsPreview />
            </div>
        </div>
    )
};

export default Home;