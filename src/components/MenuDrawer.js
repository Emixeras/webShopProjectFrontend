import React, {useEffect} from 'react';
import clsx from 'clsx';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {Drawer} from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {Link, useHistory} from "react-router-dom";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import DescriptionIcon from '@material-ui/icons/Description';
import SwaggerIcon from '@material-ui/icons/BallotOutlined';
import MoreIcon from '@material-ui/icons/MoreVert';
import logo from "../assets/text4549.png";
import AlbumIcon from '@material-ui/icons/Album';
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic';
import RadioIcon from '@material-ui/icons/Radio';
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';
import {
    addMobileCallback,
    isDrawerVisible,
    isUserLoggedIn, removeMobileCallback,
    setDrawerVisible
} from "../services/StorageUtil";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {ExitToApp} from "@material-ui/icons";
import Grid from "@material-ui/core/Grid";
import {logoutUser} from "../services/UserApiUtil";
import {isMobile, margin, padding, showToast} from "../Utilities/Utilities";
import ListAltIcon from '@material-ui/icons/ListAlt';
import EditIcon from '@material-ui/icons/Edit';
import {hasCurrentUserRoleLevel, Pair} from "../Utilities/TsUtilities";
import HistoryIcon from '@material-ui/icons/History';
import PropTypes from "prop-types";

const drawerWidth = 240;


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: 0,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: drawerWidth,
    },
}));


//  ------------------------- Drawer-Callbacks ------------------------->
const drawerStateCallbackList = require("collections/list")();

/**
 * Fügt einen drawerCallback hinzu
 * @param {function} drawerCallback Der hinzuzufügende Clallback
 * @param {'before' | 'after' | 'both' } [type] Wann wird der Callback aufgerufen
 */
export function addDrawerCallback(drawerCallback, type = 'after') {
    drawerStateCallbackList.push(Pair.make(drawerCallback, type))
}

/**
 * Entfernt einen drawerCallback
 * @param {function} drawerCallback Der selbe Clallback wie beim Hinzufügen
 */
export function removeDrawerCallback(drawerCallback) {
    drawerStateCallbackList.delete(drawerCallback, (inList, toDelete) => inList.first === toDelete)
}

/**
 * Ruft alle drawerCallbacks auf
 * @param value Der aktuelle Zustand
 * @param type Welche art von callback soll aufgerufen werden
 */
export function callDrawerCallbacks(value, type) {
    drawerStateCallbackList.forEach(pair => {
        if (type === 'both' || pair.second === type)
            pair.first(value);
    })
}

//  <------------------------- Drawer-Callbacks -------------------------

/**
 * Returns a item for the drawer
 * @param props
 * @return {JSX.Element}
 */
function ListItemLink(props) {
    const {icon, primary, to} = props;

    const renderLink = React.useMemo(
        () =>
            React.forwardRef((itemProps, ref) => (
                <Link to={to} ref={ref} {...itemProps} />
            )),
        [to]
    );
    return (
        <li>
            <ListItem button component={renderLink}
                      onClick={event => {
                          if (drawerClose_ref && isMobile())
                              drawerClose_ref()
                      }}
                      style={document.location.pathname === to ? {background: "rgba(0,0,0,0.1)"} : undefined}>
                {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                <ListItemText primary={primary}/>
            </ListItem>
        </li>
    );
}

let drawerClose_ref;

MenuDrawer.propTypes = {
    children: PropTypes.element,
    contentContainerStyling: PropTypes.object,
    contentRootOptions: PropTypes.object
};

/**
 * The main Component of MenuDrawer.js
 */
export default function MenuDrawer({contentContainerStyling, children, contentRootOptions}) {
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(isDrawerVisible);
    const [shouldShift, setShouldShift] = React.useState(() => !isMobile());

    useEffect(() => {
        let mobileCallback = isMobile => setShouldShift(!isMobile);
        let transitionListener = () => callDrawerCallbacks(open, 'after');

        addMobileCallback(mobileCallback);

        const main = document.getElementById('menuDrawer_main');
        main.addEventListener('transitionend', transitionListener);

        return () => {
            removeMobileCallback(mobileCallback);
            main.removeEventListener('transitionend', transitionListener)
        };
    }, []);

    const handleDrawerOpen = () => {
        setOpen(true);
        setDrawerVisible(true);
    };

    const handleDrawerClose = drawerClose_ref = () => {
        setOpen(false);
        setDrawerVisible(false);
    };

    return (
        <div>
            <AppBar
                position="fixed"
                style={{background: '#2e3b55'}}
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open && !isMobile(),
                }, "no-margin-left-on-print")}
            >
                <Toolbar style={{display: 'flex', flexDirection: 'row', alignItems: "center"}}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        style={{alignSelf: 'center'}}
                        className={clsx(classes.menuButton, open && classes.hide)}>
                        <MenuIcon/>
                    </IconButton>
                    <ToolbarLogoAndButtons drawerOpen={open} shouldShift={shouldShift}/>
                </Toolbar>
            </AppBar>
            <Drawer
                className={clsx(classes.drawer, "no-print")}
                variant="persistent"
                anchor="left"
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.drawerHeader}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
                    </IconButton>
                </div>
                <Divider/>
                <List>
                    <ListItemLink
                        to="/albums"
                        primary="Alben"
                        icon={<AlbumIcon/>}
                    />
                    <ListItemLink
                        to="/artists"
                        primary="Künstler"
                        icon={<LibraryMusicIcon/>}
                    />
                    <ListItemLink
                        to="/genres"
                        primary="Genre"
                        icon={<RadioIcon/>}
                    />
                </List>
                <Divider/>
                <List>
                    <ListItemLink
                        to="/shoppingCart"
                        primary="Einkaufswagen"
                        icon={<ShoppingCartIcon/>}
                    />
                    <ListItemLink
                        to="/profile"
                        primary="Benutzer"
                        icon={<AccountCircleIcon/>}
                    />
                    {hasCurrentUserRoleLevel() && <ListItemLink
                        to="/editArticles"
                        primary="Artikel bearbeiten"
                        icon={<EditIcon/>}
                    />}
                    <ListItemLink
                        to="/SideNotice"
                        primary="Impressum"
                        icon={<DescriptionIcon/>}
                    />
                </List>
            </Drawer>
            <main
                id={"menuDrawer_main"}
                className={clsx(classes.content, {
                    [classes.contentShift]: open && shouldShift,
                }, "no-margin-left-on-print")}
            >
                <div className={classes.drawerHeader}/>
                <div id={"menuDrawer_contentContainer"}
                     style={{...(shouldShift ? padding(24) : padding(12, 0)), ...contentContainerStyling}}>

                    {contentRootOptions ?
                        <div>
                            <div>
                            </div>
                        </div>
                        : children}
                </div>
            </main>
        </div>
    );
}

/**
 * Returns the layout for the toolbar logo and buttons
 * @param drawerOpen Is the drawer open
 * @param shouldShift Is in mobile mode
 * @return {JSX.Element}
 */
function ToolbarLogoAndButtons({drawerOpen, shouldShift}) {
    const history = useHistory();
    let style = {display: 'flex', flexDirection: 'row'};
    let widthStyle = {...style, width: '100%'};
    const [anchorEl, setAnchorEl] = React.useState(null);
    let color = shouldShift ? "white" : "#2D2D2D";
    const open = Boolean(anchorEl);
    const handleClose = () => {
        setAnchorEl(null);
    };

    let allButtons = (
        <div style={style}>
            <Link to="/shoppingCart">
                <IconButton style={{margin: 5, color: color}} component="span">
                    <ShoppingCartIcon/>
                </IconButton>
            </Link>
            <ProfileButton><AccountCircleIcon style={{color: color}}/></ProfileButton>
            <DevButton><DeveloperBoardIcon style={{color: color}}/></DevButton>
        </div>
    )

    let buttonCount = allButtons.props.children.length;

    let logoComponent = (
        <div style={widthStyle}>
            <div style={{
                maxWidth: shouldShift ? (58 * buttonCount - (drawerOpen ? 0 : 48)) : (drawerOpen ? 53 : 1),
                minWidth: 0,
                flexGrow: 100,
                flexShrink: 100,
                flexBasis: "auto",
                height: 15
            }}/>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: "auto",
            }}>
                <img style={{alignSelf: 'center', cursor: "pointer"}} height="50" src={logo}
                     onClick={event => history.push("/", {home: true})}
                     alt="fireSpot"/>
            </div>
        </div>
    )

    return (
        <div style={widthStyle}>
            {logoComponent}
            {shouldShift ?
                allButtons
                :
                <div>
                    <IconButton style={{marginLeft: 16, marginRight: -12, color: "white"}}
                                component="span"
                                edge="end"
                                onClick={event => setAnchorEl(event.currentTarget)}>
                        <MoreIcon/>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={open}
                        onClose={handleClose}
                    >
                        <div style={margin(0, 8)}>
                            {allButtons}
                        </div>
                    </Menu>

                </div>
            }
        </div>
    )
}

/**
 * Returns the Button for opening the profileMenu
 * @param children The profileMenu-button
 * @return {JSX.Element}
 */
function ProfileButton({children}) {
    const history = useHistory();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <div>
            <IconButton style={{margin: 5, color: "white"}} component="span"
                        aria-haspopup="true"
                        onClick={event => {
                            if (isUserLoggedIn())
                                handleMenu(event)
                            else
                                history.push("/login")
                        }}>
                {children}
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
            >
                <MenuItem disabled={history.location.pathname === "/profile"}
                          onClick={event => {
                              handleClose(event);
                              history.push("/profile")
                          }}>
                    <Grid container spacing={2}>
                        <Grid item>
                            <AccountCircleIcon style={{display: "block"}}/>
                        </Grid>
                        <Grid item xs>
                            Profil Anzeigen
                        </Grid>
                    </Grid>
                </MenuItem>
                <MenuItem disabled={history.location.pathname === "/orderoverview"}
                          onClick={event => {
                              handleClose(event);
                              history.push("/orderoverview")
                          }}>
                    <Grid container spacing={2}>
                        <Grid item>
                            <HistoryIcon style={{display: "block"}}/>
                        </Grid>
                        <Grid item xs>
                            Bestellübersicht
                        </Grid>
                    </Grid>
                </MenuItem>
                <MenuItem onClick={event => {
                    handleClose(event);
                    logoutUser(() => {
                        showToast("Abmeldung Erfolgreich", "success")
                        history.push("/");
                    }, () => {
                        showToast('Abmelden Fehlgeschlagen', "error")
                    });
                }}>
                    <Grid container spacing={2}>
                        <Grid item>
                            <ExitToApp style={{display: "block"}}/>
                        </Grid>
                        <Grid item xs>
                            Ausloggen
                        </Grid>
                    </Grid>

                </MenuItem>
            </Menu>

        </div>
    )
}

/**
 * Returns the Button for opening the devMenu
 * @param children The devMenu-button
 * @return {JSX.Element}
 */
function DevButton({children}) {
    const history = useHistory();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    if (hasCurrentUserRoleLevel("ADMIN"))
        return (
            <div>
                <IconButton style={{margin: 5, color: "white"}} component="span"
                            aria-haspopup="true"
                            onClick={handleMenu}>
                    {children}
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={open}
                    onClose={handleClose}
                >
                    <MenuItem disabled={history.location.pathname === "/dev"}
                              onClick={event => {
                                  handleClose(event);
                                  history.push("/dev")
                              }}>
                        <Grid container spacing={2}>
                            <Grid item>
                                <DeveloperBoardIcon style={{display: "block"}}/>
                            </Grid>
                            <Grid item xs>
                                Dev-Panel
                            </Grid>
                        </Grid>
                    </MenuItem>
                    <MenuItem disabled={history.location.pathname === "/roleManagement"}
                              onClick={event => {
                                  handleClose(event);
                                  history.push("/roleManagement")
                              }}>
                        <Grid container spacing={2}>
                            <Grid item>
                                <ListAltIcon style={{display: "block"}}/>
                            </Grid>
                            <Grid item xs>
                                Berechtigungen
                            </Grid>
                        </Grid>
                    </MenuItem>
                    <MenuItem onClick={event => {
                        handleClose(event);
                        window.open(`http://${window.location.hostname}:8080/swagger-ui/`);
                    }}>
                        <Grid container spacing={2}>
                            <Grid item>
                                <SwaggerIcon style={{display: "block"}}/>
                            </Grid>
                            <Grid item xs>
                                Swagger-UI
                            </Grid>
                        </Grid>
                    </MenuItem>
                </Menu>
            </div>
        )
    else
        return null
}