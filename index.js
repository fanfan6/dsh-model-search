/**
 * @dsh-model-search — Host half.
 *
 * Provides HTTP API endpoints for model listing and switching.
 * - GET  /model-search/api/models       → returns all models from all providers
 * - POST /model-search/api/switch-model → saves the selected model as default
 * - GET  /api/pet/*                     → silences 404 from @linxin666/dsh-pet
 */

const API_PREFIX = "/model-search/api";

export const name = "dsh-model-search";

export const inject = ["webServer", "settings", "agentDefaultModel"];

export function apply(ctx) {
  const webServer = ctx.get("webServer");
  if (!webServer) return;

  webServer.register({
    kind: "prefix",
    path: API_PREFIX,
    handler: async (req, res) => {
      try {
        const url = new URL(req.url ?? "/", "http://localhost");
        const path = url.pathname.slice(API_PREFIX.length) || "/";

        // GET /models — list all models from all providers (read from settings)
        if (req.method === "GET" && path === "/models") {
          const models = [];
          try {
            const settings = ctx.get("settings");
            const llmConfig = settings ? settings.get("llm-pi-ai") : null;
            if (llmConfig && llmConfig.providers) {
              for (const [providerId, providerConfig] of Object.entries(llmConfig.providers)) {
                const displayName = providerConfig.displayName || providerId;
                if (providerConfig.models && Array.isArray(providerConfig.models)) {
                  for (const model of providerConfig.models) {
                    models.push({
                      provider: displayName,
                      providerId: providerId,
                      name: model.name || model.id,
                      id: model.id,
                      description: model.description || "",
                    });
                  }
                }
              }
            }
          } catch (e) {
            console.error("dsh-model-search: failed to read settings:", e);
          }
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ ok: true, models }));
          return;
        }

        // POST /switch-model — switch the current model
        if (req.method === "POST" && path === "/switch-model") {
          const chunks = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          const { provider, model, providerId } = body;
          console.log(`dsh-model-search: Switching model to ${provider || providerId}/${model}`);
          try {
            const defaultModel = ctx.get("agentDefaultModel");
            if (defaultModel) {
              await defaultModel.saveSelection({
                provider: providerId || provider,
                model: model
              });
            }
          } catch (e) {
            console.error("dsh-model-search: switch model failed:", e);
          }
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "not found" }));
      } catch (error) {
        console.error("dsh-model-search: api error:", error);
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: String(error) }));
      }
    },
  });

  // Also register a handler for pet API (to silence 404 errors from @linxin666/dsh-pet)
  webServer.register({
    kind: "prefix",
    path: "/api/pet",
    handler: async (req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, pets: [], diagnostics: [] }));
    },
  });
}