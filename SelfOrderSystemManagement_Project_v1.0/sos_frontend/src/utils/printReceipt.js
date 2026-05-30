export const printReceipt = (order) => {
  const win = window.open('', '', 'height=700,width=420');
  win.document.write(`
    <!DOCTYPE html><html><head><title>Struk</title>
    <style>
      body { font-family: 'Courier New', monospace; padding: 20px; font-size: 13px; }
      h2   { text-align: center; margin: 0 0 4px; }
      .sub { text-align: center; color: #555; font-size: 11px; margin-bottom: 12px; }
      .line { border-top: 1px dashed #000; margin: 10px 0; }
      .row  { display: flex; justify-content: space-between; margin: 4px 0; }
      .bold { font-weight: bold; }
      .total { font-size: 15px; font-weight: bold; }
      .center { text-align: center; }
    </style></head><body>
    <h2>Kedai Nusantara</h2>
    <div class="sub">Sistem Kasir Resto Nusantara</div>
    <div class="line"></div>
    <div class="row"><span>No. Pesanan:</span><span class="bold">${order.orderId}</span></div>
    <div class="row"><span>Meja:</span><span class="bold">${order.tableNumber}</span></div>
    <div class="row"><span>Waktu:</span><span>${new Date(order.timestamp).toLocaleString('id-ID')}</span></div>
    <div class="line"></div>
    ${order.items
      .map(
        (i) => `
      <div class="row"><span>${i.name}</span></div>
      <div class="row">
        <span>&nbsp;&nbsp;${i.quantity} x Rp ${i.price.toLocaleString('id-ID')}</span>
        <span>Rp ${(i.price * i.quantity).toLocaleString('id-ID')}</span>
      </div>`
      )
      .join('')}
    <div class="line"></div>
    <div class="row"><span>Subtotal</span><span>Rp ${(order.subtotal ?? order.totalPrice).toLocaleString('id-ID')}</span></div>
    <div class="row"><span>Pajak (10%)</span><span>Rp ${(order.tax ?? 0).toLocaleString('id-ID')}</span></div>
    <div class="row"><span>Service (2.5%)</span><span>Rp ${(order.serviceCharge ?? 0).toLocaleString('id-ID')}</span></div>
    <div class="line"></div>
    <div class="row total"><span>TOTAL TAGIHAN</span><span>Rp ${order.totalPrice.toLocaleString('id-ID')}</span></div>
    ${
      order.paymentMethod === 'cash'
        ? `<div class="row"><span>Tunai</span><span>Rp ${(order.cashPaid ?? 0).toLocaleString('id-ID')}</span></div>
           <div class="row bold"><span>Kembalian</span><span>Rp ${(order.change ?? 0).toLocaleString('id-ID')}</span></div>`
        : `<div class="row"><span>Metode</span><span>${order.paymentMethod?.toUpperCase()}</span></div>`
    }
    <div class="line"></div>
    <div class="center" style="margin-top:16px;font-size:12px;">Terima kasih telah berkunjung!</div>
    <div class="center" style="font-size:11px;color:#555;">Simpan struk ini sebagai bukti pembayaran</div>
    </body></html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 300);
};