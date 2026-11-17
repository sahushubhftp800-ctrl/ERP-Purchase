import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # Set 16:9 widescreen dimensions (13.333 x 7.5 inches)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Enterprise Color Palette
    PRIMARY_NAVY = RGBColor(15, 23, 42)       # Slate 900
    HEADER_BLUE  = RGBColor(30, 58, 138)      # Blue 900
    ACCENT_BLUE  = RGBColor(37, 99, 235)      # Blue 600
    ACCENT_TEAL  = RGBColor(13, 148, 136)     # Teal 600
    DARK_TEXT    = RGBColor(30, 41, 59)       # Slate 800
    MUTED_TEXT   = RGBColor(100, 116, 139)    # Slate 500
    CARD_BG      = RGBColor(248, 250, 252)    # Slate 50
    CARD_BORDER  = RGBColor(226, 232, 240)    # Slate 200
    WHITE        = RGBColor(255, 255, 255)
    LIGHT_BLUE   = RGBColor(239, 246, 255)    # Blue 50

    def add_header(slide, title_text, category_text="ERP-BASED PURCHASE ORDER MANAGEMENT SYSTEM"):
        # Header background banner
        header_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.15))
        header_shape.fill.solid()
        header_shape.fill.fore_color.rgb = HEADER_BLUE
        header_shape.line.fill.background()

        # Category / Breadcrumb
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.12), Inches(11.5), Inches(0.3))
        cat_tf = cat_box.text_frame
        cat_tf.word_wrap = True
        p_cat = cat_tf.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = RGBColor(147, 197, 253) # Light Blue 300
        p_cat.font.name = "Calibri"

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.40), Inches(11.5), Inches(0.65))
        title_tf = title_box.text_frame
        title_tf.word_wrap = True
        p_title = title_tf.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE
        p_title.font.name = "Calibri"

        # Accent bottom line
        accent_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.15), Inches(13.333), Inches(0.06))
        accent_line.fill.solid()
        accent_line.fill.fore_color.rgb = ACCENT_TEAL
        accent_line.line.fill.background()

        # Footer
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.15), Inches(11.733), Inches(0.3))
        ftf = footer_box.text_frame
        p_ft = ftf.paragraphs[0]
        p_ft.text = "Major Project Presentation | B.Tech Full-Stack Engineering | React.js • Node.js • MySQL • Cloud Deployment"
        p_ft.font.size = Pt(9)
        p_ft.font.color.rgb = MUTED_TEXT
        p_ft.font.name = "Calibri"

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)
        return card

    # ==========================================
    # SLIDE 1: TITLE SLIDE (Dark Premium Theme)
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = PRIMARY_NAVY
    bg1.line.fill.background()

    # Top accent line
    tline = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.12))
    tline.fill.solid()
    tline.fill.fore_color.rgb = ACCENT_TEAL
    tline.line.fill.background()

    # Title box
    tbox = s1.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.333), Inches(2.2))
    ttf = tbox.text_frame
    ttf.word_wrap = True

    p0 = ttf.paragraphs[0]
    p0.text = "ENTERPRISE RESOURCE PLANNING"
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = RGBColor(45, 212, 191) # Teal 400
    p0.font.name = "Calibri"

    p1 = ttf.add_paragraph()
    p1.text = "ERP-Based Purchase Order (PO)\nManagement System"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = WHITE
    p1.font.name = "Calibri"
    p1.space_before = Pt(8)

    p2 = ttf.add_paragraph()
    p2.text = "Vendor & Product Integration • Automated 5% GST Math • Multi-Role RBAC Workflow • Cloud Deployed"
    p2.font.size = Pt(14)
    p2.font.color.rgb = RGBColor(148, 163, 184) # Slate 400
    p2.font.name = "Calibri"
    p2.space_before = Pt(12)

    # Info card 1: Tech Stack
    c1 = add_card(s1, Inches(1.0), Inches(3.8), Inches(5.4), Inches(2.6), bg_color=RGBColor(30, 41, 59), border_color=RGBColor(51, 65, 85))
    c1_box = s1.shapes.add_textbox(Inches(1.2), Inches(4.0), Inches(5.0), Inches(2.2))
    c1_tf = c1_box.text_frame
    c1_tf.word_wrap = True

    cp1 = c1_tf.paragraphs[0]
    cp1.text = "🛠️ TECHNOLOGY ARCHITECTURE"
    cp1.font.size = Pt(13)
    cp1.font.bold = True
    cp1.font.color.rgb = RGBColor(56, 189, 248) # Sky 400

    bullets_tech = [
        "Frontend: React.js 18, Vite, Tailwind CSS v4, Lucide Icons",
        "Backend: Node.js, Express.js 5 REST API, JWT, Helmet",
        "Database: MySQL 8.0 (3NF Normalized, InnoDB, ACID)",
        "Security & Reports: bcryptjs, PDFKit, Rate Limiting",
        "Live Deployment: Railway Cloud + GitHub CI/CD"
    ]
    for b in bullets_tech:
        bp = c1_tf.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(11)
        bp.font.color.rgb = RGBColor(226, 232, 240)
        bp.space_before = Pt(4)

    # Info card 2: Student & Guide Info
    c2 = add_card(s1, Inches(6.8), Inches(3.8), Inches(5.5), Inches(2.6), bg_color=RGBColor(30, 41, 59), border_color=RGBColor(51, 65, 85))
    c2_box = s1.shapes.add_textbox(Inches(7.0), Inches(4.0), Inches(5.1), Inches(2.2))
    c2_tf = c2_box.text_frame
    c2_tf.word_wrap = True

    cp2 = c2_tf.paragraphs[0]
    cp2.text = "🎓 PROJECT SUBMISSION DETAILS"
    cp2.font.size = Pt(13)
    cp2.font.bold = True
    cp2.font.color.rgb = RGBColor(56, 189, 248)

    bullets_info = [
        "Project Type: Full-Stack B.Tech Major Project / Capstone",
        "Author / Presenter: Shubhlesh Sahu",
        "Department: Computer Science & Engineering",
        "Verified Test Suite: 39 / 39 Integration Tests Passed (100%)",
        "Status: 100% End-to-End Live in Cloud Production"
    ]
    for b in bullets_info:
        bp = c2_tf.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(11)
        bp.font.color.rgb = RGBColor(226, 232, 240)
        bp.space_before = Pt(4)

    s1.notes_slide.notes_text_frame.text = (
        "Good morning respected evaluators. Today, I am presenting my major project: "
        "'ERP-Based Purchase Order Management System'. Procurement and vendor purchasing is the financial "
        "backbone of any enterprise. Our project eliminates manual paperwork, human errors in tax computation, "
        "and purchase delays by automating the complete lifecycle from vendor onboarding to multi-stage approvals "
        "and automated warehouse inventory reconciliation."
    )

    # ==========================================
    # SLIDE 2: PROBLEM STATEMENT & MOTIVATION
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Problem Statement & Industry Challenges in Purchasing")

    problems = [
        ("Manual Paperwork & Excel Chaos", "Spreadsheet Bottlenecks", [
            "Procurement teams rely on manual Excel files and paper forms.",
            "High risk of lost records, conflicting copies, and duplicate orders.",
            "Zero real-time synchronization between purchasers and warehouse teams.",
            "Audits take days to manually cross-reference invoices with receipts."
        ]),
        ("Calculation Errors & Fraud", "Tax & Price Discrepancies", [
            "Manual GST (5%) and line-item math creates accounting mistakes.",
            "Frontend tampering: Vulnerable systems let buyers modify unit prices.",
            "Subtotal, tax rate, and grand total calculations lack tamper-proof validation.",
            "Lack of sequential, consecutive PO numbering leads to missing invoices."
        ]),
        ("No Role-Based Accountability", "Workflow & Approval Delays", [
            "Employees place unauthorized purchase orders without supervisor sign-off.",
            "No separation of duties between Purchasers, Approvers, and Administrators.",
            "Inventory stock quantities are updated late or forgotten upon arrival.",
            "Supplier contact information and GSTIN records are scattered across emails."
        ])
    ]

    for i, (title, subtitle, points) in enumerate(problems):
        x = Inches(0.8 + i * 4.0)
        card = add_card(s2, x, Inches(1.6), Inches(3.7), Inches(5.1))
        
        # Header banner inside card
        top_banner = s2.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, Inches(1.6), Inches(3.7), Inches(0.8))
        top_banner.fill.solid()
        top_banner.fill.fore_color.rgb = HEADER_BLUE if i == 0 else (ACCENT_BLUE if i == 1 else RGBColor(190, 24, 93))
        top_banner.line.fill.background()

        tb_box = s2.shapes.add_textbox(x + Inches(0.15), Inches(1.65), Inches(3.4), Inches(0.7))
        tbtf = tb_box.text_frame
        tbtf.word_wrap = True
        tp1 = tbtf.paragraphs[0]
        tp1.text = title
        tp1.font.size = Pt(13)
        tp1.font.bold = True
        tp1.font.color.rgb = WHITE

        tp2 = tbtf.add_paragraph()
        tp2.text = subtitle.upper()
        tp2.font.size = Pt(9)
        tp2.font.color.rgb = RGBColor(226, 232, 240)

        # Content bullets
        c_box = s2.shapes.add_textbox(x + Inches(0.2), Inches(2.55), Inches(3.3), Inches(4.0))
        ctf = c_box.text_frame
        ctf.word_wrap = True
        for idx, pt in enumerate(points):
            p = ctf.paragraphs[0] if idx == 0 else ctf.add_paragraph()
            p.text = "• " + pt
            p.font.size = Pt(11)
            p.font.color.rgb = DARK_TEXT
            p.space_before = Pt(8)

    s2.notes_slide.notes_text_frame.text = (
        "In traditional businesses, purchasing is done via spreadsheets, emails, or paper vouchers. "
        "This creates three critical vulnerabilities: first, employees can accidentally or intentionally "
        "manipulate product unit prices; second, tax computations like 5% GST are often miscalculated; "
        "and third, there is no immutable audit trail of who created, reviewed, or approved the expense. "
        "Our system was designed specifically to solve these four industry challenges."
    )

    # ==========================================
    # SLIDE 3: PROPOSED SOLUTION & OBJECTIVES
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Proposed Solution & Core Project Objectives")

    solutions = [
        ("Automated Calculation Engine", "Eliminates Human Tax Errors",
         "The system strictly enforces mathematical formulas: Subtotal = sum(Quantity * Unit Price). 5% GST Tax = Subtotal * 0.05. Grand Total = Subtotal + Tax. Fully calculated on server-side with verified database catalog prices."),
        ("Strict Multi-Role RBAC Workflow", "Enforces Corporate Governance",
         "Implements a secure state-machine: Draft -> Submitted -> Approved/Rejected -> Received. Purchasers can create orders but cannot approve them. Designated Approvers must authorize all expenditures."),
        ("ACID Database & Auto-Inventory", "Prevents Stock Discrepancies",
         "Built with MySQL 8.0 InnoDB engine with transaction rollbacks. When an order is marked 'Received', the system automatically increments warehouse stock quantities for all items in a single atomic transaction."),
        ("Instant PDF & Executive Analytics", "Paperless Compliance",
         "Generates official, downloadable procurement invoices on-the-fly using PDFKit with custom corporate letterhead and signatures. Real-time executive dashboard tracks total spend, approval rate, and vendor performance.")
    ]

    for i, (head, sub, desc) in enumerate(solutions):
        row = i // 2
        col = i % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.6 + row * 2.65)
        
        card = add_card(s3, x, y, Inches(5.75), Inches(2.4), bg_color=CARD_BG, border_color=CARD_BORDER)
        
        box = s3.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(5.25), Inches(2.0))
        btf = box.text_frame
        btf.word_wrap = True
        
        p_num = btf.paragraphs[0]
        p_num.text = f"OBJECTIVE 0{i+1}: {head.upper()}"
        p_num.font.size = Pt(13)
        p_num.font.bold = True
        p_num.font.color.rgb = HEADER_BLUE

        p_sub = btf.add_paragraph()
        p_sub.text = sub
        p_sub.font.size = Pt(10.5)
        p_sub.font.bold = True
        p_sub.font.color.rgb = ACCENT_TEAL
        p_sub.space_before = Pt(2)

        p_desc = btf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = DARK_TEXT
        p_desc.space_before = Pt(6)

    s3.notes_slide.notes_text_frame.text = (
        "Our solution provides a centralized, secure web-based ERP system. The core objective is twofold: compliance and automation. "
        "For example, if a company purchases 10 laptops at ₹40,000 each, our calculation engine automatically locks the price, calculates "
        "a ₹4,00,000 subtotal, applies 5% GST of ₹20,000, and outputs a grand total of ₹4,20,000. It prevents client-side tampering by "
        "fetching verified catalog prices on the server."
    )

    # ==========================================
    # SLIDE 4: SYSTEM ARCHITECTURE (3-TIER)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "3-Tier Enterprise System Architecture")

    tiers = [
        ("TIER 1: PRESENTATION LAYER", "React 18 + Tailwind CSS v4 SPA", ACCENT_BLUE, [
            "Single Page Application (SPA) powered by Vite bundling",
            "Tailwind CSS v4 for responsive, high-density enterprise UI",
            "Lucide React iconography & animated feedback toasts",
            "Client routing with React Router v6 & Protected Routes",
            "Axios HTTP client with automatic JWT token interceptors"
        ]),
        ("TIER 2: APPLICATION & LOGIC LAYER", "Node.js + Express 5 REST API", HEADER_BLUE, [
            "RESTful API architecture with decoupled controller-route structure",
            "JWT Authentication & Role-Based Authorization (RBAC)",
            "Server-side calculation engine & price verification",
            "PDFKit binary stream engine for official PO invoice rendering",
            "Helmet HTTP security, rate limiters, and reverse proxy trust"
        ]),
        ("TIER 3: DATA & PERSISTENCE LAYER", "MySQL 8.0 Relational Engine", ACCENT_TEAL, [
            "Relational schema normalized to 3rd Normal Form (3NF)",
            "InnoDB engine delivering full ACID transactional integrity",
            "Connection pooling (mysql2/promise) for high concurrency",
            "Foreign key constraints with CASCADE and RESTRICT safety",
            "Self-healing automated schema migrations on startup"
        ])
    ]

    for i, (title, sub, color, points) in enumerate(tiers):
        x = Inches(0.8 + i * 4.0)
        card = add_card(s4, x, Inches(1.6), Inches(3.7), Inches(5.1))

        # Header tag
        htag = s4.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, Inches(1.6), Inches(3.7), Inches(0.8))
        htag.fill.solid()
        htag.fill.fore_color.rgb = color
        htag.line.fill.background()

        ht_box = s4.shapes.add_textbox(x + Inches(0.15), Inches(1.65), Inches(3.4), Inches(0.7))
        httf = ht_box.text_frame
        httf.word_wrap = True
        tp1 = httf.paragraphs[0]
        tp1.text = title
        tp1.font.size = Pt(12)
        tp1.font.bold = True
        tp1.font.color.rgb = WHITE

        tp2 = httf.add_paragraph()
        tp2.text = sub
        tp2.font.size = Pt(9.5)
        tp2.font.color.rgb = RGBColor(241, 245, 249)

        # Bullets
        b_box = s4.shapes.add_textbox(x + Inches(0.2), Inches(2.55), Inches(3.3), Inches(4.0))
        btf = b_box.text_frame
        btf.word_wrap = True
        for idx, pt in enumerate(points):
            p = btf.paragraphs[0] if idx == 0 else btf.add_paragraph()
            p.text = "• " + pt
            p.font.size = Pt(11)
            p.font.color.rgb = DARK_TEXT
            p.space_before = Pt(8)

    s4.notes_slide.notes_text_frame.text = (
        "We implemented an industry-standard 3-tier architecture. The presentation layer uses React 18 and Tailwind CSS for a reactive, "
        "zero-reload user experience. The application layer runs on Express 5, handling authentication, business logic, validation, and PDF streaming. "
        "The data layer uses MySQL 8.0 with InnoDB to guarantee ACID transaction properties during multi-item order creation."
    )

    # ==========================================
    # SLIDE 5: DATABASE DESIGN & 3NF
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Relational Database Design (Normalized to 3NF)")

    # Left card: Table List
    c_left = add_card(s5, Inches(0.8), Inches(1.6), Inches(6.0), Inches(5.1))
    c_left_box = s5.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(5.6), Inches(4.7))
    cl_tf = c_left_box.text_frame
    cl_tf.word_wrap = True

    p = cl_tf.paragraphs[0]
    p.text = "📊 7 NORMALIZED RELATIONAL TABLES (3NF)"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = HEADER_BLUE

    tables = [
        ("1. users", "id, name, email (UNIQUE), password (bcrypt), role (ENUM)"),
        ("2. vendors", "id, vendor_name, email, phone, address, gst_number"),
        ("3. products", "id, product_name, sku (UNIQUE), category, price, stock"),
        ("4. purchase_orders", "id, po_number (UNIQUE), vendor_id, subtotal, tax, total, status"),
        ("5. purchase_order_items", "id, order_id (FK), product_id (FK), quantity, unit_price, line_total"),
        ("6. order_status_history", "id, order_id (FK), status, changed_by (FK), comment, created_at"),
        ("7. audit_logs", "id, user_id (FK), action, details (TEXT), ip_address, created_at")
    ]
    for tbl, cols in tables:
        tp = cl_tf.add_paragraph()
        tp.text = f"{tbl}: {cols}"
        tp.font.size = Pt(10.5)
        tp.font.color.rgb = DARK_TEXT
        tp.space_before = Pt(6)

    # Right card: Normalization justification
    c_right = add_card(s5, Inches(7.0), Inches(1.6), Inches(5.5), Inches(5.1))
    c_right_box = s5.shapes.add_textbox(Inches(7.2), Inches(1.8), Inches(5.1), Inches(4.7))
    cr_tf = c_right_box.text_frame
    cr_tf.word_wrap = True

    p = cr_tf.paragraphs[0]
    p.text = "🎯 WHY 3NF & REFERENTIAL INTEGRITY?"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_TEAL

    points_norm = [
        ("Elimination of Redundancy", "Vendor and product details are never duplicated in orders; only foreign key references are maintained."),
        ("Zero Update Anomalies", "Updating a supplier's phone number or GSTIN in `vendors` automatically reflects across all linked purchase orders."),
        ("ON DELETE CASCADE", "Deleting a draft purchase order automatically cleans up all associated line-items and history entries without leaving orphan records."),
        ("ON DELETE RESTRICT", "A catalog product that has historical orders cannot be deleted, protecting company audit records."),
        ("Row Locking (`FOR UPDATE`)", "Prevents duplicate PO numbers during concurrent checkout requests by different purchasers.")
    ]
    for head, desc in points_norm:
        hp = cr_tf.add_paragraph()
        hp.text = f"• {head}:"
        hp.font.bold = True
        hp.font.size = Pt(11)
        hp.font.color.rgb = HEADER_BLUE
        hp.space_before = Pt(6)

        dp = cr_tf.add_paragraph()
        dp.text = f"   {desc}"
        dp.font.size = Pt(10)
        dp.font.color.rgb = DARK_TEXT

    s5.notes_slide.notes_text_frame.text = (
        "Database normalization was a top priority. Instead of storing repeated vendor or product details inside the order table, "
        "we decomposed the schema into 7 relational tables adhering to Third Normal Form (3NF). We enforced foreign key constraints "
        "with cascade policies—for instance, deleting a draft order cascades to its items, while products with order history are protected using RESTRICT."
    )

    # ==========================================
    # SLIDE 6: CALCULATION ENGINE & CONCURRENCY
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Business Logic: Calculation Engine & ACID Transactions")

    # Formula Card (Left)
    fc = add_card(s6, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1))
    fc_box = s6.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(5.4), Inches(4.7))
    ftf = fc_box.text_frame
    ftf.word_wrap = True

    p = ftf.paragraphs[0]
    p.text = "🧮 AUTOMATED MATHEMATICAL FORMULAS"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = HEADER_BLUE

    calc_points = [
        ("1. Line Total Formula", "Line Total = Quantity × Verified Database Catalog Price", "Frontend prices are ignored. The backend queries product prices from MySQL."),
        ("2. Subtotal Formula", "Subtotal = Σ (Line Total_1 + Line Total_2 + ... + Line Total_n)", "Computed by summing individual line totals of all validated items."),
        ("3. Government Tax (5% GST)", "Tax Amount = Subtotal × 0.05", "Calculated automatically with exact 2-decimal precision (e.g. ₹20,000 on ₹4 Lakh)."),
        ("4. Grand Total Formula", "Grand Total = Subtotal + Tax Amount", "Final payable amount recorded immutably in purchase_orders table.")
    ]
    for t1, fmla, expl in calc_points:
        p1 = ftf.add_paragraph()
        p1.text = t1
        p1.font.bold = True
        p1.font.size = Pt(11)
        p1.font.color.rgb = ACCENT_TEAL
        p1.space_before = Pt(6)

        p2 = ftf.add_paragraph()
        p2.text = f"   Formula: {fmla}"
        p2.font.bold = True
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = HEADER_BLUE

        p3 = ftf.add_paragraph()
        p3.text = f"   Rule: {expl}"
        p3.font.size = Pt(9.5)
        p3.font.color.rgb = DARK_TEXT

    # Live Example & Concurrency Card (Right)
    rc = add_card(s6, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.1))
    rc_box = s6.shapes.add_textbox(Inches(7.0), Inches(1.8), Inches(5.3), Inches(4.7))
    rtf = rc_box.text_frame
    rtf.word_wrap = True

    p = rtf.paragraphs[0]
    p.text = "⚡ CONCURRENCY & TRANSACTION SAFETY"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE

    points_safe = [
        ("Live Prompt Example Verification", "Vendor: ABC Traders | Product: Enterprise Laptop Core i7\nQuantity: 10 | Unit Price: ₹40,000\nSubtotal: ₹4,00,000 | 5% GST: ₹20,000 | Grand Total: ₹4,20,000\nVerified live in production database."),
        ("Sequential Numbering with Row Lock", "Uses `SELECT po_number ... FOR UPDATE` inside an open transaction. Generates consecutive PO-YYYY-XXXX without duplicate race conditions."),
        ("All-or-Nothing ACID Rollback", "Order header, items, and initial history insertion execute in a single database transaction. If any item fails, `connection.rollback()` cleans up everything."),
        ("Inventory Stock Auto-Increment", "When status changes to 'Received', stock_quantity is incremented automatically in products catalog.")
    ]
    for h, desc in points_safe:
        hp = rtf.add_paragraph()
        hp.text = f"• {h}:"
        hp.font.bold = True
        hp.font.size = Pt(11)
        hp.font.color.rgb = HEADER_BLUE
        hp.space_before = Pt(6)

        dp = rtf.add_paragraph()
        dp.text = f"   {desc}"
        dp.font.size = Pt(10)
        dp.font.color.rgb = DARK_TEXT

    s6.notes_slide.notes_text_frame.text = (
        "Our calculation engine enforces strict mathematical integrity. When an order is submitted, the backend opens a database transaction, "
        "locks the counter row to generate an incremental PO number like PO-2026-0002, recalculates line totals using catalog prices, "
        "applies 5% GST, and records the grand total. If any single item fails validation, the entire transaction rolls back cleanly, "
        "leaving zero orphaned records."
    )

    # ==========================================
    # SLIDE 7: SECURITY & RBAC WORKFLOW
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Security Architecture & Role-Based Access Control (RBAC)")

    # Left: Security features
    sc = add_card(s7, Inches(0.8), Inches(1.6), Inches(4.5), Inches(5.1))
    sc_box = s7.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(4.1), Inches(4.7))
    stf = sc_box.text_frame
    stf.word_wrap = True

    p = stf.paragraphs[0]
    p.text = "🔒 4-LAYER SECURITY CONTROLS"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = HEADER_BLUE

    sec_layers = [
        ("Password Encryption", "Hashed with bcryptjs (10 salt rounds). Plaintext passwords never enter the database."),
        ("Stateless JWT Tokens", "HMAC-SHA256 signature containing user ID, email, and role. Auto-expires in 7 days."),
        ("Rate Limiting Protection", "Restricts brute-force attacks to 100 requests per 15-minute window via express-rate-limit."),
        ("HTTP Security Headers", "Helmet middleware protects against Cross-Site Scripting (XSS), clickjacking, and MIME attacks.")
    ]
    for l, d in sec_layers:
        lp = stf.add_paragraph()
        lp.text = f"• {l}:"
        lp.font.bold = True
        lp.font.size = Pt(11)
        lp.font.color.rgb = ACCENT_TEAL
        lp.space_before = Pt(6)

        dp = stf.add_paragraph()
        dp.text = f"   {d}"
        dp.font.size = Pt(10)
        dp.font.color.rgb = DARK_TEXT

    # Right: RBAC Table
    rc7 = add_card(s7, Inches(5.6), Inches(1.6), Inches(6.9), Inches(5.1))
    rc7_box = s7.shapes.add_textbox(Inches(5.8), Inches(1.8), Inches(6.5), Inches(4.7))
    rtf7 = rc7_box.text_frame
    rtf7.word_wrap = True

    p = rtf7.paragraphs[0]
    p.text = "👥 ROLE-BASED ACCESS CONTROL (RBAC) MATRIX"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE

    # Add Table
    table_shape = s7.shapes.add_table(7, 4, Inches(5.8), Inches(2.2), Inches(6.5), Inches(4.2))
    table = table_shape.table
    table.columns[0].width = Inches(2.9)
    table.columns[1].width = Inches(1.2)
    table.columns[2].width = Inches(1.2)
    table.columns[3].width = Inches(1.2)

    headers = ["Functional Action / Endpoint", "Admin", "Purchaser", "Approver"]
    for j, h in enumerate(headers):
        cell = table.cell(0, j)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = HEADER_BLUE
        cell.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(10.5)
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER if j > 0 else PP_ALIGN.LEFT

    matrix_data = [
        ("Create & Edit Draft Orders", "YES", "YES", "NO"),
        ("Submit PO for Approval", "YES", "YES", "NO"),
        ("Approve / Reject Purchase Orders", "YES", "NO", "YES"),
        ("Mark Order as Received (Stock Update)", "YES", "NO", "YES"),
        ("Manage Product & Vendor Catalogs", "YES", "YES", "NO"),
        ("User & Role Management (/api/auth/users)", "YES", "NO", "NO")
    ]
    for row_idx, row in enumerate(matrix_data):
        for col_idx, val in enumerate(row):
            cell = table.cell(row_idx + 1, col_idx)
            cell.text = val
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            if row_idx % 2 == 1:
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT_BLUE
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(10)
            p.font.color.rgb = DARK_TEXT
            p.alignment = PP_ALIGN.CENTER if col_idx > 0 else PP_ALIGN.LEFT
            if val == "YES":
                p.font.bold = True
                p.font.color.rgb = RGBColor(16, 185, 129) # Green
            elif val == "NO":
                p.font.color.rgb = RGBColor(239, 68, 68)   # Red

    s7.notes_slide.notes_text_frame.text = (
        "Security in enterprise software is paramount. We implemented strict Role-Based Access Control. "
        "A Purchaser can create and submit orders, but cannot approve their own purchases. "
        "Only designated Approvers or Admins can approve or reject orders. Authentication uses salted bcrypt hashing "
        "and JWT tokens passed via HTTP Authorization headers. Endpoints are guarded by middleware that checks token validity."
    )

    # ==========================================
    # SLIDE 8: ENTERPRISE FEATURES & AI
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Enterprise Modules & AI Catalog Integration")

    features = [
        ("📄 Instant Binary PDF Invoice Engine", "Server-Side Rendering via PDFKit",
         "Generates official, print-ready Purchase Order documents dynamically at `/api/orders/:id/pdf`. Includes corporate logo, sequential PO number, vendor GST details, line items table, 5% GST computation, and authorized approval signatures."),
        ("📈 Real-Time Executive Analytics", "Instant Procurement Intelligence",
         "Interactive dashboard displaying total company spend (₹8.87 Lakhs+), live orders count, approval turnaround times, status breakdown (Draft, Submitted, Approved, Received), and top supplier spend distribution."),
        ("🤖 AI Product Catalog Assistant", "Automated Enterprise Content Generation",
         "Built-in AI synthesis assistant that accepts a product title, SKU, and category to automatically draft professional, polished product specifications and descriptions for warehouse catalog managers."),
        ("🕒 Immutable Status History Timeline", "Zero-Tampering Procurement Audit Trail",
         "Every status transition automatically logs the timestamp, previous state, new state, reviewer identity, and review comments in `order_status_history`. Displayed visually as an interactive timeline on the order details page.")
    ]

    for i, (head, sub, desc) in enumerate(features):
        row = i // 2
        col = i % 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.6 + row * 2.65)
        
        card = add_card(s8, x, y, Inches(5.75), Inches(2.4), bg_color=CARD_BG, border_color=CARD_BORDER)
        box = s8.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(5.25), Inches(2.0))
        btf = box.text_frame
        btf.word_wrap = True
        
        p_head = btf.paragraphs[0]
        p_head.text = head
        p_head.font.size = Pt(13)
        p_head.font.bold = True
        p_head.font.color.rgb = HEADER_BLUE

        p_sub = btf.add_paragraph()
        p_sub.text = sub
        p_sub.font.size = Pt(10.5)
        p_sub.font.bold = True
        p_sub.font.color.rgb = ACCENT_TEAL
        p_sub.space_before = Pt(2)

        p_desc = btf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(10.5)
        p_desc.font.color.rgb = DARK_TEXT
        p_desc.space_before = Pt(6)

    s8.notes_slide.notes_text_frame.text = (
        "Beyond basic CRUD operations, our system includes advanced enterprise modules. We have a built-in server-side PDF generator "
        "using PDFKit that creates high-resolution invoices on demand. We integrated an AI catalog assistant that drafts professional "
        "product descriptions for warehouse managers. Furthermore, every status change records the timestamp, user ID, and comments in a dedicated audit log."
    )

    # ==========================================
    # SLIDE 9: QUALITY ASSURANCE & CLOUD DEPLOYMENT
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Quality Assurance, 39 Tests & Production Cloud Deployment")

    # Left: Test Suite
    tc = add_card(s9, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1))
    tc_box = s9.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(5.4), Inches(4.7))
    ttf9 = tc_box.text_frame
    ttf9.word_wrap = True

    p = ttf9.paragraphs[0]
    p.text = "🧪 39 / 39 INTEGRATION TESTS (100% PASS RATE)"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = RGBColor(16, 185, 129)

    test_modules = [
        ("Module 1: Authentication & Access Control", "12 Tests: Correct logins, password rejection, invalid token blocking, RBAC restriction."),
        ("Module 2: Vendor Management & Validation", "7 Tests: List, search safety, empty name rejection, full profiles, active order protection."),
        ("Module 3: Product Catalog & AI Assistant", "6 Tests: Catalog listing, negative price rejection, SKU uniqueness, AI synthesis."),
        ("Module 4: PO Calculations & Tax Math", "5 Tests: 0-quantity rejection, foreign key validation, exact 5% GST mathematical proof."),
        ("Module 5: Workflow State Machine & PDF", "6 Tests: Approval by approver, denial to purchaser, PDF generation, stock increment."),
        ("Module 6: Dashboard & Reports", "3 Tests: Real-time aggregation, monthly trends, safe deletion verification.")
    ]
    for m, d in test_modules:
        mp = ttf9.add_paragraph()
        mp.text = f"✅ {m}:"
        mp.font.bold = True
        mp.font.size = Pt(10.5)
        mp.font.color.rgb = HEADER_BLUE
        mp.space_before = Pt(4)

        dp = ttf9.add_paragraph()
        dp.text = f"    {d}"
        dp.font.size = Pt(9.5)
        dp.font.color.rgb = DARK_TEXT

    # Right: Cloud Deployment
    dc = add_card(s9, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.1))
    dc_box = s9.shapes.add_textbox(Inches(7.0), Inches(1.8), Inches(5.3), Inches(4.7))
    dtf = dc_box.text_frame
    dtf.word_wrap = True

    p = dtf.paragraphs[0]
    p.text = "☁️ PRODUCTION CLOUD DEPLOYMENT"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE

    cloud_points = [
        ("Live Web URL", "https://erp-backend-production-e6ac0611.up.railway.app", "Unified single-server hosting both React Frontend & Express API."),
        ("Managed Cloud MySQL", "MySQL 8.0 on Railway", "Dedicated persistent volume storage with 6ms internal latency."),
        ("Self-Healing Database Migrations", "Automated Startup Init", "Container automatically creates all 7 tables and seeds default users on first boot."),
        ("Automated GitHub CI/CD Pipeline", "Continuous Deployment", "Every git push to `sahushubhftp800-ctrl/ERP-Purchase` triggers cloud rebuild."),
        ("Vercel-Ready Architecture", "Edge Reverse-Proxy", "`vercel.json` configured with reverse-proxy route `/api/:path*` to Railway backend.")
    ]
    for t1, val, desc in cloud_points:
        p1 = dtf.add_paragraph()
        p1.text = f"• {t1}: {val}"
        p1.font.bold = True
        p1.font.size = Pt(10.5)
        p1.font.color.rgb = HEADER_BLUE
        p1.space_before = Pt(5)

        p2 = dtf.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = DARK_TEXT

    s9.notes_slide.notes_text_frame.text = (
        "To ensure software reliability, we built a comprehensive test suite of 39 automated integration test cases "
        "covering positive, negative, and edge scenarios—achieving a 100% pass rate. Furthermore, this project is not just running "
        "locally; it is live in production on Railway Cloud with automated continuous deployment directly from our GitHub repository."
    )

    # ==========================================
    # SLIDE 10: CONCLUSION & FUTURE SCOPE
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Conclusion, Future Enhancements & Q&A")

    # Left: Conclusion
    c10 = add_card(s10, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1))
    c10_box = s10.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(5.4), Inches(4.7))
    ctf10 = c10_box.text_frame
    ctf10.word_wrap = True

    p = ctf10.paragraphs[0]
    p.text = "🏆 PROJECT ACHIEVEMENTS & SUMMARY"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = HEADER_BLUE

    achievements = [
        "Delivered a complete, production-ready, full-stack ERP procurement solution from scratch.",
        "Eliminated spreadsheet human errors via automated 5% GST calculations and database price locks.",
        "Implemented strict Role-Based Access Control dividing Purchasers, Approvers, and Admins.",
        "Automated warehouse stock increments on PO receipt via atomic ACID database transactions.",
        "Achieved 100% test pass rate across 39 integration scenarios with zero defect leakage.",
        "Successfully deployed to cloud with continuous deployment from GitHub."
    ]
    for a in achievements:
        ap = ctf10.add_paragraph()
        ap.text = "✔ " + a
        ap.font.size = Pt(11)
        ap.font.color.rgb = DARK_TEXT
        ap.space_before = Pt(8)

    # Right: Future Scope & Q&A
    r10 = add_card(s10, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.1))
    r10_box = s10.shapes.add_textbox(Inches(7.0), Inches(1.8), Inches(5.3), Inches(4.7))
    rtf10 = r10_box.text_frame
    rtf10.word_wrap = True

    p = rtf10.paragraphs[0]
    p.text = "🔮 FUTURE ENHANCEMENTS & ROADMAP"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_TEAL

    future_points = [
        ("Multi-Currency Engine", "Real-time exchange rate conversion for cross-border global procurement (USD, EUR, GBP)."),
        ("Automated Email / SMS Dispatch", "Integration with SendGrid/Twilio to email approved PO PDFs to suppliers instantly."),
        ("Supplier Self-Service Portal", "Dedicated portal for vendors to acknowledge POs, upload invoices, and provide tracking numbers."),
        ("Mobile ERP Companion App", "React Native mobile application for C-level executives to approve POs with one click on mobile.")
    ]
    for h, d in future_points:
        hp = rtf10.add_paragraph()
        hp.text = f"• {h}:"
        hp.font.bold = True
        hp.font.size = Pt(11)
        hp.font.color.rgb = HEADER_BLUE
        hp.space_before = Pt(6)

        dp = rtf10.add_paragraph()
        dp.text = f"   {d}"
        dp.font.size = Pt(10)
        dp.font.color.rgb = DARK_TEXT

    # Thank you box
    ty_p = rtf10.add_paragraph()
    ty_p.text = "✨ THANK YOU! QUESTIONS & ANSWERS (Q&A)"
    ty_p.font.size = Pt(13)
    ty_p.font.bold = True
    ty_p.font.color.rgb = RGBColor(190, 24, 93)
    ty_p.space_before = Pt(16)

    s10.notes_slide.notes_text_frame.text = (
        "In conclusion, this project demonstrates how modern full-stack technologies—React, Node.js, and MySQL—can transform "
        "legacy corporate procurement into a fast, transparent, and error-free digital process. In the future, we plan to add "
        "multi-currency conversion, supplier portals, and mobile notifications. Thank you very much for your time and guidance. "
        "I am now open to your questions and would be delighted to demonstrate the live application."
    )

    # Save presentations
    output_docs = "c:/final/docs/ERP-Purchase-Order-System.pptx"
    output_root = "c:/final/ERP-Purchase-Order-System.pptx"

    prs.save(output_docs)
    prs.save(output_root)
    print(f"Presentation successfully created at:")
    print(f"1. {output_docs}")
    print(f"2. {output_root}")

if __name__ == "__main__":
    create_presentation()
