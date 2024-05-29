
/**
 * Expose
 */

module.exports = {
    host: 'http://briefencounter.com',
    db: process.env.MONGOHQ_URL,
    stripe : {
        webhook: '/bfencounter/webhook/url',
        secret_key: 'sk_test_WE7aisOcfScpSWqpE3NWVL7X',
        publishable_key: 'pk_test_rr0yIlpMVO7Lw4cANpGVtIhP',
        plan: 'lawyerStd'
    }
};
