const webhookService = require("../services/webhookService");

const listWebhooks = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const webhooks = await webhookService.listWebhookLogs(
      merchantId,
      limit,
      offset
    );

    res.status(200).json(webhooks);
  } catch (error) {
    console.error("Error listing webhooks:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

const retryWebhook = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const webhookId = req.params.webhook_id;

    const result = await webhookService.retryWebhook(webhookId, merchantId);

    res.status(200).json(result);
  } catch (error) {
    if (error.code === "NOT_FOUND_ERROR") {
      return res.status(404).json({ error });
    }
    console.error("Error retrying webhook:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

module.exports = {
  listWebhooks,
  retryWebhook,
};
