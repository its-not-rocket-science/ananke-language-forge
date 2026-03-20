import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { CampaignReader } from "./CampaignReader.js";
import { createProvider } from "./LLMClient.js";
import { LanguageContextBuilder } from "./LanguageContextBuilder.js";
import { OutputParser } from "./OutputParser.js";
import { PromptTemplates } from "./PromptTemplates.js";

interface CliOptions {
  input: string;
  output?: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { input: "examples/campaign.json", dryRun: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") options.input = argv[index + 1] ?? options.input;
    if (arg === "--output") {
      const value = argv[index + 1];
      if (value) options.output = value;
    }
    if (arg === "--dry-run") options.dryRun = true;
  }

  return options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const campaign = await CampaignReader.fromFile(options.input);
  const context = LanguageContextBuilder.build(campaign);
  const request = PromptTemplates.buildLanguagePackagePrompt(context);

  if (options.dryRun) {
    console.log(JSON.stringify({ context, request }, null, 2));
    return;
  }

  const provider = createProvider();
  const response = await provider.generate(request);
  const languagePackage = OutputParser.parseLanguagePackage(response.text, context, {
    provider: response.provider,
    model: response.model,
  });

  const serialized = JSON.stringify(languagePackage, null, 2);
  if (options.output) {
    await mkdir(dirname(options.output), { recursive: true });
    await writeFile(options.output, serialized + "\n", "utf8");
    console.log(`Wrote language package to ${options.output}`);
    return;
  }

  console.log(serialized);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exit(1);
});
