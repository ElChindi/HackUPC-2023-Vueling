$(function() {
    const maxMessages = 15;

    const socket = io();
    const loginForm = document.getElementById('loginForm');
    const messageInput = document.getElementById('messageInput');
    const messageList = document.getElementById('messageList');
    const userList = document.getElementById('userList');

    // 1) USER LOGIN
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const group = document.getElementById('group').value;

        // validate username
        if(username && group) {
            socket.emit('login', { username, group });
            
        } else {
            alert('Please enter a valid username!');
        }
        loginForm.reset();
    });
    
    // 2) USER LOGOUT
    
    // Handle user logout
    window.addEventListener('beforeunload', () => {
        socket.emit('logout');
    });



    // 3) GAME

    function customizeBoard(countryName) {
        var imgsPath = "img/"+countryName;
        
    }



    // 4) CHAT


    // Handle sending messages
    const messageForm = document.getElementById('messageForm');

    if(messageForm){
        messageForm.addEventListener('submit', event => {
            event.preventDefault();
            const text = messageInput.value;
            socket.emit('message', { text });
            messageInput.value = '';
        });
    }

    const startGameBtn = document.getElementById('startGameBtn');
    startGameBtn.addEventListener("click", function() {
        socket.emit('startGame');
    });




    // Handle incoming messages
    socket.on('message', ({ username, text }) => {
        const list = document.getElementById('messageList');

        if (list.childElementCount >= maxMessages) {
            list.removeChild(list.firstElementChild);
        }

        const messageItem = document.createElement('li');
        messageItem.textContent = `${username}: ${text}`;
        messageList.appendChild(messageItem);
    });

    // Handle user login
    socket.on('userLoggedIn', username => {
        $("#indexPage").hide();
        $("#mainPage").show();
        // const userItem = document.createElement('div');
        // userItem.textContent = username;
        // userList.appendChild(userItem);
    });

    // Handle game started
    socket.on('gameStarted', () => {
        alert("game started!")
        $("#startGameBtn").hide();
        $("#board").show();
        $("#dice").show();

    });

    // Handle dice rolled
    socket.on('playerMoved', (username, position) => {
        // alert("player moved");
    });

    // Handle user logout
    socket.on('userLoggedOut', username => {
        for (const childNode of userList.childNodes) {
            if (childNode.textContent === username) {
                childNode.remove();
            }
        }
    });

    // Handle errors
    socket.on('errorMessage', error => {
        alert(error);
    });

    


    // DICE


    // Get the dice element
    const dice = document.getElementById('dice');
    dice.addEventListener('click', rollDice);

    // Define the rollDice function
    function rollDice() {
        socket.emit('rollDice');
        dice.removeEventListener('click', rollDice);
    }

    // Handle dice rolled
    socket.on('diceRolled', number => {

        dice.style.animation = null;
        setTimeout(() => {
            dice.style.animation = `roll${number} 2s ease-in-out forwards`;
        }, 0);
        
        setTimeout(() => {
            dice.addEventListener('click', rollDice);
        }, 2000);
    });


    
});
