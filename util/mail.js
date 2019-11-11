const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
 
// api key https://sendgrid.com/docs/Classroom/Send/api_keys.html
const options = {
    auth: {
        api_key: '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'
    }
}

const mailer = nodemailer.createTransport(sgTransport(options));

exports.sendMail = mailDetails => {
    const email = {
        to: mailDetails.to,
        from: mailDetails.from,
        subject: mailDetails.subject,
        text: mailDetails.text,
        html: mailDetails.html
    };
    return mailer.sendMail(email);
}