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
  const handleDescriptionChange = (index, newDescription) => {
    onLineItemChange(prevItems => 
      prevItems.map((item, i) => 
        i === index ? { ...item, description: newDescription } : item
      )
    );
  };

  const handleCostChange = (index, newCost) => {
    onLineItemChange(prevItems => 
      prevItems.map((item, i) => 
        i === index ? { ...item, cost: newCost } : item
      )
    );
  };

  const handleCategoryChange = (index, categoryId) => {
    onSelectedCategoriesChange(prevState => ({
      ...prevState,
      [index]: categoryId
    }));
  };

  const handleCheckboxChange = (itemIndex, memberId) => {
    onExpenseSplittingChange(prevState => ({
      ...prevState,
      [itemIndex]: {
        ...prevState[itemIndex],
        [memberId]: !prevState[itemIndex][memberId]
      }
    }));
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