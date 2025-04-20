import React, { useContext, useEffect, useState } from "react";
import apiClient from "../../api/api";
import AuthContext from "../../context/AuthProvider";
import ProfilePicture from "../ProfilePicture";
import { Link } from "react-router-dom";
import {getNetEarningsRank, formatCurrency} from "../../utils";

function GameCard({game}) {
    const {auth} = useContext(AuthContext);
    const [players, setPlayers] = useState({});
    const [myRank, setMyRank] = useState([]);
    const [rankedEarnings, setRankedEarnings] = useState([]);

    useEffect(() => {
        apiClient.post(`api/games/get_player_pics`,
            {gameID: game.gameID, groupID: game.groupID},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            setPlayers(res.data.playerPics)
        }).catch((err) => console.error(err));

        const {rank, sortedEarnings} = getNetEarningsRank({earnings: game.earnings, investments: game.investment, userID: auth.userID})
        setMyRank(rank);
        setRankedEarnings(sortedEarnings);
    }, [game.gameID, game.groupID, auth?.accessToken, auth.userID, game.earnings, game.investment]);
    
    return (
        <Link className="game card container container-shadow flex-column"
                style={{gap: 4}}
                to={`/groups/${game.groupID}/game/${game.gameID}`}>
            <div className="h-between" style={{gap: 8}}>
                <h4 style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                    }}> 
                    {game.sessionName} 
                </h4>
                {game.status === 'Active' ? 
                    <div style={{
                        fontSize: 12, 
                        fontWeight: 500, 
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: "rgba(49, 54, 126, 0.4)",
                        padding: "2px 8px",
                        borderRadius: 20,
                        width: 60}}>
                        <div style={{
                            backgroundColor: "var(--green)",
                            width: 8,
                            height: 8,
                            borderRadius: "50%"}}>
                        </div>

                        Active 
                    </div>
                    :
                    <h5> 
                        #{myRank}/<span className="subtle">{Object.keys(players).length}</span>
                    </h5>

                    }
            </div>


            {game.status === "Active" ? 
            <div>
                <div className="group-card-members">
                    {Object.entries(players).map(([userID, info]) => (
                        <ProfilePicture key={userID} size={"small"} url={info.profilePic} />
                    ))}
                </div>

                <div className="bold">
                    <span className="coral-text"> ${game.buyinPrice} </span> Buy In 
                </div> 
            </div>
            :
            rankedEarnings.length > 0 && players[rankedEarnings[0][0]] && players[rankedEarnings[1][0]] ?
                <div>
                    <div style={{marginBottom: "8px"}}> 
                        <p className="medium-font body-large"> Cleaned House </p>
                        <div style={{display: "flex", alignItems: "center", gap: 4}}>
                            <ProfilePicture url={players[rankedEarnings[0][0]].profilePic} size="small" />
                            <p className="medium-font"> {players[rankedEarnings[0][0]].displayName} </p>
                            <p style={{marginLeft: 8, color: `${rankedEarnings[0][1] > 0 ? "var(--green)" : "red"}`}}> {formatCurrency(rankedEarnings[0][1])}</p>
                        </div>
                    </div>

                    <div>
                        <p className="medium-font body-large"> Got Cleaned Out </p>
                        <div style={{display: "flex", alignItems: "center", gap: 4}}>
                            <ProfilePicture url={players[rankedEarnings[rankedEarnings.length - 1][0]].profilePic} size="small" />
                            <p className="medium-font"> {players[rankedEarnings[rankedEarnings.length - 1][0]].displayName} </p>
                            <p style={{marginLeft: 8, color: `${rankedEarnings[rankedEarnings.length - 1][1] > 0 ? "var(--green)" : "red"}`}}> {formatCurrency(rankedEarnings[rankedEarnings.length - 1][1])}</p>
                        </div>
                    </div>
                </div>
            : <></>}
        </Link>
    )
}

export default GameCard;