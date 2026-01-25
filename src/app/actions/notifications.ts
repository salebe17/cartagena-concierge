import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail({
    email,
    customerName,
    invoiceId,
    amount,
    serviceType
}: {
    email: string;
    customerName: string;
    invoiceId: string;
    amount: number;
    serviceType: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY missing. Skipping email.");
        return { success: false, error: "Email provider not configured" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Cartagena Concierge <billing@updates.cartagenaconcierge.com>', // Note: Needs verified domain in production
            to: [email],
            subject: `Recibo de Servicio: ${serviceType} - ${invoiceId}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 20px;">
                    <h2 style="color: #FF5A5F;">Cartagena Concierge</h2>
                    <p>Hola <strong>${customerName}</strong>,</p>
                    <p>Se ha procesado un pago exitoso por el servicio de <strong>${serviceType}</strong>.</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <table style="width: 100%;">
                            <tr>
                                <td style="color: #666;">Factura ID:</td>
                                <td style="text-align: right; font-weight: bold;">${invoiceId}</td>
                            </tr>
                            <tr>
                                <td style="color: #666;">Monto:</td>
                                <td style="text-align: right; font-weight: bold; color: #10b981;">$${amount.toLocaleString()} COP</td>
                            </tr>
                        </table>
                    </div>

                    <p style="font-size: 12px; color: #999;">
                        Este cargo se realizó automáticamente a tu método de pago registrado en Stripe tras la finalización del servicio por parte de nuestro equipo.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="text-align: center; color: #FF5A5F; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                        Excellence in Property Management
                    </p>
                </div>
            `,
        });

        if (error) throw error;
        return { success: true, data };
    } catch (e: any) {
        console.error("Email Error:", e);
        return { success: false, error: e.message };
    }
}
