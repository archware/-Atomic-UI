---
name: atomic-ui-builder
description: Build or evolve Angular interfaces with Atomic UI's canonical components, declared variants, UX rules, and recipes. Use for CRUDs, forms, lists, detail views, master-detail flows, dashboards, transactional screens, document screens, or any request that must select or add an Atomic component variant without inventing APIs, styles, backend behavior, or domain data.
---

# Atomic UI Builder

Read `DOCTRINA_DE_INTERFAZ.md` before composing any screen: the catalog says
which component to use, the doctrine says how a screen must behave so it does not
lie about its state, lose the user's work, or become unusable without a mouse.

Use the repository catalog as the source of truth. Load only the context required by the requested intent and components.

## Workflow

1. Inspect `git status --short` and preserve unrelated changes.
2. Classify the request as an existing recipe such as `modal-catalog`, `route-form`, or `master-detail`. Treat unmatched complex flows as manual composition.
3. Build compact context before editing:

   ```powershell
   npm.cmd run agent:context -- --intent crud --variant modal-catalog
   ```

4. Convert the request into explicit fields, actions, states, permissions, responsive priorities, and integration facts. Do not infer endpoints, DTOs, permissions, amounts, dates, status, trends, or business rules.
5. Select only component variants declared under `catalog/components/`. Use the canonical default unless the requirement provides a semantic reason for another variant.
6. Apply every matching rule under `catalog/ux-rules/`. Keep one primary action per action region, visible validation, complete async states, keyboard/focus behavior, and the responsive widths required by the rule catalog. For `PaginaCrud`, use Ver, Editar and Más acciones as the three physical controls: `maxVisible` counts direct actions, while destructive/state actions use `isMenuOnly`. A third direct contextual action requires a declared `accionDirectaContextual` with an existing id, justification and evidence; never add it for visual symmetry.
   A destructive action must declare its label, permission key and complete
   confirmation copy; never infer deletion, soft-delete or authorization.
7. Prefer the matching recipe under `catalog/recipes/`. Confirm that the
   consumer output root already exists; the generator creates only the feature
   and will not create an implicit project. Preview generated changes before
   writing:

   ```powershell
   npm.cmd run generate:ui -- --spec path\to\ui-requirement.json --output path\to\consumer --dry-run
   npm.cmd run generate:ui -- --spec path\to\ui-requirement.json --output path\to\consumer
   ```

8. Keep Atomic presentation-only. Consumers own routes, HTTP adapters, DTOs, state orchestration, permissions, and business logic. An integrated generation requires explicit endpoint, method, and contract information; otherwise generate UI-only ports and placeholders that cannot masquerade as working data.
9. If the required visual object or variant is absent, implement and validate it in Atomic first, add it to the catalog, then consume it. Do not reproduce it locally in the consumer.
   Before replacing existing markup or CSS, inventory its useful design and
   behavior. Promote that design into Atomic before removing the consumer
   implementation. For catalogs read `docs/CONTRATO_CATALOGOS_CRUD.md`, prefer
   `PaginaCrud` and use `SummaryList` with `layout="detail"` for readonly data.
   Do not assume the generator already emits that chassis: inspect the dry-run
   and reject a parallel visual implementation. Keep business code in the app.
10. Run the catalog, generator, lint, test, and build gates relevant to the change. Report any gate not run and why.

## Variant Decisions

- Choose by meaning and interaction, never by visual preference alone.
- Keep size, density, tone, state, and layout as independent typed axes when the component contract exposes them.
- Reject undeclared values and undocumented combinations.
- Use semantic action tones: primary for the single main action, neutral for secondary actions, danger for destructive actions, and success for confirmatory semantics. In the catalog profile, view is neutral and activate is green; the owner-approved ATOMIC-20260929-005 revision supersedes the historical green-eye exception. A showcase must render the same canonical component as consumers, not a styled imitation.
- Use compact density only where information volume or viewport constraints justify it; never reduce target or readability requirements.
- Preserve explicit loading, empty, error, disabled, readonly, invalid, and success states when they apply.

## Verification

Run these commands from the Atomic repository root:

```powershell
npm.cmd run catalog:check
npm.cmd run tokens:check
npm.cmd run tooling:test
npm.cmd run lint
npm.cmd test -- --watch=false
npm.cmd run build
npm.cmd run build-storybook
```

Use narrower component tests during iteration, but finish with the applicable repository gates. Never weaken a gate to make generated output pass.

## Context Sources

- Query `catalog/components/` for component APIs and variants.
- Query `catalog/recipes/` for page composition.
- Query `catalog/ux-rules/` for interaction and accessibility behavior.
- Read `governance/consumer/ATOMIC_GOVERNANCE.md` only when consumer ownership or propagation is in question.
- Read `.agents/workflows/atomic-design-guide.md` only when changing Atomic itself or when the compact catalog lacks a required decision.

## Catalog lessons — ATOMIC-20260929-004

For an existing catalog, verify the active component/template, not just files
left in the feature. Apply docs/CONTRATO_CATALOGOS_CRUD.md: preserve Ver,
Editar and Más acciones as the physical baseline; activate/deactivate belong in
the menu with their independent confirmation, never leave a second Save after
confirmation.
The consumer supplies real-change validity and close locking. Test both state
transitions, reverted edits, malformed IDs and refresh failure separately from
mutation failure. Review-only UX requirements are not automated generator gates.
