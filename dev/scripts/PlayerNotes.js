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
        this.pullNotes = this.pullNotes.bind(this);
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
                    gameData: availableGames,
                    opponent: chosenPlayer
                });
            });
        });
    }

    pullNotes(e) {
        const game = e.target.value;
        const opponent = this.state.opponent;
        const you = this.state.userName;

        console.log(game, opponent, you);

        if (game !== '' && opponent !== '') {
            this.dbRefNotes = firebase.database().ref(`userData/${you}/playerNotes/${opponent}/${game}/`);
            this.dbRefNotes.on('value', (snapshot) => {
                const notes = snapshot.val();
                notes.forEach((item, index) => {
                    item.index = index;
                }) 
                console.log(notes);
                this.setState({
                    selectedGame: game,
                    playerNotes: notes
                });
            });
        }
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
                <section className="selection-head">
                    <h2>Select your game:</h2>
                </section>
                <section className="game-select">
                    <select defaultValue="" onChange={this.pullNotes}>
                        <option key="empty" value="" disabled>------</option>
                        {this.state.gameData.map((game, index) => {
                            return <PopulateGames gameName={game.gameName} gameShorthand={game.gameShorthand} gameKey={index} key={index} />
                        })}
                    </select>
                </section>
                <section className="char-notes">
                    <ul>
                    </ul>
                </section>
            </main>
        )
    }
}

export default PlayerNotes;