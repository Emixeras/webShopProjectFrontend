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
import HomeIcon from "@material-ui/icons/Home";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import DescriptionIcon from '@material-ui/icons/Description';
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
import {isMobile, showToast} from "../Utilities/Utilities";
import ListAltIcon from '@material-ui/icons/ListAlt';
import EditIcon from '@material-ui/icons/Edit';

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
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
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
            <ListItem button component={renderLink} style={document.location.pathname === to ? {background: "rgba(0,64,179,0.32)"} : undefined}>
                {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                <ListItemText primary={primary}/>
            </ListItem>
        </li>
    );
}


export default function MenuDrawer(props) {
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(isDrawerVisible);
    const [shouldShift, setShouldShift] = React.useState(() => !isMobile());

    useEffect(() => {
        let mobileCallback = isMobile => setShouldShift(!isMobile);
        addMobileCallback(mobileCallback);
        return () => {
            removeMobileCallback(mobileCallback)
        };
    }, []);

    const handleDrawerOpen = () => {
        setOpen(true);
        setDrawerVisible(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
        setDrawerVisible(false);
    };

    return (
        <div>
            <AppBar
                position="fixed"
                style={{background: '#2E3B55'}}
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar
                >
                    <div>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            style={{alignSelf: 'center'}}
                            className={clsx(classes.menuButton, open && classes.hide)}>
                            <MenuIcon/>
                        </IconButton>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flex: 3,
                        marginLeft: 232 - (open ? 0 : 48)
                    }}>
                        <img style={{alignSelf: 'center'}} height="50" src={logo}
                             alt="fireSpot"/>
                    </div>
                    {/*<div>*/}
                        <Link to="/">
                            <IconButton style={{margin: 5, color: "white"}} component="span"
                                        edge="start">
                                <HomeIcon/>
                            </IconButton>
                        </Link>
                        <Link to="/shoppingcart">
                            <IconButton style={{margin: 5, color: "white"}} component="span">
                                <ShoppingCartIcon/>
                            </IconButton>
                        </Link>
                        <ProfileButton/>
                        <DevButton/>
                    {/*</div>*/}
                </Toolbar>
            </AppBar>
            <Drawer
                className={classes.drawer}
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
                        to="/artists"
                        primary="Künstler"
                        icon={<LibraryMusicIcon/>}
                    />
                    <ListItemLink
                        to="/albums"
                        primary="Alben"
                        icon={<AlbumIcon/>}
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
                        to="/shoppingcart"
                        primary="Warenkorb"
                        icon={<ShoppingCartIcon/>}
                    />
                    <ListItemLink
                        to="/profile"
                        primary="Benutzer"
                        icon={<AccountCircleIcon/>}
                    />
                    <ListItemLink
                        to="/editArticles"
                        primary="Artikel bearbeiten"
                        icon={<EditIcon/>}
                    />
                    <ListItemLink
                        to="/Impressum"
                        primary="Impressum"
                        icon={<DescriptionIcon/>}
                    />
                </List>
            </Drawer>
            <main
                className={clsx(classes.content, {
                    [classes.contentShift]: open && shouldShift,
                })}
            >
                <div className={classes.drawerHeader}/>
                {props.children}
            </main>
        </div>
    );
}

function ProfileButton() {
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
            {/*<Link to="/login">*/}
            <IconButton style={{margin: 5, color: "white"}} component="span"
                        aria-haspopup="true"
                        onClick={event => {
                            if (isUserLoggedIn())
                                handleMenu(event)
                            else
                                history.push("/login")
                        }}>
                <AccountCircleIcon/>
            </IconButton>
            {/*</Link>*/}
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

function DevButton() {
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
            {/*<Link to="/login">*/}
            <IconButton style={{margin: 5, color: "white"}} component="span"
                        aria-haspopup="true"
                        onClick={handleMenu}>
                <DeveloperBoardIcon/>
            </IconButton>
            {/*</Link>*/}
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
                            Admin-Panel
                        </Grid>
                    </Grid>
                </MenuItem>
                <MenuItem onClick={event => {
                    handleClose(event);
                    window.open("http://localhost:8080/swagger-ui/");
                }}>
                    <Grid container spacing={2}>
                        <Grid item>
                            <ListAltIcon style={{display: "block"}}/>
                        </Grid>
                        <Grid item xs>
                            Swagger-UI
                        </Grid>
                    </Grid>

                </MenuItem>
            </Menu>

        </div>
    )
}