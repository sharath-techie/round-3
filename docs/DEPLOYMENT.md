# VERO — Production Deployment & Operations Guide

## 1. Stack Overview
- **Framework**: Next.js 15 (App Router, Server Actions, Route Handlers)
- **Styling**: Tailwind CSS + Custom Obsidian Design Tokens (`#06090e`, `#0d121c`, `#161e2e`, `#243047`)
- **Iconography**: `lucide-react`
- **State & Identity**: Role-swappable context + Server-side Authorization Headers (`x-vero-user-id`, `x-vero-role`)
- **Execution & Storage**: Transactional in-memory persistence engine with append-only ledger & audit log.

---

## 2. Environment Configuration
Create a `.env.local` file with the following variables:

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="VERO Research Platform"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Mesh Gateway Secrets (Optional for simulated sandbox)
ANTHROPIC_API_KEY=""
OPENAI_API_KEY=""

# Gateway Thresholds
MAX_GATEWAY_QUERIES_PER_HOUR=100
GATEWAY_ENFORCEMENT_MODE="STRICT"
```

---

## 3. Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run developer server
npm run dev

# 3. Open browser
http://localhost:3000
```

---

## 4. Production Build & Verification
```bash
# Build optimized standalone bundle
npm run build

# Start production server
npm run start -p 3000
```

---

## 5. System Health Monitoring
The platform exposes live telemetry at `/admin/health`:
- **AI Mesh Worker Pool**: Health status, average latency, queue saturation.
- **Agent Gateway**: Pass/reject ratios, active rate-limiting buckets.
- **Contribution Ledger**: Block height, chain integrity verification, Merkle consistency.
