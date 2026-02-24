import { Resend } from 'resend';


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

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: 'FairBid <platform@updates.fairbid.com>', // Note: Needs verified domain in production
            to: [email],
            subject: `Recibo de Servicio: ${serviceType} - ${invoiceId}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #111; padding: 40px; border-radius: 20px; background: #050505; color: #fff;">
                    <h2 style="color: #C6FF00; margin-bottom: 24px;">FairBid</h2>
                    <p>Hola <strong>${customerName}</strong>,</p>
                    <p>El técnico ha finalizado el servicio de <strong>${serviceType}</strong> exitosamente y el pago fue procesado.</p>
                    
                    <div style="background: #121212; padding: 20px; border-radius: 12px; margin: 30px 0; border: 1px solid #333;">
                        <table style="width: 100%; color: #fff;">
                            <tr>
                                <td style="color: #A0A0A0; padding-bottom: 10px;">ID Transacción:</td>
                                <td style="text-align: right; font-weight: bold; padding-bottom: 10px;">${invoiceId}</td>
                            </tr>
                            <tr>
                                <td style="color: #A0A0A0; border-top: 1px solid #333; padding-top: 10px;">Monto Acordado (Oferta):</td>
                                <td style="text-align: right; font-weight: bold; color: #C6FF00; border-top: 1px solid #333; padding-top: 10px; font-size: 18px;">$${amount.toLocaleString()} COP</td>
                            </tr>
                        </table>
                    </div>

                    <p style="font-size: 12px; color: #A0A0A0; line-height: 1.5;">
                        Este cargo fue procesado de forma segura al completarse el servicio según la oferta aceptada en la plataforma.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
                    <p style="text-align: center; color: #C6FF00; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                        The Bid-First Services Network
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
