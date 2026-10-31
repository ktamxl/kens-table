/* Build script — generates the static pages for Ken's Table (食單).
   Source of truth for content lives here; output is plain HTML in the project dir. */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

/* ────────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────────── */

const CITIES = [
  {
    key: "guangzhou",
    en: "Guangzhou",
    zh: "廣州",
    accent: "#a8332a",
    intro: "The home of Cantonese cooking, and the reason this list exists. Roast meats, river fish and a restaurant culture that rewards going early and ordering too much.",
    note: "Start with 炳勝品味 on Xiancun Road, then work backwards to the older rooms in Haizhu."
  },
  {
    key: "hongkong",
    en: "Hong Kong",
    zh: "香港",
    accent: "#1f4b3f",
    intro: "Roast goose, congee, dim sum and a tea-shop culture that runs from six in the morning to midnight. The densest part of this list, and the easiest city to eat well in on a budget.",
    note: "Sham Shui Po alone is worth a day: 添好運, 新香園 and 合益泰 are within four blocks of each other."
  },
  {
    key: "shanghai",
    en: "Shanghai",
    zh: "上海",
    accent: "#5b3350",
    intro: "Benbang cooking — sweet, dark, slow — served in 1920s villas and hotel dining rooms. The good rooms are small, so book before you fly.",
    note: "Two very different registers: 福1088 for a private-room dinner, 人和館 for the dining room with a band."
  },
  {
    key: "shenzhen",
    en: "Shenzhen",
    zh: "深圳",
    accent: "#17555a",
    intro: "A young city eating an old cuisine. Cantonese teahouses, Hong Kong-style dim sum, and branches of Guangzhou brands that crossed the border.",
    note: "Best for yum cha: 點都德 and 蘩樓 both do hand-made dim sum at Shenzhen prices."
  }
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
    dishSource: "Ranked from Dianping's 推荐菜 list for the Zhujiang New Town branch — the ten most-recommended dishes, in order.",
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
    dishes: [
          {
            zh: "雞油花雕蒸花蟹配陳村粉",
            en: "Steamed Flower Crab with Huadiao, Chicken Oil and Chencun Noodles",
            note: "The signature. The rice noodles under the crab drink up the wine, roe and chicken fat; order it for the table, not for one.",
            tag: "Signature"
          },
          {
            zh: "話梅肉桂糖醋排骨",
            en: "Sweet-and-Sour Pork Ribs with Preserved Plum and Cassia",
            note: "A Cantonese classic rebuilt on aged plum and cassia bark rather than ketchup and sugar.",
            tag: "Signature"
          },
          {
            zh: "魚米粥蝦籽象拔蚌",
            en: "Geoduck with Shrimp Roe in Fish-Milk Congee",
            note: "Geoduck sliced thin, rice cooked down in fish stock. The congee is the point as much as the shellfish.",
            tag: "Signature"
          },
          {
            zh: "十五年陳皮牛肉獅子頭",
            en: "Fifteen-Year Tangerine Peel Beef Lion's Head",
            note: "Aged peel against slow-braised beef — the dish that most clearly shows the pantry.",
            tag: "Signature"
          },
          {
            zh: "樟木煙燻黑腳鵝",
            en: "Camphor-Wood Smoked Black-Foot Goose",
            note: "Smoked over camphor, skin lacquered. Order it when there are four or more of you.",
            tag: "Signature"
          },
          {
            zh: "蟛蜞膏柚皮",
            en: "Pomelo Peel with Crab Roe",
            note: "Bitter peel, sweet roe, a lot of patience. One of the old Cantonese dishes almost nobody else still cooks.",
            tag: "Signature"
          },
          {
            zh: "蝦籽柚皮",
            en: "Shrimp-Roe Pomelo Peel",
            note: "The other half of the pomelo story — braised until the peel turns silky, then dusted with shrimp roe.",
            tag: "Signature"
          },
          {
            zh: "子薑皮蛋",
            en: "Century Egg with Young Ginger",
            note: "A cold starter: pickled ginger cuts the cured egg. Two bites, then the crab arrives.",
            tag: "Signature"
          },
          {
            zh: "白飯",
            en: "Steamed Rice",
            note: "Reviewers single it out, which tells you something about the kitchen. Order it with the crab.",
            tag: "Signature"
          },
          {
            zh: "陳皮紅豆沙",
            en: "Tangerine-Peel Red Bean Soup",
            note: "The dessert to finish on: aged peel, sweet red bean, served warm.",
            tag: "Signature"
          },
        ],
        dishSource: "OpenRice 食評 and the house menu — the crab and the ribs are the two dishes the reviews repeat.",
        dishBadge: "Source: OpenRice 必食 + house menu",
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
    dishes: [
          {
            zh: "甘氏燒鵝",
            en: "Kam's Roast Goose",
            note: "A quarter or half. Ask for a little sauce on the side rather than poured over the skin.",
            tag: "Signature"
          },
          {
            zh: "燒鵝脾",
            en: "Roast Goose Leg",
            note: "The premium cut — darker, fattier, best eaten with your hands.",
            tag: "Signature"
          },
          {
            zh: "燒乳豬",
            en: "Roast Suckling Pig",
            note: "Sold by portion. The crackling is the reason to add it to a goose order.",
            tag: "Signature"
          },
          {
            zh: "滷水鵝肝",
            en: "Braised Goose Liver",
            note: "Silky, tea-dark, served cool. The best value on the menu.",
            tag: "Signature"
          },
          {
            zh: "滷水鵝掌翼",
            en: "Braised Goose Webs and Wings",
            note: "The plate to order while you wait.",
            tag: "Signature"
          },
          {
            zh: "蜜汁叉燒",
            en: "Honey Char Siu",
            note: "Ask for 半肥瘦 — half fat, half lean — or you will get the dry end.",
            tag: "Signature"
          },
          {
            zh: "油雞",
            en: "Soy-Sauce Poached Chicken",
            note: "Cold, glossy, ginger-scallion on the side.",
            tag: "Signature"
          },
          {
            zh: "脆皮燒肉",
            en: "Crispy Roast Pork",
            note: "Ordered as an add-on to the goose, not instead of it.",
            tag: "Signature"
          },
          {
            zh: "鵝油撈麵",
            en: "Noodles Tossed in Goose Fat",
            note: "The carbohydrate answer to a plate of roast meat.",
            tag: "Signature"
          },
          {
            zh: "老火例湯",
            en: "Slow-Boiled Soup of the Day",
            note: "Usually pork bone and winter melon. Included with most rice plates.",
            tag: "Signature"
          },
        ],
        dishSource: "OpenRice 必食 for the Wan Chai shop — roast meats, cut to order.",
        dishBadge: "Source: OpenRice 必食 + house menu",
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
        note: "Ken's standing order: 腿蛋治，唔烘底. Say it exactly like this — the bread stays soft. The crusts come off automatically here, so there is nothing else to add.",
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
    dishSource: "Ken's standing order plus the dishes the house is known for — not a Dianping ranking.",
    dishBadge: "Source: Ken's order + house menu",
    branches: [],
    singleNote: "No branches. The Parkes Street shop is the entire business — copying it elsewhere is a Hong Kong pastime that has never quite worked.",
    sources: [
      { label: "OpenRice Hong Kong", url: "https://www.openrice.com/" }
    ]
  },

  {
    slug: "sang-kee-restaurant",
    city: "hongkong",
    status: "want",
    nameEn: "Sang Kee Restaurant",
    nameZh: "生記飯店",
    locEn: "Wan Chai",
    locZh: "灣仔",
    cuisine: "Cantonese seafood",
    cuisineZh: "粵菜・海鮮",
    price: "HK$300–500 per person",
    area: "Wan Chai",
    addressEn: "3/F, Sino Plaza, 353 Lockhart Road, Wan Chai",
    addressZh: "灣仔駱克道353號三湘大廈3樓",
    tagline: "A Wan Chai seafood room that has been cooking the same salt-baked chicken for nearly fifty years.",
    card: "Twelve years of Bib Gourmand. Order the salt-baked chicken, the suckling pig, and whatever fish the floor is recommending that night.",
    awards: [
      { mark: "必", label: "MICHELIN Bib Gourmand", note: "2010–11 and 2014–2025 — twelve years" }
    ],
    story: [
      "生記飯店 sits on the third floor of a commercial block on Lockhart Road — not a street-level room, not a hotel, just a lift and a floor of round tables. It has been there long enough to be planning its fiftieth anniversary, and long enough that the staff do not ask first-timers what they want; they ask what fish looks good.",
      "The kitchen is a Cantonese seafood kitchen of the old school: whole fish steamed plainly, prawns fried in soy, and a salt-baked chicken that the MICHELIN inspectors have singled out more than once. The suckling pig is roasted to order and carved at the table, which is why the room sounds the way it does.",
      "It holds a Bib Gourmand — not a star — and has held one for twelve of the last fifteen years. That is the correct register for the place: excellent cooking, no ceremony, a bill that does not require a special occasion."
    ],
    whyFamous: [
      "古法鹽焗雞 — salt-baked chicken, ordered by nearly every table and cited by the MICHELIN guide.",
      "A seafood room first: the fish tanks decide the menu more than the printed one does.",
      "明爐BB豬 — suckling pig roasted to order, carved in the room.",
      "Bib Gourmand for twelve years, which in Wan Chai is a statement about consistency rather than fashion."
    ],
    quote: { text: "A Cantonese seafood room that still cooks like it is 1985.", cite: "The house in one line" },
    dishes: [
          {
            zh: "古法鹽焗雞",
            en: "Traditional Salt-Baked Chicken",
            note: "The dish the guide names. Ask for it when you book — not something to decide at the table.",
            tag: "Signature"
          },
          {
            zh: "明爐BB豬",
            en: "Roast Suckling Pig",
            note: "Ordered ahead, carved in the room. The crackling is the point.",
            tag: "Signature"
          },
          {
            zh: "豉油王炒蝦",
            en: "Prawns Fried in Master Soy Sauce",
            note: "Shell-on, wok-heavy, sweet at the edges. Eat them with your hands.",
            tag: "Signature"
          },
          {
            zh: "菠蘿生炒骨",
            en: "Pineapple Sweet-and-Sour Pork Ribs",
            note: "One of OpenRice's four featured dishes here. Sharper and fruitier than the usual version.",
            tag: "Signature"
          },
          {
            zh: "蝦籽古法扣柚皮",
            en: "Braised Pomelo Peel with Shrimp Roe",
            note: "The old Cantonese test dish: bitter peel cooked until it tastes of nothing but sauce.",
            tag: "Signature"
          },
          {
            zh: "金錢雞",
            en: "\"Gold Coin\" Chicken",
            note: "Chicken liver, fat and ginger sandwiched and roasted — the dish the fiftieth-anniversary menu kept.",
            tag: "Signature"
          },
          {
            zh: "白糖糕",
            en: "Steamed White Sugar Cake",
            note: "Sweet, spongy, faintly fermented. The dessert the regulars take home.",
            tag: "Signature"
          },
          {
            zh: "魚粥",
            en: "Fish Congee",
            note: "The other half of the house reputation — rice-smooth congee with fish folded in at the end.",
            tag: "Signature"
          },
          {
            zh: "咕嚕肉",
            en: "Sweet-and-Sour Pork",
            note: "The test of a Cantonese kitchen: crisp, not battered into submission.",
            tag: "Signature"
          },
          {
            zh: "枸杞葉炒豬肝",
            en: "Stir-Fried Pork Liver with Goji Leaves",
            note: "Bitter greens, iron-rich liver, a lot of wok heat. Order it between the heavier courses.",
            tag: "Signature"
          },
        ],
        dishSource: "OpenRice's featured dishes for this branch, plus the salt-baked chicken the MICHELIN guide names.",
        dishBadge: "Source: OpenRice 必食 + house menu",
    branches: [],
    singleNote: "One room, one kitchen. The group has no other branch of 生記飯店 — if you see the name elsewhere, check that it is the Lockhart Road address.",
    sources: [
      { label: "MICHELIN Guide Hong Kong", url: "https://guide.michelin.com/" },
      { label: "OpenRice", url: "https://www.openrice.com/" }
    ]
  },

  {
    slug: "mian",
    city: "hongkong",
    status: "want",
    nameEn: "MIAN",
    nameZh: "紅棉",
    locEn: "The Murray, Central",
    locZh: "中環美利酒店",
    cuisine: "Modern Chinese",
    cuisineZh: "新派中菜",
    price: "HK$600–900 per person",
    area: "Central",
    addressEn: "UG Pavilion, The Murray, 22 Cotton Tree Drive, Central",
    addressZh: "中環紅棉路22號美利酒店UG亭樓",
    tagline: "A glass pavilion in Central, cooking across the eight regional cuisines.",
    card: "Chef Shao Tak-lung's room at The Murray: a light-filled pavilion, a menu that moves between Cantonese, Sichuan and Jiangnan, and a char siu people cross town for.",
    awards: [],
    story: [
      "紅棉 opened in 2021 in the pavilion of The Murray, the former government headquarters building on Cotton Tree Drive. The room is the point as much as the food: a glass box with an outdoor terrace, set back from the traffic, which in Central is a small luxury.",
      "The kitchen is run by 邵德龍 (Shao Tak-lung), a chef who has worked across regional Chinese cooking rather than within a single tradition. The menu is deliberately non-linear — Cantonese roast meats next to Sichuan heat next to Jiangnan sweetness — and the dish that has travelled furthest on social media is the 別不同叉燒, a char siu built to be different from the classic rather than a copy of it.",
      "It is hotel dining, priced accordingly, and the service is polished in the way hotel rooms are. Go for lunch if you want the pavilion light without the full dinner spend."
    ],
    whyFamous: [
      "The setting: a standalone glass pavilion inside The Murray, with a terrace and no street noise.",
      "邵德龍's menu deliberately crosses the eight regional cuisines instead of staying Cantonese.",
      "別不同叉燒 — the char siu that food bloggers come for.",
      "A wine list and service level built for hosting, not for a quick meal."
    ],
    quote: { text: "A pavilion, a chef, and eight cuisines to move between.", cite: "The room in one line" },
    dishes: [
          {
            zh: "紅棉蔥油脆皮雞",
            en: "Red Cotton Spring-Onion Crispy Chicken",
            note: "The hotel's headline dish: crisp skin, spring-onion oil poured over at the pass. Half a bird is enough for three.",
            tag: "Signature"
          },
          {
            zh: "別不同叉燒",
            en: "\"Different\" Char Siu",
            note: "The house's signature roast — cut thick, glazed dark, deliberately not the soft, sweet version.",
            tag: "Signature"
          },
          {
            zh: "有機番茄焗日本黑豚豬扒飯",
            en: "Baked Kagoshima Pork Chop Rice with Organic Tomato",
            note: "A Hong Kong classic rebuilt with better pork. Comfort food at hotel prices, and worth it once.",
            tag: "Signature"
          },
          {
            zh: "魚湯鮮腐竹浸時蔬",
            en: "Seasonal Greens with Fresh Bean Curd Skin in Fish Soup",
            note: "The soup is cooked down from fish frames; the vegetables are there to carry it.",
            tag: "Signature"
          },
          {
            zh: "翡翠玉忱（雞濃湯涼瓜絲）",
            en: "Jade Cushion — Bitter Melon with Chicken Consommé",
            note: "Bitter melon cut into ribbons and poached in a concentrated chicken broth. The dish that shows the kitchen's restraint.",
            tag: "Signature"
          },
          {
            zh: "齊菜河蝦餃",
            en: "Shepherd's Purse and River Shrimp Dumpling",
            note: "A dim sum of the season — the greens cut the shrimp's sweetness.",
            tag: "Signature"
          },
          {
            zh: "沸騰小籠包",
            en: "\"Boiling\" Xiao Long Bao",
            note: "Served hot enough that the soup inside is still moving. Eat it in one bite, spoon underneath.",
            tag: "Signature"
          },
          {
            zh: "鮮回香蟹肉餃",
            en: "Crab Meat Dumpling",
            note: "Crab rather than pork, finished with a little aged vinegar on the side.",
            tag: "Signature"
          },
          {
            zh: "陳年青缸醉花螺",
            en: "Drunken Sea Snails in Aged Rice Wine",
            note: "Cold, wine-heavy, served as a starter. The most old-Shanghai thing on a Cantonese menu.",
            tag: "Signature"
          },
          {
            zh: "六款點心拼盤",
            en: "Six-Piece Dim Sum Platter",
            note: "The weekend brunch format: six dim sum chosen by the kitchen, including the dumplings above.",
            tag: "Signature"
          },
        ],
        dishSource: "OpenRice 食評, the hotel menu and the weekend dim-sum list — the dishes this room is actually known for.",
        dishBadge: "Source: OpenRice 食評 + hotel menu",
    branches: [],
    singleNote: "One restaurant, inside The Murray. Book ahead for dinner; lunch is the easier table.",
    sources: [
      { label: "Discover Hong Kong — MIAN", url: "https://www.discoverhongkong.com/" },
      { label: "The Murray", url: "https://www.niccolohotels.com/" }
    ]
  },

  {
    slug: "bloom-month",
    city: "hongkong",
    status: "want",
    nameEn: "Bloom Month",
    nameZh: "花月冰室",
    locEn: "Peking Road, Tsim Sha Tsui",
    locZh: "尖沙咀北京道",
    cuisine: "Hong Kong cha chaan teng",
    cuisineZh: "冰室・茶餐廳",
    price: "HK$60–150 per person",
    area: "Tsim Sha Tsui",
    addressEn: "Shop A, G/F, Universal Commercial Building, 65–69 Peking Road, Tsim Sha Tsui",
    addressZh: "尖沙咀北京道65–69號環球商業大廈地下A舖",
    tagline: "A Tsim Sha Tsui bing sutt where the rice plates outrank the toast.",
    card: "Dianping's No. 1 pork chop rice in Hong Kong, a top-five milk tea, and a beef-and-egg rice that outsells everything. Order that first.",
    awards: [
      { mark: "1", label: "No. 1 Pork Chop Rice in Hong Kong", note: "Dianping 菜品榜, 2026" },
      { mark: "3", label: "No. 3 Toast in Hong Kong", note: "Dianping 菜品榜 — the 西多士" }
    ],
    story: [
      "花月冰室 opened on Peking Road in 2025, in the middle of the Tsim Sha Tsui hotel district — an odd place for a cheap lunch and a good one for a break from it. It is a 冰室 in form: tiled walls, booth seating, a menu that runs from breakfast to late.",
      "What makes it worth a page is the range. The core is tea-shop food, but the kitchen also runs satay beef noodles, curry pork chop, bak kut teh and Hainanese chicken — the Southeast Asian side of the Hong Kong menu that most bing sutt have dropped.",
      "The egg dishes are the strength: 滑蛋, scrambled until barely set and poured over rice, with beef or eel on top. That is where the top of the ranking sits, and it is what to order on a first visit.",
      "Dianping users have ranked it unusually well in specific categories: No. 1 pork chop rice in Hong Kong, No. 3 toast, No. 5 milk tea, No. 9 bak kut teh. Four category leaders on one menu is rare for a shop this young."
    ],
    whyFamous: [
      "No. 1 pork chop rice in Hong Kong on Dianping's dish ranking.",
      "Also top-five for milk tea and top-three for toast — unusual breadth for one shop.",
      "The 滑蛋 rice plates: beef and spring onion, or a whole eel fillet, over half-set egg.",
      "Southeast Asian dishes (satay noodles, curry, bak kut teh) that most bing sutt no longer bother with."
    ],
    quote: { text: "Four category leaders on one menu — pork chop rice, toast, milk tea, bak kut teh.", cite: "What the Dianping rankings say" },
    dishes: [
      {
        zh: "蔥花牛肉滑蛋飯",
        en: "Scrambled Egg Rice with Beef and Spring Onion",
        price: "HK$63",
        note: "The top order by a distance — 969 likes. Egg barely set, beef seared hard outside and still soft in the middle.",
        tag: "Signature"
      },
      {
        zh: "鮮茄菠蘿焗豬扒飯",
        en: "Baked Pork Chop Rice with Fresh Tomato and Pineapple",
        price: "HK$72",
        note: "Ranked No. 1 for pork chop rice in Hong Kong on Dianping. Cheese pulls, tomato cooked right down, pork chop thick-cut.",
        tag: "Signature"
      },
      {
        zh: "凍奶茶",
        en: "Iced Milk Tea",
        price: "",
        note: "Ranked No. 5 for milk tea in Hong Kong. Cold, smooth, a strip of lemon peel in the glass.",
        tag: "Signature"
      },
      {
        zh: "西多士",
        en: "French Toast",
        price: "HK$38",
        note: "Ranked No. 3 for toast. Crisp outside, soft inside, a slab of butter melting into the middle.",
        tag: "Signature"
      },
      {
        zh: "鰻魚滑蛋飯",
        en: "Grilled Eel with Scrambled Egg Rice",
        price: "HK$98",
        note: "A whole unagi fillet laid over half-set egg. The most generous plate on the list.",
        tag: "Signature"
      },
      {
        zh: "咖喱豬扒",
        en: "Curry Pork Chop",
        price: "HK$72",
        note: "Thick pork, Hong Kong-style curry, no apology about the sauce. The classic tea-shop order.",
        tag: "Signature"
      },
      {
        zh: "招牌沙嗲牛肉即食麵",
        en: "Signature Satay Beef Instant Noodles",
        price: "HK$42",
        note: "Beef braised until it gives way, thick satay broth. The cheap order regulars default to.",
        tag: "Signature"
      },
      {
        zh: "醬爆爆魚雞煲",
        en: "Sizzling Chicken Pot with Abalone",
        price: "HK$148",
        note: "The most expensive thing in the ten. Chicken stays tender; the abalone is bigger than you expect.",
        tag: "Signature"
      },
      {
        zh: "咖喱飯",
        en: "Beef Rib Curry Rice",
        price: "HK$72",
        note: "Short rib, soft enough to cut with a spoon, over rice. Order it if you want the curry without the pork.",
        tag: "Signature"
      },
      {
        zh: "秘製肉骨茶",
        en: "Secret-Recipe Bak Kut Teh",
        price: "HK$82",
        note: "Ranked No. 9 for bak kut teh in Hong Kong. Herbal rather than peppery, and a very large bowl.",
        tag: "Signature"
      },
    ],
    dishNote: "Prices from the Dianping listing, in HK$ (the RMB figure in the app is their conversion). Just outside the ten: 無骨海南雞 HK$78 and 瑤柱蛋白炒飯 HK$65.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Peking Road shop — the ranking is by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "One shop on Peking Road. There is an unrelated 花月 name in Sham Shui Po — check the address.",
    sources: [
      { label: "Dianping — 花月冰室", url: "https://www.dianping.com/" }
    ]
  },

  {
    slug: "yung-kee-roast-goose-tst",
    city: "hongkong",
    status: "want",
    nameEn: "Yung Kee Roast Goose",
    nameZh: "榕記陳皮燒鵝",
    locEn: "Kimberley Road, Tsim Sha Tsui",
    locZh: "尖沙咀金巴利道",
    cuisine: "Cantonese roast meats",
    cuisineZh: "粵式燒味",
    price: "HK$80–200 per person",
    area: "Tsim Sha Tsui",
    addressEn: "Shop in Wing Lee Building, 27–31 Kimberley Road, Tsim Sha Tsui",
    addressZh: "尖沙咀金巴利道27–31號永利大廈地舖",
    tagline: "Roast goose marinated with aged tangerine peel — a Kimberley Road shop, not the Central institution.",
    card: "The goose is rubbed with old 陳皮 before it roasts, which is why the fat tastes of citrus rather than smoke. Order the leg on rice.",
    awards: [
      { mark: "金", label: "HKTB Char Siu Gold Award", note: "For 榕哥's lemongrass and black-pepper char siu" },
      { mark: "馬", label: "China Restaurant Golden Horse Award", note: "A chef's award, not a venue rating" }
    ],
    story: [
      "榕記陳皮燒鵝 is the shop of 榕哥, a Cantonese roast-meat chef who built his reputation on two things: char siu and goose. His lemongrass-and-black-pepper char siu took a gold award from the Hong Kong Tourism Board, and he has collected the China Restaurant Golden Horse Award and a Hong Kong Top Ten Chefs title along the way. The restaurant under his own name opened in 2016.",
      "The goose is the reason to come. He uses female black-brown geese of around five and a half catties — smaller birds, less fat — and rubs them with aged tangerine peel among a dozen other aromatics before roasting. The peel does something smoke cannot: it cuts the fat so the skin tastes bright rather than heavy.",
      "One warning about the name. This is 榕記 on Kimberley Road, not 鏞記酒家 on Wellington Street in Central. The English romanisation is identical and the two are constantly confused; they are separate businesses, with separate menus and separate rooms. If you want the 1942 Central institution, book there. If you want the goose with the tangerine peel, come here."
    ],
    whyFamous: [
      "陳皮燒鵝 — goose marinated with aged tangerine peel, the house signature.",
      "A char siu that won a Hong Kong Tourism Board gold award for its lemongrass and black-pepper marinade.",
      "Goose leg on rice for around HK$138 — the order most tables make.",
      "A chef-led shop rather than a chain: 榕哥 still runs the roasting."
    ],
    quote: { text: "Old tangerine peel cuts the fat. That is the whole trick.", cite: "The house technique" },
    dishes: [
          {
            zh: "陳皮燒鵝",
            en: "Aged Tangerine-Peel Roast Goose",
            note: "The signature. Ask for the leg if ordering by portion; the breast is leaner but less interesting.",
            tag: "Signature"
          },
          {
            zh: "燒鵝脾飯",
            en: "Roast Goose Leg on Rice",
            note: "The single order. Sauce on the side so the skin stays crisp.",
            tag: "Signature"
          },
          {
            zh: "金獎傳統叉燒",
            en: "Award-Winning Traditional Char Siu",
            note: "Lemongrass and black pepper in the marinade — sweeter and more fragrant than the usual honey glaze.",
            tag: "Signature"
          },
          {
            zh: "紅燒乳鴿",
            en: "Roast Pigeon",
            note: "Small, dark, best eaten with your hands. A regular add-on.",
            tag: "Signature"
          },
          {
            zh: "乾炒牛河",
            en: "Dry-Fried Beef Ho Fun",
            note: "The wok-hei test of any Cantonese kitchen. Order it if you are sharing.",
            tag: "Signature"
          },
          {
            zh: "滷水鵝掌",
            en: "Braised Goose Webs",
            note: "Cold, gelatinous, made for beer.",
            tag: "Signature"
          },
          {
            zh: "脆皮燒肉",
            en: "Crispy Roast Pork",
            note: "Added to a goose plate rather than ordered alone.",
            tag: "Signature"
          },
          {
            zh: "鵝油撈麵",
            en: "Noodles Tossed in Goose Fat",
            note: "The best use of the fat that comes off the birds.",
            tag: "Signature"
          },
          {
            zh: "例湯",
            en: "Soup of the Day",
            note: "Usually pork bone and vegetable. Included with most rice plates.",
            tag: "Signature"
          },
          {
            zh: "油菜",
            en: "Blanched Seasonal Greens",
            note: "Oyster sauce on the side. The counterweight to a plate of roast meat.",
            tag: "Signature"
          },
        ],
        dishSource: "The roast-meat counter at this Kimberley Road shop, plus the dishes reviewers return for.",
        dishBadge: "Source: OpenRice 必食 + house menu",
    branches: [],
    singleNote: "One shop, in Wing Lee Building on Kimberley Road. Despite the identical English name, it is not 鏞記酒家 in Central — different owners, different menu.",
    sources: [
      { label: "OpenRice — 榕記陳皮燒鵝", url: "https://www.openrice.com/" },
      { label: "Trip.com", url: "https://www.trip.com/" }
    ]
  },

  {
    slug: "congee-king",
    city: "hongkong",
    status: "want",
    nameEn: "Congee King",
    nameZh: "靠得住",
    locEn: "Wan Chai",
    locZh: "灣仔",
    cuisine: "Congee and noodles",
    cuisineZh: "粥麵",
    price: "HK$60–110 per person",
    area: "Wan Chai",
    addressEn: "Heard Street, Wan Chai",
    addressZh: "灣仔克街",
    tagline: "Congee built on fish stock, not plain water — fifteen years of Bib Gourmand.",
    card: "The 心肝寶貝粥 — pork liver and scallop — is the order. The congee base is fish soup, which is why it tastes of something.",
    awards: [
      { mark: "必", label: "MICHELIN Bib Gourmand", note: "Fifteen consecutive years, 2011–2025" }
    ],
    story: [
      "靠得住 has been in Wan Chai long enough to be part of the furniture, and its name is a small joke: 靠得住 means \"you can rely on it\". The kitchen backs that up with a congee base made from fish stock rather than water — the reason a bowl here tastes of the sea rather than of rice alone.",
      "The house bowl is 心肝寶貝粥, a name that puns on the ingredients: 心 and 肝 for the liver, 寶貝 for the scallop. Pork liver sliced thin, a scallop, rice cooked until it collapses. It arrives fast and costs what a bowl of congee should.",
      "The rest of the menu is the Cantonese noodle-shop repertoire — wonton noodles with a clean shrimp broth, noodles without alkaline bite, a few small plates. It has held a Bib Gourmand for fifteen consecutive years, which for a shop of this size is close to unheard of."
    ],
    whyFamous: [
      "Fish-stock congee base — richer and more savoury than the standard water-and-rice version.",
      "心肝寶貝粥: pork liver and scallop, the bowl the guide recommends.",
      "Wonton noodles with a properly clean broth and no alkaline aftertaste.",
      "Fifteen consecutive Bib Gourmand years (2011–2025)."
    ],
    quote: { text: "靠得住 — \"you can rely on it.\" The name is the promise.", cite: "The house name, translated" },
    dishes: [
          {
            zh: "心肝寶貝粥",
            en: "Pork Liver and Scallop Congee",
            note: "The signature. Liver sliced thin so it poaches in the residual heat; scallop for sweetness.",
            tag: "Signature"
          },
          {
            zh: "豬膶粥",
            en: "Pork Liver Congee",
            note: "Straight liver, no scallop. Order this if you want to taste the congee base on its own terms.",
            tag: "Signature"
          },
          {
            zh: "豬膶魚腩粥",
            en: "Pork Liver and Fish-Belly Congee",
            note: "The combination regulars order — liver and the fattest cut of the fish in one bowl.",
            tag: "Signature"
          },
          {
            zh: "魚腩粥",
            en: "Fish-Belly Congee",
            note: "The other house standard, built on the same fish-stock base.",
            tag: "Signature"
          },
          {
            zh: "招牌魚皮",
            en: "Signature Fish Skin",
            note: "Crisp fried skin, served separately so it stays crisp. Eat it before it sinks.",
            tag: "Signature"
          },
          {
            zh: "鮮蝦雲吞麵",
            en: "Fresh Shrimp Wonton Noodles",
            note: "Thin noodles, whole shrimp, broth that does not need chilli.",
            tag: "Signature"
          },
          {
            zh: "炒麵",
            en: "Fried Noodles",
            note: "The savoury side order. Ask for it crisp at the edges.",
            tag: "Signature"
          },
          {
            zh: "腸粉",
            en: "Rice Noodle Roll",
            note: "Plain or with shrimp; the test is the texture of the roll, not the filling.",
            tag: "Signature"
          },
          {
            zh: "滋味燻魚",
            en: "Smoked Fish",
            note: "Sweet, dark, served cold — a Shanghainese dish this Cantonese kitchen does well.",
            tag: "Signature"
          },
          {
            zh: "白粥",
            en: "Plain Congee",
            note: "The control. If the plain version is good, everything else follows.",
            tag: "Signature"
          },
        ],
        dishSource: "OpenRice 必食 for the Wan Chai shop, led by the fish-stock congee.",
        dishBadge: "Source: OpenRice 必食 + house menu",
    branches: [],
    singleNote: "One Wan Chai shop. There are other congee shops with similar names — this is the Heard Street address with the Bib Gourmand record.",
    sources: [
      { label: "MICHELIN Guide Hong Kong", url: "https://guide.michelin.com/" }
    ]
  },

  {
    slug: "tim-ho-wan",
    city: "hongkong",
    status: "want",
    nameEn: "Tim Ho Wan",
    nameZh: "添好運",
    locEn: "Sham Shui Po",
    locZh: "深水埗",
    cuisine: "Dim sum",
    cuisineZh: "點心",
    price: "HK$60–110 per person",
    area: "Sham Shui Po",
    addressEn: "9–11 Fuk Wing Street, Sham Shui Po",
    addressZh: "深水埗福榮街9–11號地下",
    tagline: "The dim sum shop that took a MICHELIN star and kept the prices.",
    card: "The original Sham Shui Po shop. Order the baked char siu bun, the liver rice roll, and the turnip cake — then queue again for the second round.",
    awards: [
      { mark: "★", label: "MICHELIN One Star", note: "First awarded 2010, the year after opening" }
    ],
    story: [
      "添好運 opened in 2009 on Fuk Wing Street, a short walk from Sham Shui Po MTR, with a chef — 麥桂培 — who had spent years making dim sum at Lung King Heen. The idea was a small shop doing a short menu properly, at prices that did not require a hotel.",
      "A year later the MICHELIN Guide gave it a star. At the time it was described as the cheapest starred restaurant in the world, and the queue outside became part of the neighbourhood. The guide has moved on since, and the brand has expanded across Asia, but this shop is still the original: a few tables, a laminated order sheet, and a kitchen visible through the pass.",
      "The 酥皮焗叉燒包 is the dish that made the reputation — a char siu bun with a sugar-crust top borrowed from Western baking, which nobody was doing in dim sum at the time. Order it first, because it is the one item that sells out."
    ],
    whyFamous: [
      "MICHELIN one star in 2010 — at the time, the cheapest starred restaurant in the world.",
      "酥皮焗叉燒包 — the baked char siu bun with a crisp sugar crust.",
      "A short menu: roughly twenty items, done consistently, rather than a trolley of fifty.",
      "The original Sham Shui Po shop, still the one worth queueing for."
    ],
    quote: { text: "A star, a queue, and a laminated menu.", cite: "The Sham Shui Po original" },
    dishes: [
          {
            zh: "酥皮焗叉燒包",
            en: "Baked Char Siu Bun with Crisp Crust",
            note: "The signature. Order two portions — one is never enough and they sell out.",
            tag: "Signature"
          },
          {
            zh: "黃沙豬潤腸",
            en: "Rice Roll with Pork Liver",
            note: "Silky roll, liver cooked just short of set. The best thing after the bun.",
            tag: "Signature"
          },
          {
            zh: "香煎蘿蔔糕",
            en: "Pan-Fried Turnip Cake",
            note: "Crisp outside, loose and peppery inside. Ask for it extra pan-fried if you like the edges.",
            tag: "Signature"
          },
          {
            zh: "香滑馬拉糕",
            en: "Steamed Sponge Cake",
            note: "Three days of fermentation in a single slice. Light, brown-sugar sweet.",
            tag: "Signature"
          },
          {
            zh: "晶瑩鮮蝦餃",
            en: "Shrimp Dumpling",
            note: "Translucent wrapper, whole shrimp. The baseline test of the kitchen.",
            tag: "Signature"
          },
          {
            zh: "鮮蝦燒賣皇",
            en: "Shrimp Siu Mai",
            note: "Pork and shrimp, no filler, a whole shrimp on top.",
            tag: "Signature"
          },
          {
            zh: "洛神花脆蝦紅米腸粉",
            en: "Hibiscus Crispy Shrimp Rice Roll",
            note: "The newer signature: red rice wrapper, crisp middle, shrimp.",
            tag: "Signature"
          },
          {
            zh: "鮮蝦腐皮卷",
            en: "Shrimp Bean-Curd Roll",
            note: "Fried to order; the wrapper shatters. Do not let it sit.",
            tag: "Signature"
          },
          {
            zh: "陳皮牛肉球",
            en: "Beef Ball with Dried Tangerine Peel",
            note: "Springy, faintly citrus. A test of the steaming rather than the frying.",
            tag: "Signature"
          },
          {
            zh: "豉汁蒸鳳爪",
            en: "Chicken Feet in Black-Bean Sauce",
            note: "Sticky, savoury, the thing to order while waiting for the baked items.",
            tag: "Signature"
          },
        ],
        dishSource: "The house's 'four kings' — baked char siu bun, liver rice roll, turnip cake, sponge cake — plus the dim sum regulars.",
        dishBadge: "Source: OpenRice 必食 + house menu",
    branches: [
      { city: "Hong Kong", name: "添好運（深水埗）", en: "Tim Ho Wan, Sham Shui Po", note: "The 2009 original — the queue and the star both started here." },
      { city: "Hong Kong", name: "添好運（中環 / 北角 / 奧運）", en: "Tim Ho Wan, Central / North Point / Olympic", note: "Larger branches with shorter waits; the menu is the same, the room is not." }
    ],
    sources: [
      { label: "Tim Ho Wan", url: "https://www.timhowan.com/" },
      { label: "MICHELIN Guide Hong Kong", url: "https://guide.michelin.com/" }
    ]
  },

  {
    slug: "sang-kee-congee",
    city: "hongkong",
    status: "want",
    nameEn: "Sang Kee Congee Shop",
    nameZh: "生記粥品專家",
    locEn: "Sheung Wan",
    locZh: "上環",
    cuisine: "Congee",
    cuisineZh: "粥品",
    price: "HK$50–90 per person",
    area: "Sheung Wan",
    addressEn: "7–9 Burd Street, Sheung Wan",
    addressZh: "上環畢街7–9號",
    tagline: "Forty years of fish congee on Burd Street.",
    card: "Fish-belly congee, with or without pork blood. The order card below is what to show the waiter.",
    awards: [
      { mark: "必", label: "MICHELIN Bib Gourmand", note: "A forty-year-old Sheung Wan institution" }
    ],
    orderCard: {
      zh: "魚腩粥，加豬紅，唔該。\n魚腩粥，走豬紅，唔該。",
      en: "Fish-belly congee — with pork blood, or without.",
      note: "魚腩 is the belly cut, the fattest part of the fish. 豬紅 is pork blood curd; 走 means leave it out. Order either line as it is written."
    },
    story: [
      "生記粥品專家 has been on Burd Street for over forty years, in a part of Sheung Wan that still looks like a working neighbourhood rather than a gallery district. The congee base is cooked down with pork bones, dried scallop and lean pork until the rice breaks, then the raw ingredients are added to order — the 生滾 method, where the heat of the congee does the cooking.",
      "The specialty is fish: 魚腩粥, the belly cut, sliced and laid into the bowl before the congee goes over it. It arrives with a dish of ginger, spring onion and soy on the side, which you add yourself. The other house order is 鮮豬潤粥 — pork liver, barely cooked, still pink at the centre.",
      "It holds a Bib Gourmand and has done for years. The room is bright, the tables are shared, and the pace is fast enough that nobody minds if you are still eating when the next party sits down."
    ],
    whyFamous: [
      "魚腩粥 — fish-belly congee, the cut that makes the bowl.",
      "生滾 technique: raw fish and liver cooked by the heat of the congee, not in the pot.",
      "鯪魚球 — hand-made dace fish balls, and 香煎魚餅 on the side.",
      "A forty-year-old shop with a Bib Gourmand and neighbourhood prices."
    ],
    quote: { text: "The congee cooks the fish. That is the whole technique.", cite: "How 生滾 works" },
    dishes: [
          {
            zh: "魚腩粥",
            en: "Fish-Belly Congee",
            note: "The order. Add the ginger and soy at the table, not before.",
            tag: "Signature"
          },
          {
            zh: "鮮豬潤粥",
            en: "Fresh Pork Liver Congee",
            note: "Liver added raw and poached by the congee; eat it before it overcooks.",
            tag: "Signature"
          },
          {
            zh: "鯪魚球粥",
            en: "Dace Fish Ball Congee",
            note: "Springy, faintly dried-tangerine. The non-fish-cut alternative.",
            tag: "Signature"
          },
          {
            zh: "魚片粥",
            en: "Fish Slice Congee",
            note: "Thin slices, no bones, the gentlest version of the fish congee.",
            tag: "Signature"
          },
          {
            zh: "牛肉粥",
            en: "Beef Congee",
            note: "Minced beef pressed into the bowl and cooked by the congee.",
            tag: "Signature"
          },
          {
            zh: "皮蛋瘦肉粥",
            en: "Century Egg and Pork Congee",
            note: "The safe order at a lesser shop; here it is the control.",
            tag: "Signature"
          },
          {
            zh: "香煎魚餅",
            en: "Pan-Fried Fish Cake",
            note: "Cut into strips, good with the ginger-soy dish.",
            tag: "Signature"
          },
          {
            zh: "炸兩",
            en: "Rice Roll Wrapped Around Fried Dough",
            note: "Ordered on the side for texture. Eat immediately.",
            tag: "Signature"
          },
          {
            zh: "油條",
            en: "Fried Dough Stick",
            note: "For dipping into the congee, or into the soy.",
            tag: "Signature"
          },
          {
            zh: "豆漿",
            en: "Soy Milk",
            note: "Cold or warm, unsweetened by default.",
            tag: "Signature"
          },
        ],
        dishSource: "The shop's 生滾 congee list — fish first, liver second, everything cooked by the heat of the bowl.",
        dishBadge: "Source: OpenRice 必食 + house menu",
    branches: [],
    singleNote: "The Burd Street shop is the one. A branch in Quarry Bay has closed — check before travelling to any other address.",
    sources: [
      { label: "MICHELIN Guide Hong Kong", url: "https://guide.michelin.com/" },
      { label: "OpenRice", url: "https://www.openrice.com/" }
    ]
  },

  {
    slug: "sung-heung-yuen",
    city: "hongkong",
    status: "want",
    nameEn: "Sung Heung Yuen (Kin Kee)",
    nameZh: "新香園（堅記）",
    locEn: "Sham Shui Po",
    locZh: "深水埗",
    cuisine: "Cha chaan teng",
    cuisineZh: "茶餐廳",
    price: "HK$40–70 per person",
    area: "Sham Shui Po",
    addressEn: "Shop A, G/F, 38 Kweilin Street, Sham Shui Po",
    addressZh: "深水埗桂林街38號A地下",
    tagline: "One sandwich, done since 1968: beef and egg.",
    card: "Open 24 hours since 1968. Order the 蛋牛治 and a silk-stocking milk tea, and nothing else.",
    awards: [],
    orderCard: {
      zh: "蛋牛治，唔該。",
      en: "Beef and egg sandwich, please.",
      note: "蛋牛治 is the shorthand: 蛋 for egg, 牛 for beef, 治 for 三文治. At 新香園 it is the only thing you need to say."
    },
    story: [
      "新香園 opened on Kweilin Street in 1968 and has been running ever since, now under the second generation of the family that founded it. It is a cha chaan teng in the old sense: formica tables, a menu on the wall, and a kitchen that has been making the same sandwich for over fifty years.",
      "The 蛋牛治 is the reason people cross the district for it. Hand-chopped beef, not mince, folded into a fresh omelette and pressed between thick white bread — the egg still soft, the beef still juicy, the whole thing held together by the egg rather than by sauce. It is a two-hand sandwich and it costs less than a coffee in Central.",
      "The shop is open around the clock, which in Sham Shui Po is its own kind of public service. Order at the counter, take a number, and do not expect to linger at peak hours."
    ],
    whyFamous: [
      "蛋牛治 — hand-chopped beef and egg sandwich, the house specialty since 1968.",
      "Open 24 hours, which makes it a late-night and early-morning institution.",
      "Silk-stocking milk tea with a heavy tea base, brewed the old way.",
      "Second-generation family ownership — the recipe has not changed."
    ],
    quote: { text: "One sandwich, fifty years, no need to look at the menu.", cite: "The house order" },
    dishes: [
          {
            zh: "蛋牛治",
            en: "Beef and Egg Sandwich",
            note: "The order. Ask for 烘底 if you want the bread toasted — it costs extra and changes the texture completely.",
            tag: "Signature"
          },
          {
            zh: "西多士",
            en: "French Toast",
            note: "The other thing people order. Share it.",
            tag: "Signature"
          },
          {
            zh: "絲襪奶茶",
            en: "Silk-Stocking Milk Tea",
            note: "Strong, dense, served hot. The correct drink with the sandwich.",
            tag: "Signature"
          },
          {
            zh: "菠蘿油",
            en: "Pineapple Bun with Butter",
            note: "Ordered hot, butter still melting.",
            tag: "Signature"
          },
          {
            zh: "餐蛋麵",
            en: "Luncheon Meat and Egg Noodles",
            note: "The all-day fallback, and the reason the shop never closes.",
            tag: "Signature"
          },
          {
            zh: "沙爹牛肉麵",
            en: "Satay Beef Noodles",
            note: "Thick sauce, soft noodles. A 3am order.",
            tag: "Signature"
          },
          {
            zh: "凍檸茶",
            en: "Iced Lemon Tea",
            note: "Ask for 少甜; the default is heavy on the syrup.",
            tag: "Signature"
          },
          {
            zh: "火腿通粉",
            en: "Ham and Macaroni Soup",
            note: "Clear broth, elbow macaroni. The savoury anchor of a set.",
            tag: "Signature"
          },
          {
            zh: "奶油多",
            en: "Condensed Milk Toast",
            note: "Warm toast, condensed milk. Simpler than the French toast and, for many, better.",
            tag: "Signature"
          },
          {
            zh: "紅豆冰",
            en: "Red Bean Ice",
            note: "Condensed milk and crushed ice. The summer drink.",
            tag: "Signature"
          },
        ],
        dishSource: "A 1968 cha chaan teng menu — one sandwich carries the reputation, the rest is the standard repertoire.",
        dishBadge: "Source: OpenRice 必食 + house menu",
    branches: [],
    singleNote: "One shop on Kweilin Street. There are other 新香園 names in the city — this is the 1968 original, sometimes written 堅記.",
    sources: [
      { label: "OpenRice", url: "https://www.openrice.com/" }
    ]
  },

  {
    slug: "hop-yik-tai",
    city: "hongkong",
    status: "want",
    nameEn: "Hop Yik Tai",
    nameZh: "合益泰小食",
    locEn: "Sham Shui Po",
    locZh: "深水埗",
    cuisine: "Street snacks and congee",
    cuisineZh: "街頭小食・粥品",
    price: "HK$20–60 per person",
    area: "Sham Shui Po",
    addressEn: "G/F, 121 Kweilin Street, Sham Shui Po",
    addressZh: "深水埗桂林街121號地下",
    tagline: "Five thousand rice noodles a day, and a bowl of congee you have to know how to eat.",
    card: "Rice noodles from the street counter, or sit inside for beef congee. Read the ritual before you pick up the spoon.",
    awards: [
      { mark: "米", label: "MICHELIN Recommended", note: "Street-food listing" }
    ],
    orderCard: {
      zh: "腸粉，唔該。\n碎牛粥，加豬紅。",
      en: "Rice noodle rolls, please. / Minced-beef congee, with pork blood.",
      note: "Order the 腸粉 at the street counter. If you take a seat inside, the congee is the reason — 碎牛 is minced beef, 豬紅 is pork blood."
    },
    ritual: {
      title: "Minced beef congee, in five steps",
      steps: [
        "The minced beef is raw, pressed flat against the bottom of the bowl before it leaves the kitchen.",
        "Boiling congee is poured over it at the pass — the heat of the congee cooks the beef, not the stove.",
        "Fried rice noodles are folded through. That is the signature of this bowl: crisp noodle inside a soft congee.",
        "Take your soup spoon and stab straight down to the bottom to break the beef apart.",
        "Do not stir. Stirring liquefies the congee and turns it watery; stabbing keeps the starch thick."
      ]
    },
    story: [
      "合益泰 is a hole-in-the-wall on Kweilin Street with a queue that starts before the shutters are fully up. The counter sells 腸粉 — rice noodle rolls steamed to order, cut into lengths and dressed with sweet sauce, sesame paste and soy — at a rate of roughly five thousand a day. You eat them standing, from a paper plate, with a bamboo skewer.",
      "Behind the counter there is a seating area, and that is where the congee happens. 碎牛粥 is the order: minced beef pressed raw into the bottom of the bowl, boiling congee poured over it, fried rice noodles folded through. The beef cooks in the bowl. The noodles stay crisp for about a minute.",
      "The shop is Michelin-recommended and has been for years. It closed for four months and reopened in early 2026 after a refit — the queue came back the same week."
    ],
    whyFamous: [
      "腸粉 sold by the thousand from a street counter — cheap, fast, eaten standing up.",
      "碎牛粥 with the beef cooked by the congee itself, and fried rice noodles folded through.",
      "A MICHELIN street-food recommendation in a district full of them.",
      "Reopened in early 2026 after a four-month refit; the queue never really left."
    ],
    quote: { text: "Stab, do not stir. The congee stays thick that way.", cite: "The house instruction" },
    dishes: [
          {
            zh: "豬油腸粉",
            en: "Rice Noodle Rolls with Lard",
            note: "The street-counter order. Sweet sauce, sesame paste, soy — do not ask for it dry.",
            tag: "Signature"
          },
          {
            zh: "碎牛粥",
            en: "Minced Beef Congee",
            note: "The seated order. Read the ritual above before you touch it.",
            tag: "Signature"
          },
          {
            zh: "豆漿",
            en: "Soy Milk",
            note: "Cold or warm, unsweetened by default. The thing to drink with the noodles.",
            tag: "Signature"
          },
          {
            zh: "燒賣",
            en: "Steamed Siu Mai",
            note: "Fish-based, not pork, and served with the same sweet-soy dressing.",
            tag: "Signature"
          },
          {
            zh: "豬皮蘿蔔",
            en: "Pork Skin and Radish",
            note: "Braised in a curry-ish broth; order it if you are sharing.",
            tag: "Signature"
          },
          {
            zh: "魚蛋",
            en: "Fish Balls",
            note: "Springy, cheap, and best with the same sauce as the noodles.",
            tag: "Signature"
          },
          {
            zh: "牛肉球",
            en: "Beef Balls",
            note: "Steamed, plain, made for dipping.",
            tag: "Signature"
          },
          {
            zh: "油條",
            en: "Fried Dough Stick",
            note: "For the congee, not on its own.",
            tag: "Signature"
          },
          {
            zh: "白粥",
            en: "Plain Congee",
            note: "The control against which the beef version makes sense.",
            tag: "Signature"
          },
          {
            zh: "齋腸",
            en: "Plain Rice Noodle Roll",
            note: "No filling, just the noodle and the sauces — the purest test of the counter.",
            tag: "Signature"
          },
        ],
        dishSource: "The counter's rice noodles plus the seated menu — the congee is the reason to stay.",
        dishBadge: "Source: OpenRice 必食 + house menu",
    branches: [],
    singleNote: "One shop on Kweilin Street. The street counter and the seated area are the same business; order at the counter either way.",
    sources: [
      { label: "OpenRice — 合益泰小食", url: "https://www.openrice.com/" },
      { label: "Discover Hong Kong", url: "https://www.discoverhongkong.com/" }
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
    dishes: [
          {
            zh: "金沙鲜虾红米肠",
            en: "Crispy Shrimp Rice Roll",
            note: "The house's most-ordered item: red rice wrapper, crisp middle, whole shrimp.",
            tag: "Signature"
          },
          {
            zh: "金牌虾饺皇",
            en: "Signature Shrimp Dumpling",
            note: "Translucent wrapper, whole shrimp, no filler. The benchmark.",
            tag: "Signature"
          },
          {
            zh: "沙爹金钱肚",
            en: "Satay Beef Tripe",
            note: "Braised soft, finished in a thick satay sauce. Order two baskets.",
            tag: "Signature"
          },
          {
            zh: "百合酱蒸凤爪",
            en: "Chicken Feet in Lily-Bulb Sauce",
            note: "Sticky, savoury, faintly sweet. The other two-basket order.",
            tag: "Signature"
          },
          {
            zh: "蜜汁叉烧包",
            en: "Honey Char Siu Bao",
            note: "Split-top, soft, proper sweet-savoury filling.",
            tag: "Signature"
          },
          {
            zh: "干蒸烧卖",
            en: "Pork and Shrimp Siu Mai",
            note: "The plain version, and a reliable test of the steamer.",
            tag: "Signature"
          },
          {
            zh: "艇仔粥",
            en: "Sampan Congee",
            note: "Rice congee with peanuts, squid and pork skin — the teahouse staple.",
            tag: "Signature"
          },
          {
            zh: "咸煎饼",
            en: "Salty Fried Cake",
            note: "Chewy, faintly fermented, sesame-coated. Order it to share.",
            tag: "Signature"
          },
          {
            zh: "鲜虾腐皮卷",
            en: "Shrimp Bean-Curd Roll",
            note: "Fried to order. Do not let it sit.",
            tag: "Signature"
          },
          {
            zh: "香煎萝卜糕",
            en: "Pan-Fried Turnip Cake",
            note: "Crisp edges, peppery centre.",
            tag: "Signature"
          },
        ],
        dishSource: "Dianping 推荐菜 and the house's three classics: shrimp rice roll, shrimp dumpling, satay tripe.",
        dishBadge: "Source: Dianping 推荐菜 · top ten only",
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
    locEn: "Shekou Dasha, Nanshan",
    locZh: "蛇口大厦店",
    cuisine: "Cantonese teahouse / dim sum",
    cuisineZh: "粤式茶楼・点心",
    price: "¥80–120 per person",
    area: "Shekou, Nanshan",
    addressEn: "152 Shekou New Street, Nanshan — opposite Shekou Dasha, 560 m from Dongjiaotou station exit A",
    addressZh: "南山区蛇口新街152号（蛇口大厦斜对面，东角头站A口步行约560米）",
    tagline: "A Xiguan teahouse rebuilt in Shenzhen — eight straight years on the Must-Eat List.",
    card: "No. 1 Cantonese repeat-customer restaurant in Shekou, 4.8 from 11,700 reviews. Order the red rice roll and the shrimp dumpling.",
    awards: [
      { mark: "必", label: "Dianping Must-Eat List", note: "2026 — eight consecutive years for the brand" },
      { mark: "1", label: "No. 1 Cantonese Restaurant in Shekou", note: "Dianping 回头客榜 — repeat customers" },
      { mark: "4.8", label: "Dianping 4.8 / 5", note: "11,769 reviews at the time of listing" }
    ],
    story: [
      "蘩楼 began in late-Qing Guangzhou, in Xiguan, founded by a chef surnamed 黄. Its reputation rested on one detail: 虾饺 with a wrapper thin enough to read through, folded around shrimp that had been bought that morning. The original house did not survive the twentieth century.",
      "The brand was rebuilt in Shenzhen, where it now runs some of the busiest teahouse floors in the city, and it has been on the 大众点评必吃榜 for eight consecutive years — an unusually long run for a dim sum house in a city that opens new ones every month.",
      "This is the Shekou Dasha room: 08:00 to 16:00 for yum cha, then 17:00 to 20:30 for dinner, a queue at the door by nine in the morning, and a trolley service that has not been modernised into an app. The 蛇口 room is currently No. 1 in the district for repeat customers, which for a teahouse is a better metric than any award.",
      "It has also expanded to Shanghai, including a branch at 徐家汇汇金百货 — the case this site was built for: one flagship post, one line per other city, and a link back here rather than a second competing review."
    ],
    whyFamous: [
      "香脆明虾红米肠 — the crisp shrimp rice-roll that most photographs of the brand are built around.",
      "Hand-folded 虾饺 and a full trolley service in a Lingnan-style room.",
      "Eight consecutive Dianping Must-Eat years for the brand.",
      "No. 1 in Shekou for repeat customers — locals come back, not just visitors."
    ],
    quote: { text: "A teahouse is a room, a trolley and a pot of tea — everything else is detail.", cite: "The Xiguan teahouse tradition 蘩楼 is reviving" },
    dishes: [
      {
        zh: "香脆明虾红米肠",
        en: "Crispy Shrimp Rice-Noodle Roll",
        price: "¥33",
        note: "Three textures in one bite: soft red rice wrapper, crisp middle, whole shrimp. The most-ordered item in the shop.",
        tag: "No. 1"
      },
      {
        zh: "蘩楼露笋虾饺皇",
        en: "Fan Lou Asparagus Shrimp Dumpling",
        price: "¥36",
        note: "The house benchmark — wrapper thin enough to read through, asparagus for crunch. Order it before anything else.",
        tag: "No. 2"
      },
      {
        zh: "XO酱山椒蒸凤爪",
        en: "Chicken Feet with XO Sauce and Sichuan Pepper",
        price: "¥36",
        note: "Steamed until the skin gives way, then hit with XO and a numbing edge. The best version of the dish in Shenzhen.",
        tag: "No. 3"
      },
      {
        zh: "广州荔湾艇仔粥",
        en: "Guangzhou Liwan Sampan Congee",
        price: "¥33",
        note: "Rice congee with peanuts, squid and pork skin — the old Liwan garnish, not a simplified version.",
        tag: "No. 4"
      },
      {
        zh: "金枕飘香榴莲酥",
        en: "Durian Pastry",
        price: "¥33",
        note: "Warm durian in a flaky shell. Order it at the start, not the end — it is better hot and it takes time.",
        tag: "No. 5"
      },
      {
        zh: "豉汁蒸新鲜排骨",
        en: "Steamed Pork Ribs in Black-Bean Sauce",
        price: "¥36",
        note: "Small, fatty ribs made for congee. The dish that tells you whether the steamer is running properly.",
        tag: "No. 6"
      },
      {
        zh: "干炒牛河",
        en: "Beef Ho Fun, Dry-Fried",
        price: "¥38",
        note: "Wok hei test. If the noodles arrive glossy without pooling oil, the kitchen is awake.",
        tag: "No. 7"
      },
      {
        zh: "绵香沙爹金钱肚",
        en: "Satay Beef Tripe",
        price: "¥45",
        note: "Thick-cut tripe, braised soft, finished in satay. The most expensive dim sum on the list, and worth it.",
        tag: "No. 8"
      },
      {
        zh: "传统手工炸油条",
        en: "Hand-Made Fried Dough Stick",
        price: "¥19",
        note: "Hollow, crisp, made to order. Tear it into the congee or eat it with the soy.",
        tag: "No. 9"
      },
      {
        zh: "凉拌北海墨鱼仔",
        en: "Chilled Beihai Baby Cuttlefish",
        price: "¥36",
        note: "Cold, crunchy, sour-hot dressing. The palate reset between the fried courses.",
        tag: "No. 10"
      },
    ],
    dishNote: "Prices from the Dianping listing for the Shekou Dasha branch. The set menus are the value: ¥201 for the two-person 蘩楼必吃节 set and ¥470 for six. The 100-yuan voucher sells for ¥70 in the app.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Shekou Dasha branch — ranked by the app's like counts. The menu is the same across the chain.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [
      { city: "Shenzhen", name: "蘩楼（黄贝岭店）", en: "Fan Lou, Huangbeiling", note: "The Luohu room that built the Shenzhen reputation — six Must-Eat years on its own." },
      { city: "Shenzhen", name: "蘩楼（华强北店）", en: "Fan Lou, Huaqiangbei", note: "Smaller, faster, popular with the lunch crowd." },
      { city: "Shanghai", name: "蘩楼（徐家汇汇金店）", en: "Fan Lou, Xujiahui Huijin", note: "The Shanghai room — same menu, different city. Read the Shenzhen post first." }
    ],
    sources: [
      { label: "Dianping — 蘩楼（蛇口大厦店）", url: "https://www.dianping.com/" },
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
    price: "¥580–800 per person",
    area: "Changning",
    addressEn: "375 Zhenning Road, Changning District, Shanghai",
    addressZh: "上海市長寧區鎮寧路375號",
    tagline: "Benbang cooking served in a 1920s villa, one private room at a time.",
    card: "MICHELIN star plus a Black Pearl diamond. All private rooms, so book with a group and take the whole evening.",
    awards: [
      { mark: "★", label: "MICHELIN One Star", note: "Current Shanghai guide" },
      { mark: "珠", label: "Black Pearl — One Diamond", note: "2026 黑珍珠一钻" },
      { mark: "1", label: "No. 1 Shanghai Smoked Fish", note: "Dianping 菜品榜 · 王牌菜" }
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
    dishes: [
          {
            zh: "老上海熏鱼",
            en: "Old-Shanghai Smoked Fish",
            price: "¥128",
            note: "No. 1 on Dianping's Shanghai smoked-fish chart. Crisp outside, juicy inside, sweet-savoury rather than smoky.",
            tag: "No. 1"
          },
          {
            zh: "清炒蟹粉配吐司",
            en: "Stir-Fried Crab Roe with Toast",
            price: "¥398",
            note: "A full bowl of pure crab roe, baguette toasted and drizzled with aged vinegar. The most expensive plate on the list, and the one to order once.",
            tag: "Signature"
          },
          {
            zh: "香溢红烧肉",
            en: "Fragrant Red-Braised Pork Belly",
            price: "¥228",
            note: "No. 5 on the Shanghai red-braised-pork chart. The fat turns to jelly, the lean stays lean — order rice with it.",
            tag: "Top 5"
          },
          {
            zh: "腰果苔条酥",
            en: "Cashew and Seaweed Pastry",
            price: "¥38",
            note: "Cashew with seaweed powder: a sweet-savoury pastry that should not work and does. The cheapest thing in the ten.",
            tag: "Pastry"
          },
          {
            zh: "糖藕",
            en: "Sweet Lotus Root",
            price: "¥58",
            note: "Crisp outside, soft within, honeyed through. Order it early — it is also the dessert.",
            tag: "Cold"
          },
          {
            zh: "黄鱼煨面",
            en: "Yellow Croaker Noodles",
            price: "¥38",
            note: "The broth is cooked down from fish bones for hours; the noodles are almost secondary to it.",
            tag: "Noodles"
          },
          {
            zh: "沪式油爆虾",
            en: "Shanghai Flash-Fried River Shrimp",
            price: "¥228",
            note: "Shells glossy and crisp enough to eat whole. The sugar in the glaze should stop just short of burnt.",
            tag: "Signature"
          },
          {
            zh: "鸡头米小豌豆",
            en: "Gorgon Nut and Baby Peas",
            price: "¥88",
            note: "Sweet peas, springy gorgon nut — the palate cleanser between the heavy dishes.",
            tag: "Vegetable"
          },
          {
            zh: "响油鳝糊",
            en: "Sizzling Shredded Eel",
            price: "¥188",
            note: "Hot oil poured at the table; white pepper is the finishing note. Stir before it cools.",
            tag: "Signature"
          },
          {
            zh: "芥末芝麻虾",
            en: "Mustard and Sesame Prawns",
            price: "¥188",
            note: "Prawns plump, mustard restrained, sesame on the finish. Served cold.",
            tag: "Cold"
          },
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
    dishes: [
          {
            zh: "金牌红烧肉",
            en: "Signature Red-Braised Pork Belly",
            note: "Sweet, dark and collapsing. Order rice with it, not noodles.",
            tag: "Signature"
          },
          {
            zh: "油爆虾",
            en: "Flash-Fried River Shrimp",
            note: "Eat the shells. The sugar in the glaze should be just short of burnt.",
            tag: "Signature"
          },
          {
            zh: "本帮熏鱼",
            en: "Benbang Smoked Fish",
            note: "Cold, sticky, sweet-savoury. The first thing to order.",
            tag: "Signature"
          },
          {
            zh: "老上海酱爆猪肝",
            en: "Old-Shanghai Pork Liver in Bean Sauce",
            note: "Fast wok, soft liver, a lot of sauce. Order it to share.",
            tag: "Signature"
          },
          {
            zh: "蟹粉捞饭",
            en: "Crab Roe over Rice",
            note: "Served by the small or large portion, dine-in only. The most expensive comfort food on the menu.",
            tag: "Signature"
          },
          {
            zh: "松鼠桂鱼",
            en: "Squirrel Mandarin Fish",
            note: "Sweet-and-sour, scored and fried into shape. A banquet dish, priced like one.",
            tag: "Signature"
          },
          {
            zh: "草头圈子",
            en: "Braised Pork Intestine with Clover",
            note: "The dish that separates locals from visitors. Cleaned properly, it has no off note.",
            tag: "Signature"
          },
          {
            zh: "酱鸭",
            en: "Soy-Braised Duck",
            note: "Cold, dark, sliced thin. A benbang starter.",
            tag: "Signature"
          },
          {
            zh: "响油鳝丝",
            en: "Sizzling Shredded Eel",
            note: "Hot oil at the table, then stir before the eel cools.",
            tag: "Signature"
          },
          {
            zh: "酒酿圆子",
            en: "Fermented Rice Wine with Glutinous Balls",
            note: "The dessert. Warm, faintly alcoholic, not too sweet.",
            tag: "Signature"
          },
        ],
        dishSource: "The Xuhui menu's most-ordered dishes — benbang standards, heavy on soy and sugar.",
        dishBadge: "Source: Dianping 推荐菜 · top ten only",
    branches: [],
    singleNote: "The Xuhui room is the one that holds the star. Treat any similarly named shop as a different restaurant until verified on Dianping.",
    sources: [
      { label: "MICHELIN Guide Shanghai", url: "https://guide.michelin.com/" },
      { label: "Dianping", url: "https://www.dianping.com/" }
    ]
  },
  {
    slug: "no-3-warehouse",
    city: "shanghai",
    status: "want",
    nameEn: "No. 3 Warehouse",
    nameZh: "3号仓库·创意中国菜",
    locEn: "New World City, People's Square",
    locZh: "新世界城店",
    cuisine: "Creative Chinese",
    cuisineZh: "创意中国菜",
    price: "¥150–250 per person",
    area: "People's Square / Nanjing Road",
    addressEn: "4/F, New World City, 2–68 Nanjing West Road, Huangpu District — about 140 m from People's Square station",
    addressZh: "黄浦区南京西路2–68号新世界城4楼A29（人民广场站步行约140米）",
    tagline: "A ten-branch chain that turned creative Chinese into theatre — dry ice, flame, and a glass-skinned squab.",
    card: "No. 1 on Dianping's Huangpu creative-restaurant check-in chart, 4.7 from 32,000 reviews. Order the glass squab and the abalone rice.",
    awards: [
      { mark: "1", label: "No. 1 Check-In Spot — Huangpu Creative Dining", note: "Dianping 打卡人气榜 — check-in popularity" },
      { mark: "4.7", label: "Dianping 4.7 / 5", note: "32,842 reviews at the time of listing" }
    ],
    story: [
      "3号仓库 is a design-led chain of roughly ten branches that treats a meal as a set piece: mirrored ceilings, hanging plants, dry ice and flames at the table. This branch sits on the fourth floor of New World City, about 140 metres from People's Square station — a location built for foot traffic and photographs.",
      "The menu is billed as 创意中国菜, creative Chinese. In practice that means Cantonese roast technique (the glass-skinned squab), chilli-heavy ribs, and a lot of tableside theatre: the abalone rice arrives with a pour, the tea-smoked ribs are lit in front of you, the beef comes out under dry ice.",
      "One honest caveat. This is a photogenic restaurant first and a food destination second; reviews are split, and the room and presentation do a lot of the work. Go for the spectacle and the squab, not for a quiet dinner — and book, because the queue at dinner is real."
    ],
    whyFamous: [
      "No. 1 on Dianping's Huangpu district creative-restaurant check-in chart.",
      "4.7 across more than 32,000 reviews — volume as much as score.",
      "招牌玻璃乳鸽 — glass-crisp squab, the most-ordered dish in the house.",
      "Tableside theatre: dry ice under the beef, flame on the ribs, lab glassware for the fruit tea."
    ],
    quote: { text: "A restaurant built for the camera — and the squab is genuinely good.", cite: "The honest version" },
    dishes: [
      {
        zh: "招牌玻璃乳鸽",
        en: "Signature Glass-Skin Squab",
        price: "¥129",
        note: "The top order: lacquered skin thin enough to see through, meat still pink at the bone. Eat it with your hands.",
        tag: "Signature"
      },
      {
        zh: "冲浪鲍鱼泡饭",
        en: "\"Surfing\" Abalone Rice",
        price: "¥89",
        note: "Abalone and rice with hot broth poured at the table — the name is the pour. Let it sit a minute before eating.",
        tag: "Signature"
      },
      {
        zh: "实验中的水果茶",
        en: "\"Experiment\" Fruit Tea",
        price: "¥49",
        note: "Served in lab glassware, sweet-sour and built for photographs. The most-ordered drink on the list.",
        tag: "Drink"
      },
      {
        zh: "茶香火焰肋排",
        en: "Tea-Smoked Flaming Ribs",
        price: "¥89",
        note: "Lit at the table. The ribs are fried first so they stay crisp under the flame.",
        tag: "Signature"
      },
      {
        zh: "雪花牛肉",
        en: "Snowflake Beef",
        price: "¥89",
        note: "Dry ice under the lid, marbled beef inside. The most filmed dish in the room.",
        tag: "Signature"
      },
      {
        zh: "原创红酒鹅肝烤鸭配蔬菜沙拉",
        en: "Red-Wine Foie Gras with Roast Duck and Salad",
        price: "¥179",
        note: "The most expensive plate in the ten: roast duck, foie gras, red-wine reduction, a salad to cut it.",
        tag: "Signature"
      },
      {
        zh: "鹅肝面包塔",
        en: "Foie Gras Bread Tower",
        price: "¥79",
        note: "Foie gras on toast with a little mustard — the starter to share. Rich enough that two bites each is enough.",
        tag: "Starter"
      },
      {
        zh: "黑松露拇指小煎包",
        en: "Black Truffle Thumb Buns",
        price: "¥48",
        note: "Small enough to eat in one bite: crisp base, soft top, truffle on the finish.",
        tag: "Dim sum"
      },
      {
        zh: "捞汁小海鲜",
        en: "Seafood in Chilled Dressing",
        price: "¥79",
        note: "Head-on prawns in a sour-savoury dressing. Order it cold, between the fried courses.",
        tag: "Cold"
      },
      {
        zh: "斑斓芒果布丁",
        en: "Pandan Mango Pudding",
        price: "¥22",
        note: "The dessert: strong mango, bright green, made for the last photo of the night.",
        tag: "Dessert"
      }
    ],
    dishNote: "Prices from the Dianping listing. Two set menus do most of the work here: the ¥290 two-person “creative fireworks” (built around the snowflake beef) and the ¥420 three-to-four-person roast duck set.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the New World City branch — the ranking is by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "A chain of about ten stores across China. This page covers the New World City branch; the others are referenced from here rather than written up separately.",
    sources: [
      { label: "Dianping — 3号仓库·创意中国菜（新世界城店）", url: "https://www.dianping.com/" },
      { label: "Trip.com", url: "https://www.trip.com/" }
    ]
  },
{
    slug: "bund-family-banquet",
    city: "shanghai",
    status: "want",
    nameEn: "Bund Family Banquet",
    nameZh: "外滩家宴·上海本帮菜",
    locEn: "Roosevelt Mansion, the Bund",
    locZh: "罗斯福公馆店",
    cuisine: "Shanghainese (benbang)",
    cuisineZh: "本帮菜",
    price: "¥150–250 per person",
    area: "the Bund / East Nanjing Road",
    addressEn: "1/F, Roosevelt Mansion, 27 Zhongshan East 1st Road, Huangpu — 730 m from East Nanjing Road station",
    addressZh: "黄浦区中山东一路27号罗斯福公馆一楼（南京东路站步行约730米）",
    tagline: "Benbang cooking on the Bund, in a room that has been photographed from every angle.",
    card: "No. 1 Jiangzhe restaurant in the East Nanjing Road cluster, 4.8 from 1,700 reviews. Order the squirrel fish and the crab roe noodles.",
    awards: [
      { mark: "1", label: "No. 1 Jiangzhe Restaurant, East Nanjing Road", note: "Dianping 热门榜 — popularity" },
      { mark: "4.8", label: "Dianping 4.8 / 5", note: "1,747 reviews at the time of listing" }
    ],
    story: [
      "外滩家宴 occupies the ground floor of the Roosevelt Mansion at 27 Zhongshan East 1st Road — one of the few Bund addresses where the view, the room and the bill are all in the same sentence. Dark wood, white cloths, and a menu that is unapologetically benbang: sweet, dark, slow.",
      "It has become part of the 1990s-Shanghai trail partly because it appears in 繁花 (Blossoms), the television adaptation of Jin Yucheng's novel. The listing advertises the connection, and the room leans into it — this is a place people book for the atmosphere as much as the cooking.",
      "The kitchen's strength is crab roe in four forms: noodles, xiao long bao, spring rolls, and a plain bowl of roe over noodles. If you order one thing, make it one of those. The squirrel fish is the most-ordered dish in the house and the one the dining room is built around."
    ],
    whyFamous: [
      "No. 1 Jiangzhe restaurant in the East Nanjing Road cluster on Dianping's popularity chart.",
      "A 繁花 filming location, on the Bund — the view from the room is the Lujiazui skyline.",
      "Crab roe in four forms, from ¥26 spring rolls to ¥138 noodles.",
      "4.8 across 1,747 reviews, which for a Bund tourist address is unusually high."
    ],
    quote: { text: "Benbang cooking with a Bund view — the crab roe does the heavy lifting.", cite: "The house in one line" },
    dishes: [
      {
        zh: "海派松鼠鱼",
        en: "Shanghai-Style Squirrel Fish",
        price: "¥158",
        note: "The top order by a distance. Sweet-and-sour, scored and fried into shape — the dish the room is photographed around.",
        tag: "No. 1"
      },
      {
        zh: "海派红烧肉",
        en: "Shanghai-Style Red-Braised Pork Belly",
        price: "¥188",
        note: "Dark, sweet, collapsing. Order rice; the sauce is the point as much as the pork.",
        tag: "Signature"
      },
      {
        zh: "蟹黄金捞面",
        en: "Crab Roe Noodles, Tossed",
        price: "¥138",
        note: "Every strand coated in golden crab roe. The dish most tables order twice.",
        tag: "Crab"
      },
      {
        zh: "秘制花雕熟醉虾",
        en: "Huadiao-Drunk Prawns",
        price: "¥58",
        note: "Cooked then marinated in Huadiao wine — sweet, mellow, not sharp. Served cold.",
        tag: "Cold"
      },
      {
        zh: "蟹黄小笼包",
        en: "Crab Roe Xiao Long Bao",
        price: "¥68",
        note: "Thin skin, soup inside, crab roe through the filling. Eat it in one bite.",
        tag: "Dim sum"
      },
      {
        zh: "松茸羊肚菌鸡汤",
        en: "Matsutake and Morel Chicken Soup",
        price: "¥38",
        note: "The cheap order that anchors the table: clear chicken broth with dried mushrooms.",
        tag: "Soup"
      },
      {
        zh: "蟹黄面",
        en: "Crab Roe Noodles, Plain",
        price: "¥138",
        note: "The same crab roe without the toss — a full bowl of it, nothing else in the way.",
        tag: "Crab"
      },
      {
        zh: "蟹黄春卷",
        en: "Crab Roe Spring Rolls",
        price: "¥26",
        note: "Crisp outside, soft crab inside. The cheapest way to taste the crab roe.",
        tag: "Fried"
      },
      {
        zh: "秘制蛋汁大排",
        en: "Egg-Batter Pork Chop",
        price: "¥58",
        note: "Pork chop in an egg batter, fried gold. A Shanghai home dish done properly.",
        tag: "Signature"
      },
      {
        zh: "法式黑椒牛肉粒",
        en: "Black Pepper Beef Cubes",
        price: "¥158",
        note: "Flambeed at the table, the one French-inflected dish on a benbang menu.",
        tag: "Theatre"
      },
    ],
    dishNote: "Prices from the Dianping listing. Two set menus do most of the work: ¥390 for two (百年公馆 主厨推荐) and ¥590 for four (上海家宴). The 100-yuan voucher sells for ¥89.9 in the app.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Roosevelt Mansion branch — the ranking is by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "This page covers the Roosevelt Mansion room on the Bund. If the name appears at another address, confirm it on Dianping before booking — the view is the reason to come to this one.",
    sources: [
      { label: "Dianping — 外滩家宴·上海本帮菜（罗斯福公馆店）", url: "https://www.dianping.com/" }
    ]
  },
{
    slug: "yangs-shengjian",
    city: "shanghai",
    status: "want",
    nameEn: "Yang's Fried Dumplings",
    nameZh: "小杨生煎",
    locEn: "Zhujiajiao Ancient Town",
    locZh: "朱家角古镇店",
    cuisine: "Shanghai snack / shengjian",
    cuisineZh: "生煎・上海小吃",
    price: "¥25–40 per person",
    area: "Zhujiajiao, Qingpu",
    addressEn: "266 Xinfeng Road, Zhujiajiao, Qingpu District — 1.2 km from the Dazhimen plaza",
    addressZh: "青浦区朱家角镇新风路266号（近大西镇大拇指广场，步行约1.2公里）",
    tagline: "The Shanghai chain that made soup-filled shengjian a household name — at ¥6 a bun.",
    card: "No. 1 shengjian in Qingpu, ¥28 a head. Order the classic pork bun and the duck vermicelli soup, and nothing else.",
    awards: [
      { mark: "1", label: "No. 1 Shengjian in Qingpu", note: "Dianping 好评榜" },
      { mark: "4.1", label: "Dianping 4.1 / 5", note: "2,657 reviews — read the bun score, not the room" }
    ],
    story: [
      "小杨生煎 started in 1994 on Wujiang Road with one shop and one idea: a shengjian with more soup than the old style, folded pleat-side down and fried until the base is crisp. It became a chain — one of the few Shanghai snack brands that travelled outside the city — and the bun is now the reference point for the form.",
      "This branch is in Zhujiajiao's old town, open from 06:30 to 22:00 and priced for locals and day-trippers alike: ¥28 a head. You queue at the counter, take a tray, and eat at a plastic table. It is not a restaurant in any ceremonial sense.",
      "The 4.1 overall score is worth reading carefully. The signature bun has 5,593 likes — by far the most-liked item in the shop — while the room, the queue and the service drag the average down. Judge it on the bun."
    ],
    whyFamous: [
      "The bun: pork and jelly filling, crisp base, soup that bursts on the first bite.",
      "5,593 likes on the signature shengjian — the most-liked dish in the shop.",
      "A 1994 Shanghai original that turned a street snack into a city-wide chain.",
      "Absurdly cheap: ¥6 for the classic bun, ¥28 for a full meal."
    ],
    quote: { text: "A ¥6 bun with more soup than the old style — that was the whole idea.", cite: "How Yang's changed shengjian" },
    dishes: [
      {
        zh: "小杨生煎",
        en: "Yang's Pork Shengjian",
        price: "¥6",
        note: "The one that built the chain: pork and jelly filling, pleat-side down, crisp base, soup that bursts on the first bite.",
        tag: "No. 1"
      },
      {
        zh: "老鸭粉丝汤",
        en: "Duck and Vermicelli Soup",
        price: "¥17",
        note: "The classic pairing — duck broth, glass noodles, a little pepper. The 藤椒 version adds Sichuan pepper heat.",
        tag: "Soup"
      },
      {
        zh: "藤椒大虾生煎",
        en: "Sichuan-Pepper Prawn Shengjian",
        price: "¥22",
        note: "The same bun with a whole prawn and a numbing note. Order it alongside the pork, not instead.",
        tag: "Variant"
      },
      {
        zh: "鱼丸汤",
        en: "Fish Ball Soup",
        price: "¥12",
        note: "Springy fish balls in clear broth — the cheap order that makes the meal a meal.",
        tag: "Soup"
      },
      {
        zh: "特色酸辣粉",
        en: "House Hot and Sour Noodles",
        price: "¥14",
        note: "Sweet potato noodles, vinegar and chilli. The non-bun order for anyone who wants heat.",
        tag: "Noodles"
      },
      {
        zh: "荠菜生煎",
        en: "Shepherd's Purse Shengjian",
        price: "¥12",
        note: "The vegetarian option: greens rather than pork, same crisp base. Order it in spring.",
        tag: "Variant"
      },
      {
        zh: "里脊肉",
        en: "Pork Tenderloin Skewers",
        price: "¥6",
        note: "Grilled skewers, springy and peppery. The side that turns two buns into a meal.",
        tag: "Side"
      },
      {
        zh: "特色炸猪排",
        en: "House Fried Pork Chop",
        price: "¥15",
        note: "Thin, crisp, Shanghai-style. Best with the vinegar dip if they have it.",
        tag: "Fried"
      },
      {
        zh: "口水鸡茄香风味肉沫拌面",
        en: "Mouth-Watering Chicken Noodles with Minced Pork",
        price: "¥17.2",
        note: "Cold chicken, minced pork, tomato-savoury sauce over noodles. The most substantial non-bun plate.",
        tag: "Noodles"
      },
      {
        zh: "油豆腐牛肉粉丝汤",
        en: "Beef and Fried Tofu Vermicelli Soup",
        price: "¥17.2",
        note: "Beef slices and fried tofu in broth — the heartiest soup on the list.",
        tag: "Soup"
      },
    ],
    dishNote: "Prices from the Dianping listing. The app vouchers are the value: ¥4 for a single bun (from ¥12) and ¥17.4 for the set meal. Cash prices at the counter are higher.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Zhujiajiao branch — ranked by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "A Shanghai chain with branches across the city — this page covers the Zhujiajiao old-town shop, the one you would stop at while visiting the water town. Other branches are the same menu, not a different restaurant.",
    sources: [
      { label: "Dianping — 小杨生煎（朱家角古镇店）", url: "https://www.dianping.com/" }
    ]
  },
{
    slug: "yushui-house",
    city: "shanghai",
    status: "want",
    nameEn: "Yushui House",
    nameZh: "渔水之家·土灶柴火饭",
    locEn: "Zhujiajiao",
    locZh: "朱家角店",
    cuisine: "Jiangsu-Zhejiang country cooking",
    cuisineZh: "苏浙菜",
    price: "¥80–120 per person",
    area: "Zhujiajiao, Qingpu",
    addressEn: "131 Xijing Street, Zhujiajiao, Qingpu District — near the old-town main gate, 590 m from the Dazhimen plaza",
    addressZh: "青浦区西井街131号（近朱家角古镇大门口，步行约590米）",
    tagline: "A wood-fired stove, a river at the door, and the best-reviewed country chicken in Qingpu.",
    card: "4.9 across 14,000 reviews — No. 1 Su-Zhe restaurant in Qingpu. Order the country white-cut chicken and the rice with the crust.",
    awards: [
      { mark: "1", label: "No. 1 Su-Zhe Restaurant in Qingpu", note: "Dianping 好评榜" },
      { mark: "3", label: "No. 3 White-Cut Chicken in Shanghai", note: "Dianping 王牌菜 · 菜品榜" },
      { mark: "4.9", label: "Dianping 4.9 / 5", note: "14,421 reviews — rare for a tourist-town address" }
    ],
    story: [
      "渔水之家 sits a few minutes from the main gate of Zhujiajiao, in an old house with a wood-fired stove at the back. The name means something like 'home of fish and water', and the menu follows: river fish, free-range chicken, vegetables from the farms around the water town.",
      "It has been listed on Dianping for thirteen years and holds a 4.9 across 14,421 reviews, which for an address this close to a tourist gate is unusual — the reviews are not all day-trippers. The room has private tables for seven to ten, and the kitchen will take a phone booking.",
      "The 白斩鸡 carries the ranking: there are two versions, 乡下 and regular, both poached then chilled, chopped bone-in and served with soy and ginger. The country bird is the one with flavour in the meat rather than on the skin. Order both if there are four of you — the comparison is the point.",
      "The other reason to come is the rice. 咸肉菜饭 is cooked in an iron pot and scraped up with the crust mixed through; the stove is not decoration."
    ],
    whyFamous: [
      "No. 1 Su-Zhe restaurant in Qingpu on Dianping's 好评榜.",
      "No. 3 white-cut chicken in Shanghai — and there are two versions on the menu to compare.",
      "4.9 across 14,421 reviews at a tourist-town address.",
      "A working wood-fired stove: rice and braises cooked over fire, not gas."
    ],
    quote: { text: "The chicken is the ranking; the rice crust is the reason to stay.", cite: "The house in one line" },
    dishes: [
      {
        zh: "乡下白斩鸡",
        en: "Country White-Cut Chicken",
        price: "¥58",
        note: "No. 3 on Shanghai's white-cut chicken chart. Poached, chilled, chopped bone-in — the bird tastes of itself, not of the soy.",
        tag: "No. 3"
      },
      {
        zh: "古镇扎肉",
        en: "Old-Town Lotus-Leaf Pork",
        price: "¥13",
        note: "Zhujiajiao's own snack: pork belly wrapped in dried lotus leaf and braised until it collapses. Order two.",
        tag: "Local"
      },
      {
        zh: "银鱼炒蛋",
        en: "Silver Fish Omelette",
        price: "¥38",
        note: "Tiny lake fish folded through egg. The dish that most clearly says 'river town'.",
        tag: "River"
      },
      {
        zh: "白斩鸡",
        en: "White-Cut Chicken",
        price: "¥58",
        note: "The regular version — same technique, younger bird, softer skin. Order both and compare.",
        tag: "Signature"
      },
      {
        zh: "清蒸白水鱼",
        en: "Steamed White Water Fish",
        price: "¥69",
        note: "Steamed whole with ginger and scallion. Nothing to hide behind, so the fish has to be fresh. It is.",
        tag: "River"
      },
      {
        zh: "油爆虾",
        en: "Flash-Fried River Shrimp",
        price: "¥88",
        note: "Shells crisp enough to eat, wok heat all the way through. The best non-chicken order on the list.",
        tag: "Wok"
      },
      {
        zh: "咸肉菜饭",
        en: "Salted Pork and Greens Rice",
        price: "¥38",
        note: "Cooked in the iron pot, crust scraped up and mixed in. The reason to order rice rather than noodles.",
        tag: "Rice"
      },
      {
        zh: "油焖茭白",
        en: "Braised Water Bamboo",
        price: "¥28",
        note: "Sweet soy braise, the Shanghai way — dark, glossy, slightly sweet. A vegetable that eats like a main.",
        tag: "Vegetable"
      },
      {
        zh: "土鸡蛋",
        en: "Farm Egg Omelette",
        price: "¥38",
        note: "Golden egg, green scallion, nothing else. Simple enough that the stove does the work.",
        tag: "Egg"
      },
      {
        zh: "盐水白米虾",
        en: "Salted White Rice Shrimp",
        price: "¥68",
        note: "Small river shrimp poached in salted water, served cold. Sweet, springy, made for beer.",
        tag: "Cold"
      },
    ],
    dishNote: "Prices from the Dianping listing. The 100-yuan voucher sells for ¥81, and there is a 10–12 person banquet set at ¥1,520 if you are bringing the family.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Zhujiajiao branch — ranked by the app's like counts, with the dish-chart positions where they exist.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "One house in Zhujiajiao, by the old-town gate. It is a country restaurant rather than a chain — the stove is the reason to make the trip.",
    sources: [
      { label: "Dianping — 渔水之家·土灶柴火饭", url: "https://www.dianping.com/" }
    ]
  },
{
    slug: "siji-minfu",
    city: "shanghai",
    status: "want",
    nameEn: "Siji Minfu Roast Duck",
    nameZh: "四季民福烤鸭店",
    locEn: "Jing'an Joy City",
    locZh: "静安大悦城店",
    cuisine: "Beijing roast duck",
    cuisineZh: "北京菜・烤鸭",
    price: "¥180–260 per person",
    area: "Suzhou Creek / Jing'an",
    addressEn: "5/F North Tower, Jing'an Joy City, 198 Xizang North Road, Jing'an District — 300 m from Qufu Road station exit 1",
    addressZh: "静安区西藏北路198号静安大悦城北座5层（地铁曲阜路站1口步行约300米）",
    tagline: "Beijing duck in Shanghai, carved at the table — and the city's best-selling Beijing restaurant.",
    card: "No. 1 Beijing restaurant in Shanghai by sales, 4.8 from 17,800 reviews. Order the duck, the pea shoots, and the noodles.",
    awards: [
      { mark: "1", label: "No. 1 Beijing Restaurant in Shanghai", note: "Dianping 销量榜 — by sales" },
      { mark: "4.8", label: "Dianping 4.8 / 5", note: "17,828 reviews at the time of listing" }
    ],
    story: [
      "四季民福 built its name in Beijing on roast duck at a price that does not require an occasion, and on a menu that reaches past duck into the old Beijing repertoire — 爆肚, 贝勒烤肉, 炸酱面, 驴打滚. This is the Shanghai room, on the fifth floor of Jing'an Joy City, three years old and already the city's best-selling Beijing restaurant.",
      "The duck arrives whole, is carved beside the table, and is served in the correct order: skin first, dipped in sugar, then the meat with pancakes, scallion and sweet bean sauce. The skin is the test — if it is not glassy, nothing else matters.",
      "The rest of the menu is there to stop the duck from being too much: cold pea shoots dressed sharply, a clear meatball broth, noodles with fried bean sauce. Order across the menu rather than ordering two ducks."
    ],
    whyFamous: [
      "No. 1 Beijing restaurant in Shanghai by sales on Dianping, with 17,828 reviews at 4.8.",
      "Duck carved at the table, skin served first with sugar — the Beijing protocol, done properly.",
      "A full old-Beijing menu alongside the duck: 爆肚, 贝勒烤肉, 炸酱面, 驴打滚.",
      "A chain, but a disciplined one: the same duck, the same carving, in a shopping-centre room."
    ],
    quote: { text: "Skin first, with sugar. If the skin is not glassy, nothing else matters.", cite: "How to eat the duck" },
    dishes: [
      {
        zh: "酥香嫩烤鸭",
        en: "Crisp, Fragrant, Tender Roast Duck",
        price: "¥259",
        note: "The whole point. Carved at the table, skin first, with pancakes, scallion and sweet bean sauce. Order a half duck for two, a whole for four.",
        tag: "No. 1"
      },
      {
        zh: "巧拌豆苗",
        en: "Tossed Pea Shoots",
        price: "¥45",
        note: "The dish that made the top two: raw-tasting shoots dressed sharp and cold. It cuts the duck fat better than anything else on the table.",
        tag: "Cold"
      },
      {
        zh: "贝勒烤肉",
        en: "Beile Grilled Lamb",
        price: "¥98",
        note: "An old Beijing dish — lamb off the grill, cumin-heavy, served sizzling. Order it if there are four of you.",
        tag: "Grill"
      },
      {
        zh: "蜜汁酥皮虾",
        en: "Honey-Glazed Crisp Prawns",
        price: "¥98",
        note: "Prawns fried in shell then glazed. Sweet, crisp, gone in three minutes.",
        tag: "Fried"
      },
      {
        zh: "炸酱面",
        en: "Zhajiang Noodles",
        price: "¥26",
        note: "Noodles with fried bean sauce and a plate of raw vegetables. The cheapest proper order on the menu, and the one to judge the kitchen by.",
        tag: "Noodles"
      },
      {
        zh: "京味爆肚",
        en: "Beijing-Style Tripe",
        price: "¥98",
        note: "Blanched to the second — crisp, not chewy — with sesame dipping sauce. The most Beijing thing on the list.",
        tag: "Offal"
      },
      {
        zh: "京城酥肉锅",
        en: "Capital Crisp Pork Hot Pot",
        price: "¥79",
        note: "Fried pork in a broth that softens the crust and soaks it. Winter food, and the thing to order with the duck.",
        tag: "Stew"
      },
      {
        zh: "老北京小吃拼盘",
        en: "Old Beijing Snack Platter",
        price: "¥79",
        note: "Five small pastries on one plate — the cheapest way to try the sweets without committing to a whole portion of each.",
        tag: "Sweets"
      },
      {
        zh: "清炖手工狮子头",
        en: "Clear-Braised Lion's Head Meatball",
        price: "¥45",
        note: "Small, delicate, in a light broth. The quiet dish between the duck and the fried courses.",
        tag: "Soup"
      },
      {
        zh: "驴打滚",
        en: "Ludagun (Glutinous Roll)",
        price: "¥25",
        note: "Glutinous rice rolled in soybean flour — soft, not too sweet. The dessert to finish on.",
        tag: "Dessert"
      },
    ],
    dishNote: "Prices from the Dianping listing. The set menus are the value: ¥407 for the duck set for two (入选十年·民福甄选) and ¥833 for four. The 100-yuan voucher sells for ¥90.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Jing'an Joy City branch — ranked by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "A Beijing chain with rooms in both cities — this page covers the Jing'an Joy City branch. The menu is the same across the group; the room and the view are not.",
    sources: [
      { label: "Dianping — 四季民福烤鸭店（静安大悦城店）", url: "https://www.dianping.com/" }
    ]
  },
{
    slug: "xin-rong-ji",
    city: "shanghai",
    status: "want",
    nameEn: "Xin Rong Ji",
    nameZh: "新荣记",
    locEn: "Nanjing West Road",
    locZh: "南京西路店",
    cuisine: "Taizhou seafood (Zhejiang)",
    cuisineZh: "苏浙菜・台州菜",
    price: "¥680–1,200 per person",
    area: "Nanjing West Road",
    addressEn: "L2, Henderson 688 Plaza, 688 Nanjing West Road, Jing'an District — 350 m from Nanjing West Road station exit 5",
    addressZh: "静安区南京西路688号恒基688广场L2（地铁南京西路站5口步行约350米）",
    tagline: "Taizhou seafood at the top of the market — the pigeon is ¥98, the croaker is ¥2,280.",
    card: "No. 1 Su-Zhe restaurant in Shanghai, 4.8 from 14,500 reviews. Order the pigeon, the sea-anemone noodles, and the sweet potato.",
    awards: [
      { mark: "1", label: "No. 1 Su-Zhe Restaurant in Shanghai", note: "Dianping 热门榜" },
      { mark: "4.8", label: "Dianping 4.8 / 5", note: "14,583 reviews at the time of listing" },
      { mark: "★", label: "MICHELIN-starred group", note: "The Beijing flagship has held three stars" }
    ],
    story: [
      "新荣记 started in 1995 as a seafood 大排档 in 临海, Taizhou, run by 张勇 — a cook who calls himself a cook rather than a restaurateur. Thirty years later it is the reference point for Taizhou cooking in China: more than forty rooms in Beijing, Shanghai, Shenzhen, Hong Kong and Tokyo, and a group that has been in the MICHELIN guide since Shanghai's first edition in 2016.",
      "The cooking is Zhejiang coastal, not Shanghainese: yellow croaker braised with rice cakes, sand anemone folded through sweet-potato noodles, hairtail fried hard. It is a cuisine built on fish, salt and stock rather than sugar and soy, which is why it tastes unlike the rest of this list.",
      "This branch has been on Nanjing West Road for eleven years, on the second floor of Henderson 688. It is a business-dinner room — private tables, a phone booking, and a menu where the prices run from ¥18 for a bun to ¥2,280 for a croaker. Ask the price of the fish before you order it; that is normal here."
    ],
    whyFamous: [
      "No. 1 Su-Zhe restaurant in Shanghai on Dianping's popularity chart.",
      "The Taizhou dishes almost nobody else in Shanghai cooks: 沙蒜豆面, 家烧黄鱼, 黄金脆带鱼.",
      "A group with MICHELIN history — its Beijing flagship has held three stars.",
      "The range: a ¥98 pigeon that is the best value on the menu, and a ¥2,280 fish that is the reason people book."
    ],
    quote: { text: "Ask the price of the fish before you order it. That is normal here.", cite: "How to order at Xin Rong Ji" },
    dishes: [
      {
        zh: "脆皮乳鸽",
        en: "Crisp-Skin Pigeon",
        price: "¥98",
        note: "The top order. Skin thin enough to crack, juice that runs the moment you bite. The best value on a very expensive menu.",
        tag: "No. 1"
      },
      {
        zh: "沙蒜烧豆面",
        en: "Sea Anemone with Sweet-Potato Noodles",
        price: "¥328",
        note: "The Taizhou dish that made the restaurant: sand anemone braised into glassy noodles. Savoury, slippery, unlike anything else in Shanghai.",
        tag: "Taizhou"
      },
      {
        zh: "黄金脆带鱼",
        en: "Golden Crisp Hairtail (large)",
        price: "¥298",
        note: "Hairtail fried until the edges curl. Crisp outside, juicy inside — order the large portion for four.",
        tag: "Fried"
      },
      {
        zh: "鲳鱼烧年糕",
        en: "Pomfret with Rice Cakes",
        price: "¥558",
        note: "White pomfret soft enough to fall apart at a touch, rice cakes chewy underneath. The sauce is the point.",
        tag: "Fish"
      },
      {
        zh: "蜜汁红薯",
        en: "Honey-Glazed Sweet Potato",
        price: "¥38",
        note: "A whole sweet potato, roasted until it leaks sugar, then glazed. The cheapest thing on the list and the one people remember.",
        tag: "Sweet"
      },
      {
        zh: "黄鱼",
        en: "Braised Yellow Croaker",
        price: "¥2,280",
        note: "The signature, priced by size — ask before you order it. Fish, rice cakes, and a sauce thick enough to coat a spoon.",
        tag: "Signature"
      },
      {
        zh: "龙虾汤泡饭",
        en: "Lobster Broth Rice",
        price: "¥198",
        note: "Rice in a reduced lobster broth. The dish to order when you want the kitchen's stock work without the fish price.",
        tag: "Rice"
      },
      {
        zh: "黑松露鹅肝包",
        en: "Black Truffle Foie Gras Bun",
        price: "¥18",
        note: "A small baked bun that shatters, filled with truffle and foie gras. Order two each.",
        tag: "Dim sum"
      },
      {
        zh: "溏心富贵虾",
        en: "Mantis Shrimp with Runny Roe",
        price: "¥1,280",
        note: "The showpiece: mantis shrimp with a molten roe centre, plated whole. Order it for the table, not for one.",
        tag: "Showpiece"
      },
      {
        zh: "桂花鸡头米",
        en: "Osmanthus and Gorgon Nut",
        price: "¥68",
        note: "Soft gorgon nut with lily bulb and longan, sweetened lightly. The dessert to finish a long dinner.",
        tag: "Dessert"
      },
    ],
    dishNote: "Prices from the Dianping listing. The croaker and the mantis shrimp are market-priced by size — confirm before ordering. Two people can eat well on the pigeon, the noodles and the sweet potato for under ¥500.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Nanjing West Road branch — ranked by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "A group with more than forty rooms across China and Tokyo. This page covers the Nanjing West Road branch — the Shanghai flagship is the one people book for business dinners.",
    sources: [
      { label: "Dianping — 新荣记（南京西路店）", url: "https://www.dianping.com/" },
      { label: "MICHELIN Guide Shanghai", url: "https://guide.michelin.com/" }
    ]
  },
{
    slug: "lai-lai-xiao-long",
    city: "shanghai",
    status: "want",
    nameEn: "Lai Lai Xiao Long",
    nameZh: "莱莱小笼·乔艾",
    locEn: "Tianjin Road, Huangpu",
    locZh: "天津路店",
    cuisine: "Shanghai xiaolongbao",
    cuisineZh: "小笼・上海点心",
    price: "¥50–80 per person",
    area: "East Nanjing Road",
    addressEn: "506/481 Tianjin Road, Huangpu District — 580 m from People's Square station exit 19",
    addressZh: "黄浦区天津路506号/481号（地铁人民广场站19口步行约580米）",
    tagline: "An alley xiaolongbao shop with three city-chart titles and a MICHELIN Bib Gourmand three years running.",
    card: "No. 1 xiaolongbao in Shanghai, No. 1 small wonton, No. 4 pork chop. Twenty-eight yuan a head for the classic.",
    awards: [
      { mark: "必", label: "MICHELIN Bib Gourmand", note: "2024, 2025 and 2026 — three consecutive years" },
      { mark: "1", label: "No. 1 Xiaolongbao in Shanghai", note: "Dianping 王牌菜 · 菜品榜" },
      { mark: "1", label: "No. 1 Small Wonton in Shanghai", note: "Dianping 王牌菜 · 菜品榜" }
    ],
    story: [
      "莱莱小笼·乔艾 sits in an alley off Tianjin Road, in the old block behind East Nanjing Road — the kind of address you walk past twice. Inside it is bright, tiled and entirely functional: an open kitchen, a few tables, a queue that starts before service.",
      "You can watch the xiaolong being folded through the glass. That is the whole proposition: hand-folded dumplings, crab roe from the same morning, and a pot of ginger-thread vinegar on every table. The MICHELIN guide has given it a Bib Gourmand for three consecutive years, 2024 through 2026.",
      "The Dianping charts are unusually specific about this shop: No. 1 xiaolongbao in Shanghai, No. 1 small wonton, No. 4 fried pork chop. Those are city-wide rankings, not district ones — which is why the queue exists.",
      "One caveat: the 4.3 overall score reflects a cheap, fast, crowded room, not the food. Judge it on the dumplings."
    ],
    whyFamous: [
      "No. 1 xiaolongbao in Shanghai on Dianping's dish chart.",
      "MICHELIN Bib Gourmand three years running (2024–2026).",
      "Three separate city-chart titles: xiaolong, small wonton, fried pork chop.",
      "An open kitchen — you watch the dumplings being folded before you eat them."
    ],
    quote: { text: "Watch them fold it, then eat it within a minute. That is the whole experience.", cite: "The house in one line" },
    dishes: [
      {
        zh: "蟹粉鲜肉小笼8只",
        en: "Crab Roe and Pork Xiaolong (8)",
        price: "¥46",
        note: "No. 1 on Dianping's Shanghai xiaolongbao chart. Thin skin, pork and crab roe, soup that arrives before the filling does.",
        tag: "No. 1"
      },
      {
        zh: "姜丝醋",
        en: "Ginger-Thread Vinegar",
        price: "¥1",
        note: "A yuan's worth of the thing that makes the rest work: sharp, sweet-sour, cuts the crab fat. Order one per person.",
        tag: "Condiment"
      },
      {
        zh: "炸猪排",
        en: "Fried Pork Chop",
        price: "¥25",
        note: "No. 4 on Shanghai's pork-chop chart. Crisp, thin, with Worcestershire-style sauce — the Shanghai way.",
        tag: "No. 4"
      },
      {
        zh: "蟹粉面",
        en: "Crab Roe Noodles",
        price: "¥138",
        note: "A whole bowl of crab roe over noodles. The most expensive thing here, and the one to order if you are not counting.",
        tag: "Crab"
      },
      {
        zh: "蟹粉小馄饨10只",
        en: "Crab Roe Wontons (10)",
        price: "¥32",
        note: "No. 1 small wonton in Shanghai. Skin with a little bite, filling sweet rather than salty.",
        tag: "No. 1"
      },
      {
        zh: "鸡鸭血汤",
        en: "Chicken and Duck Blood Soup",
        price: "¥15",
        note: "Clear broth, blood curd, coriander. The old Shanghai accompaniment to a plate of xiaolong.",
        tag: "Soup"
      },
      {
        zh: "纯蟹膏小笼",
        en: "Pure Crab Roe Xiaolong",
        price: "¥70",
        note: "The MICHELIN guide's pick: nothing but crab roe inside, best with the ginger vinegar.",
        tag: "Signature"
      },
      {
        zh: "纯鲜肉馅小笼",
        en: "Pure Pork Xiaolong",
        price: "¥28",
        note: "The control order — no crab, just pork and soup. If this one is good, the kitchen is good.",
        tag: "Classic"
      },
      {
        zh: "松茸鲜肉小笼",
        en: "Matsutake and Pork Xiaolong",
        price: "¥33",
        note: "Matsutake folded into the pork. Earthy, and the most seasonal thing on the menu.",
        tag: "Seasonal"
      },
      {
        zh: "老街炸鸡串",
        en: "Old-Street Fried Chicken Skewers",
        price: "¥12",
        note: "Crisp, salty, five-spice. The snack people order while waiting for a table.",
        tag: "Snack"
      },
    ],
    dishNote: "Prices from the Dianping listing. The classic pork xiaolong is ¥28 for eight — the cheapest proper meal in this part of town. The crab roe versions are where the money goes.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Tianjin Road shop — ranked by the app's like counts, with the city-chart positions where they exist.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "One shop in the alley off Tianjin Road. There is a second 莱莱 name in Jing'an — different room, same menu; this page covers the Huangpu original.",
    sources: [
      { label: "Dianping — 莱莱小笼·乔艾", url: "https://www.dianping.com/" },
      { label: "MICHELIN Guide Shanghai", url: "https://guide.michelin.com/" }
    ]
  },
{
    slug: "jintang-chunxiang",
    city: "shenzhen",
    status: "want",
    nameEn: "Jintang Chunxiang",
    nameZh: "锦堂春想·广府粤菜",
    locEn: "Shenzhen Bay flagship",
    locZh: "深圳湾首店",
    cuisine: "Cantonese",
    cuisineZh: "粤菜",
    price: "¥290–500 per person",
    area: "Shenzhen Bay, Nanshan",
    addressEn: "4/F, Dacheng Fund HQ, Haide 3rd Road, Nanshan — opposite Shenzhen Bay MixC, 440 m from Houhai station exit M",
    addressZh: "南山区海德三道大成基金总部4楼（深圳湾万象城斜对面，后海站M口步行约440米）",
    tagline: "Cantonese luxury opposite Shenzhen Bay MixC — glass-skinned pigeon, and mantis shrimp at ¥796.",
    card: "4.9 from 2,184 reviews, No. 5 Cantonese in Shenzhen Bay, No. 6 pigeon in Shenzhen. The ¥69 pigeon is the order.",
    awards: [
      { mark: "5", label: "No. 5 Cantonese Restaurant, Shenzhen Bay", note: "Dianping 热门榜" },
      { mark: "6", label: "No. 6 Pigeon in Shenzhen", note: "Dianping 王牌菜 · 菜品榜" },
      { mark: "4.9", label: "Dianping 4.9 / 5", note: "2,184 reviews at the time of listing" }
    ],
    story: [
      "锦堂春想 sits on the fourth floor of the Dacheng Fund headquarters on Haide 3rd Road, directly opposite Shenzhen Bay MixC. It is three years old, has private rooms and a phone booking line, and prices itself for the business district around it: ¥290 a head before anyone orders the mantis shrimp.",
      "The cooking is Cantonese with a luxury register — whole mantis shrimp with roe cooked to a molten centre, Sri Lankan crab, ten-year tangerine peel double-boiled with duck. The pigeon is the exception to the pricing: ¥69, glass-skinned, and ranked No. 6 in Shenzhen.",
      "There are two mantis shrimp on the list, at ¥796 and ¥398. The difference is the size and the amount of roe; if you have not eaten it before, start with the Thai one and decide whether the upgrade is worth it.",
      "One practical note: several dishes are priced by weight, so the bill can move. Ask before ordering the crab."
    ],
    whyFamous: [
      "No. 5 Cantonese restaurant in Shenzhen Bay, 4.9 across 2,184 reviews.",
      "No. 6 pigeon in Shenzhen — and at ¥69, the value order on a luxury menu.",
      "Two grades of mantis shrimp with runny roe, ¥398 and ¥796.",
      "A business-dinner room: private tables, an open roast oven, opposite Shenzhen Bay MixC."
    ],
    quote: { text: "Start with the ¥398 shrimp. Then decide whether the ¥796 is worth it.", cite: "How to order the mantis shrimp" },
    dishes: [
      {
        zh: "琥珀溏心富贵虾",
        en: "Amber Mantis Shrimp with Runny Roe",
        price: "¥796",
        note: "The top order and the most expensive thing here: roe cooked to a molten centre, meat sweet and springy. Order it for the table.",
        tag: "No. 1"
      },
      {
        zh: "招牌玻璃脆皮乳鸽",
        en: "Signature Glass-Skin Pigeon",
        price: "¥69",
        note: "No. 6 on Shenzhen's pigeon chart. Skin thin as cellophane, meat still juicy — the best value on a luxury menu.",
        tag: "No. 6"
      },
      {
        zh: "泰国有膏富贵虾",
        en: "Thai Mantis Shrimp with Roe",
        price: "¥398",
        note: "The half-price version of the same idea: roe softer, meat a little sweeter. Start here if the ¥796 is too much.",
        tag: "Seafood"
      },
      {
        zh: "10年陈皮炖水鸭汤",
        en: "Ten-Year Tangerine Peel Duck Soup",
        price: "",
        note: "Double-boiled with aged peel — warm, faintly bitter, sweet at the finish. The soup to order before anything fried.",
        tag: "Soup"
      },
      {
        zh: "斯里兰卡大青蟹",
        en: "Sri Lankan Mud Crab",
        price: "",
        note: "Cooked either simply or 避风塘 style with garlic and chilli. Ask which is better that day.",
        tag: "Seafood"
      },
      {
        zh: "小青龙贵妃鲜虾泡饭",
        en: "Baby Lobster and Prawn Rice in Broth",
        price: "¥143",
        note: "Rice in a shellfish broth with lobster and prawn. The cheapest way to taste the seafood kitchen.",
        tag: "Rice"
      },
      {
        zh: "明炉广式烧鹅",
        en: "Cantonese Roast Goose",
        price: "¥129",
        note: "Black-bristle goose, roasted in the open oven. Skin crisp, fat rendered — order a quarter.",
        tag: "Roast"
      },
      {
        zh: "经典蚝豉焖猪手",
        en: "Braised Pork Knuckle with Dried Oyster",
        price: "",
        note: "Collagen-rich, savoury with dried oyster. A Cantonese banquet dish, priced for sharing.",
        tag: "Braised"
      },
      {
        zh: "怀旧五柳炸蛋",
        en: "Old-School Five-Willow Fried Egg",
        price: "",
        note: "Whites fried crisp, yolk still runny, sweet-sour sauce underneath. A nostalgic dish done properly.",
        tag: "Nostalgia"
      },
      {
        zh: "黄贝",
        en: "Steamed Yellow Clams with Vermicelli",
        price: "¥43",
        note: "Clams steamed with glass noodles and garlic. The cheap order that makes the table feel complete.",
        tag: "Shellfish"
      },
    ],
    dishNote: "Prices from the Dianping listing. Items without a price are market-priced by weight — confirm at the table. The pigeon and the baby-lobster rice are the two orders that keep the bill sane.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Shenzhen Bay flagship — ranked by the app's like counts, with the dish-chart positions where they exist.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "The Shenzhen Bay flagship, opposite MixC. The brand's other rooms are in the same city — this page covers the first one.",
    sources: [
      { label: "Dianping — 锦堂春想·广府粤菜（深圳湾首店）", url: "https://www.dianping.com/" }
    ]
  },
{
    slug: "huoxi-ziyin-jiuzhou",
    city: "shenzhen",
    status: "want",
    nameEn: "Huoxi · Ziyin Jiuzhou",
    nameZh: "火玺·紫隐九州",
    locEn: "Science Park, Nanshan",
    locZh: "紫隐九州",
    cuisine: "Seafood hot pot",
    cuisineZh: "海鲜火锅",
    price: "¥450–700 per person",
    area: "Science Park, Nanshan",
    addressEn: "106–108 Block A, Jiuzhou Electronics Building, 007 Keji South 12th Road, Nanshan — 710 m from Hi-Tech Park station exit D",
    addressZh: "南山区粤海街道高新区科技南十二路007号九洲电器大厦A座106-108（地铁高新园站D口步行约710米）",
    tagline: "Seafood hot pot in Nanshan Science Park, with a deboned pigeon as the signature.",
    card: "No. 1 seafood hot pot in Nanshan, 4.8 from 4,500 reviews. Order the pigeon, the lobster pot, and the tofu.",
    awards: [
      { mark: "1", label: "No. 1 Seafood Hot Pot in Nanshan", note: "Dianping 热门榜" },
      { mark: "4.8", label: "Dianping 4.8 / 5", note: "4,545 reviews at the time of listing" },
      { mark: "美", label: "Dianping 漂亮饭", note: "Listed for presentation as well as food" }
    ],
    story: [
      "火玺·紫隐九州 is a high-end seafood hot pot room on the ground floor of the Jiuzhou Electronics Building in Nanshan Science Park — four years old, private rooms, a phone booking line, and a menu that assumes a company card.",
      "The signature is 仙鹤神针: a deboned pigeon stuffed, braised in abalone sauce, then cut open at the table so the juice runs into the bowl. It is an old Cantonese banquet dish, and it is the reason the restaurant ranks No. 1 for seafood hot pot in the district.",
      "Around it the menu is built on two pots — a lobster broth that gets turned into rice at the end, and a conch, fish maw and chicken broth that is the cheaper, deeper option. The crab dishes are the theatre: one arrives inside a white-chocolate egg and is set alight with baijiu.",
      "It is not a cheap meal — ¥469 a head before the ¥1,098 sashimi platter — but the ¥48 tofu and the free rice at the end of the lobster pot keep it from being only that."
    ],
    whyFamous: [
      "No. 1 seafood hot pot in Nanshan on Dianping's popularity chart.",
      "仙鹤神针 — deboned pigeon in abalone sauce, carved open at the table.",
      "The lobster pot ends as a free rice pot; the conch and fish maw pot is the connoisseur's order.",
      "Presentation built for photographs: a crab inside a chocolate egg, flambéed at the table."
    ],
    quote: { text: "The pigeon is the signature. The free rice at the end of the lobster pot is the smart order.", cite: "How to eat here" },
    dishes: [
      {
        zh: "仙鹤神针",
        en: "Crane's Needle — Deboned Pigeon Stuffed with Fin",
        price: "¥288",
        note: "The house signature: pigeon deboned, stuffed, braised in abalone sauce and cut open at the table so the juice runs out. Ask whether the stuffing is fin or fish maw that day.",
        tag: "No. 1"
      },
      {
        zh: "海鲜火锅",
        en: "Seafood Hot Pot",
        price: "",
        note: "The base order: fish maw, grouper, and a pot of clear broth. Priced by what you add — ask before it goes in.",
        tag: "Hot pot"
      },
      {
        zh: "招牌竹笙龙虾汤锅",
        en: "Signature Lobster Broth with Bamboo Fungus",
        price: "¥398",
        note: "Lobster stock, bamboo fungus, and the leftover broth turned into a rice pot at the end for free. The best value on the menu.",
        tag: "Hot pot"
      },
      {
        zh: "黄金松叶蟹斗",
        en: "Golden Spider Crab Shell",
        price: "¥688",
        note: "A whole crab presented inside a white-chocolate egg, flambéed with baijiu at the table. Theatre, but the crab underneath is good.",
        tag: "Showpiece"
      },
      {
        zh: "火玺螺头花胶鸡锅汤",
        en: "Huoxi Conch, Fish Maw and Chicken Broth",
        price: "¥308",
        note: "The other pot: conch for savoury depth, fish maw for body, chicken underneath. Golden and thick — order it if you are not having lobster.",
        tag: "Hot pot"
      },
      {
        zh: "黑松露小豆腐",
        en: "Black Truffle Tofu",
        price: "¥48",
        note: "Crisp outside, soft inside, truffle on the finish. The cheap order that everyone at the table reaches for.",
        tag: "Snack"
      },
      {
        zh: "椒椒椒椒蟹",
        en: "Four-Pepper Crab",
        price: "¥368",
        note: "Crab in a pepper-heavy sauce with rice cakes underneath. The rice cakes soak up everything the crab leaves.",
        tag: "Crab"
      },
      {
        zh: "级牛小排",
        en: "Premium Beef Short Rib",
        price: "¥398",
        note: "Marbled short rib for the pot — sliced thin, cooked for seconds. Order it if the table is still hungry after the seafood.",
        tag: "Beef"
      },
      {
        zh: "招牌堂捞膏蟹粉丝",
        en: "Signature Roe Crab with Glass Noodles",
        price: "¥688",
        note: "Crab roe and glass noodles tossed at the table. The noodles are the point; the crab is what flavours them.",
        tag: "Crab"
      },
      {
        zh: "特级刺身拼盘",
        en: "Premium Sashimi Platter",
        price: "¥1,098",
        note: "Salmon, toro and foie gras on ice. The most expensive thing here, and the one for a celebration rather than a Tuesday.",
        tag: "Raw"
      },
    ],
    dishNote: "Prices from the Dianping listing. The hot pot is priced by what you add, so the bill moves — confirm before the seafood goes in. The 100-yuan voucher sells for ¥81.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Science Park branch — ranked by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "One room in Nanshan Science Park. The group has other names in Shenzhen; this page covers the 紫隐九州 branch, which is the one with the ranking.",
    sources: [
      { label: "Dianping — 火玺·紫隐九州", url: "https://www.dianping.com/" }
    ]
  },
{
    slug: "kapok-cocopark",
    city: "shenzhen",
    status: "want",
    nameEn: "Kapok",
    nameZh: "木棉·初恋咕噜肉",
    locEn: "COCO Park, Futian",
    locZh: "COCO Park 店",
    cuisine: "Guangzhou home cooking",
    cuisineZh: "广州菜",
    price: "¥110–160 per person",
    area: "Shopping Park, Futian",
    addressEn: "L4-002, Phase 1, Futian Galaxy COCO Park, Futian District — 360 m from Shopping Park station exit F",
    addressZh: "福田区福华路福田星河COCO Park一期L4-002号（购物公园站F口步行约360米）",
    tagline: "Guangzhou home cooking in a shopping mall, with a sweet-and-sour pork that has its own fan club.",
    card: "No. 2 Guangzhou restaurant in Futian, 4.6 from 9,500 reviews, ¥112 a head. Order the pork, the tea-smoked chicken, and the straw-fired pigeon.",
    awards: [
      { mark: "2", label: "No. 2 Guangzhou Restaurant in Futian", note: "Dianping 好评榜" },
      { mark: "4.6", label: "Dianping 4.6 / 5", note: "9,564 reviews at the time of listing" }
    ],
    story: [
      "木棉 is a Guangzhou-cuisine restaurant on the fourth floor of COCO Park in Futian — six years old, busy every night, and priced so that a family can eat without thinking about it: ¥112 a head.",
      "The menu is Guangzhou home cooking with a bit of theatre. The signature is 初恋咕噜肉, sweet-and-sour pork served on a hot stone so the sauce keeps caramelising as you eat it. The pigeon arrives with rice straw and is lit at the table. The chicken is smoked over Longjing tea.",
      "It is a mall restaurant, and it behaves like one — queues, a buzzer, tables turned quickly — but the cooking is not mall food. The vegetables get as much attention as the meat: lard-fried choy sum, salted egg yolk with loofah, plain blanched greens.",
      "One quirk worth knowing: the Dianping list includes the same smoked chicken twice, at No. 2 and No. 7. Order it once."
    ],
    whyFamous: [
      "No. 2 Guangzhou restaurant in Futian on Dianping's 好评榜.",
      "初恋咕噜肉 — sweet-and-sour pork on a hot stone, the dish the restaurant is named for.",
      "Straw-fired pigeon lit at the table; Longjing tea-smoked chicken.",
      "Vegetable dishes treated as proper orders, not garnish."
    ],
    quote: { text: "The pork keeps cooking on the stone while you eat it. That is the trick.", cite: "Why the stone matters" },
    dishes: [
      {
        zh: "初恋咕噜肉",
        en: "First-Love Sweet-and-Sour Pork",
        price: "¥88",
        note: "The dish the restaurant is named after: pork in a fruit-sweet sauce, served on a hot stone so it keeps caramelising at the table.",
        tag: "No. 1"
      },
      {
        zh: "龙井烟熏太爷鸡",
        en: "Longjing Tea-Smoked Chicken",
        price: "¥98",
        note: "Smoked over tea leaves — the smoke is light, the tea is what stays. Half a bird is enough for three.",
        tag: "No. 2"
      },
      {
        zh: "厚切岩烧牛舌",
        en: "Thick-Cut Stone-Grilled Beef Tongue",
        price: "¥138",
        note: "Cut thick, grilled on stone, still pink in the middle. The most expensive thing in the ten.",
        tag: "Grill"
      },
      {
        zh: "禾秆草烧乳鸽",
        en: "Straw-Fired Pigeon",
        price: "¥58",
        note: "Brought to the table with rice straw, then lit with a torch in front of you. The smoke is the point; the pigeon is good too.",
        tag: "Theatre"
      },
      {
        zh: "猪油渣炒菜心",
        en: "Choy Sum Fried with Lard Croutons",
        price: "¥48",
        note: "Bitter greens, crisp lard, wok heat. The vegetable that makes the table feel like a Cantonese home.",
        tag: "Vegetable"
      },
      {
        zh: "煲仔金沙焗丝瓜",
        en: "Claypot Salted-Egg Yolk Loofah",
        price: "¥58",
        note: "Salted egg yolk clinging to loofah in a claypot. Rich and sweet at once — order it with the smoked chicken.",
        tag: "Vegetable"
      },
      {
        zh: "龙井烟熏鸡",
        en: "Longjing Smoked Chicken (short name)",
        price: "",
        note: "The app lists this twice — same dish as No. 2 under its shorter name. Order one, not both.",
        tag: "Duplicate"
      },
      {
        zh: "紫苏啫啫跳跳蛙",
        en: "Perilla Sizzling Frog",
        price: "¥58",
        note: "Frog in a perilla-heavy sauce, served still bubbling. Loud, garlicky, and the dish the regulars fight over.",
        tag: "Sizzling"
      },
      {
        zh: "盐水菜心",
        en: "Salted-Water Choy Sum",
        price: "¥48",
        note: "The plain version: greens blanched in salted water, nothing else. Order it after the fried dishes.",
        tag: "Vegetable"
      },
      {
        zh: "手工冰镇鲍鱼",
        en: "Hand-Made Iced Abalone",
        price: "¥68",
        note: "Abalone served over ice — firm, clean, plated like a small sculpture. A cold dish between the hot ones.",
        tag: "Cold"
      },
    ],
    dishNote: "Prices from the Dianping listing. The set menus are good value: ¥238 for the autumn two-to-three-person set and ¥904 for the six-person banquet. The 300-yuan voucher sells for ¥289.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the COCO Park branch — ranked by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "One room in COCO Park, Futian. The brand has other branches in Shenzhen; this page covers the one with the ranking.",
    sources: [
      { label: "Dianping — 木棉·初恋咕噜肉（COCO Park店）", url: "https://www.dianping.com/" }
    ]
  },
{
    slug: "xu-ji-seafood",
    city: "shenzhen",
    status: "want",
    nameEn: "Xu Ji Seafood",
    nameZh: "徐记海鲜·始于1999",
    locEn: "Science Park, Nanshan",
    locZh: "科技园店",
    cuisine: "Seafood",
    cuisineZh: "海鲜",
    price: "¥220–350 per person",
    area: "Science Park, Nanshan",
    addressEn: "1–2/F Block B, Fu'an Technology Building, Gaoxin South 1st Road, Nanshan — 600 m from Hi-Tech Park station exit C",
    addressZh: "南山区高新南一道赋安科技大厦B座一二楼（地铁高新园站C口步行约600米）",
    tagline: "A seafood chain that started in 1999, doing Cantonese-style fish in a Science Park office block.",
    card: "No. 1 seafood restaurant for environment in Science Park, 4.9 from 3,958 reviews. Order the baked fish rice and the scallops.",
    awards: [
      { mark: "1", label: "No. 1 Seafood Restaurant for Environment, Science Park", note: "Dianping 环境榜" },
      { mark: "4.9", label: "Dianping 4.9 / 5", note: "3,958 reviews at the time of listing" }
    ],
    story: [
      "徐记海鲜 has been running since 1999 and is now a chain — the kind of seafood restaurant that builds its menu around a tank room rather than a fixed list. This branch occupies the first two floors of the Fu'an Technology Building in Science Park, and it is the top-ranked seafood room in the district for environment.",
      "The cooking is Cantonese-leaning: whole fish steamed, clams wok-fried with ginger and scallion, crab over glass noodles. The prices are Hong Kong-style — you pay for the fish you point at — but the floor is set up for business lunches, with private rooms and free parking.",
      "The order to know about is 船家海鱼焗饭 at ¥78: rice baked in a claypot with sea fish, the crust scraped up at the end. It is the cheapest way to eat well here, and it is the top-ranked dish on the app.",
      "Two value notes: the ¥38 Zhangzidao scallops are palm-sized, and the ¥36 walnut bun is the dessert everyone photographs."
    ],
    whyFamous: [
      "No. 1 seafood restaurant for environment in Science Park on Dianping.",
      "4.9 across 3,958 reviews — high for a tank-and-scale seafood room.",
      "船家海鱼焗饭 — the baked fish rice that tops the app's list at ¥78.",
      "A 1999-founded chain with private rooms, free parking, and a menu built for business lunches."
    ],
    quote: { text: "Point at the fish, agree the price, then order the ¥78 baked rice anyway.", cite: "How to eat here" },
    dishes: [
      {
        zh: "船家海鱼焗饭",
        en: "Boatman's Baked Rice with Sea Fish",
        price: "¥78",
        note: "The top order: rice baked in a claypot with fish and its juices. The crust at the bottom is the reason to order it.",
        tag: "No. 1"
      },
      {
        zh: "清蒸老虎斑",
        en: "Steamed Tiger Grouper",
        price: "¥168",
        note: "Whole fish, ginger and scallion, hot oil at the end. The test of a seafood kitchen, and the safest expensive order.",
        tag: "Fish"
      },
      {
        zh: "姜葱炒东海圣子",
        en: "Wok-Fried Razor Clams with Ginger and Scallion",
        price: "¥98",
        note: "Big clams, fast wok, ginger and scallion rather than sauce. Eat them while they are still hot enough to sting.",
        tag: "Wok"
      },
      {
        zh: "蒜蓉粉丝蒸松叶蟹",
        en: "Steamed Spider Crab with Garlic and Vermicelli",
        price: "¥368",
        note: "Crab over glass noodles that soak up everything. The best value among the big seafood plates.",
        tag: "Crab"
      },
      {
        zh: "徐记辣酒煮花螺",
        en: "Spicy Wine-Braised Sea Snails",
        price: "¥168",
        note: "Snails in a red, chilli-heavy broth with cooking wine. Order it with beer, not tea.",
        tag: "Spicy"
      },
      {
        zh: "招牌核桃包",
        en: "Signature Walnut Bun",
        price: "¥36",
        note: "A steamed bun shaped like a walnut, filled with walnut and white chocolate. The dessert that arrives before you ask.",
        tag: "Dessert"
      },
      {
        zh: "脆皮咸香鸡",
        en: "Crisp-Skin Salted Chicken",
        price: "¥188",
        note: "Skin crackles when you bite it, meat stays juicy. Half a bird for three.",
        tag: "Roast"
      },
      {
        zh: "堂灼鱼汤鲜贝",
        en: "Scallops Poached in Fish Broth",
        price: "¥58",
        note: "Hot fish broth poured over raw scallop at the table. The broth tastes strongly of crucian carp — in a good way.",
        tag: "Soup"
      },
      {
        zh: "拍蒜紫苏炒金牌龙虾",
        en: "Lobster with Garlic and Perilla",
        price: "¥338",
        note: "Lobster wok-fried with smashed garlic and perilla. The perilla is what makes it different from every other lobster on the coast.",
        tag: "Crab"
      },
      {
        zh: "蒜茸粉丝蒸獐子岛元贝",
        en: "Steamed Zhangzidao Scallops with Garlic and Vermicelli",
        price: "¥38",
        note: "Palm-sized scallops under golden garlic and glass noodles. At ¥38, the bargain of the menu.",
        tag: "Shellfish"
      },
    ],
    dishNote: "Prices from the Dianping listing. Live seafood is priced by weight — confirm before it goes in the tank bag. The ¥360 set for two (海鱼焗饭鱼鲜双人餐) is the value order.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Science Park branch — ranked by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "A chain founded in 1999 with rooms across several cities. This page covers the Science Park branch, which is the one with the district ranking.",
    sources: [
      { label: "Dianping — 徐记海鲜（科技园店）", url: "https://www.dianping.com/" }
    ]
  },
{
    slug: "xiao-nan-ji",
    city: "shenzhen",
    status: "want",
    nameEn: "Xiao Nan Ji",
    nameZh: "小煵记·深圳本地菜",
    locEn: "Nanxin Road, Nanshan",
    locZh: "南新店",
    cuisine: "Shenzhen local Cantonese",
    cuisineZh: "粤菜・深圳本地菜",
    price: "¥120–180 per person",
    area: "Nanshan centre",
    addressEn: "106 Nantai Building, Tianxia community, Nanshan — 490 m from Daxin station exit D",
    addressZh: "南山区田厦社区南台大厦106（地铁1号线大新站D口步行约490米）",
    tagline: "Seventeen years of Shenzhen local cooking, open until midnight, on the 2026 Must-Eat List.",
    card: "2026 Must-Eat List, 4.4 from 12,800 reviews. Order the soy prawns, the salt-and-pepper fish, and the iced lemon tea.",
    awards: [
      { mark: "必", label: "Dianping Must-Eat List 2026", note: "2026 上榜餐厅" },
      { mark: "4.4", label: "Dianping 4.4 / 5", note: "12,799 reviews at the time of listing" }
    ],
    story: [
      "小煵记 has been cooking what it calls 深圳本地菜 for seventeen years — Shenzhen local food, which in practice means old Cantonese with a bit of Hakka and Chaozhou in it, cooked in a big, loud room that stays open until midnight.",
      "The menu is built for sharing and for beer: soy-sauce prawns, salt-and-pepper nine-bar fish, black-bean chicken in a claypot, salt-baked baby crab. Nothing is plated for a photograph; everything is plated for a table of six.",
      "It made the 2026 Must-Eat List, and the volume tells its own story — 12,799 reviews at 4.4, with the iced lemon tea outselling every dish (9,000 in six months). That is what a neighbourhood institution looks like: not a destination, a habit.",
      "One practical thing: the room is busy from 6pm and stays busy. Go late rather than early."
    ],
    whyFamous: [
      "2026 Dianping Must-Eat List — seventeen years in, still on it.",
      "豉油皇大虾 — the most-ordered dish, 7,000 sold in six months.",
      "Open until midnight, which in Nanshan is a public service.",
      "A neighbourhood institution: 12,799 reviews, iced lemon tea outselling everything."
    ],
    quote: { text: "Not a destination — a habit. The lemon tea outsells every dish on the menu.", cite: "What the numbers say" },
    dishes: [
      {
        zh: "豉油皇大虾",
        en: "Prawns in Master Soy Sauce",
        price: "¥94",
        note: "The top order — 135 likes and 7,000 sold in six months. Shell-on, wok-heavy, sweet at the edges; eat them with your hands.",
        tag: "No. 1"
      },
      {
        zh: "椒盐九肚鱼",
        en: "Salt-and-Pepper Bombay Duck",
        price: "¥39",
        note: "Nine-bar fish fried in a salt-and-pepper crust, soft enough to eat without noticing the bones. 5,000 sold in six months.",
        tag: "No. 2"
      },
      {
        zh: "豆豉鸡",
        en: "Black-Bean Chicken",
        price: "¥88",
        note: "Claypot chicken with fermented black beans — skin caramelised, meat still juicy. The most Cantonese thing on the menu.",
        tag: "No. 3"
      },
      {
        zh: "冻柠茶",
        en: "Iced Lemon Tea",
        price: "¥18",
        note: "9,000 sold in six months, more than any dish. Strong tea, lemon, crushed ice — the reason people come at midnight.",
        tag: "Drink"
      },
      {
        zh: "炒圣子皇",
        en: "Wok-Fried Razor Clams",
        price: "¥98",
        note: "Fat clams, no grit, ginger and scallion. A test of the kitchen's seafood handling.",
        tag: "Wok"
      },
      {
        zh: "盐焗奄仔蟹",
        en: "Salt-Baked Baby Mud Crab",
        price: "¥138",
        note: "Young crab baked in coarse salt; the roe turns to liquid butter. Order it in season.",
        tag: "Crab"
      },
      {
        zh: "咕噜肉",
        en: "Sweet-and-Sour Pork",
        price: "¥68",
        note: "Crisp outside, sweet-sour balanced rather than cloying. The dish that tells you the wok is hot.",
        tag: "Classic"
      },
      {
        zh: "椒丝腐乳通菜",
        en: "Water Spinach with Chilli and Fermented Bean Curd",
        price: "",
        note: "Morning glory fried with fermented bean curd — funky, salty, the correct vegetable for this table.",
        tag: "Vegetable"
      },
      {
        zh: "芥兰炒双宝",
        en: "Gai Lan with Two Delicacies",
        price: "¥68",
        note: "Chinese broccoli with two kinds of offal, wok-fried until the stems squeak.",
        tag: "Vegetable"
      },
      {
        zh: "南记煎鸭",
        en: "Nan Ji Pan-Fried Duck",
        price: "¥188",
        note: "The house legacy dish: duck braised then pan-fried, dry outside rather than fatty. Order it for the table.",
        tag: "Legacy"
      },
    ],
    dishNote: "Prices from the Dianping listing; the water spinach is market-priced. The set menus are the value: ¥190 for the two-person 本地炒菜 set and ¥390 for four. The 50-yuan voucher sells for ¥40.5.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Nanxin Road branch — ranked by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "One room on Nanxin Road, in Nanshan. The brand has other branches in Shenzhen; this page covers the original, which is the one on the Must-Eat List.",
    sources: [
      { label: "Dianping — 小煵记·深圳本地菜（南新店）", url: "https://www.dianping.com/" }
    ]
  },
{
    slug: "yuejinghui",
    city: "shenzhen",
    status: "want",
    nameEn: "Yuejinghui Seafood Restaurant",
    nameZh: "悦景汇海鲜酒家·粤菜·早茶",
    locEn: "Yuehaimen, Nanshan",
    locZh: "深圳首店",
    cuisine: "Cantonese seafood and morning tea",
    cuisineZh: "粤菜・早茶",
    price: "¥240–350 per person",
    area: "Science Park, Nanshan",
    addressEn: "2–3/F, Caixun Technology Building, Nanshan — 90 m from Yuehaimen station exit E",
    addressZh: "南山区彩讯科技大厦2—3楼（粤海门站E/F2出口，步行约90米）",
    tagline: "Morning tea and banquet seafood on the second floor of a Nanshan office tower.",
    card: "4.7 from 3,343 reviews, ¥238 a head. Order the pigeon, the shrimp dumpling, and the char siu — the dim sum is the reason to come early.",
    awards: [
      { mark: "4.7", label: "Dianping 4.7 / 5", note: "3,343 reviews at the time of listing" }
    ],
    story: [
      "悦景汇 occupies the second and third floors of the Caixun Technology Building in Nanshan, ninety metres from Yuehaimen station. It is a proper Cantonese 酒家: white cloths, private rooms, ten-person tables, and a morning-tea service that runs from 09:30 to 15:00 before the seafood dinner shift begins.",
      "The menu is a banquet menu, which means it is wider than it is deep. Cantonese classics — 红烧乳鸽, 秘制叉烧, 虾饺 — sit next to a Chaoshan clam dish, a Hunan stir-fry, and a Beijing-style fruitwood duck carved at the table. That range is normal for a room built to host family lunches and company dinners.",
      "The dim sum is the reason to come early: the shrimp dumpling is ¥29 and properly made, and the crisp-topped char siu bun is worth the mess. In the evening the duck and the herbal chicken take over.",
      "One quirk: the Dianping list includes the fruitwood duck twice, as 烤鸭 and 片皮鸭. It is one order — carved at the table — so do not order both."
    ],
    whyFamous: [
      "Morning tea from 09:30 to 15:00, in a district where that is rare.",
      "4.7 across 3,343 reviews — a banquet room that still satisfies à la carte diners.",
      "Fruitwood duck carved at the table, and a ¥29 shrimp dumpling that punches above it.",
      "A genuinely wide menu: Cantonese, Chaoshan, Hunan and Beijing in one kitchen."
    ],
    quote: { text: "Come for yum cha, stay for the duck. Do not order the duck twice.", cite: "How to eat here" },
    dishes: [
      {
        zh: "红烧乳鸽",
        en: "Red-Braised Pigeon",
        price: "¥68",
        note: "The top order: braised then glazed, skin sticky, meat still pink. The best value on a banquet menu.",
        tag: "No. 1"
      },
      {
        zh: "悦景汇虾饺皇",
        en: "Yuejinghui Shrimp Dumpling",
        price: "¥29",
        note: "Wrapper translucent enough to see the shrimp through it. Three to a basket — order two baskets.",
        tag: "No. 2"
      },
      {
        zh: "秘制叉烧",
        en: "Secret-Recipe Char Siu",
        price: "¥128",
        note: "Thick-cut, charred at the edges, honeyed but not sweet. The dish to judge the barbecue section by.",
        tag: "No. 3"
      },
      {
        zh: "金不换炒薄壳",
        en: "Wok-Fried Clams with Thai Basil",
        price: "¥68",
        note: "A Chaoshan dish — tiny clams, Thai basil, a lot of wok heat. Order it with beer.",
        tag: "No. 4"
      },
      {
        zh: "农家小炒肉",
        en: "Farmhouse Stir-Fried Pork",
        price: "¥68",
        note: "Hunan-style, chilli-heavy, thin pork with green peppers. The one non-Cantonese dish everyone orders.",
        tag: "No. 5"
      },
      {
        zh: "酥皮叉烧包",
        en: "Crisp-Topped Char Siu Bun",
        price: "¥84",
        note: "A thousand-layer crust over char siu — the pastry shatters when you pick it up. Share, or wear it.",
        tag: "No. 6"
      },
      {
        zh: "果木烤鸭",
        en: "Fruitwood Roast Duck",
        price: "¥238",
        note: "Carved at the table, skin first. The room's showpiece and the reason to book a big table.",
        tag: "No. 7"
      },
      {
        zh: "药膳水晶鸡",
        en: "Herbal Crystal Chicken",
        price: "¥256",
        note: "Poached chicken in a herb broth, served cold. Skin springy, meat faintly medicinal — in the right way.",
        tag: "No. 8"
      },
      {
        zh: "西柚汁焗生蚝",
        en: "Baked Oyster with Grapefruit Juice",
        price: "¥69",
        note: "Oyster baked under a citrus crust. The acidity cuts the cheese and the oyster's richness.",
        tag: "No. 9"
      },
      {
        zh: "果木烤片皮鸭",
        en: "Fruitwood Sliced Duck (same duck, second listing)",
        price: "¥238",
        note: "The app lists the duck twice, once as 烤鸭 and once as 片皮鸭. It is one order, carved at the table — do not order both.",
        tag: "Duplicate"
      },
    ],
    dishNote: "Prices from the Dianping listing. The set menus are the value: ¥180 for the two-to-three-person Chaozhou set, ¥480 for the four-person dim sum set, and ¥3,680 for the ten-person banquet. The 100-yuan voucher sells for ¥84.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Shenzhen first store — ranked by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "The Shenzhen first store, next to Yuehaimen station. The group runs banquet rooms in other cities; this page covers the Shenzhen one.",
    sources: [
      { label: "Dianping — 悦景汇海鲜酒家（深圳首店）", url: "https://www.dianping.com/" }
    ]
  },
{
    slug: "da-ge-fan",
    city: "shenzhen",
    status: "want",
    nameEn: "Da Ge Fan",
    nameZh: "大鸽饭",
    locEn: "COCO Park, Futian",
    locZh: "福田 COCO Park 店",
    cuisine: "Cantonese pigeon specialist",
    cuisineZh: "粤菜・鸽",
    price: "¥120–170 per person",
    area: "Shopping Park, Futian",
    addressEn: "L3C-021, Phase 1, Futian Galaxy COCO Park, 268 Fuhua 3rd Road, Futian — 90 m from Shopping Park station exit C",
    addressZh: "福田区福华三路268号福田星河COCO Park一期3层L3C-021（购物公园站C口步行约90米）",
    tagline: "Pigeon three ways, from a restaurant with its own pigeon farm.",
    card: "No. 1 in the COCO Park food chart, 4.8 from 13,300 reviews. Order the braised pigeon, the pigeon rice, and the broth rice.",
    awards: [
      { mark: "1", label: "No. 1 Restaurant in the COCO Park Food Chart", note: "Dianping 热门榜" },
      { mark: "4.8", label: "Dianping 4.8 / 5", note: "13,303 reviews at the time of listing" }
    ],
    story: [
      "大鸽饭 does one thing and does it in quantity: pigeon. The banner in the shop promises a 自有鸽场 — its own pigeon farm — with birds killed daily, which is why the skin is still tight and the meat has not started to loosen.",
      "There are three classic preparations: 红烧 (braised and glazed), 盐焗 (baked in coarse salt) and 生炸 (deep-fried). Each comes in a 鸽皇 size at ¥59 and, for the salt-baked version, a smaller ¥23 bird. Order two preparations between three people and compare — that is the point of the place.",
      "The rice is the other half of the name. 大鸽饭 at ¥19 is rice cooked with pigeon fat and a little meat; 黑松露大鸽饭 at ¥69 adds truffle and a claypot crust worth fighting over. The 鸽汤泡饭 at ¥89 is the gentler option — milky broth poured over rice.",
      "It is a mall restaurant on the third floor of COCO Park, three years old, and currently No. 1 in the complex's food chart. Book, or go early — the queue starts before service."
    ],
    whyFamous: [
      "Its own pigeon farm, daily kill — the banner's claim, and the reason the skin is good.",
      "Three preparations of pigeon, each available in two sizes.",
      "黑松露大鸽饭 — claypot rice with pigeon and truffle, mixed at the table.",
      "No. 1 in the COCO Park food chart, 4.8 across 13,303 reviews."
    ],
    quote: { text: "Order two preparations and compare. That is the reason to come with three people.", cite: "How to order" },
    dishes: [
      {
        zh: "爆汁红烧鸽皇",
        en: "Juicy Red-Braised Pigeon",
        price: "¥59",
        note: "The dish with 590 likes — by far the most-ordered thing here. Skin lacquered, juice running the moment you bite. Eat it with your hands.",
        tag: "No. 1"
      },
      {
        zh: "黑松露大鸽饭",
        en: "Black Truffle Pigeon Rice",
        price: "¥69",
        note: "Claypot rice with pigeon and truffle, mixed at the table. The truffle is a gimmick that works; the crust at the bottom is the real prize.",
        tag: "No. 2"
      },
      {
        zh: "传统盐焗鸽皇",
        en: "Traditional Salt-Baked Pigeon",
        price: "¥59",
        note: "Baked in coarse salt, skin crackling, meat falling off the bone. The purist's order of the three.",
        tag: "No. 3"
      },
      {
        zh: "大鸽饭",
        en: "Pigeon Rice",
        price: "¥19",
        note: "The namesake, and the cheapest way in: rice cooked with pigeon fat and a little meat. Order it alongside a whole bird.",
        tag: "No. 4"
      },
      {
        zh: "传统生炸红烧鸽",
        en: "Traditional Deep-Fried Red Pigeon",
        price: "¥59",
        note: "Fried rather than braised — drier skin, deeper colour, more crunch. The one to order if you like texture over juice.",
        tag: "No. 5"
      },
      {
        zh: "红葱头焗排骨",
        en: "Baked Pork Ribs with Shallots",
        price: "¥69",
        note: "The non-pigeon dish everyone orders. Shallots cook down into the ribs until everything is sweet and soft.",
        tag: "No. 6"
      },
      {
        zh: "鸽汤泡饭",
        en: "Pigeon Broth Rice",
        price: "¥89",
        note: "Milky pigeon broth poured over rice. Gentle, restorative, and the thing to order after two fried birds.",
        tag: "No. 7"
      },
      {
        zh: "经典盐焗鸽",
        en: "Classic Salt-Baked Pigeon (smaller)",
        price: "¥23",
        note: "The smaller salt-baked bird. Order it if there are two of you and you want a third preparation without committing to a 鸽皇.",
        tag: "No. 8"
      },
      {
        zh: "菜心炒鸽杂",
        en: "Choy Sum with Pigeon Offal",
        price: "¥56",
        note: "Liver, gizzard and heart wok-fried with greens. The dish that proves the farm is real — nothing is wasted.",
        tag: "No. 9"
      },
      {
        zh: "和味爽鱼皮",
        en: "Chilled Fish Skin in Soy Dressing",
        price: "¥36",
        note: "Cold, crunchy fish skin with mustard and soy. The palate reset between the pigeons.",
        tag: "No. 10"
      },
    ],
    dishNote: "Prices from the Dianping listing. A whole pigeon feeds one; three people should order two birds, one rice and one vegetable. The 100-yuan voucher is usually available in the app.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Futian COCO Park branch — ranked by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "A chain with its own pigeon farm. This page covers the Futian COCO Park branch; the others run the same short menu.",
    sources: [
      { label: "Dianping — 大鸽饭（福田COCO Park店）", url: "https://www.dianping.com/" }
    ]
  },
{
    slug: "xinxing-restaurant",
    city: "guangzhou",
    status: "want",
    nameEn: "Xinxing Restaurant",
    nameZh: "新兴饭店·非遗粤菜·老字号早茶",
    locEn: "Beijing Road, Tianzi Pier",
    locZh: "北京路天字码头店",
    cuisine: "Cantonese old brand",
    cuisineZh: "广州菜・老字号",
    price: "¥90–130 per person",
    area: "Beijing Road, Yuexiu",
    addressEn: "2/F, 15 Beijing Road, Yuexiu — 150 m from Beijing Road station exit A1",
    addressZh: "越秀区北京路15号2层（地铁北京路站A1口步行约150米）",
    tagline: "A 116-year-old Guangzhou brand, still cooking mutton and roast goose the old way.",
    card: "No. 2 in Beijing Road for repeat customers, 4.6 from 4,900 reviews, ¥92 a head. Order the mutton, the glass-skin goose, and the baked goat milk.",
    awards: [
      { mark: "2", label: "No. 2 Guangzhou Restaurant in Beijing Road", note: "Dianping 回头客榜 — repeat customers" },
      { mark: "4.6", label: "Dianping 4.6 / 5", note: "4,893 reviews at the time of listing" },
      { mark: "非", label: "Intangible Heritage Cantonese", note: "非遗粤菜 — 116 years, per the shop banner" }
    ],
    story: [
      "新兴饭店 has been on Beijing Road for a very long time — its own banner counts 116 years, which puts its founding in the 1910s — and it holds intangible-heritage status for its Cantonese cooking, specifically the mutton dishes.",
      "The menu has two poles. One is mutton: 焖羊 braised until it comes off the bone, 羊杂汤 in a milky broth, and a banquet version with abalone at ¥538. The other is classic Cantonese — glass-skin roast goose, white-cut chicken, steamed fish, and old dim sum like the 榄粉果 that carries the heritage label.",
      "It also does morning tea from 08:00, which is why locals treat it as two restaurants: a yum cha room in the morning, a mutton house at night. The 柚子叉烧餐包 and the baked goat milk belong to the morning; the goose and the claypot belong to the evening.",
      "It is No. 2 in Beijing Road for repeat customers — behind only one other room — which for a 116-year-old address is the metric that matters."
    ],
    whyFamous: [
      "116 years on Beijing Road, with intangible-heritage status for its Cantonese technique.",
      "焖羊 — braised mutton, the dish the restaurant is known for across the city.",
      "玻璃脆皮烧鹅 — glass-skin goose, and a proper old-school dim sum list in the morning.",
      "No. 2 in the district for repeat customers, not tourists."
    ],
    quote: { text: "Two restaurants in one: yum cha in the morning, mutton at night.", cite: "How to use it" },
    dishes: [
      {
        zh: "酥皮焗羊奶",
        en: "Puff-Pastry Baked Goat Milk",
        price: "¥23",
        note: "The top order and the cheapest thing here: hot goat milk under a pastry lid. Sweet, faintly gamey, unlike anything else on the menu.",
        tag: "No. 1"
      },
      {
        zh: "玻璃脆皮烧鹅",
        en: "Glass-Skin Roast Goose",
        price: "¥198",
        note: "The other signature — skin thin enough to see through, fat rendered to a lacquer. Order a quarter for two.",
        tag: "No. 2"
      },
      {
        zh: "非遗娥姐榄粉果",
        en: "Heritage Olive-Shaped Dumpling",
        price: "¥20",
        note: "The dim sum that carries the intangible-heritage label: translucent wrapper, pork and vegetable filling, steamed to order.",
        tag: "No. 3"
      },
      {
        zh: "新兴秘制鲍鱼焖羊",
        en: "Secret-Recipe Braised Mutton with Abalone",
        price: "¥538",
        note: "The banquet version: mutton braised until it falls off the bone, abalone added for sweetness. Order it for four or more.",
        tag: "No. 4"
      },
      {
        zh: "新兴秘制焖羊",
        en: "Secret-Recipe Braised Mutton",
        price: "¥178",
        note: "The dish the restaurant is famous for. Soft enough to pull apart, no gamey edge, sauce thick enough to hold rice.",
        tag: "No. 5"
      },
      {
        zh: "柚子叉烧餐包10只",
        en: "Pomelo Char Siu Buns (10)",
        price: "¥23",
        note: "Ten small buns with a pomelo-sweet char siu filling. The thing to order with morning tea.",
        tag: "No. 6"
      },
      {
        zh: "风味羊杂汤",
        en: "Mutton Offal Soup",
        price: "¥19",
        note: "Milky broth, offal and pickled vegetables. The cheap bowl that explains why the mutton is good.",
        tag: "No. 7"
      },
      {
        zh: "鲜花椒蒸无骨鲫鱼",
        en: "Steamed Boneless Crucian Carp with Sichuan Pepper",
        price: "¥128",
        note: "One fish, two ways: meat steamed, bones fried. The pepper is there to cut the freshwater taste.",
        tag: "No. 8"
      },
      {
        zh: "石烹金汤花胶翅",
        en: "Stone-Cooked Fish Maw in Golden Broth",
        price: "¥68",
        note: "Fish maw in a pumpkin-gold stock, served in a hot stone bowl. Order it as the soup course.",
        tag: "No. 9"
      },
      {
        zh: "葱油淋白切鸡",
        en: "White-Cut Chicken with Scallion Oil",
        price: "¥78",
        note: "Poached chicken, chilled, scallion oil poured over. The control order against the heavier mutton dishes.",
        tag: "No. 10"
      },
    ],
    dishNote: "Prices from the Dianping listing. The sets are good value: ¥153 for the two-person classic dim sum, ¥230 for the Canton Fair selection, and ¥460 for the four-person 'Qing dynasty merchant' banquet. The 100-yuan voucher sells for ¥90.",
    dishSource: "Dianping 推荐菜, TOP 1–10 for the Beijing Road Tianzi Pier branch — ranked by the app's like counts.",
    dishBadge: "Source: Dianping 推荐菜 · TOP 1–10",
    branches: [],
    singleNote: "The Beijing Road room, by Tianzi Pier. The brand is 116 years old and has other addresses in Guangzhou; this page covers the one on the old street.",
    sources: [
      { label: "Dianping — 新兴饭店（北京路天字码头店）", url: "https://www.dianping.com/" }
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

function page({ root, title, description, body, bodyClass = "", extraHead = "", currentCity = "" }) {
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
${topbar(root, currentCity)}
${body}
${footer(root)}
<script src="${root}assets/app.js" defer></script>
</body>
</html>
`;
}

function topbar(root, currentCity = "") {
  const total = RESTAURANTS.length;
  return `<header class="topbar">
  <div class="wrap topbar-inner">
    <a class="brand" href="${root}index.html">
      <span class="brand-en">Ken's Table</span>
      <span class="brand-cn">食單</span>
    </a>
    <nav class="topnav" aria-label="Main">
      <a href="${root}index.html">The list</a>
      <a href="${root}restaurants/index.html" class="hide-sm">All ${total}</a>
      <a href="${root}index.html#how-it-works" class="hide-sm">How it works</a>
    </nav>
  </div>
  <div class="citybar">
    <div class="wrap citybar-inner" role="navigation" aria-label="Cities">
      <span class="citybar-label">City guide</span>
      ${CITIES.map(
        (c) =>
          `<a class="citybar-link" href="${root}cities/${c.key}/index.html" style="--accent:${c.accent}"${currentCity === c.key ? ' aria-current="page"' : ""}>${esc(c.en)}<span>${esc(c.zh)}</span><em>${RESTAURANTS.filter((r) => r.city === c.key).length}</em></a>`
      ).join("")}
      <a class="citybar-link citybar-all" href="${root}restaurants/index.html">All<span>全部</span></a>
    </div>
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
          ${CITIES.map((c) => `<a href="${root}cities/${c.key}/index.html">${esc(c.en)}</a>`).join("")}
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

function card(r, prefix = "") {
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

  return `<a class="card reveal${r.featured ? " card--feature" : ""}" href="${prefix}restaurants/${r.slug}/index.html"
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
        <h2><a href="cities/${c.key}/index.html">${esc(c.en)}</a></h2>
        <span class="city-cn">${esc(c.zh)}</span>
        <a class="city-count city-count-link" href="cities/${c.key}/index.html">${items.length} ${items.length === 1 ? "entry" : "entries"} · city guide →</a>
      </div>
      <div class="grid">${items.map((r) => card(r)).join("\n")}</div>
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
          <p>${RESTAURANTS.length} restaurants, ${CITIES.length} cities, ${RESTAURANTS.filter((r) => r.dishes).length} top tens. Every entry carries its Chinese name, its awards, and whether I have actually eaten there.</p>
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
          <h2 class="section-title">${RESTAURANTS.length} tables to start with</h2>
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
        <div class="grid">${items.map((r) => card(r, root)).join("\n")}</div>
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
   City guide page
   ──────────────────────────────────────────────────────────── */

function buildCity(c, root = "../../") {
  const items = RESTAURANTS.filter((r) => r.city === c.key);
  const features = items.filter((r) => r.dishes).length;
  const orderCards = items.filter((r) => r.orderCard).length;

  const body = `<main id="main">
  <section class="city-hero" style="--accent:${c.accent}">
    <div class="wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb" style="color:var(--muted)">
        <a href="${root}index.html" style="color:var(--ink-soft)">Ken's Table</a><span class="sep">/</span>
        <a href="${root}restaurants/index.html" style="color:var(--ink-soft)">All restaurants</a><span class="sep">/</span>
        <span>${esc(c.en)}</span>
      </nav>
      <p class="eyebrow">City guide <span class="dot"></span> 城市指南</p>
      <h1>${esc(c.en)} <span class="hz">${esc(c.zh)}</span></h1>
      <p class="city-lede">${esc(c.intro)}</p>
      <p class="city-note">${esc(c.note)}</p>
      <div class="city-stats">
        <span><b>${items.length}</b> ${items.length === 1 ? "place" : "places"}</span>
        <span><b>${features}</b> full ${features === 1 ? "feature" : "features"}</span>
        <span><b>${orderCards}</b> with ${orderCards === 1 ? "an order card" : "order cards"}</span>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <div>
          <p class="section-kicker">Eat here</p>
          <h2 class="section-title">${items.length} ${items.length === 1 ? "table" : "tables"} in ${esc(c.en)}</h2>
        </div>
        <p class="section-note">Every card opens the flagship post for that restaurant. Tap “Want to go” to keep score.</p>
      </div>
      <div class="grid">${items.map((r) => card(r, root)).join("\n")}</div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="section-head">
        <div>
          <p class="section-kicker">Keep moving</p>
          <h2 class="section-title">Other cities</h2>
        </div>
      </div>
      <div class="city-switch">
        ${CITIES.filter((x) => x.key !== c.key)
          .map(
            (x) => `<a class="city-switch-item" href="${root}cities/${x.key}/index.html">
              <span class="cs-en">${esc(x.en)}</span>
              <span class="cs-zh">${esc(x.zh)}</span>
              <span class="cs-count">${RESTAURANTS.filter((r) => r.city === x.key).length}</span>
            </a>`
          )
          .join("")}
      </div>
    </div>
  </section>
</main>`;

  return page({
    root,
    title: `${c.en} ${c.zh} — restaurant guide · Ken's Table`,
    description: `${items.length} restaurants in ${c.en}: ${items.map((r) => r.nameEn).join(", ")}.`,
    body,
    currentCity: c.key
  });
}

/* ────────────────────────────────────────────────────────────
   Restaurant detail
   ──────────────────────────────────────────────────────────── */

function buildDetail(r, prev, next, root = "../../") {
  const city = cityOf(r.city);
  const hasDishes = Array.isArray(r.dishes) && r.dishes.length > 0;

  const awardStrip = r.awards.length
    ? `<div class="award-strip">${r.awards
        .map(
          (a) => `<div class="award"><span class="mark">${esc(a.mark)}</span><span>${esc(a.label)}<small>${esc(a.note)}</small></span></div>`
        )
        .join("")}</div>`
    : "";

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
        <p class="prose-sub">${esc(r.dishSource || "The ten dishes that define the house — Chinese name first, English translation under it.")}</p>
        <p class="dish-source">${esc(r.dishBadge || "Source: Dianping 推荐菜 · only the top ten are listed")}</p>
        <ol class="dishlist">
          ${r.dishes
            .map(
              (d) => `<li class="dish">
            <div>
              <div class="dish-zh">${esc(d.zh)}</div>
              <div class="dish-line">
                <span class="dish-en">${esc(d.en)}${d.price ? ` <span class="dish-price">${esc(d.price)}</span>` : ""}</span>
                ${d.tag && d.tag !== "Signature" ? `<span class="dish-tag mild">${esc(d.tag)}</span>` : ""}
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
        <p class="prose-sub">A short list of dishes the house is known for. The full top ten will follow Dianping's 推荐菜 ranking for this branch.</p>
        <div class="single-note" style="margin-bottom:22px">
          <b>Why not ten yet:</b> this post is on the list but has not been written up. Rather than invent a ranking,
          the page shows the dishes that are consistently cited — the top ten arrives, in order, from Dianping's
          推荐菜 list when the feature is written.
        </div>
        <ol class="dishlist">
          ${(r.knownSignatures || [])
            .map(
              (d) => `<li class="dish">
            <div>
              <div class="dish-zh">${esc(d.zh)}</div>
              <div class="dish-line">
                <span class="dish-en">${esc(d.en)}${d.price ? ` <span class="dish-price">${esc(d.price)}</span>` : ""}</span>
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
      ${awardStrip}
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
      ${
        r.ritual
          ? `<div class="ritual">
        <div class="ritual-head"><span>How to eat it</span><span>食法</span></div>
        <h3>${esc(r.ritual.title)}</h3>
        <ol>${r.ritual.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
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
CITIES.forEach((c) => write(`cities/${c.key}/index.html`, buildCity(c, "../../")));

RESTAURANTS.forEach((r, i) => {
  const prev = RESTAURANTS[(i - 1 + RESTAURANTS.length) % RESTAURANTS.length];
  const next = RESTAURANTS[(i + 1) % RESTAURANTS.length];
  write(`restaurants/${r.slug}/index.html`, buildDetail(r, prev, next, "../../"));
});

console.log("done:", RESTAURANTS.length, "restaurants");
