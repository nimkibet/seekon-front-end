import * as XLSX from 'xlsx';

// Export data to XLSX
export const exportToXLSX = (data, filename = 'export.xlsx') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate buffer and download
  XLSX.writeFile(workbook, filename);
};

// Export Users
export const exportUsers = (users) => {
  const data = users.map(user => ({
    Name: user.name || 'N/A',
    Email: user.email || 'N/A',
    Phone: user.phoneNumber || '',
    Role: user.role || 'N/A',
    'Date Created': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    Status: user.isActive ? 'active' : 'inactive'
  }));
  exportToXLSX(data, `users_${new Date().getTime()}.xlsx`);
};

// Export Orders
export const exportOrders = (orders) => {
  const data = orders.map(order => ({
    'Order ID': order._id ? order._id.substring(0, 8) : 'N/A',
    Customer: order.userEmail || order.customer || 'N/A',
    Phone: order.shippingAddress?.phone || order.phone || '',
    Items: order.items?.length || 0,
    Amount: order.totalAmount || 0,
    Status: order.status || 'N/A',
    'Payment Status': order.isPaid ? 'Paid' : 'Pending',
    Date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
    Payment: order.paymentMethod || 'N/A'
  }));
  exportToXLSX(data, `orders_${new Date().getTime()}.xlsx`);
};

// Export Products
export const exportProducts = (products) => {
  const data = products.map(product => ({
    Name: product.name || 'N/A',
    Category: product.category || 'N/A',
    Brand: product.brand || 'N/A',
    Price: product.price || 0,
    Stock: product.stock || 0,
    Sold: product.sold || 0,
    Status: product.inStock ? 'In Stock' : 'Out of Stock'
  }));
  exportToXLSX(data, `products_${new Date().getTime()}.xlsx`);
};

// Export Transactions
export const exportTransactions = (transactions) => {
  const data = transactions.map(transaction => ({
    'Transaction ID': transaction._id ? transaction._id.substring(0, 8) : 'N/A',
    'Customer Email': transaction.userEmail || transaction.customerEmail || 'N/A',
    Phone: transaction.phoneNumber || '',
    Amount: transaction.amount || 0,
    Method: transaction.method || 'N/A',
    Status: transaction.status || 'N/A',
    Reference: transaction.reference || '',
    Date: transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'
  }));
  exportToXLSX(data, `transactions_${new Date().getTime()}.xlsx`);
};

// Legacy CSV exports (kept for backward compatibility)
export const exportToCSV = exportToXLSX;
