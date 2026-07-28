<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a Cazador de Gastos</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0f172a; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
        .body { padding: 30px; }
        .body h2 { color: #f1f5f9; }
        .body p { color: #94a3b8; line-height: 1.6; }
        .cta { display: block; background: linear-gradient(135deg, #10b981, #059669); color: white;
               text-decoration: none; padding: 14px 28px; border-radius: 8px; text-align: center;
               margin: 24px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Cazador de Gastos</h1>
            <p>Tu asistente financiero inteligente</p>
        </div>
        <div class="body">
            <h2>¡Hola, {{ $user->name }}! 👋</h2>
            <p>Tu cuenta ha sido creada exitosamente. Estamos emocionados de tenerte en la familia de <strong>Cazador de Gastos</strong>.</p>
            <p>Con nuestra plataforma podrás:</p>
            <ul style="color: #94a3b8; line-height: 2;">
                <li>📊 Registrar y analizar tus gastos e ingresos</li>
                <li>🎯 Establecer presupuestos por categoría</li>
                <li>💡 Recibir recomendaciones personalizadas de ahorro</li>
                <li>⚠️ Recibir alertas cuando superes tu presupuesto</li>
            </ul>
            <a href="{{ config('app.frontend_url') }}/dashboard" class="cta">
                Comenzar a ahorrar →
            </a>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} Cazador de Gastos. Todos los derechos reservados.</p>
            <p>Este correo fue enviado a {{ $user->email }}</p>
        </div>
    </div>
</body>
</html>
