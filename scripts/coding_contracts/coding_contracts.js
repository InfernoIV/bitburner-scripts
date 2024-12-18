//common
import * as common from "scripts/common.js"
//config
import * as config from "./config.js"
//data
import * as data from "./data.js"


/**
 * Seperate funtion that scans the network and will resolve coding contracts
 */
export function main(ns) {
  //stub
  init()
  //infinite loop
  while(true) {
    //check for coding contracts
    const contract = check_for_contracts(ns)
    //if a contract has been found
    if (contract != "NONE FOUND") {
      //resolve the contract
      resolve_contract(ns, contract)
    }
    //wait a bit
    await ns.sleep(config.sleep_time)
  }
}



/**
 *
 */
function init(ns) {
  //stub
  //disable logging?
}



/**
 * Function that scans servers and will either return a contract path, or "INVALID"
 */
function check_for_contracts(ns) {
  //set the default value for the contract
  let contract = "NONE FOUND"
  //stub
  //need to find '.cct' file on the root of the server
  return contract
}



/**
 * function that will check the contract type, and will launch the correct function to resolve it
 */
function resolve_contract(ns, contract) {
  switch(contract.type) {

    case data.contract_type.find_largest_prime_factor: find_largest_prime_factor(ns, contract); break
    case data.contract_type.subarray_with_maximum_sum: subarray_with_maximum_sum(ns, contract); break
    case data.contract_type.total_ways_to_sum: total_ways_to_sum(ns, contract); break
    case data.contract_type.total_ways_to_sum_2: total_ways_to_sum_2(ns, contract); break
    case data.contract_type.spiralize_matrix: spiralize_matrix(ns, contract); break
    case data.contract_type.array_jumping_game: array_jumping_game(ns, contract); break
    case data.contract_type.array_jumping_game_2: array_jumping_game_2(ns, contract); break
    case data.contract_type.merge_overlapping_intervals: merge_overlapping_intervals(ns, contract); break
    case data.contract_type.merge_overlapping_intervals: merge_overlapping_intervals(ns, contract); break
    case data.contract_type.generate_ip_addresses: Generate_ip_addresses(ns, contract); break
    case data.contract_type.algorithmic_stock_trader_1: algorithmic_stock_trader_1(ns, contract); break
    case data.contract_type.algorithmic_stock_trader_2: algorithmic_stock_trader_2(ns, contract); break
    case data.contract_type.algorithmic_stock_trader_3: algorithmic_stock_trader_3(ns, contract); break
    case data.contract_type.algorithmic_stock_trader_4: algorithmic_stock_trader_4(ns, contract); break
    case data.contract_type.minimum_path_sum_in_a_triangle: minimum_path_sum_in_a_triangle(ns, contract); break
    case data.contract_type.unique_paths_in_a_grid_1: unique_paths_in_a_grid_1(ns, contract); break
    case data.contract_type.unique_paths_in_a_grid_2: unique_paths_in_a_grid_2(ns, contract); break
    case data.contract_type.shortest_path_in_a_grid: shortest_path_in_a_grid(ns, contract); break
    case data.contract_type.sanitize_parentheses_in_expression: sanitize_parentheses_in_expression(ns, contract); break
    
    case data.contract_type.find_all_valid_math_expressions: find_all_valid_math_expressions(ns, contract); break
    case data.contract_type.hamming_codes_integer_to_encoded_binary: hamming_codes_integer_to_encoded_binary(ns, contract); break
    case data.contract_type.hamming_codes_encoded_binary_to_integer: hamming_codes_encoded_binary_to_integer(ns, contract); break
    case data.contract_type.proper_2_coloring_of_a_graph: proper_2_coloring_of_a_graph(ns, contract); break
    case data.contract_type.compression_1_rle_compression: compression_1_rle_compression(ns, contract); break
    case data.contract_type.compression_2_lz_decompression: compression_2_lz_decompression(ns, contract); break
    case data.contract_type.compression_3_lz_compression: compression_3_lz_compression(ns, contract); break
    
    case data.contract_type.encryption_1_caesar_cipher: encryption_1_caesar_cipher(ns, contract); break
    case data.contract_type.encryption_2_vigenere_cipher: encryption_2_vigenere_cipher(ns, contract); break
    
    case data.contract_type.square_root: square_root(ns, contract); break

  }
}





  //A prime factor is a factor that is a prime number.
  //What is the largest prime factor of ${n}?
function find_largest_prime_factor(ns, contract) { 
  //stub
}


  
  //Given the following integer array, find the contiguous subarray (containing at least one number) which has the largest sum and return that sum.
  //'Sum' refers to the sum of all the numbers in the subarray. ${n.toString()}
function subarray_with_maximum_sum(ns, contract) { 
  //stub
}


  //It is possible write four as a sum in exactly four different ways: 3 + 1, 2 + 2, 2 + 1 + 1, 1 + 1 + 1 + 1
  //How many different distinct ways can the number ${n} be written as a sum of at least two positive integers?
function total_ways_to_sum(ns, contract) { 
  //stub
}


//How many different distinct ways can the number ${n} be written as a sum of integers contained in the set: [${s}]?
//You may use each integer in the set zero or more times.
function total_ways_to_sum_2(ns, contract) { 
  //stub
}




//"Given the following array of arrays of numbers representing a 2D matrix,",
  //      "return the elements of the matrix as an array in spiral order:\n\n",
function spiralize_matrix(ns, contract) { 
  //stub
}


/*
  "You are given the following array of integers:\n\n",
        `${arr}\n\n`,
        "Each element in the array represents your MAXIMUM jump length",
        "at that position. This means that if you are at position i and your",
        "maximum jump length is n, you can jump to any position from",
        "i to i+n.",
        "\n\nAssuming you are initially positioned",
        "at the start of the array, determine whether you are",
        "able to reach the last index.\n\n",
        "Your answer should be submitted as 1 or 0, representing true and false respectively.",
        */
function array_jumping_game(ns, contract) { 
  //stub
}


 
  /*
 "You are given the following array of integers:\n\n",
        `${arr}\n\n`,
        "Each element in the array represents your MAXIMUM jump length",
        "at that position. This means that if you are at position i and your",
        "maximum jump length is n, you can jump to any position from",
        "i to i+n.",
        "\n\nAssuming you are initially positioned",
        "at the start of the array, determine the minimum number of",
        "jumps to reach the end of the array.\n\n",
        "If it's impossible to reach the end, then the answer should be 0.",
        */
function array_jumping_game_2(ns, contract) { 
  //stub
}




function merge_overlapping_intervals(ns, contract) { 
  //stub
}



     /*
"Given the following array of arrays of numbers representing a list of",
        "intervals, merge all overlapping intervals.\n\n",
        `[${convert2DArrayToString(arr)}]\n\n`,
        "Example:\n\n",
        "[[1, 3], [8, 10], [2, 6], [10, 16]]\n\n",
        "would merge into [[1, 6], [8, 16]].\n\n",
        "The intervals must be returned in ASCENDING order.",
        "You can assume that in an interval, the first number will always be",
        "smaller than the second.",
        */
function merge_overlapping_intervals(ns, contract) { 
  //stub
}



 /*
"Given the following string containing only digits, return",
        "an array with all possible valid IP address combinations",
        "that can be created from the string:\n\n",
        `${data}\n\n`,
        "Note that an octet cannot begin with a '0' unless the number",
        "itself is exactly '0'. For example, '192.168.010.1' is not a valid IP.\n\n",
        "Examples:\n\n",
        '25525511135 -> ["255.255.11.135", "255.255.111.35"]\n',
        '1938718066 -> ["193.87.180.66"]',
        */
function generate_ip_addresses(ns, contract) { 
  //stub
}



  /*
"You are given the following array of stock prices (which are numbers)",
        "where the i-th element represents the stock price on day i:\n\n",
        `${data}\n\n`,
        "Determine the maximum possible profit you can earn using at most",
        "one transaction (i.e. you can only buy and sell the stock once). If no profit can be made",
        "then the answer should be 0. Note",
        "that you have to buy the stock before you can sell it.",
        */
function algorithmic_stock_trader_1(ns, contract) { 
  //stub
}



  /*
 "You are given the following array of stock prices (which are numbers)",
        "where the i-th element represents the stock price on day i:\n\n",
        `${data}\n\n`,
        "Determine the maximum possible profit you can earn using as many",
        "transactions as you'd like. A transaction is defined as buying",
        "and then selling one share of the stock. Note that you cannot",
        "engage in multiple transactions at once. In other words, you",
        "must sell the stock before you buy it again.\n\n",
        "If no profit can be made, then the answer should be 0.",
        */
function algorithmic_stock_trader_2(ns, contract) { 
  //stub
}



  /*
"You are given the following array of stock prices (which are numbers)",
        "where the i-th element represents the stock price on day i:\n\n",
        `${data}\n\n`,
        "Determine the maximum possible profit you can earn using at most",
        "two transactions. A transaction is defined as buying",
        "and then selling one share of the stock. Note that you cannot",
        "engage in multiple transactions at once. In other words, you",
        "must sell the stock before you buy it again.\n\n",
        "If no profit can be made, then the answer should be 0.",
        */
function algorithmic_stock_trader_3(ns, contract) { 
  //stub
}



 /*
   "You are given the following array with two elements:\n\n",
        `[${k}, [${prices}]]\n\n`,
        "The first element is an integer k. The second element is an",
        "array of stock prices (which are numbers) where the i-th element",
        "represents the stock price on day i.\n\n",
        "Determine the maximum possible profit you can earn using at most",
        "k transactions. A transaction is defined as buying and then selling",
        "one share of the stock. Note that you cannot engage in multiple",
        "transactions at once. In other words, you must sell the stock before",
        "you can buy it again.\n\n",
        "If no profit can be made, then the answer should be 0.",
        */
function algorithmic_stock_trader_4(ns, contract) { 
  //stub
}



  /*
"Given a triangle, find the minimum path sum from top to bottom. In each step",
        "of the path, you may only move to adjacent numbers in the row below.",
        "The triangle is represented as a 2D array of numbers:\n\n",
        `${triangle}\n\n`,
        "Example: If you are given the following triangle:\n\n[\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[2],\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;[3,4],\n",
        "&nbsp;&nbsp;&nbsp;[6,5,7],\n",
        "&nbsp;&nbsp;[4,1,8,3]\n",
        "]\n\n",
        "The minimum path sum is 11 (2 -> 3 -> 5 -> 1).",
        */
function minimum_path_sum_in_a_triangle(ns, contract) { 
  //stub
}



  /*
    "You are in a grid with",
        `${numRows} rows and ${numColumns} columns, and you are`,
        "positioned in the top-left corner of that grid. You are trying to",
        "reach the bottom-right corner of the grid, but you can only",
        "move down or right on each step. Determine how many",
        "unique paths there are from start to finish.\n\n",
        "NOTE: The data returned for this contract is an array",
        "with the number of rows and columns:\n\n",
        `[${numRows}, ${numColumns}]`,
        */
function unique_paths_in_a_grid_1(ns, contract) { 
  //stub
}



  /*
 "You are located in the top-left corner of the following grid:\n\n",
        `${gridString}\n`,
        "You are trying reach the bottom-right corner of the grid, but you can only",
        "move down or right on each step. Furthermore, there are obstacles on the grid",
        "that you cannot move onto. These obstacles are denoted by '1', while empty",
        "spaces are denoted by 0.\n\n",
        "Determine how many unique paths there are from start to finish.\n\n",
        "NOTE: The data returned for this contract is an 2D array of numbers representing the grid.",
        */
function unique_paths_in_a_grid_2(ns, contract) { 
  //stub
}



/*
"You are located in the top-left corner of the following grid:\n\n",
        `&nbsp;&nbsp;[${data.map((line) => `[${line}]`).join(",\n&nbsp;&nbsp;&nbsp;")}]\n\n`,
        "You are trying to find the shortest path to the bottom-right corner of the grid,",
        "but there are obstacles on the grid that you cannot move onto.",
        "These obstacles are denoted by '1', while empty spaces are denoted by 0.\n\n",
        "Determine the shortest path from start to finish, if one exists.",
        "The answer should be given as a string of UDLR characters, indicating the moves along the path\n\n",
        "NOTE: If there are multiple equally short paths, any of them is accepted as answer.",
        "If there is no path, the answer should be an empty string.\n",
        "NOTE: The data returned for this contract is an 2D array of numbers representing the grid.\n\n",
        "Examples:\n\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;[[0,1,0,0,0],\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[0,0,0,1,0]]\n",
        "\n",
        "Answer: 'DRRURRD'\n\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;[[0,1],\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[1,0]]\n",
        "\n",
        "Answer: ''",
  */
function shortest_path_in_a_grid(ns, contract) { 
  //stub
}


  /*
 "Given the following string:\n\n",
        `${data}\n\n`,
        "remove the minimum number of invalid parentheses in order to validate",
        "the string. If there are multiple minimal ways to validate the string,",
        "provide all of the possible results. The answer should be provided",
        "as an array of strings. If it is impossible to validate the string",
        "the result should be an array with only an empty string.\n\n",
        "IMPORTANT: The string may contain letters, not just parentheses.\n\n",
        `Examples:\n\n`,
        `"()())()" -> ["()()()", "(())()"]\n`,
        `"(a)())()" -> ["(a)()()", "(a())()"]\n`,
        `")(" -> [""]`,
        */
function sanitize_parentheses_in_expression(ns, contract) { 
  //stub
}


  /*
   "You are given the following string which contains only digits between 0 and 9:\n\n",
        `${digits}\n\n`,
        `You are also given a target number of ${target}. Return all possible ways`,
        "you can add the +(add), -(subtract), and *(multiply) operators to the string such",
        "that it evaluates to the target number. (Normal order of operations applies.)\n\n",
        "The provided answer should be an array of strings containing the valid expressions.",
        "The data provided by this problem is an array with two elements. The first element",
        "is the string of digits, while the second element is the target number:\n\n",
        `["${digits}", ${target}]\n\n`,
        "NOTE: The order of evaluation expects script operator precedence.\n",
        "NOTE: Numbers in the expression cannot have leading 0's. In other words,",
        `"1+01" is not a valid expression.\n\n`,
        "Examples:\n\n",
        `Input: digits = "123", target = 6\n`,
        `Output: ["1+2+3", "1*2*3"]\n\n`,
        `Input: digits = "105", target = 5\n`,
        `Output: ["1*0+5", "10-5"]`,
*/
function find_all_valid_math_expressions(ns, contract) { 
  //stub
}


/*
     "You are given the following decimal value: \n",
        `${n} \n\n`,
        "Convert it to a binary representation and encode it as an 'extended Hamming code'.\n ",
        "The number should be converted to a string of '0' and '1' with no leading zeroes.\n",
        "A parity bit is inserted at position 0 and at every position N where N is a power of 2.\n",
        "Parity bits are used to make the total number of '1' bits in a given set of data even.\n",
        "The parity bit at position 0 considers all bits including parity bits.\n",
        "Each parity bit at position 2^N alternately considers 2^N bits then ignores 2^N bits, starting at position 2^N.\n",
        "The endianness of the parity bits is reversed compared to the endianness of the data bits:\n",
        "Data bits are encoded most significant bit first and the parity bits encoded least significant bit first.\n",
        "The parity bit at position 0 is set last.\n\n",
        "Examples:\n\n",
        "8 in binary is 1000, and encodes to 11110000 (pppdpddd - where p is a parity bit and d is a data bit)\n",
        "21 in binary is 10101, and encodes to 1001101011 (pppdpdddpd)\n\n",
        "For more information on the 'rule' of encoding, refer to Wikipedia (https://wikipedia.org/wiki/Hamming_code)",
        "or the 3Blue1Brown videos on Hamming Codes. (https://youtube.com/watch?v=X8jsijhllIA)",
        */
function hamming_codes_integer_to_encoded_binary(ns, contract) { 
  //stub
}



/*
    "You are given the following encoded binary string: \n",
        `'${n}' \n\n`,
        "Decode it as an 'extended Hamming code' and convert it to a decimal value.\n",
        "The binary string may include leading zeroes.\n",
        "A parity bit is inserted at position 0 and at every position N where N is a power of 2.\n",
        "Parity bits are used to make the total number of '1' bits in a given set of data even.\n",
        "The parity bit at position 0 considers all bits including parity bits.\n",
        "Each parity bit at position 2^N alternately considers 2^N bits then ignores 2^N bits, starting at position 2^N.\n",
        "The endianness of the parity bits is reversed compared to the endianness of the data bits:\n",
        "Data bits are encoded most significant bit first and the parity bits encoded least significant bit first.\n",
        "The parity bit at position 0 is set last.\n",
        "There is a ~55% chance for an altered bit at a random index.\n",
        "Find the possible altered bit, fix it and extract the decimal value.\n\n",
        "Examples:\n\n",
        "'11110000' passes the parity checks and has data bits of 1000, which is 8 in binary.\n",
        "'1001101010' fails the parity checks and needs the last bit to be corrected to get '1001101011',",
        "after which the data bits are found to be 10101, which is 21 in binary.\n\n",
        "For more information on the 'rule' of encoding, refer to Wikipedia (https://wikipedia.org/wiki/Hamming_code)",
        "or the 3Blue1Brown videos on Hamming Codes. (https://youtube.com/watch?v=X8jsijhllIA)",
        */
function hamming_codes_encoded_binary_to_integer(ns, contract) { 
  //stub
}




/*
 `You are given the following data, representing a graph:\n`,
        `${JSON.stringify(data)}\n`,
        `Note that "graph", as used here, refers to the field of graph theory, and has`,
        `no relation to statistics or plotting.`,
        `The first element of the data represents the number of vertices in the graph.`,
        `Each vertex is a unique number between 0 and ${data[0] - 1}.`,
        `The next element of the data represents the edges of the graph.`,
        `Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v].`,
        `Note that an edge [u,v] is the same as an edge [v,u], as order does not matter.`,
        `You must construct a 2-coloring of the graph, meaning that you have to assign each`,
        `vertex in the graph a "color", either 0 or 1, such that no two adjacent vertices have`,
        `the same color. Submit your answer in the form of an array, where element i`,
        `represents the color of vertex i. If it is impossible to construct a 2-coloring of`,
        `the given graph, instead submit an empty array.\n\n`,
        `Examples:\n\n`,
        `Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]\n`,
        `Output: [0, 0, 1, 1]\n\n`,
        `Input: [3, [[0, 1], [0, 2], [1, 2]]]\n`,
        `Output: []`,
   */
function proper_2_coloring_of_a_graph(ns, contract) { 
  //stub
}



/*
 "Run-length encoding (RLE) is a data compression technique which encodes data as a series of runs of",
        "a repeated single character. Runs are encoded as a length, followed by the character itself. Lengths",
        "are encoded as a single ASCII digit; runs of 10 characters or more are encoded by splitting them",
        "into multiple runs.\n\n",
        "You are given the following input string:\n",
        `&nbsp; &nbsp; ${plaintext}\n`,
        "Encode it using run-length encoding with the minimum possible output length.\n\n",
        "Examples:\n\n",
        "&nbsp; &nbsp; aaaaabccc &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;-> &nbsp;5a1b3c\n",
        "&nbsp; &nbsp; aAaAaA &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; -> &nbsp;1a1A1a1A1a1A\n",
        "&nbsp; &nbsp; 111112333 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;-> &nbsp;511233\n",
        "&nbsp; &nbsp; zzzzzzzzzzzzzzzzzzz &nbsp;-> &nbsp;9z9z1z &nbsp;(or 9z8z2z, etc.)",
   */
function compression_1_rle_compression(ns, contract) { 
  //stub
}



/*
 "Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to",
        "earlier parts of the data. In this variant of LZ, data is encoded in two types of chunk. Each chunk",
        "begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data,",
        "which is either:\n\n",
        "1. Exactly L characters, which are to be copied directly into the uncompressed data.\n",
        "2. A reference to an earlier part of the uncompressed data. To do this, the length is followed",
        "by a second ASCII digit X: each of the L output characters is a copy of the character X",
        "places before it in the uncompressed data.\n\n",
        "For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character",
        "is the start of a new chunk. The two chunk types alternate, starting with type 1, and the final",
        "chunk may be of either type.\n\n",
        "You are given the following LZ-encoded string:\n",
        `&nbsp; &nbsp; ${compressed}\n`,
        "Decode it and output the original string.\n\n",
        "Example: decoding '5aaabb450723abb' chunk-by-chunk\n\n",
        "&nbsp; &nbsp; 5aaabb &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; -> &nbsp;aaabb\n",
        "&nbsp; &nbsp; 5aaabb45 &nbsp; &nbsp; &nbsp; &nbsp; -> &nbsp;aaabbaaab\n",
        "&nbsp; &nbsp; 5aaabb450 &nbsp; &nbsp; &nbsp; &nbsp;-> &nbsp;aaabbaaab\n",
        "&nbsp; &nbsp; 5aaabb45072 &nbsp; &nbsp; &nbsp;-> &nbsp;aaabbaaababababa\n",
        "&nbsp; &nbsp; 5aaabb450723abb &nbsp;-> &nbsp;aaabbaaababababaabb",
   */
function compression_2_lz_decompression(ns, contract) { 
  //stub
}



/*
"Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to",
        "earlier parts of the data. In this variant of LZ, data is encoded in two types of chunk. Each chunk",
        "begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data,",
        "which is either:\n\n",
        "1. Exactly L characters, which are to be copied directly into the uncompressed data.\n",
        "2. A reference to an earlier part of the uncompressed data. To do this, the length is followed",
        "by a second ASCII digit X: each of the L output characters is a copy of the character X",
        "places before it in the uncompressed data.\n\n",
        "For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character",
        "is the start of a new chunk. The two chunk types alternate, starting with type 1, and the final",
        "chunk may be of either type.\n\n",
        "You are given the following input string:\n",
        `&nbsp; &nbsp; ${plaintext}\n`,
        "Encode it using Lempel-Ziv encoding with the minimum possible output length.\n\n",
        "Examples (some have other possible encodings of minimal length):\n",
        "&nbsp; &nbsp; abracadabra &nbsp; &nbsp; -> &nbsp;7abracad47\n",
        "&nbsp; &nbsp; mississippi &nbsp; &nbsp; -> &nbsp;4miss433ppi\n",
        "&nbsp; &nbsp; aAAaAAaAaAA &nbsp; &nbsp; -> &nbsp;3aAA53035\n",
        "&nbsp; &nbsp; 2718281828 &nbsp; &nbsp; &nbsp;-> &nbsp;627182844\n",
        "&nbsp; &nbsp; abcdefghijk &nbsp; &nbsp; -> &nbsp;9abcdefghi02jk\n",
        "&nbsp; &nbsp; aaaaaaaaaaaa &nbsp; &nbsp;-> &nbsp;3aaa91\n",
        "&nbsp; &nbsp; aaaaaaaaaaaaa &nbsp; -> &nbsp;1a91031\n",
        "&nbsp; &nbsp; aaaaaaaaaaaaaa &nbsp;-> &nbsp;1a91041",
  */
function compression_3_lz_compression(ns, contract) {
  //stub
}



/*
 "Caesar cipher is one of the simplest encryption technique.",
        "It is a type of substitution cipher in which each letter in the plaintext ",
        "is replaced by a letter some fixed number of positions down the alphabet.",
        "For example, with a left shift of 3, D would be replaced by A, ",
        "E would become B, and A would become X (because of rotation).\n\n",
        "You are given an array with two elements:\n",
        `&nbsp;&nbsp;["${data[0]}", ${data[1]}]\n`,
        "The first element is the plaintext, the second element is the left shift value.\n\n",
        "Return the ciphertext as uppercase string. Spaces remains the same.",
   */
function encryption_1_caesar_cipher(ns, contract) {
  //stub
}



/*
"Vigenère cipher is a type of polyalphabetic substitution. It uses ",
"the Vigenère square to encrypt and decrypt plaintext with a keyword.\n\n",
"&nbsp;&nbsp;Vigenère square:\n",
"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A B C D E F G H I J K L M N O P Q R S T U V W X Y Z \n",
"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; +----------------------------------------------------\n",
"&nbsp;&nbsp;&nbsp;&nbsp; A | A B C D E F G H I J K L M N O P Q R S T U V W X Y Z \n",
"&nbsp;&nbsp;&nbsp;&nbsp; B | B C D E F G H I J K L M N O P Q R S T U V W X Y Z A \n",
"&nbsp;&nbsp;&nbsp;&nbsp; C | C D E F G H I J K L M N O P Q R S T U V W X Y Z A B\n",
"&nbsp;&nbsp;&nbsp;&nbsp; D | D E F G H I J K L M N O P Q R S T U V W X Y Z A B C\n",
"&nbsp;&nbsp;&nbsp;&nbsp; E | E F G H I J K L M N O P Q R S T U V W X Y Z A B C D\n",
"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...\n",
"&nbsp;&nbsp;&nbsp;&nbsp; Y | Y Z A B C D E F G H I J K L M N O P Q R S T U V W X\n",
"&nbsp;&nbsp;&nbsp;&nbsp; Z | Z A B C D E F G H I J K L M N O P Q R S T U V W X Y\n\n",
"For encryption each letter of the plaintext is paired with the corresponding letter of a repeating keyword.",
"For example, the plaintext DASHBOARD is encrypted with the keyword LINUX:\n",
"&nbsp;&nbsp; Plaintext: DASHBOARD\n",
"&nbsp;&nbsp; Keyword:&nbsp;&nbsp;&nbsp;LINUXLINU\n",
"So, the first letter D is paired with the first letter of the key L. Therefore, row D and column L of the ",
"Vigenère square are used to get the first cipher letter O. This must be repeated for the whole ciphertext.\n\n",
"You are given an array with two elements:\n",
`&nbsp;&nbsp;["${data[0]}", "${data[1]}"]\n`,
"The first element is the plaintext, the second element is the keyword.\n\n",
"Return the ciphertext as uppercase string.",
*/
function Encryption_2_vigenere_cipher {
  //stub
}



/*
  You are given a ~200 digit BigInt. Find the square root of this number, to the nearest integer.\n
  The input is a BigInt value. The answer must be the string representing the solution's BigInt value. The trailing "n" is not part of the string.\n
  Hint: If you are having trouble, you might consult https://en.wikipedia.org/wiki/Methods_of_computing_square_roots
  
  Input number:
  ${data}`;
*/
function square_root(ns, contract) {
  //stub
}
