import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import FileUpload from './components/FileUpload';
import ExpenseTable from './components/ExpenseTable';
import PayerSelector from './components/PayerSelector';
import SplitwiseSelector from './components/SplitwiseSelector';
import { fetchCategories, fetchCurrentUser, createExpenses } from './api';
import { initializeExpenseSplitting, initializeSelectedCategories, toTitleCase, distributeRemainderCents } from './utils';

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
    setLineItems(processedLineItems);
    setExpenseSplitting(initializeExpenseSplitting(processedLineItems));
    setSelectedCategories(initializeSelectedCategories(processedLineItems, categories));
  };

  const handleAddExpense = () => {
    const newExpense = {
      description: '',
      cost: '0.00',
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
      const expenses = lineItems.map((item, index) => {
        // Get the members who are selected for this expense
        let selectedMembers = splitwiseMembers.filter(member => expenseSplitting[index][member.id]);
  
        // If no members are selected, return null (we'll filter these out later)
        if (selectedMembers.length === 0) {
          return null;
        }
  
        // Check if the payer is involved in the item
        const payerInvolved = selectedMembers.some(member => member.id.toString() === payer.toString());
  
        // If the payer is not involved, add them with owed_share as 0.00
        if (!payerInvolved) {
          const payerMember = splitwiseMembers.find(member => member.id.toString() === payer.toString());
          if (payerMember) {
            selectedMembers = [...selectedMembers, payerMember];
          }
        }
  
        const totalOwedShare = parseFloat(item.cost);
        const perPersonShare = (totalOwedShare / (payerInvolved ? selectedMembers.length : selectedMembers.length - 1)).toFixed(2);
        
        let owedShares = selectedMembers.map(member => 
          (payerInvolved || member.id.toString() !== payer.toString()) ? perPersonShare : "0.00"
        );
        owedShares = distributeRemainderCents(owedShares, totalOwedShare);
  
        const users = selectedMembers.map((member, memberIndex) => ({
          user_id: member.id,
          paid_share: member.id.toString() === payer.toString() ? item.cost : "0.00",
          owed_share: owedShares[memberIndex]
        }));
  
        return {
          cost: item.cost,
          description: toTitleCase(item.description),
          date: expenseDate.toISOString().split('T')[0],
          category_id: selectedCategories[index],
          split_equally: false,
          group_id: selectedGroupId,
          users: users
        };
      }).filter(expense => expense !== null && expense.users.length > 0);
  
      // If no valid expenses, show an error
      if (expenses.length === 0) {
        setError('No valid expenses to create. Please select members for at least one expense.');
        return;
      }
  
      // Double-check that the paid and owed amounts match for each expense
      expenses.forEach(expense => {
        const totalPaid = expense.users.reduce((sum, user) => sum + parseFloat(user.paid_share), 0);
        const totalOwed = expense.users.reduce((sum, user) => sum + parseFloat(user.owed_share), 0);
        
        if (Math.abs(totalPaid - totalOwed) > 0.01) {
          console.warn('Mismatch in expense:', expense);
          throw new Error('Expense shares do not match the total cost');
        }
      });
  
      await createExpenses(expenses);
      alert('Expenses created successfully!');
    } catch (error) {
      console.error('Error creating expenses:', error);
      setError('An error occurred while creating the expenses. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>VeryFi Document Processor with Splitwise Integration</h1>
      </header>
      <main>
        <FileUpload onFileProcessed={handleFileProcessed} />
        {error && <div className="error-message">{error}</div>}
        {lineItems.length > 0 && (
          <div className="result">
            <h2>Extracted Line Items:</h2>
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