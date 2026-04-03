# Changelog

## [1.1.0] - 2026-04-03

### Added

- HTML stripping for email body previews — clean plain text instead of raw HTML
- Forwarded-via detection — shows which email address forwarded the message (e.g. "via mail@example.com")
- `to` field on emails to track the receiving/forwarding address
- Expandable body preview on noise cards (previously only action/loop cards had this)

### Changed

- Noise section refactored into dedicated `NoiseCard` component with full card layout (sender email, subject, via badge, expand/collapse)
- "forwarded" badge replaced with specific "via {email}" display on all card types

## [1.0.0] - 2026-03-29

### Added

- Gmail fetch with OAuth2
- Claude Haiku batch triage (action / loop / noise)
- Forwarded email original sender resolution
- React frontend with Action needed + In the loop sections
- Delete and archive per email
- Bulk archive and delete for In the loop section
- Checkbox selection with select all / indeterminate state
- Inline email body preview (expand/collapse per card)
- Unsubscribe link on cards where List-Unsubscribe header is present
- IndexedDB cache with server as source of truth
