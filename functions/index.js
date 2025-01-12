const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configuração do transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const { email, displayName } = user;
  const userName = displayName || 'Usuário';

  const mailOptions = {
    from: '"Planner Music" <noreply@plannermusic.com.br>',
    to: email,
    subject: 'Bem-vindo ao Planner Music! 🎵',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #764ba2; text-align: center;">Bem-vindo ao Planner Music! 🎵</h1>
        
        <p>Olá ${userName},</p>
        
        <p>Estamos muito felizes em ter você conosco! O Planner Music é o seu novo assistente musical,
        projetado para ajudar você a organizar e gerenciar suas músicas de forma eficiente.</p>
        
        <h2 style="color: #667eea;">O que você pode fazer com o Planner Music:</h2>
        
        <ul>
          <li>Organizar seu repertório musical</li>
          <li>Gerenciar letras e acordes</li>
          <li>Criar setlists personalizadas</li>
          <li>Acompanhar suas performances</li>
        </ul>
        
        <p>Para começar, acesse nossa plataforma e explore todas as funcionalidades disponíveis:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://plannermusic.com.br" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;">
            Acessar Planner Music
          </a>
        </div>
        
        <p>Se precisar de ajuda ou tiver alguma dúvida, não hesite em nos contatar:</p>
        <p style="text-align: center;">
          <a href="mailto:suporte@plannermusic.com.br" style="color: #764ba2;">
            suporte@plannermusic.com.br
          </a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="text-align: center; color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} Planner Music. Todos os direitos reservados.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de boas-vindas enviado com sucesso para:', email);
    
    // Atualizar o documento do usuário com a confirmação do envio do email
    const userRef = admin.firestore().collection('users').doc(user.uid);
    await userRef.update({
      welcomeEmailSent: true,
      welcomeEmailSentAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
  }
});
