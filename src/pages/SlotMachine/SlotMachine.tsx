// React hooks for managing state and side effects
import { useState, useEffect, useCallback, useMemo } from 'react';

import { Profiler } from 'react';

// Axios library for making HTTP requests to the back-end API
import axios from 'axios';

// Interfaces
import { SpinHistoryEntry } from './interfaces/interfaces';

// Import CSS styles
import './SlotMachine.css';

// Application configuration module for environment-specific settings
import config from '../../config/config';

// Added devLog utility function for logging;
import devLog from '../../utils/devLog';

import { Actions } from './enums/enums';

const env = config.environment || 'development';

// Base backend URL and endpoints
const backendUrl = config[env as "development"].BACKEND_API ?? '';
const slotSpinUrl = config[env as "development"].SLOT_SPIN ?? '';
//const slotResetUrl = config[env as "development"].SLOT_RESET ?? '';

export const SlotMachine = () => {
    // Static initial balance of the user
    const [startingBalance] = useState<number>(20); 
    // Current balance of the user
    const [balance, setBalance] = useState<number>(20); 
    // Reward from spinning the slot machine
    const [reward, setReward] = useState<number>(0); 
    // Result of spinning the slot machine
    const [result, setResult] = useState<string[]>([]); 
    // Spin history
    const [spinHistory, setSpinHistory] = useState<SpinHistoryEntry[]>([]); 

    // Spinning state
    const [isSpinning, setIsSpinning] = useState<boolean>(false); 
    
    // Error messages
    const [error, setError] = useState<string>(''); 
    
    // Number of spins
    const [spinCount, setSpinCount] = useState<number>(0); 

    // Reset the balance on initial load
    useEffect(() => {
        devLog('Resetting balance on component load.');

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
    const handleSpin = useCallback(async () => {
        devLog('Spinning the slot machine.');

        // Prevent spinning if the balance is zero or less
        if (balance <= 0) {
            setError('Insufficient balance! Please reload or reset the game.');
            
            return;
        }

        setError('');
        setIsSpinning(true);

        try {
            // Send current balance to the backend
            const response = await axios.post(
                `${backendUrl}/${slotSpinUrl}`, 
                {
                    action: Actions.Spin,
                }
            );

            const { 
                spinResult, 
                reward, 
                updatedBalance 
            } = response.data;

            /*
                const { 
                    spinResult, 
                    reward, 
                    updatedBalance 
                } = response.data.data;
            */

            // Update state with response data
            const newSpinCount = spinCount + 1;

            // Add the current spin details to the history
            setSpinHistory((prev) => [
                ...prev,
                {
                    spinNumber: newSpinCount,
                    result: spinResult,
                    reward,
                    balance: updatedBalance,
                },
            ]);

            // Update spinCount state
            setSpinCount(newSpinCount);

            // Update other states
            setResult(spinResult);
            setReward(reward);
            setBalance(updatedBalance);
        } catch (err) {
            setError('Failed to spin the slot machine. Please try again.');
        } finally {
            setIsSpinning(false);
        }
    }, [balance, spinCount, backendUrl, slotSpinUrl]);

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
        devLog('Resetting the slot machine.');

        setError('');
        setIsSpinning(true);

        try {
            const response = await axios.post(
                `${backendUrl}/${slotSpinUrl}`, 
                {
                    action: Actions.Reset,
                }
            );

            const { balance } = response.data;

            // Reset all state values to initial values
            setBalance(balance);
            setReward(0);
            setResult([]);
            setSpinHistory([]);
            setSpinCount(0);
        } catch (err) {
            setError('Failed to reset the balance. Please try again.');
        } finally {
            setIsSpinning(false);
        }
    };

    /**
     * Checks if the result is a valid, non-empty array.
     *
     * @param {Array} result - The array to check.
     * @returns {boolean} - Returns `true` if the array is valid and non-empty, otherwise `false`.
     */
    const isResultValid = useMemo(() => {
        devLog('Function: isValidResult (useMemo)');

        return Array.isArray(result) && result.length > 0;
    }, [result]);

    /**
     * Renders the slot machine result items.
     *
     * @param {Array} result - The result array to display.
     * @returns {JSX.Element} - The rendered result elements.
     */
    const renderSlotMachineResult = useMemo(() => {
        if (isResultValid) {
            return result.map((item, index) => (
                <span key={index} className="slot-machine__result-item">
                    {item}
                </span>
            ));
        }

        return <span className="slot-machine__default-result">🎰 🎰 🎰</span>;
    }, [result]);

    /**
     * Renders the reward message based on the reward value and result array.
     *
     * @param {number} reward - The reward value to display.
     * @param {Array} result - The result array to check for content.
     * @returns {string} - The appropriate reward message.
     */
    const getRewardMessage = useMemo(() => {
        if (reward > 0) {
            return `You won ${reward} coins! 🎉`;
        }

        if (isResultValid) {
            return "No win, better luck next time!";
        }

        return "";
    }, [reward, result]);

    /**
     * Determines if the Spin button should be disabled.
     *
     * @param {boolean} isSpinning - Whether the slot machine is currently spinning.
     * @param {number} balance - The user's current balance.
     * 
     * @returns {boolean} - Returns `true` if the button should be disabled, otherwise `false`.
     */
    const isDisabled = useMemo(() => {
        const disabled = isSpinning || balance <= 0;
        return disabled;
    }, [isSpinning, balance]);

    /**
     * Gets the class name for the Spin button based on its state.
     *
     * @param {boolean} isDisabled - Whether the button is disabled.
     * 
     * @returns {string} - The appropriate class names for the button.
     */
    const buttonClass = useMemo(
        () => `slot-machine__button slot-machine__button--spin ${isDisabled ? "slot-machine__button--disabled" : ""}`,
        [isDisabled]
    );

    /**
     * Gets the button text based on the spinning state.
     *
     * @param {boolean} isSpinning - Whether the slot machine is currently spinning.
     * 
     * @returns {string} - The appropriate text for the button.
     */
    const getSpinButtonText = useMemo(() => {
        devLog('Function: getSpinButtonText');

        return isSpinning ? "Spinning..." : "Spin";
    }, [isSpinning]);

    /**
     * Renders table rows for the spin history.
     *
     * @param {Array} spinHistory - The list of spin history objects.
     * @returns {JSX.Element[]} - An array of table row elements.
     */
    const SlotHistory = useMemo(() => {
        devLog('Rendering SlotHistory');

        return spinHistory.map((spin) => (
                <tr key={spin.spinNumber} className="slot-machine__history-row">
                    <td className="slot-machine__history-cell">{spin.spinNumber}</td>
                    <td className="slot-machine__history-cell">{spin.result.join(" - ")}</td>
                    <td className="slot-machine__history-cell">{spin.reward}</td>
                    <td className="slot-machine__history-cell">{spin.balance}</td>
                </tr>
            ));
    }, [spinHistory]);

    /**
     * Renders the spin history section.
     *
     * @param {Array} spinHistory - The list of spin history objects.
     * @returns {JSX.Element} - The rendered spin history section.
     */
    const renderedHistory = useMemo(() => {
        devLog('Function: renderSpinHistory');

        if (spinHistory.length > 0) {
            return (
                <div className="slot-machine__history">
                    <h2 className="slot-machine__history-title">Spin History</h2>
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
                            {SlotHistory}
                        </tbody>
                    </table>
                </div>
            );
        } else {
            return (
                <div className="slot-machine__history">
                    <h2 className="slot-machine__history-title">Spin History</h2>
                    <p className="slot-machine__no-history">No spins yet! Start spinning to see the history.</p>
                </div>
            );
        }
    }, [spinHistory]);

    return (
        <Profiler
            id="SlotMachine"
            onRender={(id, phase, actualDuration) => {
                console.log({ id, phase, actualDuration });
            }}
        >
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
                    {renderSlotMachineResult}
                </div>

                <p className="slot-machine__reward">
                    {getRewardMessage}
                </p>

                <div className="slot-machine__controls">
                    <button
                        onClick={handleSpin}
                        disabled={isDisabled}
                        className={buttonClass}
                    >
                        {getSpinButtonText}
                    </button>

                    <button
                        onClick={handleReset}
                        className="slot-machine__button slot-machine__button--reset"
                    >
                        Reset Balance
                    </button>
                </div>

                {error !== "" && <p className="slot-machine__error">{error}</p>}

                {renderedHistory}
            </div>
        </Profiler>
    );
};

export default SlotMachine;
