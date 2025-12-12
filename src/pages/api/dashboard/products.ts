import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true }
    });

    return res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products", err);
    return res.status(500).json({ error: "Error fetching products" });
  }
}
