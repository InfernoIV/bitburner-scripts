/*
Information from:
https://github.com/bitburner-official/bitburner-src/blob/dev/src/CodingContracts.ts
https://github.com/bitburner-official/bitburner-src/blob/dev/src/CodingContractGenerator.ts
https://github.com/bitburner-official/bitburner-src/blob/dev/src/data/codingcontracttypes.ts#L84
*/



/**
 * Reward types that can appear, unclear what the values are???
 */
const reward_type = {
  faction_reputation_all: "", //type: CodingContractRewardType.FactionReputationAll;
  faction_reputation: "", //type: CodingContractRewardType.CompanyReputation; name: string;
  money: "", //type: CodingContractRewardType.Money;
  company_reputation: "" //type: CodingContractRewardType.FactionReputation; name: FactionName;
}



/**
 * Types of contracts that can appear
 */
const contract_type = {
  find_largest_prime_factor: "Find Largest Prime Factor", 
  subarray_with_maximum_sum: "Subarray with Maximum Sum", 
  total_ways_to_sum: "Total Ways to Sum",
  total_ways_to_sum_2: "Total Ways to Sum II",
  spiralize_matrix: "Spiralize Matrix",
  array_jumping_game: "Array Jumping Game",
  array_jumping_game_2: "Array Jumping Game II",
  merge_overlapping_intervals: "Merge Overlapping Intervals",
  generate_ip_addresses: "Generate IP Addresses",
  algorithmic_stock_trader_1: "Algorithmic Stock Trader I",
  algorithmic_stock_trader_2: "Algorithmic Stock Trader II",
  algorithmic_stock_trader_3: "Algorithmic Stock Trader III",
  algorithmic_stock_trader_4: "Algorithmic Stock Trader IV",
  minimum_path_sum_in_a_triangle: "Minimum Path Sum in a Triangle",
  unique_paths_in_a_grid_1: "Unique Paths in a Grid I",
  unique_paths_in_a_grid_2: "Unique Paths in a Grid II",
  shortest_path_in_a_grid: "Shortest Path in a Grid",
  sanitize_parentheses_in_expression: "Sanitize Parentheses in Expression",
  find_all_valid_math_expressions: "Find All Valid Math Expressions",
  hamming_codes_integer_to_encoded_binary: "HammingCodes: Integer to Encoded Binary",
  hamming_codes_encoded_binary_to_integer: "HammingCodes: Encoded Binary to Integer",
  proper_2_coloring_of_a_graph: "Proper 2-Coloring of a Graph",
  compression_1_rle_compression: "Compression I: RLE Compression",
  compression_2_lz_decompression: "Compression II: LZ Decompression",
  compression_3_lz_compression: "Compression III: LZ Compression",
  encryption_1_caesar_cipher: "Encryption I: Caesar Cipher",
  encryption_2_vigenere_cipher: "Encryption II: Vigenère Cipher",
  square_root: "Square Root",
}



/*
 const words = [
        "ARRAY",
        "CACHE",
        "CLOUD",
        "DEBUG",
        "EMAIL",
        "ENTER",
        "FLASH",
        "FRAME",
        "INBOX",
        "LINUX",
        "LOGIC",
        "LOGIN",
        "MACRO",
        "MEDIA",
        "MODEM",
        "MOUSE",
        "PASTE",
        "POPUP",
        "PRINT",
        "QUEUE",
        "SHELL",
        "SHIFT",
        "TABLE",
        "TRASH",
        "VIRUS",
      ];
    name: "Encryption I: Caesar Cipher",

 const words = [
        "ARRAY",
        "CACHE",
        "CLOUD",
        "DEBUG",
        "EMAIL",
        "ENTER",
        "FLASH",
        "FRAME",
        "INBOX",
        "LINUX",
        "LOGIC",
        "LOGIN",
        "MACRO",
        "MEDIA",
        "MODEM",
        "MOUSE",
        "PASTE",
        "POPUP",
        "PRINT",
        "QUEUE",
        "SHELL",
        "SHIFT",
        "TABLE",
        "TRASH",
        "VIRUS",
      ];
      const keys = [
        "ALGORITHM",
        "BANDWIDTH",
        "BLOGGER",
        "BOOKMARK",
        "BROADBAND",
        "BROWSER",
        "CAPTCHA",
        "CLIPBOARD",
        "COMPUTING",
        "COMMAND",
        "COMPILE",
        "COMPRESS",
        "COMPUTER",
        "CONFIGURE",
        "DASHBOARD",
        "DATABASE",
        "DESKTOP",
        "DIGITAL",
        "DOCUMENT",
        "DOWNLOAD",
        "DYNAMIC",
        "EMOTICON",
        "ENCRYPT",
        "EXABYTE",
        "FIREWALL",
        "FIRMWARE",
        "FLAMING",
        "FLOWCHART",
        "FREEWARE",
        "GIGABYTE",
        "GRAPHICS",
        "HARDWARE",
        "HYPERLINK",
        "HYPERTEXT",
        "INTEGER",
        "INTERFACE",
        "INTERNET",
        "ITERATION",
        "JOYSTICK",
        "JUNKMAIL",
        "KEYBOARD",
        "KEYWORD",
        "LURKING",
        "MACINTOSH",
        "MAINFRAME",
        "MALWARE",
        "MONITOR",
        "NETWORK",
        "NOTEBOOK",
        "COMPUTER",
        "OFFLINE",
        "OPERATING",
        "PASSWORD",
        "PHISHING",
        "PLATFORM",
        "PODCAST",
        "PRINTER",
        "PRIVACY",
        "PROCESS",
        "PROGRAM",
        "PROTOCOL",
        "REALTIME",
        "RESTORE",
        "RUNTIME",
        "SCANNER",
        "SECURITY",
        "SHAREWARE",
        "SNAPSHOT",
        "SOFTWARE",
        "SPAMMER",
        "SPYWARE",
        "STORAGE",
        "TERMINAL",
        "TEMPLATE",
        "TERABYTE",
        "TOOLBAR",
        "TYPEFACE",
        "USERNAME",
        "UTILITY",
        "VERSION",
        "VIRTUAL",
        "WEBMASTER",
        "WEBSITE",
        "WINDOWS",
        "WIRELESS",
        "PROCESSOR",
      ];
    name: "Encryption II: Vigenère Cipher",
    
*/


