'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = 'subscription_plans';
    const has = await queryInterface.describeTable(table).catch(() => null);
    if (!has) return;
    if (!has.razorpay_plan_id) {
      await queryInterface.addColumn(table, 'razorpay_plan_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Razorpay plan ID for this plan (optional)',
      });
    }
  },

  down: async (queryInterface) => {
    const table = 'subscription_plans';
    const has = await queryInterface.describeTable(table).catch(() => null);
    if (!has) return;
    if (has.razorpay_plan_id) {
      await queryInterface.removeColumn(table, 'razorpay_plan_id');
    }
  },
};
