const CQL_KEYWORDS =
  "SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE KEYSPACE TYPE INDEX CUSTOM MATERIALIZED VIEW ALTER DROP TRUNCATE USE GRANT REVOKE BATCH APPLY BEGIN LOGGED UNLOGGED IF NOT EXISTS PRIMARY KEY WITH ALLOW FILTERING ORDER BY ASC DESC LIMIT PER PARTITION USING TTL TIMESTAMP CONSISTENCY LEVEL AND OR IN CONTAINS ENTRY TOKEN CLUSTERING COMPACT STORAGE REPLICATION DURABLE_WRITES ADD RENAME TO COLUMNFAMILY ROLE LOGIN SUPERUSER PASSWORD NOSUPERUSER FUNCTION AGGREGATE LANGUAGE CALLED INPUT RETURNS ON DISTINCT AS JSON DEFAULT UNSET NULL";

const CQL_TYPES =
  "ascii bigint blob boolean counter date decimal double duration float frozen inet int list map set smallint text time timestamp timeuuid tinyint tuple uuid varchar varint";

const CQL_LITERALS = "true false null";

const CQL_FUNCTIONS =
  "count writetime now dateof unixtimestampof totimestamp mintimeuuid maxtimeuuid tounixtimestamp toDate toTimestamp blobasint intasblob";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCql(hljs) {
  const STRING = {
    className: "string",
    begin: /'/,
    end: /'/,
    contains: [{ begin: /''/, relevance: 0 }],
  };

  const DOLLAR_STRING = {
    className: "string",
    begin: /\$\$/,
    end: /\$\$/,
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      { begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const UUID = {
    className: "meta",
    begin:
      /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/,
    relevance: 5,
  };

  const IDENTIFIER = {
    className: "symbol",
    begin: /"/,
    end: /"/,
  };

  const PLACEHOLDER = {
    className: "variable",
    begin: /\?|:[a-zA-Z_]\w*/,
    relevance: 0,
  };

  return {
    name: "CQL",
    aliases: ["cql", "cassandra"],
    case_insensitive: true,
    keywords: {
      keyword: CQL_KEYWORDS,
      type: CQL_TYPES,
      literal: CQL_LITERALS,
      built_in: CQL_FUNCTIONS,
    },
    contains: [
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE,
      { className: "comment", begin: /--/, end: /$/ },
      STRING,
      DOLLAR_STRING,
      IDENTIFIER,
      UUID,
      PLACEHOLDER,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCql(hljs);
}

export const cql = { name: "cql", register };
export default cql;
