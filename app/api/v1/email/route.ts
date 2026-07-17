import { NextResponse } from 'next/server';
import { 
  sendOtpEmail, 
  sendPasswordResetEmail, 
  sendWelcomeEmail, 
  sendHtmlEmail 
} from '@/lib/email/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, type, subject, otp, link, name, html, text, cc, bcc } = body;

    if (!to) {
      return NextResponse.json({
        status: 400,
        message: 'Recipient "to" email address is required.',
        data: null
      }, { status: 400 });
    }

    // Direct routing based on type
    if (type === 'otp') {
      if (!otp) {
        return NextResponse.json({
          status: 400,
          message: 'OTP code is required for type "otp".',
          data: null
        }, { status: 400 });
      }
      await sendOtpEmail(to, otp);
    } else if (type === 'reset') {
      if (!link) {
        return NextResponse.json({
          status: 400,
          message: 'Password reset link is required for type "reset".',
          data: null
        }, { status: 400 });
      }
      await sendPasswordResetEmail(to, link);
    } else if (type === 'welcome') {
      if (!name) {
        return NextResponse.json({
          status: 400,
          message: 'Recipient name is required for type "welcome".',
          data: null
        }, { status: 400 });
      }
      await sendWelcomeEmail(to, name);
    } else {
      // Custom / generic HTML or Plain Text Email sending
      if (!subject || (!html && !text)) {
        return NextResponse.json({
          status: 400,
          message: 'Subject and either HTML or Text body are required for custom emails.',
          data: null
        }, { status: 400 });
      }
      await sendHtmlEmail(to, subject, html || '', text, { cc, bcc });
    }

    return NextResponse.json({
      status: 200,
      message: 'Email sent successfully.',
      data: null
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API EMAIL ERROR] Exception during email API processing: ', error.message);
    return NextResponse.json({
      status: 500,
      message: 'Failed to send email.',
      data: null
    }, { status: 500 });
  }
}
