const url = "https://klarsprak.denied.se/";
const attempts = 5;

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });

    if (response.status < 500) {
      console.log(`${url} svarade ${response.status} — Cloudflare-edge lever (försök ${attempt})`);
      process.exit(0);
    }

    console.error(`försök ${attempt}: Cloudflare-edge svarade ${response.status}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`försök ${attempt}: ingen fungerande HTTPS-respons (${message})`);
  }

  if (attempt < attempts) {
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
}

console.error(`::error::${url} gav ingen fungerande edge-respons efter ${attempts} försök`);
process.exit(1);
