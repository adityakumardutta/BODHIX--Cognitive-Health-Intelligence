package com.dementiascreen.service;

import com.dementiascreen.dto.ScoreCardItemDto;
import com.dementiascreen.dto.ScoreCardResponse;
import com.dementiascreen.dto.ScoreCardSectionDto;
import com.dementiascreen.entity.Person;
import com.dementiascreen.entity.User;
import com.dementiascreen.exception.BadRequestException;
import com.dementiascreen.exception.EmailDeliveryException;
import com.dementiascreen.exception.ResourceNotFoundException;
import com.dementiascreen.repository.PersonRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.core.io.ClassPathResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Builds the REAL screening evaluation report PDF (same backend data as the
 * score-card API) and emails it to the CURRENT authenticated specialist's
 * registered email address.
 *
 * <p>Email transport is abstracted behind {@link EmailSender} so the same
 * behavior (real specialist email, exact subject, real PDF attachment, honest
 * success/failure) works over SMTP locally and over an HTTPS email API
 * (Resend) in production on Render, which blocks outbound SMTP.
 */
@Service
public class ReportEmailService {

    private static final Logger log = LoggerFactory.getLogger(ReportEmailService.class);

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    private final ScreeningScoringService scoringService;
    private final PersonRepository personRepository;
    private final EmailSender emailSender;

    public ReportEmailService(ScreeningScoringService scoringService,
                              PersonRepository personRepository,
                              EmailSender emailSender) {
        this.scoringService = scoringService;
        this.personRepository = personRepository;
        this.emailSender = emailSender;
    }

    /** Sends the real evaluation report PDF to the specialist's registered email. */
    public void emailReportToSpecialist(Long screeningId, User specialist) {
        if (specialist == null || specialist.getEmail() == null || specialist.getEmail().isBlank()) {
            throw new BadRequestException("Specialist email address is missing");
        }
        Person person = loadPersonForScreening(screeningId);
        byte[] pdf = buildReportPdf(screeningId, specialist);

        String subject = person.getFullName() + " -- evaluation report";
        String body = "BODHIX\n\n"
                + "Please find the attached cognitive screening evaluation report.\n\n"
                + "Regards,\n"
                + "BODHIX\n"
                + "Cognitive Health Intelligence";
        String attachmentName = "BODHIX-Screening-Report-" + screeningId + ".pdf";

        try {
            emailSender.sendEmailWithAttachment(
                    specialist.getEmail(), subject, body, pdf, attachmentName);
        } catch (BadRequestException | ResourceNotFoundException | EmailDeliveryException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error preparing report email for screening {}: {}", screeningId, e.getMessage());
            throw new EmailDeliveryException("Unable to send the report. Please try again.");
        }
    }
    private Person loadPersonForScreening(Long screeningId) {
        ScoreCardResponse card = scoringService.getScoreCard(screeningId);
        return personRepository.findById(card.getPersonId())
                .orElseThrow(() -> new ResourceNotFoundException("Person not found for screening: " + screeningId));
    }

    /** Generates the evaluation report PDF from the real stored screening data. */
    public byte[] buildReportPdf(Long screeningId, User specialist) {
        ScoreCardResponse card = scoringService.getScoreCard(screeningId);
        Person person = personRepository.findById(card.getPersonId())
                .orElseThrow(() -> new ResourceNotFoundException("Person not found for screening: " + screeningId));

        boolean flagged = card.getSections() != null && card.getSections().stream()
                .anyMatch(ScoreCardSectionDto::isFlaggedForReview);
        String overall = flagged ? "Review Recommended" : "Low Concern";
        String risk = flagged ? "ELEVATED" : "LOW";
        String interpretation = "Further professional assessment may be appropriate. "
                + "This is a screening result, not a diagnosis, and should be interpreted "
                + "by an appropriately qualified healthcare professional.";

        Font title = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(37, 99, 235));
        Font h2 = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(30, 41, 89));
        Font label = new Font(Font.HELVETICA, 8, Font.BOLD, new Color(100, 116, 139));
        Font value = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(15, 23, 42));
        Font small = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(100, 116, 139));
        Font bold = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(15, 23, 42));
        Font sigFont = new Font(Font.TIMES_ROMAN, 22, Font.ITALIC, new Color(15, 23, 42));

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ---- Brand header ----
            PdfPTable head = new PdfPTable(2);
            head.setWidthPercentage(100);
            head.setWidths(new float[]{70, 30});
            PdfPCell hc = new PdfPCell();
            hc.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            hc.addElement(new Paragraph("BODHIX", title));
            hc.addElement(new Paragraph("Cognitive Screening Evaluation Report",
                    new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(71, 85, 105))));
            PdfPCell hImg = new PdfPCell();
            hImg.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            hImg.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Image logo = Image.getInstance(new ClassPathResource("bodhix-logo.png").getInputStream().readAllBytes());
            logo.scaleToFit(120, 52);
            hImg.addElement(logo);
            head.addCell(hImg);
            doc.add(head);
            doc.add(spacer(8));

            // ---- Patient information ----
            doc.add(new Paragraph("PATIENT INFORMATION", h2));
            doc.add(infoTable(new String[][]{
                    {"Name", person.getFullName()},
                    {"Age", person.getAge() != null ? person.getAge() + " years" : null},
                    {"Gender", person.getGender() != null ? titleCase(person.getGender().name()) : null},
                    {"Location", person.getLocation()},
            }, label, value));
            doc.add(spacer(10));

            // ---- Screening information ----
            doc.add(new Paragraph("SCREENING INFORMATION", h2));
            doc.add(infoTable(new String[][]{
                    {"Screening ID", "#" + card.getScreeningId()},
                    {"Date", card.getCompletedAt() != null ? card.getCompletedAt().format(DATE_FMT) + " " + card.getCompletedAt().format(TIME_FMT) : null},
                    {"Completed by", specialist.getFullName()},
                    {"Specialist email", specialist.getEmail()},
            }, label, value));
            doc.add(spacer(10));

            // ---- Result ----
            doc.add(new Paragraph("RESULT", h2));
            PdfPTable res = new PdfPTable(1);
            res.setWidthPercentage(100);
            res.addCell(cell("Overall status", overall, label, bold));
            res.addCell(cell("Risk level", risk, label, bold));
            res.addCell(cell("Interpretation", interpretation, label, small));
            doc.add(res);
            doc.add(spacer(10));

            // ---- Instrument sections (every real recorded item) ----
            List<ScoreCardSectionDto> sections = card.getSections() == null ? List.of() : card.getSections();
            for (ScoreCardSectionDto s : sections) {
                PdfPTable sec = new PdfPTable(1);
                sec.setWidthPercentage(100);
                sec.setKeepTogether(true);
                PdfPCell sc = new PdfPCell();
                sc.setBorder(com.lowagie.text.Rectangle.BOX);
                sc.setBorderColor(new Color(203, 213, 225));
                sc.setPadding(10);
                sc.addElement(new Paragraph(sectionTitle(s.getSectionCode()), h2));
                sc.addElement(new Paragraph("Total: " + s.getRawScore().stripTrailingZeros().toPlainString()
                        + " / " + s.getMaxScore().stripTrailingZeros().toPlainString()
                        + "   |   " + sectionRemark(s), small));
                sc.addElement(spacer(4));
                PdfPTable items = new PdfPTable(new float[]{55, 25, 20});
                items.setWidthPercentage(100);
                items.addCell(hcell("Item"));
                items.addCell(hcell("Response"));
                items.addCell(hcellRight("Score"));
                for (ScoreCardItemDto it : s.getItems()) {
                    items.addCell(bcell(it.getPrompt(), small));
                    items.addCell(bcell(it.getResponse(), small));
                    PdfPCell sp = new PdfPCell(new Phrase(it.getScore() == null ? "0" : it.getScore().stripTrailingZeros().toPlainString(), small));
                    sp.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    sp.setBorder(com.lowagie.text.Rectangle.BOTTOM);
                    sp.setBorderColor(new Color(226, 232, 240));
                    items.addCell(sp);
                }
                sc.addElement(items);
                sec.addCell(sc);
                doc.add(sec);
                doc.add(spacer(8));
            }

            // ---- Recommendations ----
            doc.add(new Paragraph("RECOMMENDATIONS", h2));
            doc.add(new Paragraph(interpretation, value));
            doc.add(spacer(10));

            // ---- Disclaimer ----
            doc.add(new Paragraph("DISCLAIMER", h2));
            doc.add(new Paragraph("Screening support only - not a diagnostic tool. Results require "
                    + "professional review by a qualified healthcare professional.", small));
            doc.add(new Paragraph("CLINICAL EVIDENCE & METHODOLOGY", h2));
            doc.add(new Paragraph("This report is based on established, evidence-based screening instruments. Responses are evaluated using the predefined scoring rules of each instrument.", value));
            doc.add(new Paragraph("AD8: Galvin JE et al. Neurology. 2005;65(4):559-564.", small));
            doc.add(new Paragraph("RUDAS: Storey JE et al. Int Psychogeriatr. 2004;16(1):13-31.", small));
            doc.add(new Paragraph("PFAQ: Pfeffer RI et al. J Gerontol. 1982;37(3):323-329.", small));
            doc.add(spacer(14));

            // ---- Signature footer (kept together as one unit) ----
            PdfPTable foot = new PdfPTable(3);
            foot.setWidthPercentage(100);
            foot.setWidths(new float[]{30, 40, 30});
            foot.setKeepTogether(true);
            foot.addCell(footCell("COMPLETED BY", specialist.getFullName(), label, bold));
            PdfPCell sig = footCell("SIGNATURE",
                    specialist.getFullName(), label, sigFont);
            sig.addElement(new Paragraph("Signature representation of the completing specialist",
                    new Font(Font.HELVETICA, 6.5f, Font.NORMAL, new Color(148, 163, 184))));
            foot.addCell(sig);
            foot.addCell(footCell("DATE",
                    card.getCompletedAt() != null ? card.getCompletedAt().format(DATE_FMT) + " " + card.getCompletedAt().format(TIME_FMT) : null, label, bold));
            doc.add(foot);
            doc.add(spacer(10));

            PdfPTable brand = new PdfPTable(1);
            brand.setWidthPercentage(100);
            PdfPCell bcell2 = new PdfPCell();
            bcell2.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            bcell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Image logo2 = Image.getInstance(new ClassPathResource("bodhix-logo.png").getInputStream().readAllBytes());
            logo2.scaleToFit(140, 56);
            bcell2.addElement(logo2);
            brand.addCell(bcell2);
            doc.add(brand);

            doc.close();
            return out.toByteArray();
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Could not generate the report");
        }
    }

    private String sectionTitle(String code) {
        return switch (code) {
            case "AD8" -> "AD8 - Informant Interview";
            case "RUDAS" -> "RUDAS - Cognitive Assessment";
            case "PFAQ" -> "PFAQ - Functional Assessment";
            default -> code;
        };
    }

    private String sectionRemark(ScoreCardSectionDto s) {
        return switch (s.getSectionCode()) {
            case "AD8" -> s.isFlaggedForReview() ? "Threshold reached - concern identified" : "Below threshold - low concern";
            case "RUDAS" -> s.isFlaggedForReview() ? "Below normal range - possible impairment" : "Within normal range";
            case "PFAQ" -> s.isFlaggedForReview() ? "Assistance needed - functional limitation" : "Independent functioning";
            default -> s.isFlaggedForReview() ? "Flagged for review" : "No concern";
        };
    }

    private String titleCase(String v) {
        String t = v.replace('_', ' ').toLowerCase();
        return t.substring(0, 1).toUpperCase() + t.substring(1);
    }

    private Paragraph spacer(float h) {
        Paragraph p = new Paragraph(" ");
        p.setLeading(h);
        return p;
    }

    private PdfPTable infoTable(String[][] rows, Font labelF, Font valueF) {
        PdfPTable t = new PdfPTable(2);
        t.setWidthPercentage(100);
        t.setWidths(new float[]{28, 72});
        for (String[] r : rows) {
            t.addCell(cell(r[0], r[1], labelF, valueF));
        }
        return t;
    }

    private PdfPCell cell(String labelText, String valueText, Font labelF, Font valueF) {
        PdfPCell c = new PdfPCell();
        c.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        c.setPadding(4);
        c.addElement(new Paragraph(labelText.toUpperCase(), labelF));
        c.addElement(new Paragraph(valueText == null || valueText.isBlank() ? "-" : valueText, valueF));
        return c;
    }

    private PdfPCell footCell(String labelText, String valueText, Font labelF, Font valueF) {
        PdfPCell c = new PdfPCell();
        c.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        c.setBorderWidthTop(0.8f);
        c.setBorderColor(new Color(203, 213, 225));
        c.setPadding(6);
        c.addElement(new Paragraph(labelText, labelF));
        c.addElement(new Paragraph(valueText == null || valueText.isBlank() ? "-" : valueText, valueF));
        return c;
    }

    private PdfPCell hcell(String text) {
        PdfPCell c = new PdfPCell(new Phrase(text.toUpperCase(),
                new Font(Font.HELVETICA, 7.5f, Font.BOLD, new Color(100, 116, 139))));
        c.setBorder(com.lowagie.text.Rectangle.BOTTOM);
        c.setBorderColor(new Color(226, 232, 240));
        c.setPadding(4);
        return c;
    }

    private PdfPCell hcellRight(String text) {
        PdfPCell c = hcell(text);
        c.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return c;
    }

    private PdfPCell bcell(String text, Font f) {
        PdfPCell c = new PdfPCell(new Phrase(text == null || text.isBlank() ? "-" : text, f));
        c.setBorder(com.lowagie.text.Rectangle.BOTTOM);
        c.setBorderColor(new Color(226, 232, 240));
        c.setPadding(4);
        return c;
    }
}
