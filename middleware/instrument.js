const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
require('dotenv').config();


// Ensure to call this before requiring any other modules!
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});















// // middleware/instrument.js
// const Sentry = require("@sentry/node");
// const { nodeProfilingIntegration } = require("@sentry/profiling-node");

// Sentry.init({
//   dsn: "https://eee810d38543fb73e0fa5c1ed61733ca@o4508292561829888.ingest.us.sentry.io/4508292781637632",
//   integrations: [
//     nodeProfilingIntegration(),
//   ],
//   tracesSampleRate: 1.0, // Capture 100% of the transactions
// });

// module.exports = Sentry;





// // Import with `import * as Sentry from "@sentry/node"` if you are using ESM
// const Sentry = require("@sentry/node");
// const { nodeProfilingIntegration } = require("@sentry/profiling-node");

// Sentry.init({
//   dsn: "https://eee810d38543fb73e0fa5c1ed61733ca@o4508292561829888.ingest.us.sentry.io/4508292781637632",
//   integrations: [
//     nodeProfilingIntegration(),
//   ],
//   // Tracing
//   tracesSampleRate: 1.0, //  Capture 100% of the transactions
// });
// // Manually call startProfiler and stopProfiler
// // to profile the code in between
// Sentry.profiler.startProfiler();


// // Starts a transaction that will also be profiled
// Sentry.startSpan({
//   name: "My First Transaction",
// }, () => {
//   // the code executing inside the transaction will be wrapped in a span and profiled
// });

// // Calls to stopProfiling are optional - if you don't stop the profiler, it will keep profiling
// // your application until the process exits or stopProfiling is called.
// Sentry.profiler.stopProfiler();