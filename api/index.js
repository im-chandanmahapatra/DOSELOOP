// Vercel Serverless Function entry point for DoseLoop Express API
const app = require('../server/dist/app').default;

module.exports = app;
