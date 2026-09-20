import type { Column } from '@/components/types';

// 模拟数据
export const initialColumns: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [
      {
        id: '1',
        title: 'Redesign marketing homepage',
        description:
          'Compile competitor landing page designs for inspiration. G..',
        assignees: [
          {
            name: 'John',
            initials: 'JD',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          },
          {
            name: 'Sarah',
            initials: 'SA',
            avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          },
        ],
        progress: 0,
        priority: 'Medium',
        attachments: 1,
        comments: 1,
      },
      {
        id: '2',
        title: 'Set up automated backups',
        description:
          'Compile competitor landing page designs for inspiration. G..',
        assignees: [
          {
            name: 'Mike',
            initials: 'MK',
            avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
          },
          {
            name: 'Emma',
            initials: 'EM',
            avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
          },
        ],
        progress: 5,
        priority: 'Low',
        attachments: 0,
        comments: 3,
      },
      {
        id: '3',
        title: 'Implement blog search functionality',
        description:
          'Compile competitor landing page designs for inspiration. G..',
        assignees: [
          {
            name: 'Alex',
            initials: 'AL',
            avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
          },
          {
            name: 'Lisa',
            initials: 'LS',
            avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
          },
        ],
        progress: 0,
        priority: 'Medium',
        attachments: 1,
        comments: 0,
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      {
        id: '4',
        title: 'Dark mode toggle implementation',
        description:
          'Compile competitor landing page designs for inspiration. G..',
        assignees: [
          {
            name: 'Chris',
            initials: 'CH',
            avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
          },
          {
            name: 'Dana',
            initials: 'DA',
            avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
          },
          {
            name: 'Bob',
            initials: 'BB',
            avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
          },
        ],
        progress: 40,
        priority: 'High',
        attachments: 2,
        comments: 6,
      },
      {
        id: '5',
        title: 'Integrate Stripe payment gateway',
        description:
          'Compile competitor landing page designs for inspiration. G..',
        assignees: [
          {
            name: 'Tom',
            initials: 'TM',
            avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
          },
          {
            name: 'Nina',
            initials: 'NI',
            avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
          },
        ],
        progress: 10,
        priority: 'High',
        attachments: 2,
        comments: 4,
      },
      {
        id: '6',
        title: 'Database schema refactoring',
        description:
          'Compile competitor landing page designs for inspiration. G..',
        assignees: [
          {
            name: 'Frank',
            initials: 'FK',
            avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
          },
          {
            name: 'Grace',
            initials: 'GR',
            avatar: 'https://randomuser.me/api/portraits/women/13.jpg',
          },
          {
            name: 'Henry',
            initials: 'HY',
            avatar: 'https://randomuser.me/api/portraits/men/14.jpg',
          },
        ],
        progress: 55,
        priority: 'Medium',
        attachments: 3,
        comments: 2,
      },
      {
        id: '7',
        title: 'Accessibility improvements',
        description:
          'Compile competitor landing page designs for inspiration. G..',
        assignees: [
          {
            name: 'Nate',
            initials: 'NT',
            avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
          },
          {
            name: 'Elena',
            initials: 'EL',
            avatar: 'https://randomuser.me/api/portraits/women/16.jpg',
          },
        ],
        progress: 35,
        priority: 'Low',
        attachments: 1,
        comments: 1,
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      {
        id: '8',
        title: 'Set up CI/CD pipeline',
        description:
          'Compile competitor landing page designs for inspiration. G..',
        assignees: [
          {
            name: 'Eric',
            initials: 'EC',
            avatar: 'https://randomuser.me/api/portraits/men/17.jpg',
          },
          {
            name: 'Gray',
            initials: 'GR',
            avatar: 'https://randomuser.me/api/portraits/women/18.jpg',
          },
        ],
        progress: 100,
        priority: 'High',
        attachments: 2,
        comments: 4,
      },
      {
        id: '9',
        title: 'Initial project setup',
        description:
          'Compile competitor landing page designs for inspiration. G..',
        assignees: [
          {
            name: 'Helen',
            initials: 'HL',
            avatar: 'https://randomuser.me/api/portraits/women/19.jpg',
          },
          {
            name: 'Ben',
            initials: 'BM',
            avatar: 'https://randomuser.me/api/portraits/men/20.jpg',
          },
        ],
        progress: 100,
        priority: 'Medium',
        attachments: 1,
        comments: 2,
      },
    ],
  },
];

// 团队成员
export const teamMembers = [
  { name: 'John', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { name: 'Sarah', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { name: 'Mike', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
];
