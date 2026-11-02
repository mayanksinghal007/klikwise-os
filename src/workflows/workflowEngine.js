/**
 * KLIKWise OS — Workflow Automation Engine
 * Supports Triggers, Conditions, Human Approval Gates, Tool Invocations, and Branching.
 */

const toolRegistry = require('../lib/toolSdk');
const security = require('../lib/security');

class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.initDefaultWorkflows();
  }

  registerWorkflow(workflow) {
    if (!workflow.id || !workflow.nodes) {
      throw new Error('Workflow must have an id and nodes.');
    }
    this.workflows.set(workflow.id, workflow);
  }

  listWorkflows() {
    return Array.from(this.workflows.values()).map(w => ({
      id: w.id,
      name: w.name,
      trigger: w.trigger,
      nodeCount: w.nodes.length,
      isPublished: w.isPublished
    }));
  }

  /**
   * Execute a workflow by ID with execution logging and approval checking
   */
  async executeWorkflow(workflowId, triggerPayload = {}, context = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const executionLog = {
      executionId: `exec-${Date.now()}`,
      workflowId,
      workflowName: workflow.name,
      startedAt: new Date().toISOString(),
      steps: [],
      status: 'RUNNING'
    };

    let currentPayload = { ...triggerPayload };

    for (let i = 0; i < workflow.nodes.length; i++) {
      const node = workflow.nodes[i];
      const stepRecord = {
        stepIndex: i + 1,
        nodeId: node.id,
        nodeType: node.type,
        name: node.name,
        startedAt: new Date().toISOString()
      };

      try {
        if (node.type === 'TRIGGER') {
          stepRecord.status = 'TRIGGERED';
          stepRecord.output = currentPayload;
        } else if (node.type === 'CONDITION') {
          const pass = node.evaluate(currentPayload);
          stepRecord.status = pass ? 'CONDITION_MET' : 'CONDITION_FAILED';
          stepRecord.output = { conditionPassed: pass };
          if (!pass) {
            executionLog.steps.push(stepRecord);
            executionLog.status = 'STOPPED_CONDITION_NOT_MET';
            return executionLog;
          }
        } else if (node.type === 'APPROVAL_GATE') {
          if (!context.isApproved) {
            stepRecord.status = 'WAITING_HUMAN_APPROVAL';
            executionLog.steps.push(stepRecord);
            executionLog.status = 'SUSPENDED_APPROVAL_REQUIRED';
            security.logAction({
              action: `WORKFLOW_APPROVAL_REQUIRED_${workflowId}`,
              actor: context.user || 'AUTOMATION',
              resource: workflowId,
              details: { step: node.name, payload: currentPayload }
            });
            return executionLog;
          }
          stepRecord.status = 'APPROVED';
        } else if (node.type === 'TOOL_ACTION') {
          const result = await toolRegistry.execute(node.toolId, node.mapInput(currentPayload), context);
          stepRecord.status = result.status;
          stepRecord.output = result.data || result.error;
          currentPayload = { ...currentPayload, [node.id]: result.data };
        }

        executionLog.steps.push(stepRecord);
      } catch (err) {
        stepRecord.status = 'ERROR';
        stepRecord.error = err.message;
        executionLog.steps.push(stepRecord);
        executionLog.status = 'FAILED';
        return executionLog;
      }
    }

    executionLog.status = 'COMPLETED';
    executionLog.completedAt = new Date().toISOString();

    security.logAction({
      action: `WORKFLOW_COMPLETED_${workflowId}`,
      actor: context.user || 'AUTOMATION',
      resource: workflowId,
      details: { totalSteps: executionLog.steps.length }
    });

    return executionLog;
  }

  initDefaultWorkflows() {
    // Default End-to-End B2B Growth Workflow
    this.registerWorkflow({
      id: 'wf_auto_discovery_to_deal',
      name: 'Autonomous Lead Discovery -> Enrichment -> CRM -> Outreach',
      trigger: 'MANUAL_OR_CRON',
      isPublished: true,
      nodes: [
        {
          id: 'step_trigger',
          type: 'TRIGGER',
          name: 'Manual or Scheduled Search Trigger'
        },
        {
          id: 'step_scrape',
          type: 'TOOL_ACTION',
          name: 'Scrape Google Maps Businesses',
          toolId: 'google_maps_scrape',
          mapInput: (p) => ({ query: p.query || 'Digital Marketing', location: p.location || 'Miami, FL', count: p.count || 2 })
        },
        {
          id: 'step_condition',
          type: 'CONDITION',
          name: 'Verify Leads Were Found',
          evaluate: (p) => Array.isArray(p.step_scrape) && p.step_scrape.length > 0
        },
        {
          id: 'step_crm_sync',
          type: 'TOOL_ACTION',
          name: 'Sync Top Lead to Twenty CRM',
          toolId: 'twenty_crm_sync',
          mapInput: (p) => {
            const first = p.step_scrape[0];
            return {
              businessName: first.title,
              website: first.website,
              address: first.address,
              phone: first.phone,
              email: `contact@${(first.website || 'lead').replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`
            };
          }
        },
        {
          id: 'step_approval',
          type: 'APPROVAL_GATE',
          name: 'Human Verification Before Outbound Email'
        },
        {
          id: 'step_mailer',
          type: 'TOOL_ACTION',
          name: 'Enroll Lead in Listmonk Campaign',
          toolId: 'listmonk_outreach',
          mapInput: (p) => ({
            email: p.step_crm_sync?.person?.email || 'prospect@example.com',
            name: p.step_scrape?.[0]?.title || 'Prospect'
          })
        }
      ]
    });
  }
}

module.exports = new WorkflowEngine();

