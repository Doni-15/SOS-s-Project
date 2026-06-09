import { prisma } from "../src/config/prisma.js";

const defaultCategories = [
  {
    name: "Makanan",
    description: "Menu makanan utama untuk pelanggan.",
    displayOrder: 1,
  },
  {
    name: "Minuman",
    description: "Pilihan minuman dingin dan hangat.",
    displayOrder: 2,
  },
  {
    name: "Cemilan",
    description: "Menu ringan sebagai pelengkap pesanan.",
    displayOrder: 3,
  },
  {
    name: "Paket Hemat",
    description: "Paket kombinasi makanan dan minuman.",
    displayOrder: 4,
  },
];

const defaultMenuItems = [
  {
    categoryName: "Makanan",
    name: "Nasi Goreng Spesial",
    description: "Nasi goreng dengan telur, ayam suwir, dan kerupuk.",
    price: "18000",
    displayOrder: 1,
  },
  {
    categoryName: "Makanan",
    name: "Mie Goreng",
    description: "Mie goreng gurih dengan sayuran dan telur.",
    price: "16000",
    displayOrder: 2,
  },
  {
    categoryName: "Makanan",
    name: "Ayam Geprek",
    description: "Ayam crispy geprek dengan sambal pedas.",
    price: "20000",
    displayOrder: 3,
  },
  {
    categoryName: "Makanan",
    name: "Soto Ayam",
    description: "Soto ayam hangat dengan kuah gurih.",
    price: "17000",
    displayOrder: 4,
  },
  {
    categoryName: "Minuman",
    name: "Es Teh Manis",
    description: "Teh manis dingin segar.",
    price: "5000",
    displayOrder: 1,
  },
  {
    categoryName: "Minuman",
    name: "Es Jeruk",
    description: "Jeruk peras dingin segar.",
    price: "7000",
    displayOrder: 2,
  },
  {
    categoryName: "Minuman",
    name: "Kopi Susu",
    description: "Kopi susu manis dengan rasa ringan.",
    price: "12000",
    displayOrder: 3,
  },
  {
    categoryName: "Minuman",
    name: "Air Mineral",
    description: "Air mineral botol.",
    price: "4000",
    displayOrder: 4,
  },
  {
    categoryName: "Cemilan",
    name: "Kentang Goreng",
    description: "Kentang goreng renyah dengan saus.",
    price: "12000",
    displayOrder: 1,
  },
  {
    categoryName: "Cemilan",
    name: "Pisang Goreng",
    description: "Pisang goreng hangat dan manis.",
    price: "10000",
    displayOrder: 2,
  },
  {
    categoryName: "Cemilan",
    name: "Roti Bakar",
    description: "Roti bakar dengan pilihan rasa manis.",
    price: "13000",
    displayOrder: 3,
  },
  {
    categoryName: "Paket Hemat",
    name: "Paket Ayam Geprek + Es Teh",
    description: "Ayam geprek, nasi, dan es teh manis.",
    price: "24000",
    displayOrder: 1,
  },
  {
    categoryName: "Paket Hemat",
    name: "Paket Nasi Goreng + Es Teh",
    description: "Nasi goreng spesial dan es teh manis.",
    price: "22000",
    displayOrder: 2,
  },
];

const categoryByName = new Map();

try {
  console.log("Seeding default menu categories...");

  for (const category of defaultCategories) {
    const savedCategory = await prisma.menuCategory.upsert({
      where: {
        name: category.name,
      },
      update: {
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: true,
      },
      create: {
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: true,
      },
    });

    categoryByName.set(savedCategory.name, savedCategory);
    console.log(`OK category: ${savedCategory.name}`);
  }

  console.log("");
  console.log("Seeding default menu items...");

  for (const item of defaultMenuItems) {
    const category = categoryByName.get(item.categoryName);

    if (!category) {
      throw new Error(`Missing category for menu item: ${item.name}`);
    }

    const existingItem = await prisma.menuItem.findFirst({
      where: {
        name: {
          equals: item.name,
          mode: "insensitive",
        },
        categoryId: category.id,
      },
    });

    const data = {
      categoryId: category.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: null,
      availabilityStatus: "AVAILABLE",
      isActive: true,
      displayOrder: item.displayOrder,
    };

    const savedItem = existingItem
      ? await prisma.menuItem.update({
          where: {
            id: existingItem.id,
          },
          data,
        })
      : await prisma.menuItem.create({
          data,
        });

    console.log(`OK menu: ${item.categoryName} / ${savedItem.name}`);
  }

  const categoryCount = await prisma.menuCategory.count({
    where: { isActive: true },
  });

  const menuItemCount = await prisma.menuItem.count({
    where: { isActive: true },
  });

  console.log("");
  console.log("Default menu seed completed.");
  console.log(`Active categories: ${categoryCount}`);
  console.log(`Active menu items : ${menuItemCount}`);
} catch (error) {
  console.error("Default menu seed failed.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect().catch(() => {});
}
