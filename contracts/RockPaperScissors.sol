pragma solidity ^0.5.0;
contract RockPaperScissors {
	uint public contractBal;
	address payable public contractOwner;
	uint public userScore=0;
	uint public scScore=0;
	string[] public choices= ["r","p","s"];
	constructor() public payable {
		contractBal = msg.value;
		contractOwner = msg.sender;
	}
	modifier onlyOwner { require(msg.sender == contractOwner,"Only Contract owner should call");_; } 

	event fundsAdded(uint newBalence);
	event fundsWithdrawn(uint amountWithdrawn,uint newBalence);
	event gameFinished(string winner,string _userChoice,string _scChoice);

	function addFunds() public payable onlyOwner{
		require(msg.value>0);
		contractBal = contractBal + msg.value;
		emit fundsAdded(contractBal);
	}
	function withdrawFunds(uint amount) onlyOwner public payable {
		contractBal = contractBal - amount;
		contractOwner.transfer(amount);
		emit fundsWithdrawn(amount, contractBal);
	}
	function game(string memory userChoice) public payable {
			require (contractBal >= msg.value,"Not enough Balence");
			string memory scChoice = choices[getSCChoice()];
			if((compareStrings(userChoice,'r') && compareStrings(scChoice,'s')) || (compareStrings(userChoice,'p') && compareStrings(scChoice,'r')) || (compareStrings(userChoice,'s') && compareStrings(scChoice,'p'))) {
				wins(userChoice,scChoice);
				msg.sender.transfer(msg.value);
			}			
			if((compareStrings(userChoice,'r') && compareStrings(scChoice,'p')) || (compareStrings(userChoice,'p') && compareStrings(scChoice,'s')) || (compareStrings(userChoice,'s') && compareStrings(scChoice,'r'))) {
				lose(userChoice,scChoice);
				contractBal = contractBal + msg.value;
				}			
			if((compareStrings(userChoice,'r') && compareStrings(scChoice,'r')) || (compareStrings(userChoice,'p') && compareStrings(scChoice,'p')) || (compareStrings(userChoice,'s') && compareStrings(scChoice,'s'))) {
				draw(userChoice,scChoice);
				msg.sender.transfer(msg.value);
			}			


	}
	function compareStrings (string memory a, string memory b) internal pure
     returns (bool) {
  	 return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))) );
       }
	function wins(string memory userChoice,string memory scChoice) internal {
		userScore++;
		emit gameFinished("user",userChoice,scChoice);
	}
	function lose(string memory userChoice,string memory scChoice) internal {
		scScore++;
		emit gameFinished("comp",userChoice,scChoice);
	}
	function draw(string memory userChoice,string memory scChoice) internal {
		userScore++;
		scScore++;
		emit gameFinished("draw",userChoice,scChoice);
	}

	function getSCChoice() internal returns(uint) {
		uint n =3;
		bytes32 seed = keccak256(abi.encodePacked(blockhash(block.number-n*10),block.timestamp));
		return uint(seed)%n;
	}
	
	
}