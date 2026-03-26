# leadmagic-agent-cli

[![npm version](https://img.shields.io/npm/v/leadmagic-agent-cli)](https://www.npmjs.com/package/leadmagic-agent-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A dual-mode CLI and MCP server for the [LeadMagic API](https://leadmagic.io). Wraps all 18 LeadMagic endpoints as agent-native tools — people enrichment, company intelligence, job data, and ad intelligence.

**npm:** `leadmagic-agent-cli` | **bin:** `leadmagic` | **GitHub:** [bcharleson/leadmagic-cli](https://github.com/bcharleson/leadmagic-cli)

---

## Install

```bash
npm install -g leadmagic-agent-cli
```

Or run without installing:
```bash
npx leadmagic-agent-cli --help
```

---

## Authentication

Get your API key at [app.leadmagic.io](https://app.leadmagic.io) → Settings → API Keys.

```bash
# Option 1: Interactive login (stores in ~/.leadmagic-cli/config.json)
leadmagic login

# Option 2: Environment variable (recommended for CI/agents)
export LEADMAGIC_API_KEY=your_key_here

# Option 3: Per-command flag
leadmagic credits --api-key your_key_here
```

---

## Quick Start

```bash
# Check credit balance (free)
leadmagic credits

# Validate an email
leadmagic people validate-email --email ceo@stripe.com --pretty

# Find email from name + company
leadmagic people find-email --first-name John --last-name Smith --domain acme.com

# Get full LinkedIn profile
leadmagic people profile --profile-url https://linkedin.com/in/johndoe --pretty

# Find who holds a specific role at a company
leadmagic people find-role --job-title "VP of Sales" --company-domain stripe.com

# List employees at a company (up to 100)
leadmagic people find-employees --company-domain stripe.com --limit 50

# Detect if someone changed jobs (churn signal)
leadmagic people job-change --profile-url https://linkedin.com/in/johndoe --company-domain acme.com

# Company research
leadmagic companies search --domain stripe.com --pretty
leadmagic companies funding --domain stripe.com
leadmagic companies technographics --domain stripe.com

# Job search
leadmagic jobs find --job-title "Software Engineer" --has-remote --experience-level senior --per-page 10

# Competitive ad intelligence
leadmagic ads google --domain hubspot.com --pretty
leadmagic ads b2b --domain salesforce.com --pretty
```

---

## All Commands

### Account
| Command | Description | Credits |
|---------|-------------|---------|
| `leadmagic credits` | Check remaining credit balance | free |
| `leadmagic status` | Auth source, masked key, live balance | free |
| `leadmagic login` | Save API key interactively | — |
| `leadmagic logout` | Remove stored API key | — |

### People (10 endpoints)
| Command | Description | Credits |
|---------|-------------|---------|
| `people validate-email` | Validate email + company context | 0.25 |
| `people find-email` | Name + domain → work email | 1 |
| `people find-mobile` | Profile/email → mobile number | 5 |
| `people profile` | LinkedIn URL → full profile | 1 |
| `people email-to-profile` | Email → LinkedIn profile URL | 10 |
| `people profile-to-email` | LinkedIn URL → work email | 5 |
| `people personal-email` | LinkedIn URL → personal emails | 2 |
| `people find-role` | Job title + company → person | 2 |
| `people find-employees` | Company → employee list (max 100) | 0.05/ea |
| `people job-change` | Detect if someone left a company | 3 (always) |

### Companies (4 endpoints)
| Command | Description | Credits |
|---------|-------------|---------|
| `companies search` | Company info by domain/name/URL | 1 |
| `companies competitors` | Find competing companies | 5 |
| `companies funding` | Funding rounds + financial data | 4 |
| `companies technographics` | Technology stack detection | 1 |

### Jobs (1 endpoint)
| Command | Description | Credits |
|---------|-------------|---------|
| `jobs find` | Search job postings (rich filters) | 1/job |

### Ads (3 endpoints)
| Command | Description | Credits |
|---------|-------------|---------|
| `ads google` | Google Ads running for a company | 0.2 |
| `ads meta` | Meta (Facebook/Instagram) ads | 0.2 |
| `ads b2b` | B2B LinkedIn ads | 0.2 |

---

## Global Options

Available on every command:

| Flag | Description |
|------|-------------|
| `--api-key <key>` | Override stored/env API key |
| `--pretty` | Pretty-print JSON output |
| `--output json\|pretty` | Output format (default: json) |
| `--quiet` | No output; use exit code only (0=success, 1=error) |
| `--fields a,b.c` | Filter output to specific fields (dot notation) |

**Field filter examples:**
```bash
# Company search — get just the key signals
leadmagic companies search --domain stripe.com \
  --fields companyName,revenue_formatted,total_funding,last_funding_date,competitors

# Employee list — names and titles only
leadmagic people find-employees --company-domain stripe.com \
  --fields employees,total_count

# Jobs — just titles and companies
leadmagic jobs find --job-title "VP of Sales" \
  --fields count,results
```

---

## Credit Model

LeadMagic uses a **"pay for found"** model — credits are only charged when data is returned. All responses include a `credits_consumed` field so you can track spend per call.

```json
// Found — credits charged
{"email": "john@stripe.com", "status": "valid", "credits_consumed": 1, ...}

// Not found — free
{"email": null, "credits_consumed": 0, "message": "We couldn't find a verified email..."}
```

Exception: `people job-change` always charges 3 credits regardless of result.

Check your balance anytime (free, no rate limit):
```bash
leadmagic credits
```

---

## MCP Server (for AI Agents)

Use `leadmagic` as an MCP server with Claude Desktop, Cursor, or any MCP-compatible AI agent:

```bash
leadmagic mcp
```

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "leadmagic": {
      "command": "npx",
      "args": ["-y", "leadmagic-agent-cli", "mcp"],
      "env": {
        "LEADMAGIC_API_KEY": "your_key_here"
      }
    }
  }
}
```

All 18 API endpoints are registered as MCP tools. See [AGENTS.md](AGENTS.md) for the complete agent reference including real response shapes, credit costs, and workflow patterns.

---

## License

MIT — [bcharleson/leadmagic-cli](https://github.com/bcharleson/leadmagic-cli)
