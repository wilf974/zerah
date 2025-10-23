import nodemailer from 'nodemailer';

/**
 * Crée et retourne le transporteur SMTP configuré
 * Les variables d'environnement sont chargées à l'exécution, pas au build
 */
function getTransporter() {
  return nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Génère un code OTP aléatoire à 6 chiffres
 * @returns Code OTP sous forme de chaîne
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Envoie un email avec le code OTP
 * @param email - Adresse email du destinataire
 * @param code - Code OTP à envoyer
 * @returns Promise résolue quand l'email est envoyé
 */
export async function sendOTPEmail(email: string, code: string): Promise<void> {
  const transporter = getTransporter();
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Votre code de connexion - Zerah',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .code-box {
              background: white;
              border: 2px solid #667eea;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #667eea;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 Zerah</h1>
          </div>
          <div class="content">
            <h2>Connexion à votre compte</h2>
            <p>Bonjour,</p>
            <p>Voici votre code de connexion. Ce code est valide pendant <strong>10 minutes</strong>.</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.</p>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>© ${new Date().getFullYear()} Zerah - Suivi d'habitudes personnalisé</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Zerah - Code de connexion
      
      Votre code de connexion : ${code}
      
      Ce code est valide pendant 10 minutes.
      
      Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.
    `,
  };

  try {
    console.log('Sending OTP to:', email);
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? '***' : 'undefined',
    });
    
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}

