# Analytics

Review Kit initializes Amplitude automatically when the authenticated df-sheet
SSO response includes an `analytics` configuration. Host projects do not need an
Amplitude environment variable or API key.

```json
{
  "analytics": {
    "provider": "amplitude",
    "apiKey": "browser-project-key",
    "sessionReplay": {
      "enabled": true,
      "sampleRate": 1,
      "maskInputs": true
    }
  }
}
```

The Project API Key is a browser ingestion key. Management and secret keys must
never be returned to the browser.

## Event schema

Autocapture is disabled. Review Kit sends only these explicit events:

- `view`: `panel_id`
- `click`: `panel_id`, `control_id`, `action`
- `success`: `action`, optional `panel_id`
- `failure`: `action`, optional `panel_id`, safe `error_code`, and HTTP `status`

Every event also includes:

- `source: "review-kit"`
- `project_id`: the stable authenticated DF Sheet project ID
- `project_key`: the readable DF Sheet project key (for example, `IKAOS`)
- `project_name`: the full DF Sheet project name, when provided by SSO
- `page_name` once a DF Sheet page is selected and its name is available
- `package_version`
- a stable anonymous `anonymous_id`
- `creator_id`: the logged-in DF Sheet account ID, not the original issue author

`project_id`, `project_key`, and `project_name` identify the project, while `page_name` identifies
a page within it. `creator_id` replaces the former `reviewer_name` property. Page selection and adapter creation update the page context
from the authenticated page list. Events before page selection omit `page_name`.
The DF Sheet SSO server must also be updated to return `project.name`; existing
cached sessions need a fresh login to receive it. Older responses remain
compatible and omit `project_name` rather than substituting the project key.
`creator_id` is a custom event property; Amplitude's built-in user ID is not set.

Event properties are allowlisted. Review content, target-page text, form values,
API keys, tokens, URLs, and error messages are not sent as analytics properties.

Project attribution is included on all four explicit events, even before page
selection. It is not added to SDK-generated replay/diagnostic events. Older kit
versions omitted `project_id` and did not send `project_key`; upgrading the host
projects is required. Historical missing IDs cannot be recovered by this change.
An ID-to-key lookup can label old events that already have an ID, but events
without an unambiguous project reference must remain unattributed.

## Session Replay and failure behavior

Session Replay uses the SSO-provided sample rate (`1` by default) and `medium`
privacy masking, which masks all form inputs. Elements marked with
`data-amplitude-mask`, `data-sensitive`, or `data-secret` are also masked.

The Amplitude package is loaded only when analytics is configured. SDK loading,
initialization, and event delivery are fire-and-forget: failures never block
login, rendering, saving, uploads, or imports. The Amplitude SDK owns its normal
offline queue and delivery retry behavior.

## Querying events and reporting

Event ingestion and analytics access are separate. The Project API Key can send
events; it does not grant permission to read historical events or dashboards.
Use the authenticated Amplitude connector/MCP for on-demand reports, or an
appropriately authorized analytics/export API integration for scripted reports.
The official US MCP endpoint is `https://mcp.amplitude.com/mcp` (use the EU
endpoint for an EU-resident project). The account must have access to the
intended Amplitude project. Do not put query credentials in this browser library.

Before querying, confirm the Amplitude project, its timezone, and date range.
Always filter by `source = review-kit`, and exclude known test traffic when it
can be identified reliably. A useful initial report compares the last seven
complete days with the preceding seven days:

- **Usage:** event volume by day, panel views by `panel_id`, and clicks by
  `control_id` and `action`, with breakdowns by `project_id`, `project_key`, `project_name`,
  `page_name`, and `package_version`. Rank projects by panel views or distinct
  reviewer IDs, not a mixture of views, clicks, and outcomes.
- **Reviewers:** distinct `creator_id` values, explicitly labeled as account IDs.
  Do not use Amplitude's default unique-user metric as an authenticated-reviewer
  count: this integration does not set the built-in user ID. Missing IDs and
  anonymous-device counts must be reported separately.
- **Outcomes:** `success` and `failure` counts by `action`. Define completed-action
  success rate as `success / (success + failure)` for the same action and period;
  do not count every click as a completed attempt. Report a zero denominator as
  unavailable, not 100% success.
- **Failures:** safe `error_code` and HTTP `status` breakdowns, affected pages and
  versions, and changes from the comparison period.
- **Data quality:** missing context properties, unexpected event names, gaps in
  collection, and whether replay samples are actually available. Events before
  page selection legitimately omit `page_name`.

Each report should name its date range/timezone, filters, metric definitions,
sample size, source chart/query links, and limitations. Source inspection and
local tests do not prove that production events or replays were received.
Recurring delivery requires a separately configured schedule and authenticated
data access; installing an SDK alone does not create either.

## Agent Analytics is a different integration

`@amplitude/ai` tracks LLM calls, agent sessions, tools, token usage, and cost.
It is not a client for querying this product's existing Amplitude logs.
Review Kit currently has no LLM-provider call sites, so its normal UI events
must remain product events through `@amplitude/unified`; do not replace them
with synthetic `[Agent]` events or bundle the Node.js agent SDK into the browser.
If a real server-side AI feature is added later, instrument that server at its
provider/session boundary and preserve the existing browser analytics.
