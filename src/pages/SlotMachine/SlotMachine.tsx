import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SlotMachine: React.FC = () => {
  const [startingBalance] = useState<number>(20); // Initial balance
  const [balance, setBalance] = useState<number>(20); // Current balance
  const [reward, setReward] = useState<number>(0); // Reward from the spin
  const [result, setResult] = useState<string[]>([]); // Result of the spin
  const [spinHistory, setSpinHistory] = useState<
    { spinNumber: number; result: string[]; reward: number; balance: number }[]
  >([]); // Spin history
  const [isSpinning, setIsSpinning] = useState<boolean>(false); // Spinning state
  const [error, setError] = useState<string | null>(null); // Error messages
  const [spinCount, setSpinCount] = useState<number>(0); // Number of spins

  // Function to handle spinning the slot machine
  const handleSpin = async () => {
    if (balance <= 0) {
      setError('Insufficient balance! Please reload or reset the game.');
      return;
    }

    setError(null);
    setIsSpinning(true);

    try {
      const response = await axios.post('http://localhost:3001/api/slot/spin');
      const { spinResult, reward, updatedBalance } = response.data.data;

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

  // Function to reset the balance and clear state
  const handleReset = async () => {
    setError(null);
    try {
      const response = await axios.post('http://localhost:3001/api/slot/reset');
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

  // Automatically reset balance on page refresh
  useEffect(() => {
    handleReset(); // Call handleReset when the component is mounted
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Slot Machine</h1>
      <h2>Starting Balance: {startingBalance} coins</h2>
      <h2>Current Balance: {balance} coins</h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '2rem', marginTop: '20px' }}>
        {Array.isArray(result) && result.length > 0
          ? result.map((item, index) => <span key={index}>{item}</span>)
          : <span>🎰 🎰 🎰</span>}
      </div>

      <p style={{ fontSize: '1.2rem', marginTop: '20px' }}>
        {reward > 0 ? `You won ${reward} coins! 🎉` : result.length > 0 ? 'No win, better luck next time!' : ''}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        <button
          onClick={handleSpin}
          disabled={isSpinning || balance <= 0}
          style={{
            padding: '10px 20px',
            fontSize: '1.2rem',
            backgroundColor: isSpinning || balance <= 0 ? '#ddd' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: isSpinning || balance <= 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {isSpinning ? 'Spinning...' : 'Spin'}
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: '10px 20px',
            fontSize: '1.2rem',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Reset Balance
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}

      <div style={{ marginTop: '40px' }}>
        <h2>Spin History</h2>
        {spinHistory.length > 0 ? (
          <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Spin #</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Result</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Reward</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {spinHistory.map((spin) => (
                <tr key={spin.spinNumber}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{spin.spinNumber}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    {spin.result.join(' - ')}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{spin.reward}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{spin.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No spins yet! Start spinning to see the history.</p>
        )}
      </div>
    </div>
  );
};

export default SlotMachine;
