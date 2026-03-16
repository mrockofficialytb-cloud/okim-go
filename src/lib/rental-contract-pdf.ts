import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "fs/promises";

type RentalContractPdfData = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  totalPrice: number | string;
  depositAmount?: number | string | null;
  dateFrom: Date | string;
  dateTo: Date | string;
  createdAt?: Date | string | null;
  pickupAt?: Date | string | null;
  pickupMileage?: number | null;
  pickupFuel?: string | null;
  pickupNote?: string | null;
  pickupOwnerSignature?: string | null;
  pickupCustomerSignature?: string | null;
  car: {
    brand: string;
    model: string;
    variant: string;
  };
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    dateOfBirth?: Date | string | null;
    addressStreet?: string | null;
    addressCity?: string | null;
    addressZip?: string | null;
    idDocumentNumber?: string | null;
    driverLicenseNumber?: string | null;
    driverLicenseExpiry?: Date | string | null;
  } | null;
};

function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("cs-CZ");
}

function formatDateTime(value?: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("cs-CZ");
}

function formatCurrency(value?: number | string | null) {
  if (value == null || value === "") return "—";
  return `${new Intl.NumberFormat("cs-CZ").format(Number(value))} Kč`;
}

function fitText(font: any, text: string, maxWidth: number, startSize: number, minSize = 7) {
  let size = startSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.5;
  }
  return size;
}

function truncateText(font: any, text: string, maxWidth: number, size: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;

  let result = text;
  while (result.length > 0 && font.widthOfTextAtSize(`${result}…`, size) > maxWidth) {
    result = result.slice(0, -1);
  }

  return `${result}…`;
}

function drawText(
  page: any,
  text: string,
  x: number,
  y: number,
  options: {
    size?: number;
    font?: any;
    color?: ReturnType<typeof rgb>;
    maxWidth?: number;
    lineHeight?: number;
  } = {}
) {
  page.drawText(text, {
    x,
    y,
    size: options.size ?? 11,
    font: options.font,
    color: options.color ?? rgb(0.1, 0.1, 0.1),
    maxWidth: options.maxWidth,
    lineHeight: options.lineHeight,
  });
}

function drawSectionTitle(page: any, title: string, x: number, y: number, boldFont: any) {
  drawText(page, title, x, y, {
    size: 13,
    font: boldFont,
    color: rgb(0.08, 0.08, 0.08),
  });
}

function drawDivider(page: any, x1: number, x2: number, y: number) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 1,
    color: rgb(0.88, 0.88, 0.88),
  });
}

function drawInfoRow(
  page: any,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  font: any,
  boldFont: any
) {
  drawText(page, label, x, y, {
    size: 9,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  const fittedSize = fitText(boldFont, value || "—", width, 11, 8);
  const safeValue = truncateText(boldFont, value || "—", width, fittedSize);

  drawText(page, safeValue, x, y - 13, {
    size: fittedSize,
    font: boldFont,
    color: rgb(0.12, 0.12, 0.12),
    maxWidth: width,
    lineHeight: 13,
  });
}

function drawCard(
  page: any,
  x: number,
  y: number,
  width: number,
  height: number,
  fill = rgb(0.97, 0.97, 0.97),
  border = rgb(0.9, 0.9, 0.9)
) {
  page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    color: fill,
    borderColor: border,
    borderWidth: 1,
  });
}

function drawInfoCard(
  page: any,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  value: string,
  font: any,
  boldFont: any
) {
  drawCard(page, x, y, width, height);

  drawText(page, title, x + 14, y - 18, {
    size: 8,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  const fittedSize = fitText(boldFont, value, width - 28, 14, 9);
  const safeValue = truncateText(boldFont, value, width - 28, fittedSize);

  drawText(page, safeValue, x + 14, y - 38, {
    size: fittedSize,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
    maxWidth: width - 28,
  });
}

function wrapText(text: string, maxChars = 95) {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const p = paragraph.trim();

    if (!p) {
      lines.push("");
      continue;
    }

    const words = p.split(/\s+/);
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length <= maxChars) {
        line = candidate;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }

    if (line) lines.push(line);
  }

  return lines;
}

function drawWrappedBlockWithPageBreak(
  pdfDoc: any,
  pageRef: { page: any },
  text: string,
  x: number,
  y: number,
  width: number,
  font: any,
  size = 10,
  color = rgb(0.18, 0.18, 0.18),
  lineHeight = 14
) {
  const lines = wrapText(text, Math.max(40, Math.floor(width / 5.1)));
  const bottomMargin = 95;
  const pageHeight = 841.89;
  const topStart = 790;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isSectionTitle = /^\d+\.\s/.test(line.trim());
    const requiredSpace = isSectionTitle ? lineHeight * 4 : lineHeight;

    if (y < bottomMargin + requiredSpace) {
      pageRef.page = pdfDoc.addPage([595.28, pageHeight]);
      y = topStart;
    }

    drawText(pageRef.page, line, x, y, {
      size,
      font,
      color,
      maxWidth: width,
      lineHeight,
    });

    y -= lineHeight;
  }

  return y;
}

function dataUrlToUint8Array(dataUrl?: string | null) {
  if (!dataUrl) return null;

  const match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!match) return null;

  const base64 = match[1];
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

export async function generateRentalContractPdf(data: RentalContractPdfData) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const regularFontBytes = await readFile("C:/Windows/Fonts/arial.ttf");
  const boldFontBytes = await readFile("C:/Windows/Fonts/arialbd.ttf");

  const font = await pdfDoc.embedFont(regularFontBytes);
  const boldFont = await pdfDoc.embedFont(boldFontBytes);

  let ownerSignatureImage: any = null;
  let customerSignatureImage: any = null;

  const ownerSignatureBytes = dataUrlToUint8Array(data.pickupOwnerSignature);
  if (ownerSignatureBytes) {
    ownerSignatureImage = await pdfDoc.embedPng(ownerSignatureBytes);
  }

  const customerSignatureBytes = dataUrlToUint8Array(data.pickupCustomerSignature);
  if (customerSignatureBytes) {
    customerSignatureImage = await pdfDoc.embedPng(customerSignatureBytes);
  }

  const page1 = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page1.getSize();
  const margin = 42;
  const contentWidth = width - margin * 2;

  drawCard(
    page1,
    margin,
    height - 42,
    contentWidth,
    94,
    rgb(0.07, 0.07, 0.07),
    rgb(0.07, 0.07, 0.07)
  );

  drawText(page1, "OKIM GO", margin + 22, height - 72, {
    size: 22,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  drawText(page1, "Nájemní smlouva", margin + 22, height - 96, {
    size: 12,
    font,
    color: rgb(0.82, 0.82, 0.82),
  });

  const rightX = width - 205;
  const rightWidth = 155;

  drawText(page1, "ID smlouvy / rezervace", rightX, height - 70, {
    size: 9,
    font,
    color: rgb(0.82, 0.82, 0.82),
  });

  const idSize = fitText(boldFont, data.id, rightWidth, 10, 7);
  const safeId = truncateText(boldFont, data.id, rightWidth, idSize);

  drawText(page1, safeId, rightX, height - 84, {
    size: idSize,
    font: boldFont,
    color: rgb(1, 1, 1),
    maxWidth: rightWidth,
  });

  drawText(page1, "Vytvořeno", rightX, height - 102, {
    size: 9,
    font,
    color: rgb(0.82, 0.82, 0.82),
  });

  drawText(page1, formatDateTime(data.createdAt), rightX, height - 116, {
    size: 9,
    font,
    color: rgb(0.82, 0.82, 0.82),
    maxWidth: rightWidth,
  });

  let y = height - 166;

  drawCard(
    page1,
    margin,
    y,
    contentWidth,
    82,
    rgb(0.985, 0.985, 0.985),
    rgb(0.9, 0.9, 0.9)
  );

  drawText(page1, `${data.car.brand} ${data.car.model}`, margin + 18, y - 24, {
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  drawText(page1, `Varianta: ${data.car.variant}`, margin + 18, y - 46, {
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  drawText(
    page1,
    `Termín nájmu: ${formatDate(data.dateFrom)} – ${formatDate(data.dateTo)}`,
    margin + 18,
    y - 63,
    {
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    }
  );

  y -= 106;

  const cardGap = 10;
  const cardWidth = (contentWidth - cardGap * 3) / 4;

  drawInfoCard(page1, margin, y, cardWidth, 58, "Cena", formatCurrency(data.totalPrice), font, boldFont);
  drawInfoCard(
    page1,
    margin + cardWidth + cardGap,
    y,
    cardWidth,
    58,
    "Kauce",
    formatCurrency(data.depositAmount),
    font,
    boldFont
  );
  drawInfoCard(
    page1,
    margin + (cardWidth + cardGap) * 2,
    y,
    cardWidth,
    58,
    "Předání",
    formatDateTime(data.pickupAt),
    font,
    boldFont
  );
  drawInfoCard(
    page1,
    margin + (cardWidth + cardGap) * 3,
    y,
    cardWidth,
    58,
    "Tachometr",
    data.pickupMileage != null ? `${data.pickupMileage} km` : "—",
    font,
    boldFont
  );

  y -= 86;

  drawSectionTitle(page1, "Smluvní strany", margin, y, boldFont);
  y -= 14;
  drawDivider(page1, margin, width - margin, y);
  y -= 22;

  const leftColX = margin;
  const rightColX = 305;
  const colWidth = 220;

  drawInfoRow(page1, "Pronajímatel", "OKIM spol. s r.o.", leftColX, y, colWidth, font, boldFont);
  drawInfoRow(page1, "Nájemce", data.customerName, rightColX, y, colWidth, font, boldFont);

  y -= 42;

  drawInfoRow(page1, "IČO", "48290980", leftColX, y, colWidth, font, boldFont);
  drawInfoRow(
    page1,
    "Trvalá adresa",
    `${data.user?.addressStreet || "—"}, ${data.user?.addressCity || "—"} ${data.user?.addressZip || ""}`.trim(),
    rightColX,
    y,
    colWidth,
    font,
    boldFont
  );

  y -= 42;

  drawInfoRow(page1, "Kontaktní email", "info@okim.cz", leftColX, y, colWidth, font, boldFont);
  drawInfoRow(page1, "Kontaktní email", data.email, rightColX, y, colWidth, font, boldFont);

  y -= 42;

  drawInfoRow(page1, "Telefonní číslo", "+420 734 785 184", leftColX, y, colWidth, font, boldFont);
  drawInfoRow(page1, "Telefonní číslo nájemce", data.phone, rightColX, y, colWidth, font, boldFont);

  y -= 66;

  drawSectionTitle(page1, "Identifikace řidiče", margin, y, boldFont);
  y -= 14;
  drawDivider(page1, margin, width - margin, y);
  y -= 22;

  drawInfoRow(page1, "Jméno", data.user?.firstName || "—", leftColX, y, colWidth, font, boldFont);
  drawInfoRow(page1, "Příjmení", data.user?.lastName || "—", rightColX, y, colWidth, font, boldFont);

  y -= 42;

  drawInfoRow(page1, "Datum narození", formatDate(data.user?.dateOfBirth), leftColX, y, colWidth, font, boldFont);
  drawInfoRow(page1, "Číslo OP / pasu", data.user?.idDocumentNumber || "—", rightColX, y, colWidth, font, boldFont);

  y -= 42;

  drawInfoRow(page1, "Adresa", data.user?.addressStreet || "—", leftColX, y, colWidth, font, boldFont);
  drawInfoRow(
    page1,
    "Město / PSČ",
    `${data.user?.addressCity || "—"} ${data.user?.addressZip || ""}`.trim(),
    rightColX,
    y,
    colWidth,
    font,
    boldFont
  );

  y -= 42;

  drawInfoRow(
    page1,
    "Řidičský průkaz",
    data.user?.driverLicenseNumber || "—",
    leftColX,
    y,
    colWidth,
    font,
    boldFont
  );
  drawInfoRow(
    page1,
    "Platnost ŘP",
    formatDate(data.user?.driverLicenseExpiry),
    rightColX,
    y,
    colWidth,
    font,
    boldFont
  );

  y -= 66;

  drawSectionTitle(page1, "Předání vozidla", margin, y, boldFont);
  y -= 14;
  drawDivider(page1, margin, width - margin, y);
  y -= 22;

  drawInfoRow(
    page1,
    "Datum a čas předání",
    data.pickupAt ? formatDateTime(data.pickupAt) : "Bude doplněno při předání",
    leftColX,
    y,
    colWidth,
    font,
    boldFont
  );
  drawInfoRow(
    page1,
    "Palivo při předání",
    data.pickupFuel || "Bude doplněno při předání",
    rightColX,
    y,
    colWidth,
    font,
    boldFont
  );

  y -= 42;

  drawInfoRow(
    page1,
    "Tachometr při předání",
    data.pickupMileage != null
      ? `${data.pickupMileage} km`
      : "Bude doplněno při předání",
    leftColX,
    y,
    colWidth,
    font,
    boldFont
  );
  drawInfoRow(
    page1,
    "Poznámka",
    data.pickupNote || "Bude doplněno při předání",
    rightColX,
    y,
    colWidth,
    font,
    boldFont
  );

  const page2 = pdfDoc.addPage([595.28, 841.89]);
  const pageRef = { page: page2 };
  const page2Height = page2.getSize().height;

  drawText(pageRef.page, "Smluvní ujednání", margin, page2Height - 58, {
    size: 18,
    font: boldFont,
    color: rgb(0.08, 0.08, 0.08),
  });

  drawDivider(pageRef.page, margin, width - margin, page2Height - 72);

  let y2 = page2Height - 98;

  const contractText = `
1. Předmět smlouvy

Pronajímatel přenechává nájemci k dočasnému užívání vozidlo ${data.car.brand} ${data.car.model} – ${data.car.variant}. Nájemce se zavazuje vozidlo užívat řádně, v souladu s touto smlouvou a vrátit jej ve sjednaném termínu.

2. Doba nájmu

Nájem se sjednává na dobu od ${formatDate(data.dateFrom)} do ${formatDate(data.dateTo)}.

3. Cena nájmu a kauce

Cena nájmu činí ${formatCurrency(data.totalPrice)}. Kauce činí ${formatCurrency(
    data.depositAmount
  )}. Kauce slouží k zajištění pohledávek pronajímatele vzniklých v souvislosti s nájmem vozidla, zejména náhrady škody, smluvních pokut, dopravních přestupků, nedoplatku nájemného a dalších nákladů vzniklých porušením povinností nájemce.

4. Předání vozidla

Vozidlo bylo nájemci předáno ve stavu uvedeném na první straně této smlouvy. Nájemce potvrzuje, že se seznámil se stavem vozidla, převzal jej způsobilé k provozu a bez výhrad, není-li výslovně uvedeno jinak v poznámce o předání.

5. Povinnosti nájemce

Nájemce se zavazuje:
- užívat vozidlo pouze obvyklým způsobem a v souladu s právními předpisy,
- chránit vozidlo před poškozením, ztrátou nebo zničením,
- neumožnit užívání vozidla osobě bez příslušného oprávnění,
- bezodkladně oznámit pronajímateli dopravní nehodu, poškození nebo poruchu,
- vrátit vozidlo ve sjednaném termínu a stavu odpovídajícím běžnému opotřebení.

6. Omezení užívání vozidla

Ve vozidle je zakázáno kouřit. Přeprava zvířat je možná pouze se souhlasem pronajímatele a při dodržení ochrany interiéru vozidla. Výjezd mimo území Evropské unie je bez předchozího písemného souhlasu pronajímatele zakázán.

7. Odpovědnost za škodu a sankce

Nájemce odpovídá za škodu vzniklou na vozidle během doby nájmu, pokud neprokáže, že škoda vznikla bez jeho zavinění. Nájemce dále odpovídá za pokuty, správní poplatky, mýtné, parkovné a jiné sankce vzniklé v době nájmu.

8. Vrácení vozidla

Nájemce se zavazuje vrátit vozidlo nejpozději dne ${formatDate(
    data.dateTo
  )}. V případě prodlení s vrácením je pronajímatel oprávněn požadovat náhradu škody a účtovat další nájemné či smluvní sankce dle interních podmínek pronajímatele.

9. Závěrečná ustanovení

Tato smlouva představuje úplnou dohodu mezi stranami ohledně nájmu vozidla. Smlouva je vyhotovena ve dvou stejnopisech, z nichž každá strana obdrží po jednom vyhotovení.
`;

  y2 = drawWrappedBlockWithPageBreak(
    pdfDoc,
    pageRef,
    contractText,
    margin,
    y2,
    contentWidth,
    font,
    10,
    rgb(0.18, 0.18, 0.18),
    15
  );

  if (y2 < 170) {
    pageRef.page = pdfDoc.addPage([595.28, 841.89]);
    y2 = 760;
  } else {
    y2 -= 36;
  }

  

  const signatureLineY = y2 - 12;
  const labelY = y2 - 54;

  // levá strana - nájemce
  pageRef.page.drawLine({
    start: { x: margin + 10, y: signatureLineY },
    end: { x: margin + 210, y: signatureLineY },
    thickness: 1,
    color: rgb(0.75, 0.75, 0.75),
  });

  // pravá strana - pronajímatel
  pageRef.page.drawLine({
    start: { x: 330, y: signatureLineY },
    end: { x: 530, y: signatureLineY },
    thickness: 1,
    color: rgb(0.75, 0.75, 0.75),
  });

  if (customerSignatureImage) {
    const dims = customerSignatureImage.scale(0.25);
    pageRef.page.drawImage(customerSignatureImage, {
      x: margin + 18,
      y: signatureLineY + 8,
      width: Math.min(dims.width, 180),
      height: Math.min(dims.height, 60),
    });
  }

  if (ownerSignatureImage) {
    const dims = ownerSignatureImage.scale(0.25);
    pageRef.page.drawImage(ownerSignatureImage, {
      x: 338,
      y: signatureLineY + 8,
      width: Math.min(dims.width, 180),
      height: Math.min(dims.height, 60),
    });
  }

  drawText(pageRef.page, "Podpis nájemce", margin + 10, labelY, {
    size: 10,
    font,
    color: rgb(0.38, 0.38, 0.38),
  });

  drawText(pageRef.page, "Podpis pronajímatele", 330, labelY, {
    size: 10,
    font,
    color: rgb(0.38, 0.38, 0.38),
  });

  return await pdfDoc.save();
}