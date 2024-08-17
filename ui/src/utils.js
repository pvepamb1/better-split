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

