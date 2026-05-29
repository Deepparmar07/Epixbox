const express = require('express');
const crypto = require('crypto');
const { Subscription } = require('../models');
const router = express.Router();

// POST /api/subscriptions/razorpay/webhook
router.post('/razorpay/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(400).json({ error: 'Razorpay webhook secret not configured' });

    const signature = req.headers['x-razorpay-signature'];
    const body = req.body ? req.body.toString('utf8') : '';
    if (!signature || !body) return res.status(400).json({ error: 'Missing signature or body' });

    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (expected !== signature) return res.status(400).json({ error: 'Invalid signature' });

    const event = JSON.parse(body);
    const ev = String(event.event || '');

    // Example payload handling: subscription.activated, subscription.charged, subscription.halted, subscription.cancelled
    const subscriptionId = event?.payload?.subscription?.entity?.id || null;
    const status = event?.payload?.subscription?.entity?.status || null;

    if (subscriptionId) {
      const sub = await Subscription.findOne({ where: { external_subscription_id: subscriptionId } });
      if (sub) {
        const updates = {};
        if (status) updates.status = status;
        if (event?.payload?.subscription?.entity?.current_start) updates.trial_end = event.payload.subscription.entity.current_start;
        await sub.update({ ...updates, updated_at: new Date() });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Razorpay subscription webhook error:', err.message || err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
