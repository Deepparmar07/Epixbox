const { razorpay } = require('../config/razorpay');
const { SubscriptionPlan, Subscription } = require('../models');

async function ensureRazorpayPlan(plan) {
  if (!razorpay) throw new Error('Razorpay not configured');
  if (!plan) throw new Error('Plan required');
  if (plan.razorpay_plan_id) return plan.razorpay_plan_id;

  // Create a Razorpay plan
  const period = plan.billing_period === 'yearly' ? 'annual' : 'monthly';
  const amount = Number(plan.price_cents || 0);
  const currency = process.env.RAZORPAY_CURRENCY || 'INR';

  const payload = {
    period, // 'monthly' or 'annual' per Razorpay docs
    interval: 1,
    item: {
      name: plan.name,
      amount: amount,
      currency,
    },
  };

  const created = await razorpay.plans.create(payload);
  if (!created || !created.id) throw new Error('Failed to create razorpay plan');

  plan.razorpay_plan_id = created.id;
  await plan.save();
  return created.id;
}

async function createSubscriptionForCustomer({ plan, customer }) {
  if (!razorpay) throw new Error('Razorpay not configured');
  if (!plan) throw new Error('Plan required');
  if (!customer || !customer.email) throw new Error('Customer with email required');

  const planId = await ensureRazorpayPlan(plan);

  const payload = {
    plan_id: planId,
    customer_notify: 1,
    customer: {
      name: customer.name || customer.email,
      email: customer.email,
      contact: customer.contact || undefined,
    },
    // let Razorpay handle billing cycles; no total_count to make it ongoing
  };

  const subscription = await razorpay.subscriptions.create(payload);
  if (!subscription || !subscription.id) throw new Error('Failed to create razorpay subscription');

  // Persist subscription record linking to our plan
  const dbSub = await Subscription.create({
    plan_id: plan.id,
    customer_email: customer.email,
    photographer_user_id: plan.user_id,
    external_subscription_id: subscription.id,
    status: subscription.status || 'created',
    trial_end: subscription.start_at ? (subscription.start_at + (plan.trial_days || 0) * 24 * 60 * 60) : null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return { subscription, dbSub };
}

module.exports = { ensureRazorpayPlan, createSubscriptionForCustomer };
