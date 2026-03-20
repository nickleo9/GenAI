#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const N8N_BASE_URL = (process.env.N8N_BASE_URL || "").replace(/\/$/, "");
const N8N_API_KEY = process.env.N8N_API_KEY || "";

if (!N8N_BASE_URL || !N8N_API_KEY) {
  console.error("ERROR: N8N_BASE_URL and N8N_API_KEY environment variables are required.");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  "X-N8N-API-KEY": N8N_API_KEY,
};

async function n8nFetch(path, options = {}) {
  const url = `${N8N_BASE_URL}/api/v1${path}`;
  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`n8n API ${res.status}: ${body}`);
  }
  return JSON.parse(body);
}

const server = new McpServer({
  name: "n8n-workflow-editor",
  version: "1.0.0",
});

// Tool: Update an existing workflow
server.tool(
  "update_workflow",
  "Update an existing n8n workflow. Provide the workflow ID and the fields to update (name, nodes, connections, settings).",
  {
    workflowId: z.string().describe("The ID of the workflow to update"),
    name: z.string().describe("Workflow name"),
    nodes: z.array(z.any()).describe("Array of node objects"),
    connections: z.record(z.any()).describe("Connections object"),
    settings: z.record(z.any()).describe("Workflow settings object"),
  },
  async ({ workflowId, name, nodes, connections, settings }) => {
    try {
      const result = await n8nFetch(`/workflows/${workflowId}`, {
        method: "PUT",
        body: JSON.stringify({ name, nodes, connections, settings }),
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool: Update a single node within a workflow
server.tool(
  "update_workflow_node",
  "Update a single node in an existing workflow by node name. Fetches current workflow, replaces the matching node, and pushes back.",
  {
    workflowId: z.string().describe("The ID of the workflow"),
    nodeName: z.string().describe("The name of the node to update"),
    nodeData: z.record(z.any()).describe("The updated node object (partial merge supported: id, name, type, parameters, position, etc.)"),
  },
  async ({ workflowId, nodeName, nodeData }) => {
    try {
      // Fetch current workflow
      const wf = await n8nFetch(`/workflows/${workflowId}`);
      const idx = wf.nodes.findIndex((n) => n.name === nodeName);
      if (idx === -1) {
        return { content: [{ type: "text", text: `Error: Node "${nodeName}" not found in workflow.` }], isError: true };
      }
      // Merge node data
      wf.nodes[idx] = { ...wf.nodes[idx], ...nodeData };
      // Remove read-only fields before PUT
      const { id, active, createdAt, updatedAt, tags, shared, activeVersion, pinData, versionId, ...cleanWf } = wf;
      const result = await n8nFetch(`/workflows/${workflowId}`, {
        method: "PUT",
        body: JSON.stringify(cleanWf),
      });
      return {
        content: [{ type: "text", text: `Node "${nodeName}" updated successfully.\n${JSON.stringify(result.nodes.find(n => n.name === (nodeData.name || nodeName)), null, 2)}` }],
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool: Add a new node to an existing workflow
server.tool(
  "add_workflow_node",
  "Add a new node to an existing workflow and optionally connect it.",
  {
    workflowId: z.string().describe("The ID of the workflow"),
    node: z.record(z.any()).describe("The node object to add (must include name, type, typeVersion, position, parameters)"),
    connectFrom: z.string().optional().describe("Name of existing node to connect FROM (optional)"),
    connectTo: z.string().optional().describe("Name of existing node to connect TO (optional)"),
  },
  async ({ workflowId, node, connectFrom, connectTo }) => {
    try {
      const wf = await n8nFetch(`/workflows/${workflowId}`);
      // Add the node
      wf.nodes.push(node);
      // Add connections if specified
      if (connectFrom) {
        if (!wf.connections[connectFrom]) {
          wf.connections[connectFrom] = { main: [[]] };
        }
        if (!wf.connections[connectFrom].main[0]) {
          wf.connections[connectFrom].main[0] = [];
        }
        wf.connections[connectFrom].main[0].push({ node: node.name, type: "main", index: 0 });
      }
      if (connectTo) {
        if (!wf.connections[node.name]) {
          wf.connections[node.name] = { main: [[]] };
        }
        wf.connections[node.name].main[0].push({ node: connectTo, type: "main", index: 0 });
      }
      const { id, active, createdAt, updatedAt, tags, shared, activeVersion, pinData, versionId, ...cleanWf } = wf;
      const result = await n8nFetch(`/workflows/${workflowId}`, {
        method: "PUT",
        body: JSON.stringify(cleanWf),
      });
      return {
        content: [{ type: "text", text: `Node "${node.name}" added successfully.` }],
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool: Delete a node from a workflow
server.tool(
  "delete_workflow_node",
  "Remove a node from a workflow by name, and clean up its connections.",
  {
    workflowId: z.string().describe("The ID of the workflow"),
    nodeName: z.string().describe("The name of the node to remove"),
  },
  async ({ workflowId, nodeName }) => {
    try {
      const wf = await n8nFetch(`/workflows/${workflowId}`);
      wf.nodes = wf.nodes.filter((n) => n.name !== nodeName);
      // Clean connections
      delete wf.connections[nodeName];
      for (const [key, conn] of Object.entries(wf.connections)) {
        if (conn.main) {
          conn.main = conn.main.map((outputs) =>
            outputs.filter((o) => o.node !== nodeName)
          );
        }
      }
      const { id, active, createdAt, updatedAt, tags, shared, activeVersion, pinData, versionId, ...cleanWf } = wf;
      const result = await n8nFetch(`/workflows/${workflowId}`, {
        method: "PUT",
        body: JSON.stringify(cleanWf),
      });
      return {
        content: [{ type: "text", text: `Node "${nodeName}" deleted successfully.` }],
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool: Create a new workflow
server.tool(
  "create_workflow",
  "Create a brand new n8n workflow.",
  {
    name: z.string().describe("Name of the new workflow"),
    nodes: z.array(z.any()).optional().describe("Array of node objects (optional, defaults to empty)"),
    connections: z.record(z.any()).optional().describe("Connections object (optional)"),
    settings: z.record(z.any()).optional().describe("Settings object (optional)"),
  },
  async ({ name, nodes, connections, settings }) => {
    try {
      const result = await n8nFetch("/workflows", {
        method: "POST",
        body: JSON.stringify({
          name,
          nodes: nodes || [],
          connections: connections || {},
          settings: settings || { executionOrder: "v1" },
        }),
      });
      return {
        content: [{ type: "text", text: `Workflow created! ID: ${result.id}\n${JSON.stringify(result, null, 2)}` }],
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool: Activate/Deactivate a workflow
server.tool(
  "toggle_workflow",
  "Activate or deactivate a workflow.",
  {
    workflowId: z.string().describe("The ID of the workflow"),
    active: z.boolean().describe("true to activate, false to deactivate"),
  },
  async ({ workflowId, active }) => {
    try {
      // Fetch, set active, PUT back
      const wf = await n8nFetch(`/workflows/${workflowId}`);
      const { id, active: _, createdAt, updatedAt, tags, shared, activeVersion, pinData, versionId, ...cleanWf } = wf;
      const result = await n8nFetch(`/workflows/${workflowId}`, {
        method: "PUT",
        body: JSON.stringify(cleanWf),
      });
      // Use PATCH to activate/deactivate
      const patchResult = await n8nFetch(`/workflows/${workflowId}/${active ? "activate" : "deactivate"}`, {
        method: "PATCH",
      });
      return {
        content: [{ type: "text", text: `Workflow ${active ? "activated" : "deactivated"} successfully.` }],
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
