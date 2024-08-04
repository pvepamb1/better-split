import React, { useState, useEffect } from 'react';
import { fetchGroups, fetchFriends } from '../api';

function SplitwiseSelector({ onSelectionChange }) {
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchGroups().then(setGroups).catch(console.error);
    fetchFriends().then(setFriends).catch(console.error);
  }, []);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    setSelectedItems([]);
    onSelectionChange([], null);
  };

  const handleItemSelection = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    let selectedMembers;
    let groupId = null;

    if (selectedOption === 'group') {
      const selectedGroup = groups.find(group => group.id.toString() === selectedIds[0]);
      selectedMembers = selectedGroup.members.map(member => ({
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name
      }));
      groupId = selectedGroup.id;
    } else {
      selectedMembers = friends
        .filter(friend => selectedIds.includes(friend.id.toString()))
        .map(friend => ({
          id: friend.id,
          first_name: friend.first_name,
          last_name: friend.last_name
        }));
    }
    setSelectedItems(selectedMembers);
    onSelectionChange(selectedMembers, groupId);
  };

  return (
    <div className="splitwise-selector">
      <h3>Splitwise Selection</h3>
      <div>
        <label>
          <input
            type="radio"
            value="group"
            checked={selectedOption === 'group'}
            onChange={handleOptionChange}
          />
          Group
        </label>
        <label>
          <input
            type="radio"
            value="friends"
            checked={selectedOption === 'friends'}
            onChange={handleOptionChange}
          />
          Friends
        </label>
      </div>
      {selectedOption && (
        <select multiple onChange={handleItemSelection}>
          {selectedOption === 'group'
            ? groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))
            : friends.map(friend => (
                <option key={friend.id} value={friend.id}>
                  {friend.first_name} {friend.last_name}
                </option>
              ))}
        </select>
      )}
    </div>
  );
}

export default SplitwiseSelector;
