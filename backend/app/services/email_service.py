# backend/app/services/email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config.config import settings

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, text_content: str, html_content: str) -> bool:
        # Try Brevo SMTP first
        print(f"[EmailService] Attempting to send email to {to_email} via primary provider Brevo SMTP...")
        try:
            if not settings.BREVO_SMTP_USER or not settings.BREVO_SMTP_PASSWORD:
                raise ValueError("Brevo SMTP credentials not fully configured.")
                
            sender = settings.BREVO_FROM or settings.BREVO_SMTP_USER
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"SecureCampus AI <{sender}>"
            msg['To'] = to_email
            
            msg.attach(MIMEText(text_content, 'plain'))
            msg.attach(MIMEText(html_content, 'html'))
            
            with smtplib.SMTP(settings.BREVO_SMTP_HOST, settings.BREVO_SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.BREVO_SMTP_USER, settings.BREVO_SMTP_PASSWORD)
                server.sendmail(sender, to_email, msg.as_string())
                print(f"[EmailService] Brevo SMTP Success: Email sent to {to_email}")
                return True
        except Exception as e:
            print(f"[EmailService] Brevo SMTP Failure: {e}. Fallback Triggered: Attempting Gmail SMTP...")
            
            # Retry using Gmail SMTP
            try:
                if not settings.GMAIL_SMTP_USER or not settings.GMAIL_SMTP_PASSWORD:
                    raise ValueError("Gmail SMTP credentials not fully configured.")
                    
                sender = settings.GMAIL_FROM or settings.GMAIL_SMTP_USER
                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = f"SecureCampus AI <{sender}>"
                msg['To'] = to_email
                
                msg.attach(MIMEText(text_content, 'plain'))
                msg.attach(MIMEText(html_content, 'html'))
                
                with smtplib.SMTP(settings.GMAIL_SMTP_HOST, settings.GMAIL_SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    server.login(settings.GMAIL_SMTP_USER, settings.GMAIL_SMTP_PASSWORD)
                    server.sendmail(sender, to_email, msg.as_string())
                    print(f"[EmailService] Gmail SMTP Success: Email sent to {to_email}")
                    return True
            except Exception as e2:
                print(f"[EmailService] Gmail SMTP Failure: {e2}. Both providers failed.")
                return False
