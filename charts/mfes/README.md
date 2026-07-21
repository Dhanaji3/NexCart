# Per-MFE Overrides

This umbrella chart deploys multiple micro-frontends from a single values file. To override settings for a specific app, provide Helm `--set` overrides or a custom `values.yaml` with the following structure:

apps:

- name: mfe-auth
  image: frontend-mfe-auth
  tag: "<sha-or-tag>"
  resources:
  requests:
  cpu: "100m"
  memory: "128Mi"

You can pass a values file during `helm upgrade`:

```bash
helm upgrade --install mfes charts/mfes -f my-mfes-values.yaml --namespace ecommerce
```
