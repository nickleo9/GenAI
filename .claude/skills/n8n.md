# n8n Workflow Manager

You are now in n8n workflow management mode. Help the user inspect, modify, and create n8n workflows.

## Available MCP Tools

1. **search_workflows** - Search workflows by name/description
2. **get_workflow_details** - Get full workflow definition (nodes, connections, triggers)
3. **execute_workflow** - Execute a workflow (chat/form/webhook trigger)
4. **search_n8n_knowledge_sources** - Search n8n documentation

## Workflow Editor (Meta-Workflow)

The user has a **Workflow Editor** workflow (ID: `qn9sL1xogJSbr7tS`) deployed on n8n at `https://nickleo9.zeabur.app`. This workflow exposes a webhook that allows programmatic editing of ANY workflow.

### How to Use

Call `execute_workflow` with `workflowId: "qn9sL1xogJSbr7tS"` and webhook inputs:

```json
{
  "type": "webhook",
  "webhookData": {
    "method": "POST",
    "body": {
      "action": "<action>",
      "workflowId": "<target-workflow-id>",
      "data": { ... }
    }
  }
}
```

### Supported Actions

| Action | Description | `data` Format |
|--------|-------------|---------------|
| `get` | Get workflow definition | (none) |
| `update` | Replace entire workflow | `{ name, nodes, connections, settings }` |
| `update_node` | Update a single node | `{ nodeName: "...", nodeData: { parameters: {...} } }` |
| `add_node` | Add a new node | `{ node: { name, type, typeVersion, position, parameters } }` |
| `delete_node` | Delete a node and its connections | `{ nodeName: "..." }` |
| `create` | Create a brand new workflow | `{ name, nodes, connections, settings }` |

## Workflow Pattern

When the user asks you to work with n8n:

1. **Understand**: Use `search_workflows` to find the target workflow, then `get_workflow_details` to inspect it
2. **Plan**: Explain what changes you'll make before executing
3. **Execute**: Use the Workflow Editor to make changes
4. **Verify**: Use `get_workflow_details` again to confirm the changes were applied
5. **Report**: Summarize what was done

## Important Notes

- Always preserve existing nodes (especially MCP triggers and tool nodes) when doing full `update`
- When adding nodes, make sure to also update connections if the node needs to be wired into the flow
- The Workflow Editor can edit itself - be careful with self-referential updates
- For complex changes, prefer multiple small operations (add_node, update_node) over a single full update
- Use `search_n8n_knowledge_sources` when you need to look up node types, parameters, or n8n concepts
