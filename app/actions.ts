"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(formData: FormData) {
  // Extract fields
  const customerName = formData.get("customerName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  
  const subscriptionType = formData.get("subscriptionType") as string;
  const months = parseInt(formData.get("months") as string);
  const startDate = formData.get("startDate") as string;
  const resellerId = formData.get("resellerId") as string;
  const orderStatus = formData.get("orderStatus") as string || "Active";
  
  const buyingPrice = parseFloat(formData.get("buyingPrice") as string);
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const profit = sellingPrice - buyingPrice;

  // Calculate Expiry Date based on startDate and months
  const start = new Date(startDate);
  const expiry = new Date(start);
  expiry.setMonth(start.getMonth() + months);

  // 1. Create or Find Customer
  // For simplicity, we just create a new customer or find by exact email/phone if we wanted to
  // Here we'll just create a new customer record for this order
  const customer = await prisma.customer.create({
    data: {
      name: customerName,
      email: email,
      phone: phone,
    }
  });

  // 2. Create Order
  await prisma.order.create({
    data: {
      customerId: customer.id,
      resellerId: (resellerId && !isNaN(parseInt(resellerId))) ? parseInt(resellerId) : null,
      subscriptionType,
      months,
      startDate: start,
      expiryDate: expiry,
      buyingPrice,
      sellingPrice,
      profit,
      status: orderStatus,
      renewalStatus: "Pending",
    }
  });

  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/customers");
  
  return { success: true };
}

export async function createExpense(formData: FormData) {
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const expenseDate = new Date(formData.get("expenseDate") as string);

  await prisma.expense.create({
    data: {
      description,
      amount,
      expenseDate,
    }
  });

  revalidatePath("/");
  revalidatePath("/expenses");
  
  return { success: true };
}

export async function updateExpense(id: number, formData: FormData) {
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const expenseDate = new Date(formData.get("expenseDate") as string);

  await prisma.expense.update({
    where: { id },
    data: { description, amount, expenseDate }
  });

  revalidatePath("/expenses");
  revalidatePath("/");
  return { success: true };
}

export async function deleteExpense(id: number) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
  revalidatePath("/");
  return { success: true };
}

export async function createReseller(formData: FormData) {
  const name = formData.get("name") as string;
  const whatsappNumber = formData.get("whatsappNumber") as string;
  const notes = formData.get("notes") as string;

  await prisma.reseller.create({
    data: { name, whatsappNumber, notes }
  });

  revalidatePath("/resellers");
  return { success: true };
}

export async function updateReseller(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const whatsappNumber = formData.get("whatsappNumber") as string;
  const notes = formData.get("notes") as string;

  await prisma.reseller.update({
    where: { id },
    data: { name, whatsappNumber, notes }
  });

  revalidatePath("/resellers");
  return { success: true };
}

export async function deleteReseller(id: number) {
  await prisma.reseller.delete({ where: { id } });
  revalidatePath("/resellers");
  return { success: true };
}

export async function deleteOrder(id: number) {
  await prisma.order.delete({ where: { id } });
  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true };
}

export async function updateOrder(id: number, formData: FormData) {
  const customerName = formData.get("customerName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  
  const subscriptionType = formData.get("subscriptionType") as string;
  const months = parseInt(formData.get("months") as string);
  const startDate = formData.get("startDate") as string;
  const resellerId = formData.get("resellerId") as string;
  const orderStatus = formData.get("orderStatus") as string || "Active";
  const renewalStatus = formData.get("renewalStatus") as string || "Pending";
  
  const buyingPrice = parseFloat(formData.get("buyingPrice") as string);
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const profit = sellingPrice - buyingPrice;

  const start = new Date(startDate);
  const expiry = new Date(start);
  expiry.setMonth(start.getMonth() + months);

  const order = await prisma.order.findUnique({ where: { id } });
  if (order) {
    await prisma.customer.update({
      where: { id: order.customerId },
      data: { name: customerName, email, phone }
    });

    await prisma.order.update({
      where: { id },
      data: {
        resellerId: (resellerId && !isNaN(parseInt(resellerId))) ? parseInt(resellerId) : null,
        subscriptionType,
        months,
        startDate: start,
        expiryDate: expiry,
        buyingPrice,
        sellingPrice,
        profit,
        status: orderStatus,
        renewalStatus: renewalStatus,
      }
    });
  }

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true };
}

export async function updateOrderStatus(id: number, status: string) {
  await prisma.order.update({
    where: { id },
    data: { status }
  });
  
  revalidatePath("/orders");
  revalidatePath("/customers");
  revalidatePath("/");
  return { success: true };
}

export async function updateRenewalStatus(id: number, renewalStatus: string) {
  await prisma.order.update({
    where: { id },
    data: { renewalStatus }
  });
  
  revalidatePath("/renewals");
  revalidatePath("/orders");
  revalidatePath("/customers");
  return { success: true };
}
