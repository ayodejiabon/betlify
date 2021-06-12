const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlText = require('html-to-text');


module.exports = class Email {
	constructor(email, name) {
		this.to = email;
		this.firstname = name.split(' ')[0];
		this.from = `${process.env.APP_NAME} <${process.env.EMAIL_FROM}>`
	}

	newTransport() {
		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth:{
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			}
		});
	}

	async send (template, subject, code) {

		//render html
		const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, 
				{name:this.firstname,code,color:process.env.APP_COLOR,app_logo:process.env.APP_LOGO_URL,app:process.env.APP_NAME}
			)

		//define mail options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: htmlText.fromString(html)
		}

		await this.newTransport().sendMail(mailOptions);

	}

	async signupMail(code) {
		await this.send('signup', 'Verify Account', code)
	}

	async sendPasswordReset(code) {
		await this.send('forgot', 'Password reset', code)
	}
}