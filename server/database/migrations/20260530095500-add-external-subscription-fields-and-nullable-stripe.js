'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = 'subscriptions';
    const has = await queryInterface.describeTable(table).catch(() => null);
    if (!has) return;

    // Add external fields if missing
    if (!has.external_subscription_id) {
      await queryInterface.addColumn(table, 'external_subscription_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'External subscription ID (Razorpay or other provider)',
      });
    }
    if (!has.external_customer_id) {
      await queryInterface.addColumn(table, 'external_customer_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'External customer ID (Razorpay or other provider)',
      });
    }

    // Allow stripe fields to be nullable (if they exist)
    if (has.stripe_subscription_id) {
      await queryInterface.changeColumn(table, 'stripe_subscription_id', { type: Sequelize.STRING(255), allowNull: true });
    }
    if (has.stripe_customer_id) {
      await queryInterface.changeColumn(table, 'stripe_customer_id', { type: Sequelize.STRING(255), allowNull: true });
    }
  },

  down: async (queryInterface) => {
    const table = 'subscriptions';
    const has = await queryInterface.describeTable(table).catch(() => null);
    if (!has) return;

    if (has.external_subscription_id) await queryInterface.removeColumn(table, 'external_subscription_id');
    if (has.external_customer_id) await queryInterface.removeColumn(table, 'external_customer_id');

    if (has.stripe_subscription_id) {
      await queryInterface.changeColumn(table, 'stripe_subscription_id', { type: Sequelize.STRING(255), allowNull: false });
    }
    if (has.stripe_customer_id) {
      await queryInterface.changeColumn(table, 'stripe_customer_id', { type: Sequelize.STRING(255), allowNull: false });
    }
  },
};
