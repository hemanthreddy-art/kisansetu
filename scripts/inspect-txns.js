const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectTxns() {
  const txns = await prisma.transaction.findMany({
    include: {
      lot: true,
      buyer: true,
      transporter: true,
      payments: true,
      ratings: true,
      disputes: true
    }
  });

  console.log(`Total transactions: ${txns.length}`);
  txns.forEach((t, i) => {
    console.log(`[${i+1}] ${t.transactionCode} (${t.id}) | Status: ${t.status} | Lot: ${t.lot?.lotCode} (${t.lotId}) | Commodity: ${t.lot?.commodity} | AgreedPrice: ${t.agreedPricePerQuintal} | Qty: ${t.quantityQuintals} | Gross: ${t.grossSaleValue} | Net: ${t.netRealisation} | Buyer: ${t.buyer?.companyName} | Transp: ${t.transporter?.businessName || 'none'} | Payments: ${t.payments.map(p => `${p.status}:₹${p.amount}`).join(', ') || 'none'}`);
  });

  const trs = await prisma.transportRequest.findMany({
    include: { lot: true, transporter: true }
  });
  console.log(`\nTotal Transport Requests: ${trs.length}`);
  trs.slice(0, 10).forEach((tr, i) => {
    console.log(`[${i+1}] TR ${tr.id} | Lot: ${tr.lot?.lotCode} | Status: ${tr.status} | Dist: ${tr.distanceKm}km | Cost: ₹${tr.estimatedCost} | Transp: ${tr.transporter?.businessName}`);
  });

  await prisma.$disconnect();
}

inspectTxns().catch(console.error);
