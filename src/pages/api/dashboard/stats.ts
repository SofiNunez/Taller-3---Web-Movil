import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { date, status } = req.query;

  let where: any = {};

  // === FILTRO DE ESTADO ===
  if (status && status !== "") {
    where.status = status;
  }

  // === FILTRO DE FECHA EXACTA (día completo) ===
  if (date) {
    const selected = new Date(date as string);

    const nextDay = new Date(selected);
    nextDay.setDate(nextDay.getDate() + 1);

    where.createdAt = {
      gte: selected,
      lt: nextDay
    };
  }

  // === QUERY PRINCIPAL ===
  const orders = await prisma.order.findMany({
    where,
    include: {
      orderItems: { include: { product: true } },
      user: true
    }
  });

  // === MÉTRICAS ===
  const totalOrders = orders.length;

  const totalRevenue = orders.reduce(
    (sum, o) =>
      sum + o.orderItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
    0
  );

  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  // === ESTADOS ===
  const pending = orders.filter(o => o.status === "pending").length;
  const completed = orders.filter(o => o.status === "completed").length;
  const cancelled = orders.filter(o => o.status === "cancelled").length;
  const processing = orders.filter(o => o.status === "processing").length;

  // === AGRUPACIÓN POR DÍA ===
  const ordersPerDayObj: any = {};
  const revenuePerDayObj: any = {};

  orders.forEach(o => {
    const day = o.createdAt.toISOString().split("T")[0];

    if (!ordersPerDayObj[day]) ordersPerDayObj[day] = { date: day, count: 0 };
    ordersPerDayObj[day].count++;

    const total = o.orderItems.reduce(
      (s, i) => s + Number(i.price) * i.quantity,
      0
    );

    if (!revenuePerDayObj[day]) revenuePerDayObj[day] = { date: day, revenue: 0 };
    revenuePerDayObj[day].revenue += total;
  });

  const ordersPerDay = Object.values(ordersPerDayObj);
  const revenuePerDay = Object.values(revenuePerDayObj);

  const avgPerDay = revenuePerDay.map((r: any) => ({
    date: r.date,
    avg: ordersPerDayObj[r.date]
      ? r.revenue / ordersPerDayObj[r.date].count
      : 0
  }));

  // === TOP PRODUCTOS ===
  const productMap: any = {};

  orders.forEach(o => {
    o.orderItems.forEach(i => {
      if (!productMap[i.productId]) {
        productMap[i.productId] = {
          productId: i.productId,
          name: i.product.name,
          qty: 0,
          revenue: 0
        };
      }
      productMap[i.productId].qty += i.quantity;
      productMap[i.productId].revenue += Number(i.price) * i.quantity;
    });
  });

  const topProducts = Object.values(productMap).sort((a: any, b: any) => b.qty - a.qty);

  return res.status(200).json({
    totalOrders,
    totalRevenue,
    avgOrderValue,
    pending,
    completed,
    cancelled,
    processing,
    ordersPerDay,
    revenuePerDay,
    avgPerDay,
    topProducts
  });
}
