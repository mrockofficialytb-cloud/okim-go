import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType?: string;
  }[];
};

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: SendEmailInput) {
  const from = process.env.MAIL_FROM;

  if (!from) {
    throw new Error("MAIL_FROM není nastavené v .env");
  }

  const result = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    attachments,
  });

  return result;
}

function layout(title: string, content: string) {
  return `
  <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#111827;border-radius:18px 18px 0 0;padding:20px 24px;color:#fff;">
        <div style="font-size:24px;font-weight:700;">OKIM GO</div>
      </div>

      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 18px 18px;padding:28px 24px;">
        <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;color:#111827;">${title}</h1>
        <div style="font-size:15px;line-height:1.7;color:#374151;">
          ${content}
        </div>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />

        <div style="font-size:13px;line-height:1.6;color:#6b7280;">
          Tento email byl odeslán automaticky z rezervačního systému OKIM GO.
        </div>
      </div>
    </div>
  </div>
  `;
}

function ctaButton(label: string, href: string) {
  return `
    <div style="margin:24px 0;">
      <a href="${href}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:14px 20px;border-radius:14px;font-weight:700;">
        ${label}
      </a>
    </div>
  `;
}

export function welcomeEmailTemplate(params: {
  name: string;
  email: string;
}) {
  return layout(
    "Vítejte v OKIM GO",
    `
      <p>Dobrý den <strong>${params.name}</strong>,</p>
      <p>váš účet byl úspěšně vytvořen.</p>
      <p>
        <strong>Email:</strong> ${params.email}
      </p>
      <p>Nyní se můžete přihlásit a vytvářet rezervace vozidel.</p>
      ${ctaButton("Přihlásit se", `${process.env.APP_URL}/prihlaseni`)}
    `
  );
}

export function reservationReceivedTemplate(params: {
  customerName: string;
  carName: string;
  dateFrom: string;
  dateTo: string;
  totalPrice: number;
}) {
  return layout(
    "Rezervace přijata",
    `
      <p>Dobrý den <strong>${params.customerName}</strong>,</p>
      <p>vaše rezervace byla přijata a čeká na schválení.</p>
      <p>
        <strong>Vozidlo:</strong> ${params.carName}<br />
        <strong>Termín:</strong> ${params.dateFrom} – ${params.dateTo}<br />
        <strong>Cena:</strong> ${params.totalPrice} Kč
      </p>
      <p>Jakmile rezervaci zpracujeme, pošleme vám další email.</p>
    `
  );
}

export function reservationConfirmedTemplate(params: {
  customerName: string;
  carName: string;
  dateFrom: string;
  dateTo: string;
  totalPrice: number;
}) {
  return layout(
    "Rezervace potvrzena",
    `
      <p>Dobrý den <strong>${params.customerName}</strong>,</p>
      <p>vaše rezervace byla potvrzena.</p>
      <p>
        <strong>Vozidlo:</strong> ${params.carName}<br />
        <strong>Termín:</strong> ${params.dateFrom} – ${params.dateTo}<br />
        <strong>Cena:</strong> ${params.totalPrice} Kč
      </p>
      <p>V příloze naleznete potvrzení rezervace ve formátu PDF.</p>
      <p>V případě dotazů nás kontaktujte.</p>
    `
  );
}

export function rentalContractTemplate(params: {
  customerName: string;
  carName: string;
  dateFrom: string;
  dateTo: string;
  pickupAt: string;
  pickupMileage: number;
  pickupFuel: string;
}) {
  return layout(
    "Nájemní smlouva",
    `
      <p>Dobrý den <strong>${params.customerName}</strong>,</p>
      <p>vozidlo bylo označeno jako převzaté a v příloze zasíláme nájemní smlouvu.</p>
      <p>
        <strong>Vozidlo:</strong> ${params.carName}<br />
        <strong>Termín:</strong> ${params.dateFrom} – ${params.dateTo}<br />
        <strong>Předání:</strong> ${params.pickupAt}<br />
        <strong>Tachometr při předání:</strong> ${params.pickupMileage} km<br />
        <strong>Palivo při předání:</strong> ${params.pickupFuel}
      </p>
      <p>V případě nejasností nás kontaktujte.</p>
    `
  );
}

export function returnReminderTemplate(params: {
  customerName: string;
  carName: string;
  dateTo: string;
}) {
  return layout(
    "Připomínka vrácení vozidla",
    `
      <p>Dobrý den <strong>${params.customerName}</strong>,</p>
      <p>připomínáme blížící se vrácení vozidla.</p>
      <p>
        <strong>Vozidlo:</strong> ${params.carName}<br />
        <strong>Termín vrácení:</strong> ${params.dateTo}
      </p>
      <p>Prosíme o vrácení vozidla v domluvený čas. Děkujeme.</p>
    `
  );
}

export function reservationCanceledTemplate(params: {
  customerName: string;
  carName: string;
  dateFrom: string;
  dateTo: string;
}) {
  return layout(
    "Rezervace byla zrušena",
    `
      <p>Dobrý den <strong>${params.customerName}</strong>,</p>
      <p>vaše rezervace byla zrušena.</p>
      <p>
        <strong>Vozidlo:</strong> ${params.carName}<br />
        <strong>Termín:</strong> ${params.dateFrom} – ${params.dateTo}
      </p>
      <p>Potřebujete nový termín? Vytvořte novou rezervaci přes náš systém.</p>
      ${ctaButton("Nová rezervace", `${process.env.APP_URL}`)}
    `
  );
}

export function reservationChangedTemplate(params: {
  customerName: string;
  carName: string;
  dateFrom: string;
  dateTo: string;
  totalPrice: number;
}) {
  return layout(
    "Rezervace byla upravena",
    `
      <p>Dobrý den <strong>${params.customerName}</strong>,</p>
      <p>u vaší rezervace došlo ke změně.</p>
      <p>
        <strong>Vozidlo:</strong> ${params.carName}<br />
        <strong>Nový termín:</strong> ${params.dateFrom} – ${params.dateTo}<br />
        <strong>Nová cena:</strong> ${params.totalPrice} Kč
      </p>
    `
  );
}

export function adminNewReservationTemplate(params: {
  customerName: string;
  email: string;
  phone: string;
  carName: string;
  dateFrom: string;
  dateTo: string;
  totalPrice: number;
}) {
  return layout(
    "Nová rezervace",
    `
      <p>Do systému přišla nová rezervace.</p>
      <p>
        <strong>Zákazník:</strong> ${params.customerName}<br />
        <strong>Email:</strong> ${params.email}<br />
        <strong>Telefon:</strong> ${params.phone}
      </p>
      <p>
        <strong>Vozidlo:</strong> ${params.carName}<br />
        <strong>Termín:</strong> ${params.dateFrom} – ${params.dateTo}<br />
        <strong>Cena:</strong> ${params.totalPrice} Kč
      </p>
      ${ctaButton("Otevřít administraci", `${process.env.APP_URL}/admin`)}
    `
  );
}

export function resetPasswordTemplate(params: {
  name: string;
  resetUrl: string;
}) {
  return layout(
    "Obnova hesla",
    `
      <p>Dobrý den <strong>${params.name}</strong>,</p>
      <p>obdrželi jsme požadavek na změnu hesla.</p>
      <p>Pro nastavení nového hesla klikněte na tlačítko níže:</p>
      ${ctaButton("Nastavit nové heslo", params.resetUrl)}
      <p>Odkaz je platný 1 hodinu.</p>
      <p>Pokud jste o změnu hesla nežádali, tento email ignorujte.</p>
    `
  );
}

export function emailVerificationCodeTemplate(params: {
  name: string;
  code: string;
}) {
  return layout(
    "Ověření emailu",
    `
      <p>Dobrý den <strong>${params.name}</strong>,</p>
      <p>děkujeme za registraci do systému OKIM GO.</p>
      <p>Pro dokončení registrace zadejte tento ověřovací kód:</p>

      <div style="margin:24px 0;padding:18px 20px;border-radius:16px;background:#f3f4f6;border:1px solid #e5e7eb;text-align:center;">
        <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#111827;">
          ${params.code}
        </div>
      </div>

      <p>Kód je platný 15 minut.</p>
      <p>Pokud jste se neregistrovali, tento email ignorujte.</p>
    `
  );
}