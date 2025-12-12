import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { date, status, productId } = req.query;

  let where: any = {};

  // Detectar si se filtra por producto
  const filteringByProduct = productId && productId !== "";

  // FILTRO DE ESTADO
  if (status && status !== "") {
    where.status = status;
  }

  // FILTRO DE FECHA (día exacto)
  if (date) {
    const selected = new Date(date as string);
    const nextDay = new Date(selected);
    nextDay.setDate(nextDay.getDate() + 1);

    where.createdAt = {
      gte: selected,
      lt: nextDay
    };
  }

  // FILTRO DE PRODUCTO
  if (filteringByProduct) {
    where.orderItems = {
      some: {
        productId: Number(productId)
      }
    };
  }

  // CONSULTA PRINCIPAL
  const orders = await prisma.order.findMany({
    where,
    include: {
      orderItems: { include: { product: true } },
      user: true
    }
  });

  /* ----------------------------- MÉTRICAS CORREGIDAS ----------------------------- */

  // TOTAL DE PEDIDOS (si filtra producto -> solo contar pedidos que lo incluyen)
  const totalOrders = filteringByProduct
    ? orders.filter(o =>
        o.orderItems.some(i => i.productId === Number(productId))
      ).length
    : orders.length;

  // TOTAL DE GANANCIA (si filtra producto -> sumar solo items del producto)
  const totalRevenue = filteringByProduct
    ? orders.reduce((sum, o) => {
        const filteredItems = o.orderItems.filter(
          i => i.productId === Number(productId)
        );
        return sum + filteredItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
      }, 0)
    : orders.reduce(
        (sum, o) =>
          sum +
          o.orderItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
        0
      );

  // PROMEDIO POR PEDIDO
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  // ESTADOS
  const pending = orders.filter(o => o.status === "pending").length;
  const completed = orders.filter(o => o.status === "completed").length;
  const cancelled = orders.filter(o => o.status === "cancelled").length;
  const processing = orders.filter(o => o.status === "processing").length;

  /* ----------------------------- AGRUPACIÓN POR DÍA ----------------------------- */

  const ordersPerDayObj: any = {};
  const revenuePerDayObj: any = {};

  orders.forEach(o => {
    const day = o.createdAt.toISOString().split("T")[0];

    if (!ordersPerDayObj[day]) ordersPerDayObj[day] = { date: day, count: 0 };
    ordersPerDayObj[day].count++;

    const items = filteringByProduct
      ? o.orderItems.filter(i => i.productId === Number(productId))
      : o.orderItems;

    const total = items.reduce(
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

  /* ----------------------------- TOP PRODUCTOS ----------------------------- */

  const productMap: any = {};

  orders.forEach(o => {
    o.orderItems
      .filter(i => !filteringByProduct || i.productId === Number(productId))
      .forEach(i => {
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

  /* ----------------------------- RESPUESTA ----------------------------- */

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
