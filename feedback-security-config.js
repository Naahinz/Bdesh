// Staged protected feedback mode. This stays disabled until Turnstile is
// created, server secret configured, and the Edge Function is verified.
// Site key is public. NEVER put the Turnstile secret in a browser file.
window.BDESH_FEEDBACK_SECURITY=Object.freeze({
 enabled: false,
 siteKey: '0x4AAAAAAFzeGjyc20pKy81K'
});
