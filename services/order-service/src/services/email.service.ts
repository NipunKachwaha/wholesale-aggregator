import nodemailer from "nodemailer";

// ── Transporter banao
const createTransporter = () => {
  // Development mein Ethereal (fake SMTP) use karo
  if (process.env.NODE_ENV !== "production") {
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "ethereal_user",
        pass: process.env.EMAIL_PASS || "ethereal_pass",
      },
    });
  }

  // Production mein real SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

// ── Email templates
const templates = {
  orderCreated: (order: any) => ({
    subject: `✅ Order Confirm — #${order.id?.slice(0, 8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🏪 Wholesale Aggregator</h1>
        </div>
        <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b;">✅ Naya Order Create Hua!</h2>
          <p style="color: #64748b;">Order ID: <strong>${order.id?.slice(0, 8)}</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background: #e2e8f0;">
              <th style="padding: 8px; text-align: left; font-size: 12px; color: #475569;">SKU</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; color: #475569;">Qty</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; color: #475569;">Price</th>
            </tr>
            ${(Array.isArray(order.line_items)
              ? order.line_items
              : JSON.parse(order.line_items || "[]")
            )
              .map(
                (item: any) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; font-size: 13px;">${item.sku}</td>
                <td style="padding: 8px; text-align: right; font-size: 13px;">×${item.quantity}</td>
                <td style="padding: 8px; text-align: right; font-size: 13px;">₹${item.total?.toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
            <tr style="background: #eff6ff;">
              <td colspan="2" style="padding: 8px; font-weight: bold; color: #1e40af;">Total</td>
              <td style="padding: 8px; text-align: right; font-weight: bold; color: #1e40af;">
                ₹${Number(order.total_amount).toFixed(2)}
              </td>
            </tr>
          </table>
          <p style="color: #64748b; font-size: 12px; margin-top: 16px;">
            Status: <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 999px;">
              ${order.status}
            </span>
          </p>
        </div>
      </div>
    `,
  }),

  orderStatusChanged: (order: any, newStatus: string) => ({
    subject: `📦 Order Update — #${order.id?.slice(0, 8)} → ${newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">🏪 Wholesale Aggregator</h1>
        </div>
        <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b;">📦 Order Status Update</h2>
          <p style="color: #64748b;">
            Order <strong>#${order.id?.slice(0, 8)}</strong> ka status update hua:
          </p>
          <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 16px 0; border: 1px solid #e2e8f0;">
            <span style="font-size: 14px; color: #64748b;">${order.status}</span>
            <span style="font-size: 20px; margin: 0 12px;">→</span>
            <span style="font-size: 14px; font-weight: bold; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 999px;">
              ${newStatus}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px;">
            Total Amount: <strong>₹${Number(order.total_amount).toFixed(2)}</strong>
          </p>
        </div>
      </div>
    `,
  }),

  consolidationComplete: (result: any) => ({
    subject: `🔀 Orders Consolidated — ₹${result.saving} Saved!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">🏪 Wholesale Aggregator</h1>
        </div>
        <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b;">🔀 Order Consolidation Complete!</h2>
          <div style="background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: #166534; font-weight: bold; margin: 0; font-size: 18px;">
              💰 ₹${result.saving} bachaya!
            </p>
            <p style="color: #166534; margin: 4px 0 0; font-size: 13px;">
              ${result.cancelledOrders?.length} orders merge hokar ek order ban gaya
            </p>
          </div>
          <p style="color: #64748b; font-size: 13px;">
            New Order ID: <strong>#${result.consolidatedOrder?.id?.slice(0, 8)}</strong>
          </p>
          <p style="color: #64748b; font-size: 13px;">
            Final Total: <strong>₹${Number(result.consolidatedOrder?.total_amount).toFixed(2)}</strong>
          </p>
        </div>
      </div>
    `,
  }),
};

// ── Email bhejo
export const sendEmail = async (
  to: string,
  template: "orderCreated" | "orderStatusChanged" | "consolidationComplete",
  data: any,
  extra?: any,
): Promise<boolean> => {
  try {
    const { subject, html } = templates[template](data, extra);

    const info = await transporter.sendMail({
      from: `"Wholesale Aggregator" <${process.env.EMAIL_FROM || "noreply@wholesale.dev"}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent: ${info.messageId}`);

    // Development mein preview URL print karo
    if (process.env.NODE_ENV !== "production") {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📧 Preview: ${previewUrl}`);
      }
    }

    return true;
  } catch (error: any) {
    console.error("❌ Email send failed:", error.message);
    return false;
  }
};

// ── Ethereal test account banao (development)
export const createTestAccount = async (): Promise<void> => {
  try {
    const account = await nodemailer.createTestAccount();
    console.log("📧 Ethereal test account:");
    console.log(`   User: ${account.user}`);
    console.log(`   Pass: ${account.pass}`);
    console.log(`   Preview: https://ethereal.email`);
  } catch {
    // Ignore
  }
};
