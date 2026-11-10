import type { Category } from "./types";

type Rule = { pattern: RegExp; category: Category };

const RULES: Rule[] = [
  { pattern: /gofood|grabfood|shopeefood|mcdonalds|mcdonald|kfc|pizza|burger|sushi|ramen|bakso|mie|nasi|ayam|seafood|warteg|warung|resto|restoran|kafe|cafe|coffee|starbucks|kopi|janji jiwa|fore|anomali|es teh|minuman|jus|smoothie|bakery|roti|cake|donat|dunkin|chatime|gong cha|boba|milktea|kebab|hotdog|sandwich|salad|sate|grill|bbq|dimsum|pho/i, category: "kuliner" },
  { pattern: /gojek|grabcar|grabbike|gocar|gobike|maxim|indriver|bluebird|taksi|ojek|motor|angkot|busway|transjakarta|mrt|lrt|commuter|kereta|krl|damri|bis|bus|tol|e-toll|parkir|bensin|pertamina|shell|bp |vivo |spbu|bbm|pertalite|pertamax|dexlite|biosolar/i, category: "transportasi" },
  { pattern: /shopee|tokopedia|lazada|blibli|bukalapak|tiktok shop|zalora|sociolla|matahari|ramayana|alfamart|alfamidi|indomaret|lawson|circle k|hypermart|giant|carrefour|transmart|superindo|hero|lotte|ikea|ace hardware|electronic city|erafone|ibox|samsung store|apple store|uniqlo|h&m|zara|pull&bear|bershka/i, category: "belanja" },
  { pattern: /listrik|pln|token listrik|pdam|air bersih|gas|pgn|internet|indihome|telkom|biznet|firstmedia|myrepublic|mnc|wifi|pulsa|paket data|xl|telkomsel|indosat|tri |smartfren|by.u|axis|bpjs kesehatan|bpjs ketenagakerjaan|asuransi|premi|cicilan|angsuran|kpr|kpm|leasing|fif|adira|wom|clips|multifinance/i, category: "tagihan" },
  { pattern: /transfer|tf |kirim uang|send money|top.?up|isi saldo|tarik tunai|wd |withdraw|setor|deposit|topup|flip|dana|ovo|gopay|shopeepay|linkaja|jenius|jago|blu |neobank|seabank/i, category: "transfer" },
  { pattern: /netflix|spotify|youtube premium|disney|vidio|viu|wetv|iflix|apple tv|hbo|prime video|game|steam|mobile legend|ml |pubg|free fire|ff |genshin|valorant|xbox|playstation|ps5|ps4|nintendo|bioskop|cgv|cinepolis|cinemaxx|xxl|tiket\.com|traveloka|loket|my theater|event|konser|festival/i, category: "hiburan" },
  { pattern: /apotek|apotik|kimia farma|guardian|century|watsons|halodoc|alodokter|good doctor|klinik|puskesmas|rumah sakit|rs |rsia |rsud |rsup |dokter|dr\.|spesialis|laboratorium|lab |radiologi|rontgen|usg|operasi|rawat|obat|vitamin|suplemen|masker|hansaplast|perhiasan kesehatan/i, category: "kesehatan" },
  { pattern: /sekolah|spp|ukt|bop|kuliah|universitas|kampus|les|bimbel|kursus|udemy|coursera|skillshare|dicoding|ruangguru|zenius|quipper|brainly|buku|gramedia|togamas|perpustakaan|beasiswa|pendidikan/i, category: "pendidikan" },
];

export function categorize(merchant: string, description: string): Category {
  const text = `${merchant} ${description}`;
  for (const rule of RULES) {
    if (rule.pattern.test(text)) return rule.category;
  }
  return "lainnya";
}
