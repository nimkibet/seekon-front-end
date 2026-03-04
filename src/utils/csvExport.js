import Papa from 'papaparse';

// Export data to CSV
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export Users
export const exportUsers = (users) => {
  const data = users.map(user => ({
    Name: user.name || 'N/A',
    Email: user.email || 'N/A',
    Role: user.role || 'N/A',
    'Date Created': user.createdAt || 'N/A',
    Status: user.status || 'active'
  }));
  exportToCSV(data, `users_${new Date().getTime()}.csv`);
};

// Export Orders
export const exportOrders = (orders) => {
  const data = orders.map(order => ({
    'Order ID': order.id || 'N/A',
    Customer: order.customer || 'N/A',
    Amount: order.amount || 0,
    Status: order.status || 'N/A',
    Date: order.date || 'N/A',
    Payment: order.paymentMethod || 'N/A'
  }));
  exportToCSV(data, `orders_${new Date().getTime()}.csv`);
};

// Export Products
export const exportProducts = (products) => {
  const data = products.map(product => ({
    Name: product.name || 'N/A',
    Category: product.category || 'N/A',
    Brand: product.brand || 'N/A',
    Price: product.price || 0,
    Stock: product.stock || 0,
    Status: product.status || 'active'
  }));
  exportToCSV(data, `products_${new Date().getTime()}.csv`);
};

// Export Transactions
export const exportTransactions = (transactions) => {
  const data = transactions.map(transaction => ({
    'Transaction ID': transaction.id || 'N/A',
    'Customer Email': transaction.customerEmail || 'N/A',
    Amount: transaction.amount || 0,
    Method: transaction.method || 'N/A',
    Status: transaction.status || 'N/A',
    Date: transaction.date || 'N/A'
  }));
  exportToCSV(data, `transactions_${new Date().getTime()}.csv`);
};


