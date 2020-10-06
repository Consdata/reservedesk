import {DockStation} from './dock-station';

export const roomsDefinitions = [
  {
    name: 'Sharki',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215391975',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.new
      },
      {
        name: 'B-2',
        dockStation: DockStation.new
      },
      {
        name: 'B-3',
        dockStation: DockStation.new
      },
      {
        name: 'B-4',
        dockStation: DockStation.old
      },
      {
        name: 'B-5',
        dockStation: DockStation.old
      }
    ]
  },
  {
    name: 'Piranie',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392024',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.new
      },
      {
        name: 'B-2',
        dockStation: DockStation.new
      },
      {
        name: 'B-3',
        dockStation: DockStation.new
      },
      {
        name: 'B-4',
        dockStation: DockStation.new
      }
    ]
  },
  {
    name: 'Lemury',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392036',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.old
      },
      {
        name: 'B-2',
        dockStation: DockStation.new
      },
      {
        name: 'B-3',
        dockStation: DockStation.new
      },
      {
        name: 'B-4',
        dockStation: DockStation.old
      }
    ]
  },
  {
    name: 'Komando',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392057',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.new
      },
      {
        name: 'B-2',
        dockStation: DockStation.old
      },
      {
        name: 'B-3',
        dockStation: DockStation.old
      },
      {
        name: 'B-4',
        dockStation: DockStation.old
      }
    ]
  },
  {
    name: 'Orki',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392071',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.old
      },
      {
        name: 'B-2',
        dockStation: DockStation.new
      }
    ]
  },
  {
    name: 'Magicy',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392110',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.old
      },
      {
        name: 'B-2',
        dockStation: DockStation.old
      },
      {
        name: 'B-3',
        dockStation: DockStation.new
      }
    ]
  },
  {
    name: 'Osy',
    wikiLink: 'https://wiki.consdata.pl/pages/viewpage.action?pageId=215392129',
    desks: [
      {
        name: 'B-1',
        dockStation: DockStation.old
      },
      {
        name: 'B-2',
        dockStation: DockStation.unknown
      }
    ]
  }
];
