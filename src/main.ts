import * as core from "@actions/core";
import * as fs from "fs";
const axios = require("axios");
import { Agent } from "https";

export async function run(): Promise<void> {
  try {
    const opaServerUrl =
      core.getInput("opaServerUrl") || "http://localhost:8181";
    const opaServerAuthToken = core.getInput("opaServerAuthToken");
    const opaPoliciesPath = core.getInput("opaPoliciesPath") || "./policies";
    const recurseDirs = core.getInput("recurseDirs") || true;
    const skipTlsValidation = core.getInput("skipTlsValidation");

    const headers = {
      Authorization: `Bearer ${opaServerAuthToken}`,
      "Content-Type": "text/plain",
    };
    core.info(`----------- OPA Server Details ----------`);
    core.info(`🔗 URL: ${opaServerUrl}`);
    core.info(`📋 OPA Policies Path: ${opaPoliciesPath}`);
    core.info(`-----------------------------------------`);

    const httpsAgent = new Agent({
      rejectUnauthorized: skipTlsValidation ? false : true,
    });
    skipTlsValidation
      ? core.warning(
          "❗🔓 Skip TLS Validation enabled. Please be careful while using this.",
        )
      : core.info("💚🔒 Skip TLS Validation disabled.");

    const files = fs
      .readdirSync(opaPoliciesPath, { recursive: !!recurseDirs })
      .filter((fn) => fn.toString().endsWith(".rego"));

    const regoMap = new Map();
    for (let filePath of files) {
      if (regoMap.has(filePath)) {
        core.setFailed(`Duplicate Policy with Name: ${filePath}`);
      } else {
        const data = fs.readFileSync(opaPoliciesPath + "/" + filePath, "utf8");
        regoMap.set(filePath, data);
      }
    }

    let currentPoliciesList: string[] = [];
    const currentPoliciesResponse = await axios
      .create({ httpsAgent })
      .get(`${opaServerUrl}/v1/policies`, {
        headers,
      });
    if (currentPoliciesResponse.status === 200) {
      currentPoliciesList = currentPoliciesResponse.data.result.map(
        (x: { id: string }) => x.id,
      );
      core.info(`Current Policies Count on OPA Server: ${currentPoliciesList}`);
    } else {
      core.error(
        `🛑⚠️❗ Get Policies failed with status code: ${currentPoliciesResponse.status}`,
      );
    }

    const policiesToDelete = currentPoliciesList.filter((policyName) => {
      return !policyName.startsWith("bootstrap") && !regoMap.has(policyName);
    });

    // Create/Update Policies
    for (const [key, value] of regoMap) {
      const policyCreateResponse = await axios
        .create({ httpsAgent })
        .put(`${opaServerUrl}/v1/policies/${key}`, value, {
          headers,
        });
      if (policyCreateResponse.status === 200) {
        core.info(`✅ Policy ${key} created/updated successfully`);
      } else {
        core.error(
          `🛑⚠️❗ Create/Update Policies for ${key} failed with status code: ${currentPoliciesResponse.status}`,
        );
      }
    }

    // Delete Deleted Policies
    core.info(`The following policies will be deleted: ${policiesToDelete}`);
    for (let policy of policiesToDelete) {
      const policyDeleteResponse = await axios
        .create({ httpsAgent })
        .delete(`${opaServerUrl}/v1/policies/${policy}`, {
          headers,
        });
      if (policyDeleteResponse.status === 200) {
        core.info(`❎ Policy ${policy} deleted successfully`);
      } else {
        core.error(
          `🛑⚠️❗ Delete Policies for ${policy} failed with status code: ${currentPoliciesResponse.status}`,
        );
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
