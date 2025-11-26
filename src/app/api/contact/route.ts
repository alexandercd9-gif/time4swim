import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validaciones básicas
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Verificar que existe el API key
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY no está configurado');
      return NextResponse.json(
        { error: 'Configuración de email no disponible' },
        { status: 500 }
      );
    }

    // Enviar email usando Resend
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Email de testing de Resend
      to: ['acasaverde@compuimpact.pe'], // Tu email destino
      replyTo: email, // Email del usuario para responder
      subject: `Nuevo mensaje de contacto - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nuevo mensaje de contacto</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Este mensaje fue enviado desde el formulario de contacto de Time4Swim.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error completo de Resend:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `Error al enviar: ${error.message || 'Intenta más tarde'}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Mensaje enviado exitosamente', id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en API de contacto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
