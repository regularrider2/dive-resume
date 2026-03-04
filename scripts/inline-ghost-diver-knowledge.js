#!/usr/bin/env node
/**
 * Inlines src/data/david-knowledge.md into the Ghost Diver Edge Function.
 * Run: npm run build:ghost-diver
 * Then deploy: supabase functions deploy npc-chat
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const knowledgePath = join(root, 'src', 'data', 'david-knowledge.md');
const templatePath = join(root, 'supabase', 'functions', 'npc-chat', 'index.template.ts');
const outputPath = join(root, 'supabase', 'functions', 'npc-chat', 'index.ts');

const knowledge = readFileSync(knowledgePath, 'utf8');
// Escape for use inside a TypeScript template literal: \ ` $ need escaping
const escaped = knowledge
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$/g, '\\$');

const template = readFileSync(templatePath, 'utf8');
const output = template.replace('__KNOWLEDGE_PLACEHOLDER__', escaped);

writeFileSync(outputPath, output, 'utf8');
console.log('Ghost Diver: inlined david-knowledge.md into supabase/functions/npc-chat/index.ts');
console.log('Deploy with: supabase functions deploy npc-chat');
