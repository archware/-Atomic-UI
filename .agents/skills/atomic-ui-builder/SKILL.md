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
6. Apply every matching rule under `catalog/ux-rules/`. Keep one primary action per action region, visible validation, complete async states, keyboard/focus behavior, and the responsive widths required by the rule catalog.
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
10. Run the catalog, generator, lint, test, and build gates relevant to the change. Report any gate not run and why.

## Variant Decisions

- Choose by meaning and interaction, never by visual preference alone.
- Keep size, density, tone, state, and layout as independent typed axes when the component contract exposes them.
- Reject undeclared values and undocumented combinations.
- Use semantic action tones: primary for the single main action, neutral for secondary actions, danger for destructive actions, and success only for confirmatory semantics.
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
