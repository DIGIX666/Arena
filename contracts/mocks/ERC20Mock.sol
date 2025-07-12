// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20Mock
 * @dev Contrat ERC20 mock pour les tests
 * Permet de mint des tokens librement pour simuler différents scénarios
 */
contract ERC20Mock is ERC20 {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        _decimals = 18; // Décimales par défaut
    }
    
    /**
     * @dev Mint des tokens à une adresse spécifique
     * @param to Adresse qui recevra les tokens
     * @param amount Montant à minter
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
    
    /**
     * @dev Burn des tokens d'une adresse spécifique
     * @param from Adresse dont les tokens seront brûlés
     * @param amount Montant à brûler
     */
    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }
    
    /**
     * @dev Override pour retourner les décimales personnalisées
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Fonction utilitaire pour changer le nombre de décimales (pour tests)
     */
    function setDecimals(uint8 newDecimals) public {
        _decimals = newDecimals;
    }
    
    /**
     * @dev Fonction utilitaire pour mint et approuver en une seule transaction
     */
    function mintAndApprove(address to, uint256 amount, address spender) public {
        _mint(to, amount);
        _approve(to, spender, amount);
    }
    
    /**
     * @dev Fonction pour simuler un échec de transfert (pour tests d'erreur)
     */
    bool private _transferShouldFail;
    
    function setTransferShouldFail(bool shouldFail) public {
        _transferShouldFail = shouldFail;
    }
    
    /**
     * @dev Override pour simuler des échecs de transfert
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        if (_transferShouldFail) {
            _transferShouldFail = false; // Reset after one failure
            return false;
        }
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override pour simuler des échecs de transferFrom
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        if (_transferShouldFail) {
            _transferShouldFail = false; // Reset after one failure
            return false;
        }
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Fonction utilitaire pour reset tous les balances (pour tests)
     */
    function resetBalance(address account) public {
        uint256 currentBalance = balanceOf(account);
        if (currentBalance > 0) {
            _burn(account, currentBalance);
        }
    }
    
    /**
     * @dev Fonction pour set directement un balance (pour tests rapides)
     */
    function setBalance(address account, uint256 amount) public {
        uint256 currentBalance = balanceOf(account);
        if (currentBalance < amount) {
            _mint(account, amount - currentBalance);
        } else if (currentBalance > amount) {
            _burn(account, currentBalance - amount);
        }
    }
}
