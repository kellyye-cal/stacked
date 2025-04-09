import React, {useContext} from 'react';
import NavBar from '../NavBar';

import AuthContext from '../../context/AuthProvider';
import GroupCard from '../Auth/Groups/Group';
import Group from '../Auth/Groups/Group';
import FriendsPreview from '../Friends/FriendsPreview';

function Home() {
    const {auth, setAuth} = useContext(AuthContext);

    return (
        <div className="page">
            <NavBar userID={auth.userID}/>

            <div className="content">
                <h1> Welcome back, <span className="vibrant-blue"> {auth.displayName}</span>! </h1>

                <div>
                    <h2> Your Groups</h2>
                    <div>
                        <Group display={"Card"} />
                    </div>
                </div>

                <FriendsPreview />
            </div>
        </div>
    )
};

export default Home;