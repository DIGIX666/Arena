// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IVolatilityOracle.sol";

/**
 * @title MockVolatilityOracle
 * @dev Mock implementation of IVolatilityOracle for testing purposes
 */
contract MockVolatilityOracle is IVolatilityOracle {
    VolatilityData private volatilityData;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        volatilityData = VolatilityData({
            currentPrice: 12000000, // $0.12 with 8 decimals
            volatilityPercent: 2000, // 20%
            lastUpdateTime: block.timestamp,
            emergencyMode: false
        });
    }

    function getCurrentCHZPrice() external view override returns (uint256) {
        return volatilityData.currentPrice;
    }

    function getVolatilityPercent() external view override returns (uint256) {
        return volatilityData.volatilityPercent;
    }

    function getVolatilityData() external view override returns (VolatilityData memory) {
        return volatilityData;
    }

    function shouldTriggerProtection(uint256 threshold) external view override returns (bool) {
        return volatilityData.volatilityPercent >= threshold;
    }

    function shouldTriggerEmergency(uint256 crashThreshold) external view override returns (bool) {
        return volatilityData.emergencyMode && volatilityData.volatilityPercent >= crashThreshold;
    }

    function updatePriceData() external override {
        volatilityData.lastUpdateTime = block.timestamp;
        emit PriceUpdated(volatilityData.currentPrice, volatilityData.volatilityPercent);
    }

    function setEmergencyMode(bool _emergencyMode) external override onlyOwner {
        volatilityData.emergencyMode = _emergencyMode;
        if (_emergencyMode) {
            emit EmergencyModeTriggered(volatilityData.volatilityPercent);
        }
    }

    // Test helper functions
    function setPrice(uint256 _price) external onlyOwner {
        volatilityData.currentPrice = _price;
        volatilityData.lastUpdateTime = block.timestamp;
        emit PriceUpdated(_price, volatilityData.volatilityPercent);
    }

    function setVolatilityPercent(uint256 _volatilityPercent) external onlyOwner {
        volatilityData.volatilityPercent = _volatilityPercent;
        volatilityData.lastUpdateTime = block.timestamp;
        emit VolatilityThresholdReached(_volatilityPercent, 3000);
    }

    function setVolatilityData(
        uint256 _price,
        uint256 _volatilityPercent,
        bool _emergencyMode
    ) external onlyOwner {
        volatilityData.currentPrice = _price;
        volatilityData.volatilityPercent = _volatilityPercent;
        volatilityData.emergencyMode = _emergencyMode;
        volatilityData.lastUpdateTime = block.timestamp;
        
        emit PriceUpdated(_price, _volatilityPercent);
        if (_emergencyMode) {
            emit EmergencyModeTriggered(_volatilityPercent);
        }
    }
}