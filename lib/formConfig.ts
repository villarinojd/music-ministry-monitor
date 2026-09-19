export const attendanceItems = [
  'Sunday School',
  'AM Service',
  'Discipleship',
  'PM Service',
  'Divided Fellowship',
  'Doctrine Class',
  'Prayer Meeting',
  'Street Soulwinning',
  'Soulwinning/Visitation',
  'Sabbath Class',
];

export const practicesItems = {
  choir: ['Sunday Practice', 'Wednesday Practice', 'Saturday Practice'],
  orchestra: ['Sunday Practice', 'Wednesday Practice', 'Friday Practice', 'Saturday Practice'],
};

export const performancesItems = {
  choir: ['AM Song', 'PM Song', 'Wed Song'],
  orchestra: ['AM Song', 'AM Offertory', 'PM Song', 'PM Offertory', 'Wed Song', 'Wed Offertory'],
};

export const ministryRequirementsItems = ['Uniform', 'Music Sheet', 'Memorized Song', 'Commitment'];

export const personalWalkItems = [
  'Bible Reading (Chapters)',
  'No. of Souls Won',
  'No. of Tracts Distributed',
  'No. of Bible Studies',
  'No. of Good News Classes',
  'No. of Extension Classes',
  'No. of First Time Visitors',
  "Assisted FTV's (Baptism)",
  'Fetching/Ferrying',
  'Tithes',
  'Offering',
];

function unionItems(a: string[], b: string[]): string[] {
  const seen = new Set(a);
  return [...a, ...b.filter((x) => !seen.has(x))];
}

export const allPracticesItems = unionItems(practicesItems.choir, practicesItems.orchestra);
export const allPerformancesItems = unionItems(performancesItems.choir, performancesItems.orchestra);
