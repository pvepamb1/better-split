import React from 'react';

function PayerSelector({ payer, splitwiseMembers, onPayerChange }) {
  return (
    <div className="payer-dropdown-container">
      <label htmlFor="payer">Payer: </label>
      <select 
        id="payer" 
        value={payer || ''} 
        onChange={(e) => onPayerChange(e.target.value)}
      >
        {splitwiseMembers.map(member => (
          <option key={member.id} value={member.id}>
            {member.first_name} {member.last_name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PayerSelector;
