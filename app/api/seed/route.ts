import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("Cleaning database...");
  await prisma.expense.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.reseller.deleteMany({});

  console.log("Seeding Resellers...");
  const reseller1 = await prisma.reseller.create({
    data: { name: "Jason Digital", whatsappNumber: "+15551234567", notes: "Top tier seller" }
  });
  
  const reseller2 = await prisma.reseller.create({
    data: { name: "Offline Agency", whatsappNumber: "", notes: "No direct number" }
  });

  console.log("Seeding Customers...");
  const c1 = await prisma.customer.create({ data: { name: "Alice Jenkins", email: "alice@example.com", phone: "+15559876543" } });
  const c2 = await prisma.customer.create({ data: { name: "Bob Martin", email: "bob@example.com", phone: "+15551122334" } });
  const c3 = await prisma.customer.create({ data: { name: "Charlie Chaplin", email: "charlie@example.com", phone: "" } });
  const c4 = await prisma.customer.create({ data: { name: "Diana Rose", email: "diana@example.com", phone: "+15559988776" } });
  const c5 = await prisma.customer.create({ data: { name: "Evan Wright", email: "evan@example.com", phone: "+15554445555" } });

  console.log("Seeding Orders...");
  const getDateOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  await prisma.order.createMany({
    data: [
      {
        customerId: c1.id, resellerId: reseller1.id, subscriptionType: "Canva Pro",
        months: 1, startDate: getDateOffset(-40), expiryDate: getDateOffset(-10),
        buyingPrice: 5.00, sellingPrice: 15.00, profit: 10.00, status: "Expired", renewalStatus: "Message Sent",
        createdAt: getDateOffset(-40)
      },
      {
        customerId: c1.id, resellerId: reseller1.id, subscriptionType: "Canva Pro",
        months: 6, startDate: getDateOffset(-10), expiryDate: getDateOffset(170),
        buyingPrice: 20.00, sellingPrice: 50.00, profit: 30.00, status: "Active", renewalStatus: "Renewed",
        createdAt: getDateOffset(-10)
      },
      {
        customerId: c2.id, resellerId: reseller2.id, subscriptionType: "CapCut Pro",
        months: 1, startDate: getDateOffset(-30), expiryDate: getDateOffset(0),
        buyingPrice: 8.00, sellingPrice: 20.00, profit: 12.00, status: "Active", renewalStatus: "Pending",
        createdAt: getDateOffset(-30)
      },
      {
        customerId: c3.id, resellerId: null, subscriptionType: "Adobe Creative Cloud",
        months: 12, startDate: getDateOffset(-360), expiryDate: getDateOffset(5),
        buyingPrice: 100.00, sellingPrice: 250.00, profit: 150.00, status: "Active", renewalStatus: "Pending",
        createdAt: getDateOffset(-360)
      },
      {
        customerId: c4.id, resellerId: reseller1.id, subscriptionType: "ChatGPT Plus",
        months: 1, startDate: getDateOffset(-15), expiryDate: getDateOffset(15),
        buyingPrice: 10.00, sellingPrice: 25.00, profit: 15.00, status: "Active", renewalStatus: "Pending",
        createdAt: getDateOffset(-15)
      },
      {
        customerId: c5.id, resellerId: null, subscriptionType: "VEO3",
        months: 3, startDate: getDateOffset(0), expiryDate: getDateOffset(90),
        buyingPrice: 30.00, sellingPrice: 75.00, profit: 45.00, status: "Payment Received", renewalStatus: "Pending",
        createdAt: getDateOffset(0)
      },
      {
        customerId: c2.id, resellerId: reseller2.id, subscriptionType: "Canva Pro",
        months: 1, startDate: getDateOffset(0), expiryDate: getDateOffset(30),
        buyingPrice: 4.00, sellingPrice: 12.00, profit: 8.00, status: "Active", renewalStatus: "Pending",
        createdAt: getDateOffset(0)
      }
    ]
  });

  console.log("Seeding Expenses...");
  await prisma.expense.createMany({
    data: [
      { description: "Server Hosting", amount: 20.00, expenseDate: getDateOffset(0), createdAt: getDateOffset(0) },
      { description: "Facebook Ads", amount: 15.50, expenseDate: getDateOffset(-2), createdAt: getDateOffset(-2) },
      { description: "Software Tools", amount: 45.00, expenseDate: getDateOffset(-10), createdAt: getDateOffset(-10) }
    ]
  });

  console.log("Seed complete! Database populated securely.");
  return NextResponse.json({ success: true, message: "Database seeded correctly!" });
}
