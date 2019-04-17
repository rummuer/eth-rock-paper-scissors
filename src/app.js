App = {
contracts: {},    
userScore: 0,
computerScore: 0,
userScore_span: document.getElementById('user-score'),
computerScore_span: document.getElementById('computer-score'),
scoreBoard_div: document.querySelector(".score-board"),
result_p: document.querySelector(".result > p"),
rock_div: document.getElementById("r"),
paper_div: document.getElementById("p"),
scissors_div: document.getElementById("s"),

load: async() => {
    await App.loadWeb3()  // talk to BC using web3
    await App.loadAccount()
    await App.loadContract()
    await App.main()

},

loadWeb3: async () => {
         if (typeof web3 !== 'undefined') {
           App.web3Provider = web3.currentProvider
           web3 = new Web3(web3.currentProvider)
         } else {
           window.alert("Please connect to Metamask.")
         }
         // Modern dapp browsers...
         if (window.ethereum) {
           window.web3 = new Web3(ethereum)
           try {
             // Request account access if needed
             await ethereum.enable()
             // Acccounts now exposed
             web3.eth.sendTransaction({/* ... */})
           } catch (error) {
             // User denied account access...
           }
         }
         // Legacy dapp browsers...
         else if (window.web3) {
           App.web3Provider = web3.currentProvider
           window.web3 = new Web3(web3.currentProvider)
           // Acccounts always exposed
           web3.eth.sendTransaction({/* ... */})
         }
         // Non-dapp browsers...
         else {
           console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
         }
       },
loadAccount: async() => {
App.account = web3.eth.accounts[0]
},
loadContract: async() => {
    const rockPaperScissors = await $.getJSON('RockPaperScissors.json')
    App.contracts.rockPaperScissors = TruffleContract(rockPaperScissors)
    App.contracts.rockPaperScissors.setProvider(App.web3Provider)
    App.rockPaperScissors = await App.contracts.rockPaperScissors.deployed()
    $('#account').html(App.rockPaperScissors.address)
    },


getComputerChoice: async() => {
    const choices = ['r', 'p', 's'];
    const randomNumber = Math.floor(Math.random() * 3);
    const randomChoice = choices[randomNumber];
    return randomChoice;
},

convertToWord: async(letter) => {
    if (letter == 'r') return "Rock";
    if (letter == 'p') return "Paper";
    return "Scissors";
},

wins: async(userChoice, computerChoice) => {
    App.userScore++;
    App.userScore_span.innerHTML = App.userScore;
    App.computerScore_span.innerHTML = App.computerScore;
    const smallUserWord = "user".fontsize(3).sub();
    const smallCompWord = "comp".fontsize(3).sub();
    App.result_p.innerHTML = `${await App.convertToWord(userChoice)} ${smallUserWord} beats ${await App.convertToWord(computerChoice)} ${smallCompWord}.You Win! `;
    await document.getElementById(userChoice).classList.add('green-glow');
    await setTimeout(function() {document.getElementById(userChoice).classList.remove('green-glow')},1000);
},

lose: async(userChoice, computerChoice) => {
    App.computerScore++;
    App.userScore_span.innerHTML = App.userScore;
    App.computerScore_span.innerHTML = App.computerScore;
    const smallUserWord = "user".fontsize(3).sub();
    const smallCompWord = "comp".fontsize(3).sub();
    App.result_p.innerHTML =  `${await App.convertToWord(userChoice)} ${smallUserWord} lost to ${await App.convertToWord(computerChoice)} ${smallCompWord}.You Lost! `;
   await document.getElementById(userChoice).classList.add('red-glow');
    await setTimeout(function() {document.getElementById(userChoice).classList.remove('red-glow')},1000);

},

draw: async(userChoice, computerChoice) => {
    App.userScore++;
    App.computerScore++;
    App.userScore_span.innerHTML = App.userScore;
    App.computerScore_span.innerHTML = App.computerScore;
    const smallUserWord = "user".fontsize(3).sub();
    const smallCompWord = "comp".fontsize(3).sub();
    App.result_p.innerHTML =  `${await App.convertToWord(userChoice)} ${smallUserWord} equals ${await App.convertToWord(computerChoice)} ${smallCompWord}. It's a Draw! `;
    await document.getElementById(userChoice).classList.add('gray-glow');
    await setTimeout(function() {document.getElementById(userChoice).classList.remove('gray-glow')},1000);
},

game: async(userChoice) => {
    const computerChoice = await App.getComputerChoice();
    switch (userChoice + computerChoice) {
        case "rs":
        case "pr":
        case "sp":
            App.wins(userChoice, computerChoice);
            break;
        case "rp":
        case "ps":
        case "sr":
            App.lose(userChoice, computerChoice);
            break;
        case "rr":
        case "pp":
        case "ss":
            App.draw(userChoice, computerChoice);
            break;
    }

},

main: async() => {
    App.rock_div.addEventListener('click', function() {
        App.game("r");
           })
    App.paper_div.addEventListener('click', function() {
        App.game("p");
            })
    App.scissors_div.addEventListener('click', function() {
        App.game("s");
        })
},
}
$(() => {
      $(window).load(() => {
       App.load()
      })
     })