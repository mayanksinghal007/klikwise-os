#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const BusinessAgent = require('./agent/engine');

const agent = new BusinessAgent();

function printHeader() {
  console.log('\n=========================================================');
  console.log('            BIZAGENT: AI Operations & Growth Engine       ');
  console.log('=========================================================\n');
}

function printUsage() {
  console.log(`Commands:
  node src/cli.js status
      Show current business profile, agent configuration, and connector status.

  node src/cli.js pipeline --query "<niche>" --location "<city>" [--count <number>]
      Run full automated pipeline: Maps Leads -> Enrich -> AI Pitch -> CRM -> Mailer.

  node src/cli.js enrich --url "<website_url>"
      Scrape a website and extract emails, phone numbers, and social links.

  node src/cli.js pitch --name "<company>" --industry "<sector>" [--email "<email>"]
      Generate a customized AI outreach email for a prospect.

  node src/cli.js reply --message "<customer inquiry message>"
      Auto-draft a customer support response using your business knowledge base.

  node src/cli.js contract --client "<Client Name>" --email "<client@email.com>"
      Generate a Documenso contract / agreement signing draft.
`);
}

async function main() {
  printHeader();
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  // Parse flags like --query "value" --location "value"
  const flags = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }

  switch (command) {
    case 'status': {
      const p = agent.profile;
      console.log('BUSINESS PROFILE:');
      console.log(`  Name:      ${p.business?.name || 'Not set'}`);
      console.log(`  Tagline:   ${p.business?.tagline || 'Not set'}`);
      console.log(`  Industry:  ${p.business?.industry || 'Not set'}`);
      console.log(`  Email:     ${p.business?.contact_email || 'Not set'}`);
      console.log(`  Offerings: ${(p.offerings || []).map(o => o.name).join(', ') || 'None'}`);
      console.log('\nINTEGRATED CONNECTORS:');
      console.log(`  - Gemini AI Engine:     ${agent.apiKey ? 'CONNECTED' : 'STANDBY (Using Smart Template Engine)'}`);
      console.log(`  - Google Maps Scraper:  ${agent.mapsScraper.baseUrl}`);
      console.log(`  - Twenty CRM:           ${agent.crm.isConfigured() ? 'CONFIGURED' : 'DEV MODE (Mock Enabled)'}`);
      console.log(`  - Listmonk Mailer:      ${agent.mailer.isConfigured() ? 'CONFIGURED' : 'DEV MODE (Mock Enabled)'}`);
      console.log(`  - Cal.com Scheduler:    ${agent.scheduler.isConfigured() ? 'CONFIGURED' : 'ACTIVE (Link Mode)'}`);
      console.log(`  - Chatwoot Support:     ${agent.support.isConfigured() ? 'CONFIGURED' : 'DEV MODE (Mock Enabled)'}`);
      console.log(`  - Documenso Contracts:  ${agent.contracts.isConfigured() ? 'CONFIGURED' : 'DEV MODE (Mock Enabled)'}`);
      console.log('\n[Tip] Update config/business_profile.json with your business details anytime.\n');
      break;
    }

    case 'pipeline': {
      const query = flags.query || 'Digital Marketing Agency';
      const location = flags.location || 'Miami, FL';
      const count = parseInt(flags.count || '3', 10);

      console.log(`Running Autonomous Pipeline for "${query}" in "${location}" (Target: ${count} leads)...\n`);
      const report = await agent.runPipeline({ query, location, count });

      console.log('\n---------------- PIPELINE SUMMARY ----------------');
      console.log(`Leads Processed:      ${report.results.length}`);
      console.log(`Twenty CRM Synced:    ${report.crmSynced}`);
      console.log(`Listmonk Enrolled:    ${report.mailerEnrolled}`);
      console.log('--------------------------------------------------\n');

      console.log('SAMPLE LEAD & PITCH GENERATED:');
      if (report.results[0]) {
        const sample = report.results[0];
        console.log(`Company:   ${sample.title}`);
        console.log(`Website:   ${sample.website}`);
        console.log(`Email:     ${sample.email}`);
        console.log(`Phone:     ${sample.phone}`);
        console.log(`Subject:   ${sample.pitch.subject}`);
        console.log(`Booking:   ${sample.pitch.bookingLink}`);
        console.log('\nEmail Body:');
        console.log(sample.pitch.body);
      }
      break;
    }

    case 'enrich': {
      const url = flags.url;
      if (!url) {
        console.error('Error: Please specify --url "<https://example.com>"');
        return;
      }
      console.log(`Enriching website: ${url}...`);
      const data = await agent.siteEnricher.enrichUrl(url);
      console.log('\nEnrichment Results:');
      console.log(JSON.stringify(data, null, 2));
      break;
    }

    case 'pitch': {
      const name = flags.name || 'Acme Dental Care';
      const industry = flags.industry || 'Healthcare / Dental';
      const email = flags.email || 'doctor@acmedental.com';

      console.log(`Generating AI pitch for ${name} (${industry})...\n`);
      const pitch = await agent.generatePersonalizedPitch({
        title: name,
        category: industry,
        email
      });
      console.log('Subject:   ', pitch.subject);
      console.log('Calendar:  ', pitch.bookingLink);
      console.log('\nBody:\n' + pitch.body);
      break;
    }

    case 'reply': {
      const message = flags.message || 'Can you tell me how your services work and what you charge?';
      console.log(`Handling Customer Inquiry: "${message}"\n`);
      const response = await agent.answerCustomerInquiry(message);
      console.log('AI Response:\n');
      console.log(response);
      break;
    }

    case 'contract': {
      const client = flags.client || 'Enterprise Partner LLC';
      const email = flags.email || 'billing@enterprisepartner.com';

      console.log(`Preparing Documenso contract for ${client} (${email})...\n`);
      const contract = await agent.contracts.createContract({
        recipientName: client,
        recipientEmail: email,
        servicePackage: agent.profile.offerings?.[0]?.name || 'Standard Retainer',
        amount: agent.profile.offerings?.[0]?.pricing?.amount || '$2,500'
      });
      console.log('Contract Details:');
      console.log(JSON.stringify(contract, null, 2));
      break;
    }

    default:
      console.log(`Unknown command "${command}".`);
      printUsage();
      break;
  }
}

main().catch(err => {
  console.error('[BizAgent Error]', err);
});

