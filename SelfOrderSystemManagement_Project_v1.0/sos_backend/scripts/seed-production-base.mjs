import { prisma } from "../src/config/prisma.js";
import { hashPassword } from "../src/common/utils/password.js";

const users = [
  {
    username: "owner",
    password: "Owner@12345",
    fullName: "Owner Kedai",
    phone: "080000000001",
    role: "OWNER",
  },
  {
    username: "kasir",
    password: "Kasir@12345",
    fullName: "Kasir Kedai",
    phone: "080000000002",
    role: "CASHIER",
  },
];

const tables = Array.from({ length: 12 }, (_, index) => {
  const number = index + 1;

  return {
    tableNumber: String(number).padStart(2, "0"),
    label: `Meja ${number}`,
    isActive: true,
  };
});

const categories = [
  {
    name: "Makanan",
    description: "Menu makanan utama",
    displayOrder: 1,
    items: [
      ["Nasi Goreng Spesial", "Nasi goreng dengan telur, ayam, dan kerupuk.", 25000, 1],
      ["Mie Goreng Jawa", "Mie goreng bumbu khas dengan sayuran dan telur.", 23000, 2],
      ["Ayam Geprek", "Ayam crispy geprek sambal bawang.", 27000, 3],
      ["Soto Ayam", "Soto ayam hangat dengan nasi.", 22000, 4],
    ],
  },
  {
    name: "Minuman",
    description: "Minuman dingin dan hangat",
    displayOrder: 2,
    items: [
      ["Es Teh Manis", "Teh manis dingin segar.", 7000, 1],
      ["Es Jeruk", "Jeruk peras dingin.", 10000, 2],
      ["Kopi Susu", "Kopi susu gula aren.", 16000, 3],
      ["Air Mineral", "Air mineral botol.", 5000, 4],
    ],
  },
  {
    name: "Camilan",
    description: "Snack dan makanan ringan",
    displayOrder: 3,
    items: [
      ["Kentang Goreng", "Kentang goreng renyah.", 18000, 1],
      ["Pisang Goreng", "Pisang goreng hangat.", 15000, 2],
      ["Tahu Crispy", "Tahu crispy dengan saus.", 14000, 3],
    ],
  },
];

async function seedUsers() {
  for (const user of users) {
    const passwordHash = await hashPassword(user.password);

    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        passwordHash,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: true,
      },
      create: {
        username: user.username,
        passwordHash,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: true,
      },
    });
  }
}

async function seedTables() {
  for (const table of tables) {
    await prisma.diningTable.upsert({
      where: { tableNumber: table.tableNumber },
      update: {
        label: table.label,
        isActive: table.isActive,
      },
      create: table,
    });
  }
}

async function seedMenu() {
  for (const category of categories) {
    const createdCategory = await prisma.menuCategory.upsert({
      where: { name: category.name },
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

    for (const [name, description, price, displayOrder] of category.items) {
      const existing = await prisma.menuItem.findFirst({
        where: {
          name,
          categoryId: createdCategory.id,
        },
      });

      const data = {
        categoryId: createdCategory.id,
        name,
        description,
        price,
        imageUrl: null,
        availabilityStatus: "AVAILABLE",
        isActive: true,
        displayOrder,
      };

      if (existing) {
        await prisma.menuItem.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await prisma.menuItem.create({ data });
      }
    }
  }
}

async function printSummary() {
  const summary = {
    users: await prisma.user.count(),
    dining_tables: await prisma.diningTable.count(),
    menu_categories: await prisma.menuCategory.count(),
    menu_items: await prisma.menuItem.count(),
    qr_tokens: await prisma.qrToken.count(),
    orders: await prisma.order.count(),
    transactions: await prisma.transaction.count(),
  };

  console.table(summary);
  console.log("OWNER   username: owner | password: Owner@12345");
  console.log("CASHIER username: kasir | password: Kasir@12345");
}

async function main() {
  await seedUsers();
  await seedTables();
  await seedMenu();
  await printSummary();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
