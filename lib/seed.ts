import { Customer, Order, Channel } from "./types";

const firstNames = ["Aanya", "Rohan", "Priya", "Arjun", "Meera", "Vikram", "Shruti", "Karthik", "Nisha", "Siddharth", "Divya", "Rahul", "Pooja", "Aditya", "Kavya", "Nikhil", "Sneha", "Ravi", "Ananya", "Pranav", "Sakshi", "Varun", "Isha", "Deepak", "Tanvi"];
const lastNames = ["Sharma", "Patel", "Iyer", "Reddy", "Singh", "Kumar", "Gupta", "Mehta", "Joshi", "Nair", "Rao", "Shah", "Verma", "Mishra", "Pillai", "Malhotra", "Bose", "Chatterjee", "Sinha", "Mukherjee"];
const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Surat"];
const productNames = ["Linen Shirt", "Silk Kurta", "Denim Jacket", "Palazzo Set", "Cotton Saree", "Formal Blazer", "Printed Tee", "Ethnic Dupatta", "Track Pants", "Embroidered Top", "Maxi Dress", "Cargo Shorts"];
const tags = ["loyal", "at-risk", "new", "high-value", "repeat-buyer", "seasonal"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrder(daysAgo: number): Order {
  const itemCount = randomInt(1, 3);
  const items = Array.from({ length: itemCount }, () => randomFrom(productNames));
  const amount = items.length * randomInt(800, 3500);
  return {
    id: `ord_${Math.random().toString(36).slice(2, 9)}`,
    date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    amount,
    items,
  };
}

export function generateCustomers(count: number): Customer[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    const name = `${firstName} ${lastName}`;
    const orderCount = randomInt(0, 8);
    const orders: Order[] = [];

    for (let j = 0; j < orderCount; j++) {
      orders.push(generateOrder(randomInt(j * 20, j * 20 + 60)));
    }

    // Sort orders by date desc
    orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalSpend = orders.reduce((sum, o) => sum + o.amount, 0);

    const channelOptions: Channel[] = ["whatsapp", "sms", "email", "rcs"];
    const channelCount = randomInt(1, 3);
    const channels: Channel[] = [];
    const shuffled = [...channelOptions].sort(() => Math.random() - 0.5);
    for (let k = 0; k < channelCount; k++) channels.push(shuffled[k]);

    const customerTags: string[] = [];
    if (totalSpend > 5000) customerTags.push("high-value");
    if (orderCount >= 3) customerTags.push("loyal");
    if (orderCount === 1) customerTags.push("new");
    if (orderCount === 0) customerTags.push("at-risk");
    if (Math.random() > 0.7) customerTags.push(randomFrom(["seasonal", "repeat-buyer"]));

    return {
      id: `cust_${i.toString().padStart(4, "0")}`,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(10, 99)}@email.com`,
      phone: `+91 ${randomInt(70000, 99999)} ${randomInt(10000, 99999)}`,
      city: randomFrom(cities),
      channels,
      totalSpend,
      orders,
      tags: customerTags,
      joinedAt: new Date(Date.now() - randomInt(30, 730) * 86400000).toISOString(),
    };
  });
}
