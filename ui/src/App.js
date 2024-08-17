import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import FileUpload from './components/FileUpload';
import ExpenseTable from './components/ExpenseTable';
import PayerSelector from './components/PayerSelector';
import SplitwiseSelector from './components/SplitwiseSelector';
import { fetchCategories, fetchCurrentUser, createExpensesOnBackend } from './api';
import { initializeExpenseSplitting, initializeSelectedCategories } from './utils';

function App() {
  const [lineItems, setLineItems] = useState([]);
  const [splitwiseMembers, setSplitwiseMembers] = useState([]);
  const [expenseSplitting, setExpenseSplitting] = useState({});
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [payer, setPayer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
    fetchCurrentUser().then(user => {
      setCurrentUser(user);
      setPayer(user.id);
    }).catch(console.error);
  }, []);

  const handleFileProcessed = (processedLineItems) => {
    const initializedLineItems = processedLineItems.map(item => ({
      ...item,
      selectedMemberIds: item.selectedMemberIds || [], // Ensure selectedMemberIds is an array
    }));
    
    setLineItems(initializedLineItems);
    setExpenseSplitting(initializeExpenseSplitting(initializedLineItems));
    setSelectedCategories(initializeSelectedCategories(initializedLineItems, categories));
  };

  const handleAddExpense = () => {
    const newExpense = {
      description: '',
      cost: '0.00',
      selectedMemberIds: [], // Initialize as an empty array
    };
    
    setLineItems([...lineItems, newExpense]);
    setExpenseSplitting({
      ...expenseSplitting,
      [lineItems.length]: {}
    });
    setSelectedCategories({
      ...selectedCategories,
      [lineItems.length]: ''
    });
  };

  const handleRemoveExpense = (index) => {
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedLineItems);

    const updatedExpenseSplitting = { ...expenseSplitting };
    delete updatedExpenseSplitting[index];
    setExpenseSplitting(updatedExpenseSplitting);

    const updatedSelectedCategories = { ...selectedCategories };
    delete updatedSelectedCategories[index];
    setSelectedCategories(updatedSelectedCategories);
  };

  const handleSplitwiseSelection = (selectedMembers, groupId) => {
    setSplitwiseMembers(selectedMembers);
    setSelectedGroupId(groupId);
    
    const currentUserInList = selectedMembers.some(member => member.id === currentUser.id);
    if (!currentUserInList) {
      setSplitwiseMembers([...selectedMembers, currentUser]);
    }
    
    if (!payer || !selectedMembers.some(member => member.id === payer)) {
      setPayer(currentUserInList ? currentUser.id : selectedMembers[0]?.id || null);
    }
  };

  const handleCreateExpenses = async () => {
    try {
      // Filter out line items without selected members
      const filteredLineItems = lineItems.filter(item => item.selectedMemberIds && item.selectedMemberIds.length > 0);
  
      const requestData = filteredLineItems.map((item, index) => {
        const selectedUsers = splitwiseMembers.filter(member => item.selectedMemberIds.includes(member.id)).map(member => ({
          user_id: member.id,
          // Additional user-specific data can be added here if needed
        }));
  
        return {
          description: item.description,
          cost: item.cost,
          date: expenseDate, // Assuming expenseDate is the same for all line items, or modify as needed
          category_id: selectedCategories[index], // Get the selected category for each line item
          users: selectedUsers,
          payer: Number(payer), // Assuming the payer is the same for all line items, or modify as needed
          group_id: selectedGroupId // Assuming the group ID is the same for all line items, or modify as needed
        };
      });
  
      if (requestData.length === 0) {
        alert('No expenses with selected members to create.');
        return;
      }
  
      const result = await createExpensesOnBackend(requestData);
  
      // Handle the response from the backend
      alert('Expenses created successfully!');
    } catch (error) {
      console.error('Error creating expenses:', error);
      setError('An error occurred while creating the expenses. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Better Split</h1>
      </header>
      <main>
        <FileUpload onFileProcessed={handleFileProcessed} />
        {error && <div className="error-message">{error}</div>}
        {lineItems.length > 0 && (
          <div className="result">
            <SplitwiseSelector onSelectionChange={handleSplitwiseSelection} />
            <div className="date-picker-container">
              <label htmlFor="expense-date">Expense Date: </label>
              <DatePicker
                id="expense-date"
                selected={expenseDate}
                onChange={setExpenseDate}
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <PayerSelector
              payer={payer}
              splitwiseMembers={splitwiseMembers}
              onPayerChange={setPayer}
            />
            <ExpenseTable
              lineItems={lineItems}
              categories={categories}
              splitwiseMembers={splitwiseMembers}
              expenseSplitting={expenseSplitting}
              selectedCategories={selectedCategories}
              onExpenseSplittingChange={setExpenseSplitting}
              onSelectedCategoriesChange={setSelectedCategories}
              onLineItemChange={setLineItems}
              onRemoveExpense={handleRemoveExpense}
            />
            <button onClick={handleAddExpense} className="add-expense-button">
              Add Expense
            </button>
            <button onClick={handleCreateExpenses} className="submit-button">
              Create Expenses
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;