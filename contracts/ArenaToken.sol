// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArenaToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public tokenPrice = 0.001 ether; // Prix en CHZ (testnet)
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event TokensTransferred(address indexed from, address indexed to, uint256 amount);
    
    constructor() ERC20("Arena Token", "ARENA") Ownable() {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    // Fonction pour acheter des tokens avec CHZ
    function buyTokens(uint256 _tokenAmount) external payable {
        uint256 cost = _tokenAmount * tokenPrice;
        require(msg.value >= cost, "Insufficient CHZ sent");
        require(balanceOf(address(this)) >= _tokenAmount, "Not enough tokens available");
        
        _transfer(address(this), msg.sender, _tokenAmount);
        
        // Rembourser l'excédent
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        emit TokensPurchased(msg.sender, _tokenAmount, cost);
    }
    
    // Fonction pour que le owner puisse ajuster le prix
    function setTokenPrice(uint256 _newPrice) external onlyOwner {
        tokenPrice = _newPrice;
    }
    
    // Fonction pour retirer les CHZ du contrat
    function withdrawChz() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Fonction pour transférer des tokens entre utilisateurs
    function transferTokens(address _to, uint256 _amount) external {
        require(_to != address(0), "Cannot transfer to zero address");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        _transfer(msg.sender, _to, _amount);
        emit TokensTransferred(msg.sender, _to, _amount);
    }
    
    // Fonction pour que le owner puisse distribuer des tokens
    function distributeTokens(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Cannot distribute to zero address");
        require(balanceOf(address(this)) >= _amount, "Not enough tokens in contract");
        
        _transfer(address(this), _to, _amount);
    }
}
