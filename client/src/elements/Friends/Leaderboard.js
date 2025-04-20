import React, { useContext, useEffect, useState } from "react";

import apiClient from "../../api/api";
import AuthContext from "../../context/AuthProvider";
import { formatCurrency } from "../../utils";

import ProfilePicture from "../ProfilePicture";

function Leaderboard({data}) {
    return (
        <div>
            <table className="earnings-table">
                <thead>
                    <tr>
                        <th style={{width: 20}}> Rank </th>
                        <th> Player </th>
                        <th style={{width: 140}}> Net Earnings</th>
                        <th  style={{width: 140}}> Biggest Loss</th>
                        <th style={{width: 140}}> Net Investment</th>
                        <th style={{width: 20}}>  Played </th>
                    </tr>
                </thead>    

                <tbody>
                    {data.map((member, index) => (
                        <tr key={member.userID}>
                            <td className="rank-col"> {index + 1} </td>
                            <td className="player-col"> 
                                <div style={{display: "flex", alignItems: "center", gap: 4}}>
                                    <ProfilePicture size="small" url={member.profilePic} />
                                    {member.displayName} 
                                </div>
                            </td>
                            
                            <td className={`bold winnings-col ${member.netEarnings <= 0 ? "red-text" : " green-text"}`}> 
                                {formatCurrency(member.netEarnings)}
                            </td> 
                            
                            <td> {member.biggestLoss >= 0 ? "--" : formatCurrency(member.biggestLoss)} </td>

                            <td> {formatCurrency(member.netInvestment)} </td>
                            
                            <td> {member.gamesPlayed} </td>

                        </tr>
                        ))}
                </tbody>
            </table>
        </div>
    )
};

export default Leaderboard;