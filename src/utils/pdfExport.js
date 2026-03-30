import { jsPDF } from 'jspdf';
import { jsPDF as jsPDFAdapter } from 'jspdf-autotable';

// Generate comprehensive PDF with all reports
export const generateAllReportsPDF = (reportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 166, 118); // #00A676
  doc.text('Seekon Admin - Business Report', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;

  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Summary', 14, yPosition);
  yPosition += 10;

  const summaryData = [
    ['Total Users', String(reportData.users?.length || 0)],
    ['Total Orders', String(reportData.orders?.length || 0)],
    ['Total Products', String(reportData.products?.length || 0)],
    ['Total Transactions', String(reportData.transactions?.length || 0)]
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Metric', 'Count']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [0, 166, 118] },
    margin: { left: 14, right: 14 }
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // Users Section
  if (reportData.users && reportData.users.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Users Report', 14, yPosition);
    yPosition += 10;

    const usersData = reportData.users.map(user => [
      user.name || 'N/A',
      user.email || 'N/A',
      user.phoneNumber || '',
      user.role || 'user',
      user.isActive ? 'Active' : 'Inactive'
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Name', 'Email', 'Phone', 'Role', 'Status']],
      body: usersData.slice(0, 30),
      theme: 'striped',
      headStyles: { fillColor: [0, 166, 118] },
      margin: { left: 14, right: 14 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // Orders Section
  if (reportData.orders && reportData.orders.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Orders Report', 14, yPosition);
    yPosition += 10;

    const ordersData = reportData.orders.map(order => [
      order._id ? order._id.substring(0, 8) : 'N/A',
      order.userEmail || 'N/A',
      `KSh ${order.totalAmount || 0}`,
      order.status || 'pending',
      order.isPaid ? 'Paid' : 'Pending'
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Order ID', 'Customer', 'Amount', 'Status', 'Payment']],
      body: ordersData.slice(0, 30),
      theme: 'striped',
      headStyles: { fillColor: [0, 166, 118] },
      margin: { left: 14, right: 14 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // Products Section
  if (reportData.products && reportData.products.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Products Report', 14, yPosition);
    yPosition += 10;

    const productsData = reportData.products.map(product => [
      product.name || 'N/A',
      product.category || 'N/A',
      `KSh ${product.price || 0}`,
      product.stock || 0,
      product.inStock ? 'In Stock' : 'Out of Stock'
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Name', 'Category', 'Price', 'Stock', 'Status']],
      body: productsData.slice(0, 30),
      theme: 'striped',
      headStyles: { fillColor: [0, 166, 118] },
      margin: { left: 14, right: 14 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // Transactions Section
  if (reportData.transactions && reportData.transactions.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Transactions Report', 14, yPosition);
    yPosition += 10;

    const transactionsData = reportData.transactions.map(transaction => [
      transaction._id ? transaction._id.substring(0, 8) : 'N/A',
      transaction.userEmail || 'N/A',
      `KSh ${transaction.amount || 0}`,
      transaction.method || 'N/A',
      transaction.status || 'N/A'
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Transaction ID', 'Customer', 'Amount', 'Method', 'Status']],
      body: transactionsData.slice(0, 30),
      theme: 'striped',
      headStyles: { fillColor: [0, 166, 118] },
      margin: { left: 14, right: 14 }
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`seekon_report_${new Date().getTime()}.pdf`);
};
