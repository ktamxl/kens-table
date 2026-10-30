/* Build script — generates the static pages for Ken's Table (食單).
   Source of truth for content lives here; output is plain HTML in the project dir. */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

/* ────────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────────── */

const CITIES = [
  { key: "guangzhou", en: "Guangzhou", zh: "廣州", accent: "#a8332a" },
  { key: "hongkong", en: "Hong Kong", zh: "香港", accent: "#1f4b3f" },
  { key: "shanghai", en: "Shanghai", zh: "上海", accent: "#5b3350" },
  { key: "shenzhen", en: "Shenzhen", zh: "深圳", accent: "#17555a" }
];

const RESTAURANTS = [
  {
    slug: "bingsheng-pinwei",
    city: "guangzhou",
    featured: true,
    status: "want",
    nameEn: "Bingsheng Pinwei",
    nameZh: "炳胜品味",
    locEn: "Zhujiang New Town Flagship",
    locZh: "珠江新城旗舰店",
    cuisine: "Cantonese",
    cuisineZh: "粤菜",
    price: "¥150–300 per person",
    area: "Zhujiang New Town, Tianhe",
    addressEn: "1–4/F, Shoufu Building, 2 Xiancun Road, Zhujiang New Town, Tianhe District — opposite the Guangdong Museum",
    addressZh: "天河区珠江新城冼村路2号1-4楼（省博物馆对面）",
    tagline: "The 86-square-metre seafood stall that became Guangzhou's Cantonese benchmark.",
    card: "The flagship of the group that started under Haizhu Bridge in 1996. Order the roast goose, the two char sius, and the pineapple bun.",
    awards: [
      { mark: "米", label: "MICHELIN Guide Selected", note: "Nine consecutive years, 2018–2026" },
      { mark: "必", label: "Dianping Must-Eat List", note: "Multiple years running" },
      { mark: "五", label: "National Five-Diamond Restaurant", note: "国家五钻级酒家" },
      { mark: "钻", label: "Trip.com Diamond Restaurant", note: "Bingsheng group, 2025" }
    ],
    groupAwards: [
      { label: "Black Pearl — Two Diamonds", zh: "黑珍珠二钻", who: "炳胜私厨（中达旗舰店）" },
      { label: "MICHELIN One Star", zh: "米其林一星", who: "炳胜公馆（珠江新城店）, since 2018" },
      { label: "Black Pearl — One Diamond", zh: "黑珍珠一钻", who: "炳胜公馆（珠江新城店）" }
    ],
    story: [
      "On 8 August 1996, a seafood stall opened under Haizhu Bridge with 86 square metres, a handful of tables and a single idea: serve the Cantonese food Guangzhou people actually grew up eating, at a standard worth crossing town for. The founders were 曹嗣标 and his brother-in-law 卢润炳 — one ran the floor, the other stood in the kitchen.",
      "The dish that built the reputation was 冰盘鱼生, Shunde-style raw fish laid over ice. It was not a banquet showpiece; it was a discipline. The fish had to be alive that morning, the knife work had to be exact, and the ice had to arrive at the table still dry and cold. Word spread through Haizhu, then across the river.",
      "In 2000 the kitchen did something that sounded like a mistake: it made char siu crisp. Cantonese cooks had spent generations chasing soft, yielding 叉烧, and 炳胜 deliberately went the other way — a thin, glassy crust that shatters before the meat gives way. 秘制脆皮叉烧 became the dish that other restaurants in Guangzhou had to answer.",
      "Thirty years later the group runs a matrix of brands — 炳胜品味 for the everyday table, 炳胜公馆 and 炳胜私厨 for the formal one, 小炳胜 for a younger crowd, 禅意茶素 for vegetarian — with a dedicated recipe development centre and, since late 2018, a foothold in Shenzhen. The flagship on Xiancun Road, four floors opposite the Guangdong Museum, is where the whole thing is easiest to read in a single meal."
    ],
    whyFamous: [
      "It is the birthplace of the crisp-school 叉烧 — the 2000 innovation that changed how Guangzhou talks about roast pork.",
      "Its 烧味 programme is treated as a syllabus: 灌汤烧鹅, 黑叉烧, 豉油皇鹅肠. Locals call the trio textbook-grade.",
      "The 冰盘鱼生 heritage is still on the menu — a Shunde technique most city restaurants have quietly dropped.",
      "Nine straight years in the MICHELIN Guide (Selected, 2018–2026) plus repeated 大众点评必吃榜 listings made it a default recommendation for visitors who want one reliable Cantonese meal.",
      "The room looks over the Pearl River towards Canton Tower — the view does a lot of the hosting for you."
    ],
    quote: { text: "炳承信念，旗开得胜。", cite: "The group's own four-character motto" },
    buzz: [
      "The pineapple bun is the size of a small melon, arrives hot, and hides a pineapple-jam centre. Regulars order it the moment they sit down, because it is the one item that sells out.",
      "Black char siu is the richer of the two — more than one diner calls it too fatty to finish alone. Share it, or ask the kitchen for a leaner cut.",
      "Weekend lunch queues can run an hour, and the room is built for groups rather than for two. Book, or come early and treat the wait as part of it."
    ],
    dishes: [
      {
        zh: "秘制脆皮灌汤烧鹅",
        en: "Secret-Recipe Crispy Roast Goose with Gravy",
        note: "The bird is roasted with a seasoned broth sealed inside, so the first cut releases gravy while the skin stays glass-crisp. This is the plate to judge the kitchen by.",
        tag: "Signature"
      },
      {
        zh: "秘制脆皮叉烧",
        en: "Secret-Recipe Crispy Char Siu",
        note: "The 2000 invention: a caramelised, brittle crust over fatty pork collar. Order it in the two-way platter with the black version to taste the difference side by side.",
        tag: "The original"
      },
      {
        zh: "秘制黑叉烧",
        en: "Secret-Recipe \"Black\" Char Siu",
        note: "Darker, stickier, heavier on aged soy and molasses. Cut thicker than the crisp version, so the inside stays juicy rather than candy-like.",
        tag: "Signature"
      },
      {
        zh: "豉油皇鹅肠",
        en: "Soy-Sauce Goose Intestines",
        note: "Wok-tossed in a sweet-savoury master sauce until the edges catch. Texture is the whole point — springy, never rubbery. With the roast goose and black char siu it forms the “iron triangle” locals order by default.",
        tag: "Local favourite"
      },
      {
        zh: "原始水晶三味豆腐",
        en: "Crystal Three-Flavour Tofu",
        note: "Silken tofu set in-house, served three ways in one bowl. A quiet dish that regulars order every visit — useful as a pause between the roast courses.",
        tag: "Regulars' order"
      },
      {
        zh: "章红鱼生",
        en: "Amberjack Yüsheng, Shunde Style",
        note: "The dish the original stall was built on: amberjack sliced thin, laid over ice with ginger, scallion, peanuts and oil. Eat it first, before anything fried.",
        tag: "Heritage"
      },
      {
        zh: "炳胜烧味三拼",
        en: "Bingsheng BBQ Trio",
        note: "Crisp char siu, black char siu and roast goose on one plate. If it is your first visit and the table is small, start here rather than choosing one.",
        tag: "Best first order"
      },
      {
        zh: "招牌菠萝包",
        en: "Signature Pineapple Bun",
        note: "Ranked around No. 2 for pineapple buns in Guangzhou on Dianping. Order it when you sit down — the kitchen bakes in batches and it is the one item that regularly runs out.",
        tag: "Dianping ranked"
      },
      {
        zh: "招积冰川茄",
        en: "\"Glacier\" Chilled Aubergine",
        note: "Aubergine fried until the shell is glassy, then dressed in a tangy chilled sauce. Sweet, sour and cold — the dish that resets your palate halfway through a long lunch.",
        tag: "Signature"
      },
      {
        zh: "腊味煲仔饭",
        en: "Claypot Rice with Cured Sausage and Preserved Meat",
        note: "The closer. Ask for the crisp rice at the bottom and let it sit two minutes before mixing; the lap mei fat needs that time to render into the grains.",
        tag: "Rice"
      }
    ],
    dishNote: "Compiled from the dishes that recur across Dianping's recommendation list for the Zhujiang New Town branch and the group's own menu notes. Prices and availability change by season — check the live menu on arrival.",
    branches: [
      { city: "Shenzhen", name: "炳胜品味（深圳湾万象城店）", en: "Bingsheng Pinwei, Shenzhen Bay MixC", note: "The group's Shenzhen beachhead, opened after the 2018 expansion south." },
      { city: "Guangzhou", name: "炳胜品味（海印总店）", en: "Bingsheng Pinwei, Haiyin original shop", note: "The original address by Haizhu Bridge — smaller, older, different energy." },
      { city: "Guangzhou", name: "炳胜品味（金融城店）", en: "Bingsheng Pinwei, Financial City", note: "A newer branch for the eastern business district." },
      { city: "Guangzhou", name: "炳胜品味（琶洲店）", en: "Bingsheng Pinwei, Pazhou", note: "Convenient on Canton Fair weeks; book well ahead." }
    ],
    sources: [
      { label: "Bingsheng Group — About", url: "https://www.bingsheng.com/About.html" },
      { label: "Bingsheng Group — Honours", url: "https://www.bingsheng.com/honor.html" },
      { label: "MICHELIN Guide Guangzhou", url: "https://guide.michelin.com/" },
      { label: "Dianping — 炳胜品味（珠江新城店）", url: "https://www.dianping.com/" }
    ]
  },

  {
    slug: "the-chairman",
    city: "hongkong",
    status: "want",
    nameEn: "The Chairman",
    nameZh: "大班樓",
    locEn: "Central",
    locZh: "中環",
    cuisine: "Cantonese",
    cuisineZh: "粵菜",
    price: "HK$800–1,200 per person",
    area: "Central",
    addressEn: "198 Wellington Street, Central, Hong Kong",
    addressZh: "香港中環威靈頓街198號",
    tagline: "The small Cantonese kitchen that reached No. 1 in Asia.",
    card: "No shark fin, no compromise on sourcing, house-made sauces and ferments. Book weeks ahead — this is the hardest table on the list.",
    awards: [
      { mark: "★", label: "MICHELIN One Star", note: "2026 Hong Kong guide" },
      { mark: "50", label: "Asia's 50 Best — No. 1", note: "2021 and 2026" },
      { mark: "10", label: "World's 50 Best — Top 10", note: "Highest-ranked Cantonese entry" }
    ],
    story: [
      "The Chairman opened in 2009, when Danny Yip decided that a Cantonese restaurant could be built the way a small European kitchen is built: around ingredients first, with the chef in the same room as the guests. The dining room was never designed to be grand. It was designed to be close to the cooking.",
      "What made it different was the pantry. Instead of leaning on oyster sauce and stock cubes, the kitchen made its own soy, its own fermented bean pastes, its own preserved citrus, and bought fish and shellfish at the morning market rather than through a distributor. In Hong Kong that was close to heresy — the economics of Cantonese banquet cooking depend on scale.",
      "The world noticed slowly, then all at once. In 2021 The Chairman became the first Chinese restaurant to take No. 1 on Asia's 50 Best Restaurants. It returned to the top of that list in 2026, and has held a MICHELIN star through both runs. Reservations now open on a fixed calendar and disappear within minutes."
    ],
    whyFamous: [
      "First Chinese restaurant to top Asia's 50 Best (2021), and No. 1 again in 2026.",
      "House-made sauces, ferments and preserved ingredients — a level of in-house production almost no Cantonese kitchen attempts.",
      "No shark fin, no abalone flex. The menu is built on river fish, crab, chicken and vegetables.",
      "A tiny room with a fixed booking calendar; the queue is virtual and merciless."
    ],
    quote: { text: "A Cantonese restaurant judged by its pantry, not its chandeliers.", cite: "How the Hong Kong press describes the house style" },
    knownSignatures: [
      { zh: "雞油花雕蒸花蟹配陳村粉", en: "Steamed Flower Crab with Huadiao Wine, Chicken Oil and Chencun Rice Noodles", note: "The dish most associated with the house: the rice noodles under the crab drink up wine, roe and chicken fat." },
      { zh: "話梅肉桂糖醋排骨", en: "Sweet-and-Sour Pork Ribs with Preserved Plum and Cassia", note: "A Cantonese classic rebuilt on aged plum and cassia bark rather than ketchup and sugar." },
      { zh: "魚湯腐皮卷", en: "Fish Soup with Bean-Curd Rolls", note: "A quiet test of the pantry — the soup is made from fish frames, not stock powder." }
    ],
    branches: [],
    singleNote: "One kitchen, one address. The Chairman does not franchise or open branches — which is exactly why the Shenzhen and Shanghai entries on this list cannot simply borrow it.",
    sources: [
      { label: "MICHELIN Guide Hong Kong", url: "https://guide.michelin.com/" },
      { label: "Asia's 50 Best Restaurants", url: "https://www.theworlds50best.com/asia/" }
    ]
  },

  {
    slug: "kams-roast-goose",
    city: "hongkong",
    status: "want",
    nameEn: "Kam's Roast Goose",
    nameZh: "甘牌燒鵝",
    locEn: "Wan Chai",
    locZh: "灣仔",
    cuisine: "Cantonese roast meats",
    cuisineZh: "粵式燒味",
    price: "HK$150–300 per person",
    area: "Wan Chai",
    addressEn: "226 Hennessy Road, Wan Chai, Hong Kong",
    addressZh: "香港灣仔軒尼詩道226號",
    tagline: "Third-generation Yung Kee family, a Michelin star in under a year.",
    card: "The queue starts before service. Come for the goose, stay for the roast suckling pig and braised goose liver.",
    awards: [
      { mark: "★", label: "MICHELIN One Star", note: "Awarded 2015, held every year since" }
    ],
    story: [
      "In 1942, 甘穗煇 opened 鏞記酒家 in Central. Over the next seventy years it became the restaurant the world used as shorthand for Cantonese roast goose — and, in the 2010s, the centre of a very public family dispute over its ownership.",
      "In 2014, the third generation left and opened their own shop in Wan Chai: 甘牌燒鵝, run by 甘崇轅 (Hardy Kam). It was a small room on Hennessy Road with a glass window of hanging birds, a queue system borrowed from a bakery, and the family's marinade recipe.",
      "Four months after opening, the MICHELIN Guide gave it a star. It has held that star every year since — one of the longest unbroken runs for a Hong Kong roast-meat shop, and an unusually fast ascent for a restaurant with no dining-room ambitions at all."
    ],
    whyFamous: [
      "Direct family line to Yung Kee (est. 1942): the same marinade logic, a much smaller room.",
      "MICHELIN star within four months of opening, retained for a decade.",
      "Goose is roasted in tight batches all afternoon, so the skin never has time to soften.",
      "Cash-and-queue operation: no reservations, no ceremony, very fast turnover."
    ],
    quote: { text: "Grandfather's marinade, grandson's queue.", cite: "The shorthand every Hong Kong food writer uses" },
    knownSignatures: [
      { zh: "甘氏燒鵝", en: "Kam's Roast Goose", note: "Order a quarter or half; ask for a little extra sauce on the side rather than poured over the skin." },
      { zh: "燒乳豬", en: "Roast Suckling Pig", note: "Sold by portion; the crackling is the reason to add it to a goose order." },
      { zh: "滷水鵝肝", en: "Braised Goose Liver", note: "Silky, tea-dark, served cool. The best value on the menu." },
      { zh: "滷水鵝掌翼", en: "Braised Goose Webs and Wings", note: "The dish to order if you are waiting for a table anyway." }
    ],
    branches: [
      { city: "Hong Kong", name: "甘牌燒鵝（灣仔店）", en: "Kam's Roast Goose, Wan Chai", note: "The original — and still the only one that matters." },
      { city: "Hong Kong", name: "甘牌燒鵝（中環店）", en: "Kam's Roast Goose, Central", note: "A smaller satellite for takeaway; the Wan Chai room is the full experience." }
    ],
    sources: [
      { label: "MICHELIN Guide Hong Kong", url: "https://guide.michelin.com/" },
      { label: "Kam's Roast Goose", url: "https://www.krg.com.hk/" }
    ]
  },

  {
    slug: "australian-dairy-company",
    city: "hongkong",
    status: "want",
    nameEn: "Australian Dairy Company",
    nameZh: "澳洲牛奶公司",
    locEn: "Jordan",
    locZh: "佐敦",
    cuisine: "Cha chaan teng",
    cuisineZh: "茶餐廳",
    price: "HK$50–90 per person",
    area: "Jordan",
    addressEn: "47–49 Parkes Street, Jordan, Kowloon",
    addressZh: "九龍佐敦白加士街47–49號",
    tagline: "Scrambled eggs, milk pudding, and the fastest, bluntest service in Kowloon.",
    card: "Three set meals, an unreasonably good scrambled egg, and ten-minute turnover. Ken's standing order is on the page in Cantonese, ready to show the waiter.",
    awards: [
      { mark: "無", label: "No Michelin star", note: "And no interest in one" }
    ],
    story: [
      "澳洲牛奶公司 opened in 1970 on Parkes Street, a short walk from Jordan MTR. It is not Australian and it does not sell dairy in any modern sense. What it sells is a fixed idea of breakfast: scrambled eggs, toast, macaroni soup with ham, and a bowl of steamed milk pudding.",
      "The room runs on choreography. You are seated with strangers, your order is taken before you finish sitting down, the food arrives in under two minutes, and the bill lands while you are still eating. Regulars consider the brusqueness part of the hospitality — it is a canteen, not a café.",
      "The one thing that has never been rushed is the egg. It is folded slowly over low heat until it is barely set, then piled on thick toast. Food writers have been trying to reproduce it for decades; the shop has never explained how."
    ],
    whyFamous: [
      "The scrambled egg — custardy, barely set, served on thick white toast. It is the reason the queue exists.",
      "Three set meals and nothing else: 早餐 (until noon), 茶餐 and 快餐. Regulars call them A, B and C — pick one, then choose fried or scrambled egg.",
      "蛋白燉鮮奶 (steamed egg-white milk pudding) and 杏汁燉蛋 (almond custard), both made in-house daily.",
      "A 1970s cha chaan teng interior that has been left almost untouched.",
      "Cash only, no reservations, shared tables — the queue moves faster than you expect."
    ],
    quote: { text: "You do not eat here. You get fed here.", cite: "Regulars, roughly" },
    orderCard: {
      zh: "腿蛋治，唔烘底，唔該。",
      en: "Ham and egg sandwich — please don't toast the bread.",
      note: "腿蛋治 is the shorthand for 火腿蛋三文治 (ham-and-egg sandwich). 烘底 means toasted, so 唔烘底 is “no toast”. Say it in one breath and the waiter will not ask twice."
    },
    dishes: [
      {
        zh: "快餐 A／B／C（早餐・茶餐・快餐）",
        en: "Set A / B / C — Breakfast, Tea Set, Express",
        note: "The three set meals are what almost every table orders: 早餐 until noon, 茶餐 through the afternoon, 快餐 all day. Each is a fixed plate — bread, egg, a bowl of soup noodles — with a hot drink. The only real decisions are fried or scrambled egg, and tea or coffee.",
        tag: "Most ordered"
      },
      {
        zh: "火腿蛋三文治（唔烘底）",
        en: "Ham and Egg Sandwich — bread not toasted",
        note: "Ken's standing order: 腿蛋治，唔烘底. Say it explicitly so the bread stays soft. Add 飛邊 if you also want the crusts cut off.",
        tag: "Ken's order"
      },
      {
        zh: "熱奶茶",
        en: "Hot Hong Kong Milk Tea",
        note: "Ordered simply as 熱奶茶 — strong tea, evaporated milk, no foam. If you want it sweetened with condensed milk instead of sugar, ask for 茶走.",
        tag: "Drink"
      },
      {
        zh: "炒蛋多士",
        en: "Scrambled Eggs on Toast",
        note: "The house icon: barely-set egg folded over thick toast. It already comes inside the sets; order it à la carte only if you are skipping the set.",
        tag: "Signature"
      },
      {
        zh: "法蘭西多士（西多）",
        en: "French Toast",
        note: "Deep-fried, buttered, syrup on the side. Ordered in shorthand as 西多. Share it — after a set meal it is a lot of sweetness for one person.",
        tag: "Sweet"
      },
      {
        zh: "花生醬多士",
        en: "Peanut Butter Toast",
        note: "Thick white bread, a heavy scrape of peanut butter. Ask for 奶醬多 if you want peanut butter and condensed milk together — the classic combination.",
        tag: "Toast"
      },
      {
        zh: "煉奶多士",
        en: "Condensed Milk Toast",
        note: "Warm toast with sweetened condensed milk poured over. Simpler than the French toast and, for many regulars, the better order.",
        tag: "Toast"
      },
      {
        zh: "蛋白燉鮮奶",
        en: "Steamed Egg-White Milk Pudding",
        note: "Served warm or cold; warm is the correct answer. Soft, faintly sweet, and the thing to order when you want to sit for five more minutes.",
        tag: "Dessert"
      },
      {
        zh: "杏汁燉蛋",
        en: "Almond Custard",
        note: "Fragrant, softly set, and the item most first-timers forget. Order it alongside the milk pudding and share both.",
        tag: "Dessert"
      },
      {
        zh: "火腿通粉",
        en: "Ham and Macaroni Soup",
        note: "The savoury anchor of every set — clear broth, elbow macaroni, a slice of ham. Not fashionable; entirely correct.",
        tag: "Set staple"
      }
    ],
    dishNote: "From the house menu and Ken's standing order. The sets are the cheapest way to eat here; the sandwich and the tea are ordered in cha chaan teng shorthand — the exact line is in the order card above.",
    branches: [],
    singleNote: "No branches. The Parkes Street shop is the entire business — copying it elsewhere is a Hong Kong pastime that has never quite worked.",
    sources: [
      { label: "OpenRice Hong Kong", url: "https://www.openrice.com/" }
    ]
  },

  {
    slug: "dian-dou-de",
    city: "shenzhen",
    status: "want",
    nameEn: "Dian Dou De",
    nameZh: "点都德",
    locEn: "Shenzhen branches",
    locZh: "深圳分店",
    cuisine: "Cantonese teahouse / dim sum",
    cuisineZh: "粵式茶樓・點心",
    price: "¥80–130 per person",
    area: "Multiple districts",
    addressEn: "Several branches across Shenzhen; the Guangzhou flagships are in Yuexiu and Liwan",
    addressZh: "深圳多區設有分店；廣州總店位於越秀、荔灣",
    tagline: "A 1933 Guangzhou teahouse that still makes dim sum by hand.",
    card: "Ninety years old, still hand-making every basket. The Shenzhen branches are the easiest way to eat Guangzhou-style yum cha without the border.",
    awards: [
      { mark: "老", label: "Guangzhou Old Brand", note: "广州老字号" },
      { mark: "非", label: "Intangible Heritage Unit", note: "非物质文化遗产保育单位" }
    ],
    story: [
      "点都德 traces itself to 1933, when 沈绍清 returned from abroad, married into a Longgui family and took over their teahouse, renaming it 德香楼. It closed during the Cultural Revolution and was revived in stages — a restaurant here, a private kitchen there — before the first 点都德大茶楼 opened in 2013.",
      "The name is Cantonese slang: 点都德, roughly \"whatever you order, it's fine\" — the phrase a host uses to wave away a guest's hesitation. The brand leans hard into that idea, with trolleys, loud rooms and a menu of more than fifty dim sum.",
      "It holds 广州老字号 status and is listed as a heritage conservation unit for Cantonese teahouse culture. The Shenzhen branches are the practical option for anyone staying on this side of the border: same kitchen system, same hand-folded dumplings, shorter queue."
    ],
    whyFamous: [
      "Dim sum is still made by hand in-house rather than bought in frozen — increasingly rare at this price.",
      "A 1933 lineage, officially recognised as a Guangzhou old brand.",
      "Trolley service and a menu long enough to eat across three visits.",
      "Shenzhen branches make it the default recommendation for visitors who want yum cha without crossing to Hong Kong."
    ],
    quote: { text: "点都德 — \"whatever you order, it's fine.\"", cite: "The Cantonese phrase the brand is named after" },
    knownSignatures: [
      { zh: "沙爹金钱肚", en: "Satay Beef Tripe", note: "Braised soft, then finished in a thick satay sauce. The dish regulars order first." },
      { zh: "百合酱蒸凤爪", en: "Chicken Feet Steamed in Lily-Bulb Sauce", note: "Sticky, savoury, faintly sweet. Get two baskets." },
      { zh: "虾饺皇", en: "Shrimp Dumpling", note: "The benchmark for any dim sum kitchen: translucent wrapper, whole shrimp, no filler." },
      { zh: "蜜汁叉烧包", en: "Honey Char Siu Bao", note: "Split-top, soft, with a proper sweet-savoury filling." }
    ],
    branches: [
      { city: "Guangzhou", name: "点都德（大茶楼）", en: "Dian Dou De, Grand Teahouse", note: "The 2013 flagship that relaunched the brand." },
      { city: "Shenzhen", name: "点都德（福田 / 罗湖 / 南山各分店）", en: "Dian Dou De, Futian / Luohu / Nanshan", note: "Several branches; the Futian rooms are the busiest at weekend brunch." }
    ],
    sources: [
      { label: "Dianping", url: "https://www.dianping.com/" },
      { label: "Brand history (Wikipedia)", url: "https://zh.wikipedia.org/wiki/%E7%82%B9%E9%83%BD%E5%BE%B7" }
    ]
  },

  {
    slug: "fan-lou",
    city: "shenzhen",
    status: "want",
    nameEn: "Fan Lou",
    nameZh: "蘩楼",
    locEn: "Huangbeiling",
    locZh: "黄贝岭店",
    cuisine: "Cantonese teahouse / dim sum",
    cuisineZh: "粵式茶樓・點心",
    price: "¥90–150 per person",
    area: "Luohu",
    addressEn: "Huangbeiling, Luohu District, Shenzhen",
    addressZh: "深圳市羅湖區黃貝嶺",
    tagline: "A Xiguan teahouse rebuilt in Shenzhen — six straight years on the Must-Eat List.",
    card: "The Shenzhen dim sum benchmark, and the reason this list needed a branch system: its Shanghai room at Xujiahui serves the same menu.",
    awards: [
      { mark: "必", label: "Dianping Must-Eat List", note: "Six consecutive years at Huangbeiling" },
      { mark: "老", label: "Revived Xiguan brand", note: "Late-Qing teahouse lineage" }
    ],
    story: [
      "蘩楼 began in late-Qing Guangzhou, in Xiguan, founded by a chef surnamed 黄. Its reputation rested on one detail: 虾饺 with a wrapper thin enough to read through, folded around shrimp that had been bought that morning. The original house did not survive the twentieth century.",
      "The brand was rebuilt in Shenzhen, where it now runs some of the busiest teahouse floors in the city. The Huangbeiling room has appeared on the 大众点评必吃榜 for six consecutive years — an unusually long run for a dim sum house in a city that opens new ones every month.",
      "It has since expanded to Shanghai, including a branch at 徐家汇汇金百货. That is precisely the case this site was built for: one flagship post in Shenzhen, one line in Shanghai, and a link back here rather than a second competing review."
    ],
    whyFamous: [
      "香脆明虾红米肠 — the crisp shrimp rice-roll that most photographs of the brand are built around.",
      "Hand-folded 虾饺 and a full trolley service in a Lingnan-style room.",
      "Six consecutive Dianping Must-Eat years at the Huangbeiling branch.",
      "Now in Shanghai as well, which makes it the test case for the branch-reference system on this site."
    ],
    quote: { text: "A teahouse is a room, a trolley and a pot of tea — everything else is detail.", cite: "The Xiguan teahouse tradition 蘩楼 is reviving" },
    knownSignatures: [
      { zh: "香脆明虾红米肠", en: "Crispy Shrimp Rice-Noodle Roll", note: "Three textures in one bite: soft red rice wrapper, crisp middle, whole shrimp." },
      { zh: "蘩楼露笋虾皇饺", en: "Asparagus Shrimp Dumpling", note: "The house benchmark — order it before anything else." },
      { zh: "金牌脆烤乳鸽", en: "Golden Crisp Roast Pigeon", note: "Roasted to order, split at the table. Best shared between two." },
      { zh: "干炒牛河", en: "Beef Ho Fun, Dry-Fried", note: "Wok hei test. If the noodles arrive glossy without pooling oil, the kitchen is awake." }
    ],
    branches: [
      { city: "Shanghai", name: "蘩楼（徐家汇汇金店）", en: "Fan Lou, Xujiahui Huijin", note: "The Shanghai room — same menu, different city. Read the Shenzhen post first." },
      { city: "Shenzhen", name: "蘩楼（华强北店）", en: "Fan Lou, Huaqiangbei", note: "Smaller, faster, popular with the lunch crowd." }
    ],
    sources: [
      { label: "Dianping", url: "https://www.dianping.com/" },
      { label: "Trip.com — 蘩楼（徐家汇汇金店）", url: "https://www.trip.com/" }
    ]
  },

  {
    slug: "fu-1088",
    city: "shanghai",
    status: "want",
    nameEn: "Fu 1088",
    nameZh: "福1088",
    locEn: "Zhenning Road",
    locZh: "镇宁路",
    cuisine: "Shanghainese (benbang)",
    cuisineZh: "本幫菜",
    price: "¥600–900 per person",
    area: "Changning",
    addressEn: "375 Zhenning Road, Changning District, Shanghai",
    addressZh: "上海市長寧區鎮寧路375號",
    tagline: "Benbang cooking served in a 1920s villa, one private room at a time.",
    card: "MICHELIN star plus a Black Pearl diamond. All private rooms, so book with a group and take the whole evening.",
    awards: [
      { mark: "★", label: "MICHELIN One Star", note: "Current Shanghai guide" },
      { mark: "珠", label: "Black Pearl — One Diamond", note: "黑珍珠一钻" }
    ],
    story: [
      "The house is one of three 1920s villas on Zhenning Road, collectively known as 福园. Original timber staircases, old window frames and patterned floor tiles were kept; the rooms were converted into private dining suites rather than knocked through into a single restaurant floor.",
      "In 2005, 方元 joined the family business and rebuilt the property as 福1088, pairing a design background with a benbang kitchen. Two siblings followed — 福1039 and 福1015 — each in its own villa, each with a slightly different register.",
      "The cooking is old Shanghai, cooked properly: braised pork belly that has been given time, river fish handled with restraint, and a kitchen willing to serve 青鱼秃肺 — the fat-rich swim bladder of black carp — which almost nobody outside the city orders."
    ],
    whyFamous: [
      "A MICHELIN star and a Black Pearl diamond in the same house.",
      "Private-room-only service in a genuine 1920s villa — it feels like dinner in someone's home, because it was.",
      "One of the few restaurants still serving the older benbang repertoire, including 青鱼秃肺.",
      "Part of a three-villa family group (福1088 / 福1039 / 福1015) on the same street."
    ],
    quote: { text: "Old Shanghai, served one room at a time.", cite: "The house's own description of the format" },
    knownSignatures: [
      { zh: "青鱼秃肺", en: "Black Carp Swim Bladder", note: "The dish that proves the kitchen's bona fides. Rich, gelatinous, faintly sweet." },
      { zh: "红烧肉", en: "Red-Braised Pork Belly", note: "Slow-braised, lacquered, served in a clay pot. The benchmark order." },
      { zh: "油爆虾", en: "Flash-Fried River Shrimp", note: "Shells crisp enough to eat, sauce reduced to a glaze." },
      { zh: "蟹粉豆腐", en: "Crab Roe with Tofu", note: "Seasonal; ask whether the crab is from Taihu before ordering." }
    ],
    branches: [
      { city: "Shanghai", name: "福1039", en: "Fu 1039", note: "Same family, adjacent villa, slightly more casual register." },
      { city: "Shanghai", name: "福1015", en: "Fu 1015", note: "The third villa in the group; strongest for larger private dinners." }
    ],
    sources: [
      { label: "MICHELIN Guide Shanghai", url: "https://guide.michelin.com/" },
      { label: "The Paper — 方元 interview", url: "https://www.thepaper.cn/" }
    ]
  },

  {
    slug: "ren-he-guan",
    city: "shanghai",
    status: "want",
    nameEn: "Ren He Guan",
    nameZh: "人和馆",
    locEn: "Xuhui",
    locZh: "徐汇店",
    cuisine: "Shanghainese (benbang)",
    cuisineZh: "本幫菜",
    price: "¥250–400 per person",
    area: "Xuhui",
    addressEn: "407 Zhaojiabang Road, Xuhui District — near Jiashan Road station (Lines 9 and 12)",
    addressZh: "上海市徐匯區肇嘉浜路407號（近嘉善路地鐵站）",
    tagline: "Six straight years of a MICHELIN star, with 1930s songs in the dining room.",
    card: "浓油赤酱 done by the book, a live trio singing old Shanghai standards, and a Michelin star six years running.",
    awards: [
      { mark: "★", label: "MICHELIN One Star", note: "Six consecutive years" }
    ],
    story: [
      "人和馆 builds its room out of a very specific memory: 1930s Shanghai, when a restaurant was also a dance floor and a stage. The dining room is fitted in dark wood and period glass, and a small band works through old Shanghai standards while the tables eat.",
      "The kitchen does not modernise. Benbang cooking is defined by 浓油赤酱 — heavy oil, heavy soy, heavy sugar — and 人和馆 applies it without apology: braised pork, oil-exploded shrimp, eel shredded and stir-fried until it caramelises at the edges.",
      "The MICHELIN Guide has given it one star for six consecutive years, which in Shanghai is a statement about consistency rather than novelty. Book ahead for dinner, and expect the music to be loud enough that you will lean across the table."
    ],
    whyFamous: [
      "Six consecutive MICHELIN stars — consistency rather than trend-chasing.",
      "Live 1930s Shanghai songs during service; the room is designed as theatre.",
      "A textbook 浓油赤酱 benbang menu: 红烧肉, 油爆虾, 鳝丝, 划水.",
      "One of the few places where a visitor can hear the city's old popular music while eating its old food."
    ],
    quote: { text: "浓油赤酱 — heavy oil, dark soy, and no apologies.", cite: "The benbang rule the kitchen cooks by" },
    knownSignatures: [
      { zh: "红烧肉", en: "Red-Braised Pork Belly", note: "Sweet, dark and collapsing. Order rice with it, not noodles." },
      { zh: "油爆虾", en: "Flash-Fried River Shrimp", note: "Eat the shells. The sugar in the glaze should be just short of burnt." },
      { zh: "响油鳝丝", en: "Sizzling Shredded Eel", note: "Hot oil poured at the table; the hiss is the point." },
      { zh: "红烧划水", en: "Braised Fish Tail", note: "The fattiest, most gelatinous cut — a benbang test dish." }
    ],
    branches: [],
    singleNote: "The Xuhui room is the one that holds the star. Treat any similarly named shop as a different restaurant until verified on Dianping.",
    sources: [
      { label: "MICHELIN Guide Shanghai", url: "https://guide.michelin.com/" },
      { label: "Dianping", url: "https://www.dianping.com/" }
    ]
  }
];

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const cityOf = (key) => CITIES.find((c) => c.key === key) || CITIES[0];
const bySlug = (slug) => RESTAURANTS.find((r) => r.slug === slug);

function page({ root, title, description, body, bodyClass = "", extraHead = "" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="theme-color" content="#14181a" />
<link rel="stylesheet" href="${root}assets/styles.css" />
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#14181a"/><text x="32" y="45" font-family="Georgia,serif" font-size="38" fill="#d9bd85" text-anchor="middle">食</text></svg>'
  )}" />
${extraHead}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
${topbar(root)}
${body}
${footer(root)}
<script src="${root}assets/app.js" defer></script>
</body>
</html>
`;
}

function topbar(root) {
  return `<header class="topbar">
  <div class="wrap topbar-inner">
    <a class="brand" href="${root}index.html">
      <span class="brand-en">Ken's Table</span>
      <span class="brand-cn">食單</span>
    </a>
    <nav class="topnav" aria-label="Main">
      <a href="${root}index.html">The list</a>
      <a href="${root}restaurants/index.html">All restaurants</a>
      <a href="${root}index.html#how-it-works" class="hide-sm">How it works</a>
    </nav>
  </div>
</header>`;
}

function footer(root) {
  return `<footer class="site-foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <div class="foot-brand">Ken's Table · 食單
          <span>A personal restaurant list across China</span>
        </div>
      </div>
      <div>
        <p class="foot-note">
          A working notebook, not a review site. One flagship post per restaurant;
          branches in other cities point back to the original instead of repeating it.
          Awards and dish lists are compiled from the restaurants' own material,
          the MICHELIN Guide and Dianping — always confirm hours and prices before you go.
        </p>
        <div class="foot-links" style="margin-top:22px">
          <a href="${root}index.html">The list</a>
          <a href="${root}restaurants/index.html">All restaurants</a>
          <a href="${root}index.html#how-it-works">How it works</a>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <span>Built for Ken · 2026</span>
      <span>Status choices are saved in this browser only</span>
    </div>
  </div>
</footer>`;
}

function card(r) {
  const city = cityOf(r.city);
  const tags = [];
  if (r.featured) tags.push('<span class="tag gold">Full feature</span>');
  else if (r.dishes) tags.push('<span class="tag gold">Top 10 inside</span>');
  r.awards.slice(0, 2).forEach((a) => tags.push(`<span class="tag">${esc(a.label)}</span>`));
  if (!r.dishes) tags.push('<span class="tag pending">Top 10 in progress</span>');

  const search = [r.nameEn, r.nameZh, r.locEn, r.locZh, r.cuisine, r.cuisineZh, city.en, city.zh, r.area]
    .join(" ")
    .toLowerCase();

  const main = `<h3>${esc(r.nameEn)} <span class="name-zh">(${esc(r.nameZh)})</span></h3>
      <p class="loc">${esc(r.locZh)} · ${esc(r.locEn)}</p>
      <p class="loc" style="color:var(--ink-soft)">${esc(r.card)}</p>
      <div class="cuisine"><span>${esc(r.cuisine)}</span><span>${esc(r.price.split(" per")[0])}</span></div>
      <div class="tags">${tags.join("")}</div>`;

  const peek = r.featured
    ? `<div class="cf-dishes">
        <span class="cf-label">Top of the ten</span>
        <ol class="cf-list">
          ${r.dishes
            .slice(0, 3)
            .map(
              (d, i) => `<li><span class="n">0${i + 1}</span><span><span class="zh">${esc(d.zh)}</span><span class="en">${esc(d.en)}</span></span></li>`
            )
            .join("")}
        </ol>
      </div>`
    : "";

  return `<a class="card reveal${r.featured ? " card--feature" : ""}" href="restaurants/${r.slug}/index.html"
      style="--accent:${city.accent}"
      data-restaurant data-slug="${r.slug}" data-city="${r.city}" data-default="${r.status}" data-search="${esc(search)}">
      <div class="card-top">
        <span class="city-tag">${esc(city.en)}</span>
        <span class="status" data-status-badge="${r.slug}" hidden></span>
      </div>
      ${r.featured ? `<div class="cf-grid"><div class="cf-main">${main}</div>${peek}</div>` : main}
    </a>`;
}

/* ────────────────────────────────────────────────────────────
   Home
   ──────────────────────────────────────────────────────────── */

function buildHome() {
  const feature = RESTAURANTS.find((r) => r.featured);
  const featuredCity = cityOf(feature.city);
  const peach = feature.dishes.slice(0, 3);

  const citySections = CITIES.map((c) => {
    const items = RESTAURANTS.filter((r) => r.city === c.key);
    return `<section class="city-section" data-city-section>
      <div class="city-head">
        <h2>${esc(c.en)}</h2>
        <span class="city-cn">${esc(c.zh)}</span>
        <span class="city-count">${items.length} ${items.length === 1 ? "entry" : "entries"}</span>
      </div>
      <div class="grid">${items.map(card).join("\n")}</div>
    </section>`;
  }).join("\n");

  const branches = [];
  RESTAURANTS.forEach((r) => {
    (r.branches || []).forEach((b) => {
      if (b.city !== cityOf(r.city).en) branches.push({ r, b });
    });
  });

  const body = `<main id="main">
  <section class="hero">
    <div class="wrap">
      <div class="hero-grid">
        <div>
          <p class="eyebrow">A personal eating list <span class="dot"></span> 2026</p>
          <h1>Where I want to eat next, <em>city by city.</em></h1>
          <p class="hero-lede">
            A working list of restaurants across China. Each restaurant gets <strong>one flagship post</strong> —
            the history, the awards, and a top ten worth ordering from. Branches in other cities get
            <strong>a single line that points back</strong> to that original post, so the list never forks into duplicates.
          </p>
        </div>
        <aside class="hero-aside">
          <div class="hero-cn">食單<small>The eating list</small></div>
          <p>${RESTAURANTS.length} restaurants, ${CITIES.length} cities, ${RESTAURANTS.filter((r) => r.dishes).length} full features. Every entry carries its Chinese name, its awards, and whether I have actually eaten there.</p>
        </aside>
      </div>

      <div class="stats">
        <div class="stat"><div class="stat-num">4</div><div class="stat-label">Cities</div></div>
        <div class="stat"><div class="stat-num">${RESTAURANTS.length}</div><div class="stat-label">Restaurants</div></div>
        <div class="stat"><div class="stat-num" data-count-for="want">0</div><div class="stat-label">Want to go</div></div>
        <div class="stat"><div class="stat-num" data-count-for="tried">0</div><div class="stat-label">Tried</div></div>
      </div>
    </div>
  </section>

  <section class="section" id="feature">
    <div class="wrap">
      <div class="section-head">
        <div>
          <p class="section-kicker">The current feature</p>
          <h2 class="section-title">Guangzhou · 炳胜品味（珠江新城旗舰店）</h2>
        </div>
        <p class="section-note">Full profile, ten dishes, every award, and the branch map.</p>
      </div>

      <a class="feature reveal" href="restaurants/${feature.slug}/index.html" style="--accent:${featuredCity.accent}">
        <div class="feature-body">
          <span class="feature-flag">Feature No. 01</span>
          <h2>${esc(feature.nameEn)} <span class="feat-zh">(${esc(feature.nameZh)})</span><span class="feat-loc">${esc(feature.locZh)} · ${esc(feature.locEn)}</span></h2>
          <p>${esc(feature.tagline)} Thirty years ago it was an 86-square-metre seafood stall under Haizhu Bridge. Today it is the flagship of a group with three MICHELIN-listed brands — and the restaurant most likely to change how you think about Cantonese roast meat.</p>
          <span class="feature-cta">Read the full feature</span>
        </div>
        <div class="feature-side">
          <h3>Top of the ten</h3>
          <ul class="dish-peek">
            ${peach
              .map(
                (d, i) => `<li><span class="n">0${i + 1}</span><span><span class="zh">${esc(d.zh)}</span><span class="en">${esc(d.en)}</span></span></li>`
              )
              .join("")}
          </ul>
          <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">
            ${feature.awards
              .slice(0, 3)
              .map((a) => `<span class="tag gold" style="border-color:rgba(217,189,133,.4);color:#e8d3a6;background:rgba(217,189,133,.1)">${esc(a.label)}</span>`)
              .join("")}
          </div>
        </div>
      </a>
    </div>
  </section>

  <section class="section" id="how-it-works">
    <div class="wrap">
      <div class="section-head">
        <div>
          <p class="section-kicker">One restaurant, many cities</p>
          <h2 class="section-title">Reference, not repetition</h2>
        </div>
        <p class="section-note">The rule that keeps this list readable as it grows past four cities.</p>
      </div>

      <div class="explainer">
        <div>
          <p><strong>A brand is not a branch.</strong> 炳胜 has four Guangzhou rooms and a Shenzhen one; 蘩楼 began in Xiguan, was rebuilt in Shenzhen, and now serves the same menu in Shanghai. Writing a separate review for each address would produce a list that says the same thing five times.</p>
          <p>So every restaurant gets exactly one flagship post — usually the branch I want to try first. Other cities appear underneath it as a line: the branch name, the city, and a link that returns here. No duplicate pages, no competing versions of the same opinion.</p>
          <p>Status — <strong>want to go</strong> or <strong>tried</strong> — is tracked per restaurant, on this device, so the list remembers where I left off.</p>
        </div>
        <div class="flow">
          <div class="flow-step">
            <span class="flow-num">01</span>
            <div><h4>One flagship post</h4><p>Full story, all awards, the top ten, the practical details. Written once, at the branch worth trying first.</p></div>
          </div>
          <div class="flow-step">
            <span class="flow-num">02</span>
            <div><h4>Other cities get a line</h4><p>Not a page. A single row under the flagship: city, branch name in Chinese, one sentence on why it differs.</p></div>
          </div>
          <div class="flow-step">
            <span class="flow-num">03</span>
            <div><h4>The line links home</h4><p>Tapping “Shenzhen” on the 炳胜 post returns to the Guangzhou original — so the recommendation stays one recommendation.</p></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="list">
    <div class="wrap">
      <div class="section-head">
        <div>
          <p class="section-kicker">The list</p>
          <h2 class="section-title">Eight tables to start with</h2>
        </div>
        <p class="section-note">Filter by city, by status, or search a name in English or Chinese.</p>
      </div>

      <div class="filters">
        <div class="chips" role="group" aria-label="Filter by city">
          <button class="chip" data-filter-city="all" aria-pressed="true">All cities</button>
          ${CITIES.map(
            (c) =>
              `<button class="chip" data-filter-city="${c.key}" aria-pressed="false">${esc(c.en)} <span class="count">${RESTAURANTS.filter((r) => r.city === c.key).length}</span></button>`
          ).join("")}
        </div>
        <div class="filter-tools">
          <div class="chips" role="group" aria-label="Filter by status">
            <button class="chip" data-filter-status="all" aria-pressed="true">Everything</button>
            <button class="chip" data-filter-status="want" aria-pressed="false">Want to go</button>
            <button class="chip" data-filter-status="tried" aria-pressed="false">Tried</button>
          </div>
          <div class="search">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input type="search" placeholder="Search a restaurant" aria-label="Search restaurants" data-search-input />
          </div>
        </div>
      </div>

      <div id="city-sections">${citySections}</div>

      <div class="empty" data-empty hidden>
        <strong>Nothing matches that yet.</strong>
        Try another city, clear the search, or switch the status filter back to “Everything”.
      </div>
    </div>
  </section>

  <section class="section" id="branches">
    <div class="wrap">
      <div class="section-head">
        <div>
          <p class="section-kicker">Cross-city index</p>
          <h2 class="section-title">Same brand, somewhere else</h2>
        </div>
        <p class="section-note">Every branch mention on the site, and the post it points back to.</p>
      </div>
      <div class="mentions">
        ${branches
          .map(
            ({ r, b }) => `<a class="mention" href="restaurants/${r.slug}/index.html#branches">
          <span class="m-city">${esc(b.city)}</span>
          <span class="m-name">${esc(b.name)}</span>
          <span class="m-ref">${esc(r.nameEn)} — read the ${esc(cityOf(r.city).en)} post</span>
        </a>`
          )
          .join("\n")}
      </div>
    </div>
  </section>
</main>`;

  return page({
    root: "",
    title: "Ken's Table · 食單 — a personal restaurant list across China",
    description:
      "A personal restaurant list across China: one flagship post per restaurant, a top ten for every feature, and branch mentions that point back to the original.",
    body
  });
}

/* ────────────────────────────────────────────────────────────
   All-restaurants page
   ──────────────────────────────────────────────────────────── */

function buildIndex(root = "../") {
  const body = `<main id="main">
  <section class="section" style="padding-top:64px">
    <div class="wrap">
      <p class="eyebrow">Index <span class="dot"></span> ${RESTAURANTS.length} restaurants · 4 cities</p>
      <h1 style="font-family:var(--serif);font-weight:500;font-size:clamp(2rem,4.4vw,3.2rem);line-height:1.1;letter-spacing:-.02em;margin-bottom:18px">
        Every table on the list
      </h1>
      <p style="max-width:58ch;color:var(--ink-soft);font-size:1rem;line-height:1.75">
        Sorted by city. Each card opens the flagship post for that restaurant — the branch worth trying first.
        Where a restaurant exists in more than one city, the other branches appear inside that post, not as separate entries.
      </p>
      <div class="stats" style="margin-top:36px">
        ${CITIES.map(
          (c) => {
            const n = RESTAURANTS.filter((r) => r.city === c.key).length;
            return `<div class="stat"><div class="stat-num" style="font-size:1.5rem">${esc(c.en)}</div><div class="stat-label">${n} ${n === 1 ? "entry" : "entries"} · ${esc(c.zh)}</div></div>`;
          }
        ).join("")}
      </div>
    </div>
  </section>

  ${CITIES.map((c) => {
    const items = RESTAURANTS.filter((r) => r.city === c.key);
    return `<section class="section" style="padding:40px 0">
      <div class="wrap">
        <div class="city-head">
          <h2>${esc(c.en)}</h2><span class="city-cn">${esc(c.zh)}</span>
          <span class="city-count">${items.length} ${items.length === 1 ? "entry" : "entries"}</span>
        </div>
        <div class="grid">${items
          .map((r) => card(r).replace(/href="restaurants\//g, `href="${root}restaurants/`))
          .join("\n")}</div>
      </div>
    </section>`;
  }).join("\n")}
</main>`;

  return page({
    root,
    title: "All restaurants · Ken's Table 食單",
    description: "Every restaurant on Ken's Table: Guangzhou, Hong Kong, Shanghai and Shenzhen.",
    body
  });
}

/* ────────────────────────────────────────────────────────────
   Restaurant detail
   ──────────────────────────────────────────────────────────── */

function buildDetail(r, prev, next, root = "../../") {
  const city = cityOf(r.city);
  const hasDishes = Array.isArray(r.dishes) && r.dishes.length > 0;

  const awardStrip = r.awards
    .map(
      (a) => `<div class="award"><span class="mark">${esc(a.mark)}</span><span>${esc(a.label)}<small>${esc(a.note)}</small></span></div>`
    )
    .join("");

  const groupAwards = (r.groupAwards || [])
    .map(
      (g) => `<div class="fact">
        <dt>${esc(g.zh)}</dt>
        <dd>${esc(g.label)}<span class="zh">${esc(g.who)}</span></dd>
      </div>`
    )
    .join("");

  const dishSection = hasDishes
    ? `<section id="top10">
        <h2>Top 10 must-try</h2>
        <p class="prose-sub">The ten dishes that define the house — Chinese name first, English translation under it.</p>
        <ol class="dishlist">
          ${r.dishes
            .map(
              (d) => `<li class="dish">
            <div>
              <div class="dish-zh">${esc(d.zh)}</div>
              <div class="dish-line">
                <span class="dish-en">${esc(d.en)}</span>
                <span class="dish-tag${d.tag === "Signature" ? "" : " mild"}">${esc(d.tag)}</span>
              </div>
              <p class="dish-note">${esc(d.note)}</p>
            </div>
          </li>`
            )
            .join("")}
        </ol>
        <p class="dishlist-note">${esc(r.dishNote || "")}</p>
      </section>`
    : `<section id="top10">
        <h2>Signatures worth ordering</h2>
        <p class="prose-sub">Three dishes the house is known for; the full top ten is being researched.</p>
        <div class="single-note" style="margin-bottom:22px">
          <b>Why only three:</b> this post is on the list but has not been written up yet. Rather than invent a top ten,
          the page shows the dishes that are consistently cited — the full ranking lands when the feature is written.
        </div>
        <ol class="dishlist">
          ${(r.knownSignatures || [])
            .map(
              (d) => `<li class="dish">
            <div>
              <div class="dish-zh">${esc(d.zh)}</div>
              <div class="dish-line">
                <span class="dish-en">${esc(d.en)}</span>
                <span class="dish-tag mild">Known signature</span>
              </div>
              <p class="dish-note">${esc(d.note)}</p>
            </div>
          </li>`
            )
            .join("")}
        </ol>
        <p class="dishlist-note">Send me the ten you would order and this becomes the feature post.</p>
      </section>`;

  const branchSection = (r.branches || []).length
    ? `<div class="branches">
        ${r.branches
          .map(
            (b) => `<div class="branch">
          <span class="b-city">${esc(b.city)}</span>
          <span class="b-name">${esc(b.name)}<em>${esc(b.en)}</em><span style="display:block;font-size:.78rem;color:var(--muted);margin-top:6px">${esc(b.note)}</span></span>
          <span class="b-ref">${
            b.city === city.en
              ? "<span>Same city, different room</span>"
              : "<span>Primary post — this page</span><span>No separate page</span>"
          }</span>
        </div>`
          )
          .join("")}
      </div>`
    : `<div class="single-note"><b>No other branches.</b> ${esc(r.singleNote || "One kitchen, one address — there is nothing to reference.")}</div>`;

  const body = `<main id="main">
  <section class="rhero" id="top" style="--accent:${city.accent}">
    <div class="wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="${root}index.html">Ken's Table</a><span class="sep">/</span>
        <a href="${root}restaurants/index.html">All restaurants</a><span class="sep">/</span>
        <span>${esc(city.en)}</span>
      </nav>
      <div class="rhero-grid">
        <div>
          <h1>${esc(r.nameEn)} <span class="h1-zh">(${esc(r.nameZh)})</span></h1>
          <div class="cn-name">${esc(r.locZh)}</div>
          <p class="loc-name">${esc(r.area)} · ${esc(city.en)}</p>
        </div>
        <div class="rhero-meta">
          <div class="meta-row"><b>Cuisine</b><span>${esc(r.cuisine)} · ${esc(r.cuisineZh)}</span></div>
          <div class="meta-row"><b>Price</b><span>${esc(r.price)}</span></div>
          <div class="status-switch" data-status-switch="${r.slug}" data-default="${r.status}" role="group" aria-label="Visit status">
            <button type="button" data-set-status="want" data-slug="${r.slug}" aria-pressed="false">Want to go</button>
            <button type="button" data-set-status="tried" data-slug="${r.slug}" aria-pressed="false">Tried it</button>
          </div>
        </div>
      </div>
      <div class="award-strip">${awardStrip}</div>
    </div>
  </section>

  <div class="rbody">
    <div class="wrap">
      ${
        r.orderCard
          ? `<div class="order-band">
        <div class="ob-head"><span>Show this to the waiter</span><span>畀侍應睇</span></div>
        <div class="ob-zh" lang="zh-Hant">${esc(r.orderCard.zh)}</div>
        <div class="ob-en">${esc(r.orderCard.en)}</div>
        <p class="ob-note">${esc(r.orderCard.note)}</p>
      </div>`
          : ""
      }
      <div class="rlayout">
        <div class="prose">
          <section>
            <p class="lede">${esc(r.tagline)}</p>
            ${r.story.map((p) => `<p>${esc(p)}</p>`).join("")}
            <blockquote class="pull">${esc(r.quote.text)}<cite>${esc(r.quote.cite)}</cite></blockquote>
          </section>

          <section>
            <h2>Why it became famous</h2>
            <p class="prose-sub">What the city, the guides and the queues actually agree on.</p>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:14px;border-top:1px solid var(--line);padding-top:20px">
              ${r.whyFamous
                .map(
                  (w) => `<li style="display:grid;grid-template-columns:22px 1fr;gap:12px;font-size:.94rem;color:var(--ink-soft);line-height:1.75">
                  <span style="color:var(--brass);font-family:var(--serif)">◆</span><span>${esc(w)}</span></li>`
                )
                .join("")}
            </ul>
          </section>

          ${dishSection}

          ${
            r.buzz
              ? `<section>
            <h2>From the notebooks</h2>
            <p class="prose-sub">Paraphrased from public Dianping and Xiaohongshu posts — the details the guides do not print.</p>
            <ul class="notes">
              ${r.buzz.map((b) => `<li>${esc(b)}</li>`).join("")}
            </ul>
          </section>`
              : ""
          }

          <section id="branches">
            <h2>Same restaurant, other cities</h2>
            <p class="prose-sub">Branch mentions only. The full write-up stays on this page.</p>
            ${branchSection}
          </section>

          <div class="sources">
            <strong style="color:var(--ink-soft);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase">Sources</strong><br />
            ${r.sources.map((s) => `<a href="${s.url}" rel="noopener">${esc(s.label)}</a>`).join(" · ")}<br />
            Compiled ${new Date().toISOString().slice(0, 10)} · verify hours and prices before travelling.
          </div>
        </div>

        <aside class="factbox" aria-label="Practical details">
          <h3>The practical bit</h3>
          <dl>
            <div class="fact"><dt>Where</dt><dd>${esc(r.addressEn)}<span class="zh">${esc(r.addressZh)}</span></dd></div>
            <div class="fact"><dt>Cuisine</dt><dd>${esc(r.cuisine)}<span class="zh">${esc(r.cuisineZh)}</span></dd></div>
            <div class="fact"><dt>Damage</dt><dd>${esc(r.price)}</dd></div>
            <div class="fact"><dt>City</dt><dd>${esc(city.en)}<span class="zh">${esc(city.zh)}</span></dd></div>
            ${groupAwards}
          </dl>
          <div class="status-block">
            <p>My status</p>
            <div class="status-switch" data-status-switch="${r.slug}" data-default="${r.status}" role="group" aria-label="Visit status">
              <button type="button" data-set-status="want" data-slug="${r.slug}" aria-pressed="false">Want to go</button>
              <button type="button" data-set-status="tried" data-slug="${r.slug}" aria-pressed="false">Tried it</button>
            </div>
            <p class="status-hint" data-status-hint="${r.slug}"></p>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <nav class="pager" aria-label="Previous and next restaurant">
    ${prev ? `<a href="../${prev.slug}/index.html"><span class="p-label">← Previous</span><span class="p-name">${esc(prev.nameEn)} · ${esc(prev.nameZh)}</span></a>` : "<span></span>"}
    ${next ? `<a class="next" href="../${next.slug}/index.html"><span class="p-label">Next →</span><span class="p-name">${esc(next.nameEn)} · ${esc(next.nameZh)}</span></a>` : "<span></span>"}
  </nav>
</main>`;

  const jsonld = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.nameEn,
    alternateName: r.nameZh,
    servesCuisine: r.cuisine,
    priceRange: r.price,
    address: {
      "@type": "PostalAddress",
      streetAddress: r.addressEn,
      addressLocality: city.en,
      addressCountry: r.city === "hongkong" ? "HK" : "CN"
    },
    award: r.awards.map((a) => a.label)
  })}</script>`;

  return page({
    root,
    title: `${r.nameEn} ${r.nameZh} · Ken's Table`,
    description: `${r.nameEn} (${r.nameZh}), ${city.en}: ${r.tagline} Cuisine, awards, history and the top dishes to order.`,
    body,
    extraHead: jsonld
  });
}

/* ────────────────────────────────────────────────────────────
   Write
   ──────────────────────────────────────────────────────────── */

function write(rel, content) {
  const full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("wrote", rel, (content.length / 1024).toFixed(1) + "kb");
}

write("index.html", buildHome());
write("restaurants/index.html", buildIndex("../"));

RESTAURANTS.forEach((r, i) => {
  const prev = RESTAURANTS[(i - 1 + RESTAURANTS.length) % RESTAURANTS.length];
  const next = RESTAURANTS[(i + 1) % RESTAURANTS.length];
  write(`restaurants/${r.slug}/index.html`, buildDetail(r, prev, next, "../../"));
});

console.log("done:", RESTAURANTS.length, "restaurants");
