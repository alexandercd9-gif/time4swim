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
      return NextResponse.json({ 
        success: false,
        message: 'Body inválido, debe ser JSON.' 
      }, { status: 400 });
    }
    
    const { email, password } = body;

    // 2. Validar datos
    if (!email || !password) {
      return NextResponse.json({ 
        success: false,
        message: 'Email y contraseña son obligatorios.' 
      }, { status: 400 });
    }

    // 3. Conectar a la base de datos
    try {
      connection = await connectDB();
    } catch (dbErr) {
      console.error('Error de conexión DB:', dbErr);
      return NextResponse.json({ 
        success: false,
        message: 'Error de conexión a la base de datos.' 
      }, { status: 500 });
    }

    // 4. Buscar usuario - CORREGIDO: manejo seguro del array
    let users: any[];
    try {
      const [rows] = await connection.execute('SELECT * FROM user WHERE email = ?', [email]);
      users = rows as any[];
    } catch (sqlErr) {
      console.error('Error SQL:', sqlErr);
      return NextResponse.json({ 
        success: false,
        message: 'Error al consultar usuario.' 
      }, { status: 500 });
    }

    // Verificar si se encontró el usuario
    if (!users || users.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Usuario o contraseña incorrectos.' 
      }, { status: 401 });
    }

    const user = users[0];

    // Debug: verificar datos del usuario
    console.log('Usuario encontrado:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      name: user.name
    });

    // 5. Verificar contraseña - CORREGIDO: validar que existe password
    if (!user.password) {
      console.error('Usuario sin contraseña hash:', user.email);
      return NextResponse.json({ 
        success: false,
        message: 'Error en la configuración del usuario.' 
      }, { status: 500 });
    }

    let validPassword = false;
    try {
      validPassword = await bcrypt.compare(password, user.password);
    } catch (bcryptErr) {
      console.error('Error bcrypt:', bcryptErr);
      return NextResponse.json({ 
        success: false,
        message: 'Error al verificar la contraseña.' 
      }, { status: 500 });
    }

    if (!validPassword) {
      return NextResponse.json({ 
        success: false,
        message: 'Usuario o contraseña incorrectos.' 
      }, { status: 401 });
    }

    // 6. Generar JWT - CORREGIDO: valores por defecto
    let token;
    try {
      token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role || 'user'
        },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
    } catch (jwtErr) {
      console.error('Error JWT:', jwtErr);
      return NextResponse.json({ 
        success: false,
        message: 'Error al generar el token.' 
      }, { status: 500 });
    }

    // 7. Preparar respuesta - CORREGIDO: estructura consistente
    const responseData = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        name: user.name || user.email.split('@')[0] // nombre por defecto
      },
      token,
      message: 'Login exitoso'
    };

    console.log('Login exitoso para:', user.email, 'Rol:', user.role);
    return NextResponse.json(responseData);

  } catch (error) {
    // Manejo de errores generales
    console.error('Error general en login:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Error interno del servidor.' 
    }, { status: 500 });
  } finally {
    // Cerrar conexión de forma segura
    if (connection) {
      try { 
        await connection.end(); 
      } catch (e) { 
        console.error('Error cerrando conexión:', e);
      }
    }
  }
}