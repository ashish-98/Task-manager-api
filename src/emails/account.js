const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'ash091998@gmail.com',
    subject: 'Thanks for joining in',
    text: `Welcome to the App, ${name}. `
  })
}

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'ash091998@gmail.com',
    subject: 'Sorry to see u go',
    text: `Goodbye ${name}`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail
}
