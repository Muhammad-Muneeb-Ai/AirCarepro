import { Resend } from 'resend';

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, email, phone, service, message } = JSON.parse(event.body);

  try {
    const data = await resend.emails.send({
      from: 'AirCare Pro <notifications@resend.dev>', // You should verify your domain in Resend
      to: ['tradingfriends56@gmail.com'],
      subject: `New Lead: ${name} - ${service}`,
      html: `
        <h1>New Lead Details</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to send email' }),
    };
  }
};
