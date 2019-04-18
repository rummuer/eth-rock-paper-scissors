App = {
    loading: false,
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

    load: async () => {
        await App.loadWeb3() // talk to BC using web3
        await App.loadAccount()
        await App.loadContract()
        await App.render()
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
                web3.eth.sendTransaction({ /* ... */ })
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({ /* ... */ })
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },
    loadAccount: async () => {
        App.account = web3.eth.accounts[0]
    },
    loadContract: async () => {
        const rockPaperScissors = await $.getJSON('RockPaperScissors.json')
        App.contracts.rockPaperScissors = TruffleContract(rockPaperScissors)
        App.contracts.rockPaperScissors.setProvider(App.web3Provider)
        App.rockPaperScissors = await App.contracts.rockPaperScissors.deployed()
    },
    render: async () => {
        if (App.loading) {
            return
        }
        App.setLoading(true)
        $('#account').html(await App.rockPaperScissors.address)
        let contractBalence = await App.rockPaperScissors.contractBal()
        contractBalence = contractBalence.toNumber()
        contractBalence = contractBalence /1000000000000000000
        $('#contractBal').html(contractBalence)
        App.setLoading(false)

    },
    convertToWord: async (letter) => {
        if (letter == 'r') return "Rock";
        if (letter == 'p') return "Paper";
        return "Scissors";
    },

    wins: async (userChoice, computerChoice) => {
        const us = await App.rockPaperScissors.userScore();
        App.userScore = us.toNumber();
        const ss = await App.rockPaperScissors.scScore();
        App.computerScore = ss.toNumber();

        App.userScore_span.innerHTML = App.userScore;
        App.computerScore_span.innerHTML = App.computerScore;

        const smallUserWord = "user".fontsize(3).sub();
        const smallCompWord = "comp".fontsize(3).sub();

        App.result_p.innerHTML = `${await App.convertToWord(userChoice)} ${smallUserWord} beats ${await App.convertToWord(computerChoice)} ${smallCompWord}.You Win! `;
        await document.getElementById(userChoice).classList.add('green-glow');
        await setTimeout(function() { document.getElementById(userChoice).classList.remove('green-glow') }, 1000);
        App.render()
    },

    lose: async (userChoice, computerChoice) => {
        const us = await App.rockPaperScissors.userScore();
        App.userScore = us.toNumber();
        const ss = await App.rockPaperScissors.scScore();
        App.computerScore = ss.toNumber();

        App.userScore_span.innerHTML = App.userScore;
        App.computerScore_span.innerHTML = App.computerScore;

        const smallUserWord = "user".fontsize(3).sub();
        const smallCompWord = "comp".fontsize(3).sub();

        App.result_p.innerHTML = `${await App.convertToWord(userChoice)} ${smallUserWord} lost to ${await App.convertToWord(computerChoice)} ${smallCompWord}.You Lost! `;
        await document.getElementById(userChoice).classList.add('red-glow');
        await setTimeout(function() { document.getElementById(userChoice).classList.remove('red-glow') }, 1000);
        App.render()
    },

    draw: async (userChoice, computerChoice) => {
        const us = await App.rockPaperScissors.userScore();
        App.userScore = us.toNumber();
        const ss = await App.rockPaperScissors.scScore();
        App.computerScore = ss.toNumber();

        App.userScore_span.innerHTML = App.userScore;
        App.computerScore_span.innerHTML = App.computerScore;
        const smallUserWord = "user".fontsize(3).sub();
        const smallCompWord = "comp".fontsize(3).sub();

        App.result_p.innerHTML = `${await App.convertToWord(userChoice)} ${smallUserWord} equals ${await App.convertToWord(computerChoice)} ${smallCompWord}. It's a Draw! `;
        await document.getElementById(userChoice).classList.add('gray-glow');
        await setTimeout(function() { document.getElementById(userChoice).classList.remove('gray-glow') }, 1000);
        App.render()
    },

    game: async (userChoice) => {
        let betAmount = $('#bet').text()
        const contractBal = App.rockPaperScissors.contractBal();
        betAmount = +betAmount * 1000000000000000000
        const e = await App.rockPaperScissors.game(userChoice, { value: betAmount })
        const winner = e.logs[0].args.winner;
        const us = await App.rockPaperScissors.userScore();
        const ss = await App.rockPaperScissors.scScore();
        console.log(winner);
        if (winner == "user") { App.wins(e.logs[0].args._userChoice, e.logs[0].args._scChoice); }
        if (winner == "comp") { App.lose(e.logs[0].args._userChoice, e.logs[0].args._scChoice); }
        if (winner == "draw") { App.draw(e.logs[0].args._userChoice, e.logs[0].args._scChoice); }
    },

    main: async () => {
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
    addEther: async () => {
        App.setLoading(true)
        await App.rockPaperScissors.addFunds({ value: 1000000000000000000 });
        window.location.reload()
        App.setLoading(false)
    },
    withdrawEther: async () => {
        App.setLoading(true)
        await App.rockPaperScissors.withdrawFunds(1000000000000000000);
        window.location.reload()
        App.setLoading(false)
    },
    raiseBet: async () => {
        let bet = +$('#bet').text() + +1
        $('#bet').html(bet);
    },
    decreaseBet: async () => {
        let bet = $('#bet').text()
        if (bet <= 1) {} else {
            bet = +bet - +1;
            $('#bet').html(bet);
        }
    },
    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    },
}
$(() => {
    $(window).load(() => {
        App.load()
    })
})