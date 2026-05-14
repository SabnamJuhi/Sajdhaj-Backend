const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendResetPasswordEmail = async (email, resetLink) => {
  await transporter.sendMail({
    from: `"SajDhaj Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <p>Click below link to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 15 minutes.</p>
    `,
  });
};

/* ================= DELIVERY ASSIGNMENT EMAIL ================= */
exports.sendDeliveryAssignmentEmail = async ({
  to,
  orderNumber,
  customerName,
  phone,
  address,
  verificationLink,
  codPaymentLink = null,
  isCOD = false,
}) => {
  await transporter.sendMail({
    from: `"Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: "New Delivery Assigned",
    html: `
      <h2>New Order Assigned</h2>

      <p><b>Order Number:</b> ${orderNumber}</p>
      <p><b>Customer Name:</b> ${customerName}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Address:</b> ${address}</p>

      <br/>

      <a href="${verificationLink}"
         style="padding:10px 18px;background:#28a745;color:#fff;
                text-decoration:none;border-radius:6px;">
        Verify Delivery OTP
      </a>

      <p style="margin-top:15px;">
        Open this link after delivering the parcel to verify OTP.
      </p>
      ${
        isCOD && codPaymentLink
          ? `
              <p><b>After collecting cash from customer:</b></p>
              <a href="${codPaymentLink}"
                style="display:inline-block;padding:10px 18px;background:#16a34a;color:#fff;
                text-decoration:none;border-radius:6px;font-weight:bold;margin-top:10px;">
                Confirm COD Payment
              </a>
            `
          : ""
      }

    `,
  });
};

// send mail to company
exports.sendContactToCompany = async ({ name, email, phone, message }) => {
  return transporter.sendMail({
    from: `"Website Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // company email
    subject: "New Contact Enquiry",
    html: `
      <h2>New Enquiry Received</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Message:</b><br/> ${message}</p>
    `,
  });
};

// auto reply to customer
exports.sendAutoReplyToCustomer = async ({ name, email }) => {
  return transporter.sendMail({
    from: `"ScrewKart Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "We received your enquiry",
    html: `
      <p>Hi ${name},</p>
      <p>Thank you for contacting ScrewKart.  
      Our team will get back to you shortly.</p>

      <p>Regards,<br/>ScrewKart Team</p>
    `,
  });
};






exports.sendInvoiceEmail = async (
  emails,
  order,
  items,
  address,
  invoicePath
) => {
  try {

    const productList = items
      .map(
        (item) =>
          `<li>${item.productName} (Qty: ${item.quantity}) - ₹${item.finalPrice}</li>`
      )
      .join("");

    const info = await transporter.sendMail({
      from: `"Sajdhaj Store" <${process.env.EMAIL_USER}>`,
      to: emails,

      subject: `✅ Order Confirmed - ${order.orderNumber}`,
html: `
<div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">

  <table align="center" width="600" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

    <!-- Header -->
    <tr>
      <td style="background:#111; color:#fff; padding:20px; text-align:center;">
        <h1 style="margin:0; font-size:22px;">Sajdhaj</h1>
        <p style="margin:5px 0 0;">Order Confirmation</p>
      </td>
    </tr>

    <!-- Greeting -->
    <tr>
      <td style="padding:20px;">
        <p style="font-size:16px;">Hello <b>${address.fullName}</b>,</p>
        <p>Your order <b>${order.orderNumber}</b> has been placed successfully 🎉</p>
      </td>
    </tr>

    <!-- Order Summary -->
    <tr>
      <td style="padding:0 20px 20px 20px;">
        <h3 style="border-bottom:1px solid #eee; padding-bottom:8px;">Order Summary</h3>

        <table width="100%" style="border-collapse:collapse; font-size:14px;">
          <thead>
            <tr style="background:#f3f3f3;">
              <th align="left" style="padding:8px; border-bottom:1px solid #ddd;">Product</th>
              <th align="center" style="padding:8px; border-bottom:1px solid #ddd;">Qty</th>
              <th align="right" style="padding:8px; border-bottom:1px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
                <tr>
                  <td style="padding:8px; border-bottom:1px solid #eee;">
                    ${item.productName}
                  </td>
                  <td align="center" style="padding:8px; border-bottom:1px solid #eee;">
                    ${item.quantity}
                  </td>
                  <td align="right" style="padding:8px; border-bottom:1px solid #eee;">
                    ₹${item.finalAmount}
                  </td>
                </tr>
              `,
              )
              .join("")}
          </tbody>
        </table>

      </td>
    </tr>

    <!-- Pricing -->
    <tr>
      <td style="padding:0 20px 20px 20px;">
        <table width="100%" style="font-size:14px;">
          <tr>
            <td>Subtotal</td>
            <td align="right">₹${order.subtotal}</td>
          </tr>
          <tr>
            <td>Coupon Discount</td>
            <td align="right"> - ₹${order.couponDiscount}</td>
          </tr>
          <tr>
            <td>Shipping</td>
            <td align="right"> + ₹${order.shippingFee}</td>
          </tr>
          <tr>
            <td style="font-weight:bold; padding-top:10px;">Total</td>
            <td align="right" style="font-weight:bold; padding-top:10px;">
              ₹${order.totalAmount}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Shipping Address -->
    <tr>
      <td style="padding:0 20px 20px 20px;">
        <h3 style="border-bottom:1px solid #eee; padding-bottom:8px;">Shipping Address</h3>
        <p style="font-size:14px; line-height:1.6;">
          ${address.fullName}<br/>
          ${address.addressLine}<br/>
          ${address.city}, ${address.state} - ${address.zipCode}<br/>
          Phone: ${address.phoneNumber}
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f3f3f3; text-align:center; padding:15px; font-size:12px; color:#777;">
        <p style="margin:0;">Your invoice is attached with this email.</p>
        <p style="margin:5px 0 0;">© ${new Date().getFullYear()} Sajdhaj</p>
      </td>
    </tr>

  </table>

</div>
`,

      attachments: [
        {
          filename: `invoice-${order.orderNumber}.pdf`,
          path: invoicePath,
        },
      ],
    });

    console.log("Email sent:", info.response);

  } catch (error) {
    console.error("Email error:", error);
  }
};