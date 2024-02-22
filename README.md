# Open Policy Agent (OPA) Policy Sync Action

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub action that syncs REGO policies from Git to an OPA Server

## Usage

### Example workflow

This example updates policies from a git repository to an Open Policy Agent (OPA) Server.

```yaml
name: Policy validation using OPA
on: [ push, pull_request ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@latest
      - name: Sync policy from git to Open Policy Agent (OPA)
        uses: opsverse/opa-policy-sync@0.1.0
        with:
          opaServerUrl: "https://opa.example.com"
          opaServerAuthToken: ${{ secrets.OPA_SERVER_AUTH_TOKEN }}
          opaPoliciesPath: "./policies"
          recurseDirs: true
          skipTlsValidation: true # Skip TLS validation (Optional)
```

### Inputs

| Input                    | Description                                                                             |
|--------------------------|-----------------------------------------------------------------------------------------|
| `opaServerUrl`           | Open Policy Agent (OPA) Server address (with protocol)                                  |
| `opaServerAuthToken`     | Open Policy Agent (OPA) Auth token                                                      |
| `opaPoliciesPath`        | Path to REGO Policy directory                                                           |
| `recurseDirs`            | Whether to recursively traverse `opaPoliciesPath` (default = true)                      |
| `skipTlsValidation`      | Skip TLS validation. Get the data from OPA by ignoring the certificate (default = false)|

