import fs from "node:fs";

const files = [
  "src/features/customer/pages/CustomerOrderPage.jsx",
  "src/features/customer/components/CustomerPublicShell.jsx",
  "src/features/customer/components/CustomerMenuCard.jsx",
  "src/features/customer/components/CustomerCartPanel.jsx",
  "src/features/customer/components/CustomerOrderTracker.jsx",
  "src/features/customer/components/CustomerDigitalReceipt.jsx",
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} must exist`);
  }
}

const page = fs.readFileSync(files[0], "utf8");
const shell = fs.readFileSync(files[1], "utf8");
const menuCard = fs.readFileSync(files[2], "utf8");
const cart = fs.readFileSync(files[3], "utf8");
const tracker = fs.readFileSync(files[4], "utf8");
const receipt = fs.readFileSync(files[5], "utf8");

for (const text of [
  "Mulai Pesan Sekarang",
  "Siapa nama pemesannya?",
  "Menu Digital",
  "Mau makan apa",
  "max-w-[480px]",
  "grid gap-5 px-5 py-6 pb-40",
  "z-[90]",
  "z-[80]",
  "pb-[max(1rem,env(safe-area-inset-bottom))]",
  "fixed bottom-0 left-1/2",
  "pointer-events-auto flex w-full items-center",
]) {
  if (!page.includes(text)) {
    throw new Error(`CustomerOrderPage.jsx must include "${text}"`);
  }
}

for (const text of [
  "sm:max-w-[480px]",
  "lg:rounded-[2rem]",
  "CUSTOMER_LOGO_SRC",
  "/assets/auth/kedai-logo-abu.png",
  "h-[92px] w-[92px]",
  "scale-[1.18]",
  "Logo Kedai Nusantara",
  "Sistem Resto Nusantara",
  "bg-[linear-gradient(135deg,#075eea_0%,#064fd1_58%,#0b63e5_100%)]",
]) {
  if (!shell.includes(text)) {
    throw new Error(`CustomerPublicShell.jsx must include "${text}"`);
  }
}

for (const forbidden of [
  "import { Menu",
  "<Menu",
  "aria-label=\"Menu\"",
  "Cita Rasa Indonesia",
  "sidebar-login-logo-owner.png",
]) {
  if (shell.includes(forbidden)) {
    throw new Error(`CustomerPublicShell.jsx should not include unused hamburger/old branding pattern "${forbidden}"`);
  }
}

for (const text of [
  "grid-cols-[104px_minmax(0,1fr)]",
  "Tersedia",
  "Tambah",
  "hover:-translate-y-0.5",
]) {
  if (!menuCard.includes(text)) {
    throw new Error(`CustomerMenuCard.jsx must include "${text}"`);
  }
}

for (const text of [
  "Belum ada menu dipilih",
  "Kirim Pesanan",
  "Pesanan akan masuk ke dashboard kasir",
]) {
  if (!cart.includes(text)) {
    throw new Error(`CustomerCartPanel.jsx must include "${text}"`);
  }
}

for (const text of [
  "Progress Pesanan",
  "Tracking Pesanan",
  "Buat Pesanan Baru",
  "CustomerDigitalReceipt",
]) {
  if (!tracker.includes(text)) {
    throw new Error(`CustomerOrderTracker.jsx must include "${text}"`);
  }
}

for (const text of [
  "Pembayaran Berhasil",
  "Struk Digital Tersedia",
  "ReceiptPreview",
]) {
  if (!receipt.includes(text)) {
    throw new Error(`CustomerDigitalReceipt.jsx must include "${text}"`);
  }
}

const combinedCustomerUi = [page, shell, menuCard, cart, tracker, receipt].join("\n");

for (const forbidden of [
  "#0ea5e9_100%",
  "#ecfeff_100%",
  "lg:grid-cols-[minmax(0,1fr)_420px]",
  "xl:grid-cols-[minmax(0,1fr)_390px]",
  "hidden xl:block",
]) {
  if (combinedCustomerUi.includes(forbidden)) {
    throw new Error(`Customer UI should not use old/non-reference pattern "${forbidden}"`);
  }
}

console.log("Customer UI polish check passed.");
