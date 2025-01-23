// React hooks for managing state and side effects
import { useState, useEffect } from 'react';

// Axios library for making HTTP requests to the back-end API
import axios from 'axios';

// Interfaces
import { SpinHistoryEntry } from './interfaces/interfaces';

// Import CSS styles
import './SlotMachine.css';

// Application configuration module for environment-specific settings
import config from '../../config/config';

const env = config.environment || 'development';

// Base backend URL and endpoints
const backendUrl = config[env as "development"].BACKEND_API ?? '';
const slotSpinUrl = config[env as "development"].SLOT_SPIN ?? '';
const slotResetUrl = config[env as "development"].SLOT_RESET ?? '';

export const SlotMachine = () => {
    // Initial balance
    const [startingBalance] = useState<number>(20); 

    // Current balance
    const [balance, setBalance] = useState<number>(20); 

    // Reward from the spin
    const [reward, setReward] = useState<number>(0); 

    // Result of the spin
    const [result, setResult] = useState<string[]>([]); 
    
    // Spin history
    const [spinHistory, setSpinHistory] = useState<SpinHistoryEntry[]>([]); 

    // Spinning state
    const [isSpinning, setIsSpinning] = useState<boolean>(false); 
    
    // Error messages
    const [error, setError] = useState<string>(""); 
    
    // Number of spins
    const [spinCount, setSpinCount] = useState<number>(0); 

    // Automatically reset balance on page refresh
    useEffect(() => {
        // Call handleReset when the component is mounted
        handleReset(); 
    }, []);

    /**
     * Handles the spinning of the slot machine.
     * 
     * - Deducts 1 coin from the balance for the spin.
     * - Sends a POST request to the server to simulate a spin.
     * - Updates the spin result, reward, and user's balance based on the response.
     * - Adds the current spin details to the spin history.
     * - Displays an error if the balance is insufficient or if the request fails.
     *
     * @async
     * @function
     * @throws {Error} If the request to the server fails.
     */
    const handleSpin = async () => {
        if (balance <= 0) {
            setError('Insufficient balance! Please reload or reset the game.');

            return;
        }

        setError("");
        setIsSpinning(true);

        try {
            const response = await axios.post(`${backendUrl}/${slotSpinUrl}`);
            const { 
                spinResult, 
                reward, 
                updatedBalance 
            } = response.data.data;

            // Update the state with the results
            setResult(spinResult);
            setReward(reward);
            setBalance(updatedBalance);
            setSpinCount((prev) => prev + 1);

            // Add the current spin details to the history
            setSpinHistory((prev) => [
                ...prev,
                {
                    spinNumber: spinCount + 1,
                    result: spinResult,
                    reward,
                    balance: updatedBalance,
                },
            ]);
        } catch (err) {
            setError('Failed to spin the slot machine. Please try again.');
        } finally {
            setIsSpinning(false);
        }
    };

    /**
     * Resets the slot machine state to its initial values.
     * 
     * - Sends a POST request to the server to reset the user's balance.
     * - Resets all state variables, including balance, reward, results, spin history, and spin count.
     * - Displays an error if the request to reset fails.
     *
     * @async
     * @function
     * @throws {Error} If the request to the server fails.
     */
    const handleReset = async () => {
        setError("");

        try {
            const response = await axios.post(`${backendUrl}/${slotResetUrl}`);
            const { balance } = response.data;

            // Reset all state values to initial values
            setBalance(balance);
            setReward(0);
            setResult([]);
            setSpinHistory([]);
            setSpinCount(0);
        } catch (err) {
            setError('Failed to reset the balance. Please try again.');
        }
    };

    /**
     * Checks if the result is a valid, non-empty array.
     *
     * @param {Array} result - The array to check.
     * @returns {boolean} - Returns `true` if the array is valid and non-empty, otherwise `false`.
     */
    const isValidResult = (result: string[] = []) => {
        return Array.isArray(result) && result.length > 0;
    };

    /**
     * Renders the slot machine result items.
     *
     * @param {Array} result - The result array to display.
     * @returns {JSX.Element} - The rendered result elements.
     */
    const renderSlotMachineResult = (result: string[] = []) => {
        if (isValidResult(result)) {
            return result.map((item, index) => (
                <span 
                    key={index} 
                    className="slot-machine__result-item"
                >
                    {item}
                </span>
            ));
        }
        
        return <span className="slot-machine__default-result">🎰 🎰 🎰</span>;
    };

    /**
     * Renders the reward message based on the reward value and result array.
     *
     * @param {number} reward - The reward value to display.
     * @param {Array} result - The result array to check for content.
     * @returns {string} - The appropriate reward message.
     */
    const getRewardMessage = (reward = 0, result: string[] = []) => {
        if (reward > 0) {
            return `You won ${reward} coins! 🎉`;
        }

        if (isValidResult(result)) {
            return "No win, better luck next time!";
        }

        return "";
    };

    /**
     * Determines if the Spin button should be disabled.
     *
     * @param {boolean} isSpinning - Whether the slot machine is currently spinning.
     * @param {number} balance - The user's current balance.
     * 
     * @returns {boolean} - Returns `true` if the button should be disabled, otherwise `false`.
     */
    const isSpinDisabled = (isSpinning: boolean, balance: number) => {
        console.log("isSpinning", isSpinning);
        console.log("balance", balance);

        return isSpinning || balance <= 0;
    };
    
    /**
     * Gets the class name for the Spin button based on its state.
     *
     * @param {boolean} isDisabled - Whether the button is disabled.
     * 
     * @returns {string} - The appropriate class names for the button.
     */
    const getSpinButtonClass = (isDisabled = false) => {
        return `slot-machine__button slot-machine__button--spin ${
            isDisabled ? "slot-machine__button--disabled" : ""
        }`;
    };
    
    /**
     * Gets the button text based on the spinning state.
     *
     * @param {boolean} isSpinning - Whether the slot machine is currently spinning.
     * 
     * @returns {string} - The appropriate text for the button.
     */
    const getSpinButtonText = (isSpinning = false) => {
        return isSpinning ? "Spinning..." : "Spin";
    };

    /**
     * Renders table rows for the spin history.
     *
     * @param {Array} spinHistory - The list of spin history objects.
     * @returns {JSX.Element[]} - An array of table row elements.
     */
    const renderSpinHistoryRows = (spinHistory: SpinHistoryEntry[] = []) => {
        return spinHistory.map((spin) => (
            <tr key={spin.spinNumber} className="slot-machine__history-row">
                <td className="slot-machine__history-cell">{spin.spinNumber}</td>
                <td className="slot-machine__history-cell">{spin.result.join(" - ")}</td>
                <td className="slot-machine__history-cell">{spin.reward}</td>
                <td className="slot-machine__history-cell">{spin.balance}</td>
            </tr>
        ));
    };

    /**
     * Renders the spin history section.
     *
     * @param {Array} spinHistory - The list of spin history objects.
     * @returns {JSX.Element} - The rendered spin history section.
     */
    const renderSpinHistory = (spinHistory: SpinHistoryEntry[] = []) => {
        if (spinHistory.length > 0) {
            return (
                <div className="slot-machine__history">
                    <h2 className="slot-machine__history-title">
                        Spin History
                    </h2>
                    <table className="slot-machine__history-table">
                        <thead>
                            <tr>
                                <th className="slot-machine__history-header">Spin #</th>
                                <th className="slot-machine__history-header">Result</th>
                                <th className="slot-machine__history-header">Reward</th>
                                <th className="slot-machine__history-header">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderSpinHistoryRows(spinHistory)}
                        </tbody>
                    </table>
                </div>
            );
        } else {
            return (
                <div className="slot-machine__history">
                    <h2 className="slot-machine__history-title">
                        Spin History
                    </h2>
                    <p className="slot-machine__no-history">
                        No spins yet! Start spinning to see the history.
                    </p>
                </div>
            );
        }
    };

    return (
        <div className="slot-machine">
            <h1 className="slot-machine__title">
                Slot Machine
            </h1>
            <h2 className="slot-machine__starting-balance">
                Starting Balance: {startingBalance} coins
            </h2>
            <h2 className="slot-machine__current-balance">
                Current Balance: {balance} coins
            </h2>

            <div className="slot-machine__result">
                {renderSlotMachineResult(result)}
            </div>

            <p className="slot-machine__reward">
                {getRewardMessage(reward, result)}
            </p>

            <div className="slot-machine__controls">
                <button
                    onClick={handleSpin}
                    disabled={isSpinDisabled(isSpinning, balance)}
                    className={getSpinButtonClass(
                        isSpinDisabled(isSpinning, balance)
                    )}
                >
                    {getSpinButtonText(isSpinning)}
                </button>

                <button
                    onClick={handleReset}
                    className="slot-machine__button slot-machine__button--reset"
                >
                    Reset Balance
                </button>
            </div>

            {error !== "" && <p className="slot-machine__error">{error}</p>}

            {renderSpinHistory(spinHistory)}
        </div>
    );
};

export default SlotMachine;
