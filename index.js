import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ChannelType,
} from "discord.js";


const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PORT = Number(process.env.PORT ?? 3000);

if (!DISCORD_TOKEN || !CHANNEL_ID) {
  throw new Error("Missing DISCORD_TOKEN or CHANNEL_ID");
}


const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});

await client.login(DISCORD_TOKEN);


const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method !== "POST" || url.pathname !== "/github") {
      return new Response("Not Found", { status: 404 });
    }

    const event = req.headers.get("x-github-event");
    if (event !== "release") {
      return new Response("Ignored", { status: 200 });
    }

    const payload = await req.json();

    if (payload.action !== "published") {
      return new Response("Ignored", { status: 200 });
    }

    const release = payload.release;
    const repo = payload.repository;


    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel || channel.type !== ChannelType.GuildText) {
      console.error("❌ Channel is not a guild text channel");
      return new Response("Invalid channel", { status: 500 });
    }

    const textChannel = channel;


    const embed = new EmbedBuilder()
      .setTitle(`🚀 New Release: ${release.tag_name}`)
      .setURL(release.html_url)
      .setDescription(
        (release.body ?? "No release notes provided.").slice(0, 3900)
      )
      .setColor(0x5865f2)
      .setFooter({ text: repo.full_name });

    await textChannel.send({ embeds: [embed] });

    console.log(`📦 Posted release ${release.tag_name}`);
    return new Response("OK", { status: 200 });
  },
});

console.log(`🌐 Webhook server listening on :${server.port}`);
