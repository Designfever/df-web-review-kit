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
- `project_id`
- `package_version`
- a stable anonymous `anonymous_id`
- `reviewer_name` only when df-sheet provides it

Event properties are allowlisted. Review content, target-page text, form values,
API keys, tokens, URLs, and error messages are not sent as analytics properties.

## Session Replay and failure behavior

Session Replay uses the SSO-provided sample rate (`1` by default) and `medium`
privacy masking, which masks all form inputs. Elements marked with
`data-amplitude-mask`, `data-sensitive`, or `data-secret` are also masked.

The Amplitude package is loaded only when analytics is configured. SDK loading,
initialization, and event delivery are fire-and-forget: failures never block
login, rendering, saving, uploads, or imports. The Amplitude SDK owns its normal
offline queue and delivery retry behavior.
