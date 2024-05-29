
/**
 * Expose
 */

module.exports = {
    host: 'http://stagingapi.briefencounter.com:5000',
    db: 'mongodb://briefencounterapi:YYu8WFeqvgZFSpaIlv@dogen.mongohq.com:10045/brief-encounter',
    stripe : {
        webhook: '/bfencounter/webhook/url',
        secret_key: 'sk_test_WE7aisOcfScpSWqpE3NWVL7X',
        publishable_key: 'pk_test_rr0yIlpMVO7Lw4cANpGVtIhP',
        plan: 'lawyerStd'
    }
};
