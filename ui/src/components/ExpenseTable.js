// ExpenseTable.js

import React from 'react';
import { toTitleCase } from '../utils';

function ExpenseTable({
  lineItems,
  categories,
  splitwiseMembers,
  expenseSplitting,
  selectedCategories,
  onExpenseSplittingChange,
  onSelectedCategoriesChange,
  onLineItemChange,
  onRemoveExpense
}) {
  // Handle changes to the description field
  const handleDescriptionChange = (itemIndex, newDescription) => {
    onLineItemChange(prevItems =>
      prevItems.map((item, i) =>
        i === itemIndex ? { ...item, description: newDescription } : item
      )
    );
  };

  // Handle changes to the cost field
  const handleCostChange = (itemIndex, newCost) => {
    onLineItemChange(prevItems =>
      prevItems.map((item, i) =>
        i === itemIndex ? { ...item, cost: newCost } : item
      )
    );
  };

  // Handle changes to the category selection
  const handleCategoryChange = (itemIndex, newCategoryId) => {
    onSelectedCategoriesChange(prevCategories => ({
      ...prevCategories,
      [itemIndex]: parseInt(newCategoryId, 10)
    }));
  };

  const handleCheckboxChange = (itemIndex, memberId) => {
    const updatedSplitting = {
      ...expenseSplitting,
      [itemIndex]: {
        ...expenseSplitting[itemIndex],
        [memberId]: !expenseSplitting[itemIndex][memberId]
      }
    };
    onExpenseSplittingChange(updatedSplitting);
  
    const selectedMemberIds = Object.keys(updatedSplitting[itemIndex])
      .filter(id => updatedSplitting[itemIndex][id])
      .map(id => parseInt(id, 10));
  
    onLineItemChange(prevItems =>
      prevItems.map((item, i) =>
        i === itemIndex ? { ...item, selectedMemberIds: selectedMemberIds || [] } : item
      )
    );
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Cost</th>
          <th>Category</th>
          {splitwiseMembers.map(member => (
            <th key={member.id}>{member.first_name} {member.last_name}</th>
          ))}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {lineItems.map((item, index) => (
          <tr key={index}>
            <td>
              <input
                type="text"
                value={toTitleCase(item.description)}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                className="editable-description"
              />
            </td>
            <td>
              <input
                type="number"
                value={item.cost}
                onChange={(e) => handleCostChange(index, e.target.value)}
                className="editable-cost"
                step="0.01"
                min="0"
              />
            </td>
            <td>
              <select
                value={selectedCategories[index] || ''}
                onChange={(e) => handleCategoryChange(index, e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </td>
            {splitwiseMembers.map(member => (
              <td key={member.id}>
                <input
                  type="checkbox"
                  checked={expenseSplitting[index]?.[member.id] || false}
                  onChange={() => handleCheckboxChange(index, member.id)}
                />
              </td>
            ))}
            <td>
              <button onClick={() => onRemoveExpense(index)} className="remove-expense-button">
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ExpenseTable;