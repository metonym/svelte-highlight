export type YaraPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const yaraPreviewSnippets: YaraPreviewSnippet[] = [
  {
    title: "A suspicious executable rule",
    description: "meta, strings, and condition sections",
    code: `import "pe"

rule SuspiciousExecutable : malware
{
    meta:
        author = "analyst"
        threat = "trojan"

    strings:
        $a = "malicious_string" nocase
        $hex = { E2 34 ?? C8 }
        $re = /evil[0-9]+/i

    condition:
        uint16(0) == 0x5A4D and $a and $hex and pe.number_of_sections > 3
}
`,
  },
  {
    title: "String counts and offsets",
    description: "#, @, and ! string reference operators",
    code: `rule Repeated
{
    strings:
        $a = "AA"

    condition:
        #a > 3 and @a[1] < 100 and !a > 10
}`,
  },
  {
    title: "Module functions",
    description: "the hash and math built-in modules",
    code: `import "hash"
import "math"

rule HighEntropy
{
    condition:
        math.entropy(0, filesize) > 7.0 and
        hash.md5(0, filesize) != ""
}`,
  },
];
