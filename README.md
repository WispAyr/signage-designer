# Parkwise Signage Designer

A BPA-compliant signage design system for car park operators with:
- Visual sign designer (replaces Word)
- Built-in BPA Code of Practice compliance checker
- PDF export for print production
- Sign reference number tracking
- Full MCP integration for system interoperability

## Features

### 🎨 Visual Designer
- Drag-and-drop sign composition
- Pre-built BPA-compliant templates
- LCPM brand assets built-in
- Real-time preview

### ✅ Compliance Checker
- BPA Code of Practice validation
- Required element checking
- Font size compliance (legibility)
- Charge amount validation
- GDPR/privacy notice validation
- Auto-fix suggestions

### 📄 PDF Export
- Print-ready PDF generation
- Multiple size formats (A4, A3, A2, A1, A0)
- High-resolution output
- Bleed and crop marks

### 🔢 Reference System
- Unique sign reference numbers (format: SITE-TYPE-###)
- Version tracking
- Audit trail for BPA evidence packs
- Installation tracking ready

### 🔗 MCP Integration
- Full MCP server for AI/system integration
- Sign generation via API
- Compliance checking via API
- Template management

## BPA Compliance Rules

Based on the British Parking Association Code of Practice, signs must include:

### Primary Signs (Entrance)
- [ ] "Parking Regulations Apply" or equivalent header
- [ ] "Private Land" or "Private Property" statement
- [ ] Terms & Conditions reference
- [ ] ANPR monitoring notice (if applicable)
- [ ] BPA Approved Operator logo
- [ ] Company name and registration number
- [ ] Helpline number
- [ ] Company logo

### T&C Signs
- [ ] All Primary requirements PLUS:
- [ ] Full terms and conditions
- [ ] Parking Charge amount (must be £100 max)
- [ ] Reduced amount if paid within 14 days (must be £60 or less)
- [ ] 28-day payment period mention
- [ ] Debt recovery fee notice
- [ ] Personal data / privacy notice
- [ ] Website for full privacy policy
- [ ] "By entering or remaining" contract clause

### Tariff Signs
- [ ] Clear pricing structure
- [ ] Payment methods
- [ ] Maximum stay (if applicable)
- [ ] QR code for payment (if applicable)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start MCP server
npm run mcp

# Build for production
npm run build
```

## Architecture

```
signage-designer/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   │   ├── designer/  # Sign designer components
│   │   ├── preview/   # Preview components
│   │   └── ui/        # Shared UI components
│   ├── lib/
│   │   ├── compliance/ # BPA compliance checker
│   │   ├── pdf/       # PDF generation
│   │   └── templates/ # Sign templates
│   └── mcp/           # MCP server
├── public/
│   └── assets/        # Brand assets, logos
└── signs/             # Generated signs storage
```

## API Endpoints

### REST API
- `POST /api/signs` - Create new sign
- `GET /api/signs/:id` - Get sign by ID
- `PUT /api/signs/:id` - Update sign
- `DELETE /api/signs/:id` - Delete sign
- `POST /api/signs/:id/export` - Export to PDF
- `POST /api/compliance/check` - Check sign compliance
- `GET /api/templates` - List templates

### MCP Tools
- `create_sign` - Create a new sign from template
- `check_compliance` - Validate sign against BPA rules
- `export_pdf` - Generate PDF from sign
- `list_templates` - Get available templates
- `get_sign` - Retrieve sign by reference
- `update_sign` - Modify existing sign

## Sign Reference Format

`[SITE]-[TYPE]-[SEQ]-[VERSION]`

Example: `KRS-ENT-001-v1`
- KRS = Kyle Rise
- ENT = Entrance sign
- 001 = Sequential number
- v1 = Version 1

### Type Codes
- ENT = Entrance
- TCS = Terms & Conditions
- TAR = Tariff
- DIS = Disabled
- EVC = Electric Vehicle
- INT = Internal/QR
- WAY = Wayfinding

## License

Proprietary - Parkwise Tech Group
