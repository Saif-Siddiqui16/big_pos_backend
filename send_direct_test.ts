import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import { TemplateService } from './src/services/template.service';
import { EmailService } from './src/services/email.service';
import prisma from './src/utils/prisma';

const logFile = 'direct_test_result.txt';
function log(msg: string) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

async function sendDirect() {
  if (fs.existsSync(logFile)) {
    fs.unlinkSync(logFile);
  }
  log(`🚀 Starting direct test email sender at: ${new Date().toLocaleString()}`);
  const testEmail = 'vivid.drift176@tembox.xyz';
  log(`Recipient: ${testEmail}`);

  try {
    // 1. Resolve template and render variables
    log('Resolving template "retailer-registration"...');
    const template = await TemplateService.getTemplate('retailer-registration', {
      retail_name: 'Big Innovation Group Retailer - Test Portal',
      retail_id: 'BIG-RET-888',
      phone: '+250788541239',
      email: testEmail,
      created_date: new Date().toLocaleDateString(),
      login_url: 'http://localhost:3062/login'
    });

    log('✅ Template successfully resolved and rendered.');
    log(`Subject: ${template.subject}`);

    // 2. Send email directly using Gmail API Service
    log('Sending email via Gmail API...');
    const result = await EmailService.sendEmail(
      testEmail,
      template.subject,
      template.html,
      'retailer-registration',
      { type: 'TEST', id: 'direct-888' }
    );

    log(`🎉 Email sent successfully! Log ID: ${result?.logId}, Message ID: ${result?.messageId}`);
  } catch (error: any) {
    log(`❌ Failed to send email directly: ${error.stack || error.message || error}`);
  } finally {
    log('Disconnecting prisma...');
    await prisma.$disconnect();
    log('Finished! Exiting process...');
    process.exit(0);
  }
}

sendDirect();
