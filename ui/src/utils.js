export const initializeExpenseSplitting = (lineItems) => {
    const initialSplitting = {};
    lineItems.forEach((_, index) => {
      initialSplitting[index] = {};
    });
    return initialSplitting;
  };
  
  export const initializeSelectedCategories = (lineItems, categories) => {
    const initialCategories = {};
    const groceriesCategoryId = categories.find(cat => cat.name.includes('Groceries'))?.id || '';
    lineItems.forEach((_, index) => {
      initialCategories[index] = groceriesCategoryId;
    });
    return initialCategories;
  };

  export const toTitleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  };  

  export function distributeRemainderCents(shares, total) {
    const totalShares = shares.reduce((sum, share) => sum + parseFloat(share), 0);
    const remainder = parseFloat((total - totalShares).toFixed(2));
    
    if (remainder === 0) {
      return shares;
    }
  
    const adjustedShares = [...shares];
    const absDiff = Math.abs(remainder);
    const step = remainder > 0 ? 0.01 : -0.01;
  
    for (let i = 0; i < absDiff * 100; i++) {
      adjustedShares[i % adjustedShares.length] = (parseFloat(adjustedShares[i % adjustedShares.length]) + step).toFixed(2);
    }
  
    return adjustedShares;
  }