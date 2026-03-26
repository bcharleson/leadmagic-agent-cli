# LeadMagic CLI — Agent Reference

This document is the authoritative reference for AI agents using the `leadmagic` CLI. All commands output JSON by default and are designed for non-interactive, programmatic use.

---

## Quick Start

```bash
# Authenticate
export LEADMAGIC_API_KEY=your_key_here

# Verify auth and check credit balance
leadmagic status

# Check credits only (free, no rate limit)
leadmagic credits
```

---

## Authentication

**Priority order (highest to lowest):**
1. `--api-key <key>` flag (per-command override)
2. `LEADMAGIC_API_KEY` environment variable (recommended for agents)
3. `~/.leadmagic-cli/config.json` (stored via `leadmagic login`)

**Recommended for agents:** Always use `LEADMAGIC_API_KEY`. Never use interactive `leadmagic login` in automated contexts.

---

## Credit Model

Credits are only charged on **successful results** ("pay for found"). If no result is returned, `credits_consumed` will be `0`. The exception is `people job-change` which always charges 3 credits.

**Every response includes `credits_consumed`** — use it to track spend per call.

| Tool | Credits | Notes |
|------|---------|-------|
| `credits` | 0 | Free, no rate limit |
| `people validate-email` | 0.25 | Free if `email_status: "unknown"` |
| `people find-email` | 1 | Free if `email: null` |
| `people find-mobile` | 5 | Free if `mobile_number: null` |
| `people profile` | 1 | Free if not found |
| `people email-to-profile` | 10 | Free if `profile_url: null` |
| `people profile-to-email` | 5 | Free if `email: null` |
| `people personal-email` | 2 | Free if `personal_email: null` |
| `people find-role` | 2 | Free if not found |
| `people find-employees` | 0.05/employee | Free if no employees found |
| `people job-change` | 3 | **Always charged** |
| `companies search` | 1 | Free if not found |
| `companies competitors` | 5 | Free if not found |
| `companies funding` | 4 | Free if not found |
| `companies technographics` | 1 | Free if not found |
| `jobs find` | 1/job returned | Free if no results |
| `ads google` | 0.2 | Free if not found |
| `ads meta` | 0.2 | Free if not found |
| `ads b2b` | 0.2 | Free if not found |

**Credit conservation order** — for enriching a person, call in this order (cheapest first, stop when you have what you need):
1. `people validate-email` (0.25) — confirm email is real before spending more
2. `people find-email` (1) — get work email from name+domain
3. `people profile-to-email` (5) — if you have LinkedIn URL
4. `people find-mobile` (5) — only if mobile is required
5. `people email-to-profile` (10) — most expensive, use last

---

## Output Format

All commands output **compact JSON by default**. Options:

```bash
--pretty          # Pretty-print JSON (2-space indent)
--output pretty   # Same as --pretty
--quiet           # No output; check exit code only (0=success, 1=error)
--fields a,b.c    # Comma-separated fields to include (dot notation)
```

**Exit codes:** `0` = success, `1` = error

**Error format:**
```json
{"error": "Invalid API key. The key does not exist or is incorrect.", "code": "AUTH_ERROR"}
```

**Error codes:** `AUTH_ERROR`, `INSUFFICIENT_CREDITS`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMIT`, `TIMEOUT`, `NETWORK_ERROR`, `SERVER_ERROR`

**No-result response** (when a person or company isn't found — 0 credits charged):
```json
{"credits_consumed": 0, "message": "We couldn't find a verified email for this person at this domain.", "email": null, ...}
```

Always check `credits_consumed: 0` + null fields to detect a miss before branching your logic.

---

## Rate Limits

- Default: **300 requests/minute**
- Slower endpoints (100 req/min): `people profile`, `companies search`, `jobs find`
- CLI automatically retries on 429 with exponential backoff (up to 2 retries)

---

## Command Reference

### Account

#### credits
Check remaining credit balance. Free, no rate limit.
```bash
leadmagic credits
```
Response:
```json
{"credits": 79279}
```

#### status
Show auth source, masked key, and live credit balance.
```bash
leadmagic status
```

---

### People Commands

#### people validate-email
Validate an email address. Returns deliverability status, catch-all detection, MX records, and company enrichment. **Start here before spending credits on email finder.**

```bash
leadmagic people validate-email --email john@stripe.com
```

Response (real shape):
```json
{
  "email": "john@stripe.com",
  "email_status": "valid",
  "is_domain_catch_all": false,
  "credits_consumed": 0.25,
  "message": "Email is valid.",
  "mx_record": "aspmx.l.google.com",
  "mx_provider": "Google Workspace",
  "mx_gateway": null,
  "mx_security_gateway": false,
  "company_name": "Stripe",
  "company_industry": "Internet",
  "company_size": "1001-5000",
  "company_founded": 2010,
  "company_type": "Private",
  "company_location": { "name": "South San Francisco, CA, US", "country": "United States", ... },
  "company_linkedin_url": "linkedin.com/company/stripe",
  "company_linkedin_id": "2135371",
  "company_facebook_url": "...",
  "company_twitter_url": "..."
}
```

**Required:** `--email`
**email_status values:** `valid` | `invalid` | `unknown` (free if unknown)

Useful `--fields`: `email_status,is_domain_catch_all,mx_provider,company_name,company_size`

---

#### people find-email
Find a work email from name + company domain or name.

```bash
leadmagic people find-email --first-name John --last-name Smith --domain acme.com
leadmagic people find-email --full-name "Jane Doe" --company-name "Stripe"
```

Response:
```json
{
  "email": "john@acme.com",
  "status": "valid",
  "credits_consumed": 1,
  "message": "...",
  "first_name": "John",
  "last_name": "Smith",
  "domain": "acme.com",
  "mx_record": "...",
  "mx_provider": "google",
  "has_mx": true,
  "company_name": "Acme Corp",
  "company_industry": "...",
  "company_size": "...",
  "company_location": { ... }
}
```

**Required:** (`--first-name` + `--last-name`) OR `--full-name`, PLUS (`--domain` OR `--company-name`)
**Miss:** `email: null`, `credits_consumed: 0`

---

#### people find-mobile
Find a mobile/phone number from a LinkedIn profile URL or email.

```bash
leadmagic people find-mobile --profile-url https://linkedin.com/in/johndoe
leadmagic people find-mobile --work-email john@acme.com
leadmagic people find-mobile --personal-email john.doe@gmail.com
```

Response:
```json
{"mobile_number": "+15551234567", "profile_url": "...", "email": "...", "message": "...", "credits_consumed": 5}
```

**Required:** At least one of `--profile-url`, `--work-email`, `--personal-email`
**Miss:** `mobile_number: null`, `credits_consumed: 0`

---

#### people profile
Full LinkedIn profile data. Rate limit: 100 req/min.

```bash
leadmagic people profile --profile-url https://linkedin.com/in/johndoe
leadmagic people profile --profile-url https://linkedin.com/in/johndoe --extended --skip-cache
```

Response:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "professional_title": "VP of Sales",
  "bio": "...",
  "company_name": "Acme Corp",
  "company_website": "acme.com",
  "location": "San Francisco, CA",
  "country": "United States",
  "followers_range": "500-1000",
  "total_tenure_years": 8,
  "profile_image_url": null,
  "work_experience": [{ "company_name": "...", "title": "...", "start_date": "...", "end_date": null }],
  "education": [{ "school": "...", "degree": "...", "field_of_study": "..." }],
  "certifications": [],
  "credits_consumed": 1
}
```

**Required:** `--profile-url`
**Optional:** `--extended` (includes `profile_image_url`), `--skip-cache` (bypass cached data)

Useful `--fields`: `first_name,last_name,professional_title,company_name,work_experience`

---

#### people email-to-profile
Reverse-lookup: email → LinkedIn profile URL.

```bash
leadmagic people email-to-profile --work-email john@acme.com
leadmagic people email-to-profile --personal-email john.doe@gmail.com
```

Response:
```json
{"profile_url": "https://linkedin.com/in/johndoe", "credits_consumed": 10}
```

**Required:** `--work-email` OR `--personal-email`
**Miss:** `profile_url: null`, `credits_consumed: 0`

---

#### people profile-to-email
LinkedIn profile URL → work email.

```bash
leadmagic people profile-to-email --profile-url https://linkedin.com/in/johndoe
```

Response:
```json
{"email": "john@acme.com", "profile_url": "https://linkedin.com/in/johndoe", "credits_consumed": 5}
```

**Required:** `--profile-url`
**Miss:** `email: null`, `credits_consumed: 0`

---

#### people personal-email
Find personal email addresses from a LinkedIn profile.

```bash
leadmagic people personal-email --profile-url https://linkedin.com/in/johndoe
```

Response:
```json
{
  "personal_email": "john.doe@gmail.com",
  "personal_emails": ["john.doe@gmail.com", "jdoe@yahoo.com"],
  "first_personal_email": "john.doe@gmail.com",
  "credits_consumed": 2
}
```

**Required:** `--profile-url`
**Miss:** `personal_email: null`, `credits_consumed: 0`

---

#### people find-role
Find who holds a specific job title at a company.

```bash
leadmagic people find-role --job-title "VP of Sales" --company-domain stripe.com
leadmagic people find-role --job-title "CTO" --company-name "Acme Corp"
```

Response:
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "profile_url": "https://linkedin.com/in/janedoe",
  "job_title": "VP of Sales",
  "company_name": "Stripe",
  "company_website": "stripe.com",
  "credits_consumed": 2
}
```

**Required:** `--job-title`, PLUS (`--company-domain` OR `--company-name`)
**Miss:** all fields null, `credits_consumed: 0`

---

#### people find-employees
List employees at a company. Default 20, max 100.

```bash
leadmagic people find-employees --company-domain stripe.com
leadmagic people find-employees --company-domain stripe.com --limit 100
leadmagic people find-employees --company-name "Stripe" --limit 50
```

Response:
```json
{
  "employees": [
    {"first_name": "John", "last_name": "Doe", "title": "Software Engineer", "website": "stripe.com", "company_name": "Stripe"}
  ],
  "total_count": 11710,
  "returned_count": 20,
  "credits_consumed": 1
}
```

**Required:** `--company-domain` OR `--company-name`
**Optional:** `--limit` (1–100, default 20)
**Cost:** 0.05 per employee returned (20 = 1 credit)
**Miss:** `employees: []`, `credits_consumed: 0`

Useful `--fields`: `employees,total_count,returned_count`

---

#### people job-change
Detect if a person has left or changed jobs at a specific company.

```bash
leadmagic people job-change --profile-url https://linkedin.com/in/johndoe --company-domain acme.com
leadmagic people job-change --profile-url https://linkedin.com/in/johndoe --company-name "Old Corp"
```

Response:
```json
{
  "job_change_detected": true,
  "status": "JOB_CHANGE_DETECTED",
  "current_position": {"company_name": "New Corp", "title": "VP Sales", "start_date": "2025-01"},
  "tenure_stats": {...},
  "work_history": [...],
  "credits_consumed": 3
}
```

**Required:** `--profile-url`, PLUS (`--company-domain` OR `--company-name`)
**status values:** `NO_CHANGE` | `JOB_CHANGE_DETECTED` | `NEVER_WORKED_THERE`
**Cost: 3 credits always charged regardless of result.**

---

### Companies Commands

#### companies search
Company intelligence by domain, LinkedIn URL, or name. Rate limit: 100 req/min.

```bash
leadmagic companies search --domain stripe.com
leadmagic companies search --company-name "Stripe"
leadmagic companies search --profile-url https://linkedin.com/company/stripe
```

Response (real shape — note camelCase fields):
```json
{
  "credits_consumed": 1,
  "message": "Company found",
  "companyName": "Stripe",
  "companyId": 2135371,
  "industry": "Computer Software",
  "employeeCount": 11710,
  "employeeCountRange": {"start": 10001, "end": 20000},
  "followerCount": 1334746,
  "tagline": "Help increase the GDP of the internet.",
  "description": "...",
  "websiteUrl": "https://stripe.com",
  "headquarter": {"country": "US", "city": "South San Francisco", "geographicArea": "California"},
  "locations": [{"country": "...", "city": "...", "headquarter": true/false}],
  "foundedOn": {"year": 2010, "month": null, "day": null},
  "ownership_status": "private",
  "revenue": 5100000000,
  "revenue_formatted": "5.1B",
  "employee_range": "5,000 - 10,000",
  "total_funding": "9.8B",
  "funding_rounds": 5,
  "last_funding_round": "Equity",
  "last_funding_amount": 694159778,
  "last_funding_date": "Apr 2024",
  "acquisitions_count": 5,
  "logo_url": "https://logo.leadmagic.io/stripe.com",
  "stock_ticker": null,
  "competitors": ["Rapyd", "Square", "PayPal", ...],
  "specialities": [],
  "twitter_url": "twitter.com/stripe",
  "linkedin_url": "linkedin.com/company/stripe",
  "facebook_url": "facebook.com/stripehq"
}
```

**Required:** At least one of `--domain`, `--profile-url`, `--company-name`

Useful `--fields`: `companyName,industry,employeeCount,revenue_formatted,total_funding,ownership_status,competitors`

---

#### companies competitors
Find competing companies.

```bash
leadmagic companies competitors --domain stripe.com
leadmagic companies competitors --company-name "Stripe"
leadmagic companies competitors --company-url https://stripe.com
```

Response:
```json
{
  "competitors": [
    {
      "name": "Adyen",
      "shortDescription": "...",
      "founded_year": 2006,
      "employeesCount": 4000,
      "valuation": "...",
      "financial_metrics": {...},
      "funding_metrics": {...},
      "twitterEngagement": {...}
    }
  ],
  "credits_consumed": 5
}
```

**Required:** At least one of `--domain`, `--company-url`, `--company-name`
**Miss:** empty array, `credits_consumed: 0`

---

#### companies funding
Detailed funding history, investors, acquisitions, and news.

```bash
leadmagic companies funding --domain stripe.com
leadmagic companies funding --company-name "Stripe"
```

Response:
```json
{
  "basicInfo": {...},
  "financialInfo": {...},
  "fundingHistory": [{"round_type": "Series A", "amount": "...", "date": "...", "investors": ["..."]}],
  "companySize": {...},
  "leadership": {...},
  "topCompetitors": [...],
  "acquisitions": [...],
  "news": [...],
  "pressReleases": [...],
  "credits_consumed": 4
}
```

**Required:** `--domain` OR `--company-name`
**Miss:** empty objects, `credits_consumed: 0`

---

#### companies technographics
Detect technology stack for a company by domain.

```bash
leadmagic companies technographics --domain stripe.com
```

Response (when data available):
```json
[
  {
    "name": "Salesforce",
    "description": "CRM platform",
    "categories": ["CRM", "Sales"],
    "sub_technologies": ["Salesforce Marketing Cloud"]
  }
]
```

Response (when no data):
```json
{"credits_consumed": 0, "message": "No technology stack information available for this company"}
```

**Required:** `--domain`

Useful `--fields`: `name,categories`

---

### Jobs Commands

#### jobs find
Search job postings with rich filters. Rate limit: 100 req/min.

```bash
leadmagic jobs find --job-title "Account Executive"
leadmagic jobs find --job-title "Sales Manager" --has-remote --experience-level senior
leadmagic jobs find --company-domain stripe.com --per-page 50 --page 2
leadmagic jobs find --job-title "DevOps Engineer" --posted-within 7d --location "New York"
```

Response (real shape):
```json
{
  "count": 1910,
  "next": "https://jobdataapi.com/api/jobs/?...&page=2",
  "previous": null,
  "results": [
    {
      "id": 40665732,
      "title": "Account Executive EMEA",
      "company": {
        "id": 116403,
        "name": "Asksuite",
        "logo": "https://...",
        "website_url": "https://asksuite.com/",
        "linkedin_url": "https://linkedin.com/company/..."
      },
      "location": "Remote",
      "experience_level": "MI",
      "description": "...",
      "published": "2026-03-24T21:27:41Z",
      "has_remote": true,
      "application_url": "https://...",
      "language": "en",
      "salary_min": null,
      "salary_max": null,
      "salary_currency": "USD",
      "types": [{"id": 1, "name": "Full Time"}],
      "cities": [...],
      "states": [...],
      "countries": [{"id": 238, "code": "US", "name": "United States"}],
      "regions": [{"id": 5, "name": "North America"}]
    }
  ],
  "credits_consumed": 3
}
```

**experience_level values:** `entry` | `mid` | `senior` | `executive`
**Optional filters:** `--company-name`, `--company-domain`, `--job-title`, `--description`, `--experience-level`, `--has-remote`, `--location`, `--city`, `--posted-within`, `--posted-after` (YYYY-MM-DD), `--posted-before` (YYYY-MM-DD), `--page` (default 1), `--per-page` (1–50, default 20)
**Cost:** 1 credit per job in results (3 jobs = 3 credits)

Useful `--fields`: `count,results`

---

### Ads Commands

#### ads google
Google Ads currently running for a company.

```bash
leadmagic ads google --domain stripe.com
leadmagic ads google --company-name "HubSpot"
```

Response:
```json
{
  "ads": [
    {"headline": "...", "description": "...", "display_url": "...", "final_url": "...", "ad_type": "..."}
  ],
  "ads_count": 5,
  "credits_consumed": 0.2
}
```

**Required:** `--domain` OR `--company-name`
**Note:** API may return `"Google ads are temporarily unavailable"` — `credits_consumed: 0` in that case

---

#### ads meta
Meta (Facebook/Instagram) ads for a company.

```bash
leadmagic ads meta --domain stripe.com
leadmagic ads meta --company-name "Shopify"
```

Response:
```json
{
  "ads": [
    {"ad_id": "...", "content": "...", "image_url": "...", "video_url": null, "platform": "Facebook", "started_running": "2026-01-15"}
  ],
  "ads_count": 3,
  "credits_consumed": 0.2
}
```

**Required:** `--domain` OR `--company-name`

---

#### ads b2b
B2B LinkedIn ads for a company.

```bash
leadmagic ads b2b --domain stripe.com
leadmagic ads b2b --company-name "Salesforce"
```

Response:
```json
{
  "ads": [
    {"content": "...", "link": "...", "image_url": "..."}
  ],
  "ads_count": 2,
  "credits_consumed": 0.2
}
```

**Required:** `--domain` OR `--company-name`

---

## MCP Server Mode

Start the LeadMagic MCP server for use with Claude Desktop, Cursor, or any MCP-compatible agent:

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

**After local build** (development):
```json
{
  "mcpServers": {
    "leadmagic": {
      "command": "node",
      "args": ["/Users/you/Developer/leadmagic-cli/dist/mcp.js"],
      "env": {
        "LEADMAGIC_API_KEY": "your_key_here"
      }
    }
  }
}
```

**Available MCP tools (18):**
`people_validate_email`, `people_find_email`, `people_find_mobile`, `people_profile`, `people_email_to_profile`, `people_profile_to_email`, `people_personal_email`, `people_find_role`, `people_find_employees`, `people_job_change`, `companies_search`, `companies_competitors`, `companies_funding`, `companies_technographics`, `jobs_find`, `ads_google`, `ads_meta`, `ads_b2b`

---

## Common Agent Workflows

### Enrich a lead from email (cheapest-first order)
```bash
# 1. Validate email first (0.25 credits) — confirm it's real
leadmagic people validate-email --email john@stripe.com
# If email_status is "invalid", stop here

# 2. Find LinkedIn profile from email (10 credits)
leadmagic people email-to-profile --work-email john@stripe.com

# 3. Get full profile (1 credit)
leadmagic people profile --profile-url https://linkedin.com/in/johndoe

# 4. Get mobile if needed (5 credits)
leadmagic people find-mobile --work-email john@stripe.com
```

### Find a decision-maker at a target company
```bash
# Find who holds the role
leadmagic people find-role --job-title "VP of Sales" --company-domain stripe.com

# Get their full profile
leadmagic people profile --profile-url <profile_url from above>

# Find their work email
leadmagic people profile-to-email --profile-url <profile_url>
```

### Build a prospect list
```bash
# 1. Get company overview (1 credit)
leadmagic companies search --domain stripe.com

# 2. Get employees — run in batches (0.05/ea)
leadmagic people find-employees --company-domain stripe.com --limit 100

# 3. Find emails for each employee (1 credit/found)
leadmagic people find-email --first-name John --last-name Doe --domain stripe.com
```

### Research a company before outreach
```bash
# Company overview + funding signal
leadmagic companies search --domain stripe.com --fields companyName,revenue_formatted,total_funding,last_funding_date,competitors

# Tech stack (shows what tools they're buying)
leadmagic companies technographics --domain stripe.com

# Funding history (shows growth stage)
leadmagic companies funding --domain stripe.com

# Active ads (shows where they're spending, what messaging)
leadmagic ads google --domain stripe.com
leadmagic ads b2b --domain stripe.com

# Competitors (for positioning)
leadmagic companies competitors --domain stripe.com
```

### Job change monitoring (churn / re-engagement signal)
```bash
# Detect if a customer champion left
leadmagic people job-change --profile-url https://linkedin.com/in/johndoe --company-domain stripe.com

# If status is JOB_CHANGE_DETECTED:
# - Update CRM with new company from current_position
# - Trigger re-engagement sequence at new company
# - Find new champion at old company via find-role
```

### Hiring signal research (ICP signal)
```bash
# Find companies actively hiring your target roles
leadmagic jobs find --job-title "Revenue Operations Manager" --has-remote --experience-level senior --per-page 50

# Research each hiring company
leadmagic companies search --domain <company_website from results>
```
