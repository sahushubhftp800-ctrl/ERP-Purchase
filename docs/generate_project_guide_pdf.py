import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B")) # Slate 500

        # Draw running header on pages > 1
        if self._pageNumber > 1:
            self.drawString(54, 11 * 72 - 36, "ERP-Based Purchase Order (PO) Management System — Complete Project Guide")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Draw running footer on all pages
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 36, page_text)
        self.drawString(54, 36, "Major Project (Full-Stack B.Tech) | Author: Shubhlesh Sahu")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 8.5 * 72 - 54, 48)

        self.restoreState()

def create_guide_pdf():
    pdf_path_root = "c:/final/ERP-Purchase-Order-System-Project-Guide.pdf"
    pdf_path_docs = "c:/final/docs/ERP-Purchase-Order-System-Project-Guide.pdf"

    doc = SimpleDocTemplate(
        pdf_path_root,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0F172A")    # Slate 900
    NAVY = colors.HexColor("#1E3A8A")       # Blue 900
    BLUE = colors.HexColor("#2563EB")       # Blue 600
    TEAL = colors.HexColor("#0D9488")       # Teal 600
    DARK_TEXT = colors.HexColor("#1E293B")  # Slate 800
    MUTED = colors.HexColor("#475569")      # Slate 600
    CARD_BG = colors.HexColor("#F8FAFC")    # Slate 50
    CARD_BORDER = colors.HexColor("#E2E8F0")# Slate 200
    HIGHLIGHT_BG = colors.HexColor("#EFF6FF") # Blue 50

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=NAVY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=TEAL,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=NAVY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=BLUE,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=DARK_TEXT
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white,
        alignment=0
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=DARK_TEXT
    )

    story = []

    # -------------------------------------------------------------
    # HEADER BANNER & PROJECT TITLE
    # -------------------------------------------------------------
    story.append(Paragraph("ERP-Based Purchase Order (PO) Management System", title_style))
    story.append(Paragraph("Complete End-to-End Project Explanation, Architecture & Viva Guide (In Hindi)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=TEAL, spaceBefore=0, spaceAfter=14))

    # Meta Info Card
    meta_data = [
        [
            Paragraph("<b>Project:</b> Full-Stack Procurement ERP", table_body_style),
            Paragraph("<b>Author:</b> Shubhlesh Sahu", table_body_style),
            Paragraph("<b>Stack:</b> React 18, Node.js, Express, MySQL", table_body_style)
        ],
        [
            Paragraph("<b>Live Cloud URL:</b> <font color='#2563EB'><u>https://erp-backend-production-e6ac0611.up.railway.app</u></font>", table_body_style),
            Paragraph("<b>GitHub:</b> sahushubhftp800-ctrl/ERP-Purchase", table_body_style),
            Paragraph("<b>Test Suite:</b> 39/39 Passed (100%)", table_body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[200, 160, 144])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HIGHLIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BFDBFE")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#DBEAFE")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # SECTION 1: PROJECT KYA HAI?
    # -------------------------------------------------------------
    story.append(Paragraph("1. Yeh Project Kya Hai? (What is this Project?)", h1_style))
    story.append(Paragraph(
        "Yeh ek <b>Web-Based ERP (Enterprise Resource Planning) Application</b> hai jo kisi bhi company "
        "(jaise IT enterprise, manufacturing factory, ya retail organization) ke <b>kharidari (Procurement/Purchasing) ke "
        "complete lifecycle ko automate aur secure karta hai.</b>", body_style))
    story.append(Paragraph(
        "Jab bhi koi company kisi bahar ke vendor (supplier) se koi raw material, laptops, networking equipment ya office supplies "
        "kharidti hai, toh company ek <b>official legal contract document</b> bhejti hai jisko <b>Purchase Order (PO)</b> kaha jata hai. "
        "Hamara software is poore purchasing process ko Excel sheets aur paper forms se hata kar ek centralized, tamper-proof digital system par le aata hai.", body_style))
    story.append(Spacer(1, 8))

    # -------------------------------------------------------------
    # SECTION 2: KYU BANAYA GAYA?
    # -------------------------------------------------------------
    story.append(Paragraph("2. Iski Zaroorat Kyu Padi? (Problems in Traditional Purchasing)", h1_style))
    story.append(Paragraph(
        "Pehle companies me purchasing Excel sheets ya paper vouchers par hoti thi, jisme 4 badi samasyaen (problems) aati thin:", body_style))

    probs_data = [
        [
            Paragraph("<b>1. Excel me Calculation Mistake</b>", table_body_style),
            Paragraph("Manual entry me 5% GST ya Subtotal galat jud jata tha, jisse company ko tax penalties aur accounting losses hote the.", table_body_style)
        ],
        [
            Paragraph("<b>2. Price Manipulation & Fraud</b>", table_body_style),
            Paragraph("Excel sheet me koi bhi employee unit price ko badal sakta tha. Hamare system me backend catalog se locked price verify karta hai.", table_body_style)
        ],
        [
            Paragraph("<b>3. Approval ka koi Audit Trail nahi</b>", table_body_style),
            Paragraph("Bina authorized officer ki permission ke purchases ho jati thin. Hamara system strict Role-Based Access Control (RBAC) enforce karta hai.", table_body_style)
        ],
        [
            Paragraph("<b>4. Stock Update Bhool Jana</b>", table_body_style),
            Paragraph("Warehouse gate par samaan pahunchne ke baad diary me stock update nahi hota tha. Hamara system 'Received' hote hi stock auto-increment karta hai.", table_body_style)
        ]
    ]
    ptable = Table(probs_data, colWidths=[160, 344])
    ptable.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, CARD_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(ptable)
    story.append(Spacer(1, 12))

    # -------------------------------------------------------------
    # SECTION 3: ISKA KAAM KYA HAI? (MAIN MODULES)
    # -------------------------------------------------------------
    story.append(Paragraph("3. Iska Kaam Kya Hai? (Core Modules & Features)", h1_style))
    story.append(Paragraph("Hamare project me 7 mukhya (main) modules hain jo milkar poora ERP system chalate hain:", body_style))

    modules_data = [
        ("Module 01: Authentication & User Roles (RBAC)",
         "3 User Roles hain: <b>Admin</b> (poora system control), <b>Purchaser</b> (order banana aur submit karna), aur <b>Approver</b> (order check karke approve ya reject karna). Passwords bcryptjs se encrypted hain aur session JWT token se secured hai."),
        ("Module 02: Vendor Management (Suppliers)",
         "Suppliers ka centralized repository: Vendor Name, Phone, Email, Office Address, Contact Person aur <b>GSTIN Number</b>. Har vendor ke kitne active orders hain wo live dikhta hai."),
        ("Module 03: Product Catalog & Live Stock",
         "Company ke sabhi products ki master list: Unique SKU code, category, base price, live warehouse inventory stock quantity, aur unit of measurement (Units/Rolls/Boxes)."),
        ("Module 04: Automatic Math & 5% GST Engine",
         "Line-items ka subtotal, exact 5% GST tax calculation, aur grand total automatically compute hota hai. Frontend se bheja gaya fake price reject ho jata hai kyunki backend database se rate verify karta hai."),
        ("Module 05: Purchase Order Workflow State-Machine",
         "Structured transitions: <b>Draft</b> ➔ <b>Submitted</b> ➔ <b>Approved / Rejected</b> ➔ <b>Received</b>. Purchaser kabhi apna order khud approve nahi kar sakta, governance ensure hoti hai."),
        ("Module 06: Auto-Inventory Reconciliation",
         "Jaise hi order ka status 'Received' hota hai (warehouse me maal aane par), database transaction ke andar sabhi order items ki quantity products table me turant add (+X) ho jati hai."),
        ("Module 07: Dynamic PDF Invoice & Executive Dashboard",
         "Server-side binary PDFKit engine official PO Invoice generate karta hai with logo, PO Number, tables aur approval stamp. Dashboard live spend (₹8.87L+), pending approvals aur top suppliers charts display karta hai.")
    ]

    for m_title, m_desc in modules_data:
        story.append(Paragraph(f"• <b>{m_title}</b>", h2_style))
        story.append(Paragraph(m_desc, body_style))

    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # SECTION 4: REAL LIFE STORY / WORKFLOW
    # -------------------------------------------------------------
    story.append(Paragraph("4. Real-World Example: Yeh Kaam Kaise Karta Hai?", h1_style))
    story.append(Paragraph(
        "Maan lijiye aapki company ko office ke liye <b>ABC Tech Supplies Pvt Ltd</b> se <b>10 Enterprise Laptops</b> kharidne hain. "
        "Yeh order hamare system me is tarah process hota hai:", body_style))

    step_data = [
        [Paragraph("<b>Step 1: Order Creation (Purchaser Login)</b>", table_body_style),
         Paragraph("Priya Sharma (Purchaser) login karti hai. Vendor 'ABC Tech' select karti hai aur Product 'Enterprise Laptop' choose karke quantity '10' dalti hai.", table_body_style)],
        [Paragraph("<b>Step 2: Automatic Math Computation</b>", table_body_style),
         Paragraph("Backend catalog se Laptop ka rate ₹40,000 fetch karta hai.<br/>"
                   "• Subtotal = 10 × ₹40,000 = <b>₹4,00,000</b><br/>"
                   "• 5% GST Tax = ₹4,00,000 × 0.05 = <b>₹20,000</b><br/>"
                   "• Grand Total = ₹4,00,000 + ₹20,000 = <b>₹4,20,000</b>", table_body_style)],
        [Paragraph("<b>Step 3: Sequential PO Generation</b>", table_body_style),
         Paragraph("Database row lock (FOR UPDATE) use karke consecutive PO number <b>PO-2026-0002</b> generate karta hai. Status banta hai <b>'Submitted'</b>.", table_body_style)],
        [Paragraph("<b>Step 4: Approval by Manager</b>", table_body_style),
         Paragraph("Rajesh Kumar (Approver) login karta hai, order ko review karta hai aur 'Approve' click karta hai. Order status <b>'Approved'</b> ho jata hai.", table_body_style)],
        [Paragraph("<b>Step 5: PDF Invoice Generation</b>", table_body_style),
         Paragraph("System 1-click me official PDF Invoice banata hai jise Vendor ko email kar diya jata hai.", table_body_style)],
        [Paragraph("<b>Step 6: Delivery & Stock Auto-Increment</b>", table_body_style),
         Paragraph("Warehouse me 10 laptops aane par status 'Received' kiya jata hai. Database me Laptops ka stock 25 se badhkar <b>35</b> ho jata hai!", table_body_style)]
    ]
    step_table = Table(step_data, colWidths=[170, 334])
    step_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, CARD_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(step_table)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # SECTION 5: TECHNICAL ARCHITECTURE
    # -------------------------------------------------------------
    story.append(Paragraph("5. Technical Architecture (Teacher ko batane ke liye)", h1_style))
    story.append(Paragraph(
        "Yeh project industry-standard <b>3-Tier Architecture</b> follow karta hai:", body_style))

    arch_data = [
        [Paragraph("<b>Tier</b>", table_header_style), Paragraph("<b>Technology Used</b>", table_header_style), Paragraph("<b>Role / Purpose in Project</b>", table_header_style)],
        [Paragraph("<b>Tier 1: Presentation</b>", table_body_style), Paragraph("React 18 + Tailwind CSS v4 + Vite", table_body_style), Paragraph("Fast, responsive Single Page Application (SPA). Zero page reload, interactive forms, toast popups, and dynamic UI tables.", table_body_style)],
        [Paragraph("<b>Tier 2: Application Logic</b>", table_body_style), Paragraph("Node.js + Express 5 REST API", table_body_style), Paragraph("JWT authentication, RBAC authorization, GST math engine, database price verification, and PDFKit document streaming.", table_body_style)],
        [Paragraph("<b>Tier 3: Database</b>", table_body_style), Paragraph("MySQL 8.0 (InnoDB Engine, 3NF)", table_body_style), Paragraph("7 normalized tables. InnoDB engine guarantees ACID transactional integrity and rollback protection on errors.", table_body_style)],
        [Paragraph("<b>DevOps & Cloud</b>", table_body_style), Paragraph("Railway Cloud + GitHub CI/CD", table_body_style), Paragraph("Live internet hosting with persistent cloud volume, automatic database migrations, and continuous GitHub deployment.", table_body_style)]
    ]
    arch_table = Table(arch_data, colWidths=[120, 150, 234])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, CARD_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # SECTION 6: TOP 10 VIVA QUESTIONS & ANSWERS (IN HINDI)
    # -------------------------------------------------------------
    story.append(Paragraph("6. Top Viva Questions & Answers (Teacher ko kaise samjhayein)", h1_style))

    viva_qa = [
        ("Q1: Aapka project doosre simple shopping projects se alag kaise hai?",
         "Ans: Simple shopping apps me sirf buyer samaan add karta hai aur order place ho jata hai. Hamara project ek B2B ERP system hai jisme Multi-Role Approval Workflow hota hai (Purchaser order banata hai, Senior Approver use approve karta hai), 5% GST tax backend par lock hota hai, consecutive row-locked PO numbers bante hain, aur warehouse me delivery mark hone par inventory stock auto-reconcile hota hai."),
        
        ("Q2: Database Normalization (3NF) kyu zaroori thi?",
         "Ans: Humne 7 normalized tables banayi hain. Agar hum vendor aur product ki details order table me hi store karte, toh vendor ka phone number ya GST badalne par hazaaron purane orders me data mismatch ho jata (Update Anomaly). 3NF me har entity alag table me hai aur Foreign Keys se linked hai."),

        ("Q3: Frontend se aane wale product price par backend trust kyu nahi karta?",
         "Ans: Agar frontend se bheja gaya price backend bina check kiye accept kar lega, toh koi bhi hacker Inspect Element ya Postman se ₹40,000 ke laptop ko ₹400 karke order place kar dega. Isliye hamara backend frontend ke price ko ignore karta hai aur database ke verified products table se live price fetch karta hai."),

        ("Q4: Row Locking (SELECT ... FOR UPDATE) kyu use kiya gaya hai?",
         "Ans: Jab do purchaser ek hi second me checkout dabayein, toh unhe alag-alag consecutive PO numbers milne chahiye (e.g. PO-2026-0001 aur PO-2026-0002). Row locking race condition ko rokti hai taaki duplicate PO numbers na banen."),

        ("Q5: Mark as Received par kya hota hai?",
         "Ans: Jab approver order ko 'Received' mark karta hai, database transaction ke andar order ke sabhi items ki quantity products table me increment ho jati hai (stock_quantity = stock_quantity + quantity). Yeh operation atomic hota hai.")
    ]

    for q, a in viva_qa:
        story.append(Paragraph(f"<b>{q}</b>", h2_style))
        story.append(Paragraph(a, body_style))

    story.append(Spacer(1, 12))

    # -------------------------------------------------------------
    # SECTION 7: LIVE CLOUD DETAILS & LOGIN CREDENTIALS
    # -------------------------------------------------------------
    story.append(Paragraph("7. Live Production Cloud Details & Test Logins", h1_style))
    story.append(Paragraph("Aapka project live internet par chal raha hai. Evaluator ko demo dikhane ke liye in credentials ka use karein:", body_style))

    creds_data = [
        [Paragraph("<b>Role</b>", table_header_style), Paragraph("<b>Email Address</b>", table_header_style), Paragraph("<b>Password</b>", table_header_style), Paragraph("<b>Permissions / Access Scope</b>", table_header_style)],
        [Paragraph("👑 <b>Admin</b>", table_body_style), Paragraph("admin@erp.com", table_body_style), Paragraph("admin123", table_body_style), Paragraph("Poora ERP system, User Management, Reports, Catalogs, Approvals", table_body_style)],
        [Paragraph("🛒 <b>Purchaser</b>", table_body_style), Paragraph("purchaser@erp.com", table_body_style), Paragraph("purchaser123", table_body_style), Paragraph("Orders banana, Edit karna, Submit for approval, Vendors & Products add karna", table_body_style)],
        [Paragraph("✍️ <b>Approver</b>", table_body_style), Paragraph("approver@erp.com", table_body_style), Paragraph("approver123", table_body_style), Paragraph("Submitted orders ko review karna, Approve / Reject karna, Mark as Received", table_body_style)]
    ]
    creds_table = Table(creds_data, colWidths=[90, 130, 90, 194])
    creds_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, CARD_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(creds_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "🌐 <b>Live Web URL:</b> <font color='#2563EB'><u>https://erp-backend-production-e6ac0611.up.railway.app</u></font><br/>"
        "📁 <b>GitHub Repo:</b> <font color='#2563EB'><u>https://github.com/sahushubhftp800-ctrl/ERP-Purchase</u></font>",
        body_style
    ))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)

    # Copy to docs folder as well
    import shutil
    shutil.copyfile(pdf_path_root, pdf_path_docs)
    print("PDF successfully generated at:")
    print("1.", pdf_path_root)
    print("2.", pdf_path_docs)

if __name__ == "__main__":
    create_guide_pdf()
