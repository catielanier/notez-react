import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import PopulateGames from './PopulateGames';
import PopulateCharacters from './PopulateCharacters';
import PopulateNotes from './PopulateNotes';
import PopulateFilters from './PopulateFilters';
import Modal from 'react-bootstrap/Modal';
import PopulatePlayers from './PopulatePlayers';

class PlayerNotes extends React.Component {
    constructor() {
        super();
        this.state = {
            userName: '',
            userId: '',
            gameData: [],
            characterData: [],
            playerNotes: [],
            playerData: [],
            filterData: [],
            gameData: [],
            opponent: '',
            selectedGame: '',
            chosenFilter: '',
            quickAddFilter: '',
            quickAddNote: '',
            showEdit: false,
            editFilter: '',
            editKey: '',
            editNote: ''
        }
        this.pullGames = this.pullGames.bind(this);
    }
    
    componentDidMount() {
        this.unsubscribe = firebase.auth().onAuthStateChanged(user => {

            this.setState({
                userId: user.uid,
                loggedIn: true
            });

            this.dbRefUser = firebase.database().ref(`users/${user.uid}`);

            this.dbRefUser.on("value", snapshot => {
                const value = snapshot.val();
                for (let user in value) {
                    const getUserName = value[user];
                    this.setState({
                        userName: getUserName
                    });

                    this.dbRefAvailablePlayers = firebase.database().ref(`userData/${getUserName}/playerNotes/`);

                    this.dbRefAvailablePlayers.on('value', (snapshot) => {
                        const playersDb = snapshot.val();
                        const playerList = []

                        for (let name in playersDb) {
                            playerList.push(name);
                        }

                        this.setState({
                            playerData: playerList
                        });
                    });
                }
            });
        });
    }

    pullGames(e) {
        const chosenPlayer = e.target.value;
        const user = this.state.userName;
        this.dbRefGamesInNotes = firebase.database().ref(`userData/${user}/playerNotes/${chosenPlayer}/`);
        const gamesInPlayerNotes = [];
        const availableGames = [];
        this.dbRefGamesInNotes.on('value', (snapshot) => {
            const arr = snapshot.val();
            for (let game in arr) {
                gamesInPlayerNotes.push(game);
            }
            this.dbRefGamesList = firebase.database().ref(`gameData/`);
            this.dbRefGamesList.on('value', (snapshot) => {
                const games = snapshot.val();
                gamesInPlayerNotes.forEach((game) => {
                    for (let object in games) {
                        if (games[object].gameShorthand === game) {
                            availableGames.push(games[object]);
                        }
                    }
                });
                this.setState({
                    gameData: availableGames
                });
            });
        });
    }

    render() {
        return(
            <main>
                <section className="selection-head">
                    <h2>Select your opponent:</h2>
                </section>
                <section className="game-select">
                    <select defaultValue="" onChange={this.pullGames}>
                        <option key="empty" value="" disabled>------</option>
                        {this.state.playerData.map((player, index) => {
                            return <PopulatePlayers playerName={player} key={index} />
                        })}
                    </select>
                </section>
            </main>
        )
    }
}

export default PlayerNotes;