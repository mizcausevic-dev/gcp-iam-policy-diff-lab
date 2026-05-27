import { bindingRisks, policyLane, summary } from "../src/services/gcpIamPolicyDiffLabService.js";

console.log("gcp-iam-policy-diff-lab demo");
console.log(JSON.stringify(summary(), null, 2));
console.log(
  JSON.stringify(
    policyLane().map((lane) => ({
      lane: lane.lane,
      owner: lane.owner,
      status: lane.status
    })),
    null,
    2
  )
);
console.log(JSON.stringify(bindingRisks().slice(0, 3), null, 2));
