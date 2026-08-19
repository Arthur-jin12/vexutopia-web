// EEA member states — EU 27 plus Iceland, Liechtenstein and Norway.
// ISO 3166-1 alpha-2, as reported by Cloudflare for the visitor's IP.
//
// Mercuryo's onramp asks EEA customers to pick a wallet type instead of
// showing the Boost Points opt-out, so Step 4 of the instructions differs
// here. Every other country (Switzerland, Australia, …) keeps the original
// Boost Points wording.
export const EEA_COUNTRIES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LI', 'LT', 'LU',
  'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
];

const EEA_SET = new Set(EEA_COUNTRIES);

/**
 * True only for a known EEA country code. Anything else — including the
 * placeholders Cloudflare uses when it cannot geolocate ('XX', 'T1') and a
 * missing value in local dev — falls through to the default instructions.
 */
export function isEeaCountry(code) {
  return typeof code === 'string' && EEA_SET.has(code.trim().toUpperCase());
}
