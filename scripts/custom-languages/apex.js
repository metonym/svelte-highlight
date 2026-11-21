// Keywords shared with Java and C# stay at relevance 0, so Apex only wins
// auto-detection on syntax that is its own: sharing modifiers, DML
// statements, inline SOQL/SOSL, and Salesforce-only types and classes.
const APEX_KEYWORDS =
  "abstract|0 break|0 catch|0 class|0 continue|0 do|0 else|0 enum|0 " +
  "extends|0 final|0 finally|0 for|0 if|0 implements|0 instanceof|0 " +
  "interface|0 new|0 override|0 private|0 protected|0 public|0 return|0 " +
  "static|0 super|0 this|0 throw|0 transient|0 try|0 virtual|0 void|0 " +
  "while|0 switch|0 when|0 get|0 set|0 " +
  "global webservice testmethod " +
  "insert update upsert delete undelete merge";

const APEX_TYPES =
  "blob|0 boolean|0 date|0 datetime decimal|0 double|0 id|0 integer|0 " +
  "long|0 object|0 string|0 time|0 list|0 map|0 sobject";

const APEX_LITERALS = "true false null";

const APEX_BUILT_INS =
  "System Database Schema Limits UserInfo ApexPages Trigger Test " +
  "JSON|0 Math|0 Http|0 HttpRequest|0 HttpResponse|0 EncodingUtil Crypto " +
  "Messaging DmlException QueryException AuraHandledException Label";

const SOQL_KEYWORDS =
  "select from where and or not in includes excludes like limit offset " +
  "order by asc desc nulls first last group rollup cube having with " +
  "security_enforced user_mode system_mode typeof end using scope for " +
  "update view reference tracking all rows find returning network " +
  "snippet metadata data category above below at";

const SOQL_LITERALS =
  "true false null today yesterday tomorrow this_week last_week " +
  "next_week this_month last_month next_month this_quarter this_year " +
  "last_year next_year last_n_days next_n_days";

const SOQL_FUNCTIONS =
  "count count_distinct sum avg min max calendar_year calendar_month " +
  "day_only fiscal_year tolabel format convertcurrency";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineApex(hljs) {
  const STRING = {
    className: "string",
    begin: /'/,
    end: /'/,
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 0,
  };

  // `with sharing`, `without sharing` and `inherited sharing` exist only
  // in Apex.
  const SHARING = {
    className: "keyword",
    begin: /\b(?:with|without|inherited)\s+sharing\b/,
    relevance: 10,
  };

  // Annotations that exist only on the Salesforce platform.
  const PLATFORM_ANNOTATION = {
    className: "meta",
    begin:
      /@(?:AuraEnabled|IsTest|TestSetup|TestVisible|InvocableMethod|InvocableVariable|RemoteAction|RestResource|Http(?:Get|Post|Put|Patch|Delete)|future|NamespaceAccessible)\b/,
    relevance: 10,
  };

  const ANNOTATION = {
    className: "meta",
    begin: /@[a-zA-Z_]\w*/,
    relevance: 0,
  };

  // Salesforce-only members of the platform classes: System.debug,
  // Trigger.new, Database.Batchable, Test.startTest, Schema.SObjectType.
  // Only the class name is matched, as built_in. A lookahead checks the
  // member, so MEMBER still styles `.new` and the rest as plain text.
  const platformMember = (
    /** @type {string} */ owner,
    /** @type {RegExp} */ members,
  ) => ({
    className: "built_in",
    begin: new RegExp(`\\b${owner}(?=\\.${members.source})`),
    relevance: 10,
  });
  const PLATFORM_MEMBERS = [
    platformMember(
      "System",
      /(?:debug|assert(?:Equals|NotEquals)?|runAs|enqueueJob|schedule(?:Batch)?|abortJob)\b/,
    ),
    platformMember(
      "Trigger",
      /(?:new|old|newMap|oldMap|is(?:Before|After|Insert|Update|Delete|Undelete|Executing)|operationType)\b/,
    ),
    platformMember(
      "Database",
      /(?:Batchable(?:Context)?|QueryLocator|getQueryLocator|executeBatch|Stateful|AllowsCallouts|SaveResult|UpsertResult|DeleteResult|DMLOptions|setSavepoint|rollback|countQuery)\b/,
    ),
    platformMember(
      "Test",
      /(?:startTest|stopTest|setMock|isRunningTest|loadData|setCurrentPage|getStandardPricebookId)\b/,
    ),
    platformMember(
      "Schema",
      /(?:SObjectType|SObjectField|Describe(?:SObject|Field)Result|getGlobalDescribe)\b/,
    ),
  ];

  // DML statements: `insert acc;`, `update records;`, `insert new
  // Task(...)`. `delete x;` is left out because JavaScript has it too.
  const DML_STATEMENT = {
    className: "keyword",
    begin:
      /\b(?:insert|update|upsert|undelete)(?=\s+(?:new\s+[a-zA-Z_]|[a-zA-Z_][\w.]*\s*;))/,
    relevance: 5,
  };

  const CLASS_DECL = {
    begin: [/\b(?:class|interface|enum)/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.class" },
    relevance: 0,
  };

  // trigger AccountTrigger on Account (before insert, after update)
  const TRIGGER_DECL = {
    begin: [
      /\btrigger/,
      /\s+/,
      /[a-zA-Z_]\w*/,
      /\s+/,
      /on/,
      /\s+/,
      /[a-zA-Z_]\w*/,
    ],
    beginScope: { 1: "keyword", 3: "title.class", 5: "keyword", 7: "type" },
    relevance: 10,
  };

  const SWITCH_ON = {
    begin: [/\bswitch/, /\s+/, /on\b/],
    beginScope: { 1: "keyword", 3: "keyword" },
    relevance: 0,
  };

  const TRIGGER_EVENT = {
    className: "keyword",
    begin: /\b(?:before|after)\s+(?:insert|update|delete|undelete)\b/,
    relevance: 0,
  };

  // Accessors such as Trigger.new or acc.Name: keep the member name plain
  // instead of matching it against the keyword table.
  const MEMBER = {
    begin: /\.\s*[a-zA-Z_]\w*/,
    relevance: 0,
  };

  const BIND_VARIABLE = {
    className: "variable",
    begin: /:\s*[a-zA-Z_][\w.]*/,
    relevance: 0,
  };

  // [SELECT Id FROM Account WHERE ...] and [FIND 'x' IN ALL FIELDS ...]
  const SOQL = {
    begin: /\[(?=\s*(?:select|find)\b)/,
    end: /\]/,
    keywords: {
      keyword: SOQL_KEYWORDS,
      literal: SOQL_LITERALS,
      built_in: SOQL_FUNCTIONS,
    },
    contains: [STRING, BIND_VARIABLE, hljs.C_NUMBER_MODE],
    relevance: 10,
  };

  return {
    name: "Apex",
    case_insensitive: true,
    keywords: {
      keyword: APEX_KEYWORDS,
      type: APEX_TYPES,
      literal: APEX_LITERALS,
      built_in: APEX_BUILT_INS,
    },
    contains: [
      hljs.COMMENT(/\/\*\*(?!\/)/, /\*\//, {
        contains: [{ className: "doctag", begin: /@[a-zA-Z]+/ }],
        relevance: 0,
      }),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      SOQL,
      SHARING,
      TRIGGER_DECL,
      TRIGGER_EVENT,
      SWITCH_ON,
      CLASS_DECL,
      DML_STATEMENT,
      PLATFORM_ANNOTATION,
      ...PLATFORM_MEMBERS,
      ANNOTATION,
      MEMBER,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineApex(hljs);
}

export const apex = { name: "apex", register };
export default apex;
