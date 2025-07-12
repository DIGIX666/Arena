// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVolatilityOracle
 * @dev Interface for monitoring CHZ price volatility and triggering protection mechanisms
 */
interface IVolatilityOracle {
    struct VolatilityData {
        uint256 currentPrice;
        uint256 volatilityPercent;
        uint256 lastUpdateTime;
        bool emergencyMode;
    }

    /**
     * @dev Returns current CHZ price in USD with 8 decimals
     */
    function getCurrentCHZPrice() external view returns (uint256);

    /**
     * @dev Returns 7-day volatility percentage with 2 decimals (e.g., 3000 = 30.00%)
     */
    function getVolatilityPercent() external view returns (uint256);

    /**
     * @dev Returns complete volatility data
     */
    function getVolatilityData() external view returns (VolatilityData memory);

    /**
     * @dev Check if volatility protection should be triggered
     * @param threshold Volatility threshold percentage (e.g., 3000 = 30%)
     */
    function shouldTriggerProtection(uint256 threshold) external view returns (bool);

    /**
     * @dev Check if emergency conversion should be triggered
     * @param crashThreshold Price crash threshold percentage (e.g., 4000 = 40%)
     */
    function shouldTriggerEmergency(uint256 crashThreshold) external view returns (bool);

    /**
     * @dev Update price data (called by oracle keepers)
     */
    function updatePriceData() external;

    /**
     * @dev Set emergency mode (admin only)
     */
    function setEmergencyMode(bool _emergencyMode) external;

    /**
     * @dev Events
     */
    event PriceUpdated(uint256 indexed price, uint256 indexed volatility);
    event VolatilityThresholdReached(uint256 indexed volatility, uint256 indexed threshold);
    event EmergencyModeTriggered(uint256 indexed crashPercent);
}