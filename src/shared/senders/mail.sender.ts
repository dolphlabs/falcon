import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { compile } from "handlebars";
import mjml2html from "mjml";
import { resolve } from "path";
import envConfig from "../configs/env.config";

export interface IMailOptions {
  to: string;
  subject: string;
  html: string;
}

export class MailSender extends DolphServiceHandler<Dolph> {
  constructor() {
    super("mailSender");
  }

  private async send(options: IMailOptions) {
    const transportOptions: SMTPTransport.Options = {
      port: 587,
      auth: {
        user: envConfig.smtp.user,
        pass: envConfig.smtp.pass,
      },
    };

    transportOptions.service = envConfig.smtp.service;

    if (transportOptions.service == "smtp.zoho.com") {
      transportOptions.host = transportOptions.service;
      transportOptions.service = "";
    }
    transportOptions.auth.type = "Login";

    const transporter = nodemailer.createTransport(transportOptions);

    const mailOptions = {
      // from: "hello@falcon.xyz",
      from: "hello@theparcel.com.ng",
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    return transporter.sendMail(mailOptions);
  }

  private convertFromMjmlToHtml(path: string) {
    const pathToMail = readFileSync(resolve(__dirname, path)).toString();
    return compile(mjml2html(pathToMail).html);
  }

  async sendVerifyEmailOtpMail(to: string, otp: string, orgName: string) {
    return this.send({
      to,
      subject: "Your Verification Code",
      html: this.convertFromMjmlToHtml("../../templates/verify_email.mjml")({
        otp,
        orgName,
      }),
    });
  }
}
