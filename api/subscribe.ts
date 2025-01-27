import { NextApiRequest, NextApiResponse } from "next";
import client from "./lib/mongodb";

export async function subscribe(req: NextApiRequest, res: NextApiResponse) {
  const allowedDomain = `https://api.${domains[0]}`;

  if (req.headers.origin !== allowedDomain) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const db = (await client).db("nextjs-sst-db");
    const collection = db.collection("subscribers");
    const existing = await collection.findOne({ email });

    if (existing) {
      return res.status(200).json({ message: "Email already subscribed" });
    }

    await collection.insertOne({ email, subscribedAt: new Date() });
    return res.status(201).json({ message: "Subscription successful" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
