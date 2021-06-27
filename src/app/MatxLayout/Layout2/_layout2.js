import { makeStyles } from '@material-ui/core/styles';

// eslint-disable-next-line no-unused-vars
const layout2Styles = makeStyles(({ palette, ...theme }) => ({
  '@global': {
    '.layout2': {
      transition: 'all 0.15s ease',
    },
    '.layout2.sidenav-close .sidenav': { left: '-var(--sidenav-width)' },
    '.layout2 .navbar': {
      position: 'relative',
      height: 'var(--navbar-height)',
      boxShadow: 'var(--elevation-z8)',
      zIndex: '98',
    },
    '.horizontal-nav ul': {
      padding: '0',
      margin: '0',
      listStyle: 'none',
      position: 'relative',
    },
    '.horizontal-nav ul.menu': {
      float: 'left',
      paddingRight: '45px',
      marginLeft: '-20px',
      zIndex: '99',
    },
    '.horizontal-nav ul.menu > li': { float: 'left' },
    '.horizontal-nav ul.menu > li > div > a, .horizontal-nav ul.menu > li > div > div':
      {
        borderBottom: '2px solid',
        height: '48px',
        boxSizing: 'border-box',
        borderColor: 'transparent',
        margin: '0 6px',
      },
    '.horizontal-nav ul li': {
      position: 'relative',
      margin: '0px',
      display: 'inline-block',
    },
    '.horizontal-nav ul li ul a': { padding: '8px 20px', height: '48px' },
    '.horizontal-nav a, .horizontal-nav label': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '13px 20px',
      height: 'var(--navbar-height)',
      fontSize: '0.875rem',
      textDecoration: 'none',
      boxSizing: 'border-box',
    },
    '.horizontal-nav a .material-icons, .horizontal-nav label .material-icons':
      {
        fontSize: '14px',
        margin: '0 4px',
      },
    '.horizontal-nav ul ul': {
      opacity: '0',
      visibility: 'hidden',
      position: 'absolute',
      left: '20px',
      boxShadow: 'var(--elevation-z8)',
      top: 'var(--navbar-height)',
      transform: 'translateY(-10px)',
      transition: 'all 0.3s ease-in-out',
      zIndex: '-1',
    },
    '.horizontal-nav ul li:hover > div > div > ul, .horizontal-nav ul li:hover > div > ul, .horizontal-nav li:hover > ul':
      {
        opacity: '1',
        visibility: 'visible',
        transform: 'translateY(0)',
      },
    '.horizontal-nav ul ul li': {
      width: '170px',
      float: 'none',
      display: 'list-item',
      position: 'relative',
    },
    '.horizontal-nav ul ul ul': { top: '0', left: '170px' },
    '.horizontal-nav ul ul ul li': { position: 'relative', top: '0' },
    '.horizontal-nav li > a:after': {
      content: '"arrow_drop_down"',
      fontFamily: '"Material Icons"',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontSize: '14px',
      lineHeight: '1',
      marginLeft: 'auto',
      letterSpacing: 'normal',
      textTransform: 'none',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      wordWrap: 'normal',
      direction: 'ltr',
      W: 'antialiased',
      fallbacks: [{ W: '"liga"' }],
    },
    '.horizontal-nav li > a:only-child:after': { content: '" "' },
  },
}));

export default layout2Styles;
