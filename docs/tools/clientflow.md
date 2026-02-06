# ClientFlow

Client management, invoices, proposals, and CRM dashboard.

## Tool: `clientflow_cross_workspace`

Aggregated data across all workspaces.

| Report | Description |
|:-------|:------------|
| `invoices` | All invoices across workspaces |
| `proposals` | All proposals across workspaces |
| `clients` | All clients across workspaces |
| `change_requests` | All change requests across workspaces |

### Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `report` | string | **All** | Which report (required) |
| `per_page` | number | All | Results per page (1-100, default 50) |
| `page` | number | All | Page number (default 1) |

---

## Tool: `client`

| Action | Description |
|:-------|:------------|
| `list` | List clients in workspace |
| `get` | Client details |
| `stats` | Client statistics |
| `create` | Create new client |
| `update` | Update client information |

### Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `company_slug` | string | **All** | Workspace (required) |
| `uuid` | string | get, stats, update | Client UUID |
| `name` | string | create | Client name (required for create) |
| `email` | string | create, update | Email address |
| `phone` | string | create, update | Phone number |
| `address` | string | create, update | Street address |
| `address_line_2` | string | create, update | Address line 2 |
| `city` | string | create, update | City |
| `country` | string | create, update | Country |
| `postcode` | string | create, update | Postal/ZIP code |
| `vat_number` | string | create, update | VAT/Tax ID |
| `website` | string | create, update | Website URL |
| `notes` | string | create, update | Internal notes |

---

## Tool: `invoice`

| Action | Description |
|:-------|:------------|
| `list` | List invoices |
| `get` | Invoice details |
| `stats` | Invoice statistics |
| `create` | Create new invoice |
| `update` | Update invoice |
| `issue` | Issue a draft invoice |
| `send` | Send invoice to client |
| `mark_paid` | Mark invoice as paid |

### Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `company_slug` | string | **All** | Workspace (required) |
| `uuid` | string | get, update, issue, send, mark_paid | Invoice UUID |
| `contact_company_uuid` | string | create | Client ID (required for create) |
| `status` | string | list | Filter: draft, sent, paid, overdue |
| `client_uuid` | string | list | Filter by client |
| `due_date` | string | create, update | Due date YYYY-MM-DD |
| `notes` | string | create, update | Invoice notes |
| `currency` | string | create, update | ISO code: USD, EUR, BRL |

---

## Tool: `proposal`

| Action | Description |
|:-------|:------------|
| `list` | List proposals |
| `get` | Proposal details |
| `stats` | Proposal statistics |
| `create` | Create new proposal |
| `update` | Update proposal |
| `send` | Send to client |
| `approve` | Mark as approved |
| `reject` | Mark as rejected |
| `convert` | Convert to project/invoice |

### Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `company_slug` | string | **All** | Workspace (required) |
| `uuid` | string | get, update, send, approve, reject, convert | Proposal UUID |
| `title` | string | create | Proposal title (required for create) |
| `contact_company_uuid` | string | create, update | Client ID |
| `status` | string | list | Filter: draft, sent, approved, rejected |
| `client_uuid` | string | list | Filter by client |
| `content` | string | create, update | Body in Markdown |
| `total_amount` | number | create, update | Total value |
| `valid_until` | string | create, update | Expiration date YYYY-MM-DD |
| `currency` | string | create, update | ISO code: USD, EUR, BRL |
| `reason` | string | reject | Rejection reason |

---

## Tool: `clientflow_dashboard`

CRM dashboard with analytics and insights.

| Report | Description |
|:-------|:------------|
| `overview` | CRM summary dashboard |
| `revenue` | Revenue analytics |
| `at_risk` | At-risk client relationships |
| `pending` | Pending actions (invoices, proposals) |
| `health` | Client health scores |
| `insights` | AI-driven insights |
| `leaderboard` | Team performance ranking |
| `analytics` | Detailed CRM analytics |

### Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `report` | string | **All** | Which report (required) |
| `company_slug` | string | **All** | Workspace (required) |

---

## Examples

### Clients

```
"List clients in workspace acme"
"Create client 'Acme Corp' with email contact@acme.com"
"Get client [uuid] details"
"Client stats for [uuid]"
```

### Invoices

```
"List invoices in workspace acme"
"Create invoice for client [client_uuid]"
"Send invoice [uuid]"
"Mark invoice [uuid] as paid"
"Show overdue invoices"
```

### Proposals

```
"List proposals in workspace acme"
"Create proposal 'Website Redesign' for client [client_uuid]"
"Send proposal [uuid]"
"Convert approved proposal [uuid]"
```

### Cross-Workspace

```
"Show all invoices across workspaces"
"All clients across workspaces"
```

### CRM Dashboard

```
"Show CRM overview for workspace acme"
"Revenue analytics"
"At-risk clients"
"Team leaderboard"
```

---

## Workflow

### Invoice Lifecycle

```
1. client action=list             → get client UUID
2. invoice action=create          → create draft
3. invoice action=issue           → finalize draft
4. invoice action=send            → send to client
5. invoice action=mark_paid       → record payment
```

### Proposal Lifecycle

```
1. client action=list             → get client UUID
2. proposal action=create         → draft proposal
3. proposal action=send           → send to client
4. proposal action=approve        → client approved
5. proposal action=convert        → convert to project/invoice
```
