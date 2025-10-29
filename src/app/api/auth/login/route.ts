
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

export async function POST(request: NextRequest) {
  let connection;
  try {
    // 1. Parsear body
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json({ error: 'Body inválido, debe ser JSON.' }, { status: 400 });
    }
    const { email, password } = body;

    // 2. Validar datos
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son obligatorios.' }, { status: 400 });
    }

    // 3. Conectar a la base de datos
    try {
      connection = await connectDB();
    } catch (dbErr) {
      return NextResponse.json({ error: 'Error de conexión a la base de datos.' }, { status: 500 });
    }

    // 4. Buscar usuario con consulta SQL directa
    let user;
    try {
      const [users] = await connection.execute('SELECT * FROM user WHERE email = ?', [email]);
      user = users[0];
    } catch (sqlErr) {
      return NextResponse.json({ error: 'Error al consultar usuario.' }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
    }

    // 5. Verificar contraseña
    let validPassword = false;
    try {
      validPassword = await bcrypt.compare(password, user.password);
    } catch (bcryptErr) {
      return NextResponse.json({ error: 'Error al verificar la contraseña.' }, { status: 500 });
    }
    if (!validPassword) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
    }

    // 6. Generar JWT
    let token;
    try {
      token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
    } catch (jwtErr) {
      return NextResponse.json({ error: 'Error al generar el token.' }, { status: 500 });
    }

    // 7. Preparar respuesta según estructura solicitada
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      token
    });

  } catch (error) {
    // Manejo de errores generales
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  } finally {
    if (connection) {
      try { await connection.end(); } catch (e) { /* ignore */ }
    }
  }
}