export type CrontabPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const crontabPreviewSnippets: CrontabPreviewSnippet[] = [
  {
    title: "A basic crontab",
    description: "environment lines, wildcards, and a step schedule",
    code: `# run backups nightly
SHELL=/bin/bash
MAILTO=admin@example.com

0 2 * * * /usr/local/bin/backup.sh --quiet
*/15 * * * * root /usr/bin/check-disk.sh
0 9 1 JAN-MAR * echo "quarterly report" >> /var/log/report.log
@reboot /usr/local/bin/on-boot.sh
`,
  },
  {
    title: "Named schedules",
    description: "@ nicknames as an alternative to five-field schedules",
    code: `@yearly /usr/local/bin/rotate-logs.sh
@daily /usr/local/bin/cleanup-tmp.sh
@hourly /usr/local/bin/sync-metrics.sh
`,
  },
  {
    title: "Weekday and range fields",
    description: "named weekdays, ranges, and lists in the schedule fields",
    code: `30 8 * * MON-FRI /usr/local/bin/standup-reminder.sh
0 0,12 * * * /usr/local/bin/twice-daily.sh
15 3 1-7 * SUN /usr/local/bin/first-week-report.sh
`,
  },
];
