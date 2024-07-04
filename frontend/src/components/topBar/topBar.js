
    import Component from '../../../react/Component.js';
    import authProvider from '../../provider/authProvider.js';
    import userProvider from '../../provider/userProvider.js';
    import Popup from '../popup/popup.js';

    class TopBar extends Component {
        constructor(to, isHome) {
            super(to);
            const [friends, setFriends] = this.useState([])
            const [showPopUp, setShowPopUp] = this.useState(false);
            const [showProfile, setShowProfile] = this.useState(false);
            this.showProfile = showProfile;
            this.setShowProfile = setShowProfile;
            this.friend_show_id = "";
            this.findFriend = [];
            this.showPopUp = showPopUp;
            this.setShowPopUp = setShowPopUp;
            this.friends = friends;
            this.setFriends = setFriends;
            this.isHome = isHome;
            const { user } = userProvider.get();
            this.buttons = false;
            this.user = user;
        }

        init() {
        
        }

        render() {
            return `
            ${this.isHome ? ` <a class="nav-link" href="/profile">
                <img src="${this.user.profile_picture}" alt="Profile Picture" class="profile-pic">
                ${this.user.username}
            </a>` : `<a class="nav-link" href="/home">
                <i class="fas fa-home"></i>&nbspHome
            </a>`}
            <div class="navbar-nav ml-auto">
                <div class="nav-item dropdown">
                    <i class="fas fa-user-friends friends-icon dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>
                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" id="friend_list">
                            ${this.friends().map(friend => friend.status === "accepted" ? `
                            <div class="dropdown-item d-flex justify-content-between align-items-center player" id="${friend.user_id == this.user.user_id ? friend.friend_id : friend.user_id}">
                                <span class="friend-username ml-auto">${friend.friend.username}</span>
                                <span class="status-indicator ${friend.friend.status === 'online' ? 'status-online' : 'status-offline'}"></span>
                                <button class="btn btn-sm btn-light delete-friend-btn ml-2" data-id="${friend.id}">
                                    <i class="fas fa-light fa-user-minus"></i>
                                </button>
                            </div>`:
                        ` <div class="dropdown-item d-flex justify-content-between align-items-center player">
                            <span class="friend-username">${friend.friend.username}</span>
                            <div class="ml-auto">
                            <button class="btn btn-success btn-sm accept-btn" data-id="${friend.id}" data-friend="${friend.user_id}">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-danger btn-sm reject-btn ml-2" data-id="${friend.id}" >
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        </div>`).join('')}
                            <div class="dropdown-divider "></div>
                            <div class="dropdown-item popup_friend_add_button " style="font-size:13px">
                                <i class="fas fa-user-plus"></i> Adicionar Amigo
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="popup popup_friend"> </div>
            `;  
        }

        async PopupRender(token, value) {
            const customContent = `
            <div class="d-flex flex-column">
                <input type="text" class="form-control"  id="friend_username" placeholder="Nome de Usuário" value="${value}">
                <div class="mt-2" id="suggested_friends" style="max-height: 200px; overflow-y: auto;">
                    ${this.findFriend.slice(0, 4).map(friend => `
                        <div class="d-flex justify-content-between align-items-center border p-2 mb-2" >
                            <span>${friend.username}</span>
                            <button class="btn btn-success btn-sm add-friend-btn" data-id="${friend.user_id}">
                                <i class="fas fa-user-plus"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            
                <button class="btn btn-success mt-2" id="add_friend">Adicionar</button>
            </div>
            `
            const popUp = new Popup('.popup_friend', 'Adicione um Amigo', customContent, this.showPopUp(), this.setShowPopUp);
            if (this.showPopUp()) {
            popUp.reRender();

            document.querySelectorAll('.add-friend-btn').forEach(
                button => button.addEventListener('click', async (event) => {
                    const id = event.currentTarget.getAttribute('data-id');
                    try {
                        const res = await userProvider.addFriend(token, id);
                        this.setShowPopUp(false);
                        this.reRender();
                    }catch (err) {
                        console.log(err);
                    }
                    
            }));
            document.querySelector("#friend_username").addEventListener('input', async (event) => {
                try {
                    const res = await userProvider.findFriend(token, event.target.value)
                    this.findFriend = res;
                    this.PopupRender(token, event.target.value);
                }  catch (err) {
                    console.log(err);
                }
            });
        }
        }

        async mount () {
            const { token } = authProvider.get();
            await userProvider.getFriends(token).then(() => {
                const {friends} = userProvider.get();
                this.setFriends(friends);
            }).catch((err) => {
                this.setFriends([])
            });
            document.querySelectorAll('.accept-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const id = event.currentTarget.getAttribute('data-id');
                    const friend_id = event.currentTarget.getAttribute('data-friend');
                    try {
                        await userProvider.acceptfriend(token, friend_id, id);
                    } catch (err) {
                        console.log(err);
                    }
                    this.reRender();
                });
            });
            
            document.querySelectorAll('.reject-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const id = event.currentTarget.getAttribute('data-id');
                    try {
                        await userProvider.rejectFriend(token, id);
                        this.friend_show_id = id
                    } catch (err) {
                        console.log(err);
                    }
                    this.reRender();
                });
            });
            
            document.querySelectorAll('.delete-friend-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const id = event.currentTarget.getAttribute('data-id');
                    try {
                        await userProvider.rejectFriend(token, id);
                    } catch (err) {
                        console.log(err);
                    }
                    this.reRender();
                });
            });

            document.querySelectorAll(".player").forEach(player => {
                player.addEventListener('click', async (event) => {
                    this.setShowProfile(true);
                    this.friend_show_id = event.currentTarget.id
                })});
            document.querySelector('.popup_friend_add_button').addEventListener('click', () => {
                this.setShowPopUp(true);
            }); 
            if (this.showProfile()) {
                try {
                    const friend = await userProvider.findUser(token, this.friend_show_id);
                    const friend_stats = friend.stats[0]
                    const customContent = `
                    <div class="container c-flex">
                        <div class="profile-picture-container" >
                            <img src="${friend.profile_picture}" alt="${friend.username}" class="rounded-circle img-fluid profile-picture"/>
                            <div class="profile-overlay">
                                <i class="fa fa-pencil-alt"></i>
                            </div>
                        </div>
                        <div class="text-left stats-fields">
                            <h5>Estatísticas</h5>
                            <p>Partidas Jogadas: ${friend_stats.games_played}</p>
                            <p>Vitórias: ${friend_stats.games_won}</p>
                            <p>Derrotas: ${friend_stats.games_lost}</p>
                            <p>Torneios: ${friend_stats.tournament_won} - ${friend_stats.tournament_played}</p>
                        </div>
                    </div>
                `
                    const popUp = new Popup('.popup_friend', friend.username, customContent, this.showProfile(), this.setShowProfile);
                    popUp.reRender();
                } catch (err) {
                    console.log(err);
                    this.setShowProfile(false);
                }
            }
            this.PopupRender(token, "");
        }
    };

export default TopBar;
